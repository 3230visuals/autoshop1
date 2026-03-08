import { createContext } from 'react';
import type { Message } from './AppTypes';

export interface MessageContextType {
    messages: Message[];
    sendMessage: (text: string, jobId?: string) => Promise<void>;
    shopTyping: boolean;
    isLoading: boolean;
    unreadCount: number;
    markAsRead: (jobId?: string) => Promise<void>;
    loadMessagesForJob: (jobId: string) => Promise<void>;
}

export const MessageContext = createContext<MessageContextType | null>(null);
