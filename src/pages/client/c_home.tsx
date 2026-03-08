import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useJobs } from '../../context/useJobs';
import type { Job } from '../../context/AppTypes';
import { SERVICE_STAGES } from '../../context/AppTypes';
import { getClientAppointments } from '../../utils/mockAppointments';
import { motion } from 'framer-motion';

import TicketCard from '../../components/TicketCard';
import { SkeletonBoard } from '../../components/common/Skeletons';

/* ── Helper: SVG Gauge ────────────────────────────── */
const MiniGauge: React.FC<{ value: number; label: string; color?: string }> = ({ value, label, color = '#F97316' }) => {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const filled = (value / 100) * circumference;
    return (
        <div className="flex flex-col items-center gap-1.5">
            <svg width="76" height="76" viewBox="0 0 76 76">
                <circle cx="38" cy="38" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                <circle
                    cx="38" cy="38" r={radius} fill="none"
                    stroke={color} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${filled} ${circumference - filled}`}
                    strokeDashoffset={circumference / 4}
                    className="transition-all duration-1000"
                />
                <text x="38" y="38" textAnchor="middle" dominantBaseline="central"
                    fill="white" fontSize="14" fontWeight="800" fontFamily="Space Grotesk, sans-serif">
                    {value}%
                </text>
            </svg>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</span>
        </div>
    );
};

/* ── Helper: Mini Bar Chart ───────────────────────── */
const MiniBarChart: React.FC<{ stages: number; current: number }> = ({ stages, current }) => (
    <div className="flex items-end gap-1 h-10">
        {Array.from({ length: stages }).map((_, i) => {
            const height = ((i + 1) / stages) * 100;
            const isFilled = i <= current;
            return (
                <motion.div
                    key={`bar-${i}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
                    className={`flex-1 rounded-sm ${isFilled
                        ? 'bg-gradient-to-t from-orange-500 to-amber-400'
                        : 'bg-white/5'
                        }`}
                />
            );
        })}
    </div>
);

