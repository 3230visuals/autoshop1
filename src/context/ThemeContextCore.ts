import { createContext } from 'react';
import type { ShopTheme } from './AppTypes';

export interface ThemeContextType {
    theme: ShopTheme;
    updateTheme: (updates: Partial<ShopTheme>) => Promise<void>;
    refreshTheme: () => Promise<void>;
    isLoading: boolean;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);
