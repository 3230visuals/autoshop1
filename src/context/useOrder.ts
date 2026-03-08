import { use } from 'react';
import { OrderContext } from './OrderContextCore';

export const useOrder = () => {
    const ctx = use(OrderContext);
    if (!ctx) throw new Error('useOrder must be used within OrderProvider');
    return ctx;
};
