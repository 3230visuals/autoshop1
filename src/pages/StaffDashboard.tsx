import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import type { ServiceStatus } from '../context/AppTypes';
import { motion, AnimatePresence } from 'framer-motion';
import ServiceStatusCard from '../components/ServiceStatusCard';
import ServicePhotoPanel from '../components/ServicePhotoPanel';

// ── Seed jobs for demo ─────────────────────────────────────────────────────
const JOB_STATUS: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
    in_progress: { label: 'In Progress', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20', dot: 'bg-indigo-400' },
    waiting_parts: { label: 'Waiting Parts', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', dot: 'bg-amber-400' },
    pending: { label: 'Pending', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', dot: 'bg-slate-400' },
    done: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', dot: 'bg-emerald-400' },
};

const PRIORITY_COLOR: Record<string, string> = {
    high: 'text-red-400',
    medium: 'text-amber-400',
    low: 'text-slate-500',
};

// Simple Modal Component
const AddJobModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (job: { vehicle: string; client: string; service: string; priority: string; bay: string; vehicleImage: string }) => void
}> = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        vehicle: '',
        client: '',
        service: '',
        priority: 'medium',
        bay: '',
        vehicleImage: '',
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0a0a0c]/90 backdrop-blur-md animate-in fade-in">
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                className="glass-card w-full max-w-md p-8 rounded-t-[2.5rem] sm:rounded-2xl border-t border-white/10 space-y-8 bg-[#121214] pb-navbar"
            >
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Init Work Order</h2>
                    <button onClick={onClose} className="size-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-1">Vehicle Specification</p>
                        <input
                            type="text"
                            placeholder="e.g. 2023 BMW M4"
                            className="w-full h-[56px] bg-white/5 border border-white/10 rounded-2xl px-5 text-[17px] text-slate-200 focus:border-indigo-500 outline-none"
                            value={formData.vehicle}
                            onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-1">Client Identity</p>
                        <input
                            type="text"
                            placeholder="Registry Name"
                            className="w-full h-[56px] bg-white/5 border border-white/10 rounded-2xl px-5 text-[17px] text-slate-200 focus:border-indigo-500 outline-none"
                            value={formData.client}
                            onChange={e => setFormData({ ...formData, client: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-1">Protocol / Service</p>
                        <input
                            type="text"
                            placeholder="Primary Objective"
                            className="w-full h-[56px] bg-white/5 border border-white/10 rounded-2xl px-5 text-[17px] text-slate-200 focus:border-indigo-500 outline-none"
                            value={formData.service}
                            onChange={e => setFormData({ ...formData, service: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-1">Priority</p>
                            <select
                                className="w-full h-[56px] bg-white/5 border border-white/10 rounded-2xl px-5 text-[17px] text-slate-200 focus:border-indigo-500 outline-none appearance-none"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-1">Bay Allocation</p>
                            <input
                                type="text"
                                placeholder="#00"
                                className="w-full h-[56px] bg-white/5 border border-white/10 rounded-2xl px-5 text-[17px] text-slate-200 focus:border-indigo-500 outline-none"
                                value={formData.bay}
                                onChange={e => setFormData({ ...formData, bay: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 pt-4">
                    <button onClick={() => { onAdd(formData); onClose(); }} className="flex-[2] h-[64px] rounded-2xl font-black bg-indigo-600 text-white uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20">Init Job</button>
                    <button onClick={onClose} className="flex-1 h-[64px] rounded-2xl font-bold bg-white/5 text-slate-500 uppercase tracking-widest">Abort</button>
                </div>
            </motion.div>
        </div>
    );
};

const StaffDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, jobClock, notifications, users, switchUser, jobs, addJob, updateJob, deleteJob, clockIn, clockOut, activeJobId } = useAppContext();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [activeJob, setActiveJob] = useState<string | null>('j1');
    const [isAddJobOpen, setIsAddJobOpen] = useState(false);

    // Filter jobs for current user (or show all for demo simplicity, but tracking logic depends on staffId assignment)
    // For this requirements: "functionality to add/delete jobs"
    const userJobs = jobs; // Show all jobs for now to enable easy management

    const firstName = currentUser.name.split(' ')[0];
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const unread = notifications.filter(n => !n.read).length;

    return (
        <div className="font-sans text-slate-100 min-h-screen flex flex-col pb-28 bg-[#0a0a0c]">
            {/* Background Glows Removed */}


            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(-1)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </motion.button>
                    <div className="relative group cursor-pointer" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-4"
                        >
                            <div className="size-12 rounded-2xl border-2 border-white/10 p-0.5 overflow-hidden">
                                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-[0.6rem] object-cover" />
                            </div>
                            <div>
                                <p className="text-[17px] font-black text-white leading-none mb-1">{currentUser.name}</p>
                                <p className="text-[11px] text-slate-600 uppercase tracking-[0.2em] font-bold">Mechanic</p>
                            </div>
                        </motion.div>

                        {/* Demo User Switcher Dropdown */}
                        {isUserMenuOpen && (
                            <div className="absolute top-12 left-0 w-48 glass-card border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[60] animate-in fade-in slide-in-from-top-2">
                                <div className="p-3 border-b border-white/5 bg-white/5">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Switch Identity</p>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {users.map(u => (
                                        <motion.button
                                            key={u.id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                switchUser(u.id);
                                                setIsUserMenuOpen(false);
                                                if (u.role === 'OWNER' || u.role === 'OWNER') {
                                                    navigate('/dashboard/shop');
                                                }
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0 ${u.id === currentUser.id ? 'bg-indigo-500/10' : ''}`}
                                        >
                                            <img src={u.avatar} alt={u.name} className="size-7 rounded-full" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold text-slate-100 truncate">{u.name}</p>
                                                <p className="text-[8px] text-slate-500 font-bold uppercase">{u.role}</p>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/notifications')}
                        className="relative size-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/5"
                    >
                        <span className="material-symbols-outlined text-2xl">notifications</span>
                        {unread > 0 && (
                            <span className="absolute top-2.5 right-2.5 size-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        )}
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/messages')}
                        className="size-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/5"
                    >
                        <span className="material-symbols-outlined text-2xl">chat</span>
                    </motion.button>
                </div>
            </header>

            <main className="flex-1 page-container pt-8">

                {/* ── Greeting + Shift Status ── */}
                <section className="mb-10">
                    <p className="text-slate-600 text-[13px] font-bold uppercase tracking-[0.25em] mb-2">{greeting}</p>
                    <h1 className="text-[32px] font-black text-white italic tracking-tighter leading-none mb-4">{firstName}</h1>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            {userJobs.length} Jobs
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] font-bold uppercase tracking-widest text-emerald-500">
                            {userJobs.filter(j => j.status === 'done').length} Completed
                        </span>
                    </div>
                </section>

                {/* ── Clock In / Out ── */}
                <section>
                    <div className={`glass-card rounded-2xl p-5 flex items-center gap-4 border border-white/5 ${jobClock.clockedIn ? 'border-emerald-500/20 bg-emerald-500/5' : ''}`}>
                        <div className={`size-12 rounded-xl flex items-center justify-center flex-shrink-0 ${jobClock.clockedIn ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
                            <span className={`material-symbols-outlined text-xl ${jobClock.clockedIn ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {jobClock.clockedIn ? 'timer' : 'timer_off'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-200 text-sm">
                                {jobClock.clockedIn ? 'Shift Active' : 'Standby'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                {jobClock.clockedIn ? `Assigned: ${jobs.find(j => j.id === activeJobId)?.vehicle || 'Unknown'}` : 'Not clocked in'}
                            </p>
                            {jobClock.clockedIn && (
                                <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                    <div className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                                    Elapsed: {jobClock.elapsed}
                                </p>
                            )}
                        </div>
                        {jobClock.clockedIn && (
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={clockOut}
                                className="px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 transition-all"
                            >
                                Stop
                            </motion.button>
                        )}
                    </div>
                </section>

                {/* ── Today's Jobs ── */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-[12px] font-black uppercase tracking-[0.25em] text-slate-600">Active Jobs</h2>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsAddJobOpen(true)}
                            className="h-[48px] px-6 rounded-2xl bg-indigo-600 text-white text-[12px] font-black uppercase tracking-[0.15em] shadow-lg shadow-indigo-900/40"
                        >
                            New Job
                        </motion.button>
                    </div>

                    <div className="space-y-5">
                        {userJobs.length === 0 ? (
                            <div className="text-center py-20 bg-white/[0.02] rounded-[2rem] border border-white/5 border-dashed">
                                <span className="material-symbols-outlined text-5xl text-slate-700 mb-4 opacity-30">assignment_turned_in</span>
                                <p className="text-[15px] font-bold text-slate-600 uppercase tracking-widest">Queue Crystal Clear</p>
                            </div>
                        ) : (
                            userJobs.map(job => {
                                const st = JOB_STATUS[job.status] || JOB_STATUS.pending;
                                const isActive = activeJob === job.id;
                                const isClockedInHere = activeJobId === job.id && jobClock.clockedIn;
                                const totalTimeFormatted = `${Math.floor(job.totalTime / 3600000)}h ${Math.floor((job.totalTime % 3600000) / 60000)}m`;

                                return (
                                    <motion.div
                                        key={job.id}
                                        layout
                                        className={`glass-card rounded-[2rem] border transition-all p-8 ${isActive ? 'border-indigo-500/40 bg-indigo-500/[0.03] shadow-2xl' : 'border-white/5'}`}
                                    >
                                        <div className="flex items-start justify-between gap-6" onClick={() => setActiveJob(isActive ? null : job.id)}>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`size-2.5 rounded-full ${st.dot} ${job.status === 'in_progress' ? 'animate-pulse' : ''}`} />
                                                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${st.color}`}>{st.label}</span>
                                                </div>
                                                <h3 className="text-[20px] font-black text-white italic tracking-tighter leading-none mb-2">{job.vehicle}</h3>
                                                <p className="text-[13px] text-slate-500 font-bold uppercase tracking-wide truncate">{job.client} • {job.service}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-white/2 border border-white/5 ${PRIORITY_COLOR[job.priority]}`}>
                                                    {job.priority}
                                                </span>
                                                <span className="material-symbols-outlined text-slate-600 text-3xl">
                                                    {isActive ? 'expand_less' : 'expand_more'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progressive Disclosure Section */}
                                        <AnimatePresence>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pt-8 space-y-8 border-t border-white/5 mt-8">
                                                        {/* Progress Meter */}
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-end">
                                                                <p className="text-[11px] text-slate-600 font-bold uppercase tracking-[0.25em]">Session Status</p>
                                                                <div className="flex gap-2">
                                                                    {['waiting', 'waiting_parts', 'in_progress', 'ready', 'done'].map(s => (
                                                                        <button
                                                                            key={s}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                updateJob(job.id, { status: s as ServiceStatus });
                                                                            }}
                                                                            className={`size-6 rounded-md flex items-center justify-center border transition-all ${job.status === s ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-600 hover:text-slate-300'}`}
                                                                            title={s.replace('_', ' ')}
                                                                        >
                                                                            <span className="material-symbols-outlined text-[14px]">
                                                                                {s === 'waiting' ? 'hourglass_empty' :
                                                                                    s === 'waiting_parts' ? 'inventory_2' :
                                                                                        s === 'in_progress' ? 'engineering' :
                                                                                            s === 'ready' ? 'check_circle' : 'task_alt'}
                                                                            </span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                                                                <motion.div
                                                                    className={`h-full rounded-full ${job.status === 'done' ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${job.status === 'done' ? 100 : job.status === 'ready' ? 95 : job.status === 'in_progress' ? 65 : 20}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Metadata */}
                                                        <div className="grid grid-cols-2 gap-6">
                                                            <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
                                                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1.5">Bay Assignment</p>
                                                                <p className="text-[15px] font-black text-white">{job.bay}</p>
                                                            </div>
                                                            <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
                                                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1.5">Elapsed Time</p>
                                                                <p className="text-[15px] font-black text-white">{totalTimeFormatted}</p>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex flex-col gap-4">
                                                            {isClockedInHere ? (
                                                                <button onClick={clockOut} className="h-[64px] bg-red-600 text-white font-black uppercase tracking-[0.2em] text-[13px] rounded-2xl shadow-xl shadow-red-900/20">
                                                                    Stop Session ({jobClock.elapsed})
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => clockIn(job.id)} className="h-[64px] bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[13px] rounded-2xl shadow-xl shadow-indigo-900/20">
                                                                    Begin Session
                                                                </button>
                                                            )}
                                                            <div className="flex gap-4">
                                                                <button onClick={() => navigate('/messages', { state: { clientName: job.client } })} className="flex-1 h-[56px] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-bold text-[11px] uppercase tracking-widest text-slate-400">
                                                                    <span className="material-symbols-outlined text-xl">chat</span> Message
                                                                </button>
                                                                <button onClick={() => deleteJob(job.id)} className="flex-1 h-[56px] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-bold text-[11px] uppercase tracking-widest text-red-500/60">
                                                                    <span className="material-symbols-outlined text-xl">delete</span> Purge
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </section>

                <AddJobModal
                    isOpen={isAddJobOpen}
                    onClose={() => setIsAddJobOpen(false)}
                    onAdd={(data) => addJob({
                        ...data,
                        priority: data.priority as 'high' | 'medium' | 'low',
                        status: 'waiting',
                        staffId: currentUser.id,
                        progress: 0,
                        services: [],
                        financials: { subtotal: 0, tax: 0, total: 0 },
                        vehicleImage: data.vehicleImage || `https://loremflickr.com/800/600/${data.vehicle?.split(' ').slice(1).join(',')},car/all`
                    })}
                />

                {/* ── Quick Actions ── */}
                <section className="space-y-6">
                    <h2 className="text-[12px] font-black uppercase tracking-[0.25em] text-slate-600 px-1">Quick Tools</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { icon: 'photo_camera', label: 'Evidence Capture', route: '/shop/actions', color: 'text-indigo-400', bg: 'bg-indigo-400/10', desc: 'Secure asset verification' },
                            { icon: 'assignment', label: 'Digital Work Order', route: '/shop/actions', color: 'text-slate-400', bg: 'bg-white/5', desc: 'Active protocol registry' },
                            { icon: 'chat', label: 'Messaging', route: '/messages', color: 'text-slate-400', bg: 'bg-white/5', desc: 'Direct secure messaging' },
                        ].map(a => (
                            <motion.button
                                key={a.label}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(a.route)}
                                className="glass-card rounded-[1.5rem] border border-white/5 p-6 flex items-center gap-5 hover:border-white/10 transition-all text-left"
                            >
                                <div className={`size-14 rounded-2xl ${a.bg} flex items-center justify-center shrink-0 shadow-inner`}>
                                    <span className={`material-symbols-outlined ${a.color} text-3xl`}>{a.icon}</span>
                                </div>
                                <div>
                                    <p className="text-[15px] font-black uppercase tracking-tight text-white mb-1">{a.label}</p>
                                    <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest">{a.desc}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* ── Service Status Card ── */}
                <section className="space-y-6">
                    <h2 className="text-[12px] font-black uppercase tracking-[0.25em] text-slate-600 px-1">Job Status</h2>
                    <ServiceStatusCard />
                </section>

                {/* ── Photo Panel ── */}
                <section className="space-y-6">
                    <h2 className="text-[12px] font-black uppercase tracking-[0.25em] text-slate-600 px-1">Service Photos</h2>
                    <ServicePhotoPanel />
                </section>

                {/* ── Locked sections notice ── */}
                <section className="glass-card rounded-xl border border-white/5 p-4 flex items-center gap-3 text-slate-600">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                    <p className="text-xs">Payment data, revenue, and staff management are restricted to shop owners.</p>
                </section>

            </main>
        </div>
    );
};

export default StaffDashboard;
