import React from 'react';
import MessageItem from './MessageItem';

interface Message {
    sender: 'STAFF' | 'CLIENT';
    text: string;
    timestamp: string;
    isCurrentUser: boolean;
}

interface MessageThreadProps {
    messages: Message[];
}

const MessageThread: React.FC<MessageThreadProps> = ({ messages }) => {
    return (
        <div className="flex-1 overflow-y-auto p-6 pb-32">
            {messages.map((m, i) => (
                <MessageItem key={i} {...m} />
            ))}
        </div>
    );
};

export default MessageThread;