const C_Home: React.FC = () => {
    const navigate = useNavigate();
    const { clientUser } = useAuth();
    const { jobs, isLoading } = useJobs();

    if (isLoading) return <SkeletonBoard />;

    const shopId = clientUser?.shopId ?? localStorage.getItem('activeShopId') ?? '';
    const activeClientId = clientUser?.id ?? localStorage.getItem('activeClientId');
    const activeTickets = jobs.filter((t: Job) =>
        t.stageIndex < 7 && t.clientId === activeClientId
    );
    const completedTickets = jobs.filter((t: Job) =>
        t.stageIndex >= 7 && t.clientId === activeClientId
    );

    const clientAppointments = getClientAppointments(
        shopId,
        clientUser?.id ?? localStorage.getItem('activeClientId'),
        clientUser?.phone ?? localStorage.getItem('activeClientPhone')
    );

    // Derive overall progress percentage for gauge
    const overallProgress = activeTickets.length > 0
        ? Math.round(activeTickets.reduce((acc, t) => acc + (t.stageIndex / 7) * 100, 0) / activeTickets.length)
        : 0;

    return (
        <div className="min-h-screen pb-navbar">
            {/* ── HERO SECTION ─── Car silhouette with neon glow ── */}
            <header className="relative overflow-hidden px-6 pt-10 pb-16 safe-top">
                {/* Ambient orange glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] bg-orange-500/10 blur-[100px] rounded-full" />
                <div className="absolute top-0 right-0 w-[200px] h-[150px] bg-amber-400/5 blur-[80px] rounded-full" />

                {/* Car emoji hero — fun and eye-catching */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="text-center relative z-10"
                >
                    <div className="text-7xl mb-3 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 0 30px rgba(249,115,22,0.3))' }}>
                        🏎️
                    </div>
                    <h1
                        className="text-3xl font-black uppercase tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        {clientUser?.shopName ?? 'SERVICEBAY'}
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-orange-400/50 mt-1.5">
                        Premium Auto Care
                    </p>
                </motion.div>
            </header>

            {/* ── DASHBOARD GRID ── Gauges + Stats ── */}
            <div className="px-5 -mt-8 relative z-30 space-y-5">

                {/* Quick Stats Row */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="grid grid-cols-3 gap-3"
                >
                    <div className="glass-card flex flex-col items-center py-4 border border-orange-500/10">
                        <span className="text-2xl font-black text-orange-400" style={{ fontFamily: "'Space Grotesk'" }}>
                            {activeTickets.length}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500 mt-1">Active</span>
                    </div>
                    <div className="glass-card flex flex-col items-center py-4 border border-amber-400/10">
                        <span className="text-2xl font-black text-amber-300" style={{ fontFamily: "'Space Grotesk'" }}>
                            {completedTickets.length}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500 mt-1">Done</span>
                    </div>
                    <div className="glass-card flex flex-col items-center py-4 border border-blue-400/10">
                        <span className="text-2xl font-black text-blue-400" style={{ fontFamily: "'Space Grotesk'" }}>
                            {clientAppointments.length}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500 mt-1">Booked</span>
                    </div>
                </motion.div>

                {/* Gauge + Bar Chart Panel */}
                {activeTickets.length > 0 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="glass-card border border-orange-500/10 p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400/70">Service Progress</p>
                                <p className="text-white text-sm font-bold mt-0.5">
                                    {activeTickets.length} vehicle{activeTickets.length > 1 ? 's' : ''} in service
                                </p>
                            </div>
                            <MiniGauge value={overallProgress} label="Overall" color="#F97316" />
                        </div>
                        {/* Bar chart for each ticket stage */}
                        <div className="space-y-3">
                            {activeTickets.map((ticket: Job) => (
                                <div key={ticket.id} className="flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white font-bold truncate">{ticket.vehicle}</p>
                                        <p className="text-[9px] text-orange-400/60 font-bold uppercase tracking-wider">
                                            {SERVICE_STAGES[ticket.stageIndex] ?? 'Unknown'}
                                        </p>
                                    </div>
                                    <div className="w-24">
                                        <MiniBarChart stages={7} current={ticket.stageIndex} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Track Repair CTA */}
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    onClick={() => { void navigate('/c/track'); }}
                    className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 hover:brightness-110 transition-all active:scale-[0.98]"
                >
                    <span className="material-symbols-outlined text-white font-bold">monitoring</span>
                    <span className="font-black uppercase text-xs tracking-[0.2em] text-white">Track Ticket</span>
                </motion.button>

                {/* Active Tickets */}
                {activeTickets.length > 0 ? (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="space-y-3"
                    >
                        <h3 className="text-[10px] font-bold text-orange-400/50 uppercase tracking-[0.25em] ml-1 flex items-center gap-2">
                            <span className="inline-block size-1.5 rounded-full bg-orange-400 animate-pulse" />
                            Your Active Repairs
                        </h3>
                        {activeTickets.map((ticket: Job) => (
                            <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                onClick={() => { void navigate(`/c/ticket/${ticket.id}`); }}
                                variant="client"
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="glass-card text-center border border-white/5 py-8"
                    >
                        <div className="text-4xl mb-3">🔧</div>
                        <p className="text-sm text-white/60 font-semibold">No active repairs right now</p>
                        <p className="text-[10px] text-slate-600 uppercase tracking-wider mt-2">
                            Use "Track Ticket" to look up a repair
                        </p>
                    </motion.div>
                )}

                {/* Appointments */}
                <motion.section
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <h3 className="text-[10px] font-bold text-amber-300/50 uppercase tracking-[0.25em] mb-3 ml-1 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-amber-300/50">event</span>
                        Appointments
                    </h3>
                    <div className="space-y-3">
                        {clientAppointments.length === 0 && (
                            <div className="glass-card text-center border border-white/5 py-6">
                                <div className="text-3xl mb-2">📅</div>
                                <p className="text-slate-500 text-sm font-medium">No upcoming appointments</p>
                            </div>
                        )}
                        {clientAppointments.slice(0, 3).map((apt) => {
                            const stageTicket = jobs.find((t: Job) => t.id === apt.linkedTicketId);
                            const stageIndex = stageTicket?.stageIndex ?? 0;
                            return (
                                <div key={apt.appointmentId} className="glass-card border border-amber-400/10 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold text-sm">{apt.serviceType}</p>
                                            <p className="text-slate-400 text-xs mt-0.5">{apt.date} • {apt.time}</p>
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${apt.status === 'checked_in'
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                                            }`}>
                                            {apt.status === 'checked_in' ? 'Checked In' : 'Scheduled'}
                                        </span>
                                    </div>
                                    {apt.linkedTicketId && (
                                        <div className="mt-3 pt-3 border-t border-white/5">
                                            <p className="text-[9px] font-bold text-orange-400/40 uppercase tracking-widest mb-1.5">Stage Progress</p>
                                            <MiniBarChart stages={7} current={stageIndex} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.section>

                {/* Fun Quick Links */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="grid grid-cols-2 gap-3 pb-4"
                >
                    <button
                        onClick={() => { void navigate('/c/referrals'); }}
                        className="glass-card border border-orange-500/10 py-5 flex flex-col items-center gap-2 hover:bg-orange-500/5 transition-all active:scale-[0.97]"
                    >
                        <span className="text-2xl">🎁</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-orange-300/60">Referrals</span>
                    </button>
                    <button
                        onClick={() => { void navigate('/c/history'); }}
                        className="glass-card border border-amber-400/10 py-5 flex flex-col items-center gap-2 hover:bg-amber-400/5 transition-all active:scale-[0.97]"
                    >
                        <span className="text-2xl">📜</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300/60">History</span>
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default C_Home;
