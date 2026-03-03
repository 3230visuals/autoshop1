import React, { useState, useRef, useEffect } from 'react';

interface TicketMessage {
    id: string;
    sender: 'STAFF' | 'CLIENT';
    text: string;
    timestamp: number;
}

interface TicketMessagesTabProps {
    messages: TicketMessage[];
    onSendMessage: (text: string) => void;
}

const formatTime = (ts: number) => {
    const d = new Date(ts);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
};

const TicketMessagesTab: React.FC<TicketMessagesTabProps> = ({ messages, onSendMessage }) => {
    const [msgInput, setMsgInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        const text = msgInput.trim();
        if (!text) return;
        onSendMessage(text);
        setMsgInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="glass-surface rounded-2xl h-[400px] overflow-hidden flex flex-col">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                            <span className="material-symbols-outlined text-3xl text-slate-700">forum</span>
                            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">No messages yet</p>
                        </div>
                    ) : null}

                    {messages.map((msg) => {
                        const isSelf = msg.sender === 'STAFF';
                        return (
                            <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${isSelf
                                    ? 'bg-primary text-white rounded-br-md'
                                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-md'
                                    }`}>
                                    <p>{msg.text}</p>
                                    <span className={`text-[9px] mt-1 block font-bold uppercase tracking-widest ${isSelf ? 'text-white/50 text-right' : 'text-slate-600'}`}>
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={msgInput}
                            onChange={(e) => setMsgInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:border-primary outline-none min-h-[44px] text-white placeholder:text-slate-600"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!msgInput.trim()}
                            className={`size-11 rounded-xl flex items-center justify-center transition-all min-h-[44px] ${msgInput.trim()
                                ? 'bg-primary text-white shadow-lg'
                                : 'bg-white/5 text-slate-700'
                                }`}
                        >
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketMessagesTab;
