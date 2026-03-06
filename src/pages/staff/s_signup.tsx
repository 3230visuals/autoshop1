import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { shopService } from '../../services/shopService';
import { motion, AnimatePresence } from 'framer-motion';

const S_Signup: React.FC = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        shopName: ''
    });
    const [tempUserId, setTempUserId] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. Auth Signup
            const newUser = await signup(formData.email, formData.password, formData.name, 'OWNER');

            if (newUser?.id) {
                setTempUserId(newUser.id);
                setStep(2);
            } else {
                throw new Error('Signup succeeded but no user returned. Check email for verification.');
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Signup failed';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateShop = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const effectiveUserId = tempUserId;
            if (!effectiveUserId) {
                throw new Error('User session not found. Please try again.');
            }

            await shopService.createShop(effectiveUserId, formData.shopName);
            void navigate('/s/board');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Shop creation failed';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0c] flex items-center justify-center p-6 overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-sm relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black uppercase tracking-[0.15em] text-white">
                        {step === 1 ? 'Owner Registration' : 'Create Your Shop'}
                    </h1>
                    <p className="text-[10px] text-white/40 mt-2 uppercase tracking-[0.2em]">
                        {step === 1 ? 'Step 1: Your Account' : 'Step 2: Business Profile'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="glass-card border border-white/5 p-6 rounded-3xl"
                        >
                            <form onSubmit={(e) => void handleSignup(e)} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full h-12 bg-white/[0.03] border border-white/8 rounded-xl px-4 text-white focus:border-indigo-500/40 outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full h-12 bg-white/[0.03] border border-white/8 rounded-xl px-4 text-white focus:border-indigo-500/40 outline-none transition-all"
                                        placeholder="owner@example.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full h-12 bg-white/[0.03] border border-white/8 rounded-xl px-4 text-white focus:border-indigo-500/40 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {error && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-[0.97] transition-all"
                                >
                                    {isLoading ? 'Processing...' : 'Next Step'}
                                </button>

                                <div className="text-center mt-4">
                                    <Link to="/s/login" className="text-[10px] font-bold text-white/30 uppercase tracking-wider hover:text-white transition-colors">
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="glass-card border border-white/5 p-6 rounded-3xl"
                        >
                            <form onSubmit={(e) => void handleCreateShop(e)} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Shop Name</label>
                                    <input
                                        type="text"
                                        name="shopName"
                                        required
                                        autoFocus
                                        value={formData.shopName}
                                        onChange={handleChange}
                                        className="w-full h-14 bg-white/[0.03] border border-white/8 rounded-xl px-4 text-lg text-white font-bold focus:border-indigo-500/40 outline-none transition-all"
                                        placeholder="Elite Auto Repair"
                                    />
                                </div>

                                {error && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-[0.97] transition-all"
                                >
                                    {isLoading ? 'Creating Workshop...' : 'Finish Setup'}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default S_Signup;
