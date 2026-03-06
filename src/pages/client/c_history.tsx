import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import { useJobs } from '../../context/useJobs';
import { serviceHistoryService } from '../../services/serviceHistoryService';
import type { TimelineEntry } from '../../services/serviceHistoryService';

const C_History: React.FC = () => {
    const { clientUser } = useAuth();
    const { jobs } = useJobs();

    const clientId = clientUser?.id ?? localStorage.getItem('activeClientId') ?? 'u4';
    const shopId = clientUser?.shopId ?? localStorage.getItem('activeShopId') ?? 'SHOP-01';

    const timeline = useMemo(
        () => serviceHistoryService.getTimeline(clientId, shopId, jobs),
        [clientId, shopId, jobs]
    );
    const stats = useMemo(() => serviceHistoryService.getStats(timeline), [timeline]);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatCurrency = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <header className="px-6 pt-8 pb-10 bg-client-hero-01 relative overflow-hidden safe-top text-center">
                <div className="hero-overlay absolute inset-0 z-10" />
                <div className="relative z-20 text-center">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">History</h1>
                    <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.4em] mt-2">Service Timeline</p>
                </div>
            </header>

            <div className="p-6 -mt-8 relative z-30 space-y-5">

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="glass-surface rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-white">{stats.totalVisits}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Visits</p>
                    </div>
                    <div className="glass-surface rounded-2xl p-4 text-center">
                        <p className="text-lg font-black text-emerald-400">{formatCurrency(stats.totalSpent)}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Spent</p>
                    </div>
                    <div className="glass-surface rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-primary">{stats.vehicleCount}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Vehicles</p>
                    </div>
                </div>

                {/* Timeline */}
                {timeline.length === 0 ? (
                    <div className="glass-surface rounded-2xl p-8 text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-700 mb-3 block">history</span>
                        <p className="text-sm text-slate-500 font-medium">No service history yet</p>
                        <p className="text-[10px] text-slate-700 uppercase tracking-wider mt-2">
                            Your completed services will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-[18px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

                        <div className="space-y-4">
                            {timeline.map((entry: TimelineEntry, idx: number) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.06 }}
                                    className="relative pl-12"
                                >
                                    {/* Dot */}
                                    <div className={`absolute left-[12px] top-5 size-3 rounded-full border-2 ${entry.status === 'warranty'
                                        ? 'bg-amber-500 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                        : 'bg-primary border-primary/80 shadow-[0_0_8px_var(--primary-muted)]'
                                        }`} />

                                    <div className="glass-surface rounded-2xl p-4 shadow-lg">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white leading-tight">{entry.title}</h4>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                    {entry.vehicle}
                                                </p>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0 ml-2 ${entry.status === 'warranty'
                                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                }`}>
                                                {entry.status === 'warranty' ? 'Warranty' : 'Completed'}
                                            </span>
                                        </div>

                                        {/* Services */}
                                        {entry.services.length > 0 && (
                                            <div className="space-y-1.5 mb-3">
                                                {entry.services.map((svc) => (
                                                    <div key={`${entry.id}-${svc.name}`} className="flex justify-between items-center">
                                                        <span className="text-[10px] text-slate-400 font-medium">{svc.name}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold">
                                                            {svc.price > 0 ? formatCurrency(svc.price) : 'Free'}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between items-center pt-1.5 border-t border-white/5">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                                                    <span className="text-sm font-black text-white">{formatCurrency(entry.total)}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {entry.notes && (
                                            <p className="text-[10px] text-slate-500 italic mb-3 leading-relaxed">
                                                "{entry.notes}"
                                            </p>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-xs text-slate-600">calendar_today</span>
                                                <span className="text-[9px] text-slate-600 font-bold">{formatDate(entry.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-xs text-slate-600">build</span>
                                                <span className="text-[9px] text-slate-600 font-bold">{entry.mechanic}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default C_History;
