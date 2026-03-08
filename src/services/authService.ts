import { supabase } from '../lib/supabase';
import type { ShopUser, AuthRole } from '../context/AppTypes';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface SupabaseProfile {
    id: string;
    full_name?: string;
    email?: string;
    role?: string;
    avatar_url?: string;
    phone?: string;
    shop_name?: string;
    shop_phone?: string;
    shop_address?: string;
    shop_logo?: string;
    shop_id?: string;
}

/* ═══════════════════════════════════════════════════
   Auth Service — Supabase Auth Integration
   ═══════════════════════════════════════════════════ */

/** Whether real Supabase credentials are configured */
export const isSupabaseConfigured = (): boolean => {
    const url = (import.meta.env.VITE_SUPABASE_URL as string ?? '').trim();
    return !!url && !url.includes('placeholder');
};

export const authService = {
    /**
     * Sign in with email and password.
     */
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    /**
     * Sign up a new user with email, password, and profile metadata.
     * Creates a profile row after successful auth signup.
     */
    async signUp(email: string, password: string, name: string, role: AuthRole = 'CLIENT') {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, role },
            },
        });
        if (error) throw error;

        // Try to create profile as a fallback to the DB trigger
        if (data.user) {
            try {
                await supabase.from('profiles').upsert({
                    id: data.user.id,
                    full_name: name,
                    email,
                    role,
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
                }, { onConflict: 'id' });
            } catch (err) {
                // Ignore errors here - the trigger should handle it
                console.warn('Manual profile upsert skipped or failed (trigger likely handled it):', err);
            }
        }

        return data;
    },

    /**
     * Get the current session (if user is already logged in).
     */
    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    /**
     * Get the current user's profile from the profiles table.
     */
    async getCurrentUser(): Promise<ShopUser | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile) return null;

        const p = profile as SupabaseProfile;

        // Map Supabase profile to ShopUser interface
        return {
            id: p.id,
            name: p.full_name ?? (user.user_metadata?.name as string | undefined) ?? user.email ?? 'User',
            email: p.email ?? user.email ?? '',
            role: (p.role as AuthRole) ?? 'CLIENT',
            shopId: p.shop_id ?? (user.user_metadata?.shopId as string | undefined) ?? '',
            avatar: p.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            phone: p.phone ?? undefined,
            shopName: p.shop_name ?? undefined,
            shopPhone: p.shop_phone ?? undefined,
            shopAddress: p.shop_address ?? undefined,
            shopLogo: p.shop_logo ?? undefined,
        };
    },

    /**
     * Subscribe to auth state changes (login, logout, token refresh).
     */
    onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
        return supabase.auth.onAuthStateChange(callback);
    },

    /**
     * Send a password reset email.
     */
    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/`,
        });
        if (error) throw error;
    },

    /**
     * Sign out the current user.
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },
};
