import { supabase } from '../lib/supabase';

export interface Message {
    id: string;
    job_id: string;
    sender_id: string;
    sender_role: 'CLIENT' | 'STAFF';
    content: string;
    created_at: string;
}

export const messageService = {
    /**
     * Fetches all messages for a specific job
     */
    async getMessagesByJob(jobId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('job_id', jobId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data as Message[]) ?? [];
    },

    /**
     * Sends a new message
     */
    async sendMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
        const response = await supabase
            .from('messages')
            .insert([message])
            .select()
            .single();

        if (response.error) throw response.error;
        return response.data as Message;
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
                filter: `job_id=eq.${jobId}`
            }, (payload: { new: Message }) => {
                onMessage(payload.new);
            })

            .subscribe();
    }
};
