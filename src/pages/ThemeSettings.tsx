import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/useAuth';
import type { ShopTheme } from '../context/AppTypes';

/* ═══════════════════════════════════════════════════
   Shop Theme Settings — /s/settings
   ═══════════════════════════════════════════════════ */

const ThemeSettings: React.FC = () => {
    const navigate = useNavigate();
    const { theme, updateTheme } = useTheme();
    const { staffUser } = useAuth();

    const [form, setForm] = useState<ShopTheme>(theme);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setForm(theme);
    }, [theme]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaved(false);
        const shopId = localStorage.getItem('activeShopId') ?? staffUser?.shopId ?? form.shopId;
        const fullTheme = { ...form, shopId };

        // Write directly to localStorage FIRST so refreshTheme picks it up
        localStorage.setItem(`shopTheme:${shopId}`, JSON.stringify(fullTheme));

        // Then update context + CSS vars
        await updateTheme(fullTheme);

        // Brief delay for visual feedback
        setTimeout(() => {
            window.dispatchEvent(new Event('shopchange'));
            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 300);
    };

    const resetTheme = async () => {
        const shopId = localStorage.getItem('activeShopId') ?? staffUser?.shopId ?? '';
        const defaults: ShopTheme = {
            shopId,
            shopName: 'Service Bay Software',
            primary: '#3b82f6',
            accent: '#10b981',
            background: '#0a0a0c',
            card: '#121214',
            fontColor: '#f8fafc',
            secondaryFontColor: '#64748b',
            logoUrl: ''
        };
        localStorage.setItem(`shopTheme:${shopId}`, JSON.stringify(defaults));
        setForm(defaults);
        await updateTheme(defaults);
        window.dispatchEvent(new Event('shopchange'));
    };

    return (
        <div className="min-h-screen bg-background-dark pb-32">
            {/* Header */}
            <header className="px-6 pt-16 pb-12 bg-staff-hero-01 relative overflow-hidden border-b border-white/5">
                <div className="hero-overlay absolute inset-0 z-10" />
                <div className="relative z-20 text-center">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Shop Profile</h1>
                    <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.5em] mt-2">Brand Customization</p>
                </div>
            </header>

            <div className="p-6 space-y-8 relative z-30">
                {/* Shop Metadata */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">Basic Identity</h3>
                    <div className="space-y-4 glass-card p-6">
                        <ThemeField
                            label="Shop Display Name"
                            value={form.shopName}
                            onChange={v => setForm({ ...form, shopName: v })}
                            placeholder="e.g. Service Bay Software"
                        />
                        <ThemeField
                            label="Logo URL (Optional)"
                            value={form.logoUrl ?? ''}
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
                        <ColorPicker
                            label="Font Color"
                            value={form.fontColor ?? '#f8fafc'}
                            onChange={v => setForm({ ...form, fontColor: v })}
                        />
                        <ColorPicker
                            label="Muted Text"
                            value={form.secondaryFontColor ?? '#64748b'}
                            onChange={v => setForm({ ...form, secondaryFontColor: v })}
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

                {/* Operations Management (Owner Only) */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">Operations</h3>
                    <div className="glass-card p-6 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all" onClick={() => { void navigate('/s/services'); }}>
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10 group-hover:bg-primary/20 transition-all">
                                <span className="material-symbols-outlined text-primary">sell</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Services & Pricing</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Edit labor rates & service menu</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">chevron_right</span>
                    </div>
                </section>

                {/* Actions */}
                <div className="pt-4 space-y-4">
                    <button
                        onClick={() => { void handleSave(); }}
                        disabled={isSaving}
                        className={`w-full h-16 rounded-2xl font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-3 active:scale-[0.97] transition-all disabled:opacity-50 ${saved
                            ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20'
                            : 'bg-primary text-white shadow-[0_20px_40px_var(--primary-muted)]'
                            }`}
                    >
                        {isSaving ? (
                            <span className="animate-pulse">Applying Changes...</span>
                        ) : saved ? (
                            <>
                                <span className="material-symbols-outlined text-xl">check</span>
                                Saved!
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-xl">check_circle</span>
                                Save Brand Settings
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => { void resetTheme(); }}
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
        <label htmlFor={`theme-field-${label}`} className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 ml-1">{label}</label>
        <input
            id={`theme-field-${label}`}
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

const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="glass-card p-6 space-y-4">
            <label htmlFor={`color-text-${label}`} className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{label}</label>
            {/* Tappable color swatch — opens native picker */}
            <button
                type="button"
                aria-label={`Open color picker for ${label}`}
                onClick={() => inputRef.current?.click()}
                className="w-full h-14 rounded-xl border-2 border-white/10 shadow-inner cursor-pointer active:scale-95 transition-all hover:border-white/20 theme-swatch"
                style={{ '--swatch-color': value } as React.CSSProperties}
            />
            <div className="flex items-center gap-2">
                <input
                    id={`color-text-${label}`}
                    type="text"
                    aria-label={`${label} hex code`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none uppercase tracking-wider"
                />
            </div>
            {/* Hidden color input triggered by swatch tap */}
            <input
                ref={inputRef}
                id={`color-picker-${label}`}
                type="color"
                aria-label={`Select ${label} color`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 rounded-xl bg-white/5 cursor-pointer appearance-none overflow-hidden border border-white/10 [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-lg"
            />
        </div>
    );
};

export default ThemeSettings;

