import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/useAppContext';

const OwnerAnalytics: React.FC = () => {
    const navigate = useNavigate();
    const { jobs } = useAppContext();
    const [timeframe, setTimeframe] = useState<'WEEK' | 'MONTH' | 'YEAR'>('MONTH');

    // Mock Data for charts
    const revenueData = [3200, 4500, 3800, 5200, 4800, 6100, 5900];
    const maxRevenue = Math.max(...revenueData);

    return (
        <div className="min-h-screen bg-zinc-950 text-slate-100 font-display pb-20">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] size-[500px] bg-primary/10 rounded-full blur-[120px] opacity-20" />
                <div className="absolute bottom-[-10%] left-[-10%] size-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-10" />
            </div>

            <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/60 backdrop-blur-lg border-b border-white/5 safe-top">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(-1)}
                        className="size-10 rounded-full bg-white/5 flex items-center justify-center premium-press"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </motion.button>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-widest text-primary italic">Owner Intelligence</h1>
                        <p className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase">Shop Metrics & Revenue</p>
                    </div>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    {['WEEK', 'MONTH', 'YEAR'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t as 'WEEK' | 'MONTH' | 'YEAR')}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${timeframe === t ? 'bg-primary text-zinc-950' : 'text-slate-500 hover:text-white'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </header>

            <main className="relative z-10 p-6 space-y-6">
                {/* ── Revenue Overview ── */}
                <section className="liquid-glass p-6 rounded-[32px] border border-white/5 shadow-2xl">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Revenue</p>
                            <h2 className="text-4xl font-black italic glass-text">$48,250.00</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">+12.4%</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">vs prev. {timeframe.toLowerCase()}</p>
                        </div>
                    </div>

                    {/* Simple SVG Line Chart */}
                    <div className="h-40 w-full relative group">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 700 100">
                            <defs>
                                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: 'var(--color-primary)', stopOpacity: 0.2 }} />
                                    <stop offset="100%" style={{ stopColor: 'var(--color-primary)', stopOpacity: 0 }} />
                                </linearGradient>
                            </defs>
                            {/* Area */}
                            <path
                                d={`M 0 100 ${revenueData.map((d, i) => `L ${i * 100} ${100 - (d / maxRevenue) * 80}`).join(' ')} L 600 100 Z`}
                                fill="url(#grad)"
                                className="transition-all duration-1000"
                            />
                            {/* Line */}
                            <path
                                d={`M 0 ${100 - (revenueData[0] / maxRevenue) * 80} ${revenueData.map((d, i) => `L ${i * 100} ${100 - (d / maxRevenue) * 80}`).join(' ')}`}
                                fill="none"
                                stroke="var(--color-primary)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="drop-shadow-[0_0_10px_rgba(242,127,13,0.5)] transition-all duration-1000"
                            />
                            {/* Dots */}
                            {revenueData.map((d, i) => (
                                <circle
                                    key={i}
                                    cx={i * 100}
                                    cy={100 - (d / maxRevenue) * 80}
                                    r="4"
                                    fill="var(--color-primary)"
                                    className="group-hover:scale-150 transition-transform cursor-pointer"
                                />
                            ))}
                        </svg>
                        <div className="flex justify-between mt-4">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                <span key={d} className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{d}</span>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-2 gap-4">
                    {/* ── Average Order Value ── */}
                    <div className="liquid-glass p-5 rounded-3xl border border-white/5">
                        <span className="material-symbols-outlined text-primary mb-3">payments</span>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg. Ticket</p>
                        <h3 className="text-xl font-black italic">$842.00</h3>
                        <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-primary" />
                        </div>
                    </div>

                    {/* ── Tech Efficiency ── */}
                    <div className="liquid-glass p-5 rounded-3xl border border-white/5">
                        <span className="material-symbols-outlined text-blue-400 mb-3">engineering</span>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Efficiency</p>
                        <h3 className="text-xl font-black italic">94.2%</h3>
                        <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-blue-400" />
                        </div>
                    </div>
                </div>

                {/* ── Top Services ── */}
                <section className="liquid-glass p-6 rounded-[32px] border border-white/5">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Top Service Categories</h2>
                    <div className="space-y-4">
                        {[
                            { label: 'Routine Maintenance', val: 42, color: 'bg-primary' },
                            { label: 'Transmission & Drive', val: 28, color: 'bg-blue-500' },
                            { label: 'Performance Tuning', val: 18, color: 'bg-purple-500' },
                            { label: 'Diagnostics', val: 12, color: 'bg-emerald-500' },
                        ].map((item) => (
                            <div key={item.label} className="space-y-2">
                                <div className="flex justify-between text-[11px] font-black italic uppercase">
                                    <span className="text-slate-300">{item.label}</span>
                                    <span className="text-slate-500">{item.val}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.val}%` }}
                                        className={`h-full ${item.color} shadow-lg shadow-white/5`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Recent Large Jobs ── */}
                <section className="space-y-4 pb-10">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Top Performers (This Week)</h2>
                    <div className="space-y-3">
                        {jobs.slice(0, 3).map((job, idx) => (
                            <div key={job.id} className="liquid-glass p-4 rounded-2xl flex items-center gap-4 border border-white/5">
                                <div className="size-10 rounded-full bg-white/5 flex items-center justify-center font-black italic text-primary">
                                    #{idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-black italic text-slate-100 uppercase">{job.vehicle}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{job.client}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-primary italic">$2,840</p>
                                    <p className="text-[9px] text-slate-600 font-black uppercase">PAID</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default OwnerAnalytics;
