import { supabase } from '../lib/supabase';

/**
 * Per-ticket messaging via the existing `messages` table.
 *
 * The actual table columns are:
 *   id UUID, shop_id UUID (FK → shops), sender_id UUID (FK → profiles),
 *   text TEXT, sender_role TEXT, timestamp BIGINT, created_at TIMESTAMPTZ
 *
 * Since there is no `job_id` column, we embed the ticket ID as a prefix
 * in the `text` field: `[JOB:ticketId]actual message text`.
 * This lets us filter messages per-ticket while satisfying all FK constraints.
 */

const JOB_PREFIX_RE = /^\[JOB:([^\]]+)\]/;
const SHOP_ID = ''; // Resolved dynamically from user context

export interface Message {
    id: string;
    job_id: string;
    sender_id: string;
    sender_role: 'CLIENT' | 'STAFF';
    content: string;
    created_at: string;
}

interface RawMessage {
    id: string;
    shop_id: string;
    sender_id: string | null;
    sender_role: string | null;
    text: string;
    timestamp: number | null;
    created_at: string;
}

const parseJobId = (text: string): string | null => {
    const match = JOB_PREFIX_RE.exec(text);
    return match ? match[1] : null;
};

const stripPrefix = (text: string): string =>
    text.replace(JOB_PREFIX_RE, '');

const mapFromDb = (row: RawMessage): Message => ({
    id: row.id,
    job_id: parseJobId(row.text) ?? '',
    sender_id: row.sender_id ?? '',
    sender_role: (row.sender_role ?? 'CLIENT') as 'CLIENT' | 'STAFF',
    content: stripPrefix(row.text),
    created_at: row.created_at,
});

export const messageService = {
    /**
     * Fetches all messages for a specific job/ticket
     */
    async getMessagesByJob(jobId: string): Promise<Message[]> {
        // Use ilike to filter messages with the [JOB:xxx] prefix
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .like('text', `[JOB:${jobId}]%`)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return ((data as RawMessage[]) ?? []).map(mapFromDb);
    },

    /**
     * Sends a new message
     */
    async sendMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
        const textWithPrefix = `[JOB:${message.job_id}]${message.content}`;

        const insertPayload = {
            shop_id: SHOP_ID,
            sender_id: null,  // Skip FK — no guaranteed valid profile UUID
            sender_role: message.sender_role,
            text: textWithPrefix,
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
            }, (payload: { new: RawMessage }) => {
                const row = payload.new;
                const parsedJobId = parseJobId(row.text);
                if (parsedJobId === jobId) {
                    onMessage(mapFromDb(row));
                }
            })
            .subscribe();
    }
};
