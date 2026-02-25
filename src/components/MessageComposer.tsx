import React, { useState } from 'react';

interface MessageComposerProps {
    onSend: (text: string) => void;
    placeholder?: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ onSend, placeholder = "Type a message..." }) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        onSend(newMessage);
        setNewMessage('');
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#09090B] border-t border-white/5 max-w-[430px] mx-auto pb-navbar">
            <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:border-blue-500/50 outline-none h-12 text-white"
                />
                <button type="submit" className="size-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-white">send</span>
                </button>
            </form>
        </div>
    );
};

export default MessageComposer;
