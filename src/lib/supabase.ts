import { createClient } from '@supabase/supabase-js';

const configuredUrl = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '').trim();
const configuredAnonKey = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '').trim();

const hasValidUrl = (() => {
    try {
        const url = new URL(configuredUrl);
        return (url.protocol === 'https:' || url.protocol === 'http:') && !url.hostname.includes('placeholder');
    } catch {
        return false;
    }
})();

const supabaseConfigured = hasValidUrl
    && configuredAnonKey.length > 0
    && !configuredAnonKey.toLowerCase().includes('placeholder')
    && !configuredAnonKey.toLowerCase().includes('your_anon');

export const isSupabaseConfigured = (): boolean => supabaseConfigured;

if (!supabaseConfigured) {
    console.warn('Supabase credentials missing. App will use mock state.');
}

export const supabase = createClient(
    supabaseConfigured ? configuredUrl : 'https://placeholder.supabase.co',
    supabaseConfigured ? configuredAnonKey : 'placeholder-key'
);
