import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_USERS } from './AppTypes';
import type { AuthRole, ShopUser } from './AppTypes';
import { findTicket } from '../utils/mockTickets';
import { isSupabaseConfigured } from '../services/authService';

interface AuthContextType {
    currentUser: ShopUser;
    clientUser: ShopUser | null;
    staffUser: ShopUser | null;
    users: ShopUser[];
    isAuthenticated: boolean;
    isLoading: boolean;
    isDemo: boolean;
    authError: string | null;
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

const normalizePhone = (phone?: string): string => (phone || '').replace(/\D/g, '');

const readStoredStaff = (): ShopUser | null => {
    if (localStorage.getItem('staffAuth') !== 'true') return null;
    const role = (localStorage.getItem('staffRole') || 'staff').toUpperCase() as AuthRole;
    const shopId = localStorage.getItem('activeShopId') || 'SHOP-01';
    return {
        id: role === 'OWNER' ? 'staff-owner' : 'staff-tech',
        name: role === 'OWNER' ? 'Shop Owner' : 'Service Staff',
        email: '',
        role,
        shopId,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}-${shopId}`,
    };
};

const readStoredClient = (): ShopUser | null => {
    if (localStorage.getItem('clientAuth') !== 'true') return null;
    const shopId = localStorage.getItem('activeShopId') || 'SHOP-01';
    const id = localStorage.getItem('activeClientId') || 'CLIENT-UNKNOWN';
    const phone = normalizePhone(localStorage.getItem('activeClientPhone') || '');
    return {
        id,
        name: 'Client',
        email: '',
        role: 'CLIENT',
        shopId,
        phone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const isDemo = !isSupabaseConfigured();

    const [users, setUsers] = useState<ShopUser[]>(DEFAULT_USERS);
    const [clientUser, setClientUser] = useState<ShopUser | null>(() => readStoredClient());
    const [staffUser, setStaffUser] = useState<ShopUser | null>(() => readStoredStaff());
    const [isLoading, setIsLoading] = useState(!isDemo);
    const [authError, setAuthError] = useState<string | null>(null);

    const currentUser = useMemo(() => clientUser || staffUser || DEFAULT_USERS[0], [clientUser, staffUser]);
    const isAuthenticated = !!(clientUser || staffUser);

    useEffect(() => {
        if (isDemo) return;
        setIsLoading(false);
    }, [isDemo]);

    const login = useCallback(async (email: string, _password: string, portal: 'client' | 'staff') => {
        setAuthError(null);
        setIsLoading(true);
        try {
            if (isDemo) {
                await new Promise(r => setTimeout(r, 300));
                const lower = email.toLowerCase();
                let user: ShopUser | undefined;

                if (portal === 'staff') {
                    if (lower.includes('owner')) user = { ...DEFAULT_USERS[1], shopId: 'SHOP-01' };
                    else user = { ...DEFAULT_USERS[2], shopId: 'SHOP-01' };
                    setStaffUser(user);
                } else {
                    user = { ...DEFAULT_USERS[3], shopId: 'SHOP-01' };
                    setClientUser(user);
                }
            }
        } finally {
            setIsLoading(false);
        }
    }, [isDemo]);

    const clientLogin = useCallback(async (ticketId: string, phone?: string) => {
        setAuthError(null);
        setIsLoading(true);
        try {
            await new Promise(r => setTimeout(r, 250));
            const ticket = findTicket(ticketId.trim());
            if (!ticket) {
                setAuthError('Ticket not found. Please check the ID and try again.');
                return;
            }

            const normalizedPhone = normalizePhone(phone);

            localStorage.setItem('clientAuth', 'true');
            localStorage.setItem('activeShopId', ticket.shopId);
            window.dispatchEvent(new Event('shopchange'));
            localStorage.setItem('activeClientId', ticket.clientId);
            if (normalizedPhone) localStorage.setItem('activeClientPhone', normalizedPhone);
            else localStorage.removeItem('activeClientPhone');

            setClientUser({
                id: ticket.clientId,
                name: ticket.customerName,
                email: '',
                role: 'CLIENT',
                shopId: ticket.shopId,
                phone: normalizedPhone,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ticket.customerName)}`,
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

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

    const logout = useCallback(async (portal: 'client' | 'staff') => {
        if (portal === 'client') {
            setClientUser(null);
            localStorage.removeItem('clientAuth');
            localStorage.removeItem('activeClientId');
            localStorage.removeItem('activeClientPhone');
        } else {
            setStaffUser(null);
            localStorage.removeItem('staffAuth');
            localStorage.removeItem('staffRole');
        }
    }, []);

    const resetPassword = useCallback(async (_email: string) => {
        return;
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
