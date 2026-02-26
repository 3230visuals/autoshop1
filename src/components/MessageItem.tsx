import React from 'react';

interface MessageProps {
    sender: 'STAFF' | 'CLIENT';
    text: string;
    timestamp: string;
    isCurrentUser: boolean;
}

const MessageItem: React.FC<MessageProps> = ({ sender, text, timestamp, isCurrentUser }) => {
    return (
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} mb-6`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${isCurrentUser
                    ? 'bg-primary rounded-tr-none text-white'
                    : 'bg-white/5 border border-white/10 rounded-tl-none text-slate-200'
                }`}>
                <p className="text-sm font-medium leading-relaxed">{text}</p>
            </div>
            <div className="flex items-center gap-2 mt-2 px-1">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{sender}</span>
                <span className="text-[9px] text-slate-700 tracking-tighter">{timestamp}</span>
            </div>
        </div>
    );
};

export default MessageItem;
