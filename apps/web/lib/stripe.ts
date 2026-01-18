import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export interface CheckoutSessionData {
  plan: 'monthly' | 'yearly' | 'lifetime';
  successUrl: string;
  cancelUrl: string;
  userEmail?: string;
}

export const createCheckoutSession = async (data: CheckoutSessionData) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

  try {
    const response = await fetch(`${apiUrl}/payments/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '创建支付会话失败');
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await getStripe();

  if (!stripe) {
    throw new Error('Stripe 未初始化');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });

  if (error) {
    throw error;
  }
};

export const verifyCheckoutSession = async (sessionId: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

  try {
    const response = await fetch(`${apiUrl}/payments/session/${sessionId}`);

    if (!response.ok) {
      throw new Error('验证支付会话失败');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    throw error;
  }
};
