import { use } from 'react';
import { MessageContext } from './MessageContextCore';
import type { MessageContextType } from './MessageContextCore';

export const useMessages = (): MessageContextType => {
    const ctx = use(MessageContext);
    if (!ctx) throw new Error('useMessages must be used within MessageProvider');
    return ctx;
};
