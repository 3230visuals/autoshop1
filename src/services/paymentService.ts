import { supabase } from '../lib/supabase';

export interface CheckoutSessionRequest {
    shopId: string;
    orderId: string;
    amount: number;
    successUrl: string;
    cancelUrl: string;
    description: string;
}

export const paymentService = {
    /**
     * Initiates a Stripe Checkout session via Supabase Edge Function
     */
    async createCheckoutSession(request: CheckoutSessionRequest): Promise<string> {
        const { data, error } = await supabase.functions.invoke<{ url: string }>('stripe-checkout', {
            body: request
        });

        if (error) {
            console.error('Stripe session creation error:', error);
            throw new Error((error as Error).message || 'Failed to initiate payment');
        }

        return data?.url || '';
    },

    /**
     * Calculates the platform fee based on the total amount
     * Default is 1%
     */
    calculatePlatformFee(amount: number, feePercent = 1.0): number {
        return Math.round(amount * (feePercent / 100));
    },

    /**
     * Mock function for Test Mode payment completion
     */
    async simulateTestPayment(orderId: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[TEST MODE] Payment simulated for order: ${orderId}`);
                resolve(true);
            }, 1500);
        });
    }
};
