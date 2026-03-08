import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useJobs } from '../../context/useJobs';
import type { Job } from '../../context/AppTypes';
import { SERVICE_STAGES } from '../../context/AppTypes';
import { motion } from 'framer-motion';

import TicketCard from '../../components/TicketCard';
import { SkeletonBoard } from '../../components/common/Skeletons';
import { referralService } from '../../services/referralService';

/* ── Helper: Mini Gauge ────────────────────────────── */
const DashGauge: React.FC<{ value: number; max: number; label: string; color: string; icon: string }> = ({ value, max, label, color, icon }) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const percent = max > 0 ? value / max : 0;
    const filled = percent * circumference;
    return (
        <div className="glass-card flex flex-col items-center py-4 border border-white/5">
            <svg width="64" height="64" viewBox="0 0 64 64" className="mb-2">
                <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                <circle
                    cx="32" cy="32" r={radius} fill="none"
                    stroke={color} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${filled} ${circumference - filled}`}
                    strokeDashoffset={circumference / 4}
                    className="transition-all duration-1000"
                />
                <text x="32" y="30" textAnchor="middle" dominantBaseline="central"
                    fill="white" fontSize="16" fontWeight="900" fontFamily="Space Grotesk, sans-serif">
                    {value}
                </text>
                <text x="32" y="44" textAnchor="middle" dominantBaseline="central"
                    fill="rgba(255,255,255,0.3)" fontSize="8" fontWeight="700">
                    /{max}
                </text>
            </svg>
            <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs" style={{ color }}>{icon}</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</span>
            </div>
        </div>
    );
};

/* ── Helper: Stage Bar ─────────────────────────────── */
const StageBar: React.FC<{ stages: string[]; counts: number[] }> = ({ stages, counts }) => {
    const max = Math.max(...counts, 1);
    return (
        <div className="flex items-end gap-1.5 h-14">
            {stages.map((stage, i) => {
                const height = Math.max((counts[i] / max) * 100, 8);
                return (
                    <motion.div
                        key={stage}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.06, duration: 0.4 }}
                        className="flex-1 rounded-sm bg-gradient-to-t from-blue-500/60 to-blue-400/40 relative group cursor-default"
                        title={`${stage}: ${counts[i]}`}
                    >
                        {counts[i] > 0 && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-blue-300/80">
                                {counts[i]}
                            </span>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};

const S_Board: React.FC = () => {
    const navigate = useNavigate();
    const { staffUser } = useAuth();
    const { theme } = useTheme();
    const { jobs, isLoading } = useJobs();

    // Cross-tab Synchronization
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    React.useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key?.startsWith('invoice:')) forceUpdate();
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    if (isLoading) return <SkeletonBoard />;

    const shopId = staffUser?.shopId ?? localStorage.getItem('activeShopId') ?? '';
    const shopTickets = jobs.filter((j: Job) => j.shopId === shopId);

    // Compute stats
    const activeTickets = shopTickets.filter(t => t.stageIndex < 7);
    const completedTickets = shopTickets.filter(t => t.stageIndex >= 7);
    const inProgress = shopTickets.filter(t => t.stageIndex > 0 && t.stageIndex < 7);

    // Stage distribution for bar chart
    const stageCounts = SERVICE_STAGES.map((_, idx) =>
        shopTickets.filter(t => t.stageIndex === idx).length
    );

    // Referral stats
    const shopReferrals = referralService.getReferralsByShop(shopId);
    const convertedReferrals = shopReferrals.filter(r => r.status === 'converted').length;
    const referralRate = shopReferrals.length > 0 ? Math.round((convertedReferrals / shopReferrals.length) * 100) : 0;

    return (
        <div className="min-h-screen pb-navbar">
            {/* ── HERO ── */}
            <header className="relative overflow-hidden px-6 pt-10 pb-14 safe-top">
                {/* Ambient glows */}
                <div className="absolute top-0 left-0 w-[250px] h-[200px] bg-blue-500/8 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[200px] h-[150px] bg-orange-500/5 blur-[80px] rounded-full" />

                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 text-center"
                >
                    <div className="text-5xl mb-3" style={{ filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.2))' }}>
                        🏗️
                    </div>
                    <h1
                        className="text-2xl font-black uppercase tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        {theme.shopName || 'SERVICEBAY'}
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-400/40 mt-1.5">
                        Operations Dashboard
                    </p>
                </motion.div>
            </header>

            {/* ── CONTENT ── */}
            <div className="px-5 -mt-6 relative z-30 space-y-5">

                {/* Stats Row */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="grid grid-cols-3 gap-3"
                >
                    <DashGauge value={activeTickets.length} max={shopTickets.length || 1} label="Active" color="#3B82F6" icon="pending" />
                    <DashGauge value={inProgress.length} max={shopTickets.length || 1} label="In Work" color="#F97316" icon="build" />
                    <DashGauge value={completedTickets.length} max={shopTickets.length || 1} label="Done" color="#10B981" icon="check_circle" />
                </motion.div>

                {/* Stage Distribution */}
                {shopTickets.length > 0 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                        className="glass-card border border-blue-500/10 p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400/70">Stage Pipeline</p>
                                <p className="text-white text-sm font-bold mt-0.5">
                                    {shopTickets.length} total ticket{shopTickets.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <span className="material-symbols-outlined text-blue-400/30">bar_chart</span>
                        </div>
                        <StageBar stages={SERVICE_STAGES} counts={stageCounts} />
                        <div className="flex justify-between mt-2">
                            {SERVICE_STAGES.map((stage, i) => (
                                <span key={`lbl-${stage}-${i}`} className="text-[6px] font-bold text-slate-600 uppercase tracking-wide flex-1 text-center truncate">
                                    {stage.split(' ')[0]}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Referral Stats */}
                {shopReferrals.length > 0 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                        className="glass-card border border-orange-500/10 p-4 flex items-center gap-4"
                    >
                        <div className="size-11 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 shrink-0">
                            <span className="material-symbols-outlined text-orange-400">people</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Referral Program</h4>
                            <p className="text-[9px] text-slate-500 mt-1 font-bold uppercase tracking-widest">
                                {shopReferrals.length} sent • {convertedReferrals} converted • {referralRate}% rate
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-sm text-orange-500/50">trending_up</span>
                    </motion.div>
                )}

                {/* Quick Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="grid grid-cols-2 gap-3"
                >
                    <button
                        onClick={() => { void navigate('/s/onboard'); }}
                        className="glass-card border border-blue-500/10 py-4 flex flex-col items-center gap-2 hover:bg-blue-500/5 transition-all active:scale-[0.97]"
                    >
                        <span className="material-symbols-outlined text-blue-400 text-2xl">person_add</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-300/60">New Client</span>
                    </button>
                    <button
                        onClick={() => { void navigate('/s/appointments'); }}
                        className="glass-card border border-orange-500/10 py-4 flex flex-col items-center gap-2 hover:bg-orange-500/5 transition-all active:scale-[0.97]"
                    >
                        <span className="material-symbols-outlined text-orange-400 text-2xl">calendar_month</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-orange-300/60">Schedule</span>
                    </button>
                </motion.div>

                {/* Ticket List */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <h3 className="text-[10px] font-bold text-blue-400/50 uppercase tracking-[0.25em] ml-1 mb-3 flex items-center gap-2">
                        <span className="inline-block size-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Active Tickets
                    </h3>

                    {shopTickets.length === 0 ? (
                        <div className="glass-card text-center border border-white/5 py-8">
                            <div className="text-4xl mb-3">📋</div>
                            <p className="text-sm text-white/60 font-semibold">No active tickets</p>
                            <p className="text-[10px] text-slate-600 uppercase tracking-wider mt-2">
                                Onboard a new client to create one
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {shopTickets.map((ticket: Job) => (
                                <TicketCard
                                    key={ticket.id}
                                    ticket={ticket}
                                    onClick={() => { void navigate(`/s/ticket/${ticket.id}`); }}
                                    variant="staff"
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default S_Board;
