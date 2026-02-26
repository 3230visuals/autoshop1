import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ShopTheme } from './AppTypes';

interface ThemeContextType {
    theme: ShopTheme;
    updateTheme: (updates: Partial<ShopTheme>) => void;
    refreshTheme: () => void;
}

const DEFAULT_THEME: ShopTheme = {
    shopId: 'SHOP-01',
    shopName: 'Stitch Auto',
    primary: '#3b82f6',
    accent: '#10b981',
    background: '#0a0a0c',
    card: '#121214',
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
    const [theme, setTheme] = useState<ShopTheme>(() => getThemeForShop(getActiveShopId()));

    const applyThemeToCSS = useCallback((t: ShopTheme) => {
        const root = document.documentElement;
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--accent', t.accent);
        root.style.setProperty('--bg', t.background);
        root.style.setProperty('--card', t.card);
        root.style.setProperty('--primary-muted', `${t.primary}20`);
    }, []);

    const refreshTheme = useCallback(() => {
        const next = getThemeForShop(getActiveShopId());
        setTheme(next);
        applyThemeToCSS(next);
    }, [applyThemeToCSS]);

    useEffect(() => {
        refreshTheme();
        const handleStorage = (event: StorageEvent) => {
            if (!event.key || event.key === 'activeShopId' || event.key.startsWith('shopTheme:')) {
                refreshTheme();
            }
        };
        const handleShopChange = () => refreshTheme();
        window.addEventListener('storage', handleStorage);
        window.addEventListener('shopchange', handleShopChange);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('shopchange', handleShopChange);
        };
    }, [refreshTheme]);

    useEffect(() => {
        applyThemeToCSS(theme);
    }, [theme, applyThemeToCSS]);

    const updateTheme = useCallback((updates: Partial<ShopTheme>) => {
        const shopId = updates.shopId || getActiveShopId();
        setTheme(prev => {
            const next = { ...prev, ...updates, shopId };
            localStorage.setItem(`shopTheme:${shopId}`, JSON.stringify(next));
            applyThemeToCSS(next);
            return next;
        });
    }, [applyThemeToCSS]);

    const value = useMemo(() => ({ theme, updateTheme, refreshTheme }), [theme, updateTheme, refreshTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
