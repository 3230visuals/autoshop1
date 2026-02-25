import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import type { ActivityDetail } from '../components/ActivityDetailModal';
import ActivityDetailModal from '../components/ActivityDetailModal';
import { motion } from 'framer-motion';

const MechanicQuickActions = () => {
    const navigate = useNavigate();
    const { jobClock, showToast, activeJobId, clockOut, paymentHistory } = useAppContext();
    const [selectedActivity, setSelectedActivity] = React.useState<ActivityDetail | null>(null);

    // Toggle clock logic
    const handleClockToggle = () => {
        if (activeJobId) {
            clockOut();
        } else {
            showToast('Operational Warning: No active vehicle selected.');
            navigate('/staff');
        }
    };

    return (
        <div className="bg-[#0a0a0c] font-sans text-slate-300 min-h-screen flex flex-col pb-32">
            {/* Header Section */}
            <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-[#0a0a0c]/80 backdrop-blur-xl z-40 border-b border-white/5 safe-top">
                <div className="flex items-center gap-5">
                    <div className="size-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                        <span className="material-symbols-outlined text-blue-500 text-3xl">terminal</span>
                    </div>
                    <div>
                        <h1 className="text-[17px] font-bold tracking-[0.1em] text-white uppercase leading-tight">Service Floor</h1>
                        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mt-2 leading-none">Operational Terminal</p>
                    </div>
                </div>
                <div className="relative">
                    <div className="size-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden p-0.5 shadow-lg">
                        <img alt="Mechanic Profile" className="size-full rounded-lg object-cover grayscale opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGgRQrIYitDoqjZKWTrXvxqGv_ozFh5ajCTytudUP3aM-ntgM3_zZFGPTLr7FehA3gkcuQFACEgu4IE6m84BjEQxIMrpryBb0DqZjGU1oEu4TKGgjyvItUt3cqi4J14u8prepML8wdpk81DwiHaR-Xi8pFSaUjzjkdFZUilq-ONKEot5iNMJf_TGPuNl3AeOAMCvWF33N3bz5z-JEkBRbjAnoMJPNYQeDoBimZk88SbDvzV3sLqvhCXhFu-9WUUkCZpjHi-5_6og" />
                    </div>
                    <div className="absolute -top-1 -right-1 size-3.5 bg-emerald-500 border-[3px] border-[#0a0a0c] rounded-full shadow-emerald-500/20 shadow-lg"></div>
                </div>
            </header>

            {/* Main Dashboard Grid */}
            <main className="flex-1 page-container pt-8">
                <div className="grid grid-cols-2 gap-5">
                    {/* Scan VIN Card */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/report')}
                        className="glass-card p-8 flex flex-col items-start gap-8 text-left group min-h-[180px] rounded-[2rem] bg-white/[0.01] border border-white/2"
                    >
                        <div className="size-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-xl shadow-blue-500/5">
                            <span className="material-symbols-outlined text-4xl">barcode_scanner</span>
                        </div>
                        <div>
                            <h3 className="font-black text-[17px] text-white uppercase tracking-tighter leading-none mb-2 italic">Scan VIN</h3>
                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Registry Init</p>
                        </div>
                    </motion.button>

                    {/* New Inspection Card */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/report')}
                        className="glass-card p-8 flex flex-col items-start gap-8 text-left min-h-[180px] rounded-[2rem] bg-white/[0.01] border border-white/2"
                    >
                        <div className="size-16 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center text-slate-500">
                            <span className="material-symbols-outlined text-4xl">fact_check</span>
                        </div>
                        <div>
                            <h3 className="font-black text-[17px] text-white uppercase tracking-tighter leading-none mb-2 italic">Report</h3>
                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Diagnostics</p>
                        </div>
                    </motion.button>

                    {/* Job Clock Card */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClockToggle}
                        className={`glass-card p-8 flex flex-col items-start gap-8 text-left relative overflow-hidden min-h-[180px] rounded-[2rem] border ${jobClock.clockedIn ? 'border-blue-500/40 bg-blue-500/[0.03] shadow-2xl shadow-blue-500/10' : 'bg-white/[0.01]'}`}
                    >
                        <div className={`size-16 rounded-2xl flex items-center justify-center transition-all ${jobClock.clockedIn ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/2 border border-white/5 text-slate-600'}`}>
                            <span className="material-symbols-outlined text-4xl">timer</span>
                        </div>
                        <div>
                            <h3 className="font-black text-[17px] text-white uppercase tracking-tighter leading-none mb-2 italic">Session</h3>
                            <p className={`text-[13px] font-black uppercase tracking-[0.1em] tabular-nums ${jobClock.clockedIn ? 'text-blue-500' : 'text-slate-600'}`}>
                                {jobClock.clockedIn ? `${jobClock.elapsed}` : 'Standby'}
                            </p>
                        </div>
                        {jobClock.clockedIn && (
                            <div className="absolute top-8 right-8">
                                <span className="flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                </span>
                            </div>
                        )}
                    </motion.button>

                    {/* Messages Card */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/messages')}
                        className="glass-card p-8 flex flex-col items-start gap-8 text-left min-h-[180px] rounded-[2rem] bg-white/[0.01] border border-white/2"
                    >
                        <div className="size-16 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center text-slate-500">
                            <span className="material-symbols-outlined text-4xl">chat_bubble</span>
                        </div>
                        <div>
                            <h3 className="font-black text-[17px] text-white uppercase tracking-tighter leading-none mb-2 italic">Comms</h3>
                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Pipeline</p>
                        </div>
                    </motion.button>
                </div>

                {/* Recent Activity Section */}
                <section className="mt-14">
                    <div className="flex items-center justify-between mb-10 px-1">
                        <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Operational Log</h2>
                        <button onClick={() => showToast('Full registry access granted.')} className="bg-white/5 h-10 px-4 rounded-xl text-blue-500 text-[11px] font-black uppercase tracking-widest border border-white/5">View All</button>
                    </div>
                    <div className="flex flex-col gap-5 pb-10">
                        {paymentHistory.slice(0, 3).map(rec => (
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                key={rec.id}
                                onClick={() => setSelectedActivity({
                                    id: rec.id,
                                    title: rec.vehicle,
                                    subtitle: rec.clientName,
                                    type: 'payment',
                                    date: new Date(rec.paidAt).toLocaleDateString(),
                                    status: 'done',
                                    progress: 100,
                                    services: rec.items,
                                    financials: {
                                        subtotal: rec.subtotal,
                                        tax: rec.tax,
                                        tip: rec.tipAmount,
                                        total: rec.total,
                                        method: rec.paymentMethod
                                    },
                                    notes: `Transaction ${rec.orderNumber} completed via ${rec.paymentMethod}.`
                                })}
                                className="w-full flex items-center gap-6 glass-card p-8 text-left rounded-[2rem] bg-white/[0.01] border border-white/2"
                            >
                                <div className="size-16 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center text-slate-600 shrink-0 shadow-inner">
                                    <span className="material-symbols-outlined text-3xl">history_edu</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-black text-[18px] text-white truncate uppercase tracking-tighter italic leading-none">{rec.vehicle}</h4>
                                        <div className="flex items-center gap-2.5 shrink-0 ml-4">
                                            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Done</span>
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest opacity-80 leading-none">
                                        {rec.clientName} • {new Date(rec.paidAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </motion.button>
                        ))}

                        {paymentHistory.length === 0 && (
                            <div className="text-center py-20 glass-card rounded-2xl border border-white/5 flex flex-col items-center">
                                <span className="material-symbols-outlined text-slate-800 text-5xl mb-4 opacity-50">inventory_2</span>
                                <p className="text-[13px] text-slate-700 font-bold uppercase tracking-widest">No Operational History Found</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Float Scanner for Mobile Reach */}
            <div className="fixed bottom-28 right-6 z-50">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/report')}
                    className="size-16 rounded-[1.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 flex items-center justify-center border border-white/10"
                >
                    <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                </motion.button>
            </div>

            {/* Activity Detail Modal */}
            <ActivityDetailModal
                isOpen={!!selectedActivity}
                onClose={() => setSelectedActivity(null)}
                detail={selectedActivity}
            />
        </div>
    );
};

export default MechanicQuickActions;
