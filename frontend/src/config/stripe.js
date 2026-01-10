export const stripeConfig = {
  publicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_mock_key_for_development',
  currency: 'usd',
  allowedCountries: ['US', 'GB', 'CA', 'AU'],
  paymentMethods: ['card'],
};

// Mock Stripe for development
export const loadStripe = () => {
  if (process.env.NODE_ENV === 'development' && !window.Stripe) {
    return {
      elements: () => ({
        create: () => ({ mount: () => {}, on: () => {} }),
        getElement: () => ({})
      }),
      confirmCardPayment: () => Promise.resolve({ paymentIntent: { status: 'succeeded', id: 'mock_pi_' + Date.now() } }),
      confirmCardSetup: () => Promise.resolve({}),
    };
  }
  return window.Stripe;
};