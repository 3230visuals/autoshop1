import React, { useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../../context/AppContextCore';
import type { Referral } from '../../context/AppTypes';

const C_Referrals: React.FC = () => {
    const ctx = use(AppContext)!;
    const { referralCode, referrals, addReferral, referralRewardPoints, showToast } = ctx;
    const shopId = ctx.currentUser?.shopId ?? '';

    const [showAddForm, setShowAddForm] = useState(false);
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [codeCopied, setCodeCopied] = useState(false);

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(referralCode);
            setCodeCopied(true);
            showToast('Referral code copied!');
            setTimeout(() => setCodeCopied(false), 2000);
        } catch {
            showToast('Could not copy code');
        }
    };

    const handleShareCode = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join me at the shop!',
                    text: `Use my referral code ${referralCode} to get started! 🚗`,
                });
            } catch { /* user cancelled */ }
        } else {
            void handleCopyCode();
        }
    };

    const handleAddReferral = () => {
        if (!formName.trim()) return;
        addReferral({ name: formName.trim(), email: formEmail.trim() || undefined, shopId });
        showToast(`Referral sent to ${formName.trim()}`);
        setFormName('');
        setFormEmail('');
        setShowAddForm(false);
    };

    const statusBadge = (status: Referral['status']) => {
        const map = {
            pending: { label: 'Pending', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
            visited: { label: 'Visited', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
            converted: { label: 'Converted', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
        };
        const { label, cls } = map[status];
        return (
            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${cls}`}>
                {label}
            </span>
        );
    };

    const totalConverted = referrals.filter(r => r.status === 'converted').length;

    return (
        <div className="min-h-screen">
            <header className="px-6 pt-8 pb-10 bg-client-hero-01 relative overflow-hidden safe-top text-center">
                <div className="hero-overlay absolute inset-0 z-10" />
                <div className="relative z-20 text-center">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Referrals</h1>
                    <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.4em] mt-2">Share & Earn Rewards</p>
                </div>
            </header>

            <div className="p-6 -mt-8 relative z-30 space-y-5">

                {/* ── Referral Code Card ── */}
                <div className="glass-surface rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-11 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                                <span className="material-symbols-outlined text-primary">loyalty</span>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Your Code</h3>
                                <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest">Share to earn rewards</p>
                            </div>
                        </div>

                        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between mb-4">
                            <span className="text-2xl font-black text-primary tracking-[0.3em] font-mono">{referralCode}</span>
                            <motion.button
                                whileTap={{ scale: 0.92 }}
                                onClick={() => { void handleCopyCode(); }}
                                className="glass-pill-btn h-10 px-4 text-[9px] border-primary/30 text-primary hover:bg-primary hover:text-white"
                            >
                                <span className="material-symbols-outlined text-sm">{codeCopied ? 'check' : 'content_copy'}</span>
                                {codeCopied ? 'Copied!' : 'Copy'}
                            </motion.button>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => { void handleShareCode(); }}
                            className="w-full h-12 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center gap-2 text-primary hover:bg-primary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            <span className="material-symbols-outlined text-lg">share</span>
                            Share with Friends
                        </motion.button>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="glass-surface rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-white">{referrals.length}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Sent</p>
                    </div>
                    <div className="glass-surface rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-emerald-400">{totalConverted}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Converted</p>
                    </div>
                    <div className="glass-surface rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-amber-400">{referralRewardPoints}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Points</p>
                    </div>
                </div>

                {/* ── Add Referral Button / Form ── */}
                <AnimatePresence mode="wait">
                    {showAddForm ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass-surface rounded-2xl p-5 shadow-xl space-y-4"
                        >
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Refer a Friend</h4>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Friend's name *"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-primary/40 outline-none"
                                />
                                <input
                                    type="email"
                                    placeholder="Email (optional)"
                                    value={formEmail}
                                    onChange={(e) => setFormEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-primary/40 outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 h-11 glass-pill-btn text-[9px] text-slate-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddReferral}
                                    disabled={!formName.trim()}
                                    className="flex-1 h-11 glass-pill-btn text-[9px] bg-primary/20 border-primary/40 text-primary hover:bg-primary hover:text-white disabled:opacity-40"
                                >
                                    Send Referral
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="add-btn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setShowAddForm(true)}
                            className="w-full h-14 glass-surface rounded-2xl flex items-center justify-center gap-3 text-primary hover:bg-primary/10 transition-all border border-primary/20"
                        >
                            <span className="material-symbols-outlined">person_add</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Refer a Friend</span>
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* ── Referral List ── */}
                <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1">Your Referrals</h3>

                    {referrals.length === 0 ? (
                        <div className="glass-surface rounded-2xl p-8 text-center">
                            <span className="material-symbols-outlined text-3xl text-slate-700 mb-3 block">people</span>
                            <p className="text-sm text-slate-500 font-medium">No referrals yet</p>
                            <p className="text-[10px] text-slate-700 uppercase tracking-wider mt-2">
                                Share your code and earn {150} points per signup!
                            </p>
                        </div>
                    ) : (
                        referrals
                            .sort((a, b) => b.referredAt - a.referredAt)
                            .map((ref) => (
                                <motion.div
                                    key={ref.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-surface rounded-2xl p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                            <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-200">{ref.name}</p>
                                            <p className="text-[9px] text-slate-600 font-medium mt-0.5">
                                                {new Date(ref.referredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                {ref.email ? ` • ${ref.email}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {ref.status === 'converted' && (
                                            <span className="text-[9px] font-black text-emerald-400">+{ref.reward ?? 150}pts</span>
                                        )}
                                        {statusBadge(ref.status)}
                                    </div>
                                </motion.div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default C_Referrals;
