import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_USERS } from './AppTypes';
import type { AuthRole, ShopUser } from './AppTypes';
import { MOCK_TICKETS } from '../utils/mockTickets';
import { isSupabaseConfigured } from '../services/authService';

/* ═══════════════════════════════════════════════════
   Auth Context — Dual-Mode (Real Supabase + Demo)
   ═══════════════════════════════════════════════════ */

interface AuthContextType {
    // State
    currentUser: ShopUser; // Legacy/Global ref (points to context-appropriate user)
    clientUser: ShopUser | null;
    staffUser: ShopUser | null;
    users: ShopUser[];
    isAuthenticated: boolean;
    isLoading: boolean;
    isDemo: boolean;
    authError: string | null;

    // Actions
    login: (email: string, password: string, portal: 'client' | 'staff') => Promise<void>;
    clientLogin: (ticketId: string, phone?: string) => Promise<void>;
    signup: (email: string, password: string, name: string, role?: AuthRole, shopId?: string) => Promise<void>;
    logout: (portal: 'client' | 'staff') => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    switchUser: (id: string) => void;
    updateCurrentUser: (updates: Partial<ShopUser>) => void;
    clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const isDemo = !isSupabaseConfigured();

    const [users, setUsers] = useState<ShopUser[]>(DEFAULT_USERS);
    const [clientUser, setClientUser] = useState<ShopUser | null>(null);
    const [staffUser, setStaffUser] = useState<ShopUser | null>(isDemo ? DEFAULT_USERS[2] : null); // Dave
    const [isLoading, setIsLoading] = useState(!isDemo);
    const [authError, setAuthError] = useState<string | null>(null);

    // Helper to determine which user to return for legacy hooks
    const currentUser = useMemo(() => {
        // If we are on a staff path or if there is no client login, prioritize staff
        return staffUser || clientUser || DEFAULT_USERS[0];
    }, [staffUser, clientUser]);

    const isAuthenticated = !!(clientUser || staffUser);

    // ── Session Check ────────────────────────────
    useEffect(() => {
        if (isDemo) return;
        // Real Supabase session management would go here, splitting into portal contexts
        setIsLoading(false);
    }, [isDemo]);

    // ── Login ─────────────────────────────────────
    const login = useCallback(async (email: string, password: string, portal: 'client' | 'staff') => {
        setAuthError(null);
        setIsLoading(true);
        try {
            if (isDemo) {
                await new Promise(r => setTimeout(r, 600));
                const lower = email.toLowerCase();
                let user: ShopUser | undefined;

                if (portal === 'staff') {
                    if (lower.includes('marcus') || lower.includes('owner')) user = DEFAULT_USERS[1];
                    else user = DEFAULT_USERS[2]; // Dave
                } else {
                    user = DEFAULT_USERS[3]; // Alex
                }

                if (portal === 'staff') setStaffUser(user);
                else setClientUser(user);
            } else {
                // Real Auth Logic
            }
        } finally {
            setIsLoading(false);
        }
    }, [isDemo]);

    // ── Client Login (Lightweight Ticket Lookup) ──
    const clientLogin = useCallback(async (ticketId: string) => {
        setAuthError(null);
        setIsLoading(true);
        try {
            await new Promise(r => setTimeout(r, 400));
            const ticket = MOCK_TICKETS.find(t => t.id.toLowerCase() === ticketId.trim().toLowerCase());
            if (!ticket) {
                setAuthError('Ticket not found. Please check the ID and try again.');
                return;
            }
            setClientUser({
                id: 'CLIENT-001',
                name: ticket.customerName,
                email: '',
                role: 'CLIENT',
                shopId: ticket.shopId,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ticket.customerName)}`,
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ── Sign Up ───────────────────────────────────
    const signup = useCallback(async (_email: string, _password: string, name: string, role: AuthRole = 'CLIENT', shopId: string = 'SHOP-01') => {
        setAuthError(null);
        setIsLoading(true);
        try {
            const newUser: ShopUser = {
                id: `u${Date.now()}`,
                name,
                email: _email,
                role,
                shopId,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            };
            setUsers(prev => [...prev, newUser]);
            if (role === 'CLIENT') setClientUser(newUser);
            else setStaffUser(newUser);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ── Logout ────────────────────────────────────
    const logout = useCallback(async (portal: 'client' | 'staff') => {
        if (portal === 'client') setClientUser(null);
        else setStaffUser(null);
    }, []);

    const resetPassword = useCallback(async (_email: string) => {
        // ... implementation
    }, []);

    const switchUser = useCallback((id: string) => {
        const user = users.find(u => u.id === id);
        if (user) {
            if (user.role === 'CLIENT') setClientUser(user);
            else setStaffUser(user);
        }
    }, [users]);

    const updateCurrentUser = useCallback((updates: Partial<ShopUser>) => {
        if (staffUser) setStaffUser(prev => prev ? { ...prev, ...updates } : null);
        else if (clientUser) setClientUser(prev => prev ? { ...prev, ...updates } : null);
    }, [staffUser, clientUser]);

    const clearAuthError = useCallback(() => setAuthError(null), []);

    const value = useMemo(() => ({
        currentUser, clientUser, staffUser, users, isAuthenticated, isLoading, isDemo, authError,
        login, clientLogin, signup, logout, resetPassword, switchUser,
        updateCurrentUser, clearAuthError,
    }), [
        currentUser, clientUser, staffUser, users, isAuthenticated, isLoading, isDemo, authError,
        login, clientLogin, signup, logout, resetPassword, switchUser,
        updateCurrentUser, clearAuthError,
    ]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
