import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/useAppContext';
import { shopService } from '../services/shopService';

const S_PaymentSettings: React.FC = () => {
    const { shopTheme, setShopTheme, showToast } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [activeShopId] = useState(localStorage.getItem('activeShopId') ?? 'SHOP-01');

    // Local state for form simplicity
    const [stripeAccountId, setStripeAccountId] = useState(shopTheme.stripeAccountId ?? '');
    const [platformFee, setPlatformFee] = useState(shopTheme.platformFeePercent ?? 1.0);
    const [isTestMode, setIsTestMode] = useState(shopTheme.isTestMode ?? true);
    const [isOnboarding, setIsOnboarding] = useState(shopTheme.stripeOnboardingComplete ?? false);


    const handleSave = async () => {
        try {
            setIsLoading(true);
            await shopService.updateShopSettings(activeShopId, {
                stripeAccountId,
                platformFeePercent: platformFee,
                isTestMode,
                stripeOnboardingComplete: isOnboarding
            });

            setShopTheme({
                ...shopTheme,
                stripeAccountId,
                platformFeePercent: platformFee,
                isTestMode,
                stripeOnboardingComplete: isOnboarding
            });

            showToast('Payment infrastructure updated');
        } catch (err) {
            console.error('Update failed:', err);
            showToast('Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnectStripe = () => {
        showToast('Redirecting to Stripe Connect...');
        // In a real app, this would redirect to Stripe OAuth
        setTimeout(() => {
            setIsOnboarding(true);
            setStripeAccountId('acct_mock_' + Math.floor(Math.random() * 1000000));
            showToast('Stripe Account Linked (Mock)');
        }, 1500);
    };

    return (
        <div className="bg-[#0a0a0c] min-h-screen text-slate-300 pb-20">
            <header className="px-8 py-10 border-b border-white/5">
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                    <div>
                        <h1 className="text-[22px] font-black text-white uppercase tracking-[0.2em]">Fiscal Infrastructure</h1>
                        <p className="text-[12px] font-bold text-slate-600 uppercase tracking-[.3em] mt-3">Stripe Connect & Settlement Configuration</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-1.5 rounded-full border ${isTestMode ? 'border-amber-500/20 bg-amber-500/5 text-amber-500' : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500'} text-[10px] font-black uppercase tracking-widest`}>
                            {isTestMode ? 'Testing Environment' : 'Production Active'}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-12 space-y-10">
                {/* Connection Status */}
                <section className="glass-card rounded-[2.5rem] p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="flex items-center gap-8">
                            <div className={`size-20 rounded-[1.75rem] flex items-center justify-center shadow-2xl ${isOnboarding ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                <span className="material-symbols-outlined text-4xl">{isOnboarding ? 'verified' : 'account_balance'}</span>
                            </div>
                            <div>
                                <h3 className="text-[17px] font-black text-white uppercase tracking-wider">
                                    {isOnboarding ? 'Merchant Account Active' : 'Connect Settlement Provider'}
                                </h3>
                                <p className="text-slate-500 text-[13px] mt-2 font-medium">
                                    {isOnboarding
                                        ? `Connected to Stripe: ${stripeAccountId}`
                                        : 'Link your business bank account to start receiving payments.'}
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={isOnboarding ? undefined : handleConnectStripe}
                            className={`h-[64px] px-10 rounded-2xl font-black text-[13px] uppercase tracking-[.2em] transition-all
                                ${isOnboarding
                                    ? 'bg-white/5 text-slate-500 cursor-default border border-white/5'
                                    : 'bg-primary text-white shadow-2xl shadow-primary/30 border border-primary/20'}`}
                        >
                            {isOnboarding ? 'Account Integrated' : 'Connect with Stripe'}
                        </motion.button>
                    </div>
                </section>

                <div className="grid md:grid-cols-2 gap-10">
                    {/* Platform Fee Control */}
                    <section className="glass-card rounded-[2.5rem] p-10 space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400">percent</span>
                            </div>
                            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-[.25em]">Application Overhead</h3>
                        </div>
                        <div className="space-y-6">
                            <label htmlFor="platformFee" className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Platform Service Fee (%)</label>
                            <div className="relative">
                                <input
                                    id="platformFee"
                                    type="number"
                                    step="0.1"
                                    value={platformFee}
                                    onChange={(e) => setPlatformFee(parseFloat(e.target.value))}
                                    className="w-full h-[72px] bg-[#0a0a0c] border border-white/10 rounded-2xl px-8 text-white text-[20px] font-black focus:border-primary/40 outline-none tabular-nums shadow-inner"
                                />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-600 font-bold">%</span>
                            </div>
                            <p className="text-[11px] text-slate-700 font-medium leading-relaxed px-1 italic">
                                Note: 1% is the standard platform fee. Adjusting this affects your net payout per transaction.
                            </p>
                        </div>
                    </section>

                    {/* Environment Toggle */}
                    <section className="glass-card rounded-[2.5rem] p-10 space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400">Science</span>
                            </div>
                            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-[.25em]">Security Protocol</h3>
                        </div>
                        <div className="space-y-6">
                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Financial Mode</label>
                            <div className="flex p-2 bg-[#0a0a0c] rounded-2xl border border-white/10">
                                <button
                                    onClick={() => setIsTestMode(true)}
                                    className={`flex-1 h-[56px] rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${isTestMode ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-700 hover:text-slate-400'}`}
                                >
                                    Test Phase
                                </button>
                                <button
                                    onClick={() => setIsTestMode(false)}
                                    className={`flex-1 h-[56px] rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${!isTestMode ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-700 hover:text-slate-400'}`}
                                >
                                    Live Registry
                                </button>
                            </div>
                            <p className="text-[11px] text-slate-700 font-medium leading-relaxed px-1">
                                {isTestMode
                                    ? 'Using Stripe Test keys. No real card authorization will occur.'
                                    : 'Production keys enabled. Real financial assets will be settled.'}
                            </p>
                        </div>
                    </section>
                </div>

                {/* Account Details */}
                <section className="glass-card rounded-[2.5rem] p-10 space-y-10">
                    <div className="flex items-center gap-5">
                        <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-400">dns</span>
                        </div>
                        <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-[.25em]">System Metadata</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label htmlFor="stripeAccountId" className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Connect ID</label>
                            <input
                                id="stripeAccountId"
                                type="text"
                                readOnly
                                value={stripeAccountId || 'AWAITING_INITIALIZATION'}
                                className="w-full h-[64px] bg-white/2 border border-white/5 rounded-2xl px-6 text-[13px] text-slate-500 font-bold outline-none tabular-nums cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Settlement Interval</label>
                            <div className="h-[64px] bg-white/2 border border-white/5 rounded-2xl px-6 flex items-center">
                                <span className="text-[13px] text-slate-500 font-bold uppercase tracking-widest">T+3 (Standard Business)</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-10">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={(...args) => { void handleSave(...args); }}
                        disabled={isLoading}
                        className={`h-[72px] px-16 rounded-2xl font-black text-[14px] uppercase tracking-[0.3em] transition-all shadow-2xl
                            ${isLoading
                                ? 'bg-white/5 text-slate-700 cursor-not-allowed'
                                : 'bg-white text-black shadow-white/10 hover:bg-slate-200'}`}
                    >
                        {isLoading ? 'Encrypting...' : 'Commit Settings'}
                    </motion.button>
                </div>
            </main>
        </div>
    );
};

export default S_PaymentSettings;
