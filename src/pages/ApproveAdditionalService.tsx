import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { motion, AnimatePresence } from 'framer-motion';

const ServiceCard: React.FC<{
    item: { id: string; name: string; price: number; severity: string; icon: string; iconColor: string; description: string; impact?: string };
    isSelected: boolean;
    onToggle: () => void;
}> = ({ item, isSelected, onToggle }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="mb-4">
            <motion.button
                whileTap={{ scale: 0.98 }}
                className={`glass-card w-full p-6 transition-all text-left flex flex-col relative overflow-hidden rounded-2xl ${isSelected ? 'border-blue-500/30 bg-blue-500/[0.05]' : 'border-white/5'}`}
                onClick={onToggle}
            >
                <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-4 flex-1">
                        <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${item.severity === 'critical' ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/2 border border-white/5'}`}>
                            <span className={`material-symbols-outlined ${item.severity === 'critical' ? 'text-red-400' : 'text-slate-500'} text-2xl`}>{item.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-[17px] text-white tracking-tight leading-none truncate uppercase italic">{item.name}</h4>
                            <div className="flex items-center gap-2.5 mt-3">
                                <div className={`size-2 rounded-full ${item.severity === 'critical' ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]' : 'bg-slate-500'}`} />
                                <p className="text-[11px] text-slate-600 font-bold uppercase tracking-[0.2em]">{item.severity}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0 ml-4">
                        <span className="font-bold text-white text-[16px] tracking-tight tabular-nums">${item.price.toFixed(2)}</span>
                        <div className={`size-6 rounded-lg border transition-all flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/2 border-white/10'}`}>
                            {isSelected && <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>}
                        </div>
                    </div>
                </div>
            </motion.button>

            {/* Impact Analysis Trigger */}
            <div className="px-2 mt-2">
                <button
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                    className="flex items-center gap-3 px-3 h-10 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-blue-400 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">{expanded ? 'keyboard_arrow_up' : 'analytics'}</span>
                    {expanded ? 'Collapse Evaluation' : 'Module Evaluation'}
                </button>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-white/2 border border-white/5 rounded-2xl mt-2 overflow-hidden shadow-inner"
                        >
                            <div className="p-6 space-y-5">
                                <p className="text-[13px] text-slate-400 leading-relaxed font-bold italic opacity-80">
                                    "{item.description}"
                                </p>
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                                    <div className="flex gap-2">
                                        <span className="text-[9px] font-bold text-slate-600 bg-white/2 px-3 py-1.5 rounded border border-white/5 uppercase tracking-widest">Operational Safety</span>
                                        <span className="text-[9px] font-bold text-slate-600 bg-white/2 px-3 py-1.5 rounded border border-white/5 uppercase tracking-widest">Longevity</span>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${item.severity === 'critical' ? 'text-red-400' : 'text-slate-500'}`}>
                                        {item.severity === 'critical' ? 'Immediate Priority' : 'Routine Cycle'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ApproveAdditionalService: React.FC = () => {
    const navigate = useNavigate();
    const { serviceItems, selectedServiceIds, toggleService, approveServices, showToast } = useAppContext();

    const selectedTotal = serviceItems.filter((item) => selectedServiceIds.has(item.id)).reduce((sum, item) => sum + item.price, 0);
    const totalProposal = serviceItems.reduce((sum, item) => sum + item.price, 0);
    const savings = totalProposal - selectedTotal;

    const handleApprove = () => {
        approveServices();
        navigate('/checkout');
    };

    const REJECT_PRESETS = [
        'Fiscal Allocation Required',
        'Physical Verification Necessary',
        'Self-Maintenance Protocol',
        'Deferred Priority',
    ];
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectCustom, setRejectCustom] = useState('');

    const handleRejectConfirm = () => {
        const reason = rejectCustom.trim() || rejectReason;
        showToast(reason ? `Action Logged: "${reason}"` : 'Actions Deferred');
        setShowRejectModal(false);
        navigate(-1);
    };

    return (
        <div className="bg-[#0a0a0c] font-sans text-slate-300 min-h-screen flex flex-col relative pb-64">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0a0a0c] border-b border-white/5 safe-top">
                <div className="flex items-center px-6 py-6">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center size-12 rounded-xl bg-white/2 border border-white/5 text-slate-500 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </motion.button>
                    <div className="flex-1 text-center px-4">
                        <h1 className="text-[15px] font-bold tracking-[0.2em] text-white uppercase leading-tight">Operational Authorization</h1>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => showToast('Estimates include verified parts & labor registries')}
                        className="flex items-center justify-center size-12 rounded-xl bg-white/2 text-slate-500 border border-white/5"
                    >
                        <span className="material-symbols-outlined text-2xl">info</span>
                    </motion.button>
                </div>

                {/* Progress Stepper */}
                <div className="flex px-10 pb-8 justify-center">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="size-8 rounded-xl bg-blue-600 flex items-center justify-center text-[13px] font-black text-white shadow-lg shadow-blue-900/40">01</div>
                            <span className="text-[12px] font-black uppercase tracking-[0.15em] text-blue-500 italic">Review</span>
                        </div>
                        <div className="w-12 h-[1px] bg-white/10" />
                        <div className="flex items-center gap-4 opacity-30">
                            <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center text-[13px] font-black text-slate-600">02</div>
                            <span className="text-[12px] font-black uppercase tracking-[0.15em] text-slate-600 italic">Settlement</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="page-container relative z-10 space-y-10 mt-6 px-6">
                {/* Summary Card */}
                <section>
                    <div className="glass-card p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] shadow-2xl">
                        <div className="flex items-center gap-5 mb-6">
                            <div className="size-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
                                <span className="material-symbols-outlined text-blue-400 text-3xl">contract_edit</span>
                            </div>
                            <div>
                                <h2 className="font-black text-white text-[17px] uppercase tracking-tight">Workload Proposal</h2>
                                <p className="text-[11px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-2">Ref: Diagnostic Cycle #TR-882</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <p className="text-[15px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight opacity-90 italic">
                                Comprehensive module analysis complete. Select required operational items to proceed with session finalization.
                            </p>
                            {savings > 0 && (
                                <div className="flex items-center gap-4 text-emerald-500 font-black text-[12px] uppercase tracking-[0.1em] bg-emerald-500/[0.03] px-5 py-4 rounded-xl border border-emerald-500/10 shadow-inner">
                                    <span className="material-symbols-outlined text-[24px]">payments</span>
                                    Deferred Savings: ${savings.toFixed(2)}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Estimate Summary Grids */}
                <section className="grid grid-cols-2 gap-5">
                    <div className="glass-card px-6 py-6 rounded-[1.5rem] bg-white/[0.02]">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Total Proposal</span>
                        <span className="text-[17px] font-black text-slate-500 tabular-nums">
                            ${totalProposal.toFixed(2)}
                        </span>
                    </div>
                    <div className="glass-card px-6 py-6 border-blue-500/30 bg-blue-500/[0.05] rounded-[1.5rem] shadow-xl shadow-blue-900/10">
                        <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest block mb-2">Authorized</span>
                        <span className="text-[24px] font-black text-white tabular-nums leading-none">
                            ${selectedTotal.toFixed(2)}
                        </span>
                    </div>
                </section>

                {/* Critical Items Section */}
                <section className="pt-2">
                    <h3 className="text-[13px] font-black uppercase tracking-[0.25em] text-slate-500 px-1 mb-6 flex items-center gap-4">
                        <div className="size-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        Priority Failures
                    </h3>
                    <div className="space-y-4">
                        {serviceItems
                            .filter((item) => item.severity === 'critical')
                            .map((item) => (
                                <ServiceCard key={item.id} item={item} isSelected={selectedServiceIds.has(item.id)} onToggle={() => toggleService(item.id)} />
                            ))}
                    </div>
                </section>

                {/* Recommended Items Section */}
                <section className="pt-2">
                    <h3 className="text-[13px] font-black uppercase tracking-[0.25em] text-slate-500 px-1 mb-6 flex items-center gap-4">
                        <div className="size-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        Maintenance Cycles
                    </h3>
                    <div className="space-y-4">
                        {serviceItems
                            .filter((item) => item.severity === 'recommended')
                            .map((item) => (
                                <ServiceCard key={item.id} item={item} isSelected={selectedServiceIds.has(item.id)} onToggle={() => toggleService(item.id)} />
                            ))}
                    </div>
                </section>

                {/* Trust Registry */}
                <section className="grid grid-cols-3 gap-6 px-4 py-12 mt-4 border-t border-white/5 opacity-50">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <span className="material-symbols-outlined text-slate-500 text-3xl">verified</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 leading-tight">Cert.<br />Terminal</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 text-center">
                        <span className="material-symbols-outlined text-slate-500 text-3xl">history_edu</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 leading-tight">12mo<br />Warranty</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 text-center">
                        <span className="material-symbols-outlined text-slate-500 text-3xl">speed</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 leading-tight">Priority<br />Flow</span>
                    </div>
                </section>
            </main>

            {/* Persistent Action Bar */}
            <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-2xl border-t border-white/5 px-2">
                <div className="max-w-md mx-auto px-8 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
                    <div className="flex items-center justify-between mb-10 px-1">
                        <div>
                            <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-slate-600">Authorized Allocation</p>
                            <p className="text-[36px] font-black text-white mt-1.5 tracking-tighter tabular-nums leading-none">${selectedTotal.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-slate-600">Target Scale</p>
                            <p className="text-[13px] font-black text-blue-500 mt-2 uppercase tracking-widest leading-none">
                                {selectedServiceIds.size} / {serviceItems.length} Registry Units
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-5">
                        <motion.button
                            onClick={() => setShowRejectModal(true)}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 h-[64px] bg-white/2 border border-white/5 rounded-2xl text-slate-500 font-black text-[13px] uppercase tracking-widest shadow-xl"
                        >
                            Defer
                        </motion.button>
                        <motion.button
                            onClick={handleApprove}
                            whileTap={{ scale: 0.95 }}
                            className="flex-[2.2] h-[64px] bg-blue-600 text-white font-black text-[13px] uppercase tracking-[0.2em] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] shadow-blue-900/40 border border-blue-500/20"
                        >
                            Log Authorization
                        </motion.button>
                    </div>
                </div>
            </footer>

            {/* Override Modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center px-6 pb-12 pt-24">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRejectModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="glass-card relative w-full max-w-sm border border-white/10 rounded-[2.5rem] p-10 space-y-8 bg-[#121214] shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-[17px] font-black text-white uppercase tracking-[0.25em]">Override</h2>
                                <button onClick={() => setShowRejectModal(false)} className="size-12 rounded-xl bg-white/2 flex items-center justify-center text-slate-600 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-3xl">close</span>
                                </button>
                            </div>
                            <p className="text-[13px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed px-1">Specify justification for operational deferment:</p>

                            <div className="space-y-4">
                                {REJECT_PRESETS.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => { setRejectReason(p); setRejectCustom(''); }}
                                        className={`w-full text-left px-6 h-[64px] rounded-2xl border-2 text-[12px] font-black uppercase tracking-[0.15em] transition-all ${rejectReason === p
                                            ? 'border-blue-600 bg-blue-600/10 text-white shadow-lg shadow-blue-600/10'
                                            : 'border-white/5 text-slate-700 bg-white/2 hover:border-white/10'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            <input
                                className="w-full h-[64px] bg-[#0a0a0c] border border-white/10 rounded-2xl px-6 text-[14px] font-bold uppercase tracking-widest text-white placeholder-slate-900 focus:outline-none focus:border-blue-500/40 shadow-inner"
                                placeholder="Specify Alternate Protocol..."
                                value={rejectCustom}
                                onChange={e => { setRejectCustom(e.target.value); setRejectReason(''); }}
                            />

                            <button
                                onClick={handleRejectConfirm}
                                className="w-full h-[72px] rounded-2xl bg-red-600 text-white font-black text-[15px] uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(220,38,38,0.3)] border border-red-500/20 mt-6"
                            >
                                Confirm Deferment
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ApproveAdditionalService;
