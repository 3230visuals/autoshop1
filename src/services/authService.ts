import { supabase } from '../lib/supabase';
import type { ShopUser, AuthRole } from '../context/AppTypes';

/* ═══════════════════════════════════════════════════
   Auth Service — Supabase Auth Integration
   ═══════════════════════════════════════════════════ */

/** Whether real Supabase credentials are configured */
export const isSupabaseConfigured = (): boolean => {
    const url = import.meta.env.VITE_SUPABASE_URL;
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

        // Create profile in public.profiles if user was created
        if (data.user) {
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: name,
                email,
                role,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            });
            if (profileError) {
                console.error('Profile creation failed:', profileError);
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

        // Map Supabase profile to ShopUser interface
        return {
            id: profile.id,
            name: profile.full_name || user.user_metadata?.name || user.email || 'User',
            email: profile.email || user.email || '',
            role: (profile.role as AuthRole) || 'CLIENT',
            avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            phone: profile.phone || undefined,
            shopName: profile.shop_name || undefined,
            shopPhone: profile.shop_phone || undefined,
            shopAddress: profile.shop_address || undefined,
            shopLogo: profile.shop_logo || undefined,
        };
    },

    /**
     * Subscribe to auth state changes (login, logout, token refresh).
     */
    onAuthStateChange(callback: (event: string, session: unknown) => void) {
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
