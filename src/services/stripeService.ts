import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

/* ═══════════════════════════════════════════════════
   Stripe Service — Payment Gateway Integration
   ═══════════════════════════════════════════════════ */

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

/** Whether Stripe is legitimately configured with a real key */
export const isStripeConfigured = (): boolean => {
    return !!stripePublishableKey && !stripePublishableKey.includes('placeholder') && stripePublishableKey.startsWith('pk_');
};

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
    if (!stripePromise && isStripeConfigured()) {
        stripePromise = loadStripe(stripePublishableKey);
    }
    return stripePromise;
};

export const stripeService = {
    /**
     * Create a mock payment intent (In a real app, this would be a server-side call)
     */
    async createPaymentIntent(amount: number) {
        // In a real production environment, you would call your backend here:
        // const response = await fetch('/api/create-payment-intent', { method: 'POST', body: JSON.stringify({ amount }) });
        // return await response.json();

        console.log(`[Stripe Mock] Creating intent for $${(amount / 100).toFixed(2)}`);
        return {
            clientSecret: 'pi_mock_secret_' + Math.random().toString(36).substring(7),
        };
    }
};
