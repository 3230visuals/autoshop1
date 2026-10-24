import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from './authService';
import type { InventoryItem } from '../context/AppTypes';

interface RawInventoryData {
    id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
    min_stock: number;
    location: string;
}

const readDemoInventory = (key: string): InventoryItem[] => {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
        return Array.isArray(parsed) ? parsed as InventoryItem[] : [];
    } catch {
        return [];
    }
};

const findDemoInventoryKey = (id: string): string | undefined =>
    Object.keys(localStorage).find((key) =>
        key.startsWith('inventory:') && readDemoInventory(key).some((item) => item.id === id)
    );

export const inventoryService = {
    async getAll(shopId: string): Promise<InventoryItem[]> {
        if (!isSupabaseConfigured()) {
            const key = `inventory:${shopId}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    return JSON.parse(saved) as InventoryItem[];
                } catch {
                    localStorage.removeItem(key);
                }
            }
            const seeded = [
                { id: 'inv-1', name: 'Brake Pads - Ceramic', category: 'Brakes', quantity: 12, price: 89.99, minStock: 5, location: 'Shelf A1' },
                { id: 'inv-2', name: 'Engine Oil 5W-30', category: 'Fluids', quantity: 45, price: 34.50, minStock: 10, location: 'Shelf B2' },
                { id: 'inv-3', name: 'Oil Filter - Premium', category: 'Filters', quantity: 28, price: 15.99, minStock: 8, location: 'Shelf B3' }
            ] as InventoryItem[];
            localStorage.setItem(key, JSON.stringify(seeded));
            return seeded;
        }

        const response = await supabase
            .from('inventory')
            .select('*')
            .eq('shop_id', shopId)
            .order('name');

        if (response.error) throw response.error;

        // Map snake_case from DB to camelCase for App
        return ((response.data as RawInventoryData[]) ?? []).map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            price: Number(item.price),
            minStock: item.min_stock,
            location: item.location
        })) as InventoryItem[];
    },

    async updateItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
        if (!isSupabaseConfigured()) {
            const entry = findDemoInventoryKey(id);
            if (!entry) return;
            const items = readDemoInventory(entry);
            localStorage.setItem(entry, JSON.stringify(items.map((item) => item.id === id ? { ...item, ...updates } : item)));
            return;
        }
        // Map camelCase back to snake_case for Supabase
        const dbUpdates: Record<string, string | number | undefined> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock;
        if (updates.location !== undefined) dbUpdates.location = updates.location;

        const { error } = await supabase
            .from('inventory')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    },

    async addItem(shopId: string, item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
        if (!isSupabaseConfigured()) {
            const key = `inventory:${shopId}`;
            const items = readDemoInventory(key);
            const next = { ...item, id: `inv-mock-${Date.now()}` } as InventoryItem;
            localStorage.setItem(key, JSON.stringify([...items, next]));
            return next;
        }
        const response = await supabase
            .from('inventory')
            .insert({
                shop_id: shopId,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                price: item.price,
                min_stock: item.minStock,
                location: item.location
            })
            .select()
            .single();

        if (response.error) throw response.error;

        const data = response.data as RawInventoryData;
        return {
            id: data.id,
            name: data.name,
            category: data.category,
            quantity: data.quantity,
            price: Number(data.price),
            minStock: data.min_stock,
            location: data.location
        } as InventoryItem;
    },

    async deleteItem(id: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            for (const key of Object.keys(localStorage).filter((entry) => entry.startsWith('inventory:'))) {
                const items = readDemoInventory(key);
                if (items.some((item) => item.id === id)) {
                    localStorage.setItem(key, JSON.stringify(items.filter((item) => item.id !== id)));
                }
            }
            return;
        }
        const { error } = await supabase
            .from('inventory')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
