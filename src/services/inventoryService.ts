import { supabase } from '../lib/supabase';
import type { InventoryItem } from '../context/AppTypes';

export const inventoryService = {
    async getAll(): Promise<InventoryItem[]> {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .order('name');

        if (error) throw error;

        // Map snake_case from DB to camelCase for App
        return (data || []).map(item => ({
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
        // Map camelCase back to snake_case for Supabase
        const dbUpdates: any = {};
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

    async addItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
        const { data, error } = await supabase
            .from('inventory')
            .insert({
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                price: item.price,
                min_stock: item.minStock,
                location: item.location
            })
            .select()
            .single();

        if (error) throw error;

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
        const { error } = await supabase
            .from('inventory')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
