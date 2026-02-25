import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ShopTheme } from './AppTypes';

interface ThemeContextType {
    theme: ShopTheme;
    updateTheme: (updates: Partial<ShopTheme>) => void;
    refreshTheme: () => void;
}

const DEFAULT_THEME: ShopTheme = {
    shopId: 'DEFAULT',
    shopName: 'Stitch Auto',
    primary: '#3b82f6', // blue-600
    accent: '#10b981',  // emerald-500
    background: '#0a0a0c',
    card: '#121214',
    logoUrl: ''
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Determine active shop from localStorage (set during login or tracking)
    const activeShopId = localStorage.getItem('activeShopId') || 'SHOP-01';

    const [theme, setTheme] = useState<ShopTheme>(() => {
        const stored = localStorage.getItem(`shopTheme:${activeShopId}`);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse theme', e);
            }
        }
        return { ...DEFAULT_THEME, shopId: activeShopId };
    });

    const applyThemeToCSS = useCallback((t: ShopTheme) => {
        const root = document.documentElement;
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--accent', t.accent);
        root.style.setProperty('--bg', t.background);
        root.style.setProperty('--card', t.card);
        // Add variations if needed (e.g. primary-muted)
        root.style.setProperty('--primary-muted', `${t.primary}20`); // 20% opacity
    }, []);

    // Apply on load
    useEffect(() => {
        applyThemeToCSS(theme);
    }, [theme, applyThemeToCSS]);

    const refreshTheme = useCallback(() => {
        const freshShopId = localStorage.getItem('activeShopId') || 'SHOP-01';
        const stored = localStorage.getItem(`shopTheme:${freshShopId}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            setTheme(parsed);
            applyThemeToCSS(parsed);
        }
    }, [applyThemeToCSS]);

    const updateTheme = useCallback((updates: Partial<ShopTheme>) => {
        setTheme(prev => {
            const next = { ...prev, ...updates };
            localStorage.setItem(`shopTheme:${next.shopId}`, JSON.stringify(next));
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
