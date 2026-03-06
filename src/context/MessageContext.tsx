import React, { createContext, use, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Message } from './AppTypes';
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
    unreadCount: number;
    markAsRead: (jobId?: string) => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

const JOB_PREFIX_RE = /^\[JOB:([^\]]+)\]/;
const parseJobId = (text: string): string | null => {
    const match = JOB_PREFIX_RE.exec(text);
    return match ? match[1] : null;
};
const stripPrefix = (text: string): string => text.replace(JOB_PREFIX_RE, '');

/* ── Demo auto-reply pool ─────────────────── */
const AUTO_REPLIES = [
    "Got it! I'll take a look and update you shortly.",
    "Thanks for letting us know. Working on it now. 🔧",
    "Absolutely, we'll have that sorted for you today.",
    "Great question — let me check with the team and get back to you.",
    "Your vehicle is in good hands! Expect an update within the hour.",
    "Understood. I'll send photos once we're done with the inspection.",
    "No worries at all. We'll make sure everything is perfect. ✅",
    "I've noted that down. We'll prioritize it.",
];

export const MessageProvider: React.FC<{
    children: ReactNode;
    showToast: (msg: string) => void;
    currentUserRole: string;
}> = ({ children, showToast, currentUserRole }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [shopTyping, setShopTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [readJobIds, setReadJobIds] = useState<Set<string>>(() => new Set());
    const replyIndexRef = useRef(0);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
    const replyTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
            if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
        };
    }, []);

    const isStaff = currentUserRole === 'OWNER' || currentUserRole === 'STAFF';

    // ── Status lifecycle helper ──────────────
    const updateMessageStatus = useCallback((msgId: string, status: Message['status']) => {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status } : m));
    }, []);

    // ── Simulated auto-reply ─────────────────
    const simulateAutoReply = useCallback((jobId: string) => {
        // Show typing indicator after 800ms
        typingTimerRef.current = setTimeout(() => {
            setShopTyping(true);

            // Send auto-reply after 1.5–2.5s typing
            const replyDelay = 1500 + Math.random() * 1000;
            replyTimerRef.current = setTimeout(() => {
                setShopTyping(false);
                const replyText = AUTO_REPLIES[replyIndexRef.current % AUTO_REPLIES.length];
                replyIndexRef.current += 1;

                const replyMsg: Message = {
                    id: `auto-${Date.now()}`,
                    jobId,
                    text: replyText,
                    sender: isStaff ? 'client' : 'shop',
                    senderRole: isStaff ? 'CLIENT' : 'STAFF',
                    timestamp: Date.now(),
                    status: 'delivered',
                };
                setMessages(prev => [...prev, replyMsg]);
            }, replyDelay);
        }, 800);
    }, [isStaff]);

    const sendMessage = useCallback(async (text: string, jobId?: string) => {
        const targetJobId = jobId ?? 'default-shop';
        const tempId = `m${Date.now()}`;

        // Optimistic: status = 'sending'
        const optimisticMsg: Message = {
            id: tempId,
            jobId: targetJobId,
            text,
            sender: isStaff ? 'shop' : 'client',
            senderRole: isStaff ? 'STAFF' : 'CLIENT',
            timestamp: Date.now(),
            status: 'sending',
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            await messageService.sendMessage({
                job_id: targetJobId,
                sender_id: '',
                sender_role: isStaff ? 'STAFF' : 'CLIENT',
                content: text,
            });

            // Status progression: sending → sent → delivered → read
            updateMessageStatus(tempId, 'sent');
            setTimeout(() => updateMessageStatus(tempId, 'delivered'), 600);
            setTimeout(() => updateMessageStatus(tempId, 'read'), 2000);

            // Trigger auto-reply in demo mode
            simulateAutoReply(targetJobId);
        } catch (err) {
            console.error('Failed to send message:', err);
            showToast('Message failed to send');
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    }, [isStaff, showToast, updateMessageStatus, simulateAutoReply]);

    // ── Mark as read ─────────────────────────
    const markAsRead = useCallback((jobId?: string) => {
        const targetId = jobId ?? 'default-shop';
        setReadJobIds(prev => {
            const next = new Set(prev);
            next.add(targetId);
            return next;
        });
    }, []);

    // ── Unread count ─────────────────────────
    const unreadCount = useMemo(() => {
        const incoming = messages.filter(m => {
            const isFromOther = isStaff ? m.sender === 'client' : m.sender === 'shop';
            return isFromOther && !readJobIds.has(m.jobId);
        });
        return incoming.length;
    }, [messages, isStaff, readJobIds]);

    // ── Realtime subscription ────────────────
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
                    status: 'delivered',
                };

                setMessages(prev => {
                    if (prev.some(m => m.id === newMessage.id)) return prev;

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
        messages, sendMessage, shopTyping, isLoading, unreadCount, markAsRead
    }), [messages, sendMessage, shopTyping, isLoading, unreadCount, markAsRead]);

    return <MessageContext value={value}>{children}</MessageContext>;
};

export const useMessages = (): MessageContextType => {
    const ctx = use(MessageContext);
    if (!ctx) throw new Error('useMessages must be used within MessageProvider');
    return ctx;
};
