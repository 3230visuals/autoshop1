import { supabase } from '../lib/supabase';
import type { Message } from '../context/AppTypes';

export const messageService = {
    async getMessagesByShop(shopId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('shop_id', shopId)
            .order('timestamp', { ascending: true });

        if (error) throw error;
        return data as Message[];
    },

    async sendMessage(message: Omit<Message, 'id'>, shopId: string): Promise<Message> {
        const { data, error } = await supabase
            .from('messages')
            .insert([{ ...message, shop_id: shopId }])
            .select()
            .single();

        if (error) throw error;
        return data as Message;
    },

    subscribeToMessages(shopId: string, callback: (payload: { new: Message }) => void) {
        return supabase
            .channel('public:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `shop_id=eq.${shopId}`
            }, callback)
            .subscribe();
    }
};
