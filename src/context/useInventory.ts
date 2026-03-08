import { use } from 'react';
import { InventoryContext } from './InventoryContextCore';

export const useInventory = () => {
    const ctx = use(InventoryContext);
    if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
    return ctx;
};
