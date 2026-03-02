import React from 'react';
import MessageItem from './MessageItem';

interface Message {
    id?: string;
    sender: 'STAFF' | 'CLIENT';
    text: string;
    timestamp: string;
    isCurrentUser: boolean;
    metadata?: {
        type: string;
        total: number;
        ticketId: string;
    };
}

interface MessageThreadProps {
    messages: Message[];
}

const MessageThread: React.FC<MessageThreadProps> = ({ messages }) => {
    return (
        <div className="flex-1 overflow-y-auto p-6 pb-32">
            {messages.map((m, i) => (
                <MessageItem key={m.id || i} {...m} />
            ))}
        </div>
    );
};

export default MessageThread;
