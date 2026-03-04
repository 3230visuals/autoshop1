import { createContext } from 'react';
import type { ShopUser, AuthRole, StaffInvite } from './AppTypes';

export interface AuthContextType {
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
    signup: (email: string, password: string, name: string, role?: AuthRole, shopId?: string) => void;
    logout: (portal: 'client' | 'staff') => void;
    resetPassword: (email: string) => void;
    switchUser: (id: string) => void;
    updateCurrentUser: (updates: Partial<ShopUser>) => void;
    updateUserRole: (userId: string, role: AuthRole) => void;
    clearAuthError: () => void;
    forceClientLogin: (data: { clientId: string; name: string; shopId: string; shopName?: string; phone?: string }) => void;
    staffInvite: StaffInvite;
    updateStaffInvite: (field: keyof StaffInvite, value: string | boolean) => void;
    sendStaffInvite: () => void;
    resetStaffInvite: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
