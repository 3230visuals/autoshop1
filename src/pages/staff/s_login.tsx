import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const S_Login: React.FC = () => {
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (pin === '1111') {
            // Owner Login
            localStorage.setItem('staffAuth', 'true');
            localStorage.setItem('activeShopId', 'SHOP-001');
            localStorage.setItem('staffRole', 'owner');
            navigate('/s/board');
        } else if (pin === '2222') {
            // Staff Login
            localStorage.setItem('staffAuth', 'true');
            localStorage.setItem('activeShopId', 'SHOP-001');
            localStorage.setItem('staffRole', 'staff');
            navigate('/s/board');
        } else {
            setError('Invalid PIN. Terminal access denied.');
            setPin('');
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0c] flex items-center justify-center p-6">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-sm relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center size-20 bg-primary/10 rounded-3xl border border-white/5 mb-8 shadow-2xl backdrop-blur-xl">
                        <span className="material-symbols-outlined text-primary text-5xl font-bold">person</span>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Staff Login</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-4">Houston North • Staff Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] ml-1">Work PIN</label>
                        <input
                            type="password"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            className={`w-full h-20 bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-3xl px-6 text-center text-3xl text-white font-black tracking-[1em] focus:border-primary/40 outline-none transition-all placeholder:text-slate-800`}
                            placeholder="••••"
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center mt-2 animate-pulse">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={pin.length < 4}
                        className="w-full h-16 bg-primary disabled:bg-slate-800 disabled:text-slate-500 text-white font-black rounded-2xl shadow-2xl shadow-primary/40 text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 mt-8 active:scale-95 transition-all"
                    >
                        <span>Sign In</span>
                        <span className="material-symbols-outlined text-xl">login</span>
                    </button>
                </form>

                <p className="text-center text-slate-800 text-[8px] font-bold uppercase tracking-[0.4em] mt-24 opacity-40">
                    &copy; 2026 STITCH_AUTO SYSTEMS
                </p>
            </div>
        </div>
    );
};

export default S_Login;
