import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import type { ActivityDetail } from '../components/ActivityDetailModal';
import ActivityDetailModal from '../components/ActivityDetailModal';
import { motion } from 'framer-motion';

const EliteShopHub: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, jobs, showToast } = useAppContext();
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [qrTab, setQrTab] = useState<'staff' | 'owner'>('staff');
    const [selectedActivity, setSelectedActivity] = useState<ActivityDetail | null>(null);

    const isOwner = currentUser.role === 'OWNER' || currentUser.role === 'OWNER';
    const isMechanic = currentUser.role === 'STAFF';

    return (
        <div className="font-sans text-slate-300 antialiased overflow-x-hidden min-h-screen flex flex-col pb-32 bg-[#0a0a0c]">
            <div className="relative flex min-h-screen w-full flex-col z-10">
                {/* Header */}
                <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-6 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5 safe-top w-full">
                    <div className="flex items-center gap-5">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(-1)}
                            className="size-12 flex items-center justify-center rounded-xl bg-white/2 border border-white/5 text-slate-500 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-2xl">arrow_back</span>
                        </motion.button>
                        <div className="size-12 rounded-xl bg-white/5 border border-white/5 overflow-hidden shadow-lg p-0.5">
                            {currentUser.shopLogo ? (
                                <img alt="Shop Logo" className="w-full h-full object-cover rounded-[0.5rem]" src={currentUser.shopLogo} />
                            ) : (
                                <img alt={currentUser.name} className="w-full h-full object-cover rounded-[0.5rem]" src={currentUser.avatar} />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-[17px] font-black tracking-tight text-white truncate max-w-[140px] uppercase leading-none">{currentUser.name}</h1>
                            <p className="text-[11px] text-slate-600 font-bold uppercase tracking-[0.2em] leading-none mt-2">
                                {isOwner ? 'OWNER' : 'STAFF'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {[
                            { icon: 'chat', route: '/messages', title: 'Comms' },
                            { icon: 'qr_code_2', action: () => setIsQRModalOpen(true), title: 'Connect' },
                        ].map(btn => (
                            <motion.button
                                key={btn.title}
                                whileTap={{ scale: 0.95 }}
                                onClick={btn.route ? () => navigate(btn.route!) : btn.action}
                                className="flex items-center justify-center size-12 rounded-xl bg-white/2 border border-white/5 text-slate-400 hover:text-primary hover:border-blue-400/20 transition-all shadow-lg"
                                title={btn.title}
                            >
                                <span className="material-symbols-outlined text-2xl">{btn.icon}</span>
                            </motion.button>
                        ))}
                    </div>
                </header>

                <main className="flex-1 page-container overflow-x-hidden pt-4 space-y-8">
                    {/* ── Quick Actions / Priority ── */}
                    {isOwner && (
                        <section className="grid grid-cols-2 gap-4">
                            <motion.button
                                onClick={() => navigate('/shop/invite')}
                                whileTap={{ scale: 0.98 }}
                                className="glass-card flex items-center gap-5 p-6 rounded-[2rem] h-[100px]"
                            >
                                <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                                    <span className="material-symbols-outlined text-2xl">person_add</span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white text-[15px] leading-tight mb-1 uppercase tracking-tight italic">Invite</h3>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest truncate">Customer</p>
                                </div>
                            </motion.button>
                            <motion.button
                                onClick={() => navigate('/shop/schedule')}
                                whileTap={{ scale: 0.98 }}
                                className="glass-card flex items-center gap-5 p-6 rounded-[2rem] h-[100px]"
                            >
                                <div className="size-14 rounded-2xl bg-slate-500/10 text-slate-400 flex items-center justify-center border border-white/5 shrink-0">
                                    <span className="material-symbols-outlined text-2xl">calendar_today</span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white text-[15px] leading-tight mb-1 uppercase tracking-tight italic">Sched</h3>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest truncate">Schedule</p>
                                </div>
                            </motion.button>
                        </section>
                    )}

                    {/* ── Analytics: Owner/Admin only ── */}
                    {isOwner && (
                        <section className="glass-card p-6 cursor-pointer rounded-2xl shadow-xl shadow-primary/5" onClick={() => navigate('/shop/analytics')}>
                            <div className="flex justify-between items-center mb-8 px-1">
                                <h2 className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-primary" />
                                    Daily Overview
                                </h2>
                                <span className="material-symbols-outlined text-slate-600 text-2xl">trending_up</span>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex items-center gap-5">
                                    <div className="relative size-16 flex items-center justify-center shrink-0">
                                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                            <circle className="stroke-white/5" cx="18" cy="18" fill="none" r="16" strokeWidth="2.5"></circle>
                                            <circle className="stroke-blue-500" cx="18" cy="18" fill="none" r="16" strokeDasharray="75, 100" strokeLinecap="round" strokeWidth="2.5"></circle>
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-white uppercase tracking-tighter tabular-nums">$42k</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Revenue</p>
                                        <p className="text-[14px] text-emerald-500 font-bold mt-1.5">+12.5%</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="relative size-16 flex items-center justify-center shrink-0">
                                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                            <circle className="stroke-white/5" cx="18" cy="18" fill="none" r="16" strokeWidth="2.5"></circle>
                                            <circle className="stroke-blue-500" cx="18" cy="18" fill="none" r="16" strokeDasharray="94, 100" strokeLinecap="round" strokeWidth="2.5"></circle>
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-white uppercase tracking-tighter">94%</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Efficiency</p>
                                        <p className="text-[14px] text-white font-bold mt-1.5 uppercase">Optimal</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── Mechanic Quick Banner ── */}
                    {isMechanic && (
                        <section className="glass-card p-6 flex items-center gap-5 rounded-2xl shadow-xl shadow-primary/5">
                            <div className="size-14 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-3xl">engineering</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-white text-[15px] uppercase tracking-wide">Terminal Session Active</p>
                                <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest mt-2">2 Workloads Assigned</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/shop/actions')}
                                className="h-[48px] px-6 rounded-xl bg-primary text-white text-[12px] font-bold uppercase tracking-widest flex items-center justify-center shadow-lg shadow-primary/20"
                            >
                                Queue
                            </motion.button>
                        </section>
                    )}

                    {/* ── Management Tools: Owner/Admin only ── */}
                    {isOwner && (
                        <section className="space-y-8 pt-4">
                            <h2 className="text-[12px] font-black uppercase tracking-[0.25em] text-slate-600 px-1 italic">Shop Management</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { icon: 'chat', label: 'Customer Messages', sub: 'Interactive Messaging', route: '/messages' },
                                    { icon: 'grid_view', label: 'Job Queue', sub: 'Active Service Pipeline', route: '/shop/actions' },
                                    { icon: 'inventory_2', label: 'Inventory', sub: 'Parts & Stock Management', route: '/shop/parts' },
                                    { icon: 'calendar_month', label: 'Appointments', sub: 'Booking Schedule', route: '/shop/appointments' },
                                    { icon: 'receipt_long', label: 'Payments', sub: 'Transaction History', route: '/shop/payments' },
                                    { icon: 'group', label: 'Team directory', sub: 'Staff Management', route: '/shop/staff' },
                                    { icon: 'person_add', label: 'Invites', sub: 'Customer Onboarding', route: '/shop/invite' },
                                    { icon: 'settings', label: 'Settings', sub: 'Services & Shop Rates', route: '/shop/services' },
                                ].map(item => (
                                    <motion.button
                                        key={item.route}
                                        onClick={() => navigate(item.route)}
                                        whileTap={{ scale: 0.98 }}
                                        className="glass-card p-6 flex items-center gap-6 text-left relative overflow-hidden h-[96px] rounded-[1.5rem] shadow-xl border border-white/2"
                                    >
                                        <div className="size-14 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center shrink-0 shadow-inner">
                                            <span className="material-symbols-outlined text-slate-400 text-2xl">{item.icon}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[17px] font-black text-white leading-tight truncate uppercase tracking-tight italic">{item.label}</p>
                                            <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest mt-2 opacity-80 truncate">{item.sub}</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Active Jobs Section */}
                    <section className="space-y-6 pt-4 pb-8">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-slate-100">Job Queue</h2>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/shop/queue')}
                                className="text-primary text-[11px] font-bold uppercase tracking-widest"
                            >
                                Detailed View
                            </motion.button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {jobs.map(job => (
                                <motion.button
                                    key={job.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedActivity({
                                        id: job.id,
                                        title: job.vehicle,
                                        subtitle: job.client,
                                        type: 'job',
                                        mechanic: job.timeLogs[0]?.staffName || 'Unassigned',
                                        status: job.status,
                                        progress: job.progress,
                                        services: job.services || [],
                                        financials: job.financials || { subtotal: 0, tax: 0, total: 0 },
                                        notes: job.notes
                                    })}
                                    className="glass-card p-6 flex items-center gap-5 text-left rounded-2xl shadow-xl"
                                >
                                    <div className="size-16 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-inner">
                                        {job.vehicleImage ? (
                                            <img src={job.vehicleImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-slate-700 text-3xl">directions_car</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-[16px] text-white truncate uppercase tracking-tight">{job.vehicle}</h3>
                                            <div className="flex items-center gap-2 shrink-0 ml-4 scale-110 origin-right">
                                                <div className={`size-2 rounded-full ${job.status === 'in_progress' ? 'bg-primary' :
                                                    job.status === 'ready' || job.status === 'done' ? 'bg-emerald-500' :
                                                        job.status === 'waiting_parts' ? 'bg-amber-500' : 'bg-slate-700'
                                                    }`} />
                                                <span className="text-[11px] text-slate-600 font-bold uppercase tracking-widest">
                                                    {job.status === 'in_progress' ? 'Active' : job.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-[13px] text-slate-500 mt-1.5 truncate uppercase font-bold tracking-widest">{job.client}</p>

                                        {/* Dynamic Stage-Based Progress Bar */}
                                        <div className="mt-6 space-y-3">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] px-0.5">
                                                <span className="text-slate-600">Service Phase</span>
                                                <span className={job.status === 'done' ? 'text-emerald-500/80' : 'text-primary'}>
                                                    {job.status === 'done' ? 'Protocol Finalized' :
                                                        job.status === 'ready' ? 'Asset Ready' :
                                                            job.status === 'in_progress' ? 'Cycle Active' : 'Scheduled'}
                                                </span>
                                            </div>
                                            <div className="flex gap-1.5 h-2 w-full">
                                                {[0, 1, 2, 3].map((idx) => {
                                                    const stageIdx = job.status === 'done' ? 3 : job.status === 'ready' ? 2 : job.status === 'in_progress' ? 1 : 0;
                                                    const isCompleted = idx <= stageIdx;
                                                    const isCurrent = idx === stageIdx;
                                                    const isDone = job.status === 'done';

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`h-full flex-1 rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-500/30' :
                                                                    isCurrent ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.4)]' :
                                                                        isCompleted ? 'bg-primary/40' : 'bg-white/5'
                                                                }`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <div className="flex justify-between px-0.5">
                                                {['SCHED', 'START', 'READY', 'DONE'].map((label, i) => {
                                                    const stageIdx = job.status === 'done' ? 3 : job.status === 'ready' ? 2 : job.status === 'in_progress' ? 1 : 0;
                                                    return (
                                                        <span key={label} className={`text-[8px] font-black tracking-tighter uppercase ${i === stageIdx ? (job.status === 'done' ? 'text-emerald-500/60' : 'text-primary/80') : 'text-slate-800'}`}>
                                                            {label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </section>

                    {/* Empty state if no jobs */}
                    {jobs.length === 0 && (
                        <div className="text-center py-16 glass-card border border-white/5 rounded-2xl flex flex-col items-center">
                            <span className="material-symbols-outlined text-slate-800 text-[56px] mb-4">inventory_2</span>
                            <p className="text-slate-600 text-[12px] font-bold uppercase tracking-widest">No active jobs found</p>
                        </div>
                    )}
                </main>

                <div className="h-24"></div>

                {/* Activity Detail Modal */}
                <ActivityDetailModal
                    isOpen={!!selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                    detail={selectedActivity}
                />

                {/* QR Modal */}
                {isQRModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-card-dark border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative">
                            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/2">
                                <h3 className="font-bold text-white text-[13px] uppercase tracking-[0.2em]">Scan to Connect</h3>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsQRModalOpen(false)}
                                    className="size-11 flex items-center justify-center text-slate-600 hover:text-white transition-all"
                                >
                                    <span className="material-symbols-outlined text-2xl">close</span>
                                </motion.button>
                            </div>
                            <div className="flex p-1.5 bg-white/2 m-6 rounded-xl border border-white/5">
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setQrTab('staff')}
                                    className={`flex-1 py-3.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${qrTab === 'staff' ? 'bg-primary text-white shadow-xl' : 'text-slate-600 hover:text-slate-300'}`}
                                >
                                    Staff View
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setQrTab('owner')}
                                    className={`flex-1 py-3.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${qrTab === 'owner' ? 'bg-primary text-white shadow-xl' : 'text-slate-600 hover:text-slate-300'}`}
                                >
                                    Shop Owner
                                </motion.button>
                            </div>
                            <div className="flex flex-col items-center justify-center pb-10 px-8 text-center">
                                <div className="bg-white p-6 rounded-2xl mb-8 shadow-2xl">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                        qrTab === 'staff' ? window.location.origin + '/?role=mechanic' :
                                            window.location.origin + '/?role=owner'
                                    )}`} alt="QR Code" className="size-48" />
                                </div>
                                <p className="text-[18px] font-bold text-white uppercase tracking-widest mb-2">
                                    {qrTab === 'staff' ? 'Staff Terminal' : 'Owner Control'}
                                </p>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                    {qrTab === 'staff' ? 'Scan to initiate mechanic session.' :
                                        'Scan for operational administrative access.'}
                                </p>
                            </div>
                            <div className="p-6 border-t border-white/5 bg-white/2">
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => {
                                        const url = qrTab === 'staff' ? window.location.origin + '/?role=mechanic' : window.location.origin + '/?role=owner';
                                        navigator.clipboard.writeText(url);
                                        showToast('Access link copied to clipboard!');
                                    }}
                                    className="w-full h-[56px] rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all border border-white/5"
                                >
                                    <span className="material-symbols-outlined text-xl">content_copy</span>
                                    COPY REGISTRY LINK
                                </motion.button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EliteShopHub;
