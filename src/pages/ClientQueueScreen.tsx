import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { motion, AnimatePresence } from 'framer-motion';
import type { Job, ServiceStatus } from '../context/AppTypes';

const STATUS_STYLES: Record<ServiceStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
    waiting: { label: 'Waiting', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', dot: 'bg-slate-400' },
    in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', dot: 'bg-blue-400' },
    ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', dot: 'bg-emerald-400' },
    done: { label: 'Done', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    waiting_parts: { label: 'Waiting Parts', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', dot: 'bg-amber-400' },
};

const STATUS_ORDER: ServiceStatus[] = ['waiting', 'waiting_parts', 'in_progress', 'ready', 'done'];

const ClientQueueScreen = () => {
    const navigate = useNavigate();
    const { jobs, updateJob, showToast } = useAppContext();
    const [filter, setFilter] = useState<ServiceStatus | 'all'>('all');
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

    const counts = STATUS_ORDER.reduce((acc, s) => {
        acc[s] = jobs.filter(j => j.status === s).length;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="bg-[#0a0a0c] text-slate-100 min-h-screen flex flex-col pb-28">
            <header className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5 px-5 py-6 flex items-center gap-5 safe-top">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    className="size-11 flex items-center justify-center rounded-xl bg-white/2 border border-white/5 text-slate-400"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </motion.button>
                <div>
                    <h1 className="text-[17px] font-black uppercase tracking-tight text-white leading-none">Job Queue</h1>
                    <p className="text-[11px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-2 leading-none">{jobs.length} Active Sessions</p>
                </div>
            </header>

            {/* Summary chips */}
            <div className="px-4 py-6 flex gap-3 overflow-x-auto no-scrollbar">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter('all')}
                    className={`flex-shrink-0 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filter === 'all' ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/20' : 'bg-white/2 border-white/5 text-slate-500'}`}
                >
                    All ({jobs.length})
                </motion.button>
                {STATUS_ORDER.map(s => {
                    const st = STATUS_STYLES[s];
                    const active = filter === s;
                    return (
                        <motion.button
                            key={s}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(s)}
                            className={`flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${active ? `bg-white/5 ${st.border} ${st.color} shadow-lg` : 'bg-white/2 border-white/5 text-slate-500'}`}
                        >
                            <span className={`size-2 rounded-full ${active ? st.dot : 'bg-slate-700'}`} />
                            {st.label} ({counts[s]})
                        </motion.button>
                    );
                })}
            </div>

            {/* Job cards */}
            <div className="flex-1 px-4 space-y-4">
                <AnimatePresence mode="popLayout">
                    {filtered.map(job => {
                        const st = STATUS_STYLES[job.status] || STATUS_STYLES.waiting;

                        return (
                            <motion.div
                                key={job.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass-card rounded-[2rem] border border-white/2 overflow-hidden shadow-xl"
                            >
                                <div className="p-7 cursor-pointer" onClick={() => setSelectedJob(job)}>
                                    <div className="flex items-start justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-5">
                                            <div className={`size-16 rounded-2xl ${st.bg} flex items-center justify-center flex-shrink-0 border border-white/5`}>
                                                {job.vehicleImage ? (
                                                    <img src={job.vehicleImage} className="w-full h-full object-cover rounded-2xl" alt="" />
                                                ) : (
                                                    <span className={`material-symbols-outlined ${st.color} text-3xl`}>directions_car</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-[17px] font-black text-white uppercase tracking-tight truncate leading-tight mb-1">{job.vehicle}</h3>
                                                <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest">{job.client}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${st.bg} border ${st.border}`}>
                                                <div className={`size-1.5 rounded-full ${st.dot} ${job.status === 'in_progress' ? 'animate-pulse' : ''}`} />
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${st.color}`}>{st.label}</span>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate('/messages', { state: { clientName: job.client } });
                                                }}
                                                className="size-10 rounded-xl bg-white/2 flex items-center justify-center text-slate-500 border border-white/5"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">chat</span>
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Stage-Based Progress Bar */}
                                    <div className="mt-4 mb-8 space-y-3">
                                        <div className="flex gap-1.5 h-2 w-full">
                                            {[0, 1, 2, 3].map((idx) => {
                                                const currentStageIdx = job.status === 'done' ? 3 : job.status === 'ready' ? 2 : job.status === 'in_progress' ? 1 : 0;
                                                const isCompleted = idx <= currentStageIdx;
                                                const isCurrent = idx === currentStageIdx;
                                                const isDone = job.status === 'done';

                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`h-full flex-1 rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-500/30' :
                                                            isCurrent ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' :
                                                                isCompleted ? 'bg-blue-500/40' : 'bg-white/5'
                                                            }`}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-between px-0.5">
                                            {['Scheduled', 'In Progress', 'Ready', 'Completed'].map((label, idx) => {
                                                const currentStageIdx = job.status === 'done' ? 3 : job.status === 'ready' ? 2 : job.status === 'in_progress' ? 1 : 0;
                                                const isActive = idx === currentStageIdx;
                                                const isDone = job.status === 'done';

                                                return (
                                                    <div key={label} className="relative flex flex-col items-center">
                                                        <span className={`text-[8px] font-black uppercase tracking-tighter transition-colors ${isActive ? (isDone ? 'text-emerald-500/70' : 'text-blue-500/90') : 'text-slate-800'
                                                            }`}>
                                                            {label}
                                                        </span>
                                                        {/* Interactive Invisible hit area to still allow status updates via click */}
                                                        <div
                                                            className="absolute -top-6 size-6 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const statusMap: Record<number, ServiceStatus> = { 0: 'waiting', 1: 'in_progress', 2: 'ready', 3: 'done' };
                                                                updateJob(job.id, { status: statusMap[idx] });
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-white/2 pt-6 mt-2">
                                        <div className="flex items-center gap-5">
                                            <span className="flex items-center gap-2 font-bold uppercase tracking-widest">
                                                <span className="material-symbols-outlined text-[16px]">person</span>
                                                {job.timeLogs?.[0]?.staffName || 'Marcus S.'}
                                            </span>
                                            <span className="flex items-center gap-2 font-bold uppercase tracking-widest">
                                                <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                {job.status === 'done' ? 'Ready' : '3:00 PM'}
                                            </span>
                                        </div>
                                        <button className="text-blue-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                                            VIEW DETAILS
                                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="text-center py-24 glass-card rounded-[2rem] border border-white/2 flex flex-col items-center">
                        <span className="material-symbols-outlined text-slate-800 text-6xl mb-6">inventory_2</span>
                        <p className="text-[13px] text-slate-600 font-bold uppercase tracking-widest italic">No matching workloads found</p>
                    </div>
                )}
            </div>

            {/* Client Info Modal */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-[#121214] border-t sm:border border-white/10 rounded-t-[3rem] sm:rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl relative pb-navbar"
                        >
                            {/* Modal Header */}
                            <div className="relative h-44 bg-white/2 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121214]"></div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedJob(null)}
                                    className="absolute top-6 right-6 size-12 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 z-10"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </motion.button>
                                <div className="absolute bottom-6 left-8 flex items-center gap-5">
                                    <div className="size-20 rounded-2xl bg-blue-500 flex items-center justify-center shadow-2xl shadow-blue-900/40 border border-white/10 text-white overflow-hidden">
                                        {selectedJob.vehicleImage ? (
                                            <img src={selectedJob.vehicleImage} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <span className="material-symbols-outlined text-[40px]">directions_car</span>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white leading-none mb-2 uppercase tracking-tight italic">{selectedJob.client}</h2>
                                        <p className="text-blue-500 font-bold uppercase tracking-widest text-[11px]">{selectedJob.vehicle}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <section>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 px-1 italic">Active Services</h3>
                                    <div className="grid gap-3">
                                        {selectedJob.services?.map((s, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5">
                                                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[18px] text-blue-400">check_circle</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[13px] font-black text-white uppercase tracking-tight">{s.name}</p>
                                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Authorized</p>
                                                </div>
                                                <span className="text-sm font-bold text-white tabular-nums">${s.price}</span>
                                            </div>
                                        ))}
                                        {(!selectedJob.services || selectedJob.services.length === 0) && (
                                            <p className="text-[11px] text-slate-600 uppercase font-bold text-center py-4 bg-white/1 rounded-xl border border-white/2">No services logged yet</p>
                                        )}
                                    </div>
                                </section>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-white/2 border border-white/5">
                                        <p className="text-[10px] font-black uppercase text-slate-600 mb-2 tracking-widest">Main Tech</p>
                                        <p className="text-[15px] font-black text-white uppercase">{selectedJob.timeLogs?.[0]?.staffName || 'Marcus S.'}</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/2 border border-white/5">
                                        <p className="text-[10px] font-black uppercase text-slate-600 mb-2 tracking-widest">Estimated Ready</p>
                                        <p className="text-[15px] font-black text-white uppercase">{selectedJob.status === 'done' ? 'Ready' : '3:00 PM'}</p>
                                    </div>
                                </div>

                                <section className="p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">Fiscal Status</p>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${selectedJob.status === 'done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                            {selectedJob.status === 'done' ? 'Settled' : 'Pending'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed italic uppercase tracking-wider">
                                        {selectedJob.status === 'done' ? 'Registry sequence finalized. Asset extraction authorized.' : 'Authorized units active. Sequence completion required for terminal extraction.'}
                                    </p>
                                </section>

                                <button
                                    onClick={() => {
                                        showToast('Job updated successfully');
                                        setSelectedJob(null);
                                    }}
                                    className="w-full h-16 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-[13px] shadow-2xl active:scale-[0.98] transition-transform"
                                >
                                    Close Identity
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClientQueueScreen;
