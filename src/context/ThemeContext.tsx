import React, { createContext, use, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ShopTheme } from './AppTypes';

import { shopService } from '../services/shopService';

import { useAuth } from './useAuth';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ThemeContextType {
    theme: ShopTheme;
    updateTheme: (updates: Partial<ShopTheme>) => Promise<void>;
    refreshTheme: () => Promise<void>;
    isLoading: boolean;
}

const DEFAULT_THEME: ShopTheme = {
    shopId: 'DEMO',
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
    const { currentUser } = useAuth();
    const activeShopId = currentUser?.shopId ?? localStorage.getItem('activeShopId') ?? 'SHOP-01';

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
        // Skip real Supabase queries if shopId is not a valid UUID
        if (!UUID_RE.test(activeShopId)) {
            const local = getThemeForShop(activeShopId);
            setTheme(local);
            applyThemeToCSS(local);
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            const settings = await shopService.getShopSettings(activeShopId);
            if (settings) {
                setTheme(settings);
                applyThemeToCSS(settings);
            } else {
                // Fallback to localStorage or default
                const local = getThemeForShop(activeShopId);
                setTheme(local);
                applyThemeToCSS(local);
            }
        } catch (err) {
            console.error('Failed to refresh theme:', err);
        } finally {
            setIsLoading(false);
        }
    }, [applyThemeToCSS, activeShopId]);

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
        const shopId = updates.shopId ?? activeShopId;
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
    }, [theme, applyThemeToCSS, activeShopId]);

    const value = useMemo(() => ({ theme, updateTheme, refreshTheme, isLoading }), [theme, updateTheme, refreshTheme, isLoading]);

    return <ThemeContext value={value}>{children}</ThemeContext>;
};

export const useTheme = () => {
    const ctx = use(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
