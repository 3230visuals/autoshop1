import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_USERS } from '../__mocks__/mockData';
import type { AuthRole, ShopUser, StaffInvite } from './AppTypes';
import { findTicket } from '../utils/mockTickets';
import { isSupabaseConfigured, authService } from '../services/authService';
import { AuthContext } from './AuthContextCore';
import type { AuthContextType } from './AuthContextCore';

const normalizePhone = (phone?: string): string => (phone ?? '').replace(/\D/g, '');

const readStoredStaff = (): ShopUser | null => {
    if (localStorage.getItem('staffAuth') !== 'true') return null;
    const role = (localStorage.getItem('staffRole') ?? 'staff').toUpperCase() as AuthRole;
    const shopId = localStorage.getItem('activeShopId') ?? 'SHOP-01';
    const shopName = localStorage.getItem('activeShopName') ?? 'Service Bay Software';
    return {
        id: role === 'OWNER' ? 'staff-owner' : 'staff-tech',
        name: role === 'OWNER' ? 'Shop Owner' : 'Service Staff',
        email: '',
        role,
        shopId,
        shopName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}-${shopId}`,
    };
};

const readStoredClient = (): ShopUser | null => {
    if (localStorage.getItem('clientAuth') !== 'true') return null;
    const shopId = localStorage.getItem('activeShopId') ?? 'SHOP-01';
    const shopName = localStorage.getItem('activeShopName') ?? 'Service Bay Software';
    const id = localStorage.getItem('activeClientId') ?? 'CLIENT-UNKNOWN';
    const phone = normalizePhone(localStorage.getItem('activeClientPhone') ?? '');
    return {
        id,
        name: 'Client',
        email: '',
        role: 'CLIENT',
        shopId,
        shopName,
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
    const [staffInvite, setStaffInvite] = useState<StaffInvite>({
        name: '', email: '', role: 'STAFF', sent: false
    });

    const currentUser = useMemo(() => clientUser ?? staffUser ?? DEFAULT_USERS[0], [clientUser, staffUser]);
    const isAuthenticated = !!(clientUser ?? staffUser);

    useEffect(() => {
        if (isDemo) {
            setIsLoading(false);
            return;
        }
        // Hydrate real session
        void authService.getCurrentUser().then(user => {
            if (user) {
                if (user.role === 'CLIENT') setClientUser(user);
                else setStaffUser(user);
            }
        }).finally(() => setIsLoading(false));
    }, [isDemo]);

    const login = useCallback(async (email: string, password: string, portal: 'client' | 'staff') => {
        setAuthError(null);
        setIsLoading(true);
        try {
            if (isDemo) {
                // Mock behavior for demo
                const lower = email.toLowerCase();
                let user: ShopUser | undefined;
                if (portal === 'staff') {
                    if (lower.includes('owner')) user = { ...DEFAULT_USERS[1], shopId: 'SHOP-01' };
                    else user = { ...DEFAULT_USERS[2], shopId: 'SHOP-01' };
                    localStorage.setItem('staffAuth', 'true');
                    localStorage.setItem('activeShopId', 'SHOP-01');
                    setStaffUser(user);
                } else {
                    user = { ...DEFAULT_USERS[3], shopId: 'SHOP-01' };
                    localStorage.setItem('clientAuth', 'true');
                    localStorage.setItem('activeShopId', 'SHOP-01');
                    setClientUser(user);
                }
                window.dispatchEvent(new Event('shopchange'));
            } else {
                // Real Supabase login
                await authService.signIn(email, password);
                const user = await authService.getCurrentUser();
                if (user) {
                    if (portal === 'staff') setStaffUser(user);
                    else setClientUser(user);
                    localStorage.setItem(portal === 'staff' ? 'staffAuth' : 'clientAuth', 'true');
                    if (user.shopId) localStorage.setItem('activeShopId', user.shopId);
                    window.dispatchEvent(new Event('shopchange'));
                } else {
                    throw new Error('User profile not found');
                }
            }
        } catch (err) {
            setAuthError(err instanceof Error ? err.message : 'Login failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [isDemo]);

    const clientLogin = useCallback((ticketId: string, phone?: string) => {
        setAuthError(null);
        setIsLoading(true);
        try {
            // Find ticket from mock (or real service in future)
            const ticket = findTicket(ticketId.trim());
            if (!ticket) {
                setAuthError('Ticket not found. Please check the ID and try again.');
                return;
            }

            const normalizedPhone = normalizePhone(phone);

            localStorage.setItem('clientAuth', 'true');
            localStorage.setItem('activeShopId', ticket.shopId);
            localStorage.setItem('activeClientId', ticket.clientId);
            if (normalizedPhone) localStorage.setItem('activeClientPhone', normalizedPhone);

            setClientUser({
                id: ticket.clientId,
                name: ticket.customerName,
                email: '',
                role: 'CLIENT',
                shopId: ticket.shopId,
                phone: normalizedPhone,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ticket.customerName)}`,
            });
            window.dispatchEvent(new Event('shopchange'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signup = useCallback(async (email: string, password: string, name: string, role: AuthRole = 'CLIENT', shopId?: string) => {
        setAuthError(null);
        setIsLoading(true);
        try {
            if (isDemo) {
                const newUser: ShopUser = {
                    id: `u${Date.now()}`,
                    name,
                    email,
                    role,
                    shopId: shopId ?? 'SHOP-01',
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
                };
                setUsers(prev => [...prev, newUser]);
                if (role === 'CLIENT') setClientUser(newUser);
                else setStaffUser(newUser);
                return newUser;
            } else {
                await authService.signUp(email, password, name, role);
                const user = await authService.getCurrentUser();
                if (!user) {
                    throw new Error('Signup succeeded but profile could not be retrieved.');
                }

                if (role === 'CLIENT') setClientUser(user);
                else setStaffUser(user);

                return user;
            }
        } catch (err) {
            setAuthError(err instanceof Error ? err.message : 'Signup failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [isDemo]);

    const logout = useCallback((portal: 'client' | 'staff') => {
        if (!isDemo) void authService.signOut().catch(console.error);
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
    }, [isDemo]);

    const resetPassword = useCallback((email: string) => {
        if (!isDemo) void authService.resetPassword(email);
    }, [isDemo]);

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

    const updateUserRole = useCallback((userId: string, role: AuthRole) => {
        setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role } : u)));
    }, []);

    const clearAuthError = useCallback(() => setAuthError(null), []);

    const forceClientLogin = useCallback((data: { clientId: string; name: string; shopId: string; shopName?: string; phone?: string }) => {
        localStorage.setItem('clientAuth', 'true');
        localStorage.setItem('activeShopId', data.shopId);
        if (data.shopName) localStorage.setItem('activeShopName', data.shopName);
        localStorage.setItem('activeClientId', data.clientId);
        if (data.phone) localStorage.setItem('activeClientPhone', data.phone);

        setClientUser({
            id: data.clientId,
            name: data.name,
            email: '',
            role: 'CLIENT',
            shopId: data.shopId,
            shopName: data.shopName ?? 'Service Bay Software',
            phone: data.phone,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
        });
        window.dispatchEvent(new Event('shopchange'));
    }, []);

    const updateStaffInvite = useCallback((field: keyof StaffInvite, value: string | boolean) => {
        setStaffInvite((prev) => ({ ...prev, [field]: value }));
    }, []);

    const sendStaffInvite = useCallback(() => {
        setStaffInvite((prev) => ({ ...prev, sent: true }));
        console.log('Sending staff invite...', staffInvite);
    }, [staffInvite]);

    const resetStaffInvite = useCallback(() => {
        setStaffInvite({ name: '', email: '', role: 'STAFF', sent: false });
    }, []);

    const value = useMemo<AuthContextType>(() => ({
        currentUser, clientUser, staffUser, users, isAuthenticated, isLoading, isDemo, authError,
        login, clientLogin, signup, logout, resetPassword, switchUser,
        updateCurrentUser, updateUserRole, clearAuthError, forceClientLogin,
        staffInvite, updateStaffInvite, sendStaffInvite, resetStaffInvite,
    }), [
        currentUser, clientUser, staffUser, users, isAuthenticated, isLoading, isDemo, authError,
        login, clientLogin, signup, logout, resetPassword, switchUser,
        updateCurrentUser, updateUserRole, clearAuthError, forceClientLogin,
        staffInvite, updateStaffInvite, sendStaffInvite, resetStaffInvite,
    ]);

    return <AuthContext value={value}>{children}</AuthContext>;
};
