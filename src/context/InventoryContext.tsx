import React, { createContext, use, useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { InventoryItem } from './AppTypes';
import { inventoryService } from '../services/inventoryService';
import { partService } from '../services/partService';
import type { Part } from './AppTypes';

/* ═══════════════════════════════════════════════════
   Inventory Context — Inventory & Parts
   ═══════════════════════════════════════════════════ */

interface InventoryContextType {
    inventory: InventoryItem[];
    updateInventoryStock: (id: string, change: number) => Promise<void>;
    addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
    searchParts: (query: string) => Promise<Omit<Part, 'id' | 'status' | 'eta' | 'notes'>[]>;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export const InventoryProvider: React.FC<{ children: ReactNode; showToast: (msg: string) => void }> = ({ children, showToast }) => {
    const activeShopId = localStorage.getItem('activeShopId') ?? 'SHOP-01';
    const [inventory, setInventory] = useState<InventoryItem[]>([]);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const data = await inventoryService.getAll(activeShopId);
                setInventory(data);
            } catch (err) {
                console.error('Failed to fetch inventory:', err);
            }
        };
        void fetchInventory();
    }, [activeShopId]);

    const updateInventoryStock = useCallback(async (id: string, change: number) => {
        // Capture current quantity before optimistic update to avoid stale closure
        const currentItem = inventory.find(i => i.id === id);
        if (!currentItem) return;
        const newQuantity = Math.max(0, currentItem.quantity + change);

        setInventory(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
        try {
            await inventoryService.updateItem(id, { quantity: newQuantity });
        } catch (err) {
            console.error('Failed to sync inventory:', err);
            // Rollback optimistic update
            setInventory(prev => prev.map(item => item.id === id ? { ...item, quantity: currentItem.quantity } : item));
            showToast('Inventory sync failed');
        }
    }, [inventory, showToast]);

    const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id'>) => {
        try {
            const newItem = await inventoryService.addItem(activeShopId, item);
            setInventory(prev => [...prev, newItem]);
            showToast('Item added to inventory');
        } catch (err) {
            console.error('Failed to add inventory item:', err);
            showToast('Failed to add item');
        }
    }, [activeShopId, showToast]);


    const searchParts = useCallback(async (query: string) => {
        return await partService.searchParts(query);
    }, []);

    const value = useMemo(() => ({
        inventory, updateInventoryStock, addInventoryItem, searchParts
    }), [inventory, updateInventoryStock, addInventoryItem, searchParts]);

    return <InventoryContext value={value}>{children}</InventoryContext>;
};

export const useInventory = (): InventoryContextType => {
    const ctx = use(InventoryContext);
    if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
    return ctx;
};
