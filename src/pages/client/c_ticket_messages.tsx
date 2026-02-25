import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MessageThread from '../../components/MessageThread';
import MessageComposer from '../../components/MessageComposer';

const C_TicketMessages: React.FC = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([
        { sender: 'STAFF' as const, text: 'Hello! I am Dave, your mechanic. I am starting the diagnostic on your Ford F-150 now.', timestamp: '10:30 AM', isCurrentUser: false },
        { sender: 'CLIENT' as const, text: 'Thanks Dave! Let me know if you find anything unexpected.', timestamp: '10:35 AM', isCurrentUser: true },
        { sender: 'STAFF' as const, text: 'Found it. It looks like a solenoid issue in the transmission. I am preparing an estimate.', timestamp: '11:15 AM', isCurrentUser: false },
    ]);

    const handleSendMessage = (text: string) => {
        setMessages([...messages, {
            sender: 'CLIENT',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCurrentUser: true
        }]);
    };

    return (
        <div className="flex flex-col h-screen bg-background-dark relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[120px] rounded-full" /></div>

            <header className="flex items-center gap-4 p-6 border-b border-white/5 bg-[#0c0c0e]/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={() => navigate(`/c/ticket/${ticketId}`)}
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

            <MessageThread messages={messages} />

            <MessageComposer onSend={handleSendMessage} />
        </div>
    );
};

export default C_TicketMessages;
