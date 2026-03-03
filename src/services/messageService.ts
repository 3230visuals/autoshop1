import { supabase } from '../lib/supabase';

/**
 * Message shape that callers use (matches the column mapping)
 * - `job_id` maps to `shop_id` in the DB (reusing the UUID column for per-ticket chat)
 * - `content` maps to `text` in the DB
 */
export interface Message {
    id: string;
    job_id: string;
    sender_id: string;
    sender_role: 'CLIENT' | 'STAFF';
    content: string;
    created_at: string;
}

/** Raw row shape from the actual messages table */
interface RawMessage {
    id: string;
    shop_id: string;
    sender_id: string;
    sender_role: string;
    text: string;
    timestamp: number;
    created_at: string;
}

const mapFromDb = (row: RawMessage): Message => ({
    id: row.id,
    job_id: row.shop_id,       // shop_id stores the ticket/job ID
    sender_id: row.sender_id ?? '',
    sender_role: (row.sender_role ?? 'CLIENT') as 'CLIENT' | 'STAFF',
    content: row.text,         // text column → content
    created_at: row.created_at,
});

export const messageService = {
    /**
     * Fetches all messages for a specific job
     */
    async getMessagesByJob(jobId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('shop_id', jobId)           // filter by shop_id
            .order('created_at', { ascending: true });

        if (error) throw error;
        return ((data as RawMessage[]) ?? []).map(mapFromDb);
    },

    /**
     * Sends a new message
     */
    async sendMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
        const insertPayload = {
            shop_id: message.job_id,        // job_id → shop_id column
            sender_id: message.sender_id || null,
            sender_role: message.sender_role,
            text: message.content,          // content → text column
        };

        const response = await supabase
            .from('messages')
            .insert([insertPayload])
            .select()
            .single();

        if (response.error) throw response.error;
        return mapFromDb(response.data as RawMessage);
    },


    /**
     * Subscribes to real-time message updates for a job
     */
    subscribeToMessages(jobId: string, onMessage: (message: Message) => void) {
        return supabase
            .channel(`messages:${jobId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `shop_id=eq.${jobId}`   // filter by shop_id
            }, (payload: { new: RawMessage }) => {
                onMessage(mapFromDb(payload.new));
            })

            .subscribe();
    }
};
