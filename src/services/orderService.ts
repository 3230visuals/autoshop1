import { supabase } from '../lib/supabase';
import type { OrderState } from '../context/AppTypes';

/**
 * Service to handle order persistence and multi-device synchronization.
 * Allows the client to approve/pay and have it reflect live on the shop dashboard.
 */
export const orderService = {
    async getOrder(orderNumber: string): Promise<OrderState | null> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('order_number', orderNumber)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return data as OrderState;
    },

    async saveOrder(order: OrderState, shopId: string): Promise<void> {
        const { error } = await supabase
            .from('orders')
            .upsert({
                ...order,
                shop_id: shopId,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'order_number' });

        if (error) throw error;
    },

    subscribeToOrder(orderNumber: string, callback: (payload: { new: OrderState }) => void) {
        return supabase
            .channel(`public:orders:${orderNumber}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `order_number=eq.${orderNumber}`
            }, callback)
            .subscribe();
    }
};
