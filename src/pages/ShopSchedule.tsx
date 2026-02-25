import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/useAppContext';

const ShopSchedule: React.FC = () => {
    const navigate = useNavigate();
    const { jobs } = useAppContext();
    const [selectedBay, setSelectedBay] = useState<number | null>(null);

    const bays = [
        { id: 1, name: 'BAY 01', type: 'FLUSH LIFT', job: jobs[0] },
        { id: 2, name: 'BAY 02', type: 'ALIGNMENT', job: jobs[1] },
        { id: 3, name: 'BAY 03', type: 'MAINTENANCE', job: null },
        { id: 4, name: 'BAY 04', type: 'HEAVY REPAIR', job: jobs[2] },
    ];

    const timeSlots = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    return (
        <div className="min-h-screen bg-zinc-950 text-slate-100 font-display pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/40 backdrop-blur-xl border-b border-white/5 safe-top">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(-1)}
                        className="size-10 rounded-full bg-white/5 flex items-center justify-center premium-press"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </motion.button>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-widest text-primary italic">Shop Scheduler</h1>
                        <p className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase">Bay Management & Timeline</p>
                    </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-primary text-zinc-950 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                    Auto-Assign
                </button>
            </header>

            <main className="p-6 space-y-8">
                {/* ── Bay Status Grid ── */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Workshop Bays (Live)</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {bays.map((bay) => (
                            <motion.div
                                key={bay.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedBay(bay.id)}
                                className={`liquid-glass p-5 rounded-3xl border transition-all cursor-pointer ${selectedBay === bay.id ? 'border-primary ring-1 ring-primary/20' : 'border-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{bay.type}</p>
                                        <h3 className="text-lg font-black italic glass-text">{bay.name}</h3>
                                    </div>
                                    <div className={`size-3 rounded-full border-2 border-zinc-950 ${bay.job ? 'bg-primary animate-pulse' : 'bg-emerald-500'}`} />
                                </div>

                                <div className="min-h-[60px] flex flex-col justify-center">
                                    {bay.job ? (
                                        <div className="space-y-1">
                                            <p className="text-xs font-black italic text-slate-200 uppercase truncate">{bay.job.vehicle}</p>
                                            <p className="text-[10px] text-primary font-bold uppercase">{bay.job.progress}% COMPLETE</p>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic">Ready for Load</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── Timeline View ── */}
                <section className="space-y-4 overflow-hidden">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Occupancy Timeline</h2>
                    <div className="liquid-glass rounded-[32px] border border-white/5 overflow-x-auto">
                        <div className="min-w-[800px] p-6">
                            <div className="flex border-b border-white/5 pb-4">
                                <div className="w-24 shrink-0" />
                                {timeSlots.map(t => (
                                    <div key={t} className="flex-1 text-center text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                        {t}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6 mt-6">
                                {bays.map(bay => (
                                    <div key={bay.id} className="flex items-center">
                                        <div className="w-24 shrink-0 pr-4">
                                            <p className="text-[11px] font-black italic text-slate-400">{bay.name}</p>
                                        </div>
                                        <div className="flex-1 h-8 bg-white/5 rounded-full relative overflow-hidden border border-white/5">
                                            {bay.job && (
                                                <motion.div
                                                    initial={{ left: '-100%' }}
                                                    animate={{ left: '10%' }}
                                                    className="absolute top-1 h-6 bg-primary/20 border border-primary/30 rounded-full px-4 flex items-center"
                                                    style={{ width: '60%' }}
                                                >
                                                    <p className="text-[8px] font-black text-primary uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {bay.job.vehicle} • {bay.job.client}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Management Controls ── */}
                <section className="liquid-glass p-6 rounded-[32px] border border-white/5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">swap_horiz</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-black italic uppercase">Override Assignment</h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Manual Dispatch & Recovery</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            Flag Delay
                        </button>
                        <button className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            Shift Bay
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ShopSchedule;
