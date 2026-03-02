import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MessageThread from '../../components/MessageThread';
import MessageComposer from '../../components/MessageComposer';
import { messageService } from '../../services/messageService';
import type { Message as SupabaseMessage } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';


interface TicketMessage {
    id: string;
    sender: 'STAFF' | 'CLIENT';
    text: string;
    timestamp: number;
}


const C_TicketMessages: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const mapSupabaseToUI = useCallback((msg: SupabaseMessage): TicketMessage => ({
        id: msg.id,
        sender: msg.sender_role,
        text: msg.content,
        timestamp: new Date(msg.created_at).getTime(),
    }), []);

    // Initial Load
    useEffect(() => {
        if (!ticketId) return;

        const loadMessages = async () => {
            try {
                const data = await messageService.getMessagesByJob(ticketId);
                setMessages(data.map(mapSupabaseToUI));
            } catch (err) {
                console.error('Failed to load messages:', err);
            } finally {
                setIsLoading(false);
            }
        };

        void loadMessages();
    }, [ticketId, mapSupabaseToUI]);

    // Live Sync
    useEffect(() => {
        if (!ticketId) return;

        const channel = messageService.subscribeToMessages(ticketId, (newMsg) => {
            setMessages(prev => {
                // Prevent duplicates from rapid insertion/subscription overlap
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, mapSupabaseToUI(newMsg)];
            });
        });

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [ticketId, mapSupabaseToUI]);

    const handleSendMessage = async (text: string) => {
        if (!ticketId || !text.trim()) return;

        try {
            // Optimistic update omitted for simplicity in real-time sync, 
            // but we could add it here if latency is high.
            await messageService.sendMessage({
                job_id: ticketId,
                sender_id: currentUser.id,
                sender_role: 'CLIENT',
                content: text,
            });
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };


    return (
        <div className="flex flex-col h-screen bg-background-dark relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[120px] rounded-full" /></div>

            <header className="flex items-center gap-4 p-6 border-b border-white/5 bg-[#0c0c0e]/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={() => { void navigate(`/c/ticket/${ticketId}`); }}
                    className="size-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold"
                >

                    <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                </button>
                <div className="flex items-center gap-4">
                    <div className="size-12 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center overflow-hidden">
                        <span className="material-symbols-outlined text-primary">support_agent</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter text-white">Repair Chat</h1>
                        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em]">Live Specialist: Dave</p>
                    </div>
                </div>
            </header>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <MessageThread
                    messages={messages.map(m => ({
                        ...m,
                        isCurrentUser: m.sender === 'CLIENT',
                        timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }))}
                />
            )}


            <MessageComposer onSend={(text) => { void handleSendMessage(text); }} />

        </div>
    );
};

export default C_TicketMessages;
