import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import type { ShopTheme } from '../context/AppTypes';

/* ═══════════════════════════════════════════════════
   Shop Theme Settings — /s/settings
   ═══════════════════════════════════════════════════ */

const ThemeSettings: React.FC = () => {
    const { theme, updateTheme } = useTheme();
    const { staffUser } = useAuth();

    const [form, setForm] = useState<ShopTheme>(theme);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setForm(theme);
    }, [theme]);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            updateTheme(form);
            setIsSaving(false);
        }, 800);
    };

    const resetTheme = () => {
        const defaults = {
            shopId: staffUser?.shopId || 'SHOP-01',
            shopName: 'Houston North Service',
            primary: '#3b82f6',
            accent: '#10b981',
            background: '#0a0a0c',
            card: '#121214',
            logoUrl: ''
        };
        setForm(defaults);
        updateTheme(defaults);
    };

    return (
        <div className="min-h-screen bg-background-dark pb-32">
            {/* Header */}
            <header className="px-6 pt-16 pb-12 bg-staff-hero-01 relative overflow-hidden border-b border-white/5">
                <div className="hero-overlay absolute inset-0 z-10" />
                <div className="relative z-20">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">White Label</h1>
                        <div className="size-12 bg-primary/10 backdrop-blur-md rounded-2xl border border-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary font-bold">palette</span>
                        </div>
                    </div>
                    <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.5em] ml-1">Brand Customization</p>
                </div>
            </header>

            <div className="p-6 space-y-8 relative z-30">
                {/* Shop Metadata */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">Basic Identity</h3>
                    <div className="space-y-4 bg-card-dark border border-white/5 rounded-3xl p-6">
                        <ThemeField
                            label="Shop Display Name"
                            value={form.shopName}
                            onChange={v => setForm({ ...form, shopName: v })}
                            placeholder="e.g. Houston First Service"
                        />
                        <ThemeField
                            label="Logo URL (Optional)"
                            value={form.logoUrl || ''}
                            onChange={v => setForm({ ...form, logoUrl: v })}
                            placeholder="https://..."
                        />
                    </div>
                </section>

                {/* Brand Colors */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">Brand Colors</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <ColorPicker
                            label="Primary Action"
                            value={form.primary}
                            onChange={v => setForm({ ...form, primary: v })}
                        />
                        <ColorPicker
                            label="Accent Highlight"
                            value={form.accent}
                            onChange={v => setForm({ ...form, accent: v })}
                        />
                    </div>
                </section>

                {/* Surface Colors */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">UI Surfaces</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <ColorPicker
                            label="Background"
                            value={form.background}
                            onChange={v => setForm({ ...form, background: v })}
                        />
                        <ColorPicker
                            label="Card Surface"
                            value={form.card}
                            onChange={v => setForm({ ...form, card: v })}
                        />
                    </div>
                </section>

                {/* Actions */}
                <div className="pt-4 space-y-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-3 shadow-[0_20px_40px_var(--primary-muted)] active:scale-[0.97] transition-all disabled:opacity-50"
                    >
                        {isSaving ? (
                            <span className="animate-pulse">Applying Changes...</span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-xl">check_circle</span>
                                Save Brand Settings
                            </>
                        )}
                    </button>

                    <button
                        onClick={resetTheme}
                        className="w-full h-14 bg-white/5 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">restart_alt</span>
                        Reset to Defaults
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ThemeFieldProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
}

const ThemeField = ({ label, value, onChange, placeholder }: ThemeFieldProps) => (
    <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 ml-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-800"
        />
    </div>
);

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
}

const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => (
    <div className="bg-card-dark border border-white/5 rounded-3xl p-5 space-y-3">
        <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{label}</label>
        <div className="flex items-center gap-3">
            <div
                className="size-10 rounded-xl border border-white/10 shrink-0 shadow-inner"
                style={{ backgroundColor: value }}
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-transparent text-white font-mono text-xs focus:outline-none uppercase"
            />
        </div>
        <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
        />
    </div>
);

export default ThemeSettings;
