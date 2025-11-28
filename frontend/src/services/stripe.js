import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export const redirectToCheckout = async (sessionId) => {
  const stripe = await stripePromise;
  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
};

export default stripePromise;