import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { motion } from 'framer-motion';

const S_Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Small delay for premium feel, then authenticate
        setTimeout(() => {
            const doLogin = async () => {
                if (pin === '1111') {
                    await login('owner@shop.com', pin, 'staff');
                    void navigate('/s/board');
                } else if (pin === '2222') {
                    await login('staff@shop.com', pin, 'staff');
                    void navigate('/s/board');
                } else {
                    setError('Invalid PIN. Access denied.');
                    setPin('');
                    setIsLoading(false);
                }
            };
            void doLogin();
        }, 800);
    };

    // Visual PIN dots
    const pinDots = Array.from({ length: 4 }).map((_, i) => (
        <motion.div
            key={`dot-${i}`}
            initial={false}
            animate={{
                scale: i < pin.length ? 1 : 0.6,
                backgroundColor: i < pin.length ? '#F97316' : 'rgba(255,255,255,0.05)',
                borderColor: i < pin.length ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="size-4 rounded-full border"
        />
    ));

    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0c] flex items-center justify-center p-6 overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/8 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-orange-500/3 blur-[100px] rounded-full" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
            }} />

            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-sm relative z-10"
            >
                {/* Logo + Branding */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="inline-flex items-center justify-center mb-6"
                    >
                        <div className="relative">
                            <div
                                className="size-20 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%)',
                                    border: '1px solid rgba(249,115,22,0.2)',
                                    boxShadow: '0 0 60px rgba(249,115,22,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
                                }}
                            >
                                <span
                                    className="material-symbols-outlined text-orange-400"
                                    style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1, 'wght' 600" }}
                                >
                                    precision_manufacturing
                                </span>
                            </div>
                            <div
                                className="absolute -inset-1 rounded-2xl border border-orange-500/10 animate-ping"
                                style={{ animationDuration: '3s' }}
                            />
                        </div>
                    </motion.div>

                    <h1
                        className="text-2xl font-black uppercase tracking-[0.15em] bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        SERVICEBAY
                    </h1>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-orange-500/30" />
                        <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.35em]">Staff Portal</p>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-orange-500/30" />
                    </div>
                </div>

                {/* Login Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="glass-card border border-white/5 p-6 rounded-3xl"
                >
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-orange-400/60 uppercase tracking-[0.25em]">Work PIN</label>
                                <div className="flex items-center gap-1.5">
                                    <div className="size-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                                    <span className="text-[8px] font-bold text-green-500/60 uppercase tracking-wider">Secure</span>
                                </div>
                            </div>
                            <input
                                type="password"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                className={`w-full h-20 bg-white/[0.03] border ${error ? 'border-red-500/50 shake-x' : 'border-white/8'} rounded-2xl px-6 text-center text-3xl text-white font-black tracking-[1em] focus:border-orange-500/40 outline-none transition-all placeholder:text-slate-800`}
                                placeholder="••••"
                                autoFocus
                            />

                            {/* Visual PIN dots */}
                            <div className="flex items-center justify-center gap-3 py-2">
                                {pinDots}
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ y: -5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-red-400 text-[10px] font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {error}
                                </motion.p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={pin.length < 4 || isLoading}
                            className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black rounded-2xl shadow-lg shadow-orange-500/20 text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-[0.97] transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-[10px] font-medium text-white/20 inline-block mr-1">New workshop?</p>
                            <Link to="/s/signup" className="text-[10px] font-black uppercase tracking-widest text-orange-500/80 hover:text-orange-400 transition-colors">
                                Create account
                            </Link>
                        </div>
                    </form>
                </motion.div>

                {/* Footer */}
                <div className="mt-10 text-center space-y-3">
                    <div className="flex items-center justify-center gap-4 opacity-30">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-xs text-slate-500">encrypted</span>
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">256-bit</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-xs text-slate-500">verified_user</span>
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">Secured</span>
                        </div>
                    </div>
                    <p className="text-slate-800 text-[8px] font-bold uppercase tracking-[0.3em]">
                        &copy; 2026 SERVICEBAY
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default S_Login;
