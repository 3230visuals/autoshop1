import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/useAppContext';
import { motion, AnimatePresence } from 'framer-motion';
import type { AuthRole } from '../context/AppTypes';

type AuthMode = 'signin' | 'signup';

const LoginScreen: React.FC = () => {
    const navigate = useNavigate();
    const { login, signup, isDemo, isLoading, authError, clearAuthError } = useAuth();
    const { setShopTheme } = useAppContext();
    const [searchParams] = useSearchParams();

    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<AuthRole>('CLIENT');
    const [shopId, setShopId] = useState('');
    const [localError, setLocalError] = useState('');

    // Auto-handle magic links (QR Codes)
    React.useEffect(() => {
        const urlRole = searchParams.get('role');
        const urlMode = searchParams.get('mode');
        const invite = searchParams.get('invite');

        if (urlMode === 'signup' || invite === 'true') {
            setMode('signup');
        }

        if (urlRole) {
            const roleUpper = urlRole.toUpperCase() as AuthRole;
            setRole(roleUpper);

            if (urlMode !== 'signup' && !invite) {
                const roleMap: Record<string, { userId: string; nav: string }> = {
                    mechanic: { userId: 'u3', nav: '/staff' },
                    owner: { userId: 'u2', nav: '/dashboard/shop' },
                    client: { userId: 'u4', nav: '/dashboard/owner' },
                };
                const match = roleMap[urlRole.toLowerCase()];
                if (match) {
                    login(match.userId === 'u3' ? 'dave@demo' : 'marcus@demo', 'demo', 'client')
                        .then(() => navigate(match.nav))
                        .catch(() => { });
                }
            }
        }
    }, [searchParams, login, navigate]);

    const navigateByRole = (userRole?: string) => {
        const r = userRole?.toUpperCase();
        if (r === 'STAFF') navigate('/s/board');
        else if (r === 'OWNER') navigate('/dashboard/shop');
        else navigate('/c/home');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        clearAuthError();

        if (!email.trim()) { setLocalError('Email Required'); return; }
        if (!password.trim() && mode === 'signup') { setLocalError('Password Required'); return; }
        if (mode === 'signup' && !name.trim()) { setLocalError('Full Name Required'); return; }
        if (mode === 'signup' && password.length < 6) { setLocalError('Password must be at least 6 characters'); return; }

        try {
            const cleanEmail = email.trim().toLowerCase();
            const cleanPassword = password.trim().toLowerCase();

            if (mode === 'signin') {
                await login(cleanEmail, cleanPassword, 'client');
                if (isDemo) {
                    if (cleanEmail.includes('dave') || cleanEmail.includes('staff')) {
                        navigate('/s/board');
                    } else {
                        navigate('/c/home');
                    }
                } else {
                    navigateByRole(role);
                }
            } else {
                await signup(cleanEmail, cleanPassword, name, role);
                navigateByRole(role);
            }
        } catch {
            // Context handles error
        }
    };

    const handleShopIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setShopId(val);
        const lower = val.toLowerCase();
        if (lower.includes('ford') || lower.includes('blue')) setShopTheme('blue');
        else if (lower.includes('ferrari') || lower.includes('red')) setShopTheme('red');
        else if (lower.includes('eco') || lower.includes('green')) setShopTheme('green');
        else setShopTheme('default');
    };

    const displayError = localError || authError;

    const ROLE_OPTIONS: { value: AuthRole; label: string; icon: string }[] = [
        { value: 'CLIENT', label: 'Client', icon: 'person' },
        { value: 'STAFF', label: 'Terminal', icon: 'build' },
        { value: 'OWNER', label: 'OWNER', icon: 'store' },
    ];

    return (
        <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center font-sans bg-[#0a0a0c]">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale saturate-50" />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-20 w-full max-w-sm p-5"
            >
                <div className="glass-card p-8 relative overflow-hidden bg-[#121214]">
                    {/* Demo Badge */}
                    {isDemo && (
                        <div className="absolute top-5 right-5 z-30">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                                <span className="size-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                Simulation Mode
                            </span>
                        </div>
                    )}

                    {/* Header */}
                    <div className="text-center mb-12 relative mt-4">
                        <div className="inline-flex items-center justify-center size-14 rounded-xl bg-white/2 border border-white/5 mb-6 shadow-inner">
                            <span className="material-symbols-outlined text-blue-500 text-3xl">terminal</span>
                        </div>
                        <h1 className="text-[17px] font-bold text-white tracking-[0.4em] uppercase">STITCH_AUTO</h1>
                        <p className="text-slate-600 text-[12px] font-bold uppercase tracking-[0.3em] mt-3">
                            {mode === 'signin' ? 'Shop Management Login' : 'Create Your Account'}
                        </p>
                    </div>

                    {/* Sign In / Sign Up Toggle */}
                    <div className="flex bg-white/2 rounded-xl p-1.5 mb-10 border border-white/5">
                        {(['signin', 'signup'] as AuthMode[]).map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setLocalError(''); clearAuthError(); }}
                                className={`flex-1 h-[52px] rounded-lg text-[12px] font-bold uppercase tracking-[0.3em] transition-all ${mode === m
                                    ? 'bg-blue-600 text-white shadow-xl'
                                    : 'text-slate-600 hover:text-slate-400'
                                    }`}
                            >
                                {m === 'signin' ? 'Sign In' : 'Sign Up'}
                            </button>
                        ))}
                    </div>

                    {/* Error Alerts */}
                    <AnimatePresence>
                        {displayError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8 bg-red-500/5 border border-red-500/20 rounded-xl p-5 flex items-center gap-5"
                            >
                                <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
                                <p className="text-red-400 text-[13px] font-bold uppercase tracking-tight leading-snug">{displayError}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {mode === 'signup' && (
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full h-[60px] bg-white/2 border border-white/10 rounded-xl px-5 text-[16px] font-bold text-white placeholder:text-slate-800 focus:border-blue-500/30 outline-none uppercase tracking-widest"
                                    placeholder="Operational Specialist"
                                />
                            </div>
                        )}

                        <div className="space-y-2.5">
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full h-[60px] bg-white/2 border border-white/10 rounded-xl px-5 text-[16px] font-bold text-white placeholder:text-slate-800 focus:border-blue-500/30 outline-none tracking-widest"
                                placeholder={isDemo ? 'Identifier (marcus/dave)' : 'registry@enterprise.com'}
                            />
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full h-[60px] bg-white/2 border border-white/10 rounded-xl px-5 text-[16px] font-bold text-white placeholder:text-slate-800 focus:border-blue-500/30 outline-none tracking-widest"
                                placeholder="••••••••"
                            />
                        </div>

                        {mode === 'signup' && (
                            <div className="space-y-4 pt-2">
                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest ml-1">Account Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {ROLE_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setRole(opt.value)}
                                            className={`flex flex-col items-center gap-3 py-5 rounded-2xl border transition-all text-[11px] font-bold uppercase tracking-widest ${role === opt.value
                                                ? 'bg-blue-600/10 border-blue-500/30 text-white'
                                                : 'bg-white/2 border-white/10 text-slate-600 hover:text-slate-400 font-bold'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-2xl">{opt.icon}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-6">
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1 mb-3 block">Shop Color Theme</label>
                            <input
                                type="text"
                                value={shopId}
                                onChange={handleShopIdChange}
                                className="w-full h-[52px] bg-black/40 border border-white/10 rounded-xl px-5 text-[14px] text-slate-500 placeholder:text-slate-800 focus:border-blue-500/20 outline-none transition-all uppercase tracking-widest font-bold"
                                placeholder="Prototype: 'Blue', 'Red'..."
                            />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-[64px] bg-blue-600 text-white font-bold rounded-xl shadow-2xl shadow-blue-900/30 transition-all text-[14px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 mt-12"
                        >
                            {isLoading ? (
                                <span className="size-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                </>
                            )}
                        </motion.button>
                    </form>

                    {isDemo && (
                        <div className="mt-10 text-center pt-8 border-t border-white/5">
                            <p className="text-[12px] text-slate-700 font-bold uppercase tracking-[0.25em] leading-relaxed opacity-60">
                                SIM_MODE: TYPE <span className="text-slate-500 italic">marcus</span> (ADMIN) OR <span className="text-slate-500 italic">dave</span> (TERMINAL)
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-center text-slate-800 text-[11px] font-bold uppercase tracking-[0.3em] mt-12 opacity-40 px-6 leading-relaxed">
                    &copy; 2026 STITCH_AUTO <br /> OPERATIONAL INFRASTRUCTURE
                </p>
            </motion.div>
        </div>
    );
};

export default LoginScreen;
