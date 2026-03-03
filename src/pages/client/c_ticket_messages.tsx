import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages } from '../../context/MessageContext';
import { SkeletonMessages } from '../../components/common/Skeletons';
import MessageThread from '../../components/MessageThread';
import MessageComposer from '../../components/MessageComposer';

interface TicketMessage {
    id: string;
    sender: 'STAFF' | 'CLIENT';
    text: string;
    timestamp: number;
}


const C_TicketMessages: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const { messages: globalMessages, sendMessage: sendGlobalMessage, isLoading } = useMessages();

    if (isLoading) return <SkeletonMessages />;

    // Filter messages for this ticket from global state
    const messages = globalMessages
        .filter(m => m.jobId === ticketId)
        .map((m): TicketMessage => ({
            id: m.id,
            sender: m.senderRole,
            text: m.text,
            timestamp: m.timestamp
        }));

    const handleSendMessage = async (text: string) => {
        if (!ticketId || !text.trim()) return;
        try {
            await sendGlobalMessage(text, ticketId);
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

            <MessageThread
                messages={messages.map(m => ({
                    ...m,
                    isCurrentUser: m.sender === 'CLIENT',
                    timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }))}
            />


            <MessageComposer onSend={(text) => { void handleSendMessage(text); }} />

        </div>
    );
};

export default C_TicketMessages;
