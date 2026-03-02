import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from './authService';
import type { ShopTheme } from '../context/AppTypes';

interface ShopRecord {
    id: string;
    name: string;
    primary_color: string;
    accent_color: string;
    background_color: string;
    card_color: string;
    font_color: string | null;
    secondary_font_color: string | null;
    logo_url: string | null;
    stripe_account_id: string | null;
    stripe_onboarding_complete: boolean;
    platform_fee_percent: number;
    is_test_mode: boolean;
}

export const shopService = {
    /**
     * Fetches shop settings and branding
     */
    async getShopSettings(shopId: string): Promise<ShopTheme | null> {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: fetching shop settings');
            return {
                shopId,
                shopName: 'Service Bay Software',
                primary: '#4f46e5',
                accent: '#818cf8',
                background: '#0a0a0c',
                card: '#111114',
                fontColor: '#ffffff',
                secondaryFontColor: '#94a3b8',
                logoUrl: '',
                stripeOnboardingComplete: false,
                platformFeePercent: 5,
                isTestMode: true
            };
        }

        const response = await supabase
            .from('shops')
            .select('*')
            .eq('id', shopId)
            .single();

        if (response.error) {
            if (response.error.code === 'PGRST116') return null; // Not found
            throw response.error;
        }

        const data = response.data as unknown as ShopRecord;
        return {
            shopId: data.id,
            shopName: data.name,
            primary: data.primary_color,
            accent: data.accent_color,
            background: data.background_color,
            card: data.card_color,
            fontColor: data.font_color || undefined,
            secondaryFontColor: data.secondary_font_color || undefined,
            logoUrl: data.logo_url || '',
            stripeAccountId: data.stripe_account_id || undefined,
            stripeOnboardingComplete: data.stripe_onboarding_complete,
            platformFeePercent: data.platform_fee_percent,
            isTestMode: data.is_test_mode
        };
    },

    /**
     * Updates shop settings
     */
    async updateShopSettings(shopId: string, updates: Partial<ShopTheme>): Promise<void> {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: shop settings update skipped');
            return;
        }
        const dbUpdates: Record<string, any> = {};
        if (updates.shopName !== undefined) dbUpdates.name = updates.shopName;
        if (updates.primary !== undefined) dbUpdates.primary_color = updates.primary;
        if (updates.accent !== undefined) dbUpdates.accent_color = updates.accent;
        if (updates.background !== undefined) dbUpdates.background_color = updates.background;
        if (updates.card !== undefined) dbUpdates.card_color = updates.card;
        if (updates.fontColor !== undefined) dbUpdates.font_color = updates.fontColor;
        if (updates.secondaryFontColor !== undefined) dbUpdates.secondary_font_color = updates.secondaryFontColor;
        if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
        if (updates.stripeAccountId !== undefined) dbUpdates.stripe_account_id = updates.stripeAccountId;
        if (updates.stripeOnboardingComplete !== undefined) dbUpdates.stripe_onboarding_complete = updates.stripeOnboardingComplete;
        if (updates.platformFeePercent !== undefined) dbUpdates.platform_fee_percent = updates.platformFeePercent;
        if (updates.isTestMode !== undefined) dbUpdates.is_test_mode = updates.isTestMode;

        const { error } = await supabase
            .from('shops')
            .update(dbUpdates)
            .eq('id', shopId);

        if (error) throw error;
    }
};
