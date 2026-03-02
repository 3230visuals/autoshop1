import React, { createContext, use, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ShopTheme } from './AppTypes';

import { shopService } from '../services/shopService';

interface ThemeContextType {
    theme: ShopTheme;
    updateTheme: (updates: Partial<ShopTheme>) => Promise<void>;
    refreshTheme: () => Promise<void>;
    isLoading: boolean;
}

const DEFAULT_THEME: ShopTheme = {
    shopId: 'SHOP-01',
    shopName: 'Service Bay Software',
    primary: '#3b82f6',
    accent: '#10b981',
    background: '#0a0a0c',
    card: '#121214',
    fontColor: '#f8fafc',
    secondaryFontColor: '#64748b',
    logoUrl: ''
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const getActiveShopId = () => localStorage.getItem('activeShopId') || 'SHOP-01';

const getThemeForShop = (shopId: string): ShopTheme => {
    const stored = localStorage.getItem(`shopTheme:${shopId}`);
    if (!stored) return { ...DEFAULT_THEME, shopId };
    try {
        return { ...DEFAULT_THEME, ...JSON.parse(stored), shopId };
    } catch {
        return { ...DEFAULT_THEME, shopId };
    }
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ShopTheme>(DEFAULT_THEME);
    const [isLoading, setIsLoading] = useState(true);

    const applyThemeToCSS = useCallback((t: ShopTheme) => {
        const root = document.documentElement;
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--accent', t.accent);
        root.style.setProperty('--bg', t.background);
        root.style.setProperty('--card', t.card);
        root.style.setProperty('--primary-muted', `${t.primary}20`);
        root.style.setProperty('--font-color', t.fontColor ?? '#f8fafc');
        root.style.setProperty('--secondary-font-color', t.secondaryFontColor ?? '#64748b');
    }, []);

    const refreshTheme = useCallback(async () => {
        const shopId = getActiveShopId();
        try {
            setIsLoading(true);
            const settings = await shopService.getShopSettings(shopId);
            if (settings) {
                setTheme(settings);
                applyThemeToCSS(settings);
            } else {
                // Fallback to localStorage or default
                const local = getThemeForShop(shopId);
                setTheme(local);
                applyThemeToCSS(local);
            }
        } catch (err) {
            console.error('Failed to refresh theme:', err);
        } finally {
            setIsLoading(false);
        }
    }, [applyThemeToCSS]);

    useEffect(() => {
        void refreshTheme();
        const handleShopChange = () => { void refreshTheme(); };
        window.addEventListener('shopchange', handleShopChange);
        return () => window.removeEventListener('shopchange', handleShopChange);
    }, [refreshTheme]);

    useEffect(() => {
        applyThemeToCSS(theme);
    }, [theme, applyThemeToCSS]);

    const updateTheme = useCallback(async (updates: Partial<ShopTheme>) => {
        const shopId = updates.shopId || getActiveShopId();
        try {
            // Update UI optimistically
            setTheme(prev => ({ ...prev, ...updates, shopId }));

            // Persist to Supabase
            await shopService.updateShopSettings(shopId, updates);

            // Also persist to localStorage for offline redundancy
            const next = { ...theme, ...updates, shopId };
            localStorage.setItem(`shopTheme:${shopId}`, JSON.stringify(next));
            applyThemeToCSS(next);
        } catch (err) {
            console.error('Failed to update shop settings:', err);
        }
    }, [theme, applyThemeToCSS]);

    const value = useMemo(() => ({ theme, updateTheme, refreshTheme, isLoading }), [theme, updateTheme, refreshTheme, isLoading]);

    return <ThemeContext value={value}>{children}</ThemeContext>;
};

export const useTheme = () => {
    const ctx = use(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
