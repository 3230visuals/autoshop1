import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Message } from './AppTypes';
import { messageService } from '../services/messageService';
import { supabase } from '../lib/supabase';

/* ═══════════════════════════════════════════════════
   Message Context — Chat messages & realtime sync
   ═══════════════════════════════════════════════════ */

interface MessageContextType {
    messages: Message[];
    sendMessage: (text: string) => Promise<void>;
    shopTyping: boolean;
}

const MessageContext = createContext<MessageContextType | null>(null);

export const MessageProvider: React.FC<{
    children: ReactNode;
    showToast: (msg: string) => void;
    currentUserRole: string;
}> = ({ children, showToast, currentUserRole }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [shopTyping] = useState(false);

    const sendMessage = useCallback(async (text: string) => {
        const isStaff = currentUserRole === 'OWNER' || currentUserRole === 'OWNER' || currentUserRole === 'STAFF';
        const userMsg: Omit<Message, 'id'> = {
            text,
            sender: isStaff ? 'shop' : 'client',
            timestamp: Date.now(),
        };

        const tempId = `m${Date.now()}`;
        setMessages(prev => [...prev, { ...userMsg, id: tempId }]);

        if (import.meta.env.VITE_SUPABASE_URL) {
            try {
                await messageService.sendMessage(userMsg, 'default-shop');
            } catch (err) {
                console.error('Failed to send message:', err);
                showToast('Message failed to send');
            }
        }
    }, [currentUserRole, showToast]);

    // Realtime subscription for incoming messages
    useEffect(() => {
        if (!import.meta.env.VITE_SUPABASE_URL) return;

        const msgSubscription = supabase.channel('messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            const newMessage = payload.new as Message;
            setMessages(prev => {
                const exists = prev.some(m => m.id === newMessage.id);
                if (exists) return prev;
                return [...prev, newMessage];
            });
        }).subscribe();

        return () => { supabase.removeChannel(msgSubscription); };
    }, []);

    const value = useMemo(() => ({
        messages, sendMessage, shopTyping
    }), [messages, sendMessage, shopTyping]);

    return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
};

export const useMessages = (): MessageContextType => {
    const ctx = useContext(MessageContext);
    if (!ctx) throw new Error('useMessages must be used within MessageProvider');
    return ctx;
};
