import { createContext } from 'react';
import type { InventoryItem, Part } from './AppTypes';

export interface InventoryContextType {
    inventory: InventoryItem[];
    updateInventoryStock: (id: string, change: number) => Promise<void>;
    addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
    searchParts: (query: string) => Promise<Omit<Part, 'id' | 'status' | 'eta' | 'notes'>[]>;
}

export const InventoryContext = createContext<InventoryContextType | null>(null);
