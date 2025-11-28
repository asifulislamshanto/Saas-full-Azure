import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { createCheckoutSession } from '../services/api';
import { redirectToCheckout } from '../services/stripe';

const Subscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = [
    {
      name: 'Free',
      price: '$0',
      priceId: null,
      features: ['10 GB Storage', '100 Files', 'Basic Support'],
      current: true,
    },
    {
      name: 'Pro',
      price: '$9.99',
      priceId: 'price_pro_monthly',
      features: ['100 GB Storage', 'Unlimited Files', 'Priority Support', 'Advanced Analytics'],
      current: false,
    },
    {
      name: 'Enterprise',
      price: '$29.99',
      priceId: 'price_enterprise_monthly',
      features: ['1 TB Storage', 'Unlimited Files', '24/7 Support', 'Custom Integrations', 'SLA'],
      current: false,
    },
  ];

  const handleSubscribe = async (priceId) => {
    if (!priceId) return;

    setLoading(true);
    setError('');

    try {
      const response = await createCheckoutSession(priceId);
      const { sessionId } = response.data;
      
      await redirectToCheckout(sessionId);
    } catch (err) {
      setError('Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="text-gray-600 mt-2">Select the plan that best fits your needs</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card ${plan.current ? 'ring-2 ring-primary-600' : ''}`}
            >
              {plan.current && (
                <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Current Plan
                </span>
              )}
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.priceId && <span className="text-gray-600">/month</span>}
                </p>
              </div>

              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loading || plan.current || !plan.priceId}
                className={`mt-8 w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.current
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {plan.current ? 'Current Plan' : loading ? 'Processing...' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-gray-600">
          <p>All plans include secure cloud storage and 99.9% uptime SLA</p>
          <p className="mt-2">Cancel anytime. No long-term contracts.</p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;