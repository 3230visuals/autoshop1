import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_USERS } from '../__mocks__/mockData';
import type { AuthRole, ShopUser, StaffInvite } from './AppTypes';
import { findTicket } from '../utils/mockTickets';
import { isSupabaseConfigured, authService } from '../services/authService';
import { supabase } from '../lib/supabase';
import { AuthContext } from './AuthContextCore';
import type { AuthContextType } from './AuthContextCore';

const normalizePhone = (phone?: string): string => (phone ?? '').replace(/\D/g, '');

const readStoredStaff = (): ShopUser | null => {
    if (localStorage.getItem('staffAuth') !== 'true') return null;
    const role = (localStorage.getItem('staffRole') ?? 'staff').toUpperCase() as AuthRole;
    const shopId = localStorage.getItem('activeShopId') ?? '';
    const shopName = localStorage.getItem('activeShopName') ?? '';
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
    const shopId = localStorage.getItem('activeShopId') ?? '';
    const shopName = localStorage.getItem('activeShopName') ?? '';
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

    const clientLogin = useCallback(async (ticketId: string, phone?: string) => {
        setAuthError(null);
        setIsLoading(true);
        try {
            const trimmedId = ticketId.trim();

            // 1) Try mock tickets first (demo / backward compat)
            const ticket = findTicket(trimmedId);
            if (ticket) {
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
                return;
            }

            // 2) Real Supabase lookup
            if (isSupabaseConfigured()) {
                const { jobService } = await import('../services/jobService');
                let job = await jobService.getJobByToken(trimmedId);
                if (!job) {
                    job ??= await jobService.getJobById(trimmedId);
                }

                if (job) {
                    const normalizedPhone = normalizePhone(phone);
                    localStorage.setItem('clientAuth', 'true');
                    localStorage.setItem('activeShopId', job.shopId || '');
                    localStorage.setItem('activeClientId', job.clientId || '');
                    if (normalizedPhone) localStorage.setItem('activeClientPhone', normalizedPhone);
                    setClientUser({
                        id: job.clientId || `client-${Date.now()}`,
                        name: job.client || 'Customer',
                        email: '',
                        role: 'CLIENT',
                        shopId: job.shopId || '',
                        phone: normalizedPhone,
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(job.client || 'Customer')}`,
                    });
                    window.dispatchEvent(new Event('shopchange'));
                    return;
                }
            }

            setAuthError('Ticket not found. Please check the ID and try again.');
        } catch (err) {
            console.error('clientLogin error:', err);
            setAuthError('Something went wrong. Please try again.');
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
                let user: ShopUser | null = null;
                for (let i = 0; i < 3; i++) {
                    user = await authService.getCurrentUser();
                    if (user) break;
                    await new Promise(res => setTimeout(res, 500));
                }

                if (!user) {
                    const { data: authData } = await supabase.auth.getUser();
                    if (!authData.user) {
                        return { id: `temp-${Date.now()}`, name, email, role, shopId: shopId ?? '', avatar: '' } as ShopUser;
                    }
                    user = {
                        id: authData.user.id,
                        name,
                        email,
                        role,
                        shopId: shopId ?? '',
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
                    };
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

    // ✅ FIX 5: Guard against empty shopId — never store a blank shop into localStorage
    const forceClientLogin = useCallback((data: {
        clientId: string;
        name: string;
        shopId: string;
        shopName?: string;
        phone?: string;
    }) => {
        // If shopId is missing, something upstream is broken — log it clearly
        if (!data.shopId) {
            console.error('forceClientLogin called with empty shopId — check that ticket.shopId is populated before calling this.');
        }

        localStorage.setItem('clientAuth', 'true');
        if (data.shopId) localStorage.setItem('activeShopId', data.shopId);
        if (data.shopName) localStorage.setItem('activeShopName', data.shopName);
        if (data.clientId) localStorage.setItem('activeClientId', data.clientId);
        if (data.phone) localStorage.setItem('activeClientPhone', data.phone);

        setClientUser({
            id: data.clientId || `client-${Date.now()}`,
            name: data.name || 'Guest',
            email: '',
            role: 'CLIENT',
            shopId: data.shopId,
            // ✅ FIX 5: Use actual shop name from ticket, not hardcoded string
            shopName: data.shopName && data.shopName !== 'Service Bay Software'
                ? data.shopName
                : (localStorage.getItem('activeShopName') ?? 'Your Shop'),
            phone: data.phone,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name || 'guest')}`,
        });
        window.dispatchEvent(new Event('shopchange'));
    }, []);

    const updateStaffInvite = useCallback((field: keyof StaffInvite, value: string | boolean) => {
        setStaffInvite((prev) => ({ ...prev, [field]: value }));
    }, []);

    // ✅ FIX 4: sendStaffInvite now actually sends — via Supabase Auth invite
    // Falls back to console.log in demo mode
    const sendStaffInvite = useCallback(async () => {
        if (isDemo) {
            console.log('[Demo mode] Staff invite would send to:', staffInvite.email);
            setStaffInvite((prev) => ({ ...prev, sent: true }));
            return;
        }

        if (!staffInvite.email?.trim()) {
            console.warn('sendStaffInvite: no email provided');
            return;
        }

        try {
            const shopId = localStorage.getItem('activeShopId') ?? '';
            const shopName = localStorage.getItem('activeShopName') ?? 'Your Shop';

            // Use Supabase Admin invite — sends a real magic-link email
            // The redirectTo brings them to your staff onboarding flow
            const { error } = await supabase.auth.admin.inviteUserByEmail(
                staffInvite.email.trim(),
                {
                    redirectTo: `${window.location.origin}/s/accept-invite?shop=${encodeURIComponent(shopId)}&role=${staffInvite.role.toLowerCase()}`,
                    data: {
                        invited_name: staffInvite.name,
                        shop_id: shopId,
                        shop_name: shopName,
                        role: staffInvite.role,
                    },
                }
            );

            if (error) {
                // inviteUserByEmail requires service role key in Edge Functions
                // If called from the browser, fall back to a magic link approach
                console.warn('Admin invite failed (expected if calling from browser):', error.message);
                console.info('→ To fix: move sendStaffInvite to a Supabase Edge Function with SERVICE_ROLE_KEY');

                // Browser-safe fallback: send OTP to their email
                // They click the link, land on /s/accept-invite, get assigned to shop
                const { error: otpError } = await supabase.auth.signInWithOtp({
                    email: staffInvite.email.trim(),
                    options: {
                        emailRedirectTo: `${window.location.origin}/s/accept-invite?shop=${encodeURIComponent(shopId)}&role=${staffInvite.role.toLowerCase()}&name=${encodeURIComponent(staffInvite.name)}`,
                        shouldCreateUser: true,
                        data: {
                            invited_name: staffInvite.name,
                            shop_id: shopId,
                            role: staffInvite.role,
                        },
                    },
                });

                if (otpError) throw otpError;
            }

            setStaffInvite((prev) => ({ ...prev, sent: true }));
            console.log(`✅ Staff invite sent to ${staffInvite.email}`);
        } catch (err) {
            console.error('sendStaffInvite failed:', err);
            // Don't swallow this — surface it so the UI can show an error
            throw err;
        }
    }, [isDemo, staffInvite]);

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
