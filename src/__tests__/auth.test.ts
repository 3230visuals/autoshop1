import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import type { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../context/useAuth';

// Mock external dependencies
vi.mock('../services/authService', () => ({
    isSupabaseConfigured: () => false, // demo mode
}));

vi.mock('../utils/mockTickets', () => ({
    findTicket: (id: string) => {
        if (id === 'TKT-001') return { clientId: 'CLT-001', customerName: 'Alex R.', shopId: 'SHOP-01' };
        if (id === 'INVALID') return null;
        return null;
    },
}));

function wrapper({ children }: { children: ReactNode }) {
    return React.createElement(AuthProvider, null, children);
}

describe('Auth Context', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('initial state (demo mode)', () => {
        it('starts with a default user', () => {
            const { result } = renderHook(() => useAuth(), { wrapper });
            expect(result.current.currentUser).toBeDefined();
            expect(result.current.currentUser.name).toBeTruthy();
        });

        it('isDemo is true when Supabase is not configured', () => {
            const { result } = renderHook(() => useAuth(), { wrapper });
            expect(result.current.isDemo).toBe(true);
        });

        it('isAuthenticated is false when no portal user is set', () => {
            const { result } = renderHook(() => useAuth(), { wrapper });
            // In demo mode, no one is logged in by default (no localStorage)
            expect(result.current.isLoading).toBe(false);
        });

        it('provides a users array', () => {
            const { result } = renderHook(() => useAuth(), { wrapper });
            expect(result.current.users.length).toBeGreaterThan(0);
        });
    });

    describe('login', () => {
        it('sets staffUser on staff login', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.login('owner@test.com', '1234', 'staff');
            });

            expect(result.current.staffUser).not.toBeNull();
            expect(result.current.staffUser?.shopId).toBe('SHOP-01');
            expect(result.current.isAuthenticated).toBe(true);
        });

        it('sets clientUser on client login', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.login('client@test.com', '1234', 'client');
            });

            expect(result.current.clientUser).not.toBeNull();
            expect(result.current.clientUser?.role).toBe('CLIENT');
        });

        it('persists staffAuth to localStorage', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.login('owner@test.com', '1234', 'staff');
            });

            expect(localStorage.getItem('staffAuth')).toBe('true');
            expect(localStorage.getItem('activeShopId')).toBe('SHOP-01');
        });
    });

    describe('logout', () => {
        it('clears staffUser on staff logout', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.login('owner@test.com', '1234', 'staff');
            });
            expect(result.current.staffUser).not.toBeNull();

            act(() => {
                result.current.logout('staff');
            });

            expect(result.current.staffUser).toBeNull();
            expect(localStorage.getItem('staffAuth')).toBeNull();
        });

        it('clears clientUser on client logout', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.login('client@test.com', '1234', 'client');
            });

            act(() => {
                result.current.logout('client');
            });

            expect(result.current.clientUser).toBeNull();
            expect(localStorage.getItem('clientAuth')).toBeNull();
        });
    });

    describe('signup', () => {
        it('creates a new user and adds to users list', () => {
            const { result } = renderHook(() => useAuth(), { wrapper });
            const initialCount = result.current.users.length;

            act(() => {
                result.current.signup('new@test.com', 'pass', 'New User', 'STAFF', 'SHOP-01');
            });

            expect(result.current.users.length).toBe(initialCount + 1);
            expect(result.current.staffUser?.name).toBe('New User');
        });

        it('sets clientUser for CLIENT role signup', () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            act(() => {
                result.current.signup('client@new.com', 'pass', 'Client User', 'CLIENT');
            });

            expect(result.current.clientUser?.name).toBe('Client User');
        });
    });

    describe('clientLogin', () => {
        it('authenticates via valid ticket ID', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.clientLogin('TKT-001');
            });

            expect(result.current.clientUser).not.toBeNull();
            expect(result.current.clientUser?.name).toBe('Alex R.');
            expect(result.current.clientUser?.shopId).toBe('SHOP-01');
        });

        it('sets authError for invalid ticket', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.clientLogin('INVALID');
            });

            expect(result.current.authError).toContain('not found');
            expect(result.current.clientUser).toBeNull();
        });
    });

    describe('switchUser', () => {
        it('switches to a different user by ID', () => {
            const { result } = renderHook(() => useAuth(), { wrapper });
            const secondUser = result.current.users[1];

            act(() => {
                result.current.switchUser(secondUser.id);
            });

            const active = secondUser.role === 'CLIENT'
                ? result.current.clientUser
                : result.current.staffUser;
            expect(active?.id).toBe(secondUser.id);
        });
    });

    describe('updateUserRole', () => {
        it('changes a user role in the users list', () => {
            const { result } = renderHook(() => useAuth(), { wrapper });
            const userId = result.current.users[2].id;

            act(() => {
                result.current.updateUserRole(userId, 'OWNER');
            });

            const updated = result.current.users.find(u => u.id === userId);
            expect(updated?.role).toBe('OWNER');
        });
    });

    describe('forceClientLogin', () => {
        it('sets clientUser directly from ticket data', () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            act(() => {
                result.current.forceClientLogin({
                    clientId: 'CLT-999',
                    name: 'Force User',
                    shopId: 'SHOP-02',
                    shopName: 'Test Shop',
                    phone: '5551234567',
                });
            });

            expect(result.current.clientUser?.id).toBe('CLT-999');
            expect(result.current.clientUser?.name).toBe('Force User');
            expect(result.current.clientUser?.shopId).toBe('SHOP-02');
            expect(localStorage.getItem('clientAuth')).toBe('true');
        });
    });

    describe('clearAuthError', () => {
        it('resets authError to null', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.clientLogin('INVALID');
            });
            expect(result.current.authError).not.toBeNull();

            act(() => {
                result.current.clearAuthError();
            });
            expect(result.current.authError).toBeNull();
        });
    });
});
