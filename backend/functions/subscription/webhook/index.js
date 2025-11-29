const Stripe = require("stripe");
const { updateItem, queryItems } = require("../../../utils/db");
const { success, badRequest, serverError } = require("../../../utils/response");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const PLANS = {
  starter: {
    maxUsers: 10,
    maxStorage: 10737418240,
    features: ["basic", "priority-support"]
  },
  pro: {
    maxUsers: 50,
    maxStorage: 107374182400,
    features: ["basic", "priority-support", "advanced-analytics", "api-access"]
  },
  enterprise: {
    maxUsers: -1,
    maxStorage: -1,
    features: ["basic", "priority-support", "advanced-analytics", "api-access", "custom-integrations"]
  }
};

module.exports = async function (context, req) {
  try {
    const sig = req.headers["stripe-signature"];
    
    if (!sig) {
      return badRequest("Missing Stripe signature");
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
    } catch (err) {
      context.log.error("Webhook signature verification failed:", err.message);
      return badRequest(`Webhook Error: ${err.message}`);
    }

    context.log.info(`Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { tenantId, plan } = session.metadata;

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        // Update tenant subscription
        await updateItem("tenants", tenantId, tenantId, {
          subscription: {
            plan,
            status: "active",
            stripeCustomerId: session.customer,
            stripeSubscriptionId: subscription.id,
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
          },
          settings: {
            maxUsers: PLANS[plan].maxUsers,
            maxStorage: PLANS[plan].maxStorage,
            features: PLANS[plan].features
          }
        });

        context.log.info(`Subscription activated for tenant: ${tenantId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        // Find tenant by customer ID
        const tenants = await queryItems("tenants", {
          query: "SELECT * FROM c WHERE c.subscription.stripeCustomerId = @customerId",
          parameters: [{ name: "@customerId", value: subscription.customer }]
        });

        if (tenants.length > 0) {
          const tenant = tenants[0];
          
          await updateItem("tenants", tenant.id, tenant.id, {
            "subscription.status": subscription.status,
            "subscription.currentPeriodStart": new Date(subscription.current_period_start * 1000).toISOString(),
            "subscription.currentPeriodEnd": new Date(subscription.current_period_end * 1000).toISOString()
          });

          context.log.info(`Subscription updated for tenant: ${tenant.id}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        const tenants = await queryItems("tenants", {
          query: "SELECT * FROM c WHERE c.subscription.stripeCustomerId = @customerId",
          parameters: [{ name: "@customerId", value: subscription.customer }]
        });

        if (tenants.length > 0) {
          const tenant = tenants[0];
          
          // Revert to free plan
          await updateItem("tenants", tenant.id, tenant.id, {
            subscription: {
              plan: "free",
              status: "cancelled",
              stripeCustomerId: tenant.subscription.stripeCustomerId,
              stripeSubscriptionId: null
            },
            settings: {
              maxUsers: 5,
              maxStorage: 1073741824, // 1GB
              features: ["basic"]
            }
          });

          context.log.info(`Subscription cancelled for tenant: ${tenant.id}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        
        const tenants = await queryItems("tenants", {
          query: "SELECT * FROM c WHERE c.subscription.stripeCustomerId = @customerId",
          parameters: [{ name: "@customerId", value: invoice.customer }]
        });

        if (tenants.length > 0) {
          const tenant = tenants[0];
          
          await updateItem("tenants", tenant.id, tenant.id, {
            "subscription.status": "past_due"
          });

          context.log.warn(`Payment failed for tenant: ${tenant.id}`);
        }
        break;
      }

      default:
        context.log.info(`Unhandled event type: ${event.type}`);
    }

    return success({ received: true });

  } catch (error) {
    context.log.error("Webhook processing error:", error);
    return serverError("Webhook processing failed", error);
  }
};