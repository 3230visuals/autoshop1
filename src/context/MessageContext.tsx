import React, { createContext, use, useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Message, AuthRole } from './AppTypes';
import { messageService } from '../services/messageService';
import { supabase } from '../lib/supabase';

/* ═══════════════════════════════════════════════════
   Message Context — Chat messages & realtime sync
   ═══════════════════════════════════════════════════ */

interface MessageContextType {
    messages: Message[];
    sendMessage: (text: string, jobId?: string) => Promise<void>;
    shopTyping: boolean;
    isLoading: boolean;
}

const MessageContext = createContext<MessageContextType | null>(null);

const JOB_PREFIX_RE = /^\[JOB:([^\]]+)\]/;
const parseJobId = (text: string): string | null => {
    const match = JOB_PREFIX_RE.exec(text);
    return match ? match[1] : null;
};
const stripPrefix = (text: string): string => text.replace(JOB_PREFIX_RE, '');

export const MessageProvider: React.FC<{
    children: ReactNode;
    showToast: (msg: string) => void;
    currentUserRole: string;
}> = ({ children, showToast, currentUserRole }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [shopTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate initial fetch or wait for real sync
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const isStaff = currentUserRole === 'OWNER' || currentUserRole === 'STAFF';

    const sendMessage = useCallback(async (text: string, jobId?: string) => {
        const targetJobId = jobId ?? 'default-shop';

        // Optimistic update
        const tempId = `m${Date.now()}`;
        const optimisticMsg: Message = {
            id: tempId,
            jobId: targetJobId,
            text,
            sender: isStaff ? 'shop' : 'client',
            senderRole: isStaff ? 'STAFF' : 'CLIENT',
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            await messageService.sendMessage({
                job_id: targetJobId,
                sender_id: '',
                sender_role: isStaff ? 'STAFF' : 'CLIENT',
                content: text,
            });
        } catch (err) {
            console.error('Failed to send message:', err);
            showToast('Message failed to send');
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    }, [isStaff, showToast]);

    // Realtime subscription for incoming messages
    useEffect(() => {
        const channel = supabase.channel('global-messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, payload => {
                const row = payload.new as { id: string; text: string; sender_role: string; created_at: string };
                const jobId = parseJobId(row.text) ?? 'default-shop';
                const content = stripPrefix(row.text);
                const senderRole = row.sender_role as 'CLIENT' | 'STAFF';

                const newMessage: Message = {
                    id: row.id,
                    jobId,
                    text: content,
                    sender: senderRole === 'STAFF' ? 'shop' : 'client',
                    senderRole,
                    timestamp: new Date(row.created_at).getTime(),
                };

                setMessages(prev => {
                    if (prev.some(m => m.id === newMessage.id)) return prev;

                    // Show notification if message is from the other party
                    const isFromOther = (isStaff && senderRole === 'CLIENT') || (!isStaff && senderRole === 'STAFF');
                    if (isFromOther) {
                        showToast(`New message: ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`);
                    }

                    return [...prev, newMessage];
                });
            })
            .subscribe();

        return () => { void supabase.removeChannel(channel); };
    }, [isStaff, showToast]);

    const value = useMemo(() => ({
        messages, sendMessage, shopTyping, isLoading
    }), [messages, sendMessage, shopTyping, isLoading]);

    return <MessageContext value={value}>{children}</MessageContext>;
};

export const useMessages = (): MessageContextType => {
    const ctx = use(MessageContext);
    if (!ctx) throw new Error('useMessages must be used within MessageProvider');
    return ctx;
};
