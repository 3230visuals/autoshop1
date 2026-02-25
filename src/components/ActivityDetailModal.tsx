import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import type { ServiceStatus } from '../context/AppTypes';
import { motion } from 'framer-motion';

export interface ActivityDetail {
    id: string;
    title: string;
    subtitle: string;
    type: 'job' | 'history' | 'payment';
    date?: string;
    mechanic?: string;
    status?: ServiceStatus;
    services: { name: string; price: number }[];
    financials?: {
        subtotal: number;
        tax: number;
        tip?: number;
        total: number;
        method?: string;
    };
    progress?: number;
    notes?: string;
}

interface ActivityDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    detail: ActivityDetail | null;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ isOpen, onClose, detail }) => {
    const navigate = useNavigate();
    const { updateJob } = useAppContext();
    if (!isOpen || !detail) return null;

    const handleMessage = () => {
        onClose();
        navigate('/messages');
    };

    const handleStatusChange = (newStatus: ServiceStatus) => {
        if (detail.type === 'job') {
            updateJob(detail.id, { status: newStatus });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background-dark border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-20 duration-300">
                {/* Header */}
                <div className="relative h-28 bg-primary/10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background-dark"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 size-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 z-10 hover:bg-black/60 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="absolute bottom-4 left-6 flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 border border-white/20 text-background-dark">
                            <span className="material-symbols-outlined text-[32px]">
                                {detail.type === 'payment' ? 'payments' : 'directions_car'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white leading-tight">{detail.title}</h2>
                            <p className="text-primary font-bold text-xs uppercase tracking-wider">{detail.subtitle}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Status & Meta */}
                    <div className="flex flex-wrap gap-2">
                        {detail.status && (
                            <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                {detail.status.replace('_', ' ')}
                            </span>
                        )}
                        {detail.date && (
                            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold">
                                {detail.date}
                            </span>
                        )}
                        {detail.mechanic && (
                            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">engineering</span>
                                {detail.mechanic}
                            </span>
                        )}
                    </div>

                    {/* Progress Bar (if available) */}
                    {detail.progress !== undefined && (
                        <section className="space-y-3 p-4 rounded-2xl bg-white/3 border border-white/5">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                                <span>Service Progress</span>
                                <span className="text-primary">{detail.progress}%</span>
                            </div>
                            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-[#ff9f43] transition-all duration-1000 ease-out orange-glow"
                                    style={{ width: `${detail.progress}%` }}
                                ></div>
                            </div>
                        </section>
                    )}

                    {/* Services / Items */}
                    <section>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 px-1">Work Details</h3>
                        <div className="grid gap-2">
                            {detail.services.map((s, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/3 border border-white/5">
                                    <span className="text-sm font-bold text-slate-200">{s.name}</span>
                                    <span className="text-sm font-bold text-primary">${s.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Financials (Invoice Info) */}
                    {detail.financials && (
                        <section className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Invoice Info</h3>
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Subtotal</span>
                                <span>${detail.financials.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Tax</span>
                                <span>${detail.financials.tax.toFixed(2)}</span>
                            </div>
                            {detail.financials.tip !== undefined && detail.financials.tip > 0 && (
                                <div className="flex justify-between text-xs text-green-400">
                                    <span>Tip</span>
                                    <span>+${detail.financials.tip.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/5">
                                <span>Total Amount</span>
                                <span className="text-primary">${detail.financials.total.toFixed(2)}</span>
                            </div>
                            {detail.financials.method && (
                                <p className="text-[10px] text-slate-500 text-right italic mt-1">
                                    Paid via {detail.financials.method}
                                </p>
                            )}
                        </section>
                    )}

                    {/* Status Update (Shop Control) */}
                    {detail.type === 'job' && (
                        <section className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Update Status</h3>
                            <div className="flex flex-wrap gap-2">
                                {(['waiting', 'in_progress', 'ready', 'done'] as ServiceStatus[]).map((s) => (
                                    <motion.button
                                        key={s}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleStatusChange(s)}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${detail.status === s
                                            ? 'bg-primary border-primary text-background-dark shadow-lg shadow-primary/20'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                            }`}
                                    >
                                        {s.replace('_', ' ')}
                                    </motion.button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Notes */}
                    {detail.notes && (
                        <section className="p-4 rounded-2xl bg-primary/5 border border-primary/10 italic text-xs text-slate-400 leading-relaxed">
                            "{detail.notes}"
                        </section>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleMessage}
                            className="flex-1 py-4 rounded-2xl bg-primary text-background-dark font-black text-sm active:scale-[0.98] transition-all border border-primary/20 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">chat</span>
                            Message
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black text-sm active:scale-[0.98] transition-all border border-white/10"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityDetailModal;
