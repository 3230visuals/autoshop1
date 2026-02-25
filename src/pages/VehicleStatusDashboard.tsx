import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { motion } from 'framer-motion';
import type { ServicePhoto } from '../context/AppTypes';

const VehicleStatusDashboard = () => {
    const navigate = useNavigate();
    const { vehicle, order, serviceStatus, servicePhotos, currentUser } = useAppContext();

    const totalDue = order.total;
    const hasPendingPayment = totalDue > 0 && !order.paid;

    // Helper to get status dot class
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'in_progress': return 'status-blue';
            case 'ready':
            case 'done': return 'status-green';
            case 'waiting_parts': return 'status-yellow';
            default: return 'status-slate';
        }
    };

    return (
        <div className="text-slate-300 min-h-screen flex flex-col font-sans bg-[#0a0a0c] pb-44">
            {/* Header Section */}
            <header className="sticky top-0 z-50 bg-[#0a0a0c] px-5 py-5 flex items-center justify-between border-b border-white/5 safe-top w-full">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="text-slate-500 hover:text-white transition-colors size-11 flex items-center justify-center rounded-xl bg-white/2 border border-white/5"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </motion.button>
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                            {currentUser.shopLogo ? (
                                <img src={currentUser.shopLogo} alt="Shop Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-slate-500 text-xl">storefront</span>
                            )}
                        </div>
                        <h1 className="text-[14px] font-bold tracking-tight text-white uppercase">{currentUser.shopName || 'Shop Status'}</h1>
                    </div>
                </div>
                <div className={`status-indicator ${getStatusClass(serviceStatus)} scale-125 origin-right mr-2`}>
                    <div className={`status-dot ${serviceStatus === 'in_progress' ? 'animate-pulse' : ''}`} />
                    <span className="text-[11px] font-black">{serviceStatus === 'in_progress' ? 'In Service' : serviceStatus.replace('_', ' ')}</span>
                </div>
            </header>

            <main className="flex-1 page-container overflow-x-hidden pt-6 space-y-10 px-6">
                {/* Vehicle Hero Card */}
                <section>
                    <div className="glass-card overflow-hidden rounded-[2rem] shadow-2xl shadow-blue-900/10">
                        <div className="relative h-56 w-full">
                            <img
                                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop"
                                alt="Vehicle"
                                className="w-full h-full object-cover opacity-40 grayscale saturate-50 scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent"></div>
                            <div className="absolute bottom-8 left-8 right-8">
                                <h2 className="text-[32px] font-black text-white leading-[0.9] uppercase tracking-tighter">{vehicle.year} {vehicle.make} {vehicle.model}</h2>
                                <p className="text-[13px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-5 bg-white/5 inline-block px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">{vehicle.licensePlate}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account Summary / Quick Stats */}
                <section className="grid grid-cols-2 gap-5">
                    <div className="glass-card p-6 rounded-2xl flex flex-col gap-3">
                        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Est. Pickup</p>
                        <p className="text-[17px] font-bold text-white uppercase tracking-tight">Today 4PM</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl flex flex-col gap-3">
                        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Order ID</p>
                        <p className="text-[17px] font-bold text-white uppercase tracking-tight">#{order.orderNumber.slice(-6).toUpperCase()}</p>
                    </div>
                </section>

                {/* Payment Due Card */}
                {hasPendingPayment && (
                    <motion.button
                        onClick={() => navigate('/checkout')}
                        whileTap={{ scale: 0.98 }}
                        className="glass-card w-full p-8 flex items-center gap-6 bg-blue-600 border-blue-500/40 rounded-[2rem] shadow-2xl shadow-blue-600/20"
                    >
                        <div className="size-16 rounded-2xl bg-white/10 text-white flex items-center justify-center flex-shrink-0 border border-white/20 shadow-inner">
                            <span className="material-symbols-outlined text-3xl">payments</span>
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-[12px] font-bold uppercase tracking-widest text-white/50 mb-2">Amount Due</p>
                            <p className="text-[36px] font-black text-white tracking-tighter tabular-nums leading-none">${totalDue.toFixed(2)}</p>
                            <p className="text-[12px] text-white/80 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                <span className="size-1.5 rounded-full bg-white animate-pulse" />
                                Review Invoice
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-white/40 text-3xl">chevron_right</span>
                    </motion.button>
                )}

                {/* Service Progress Timeline */}
                <section className="pt-2">
                    <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-10 px-1 flex items-center gap-4">
                        <span className="material-symbols-outlined text-2xl opacity-50">event_note</span>
                        Job Progress
                    </h3>

                    <div className="timeline-neutral px-1 space-y-16">
                        <div className="timeline-line bg-white/5 top-2 bottom-2 left-[11px]"></div>

                        <div className="timeline-step">
                            <div className="timeline-dot bg-emerald-500 size-4.5 -left-2 shadow-[0_0_0_8px_rgba(16,185,129,0.1)]"></div>
                            <div className="timeline-content flex-1 pl-10">
                                <p className="text-[16px] font-bold uppercase tracking-tight leading-none text-white">Vehicle Check-in</p>
                                <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest mt-3.5 leading-relaxed">Oct 24, 08:30 • Check-in Verified</p>
                            </div>
                        </div>

                        <div className="timeline-step">
                            <div className="timeline-dot bg-emerald-500 size-4.5 -left-2 shadow-[0_0_0_8px_rgba(16,185,129,0.1)]"></div>
                            <div className="timeline-content flex-1 pl-10">
                                <p className="text-[16px] font-bold uppercase tracking-tight leading-none text-white">Vehicle Inspection</p>
                                <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest mt-3.5 leading-relaxed">Oct 24, 09:45 • Faults Identified</p>
                            </div>
                        </div>

                        <div className="timeline-step">
                            <div className="timeline-dot bg-blue-500 size-4.5 -left-2 shadow-[0_0_0_12px_rgba(59,130,246,0.15)] animate-pulse"></div>
                            <div className="timeline-content flex-1 pl-10">
                                <p className="text-[16px] font-bold uppercase tracking-tight leading-none text-blue-400">Work in Progress</p>
                                <p className="text-[12px] text-blue-500/70 font-bold uppercase tracking-widest mt-3.5 leading-relaxed">Multi-Point Calibration in Flux</p>
                            </div>
                        </div>

                        <div className="timeline-step opacity-30">
                            <div className="timeline-dot bg-slate-800 size-4.5 -left-2"></div>
                            <div className="timeline-content flex-1 pl-10">
                                <p className="text-[16px] font-bold text-slate-600 uppercase tracking-tight leading-none">Final Inspection</p>
                                <p className="text-[12px] text-slate-800 font-bold uppercase tracking-widest mt-3.5 leading-relaxed">Upcoming Milestone</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Asset Gallery */}
                {servicePhotos.length > 0 && (
                    <section className="pt-4">
                        <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-6 px-1 flex items-center gap-4">
                            <span className="material-symbols-outlined text-2xl opacity-50">photo_library</span>
                            Service Gallery
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {servicePhotos.map((photo: ServicePhoto) => (
                                <div key={photo.id} className="aspect-square rounded-2xl border border-white/5 overflow-hidden bg-white/2 shadow-xl">
                                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover saturate-50 grayscale-[20%]" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Telemetry Feed */}
                <section className="glass-card p-8 rounded-[2rem] shadow-2xl">
                    <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-8 flex items-center gap-4">
                        <span className="material-symbols-outlined text-2xl opacity-50">sensors</span>
                        Recent Activity
                    </h3>
                    <div className="space-y-8">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-5">
                                <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                                    <span className="material-symbols-outlined text-xl text-slate-500">engineering</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[15px] font-bold text-white uppercase tracking-tight leading-tight">Calibration Sync</p>
                                    <p className="text-[11px] text-slate-600 mt-2.5 font-bold uppercase tracking-widest">Terminal 04: Active</p>
                                </div>
                            </div>
                            <span className="text-[11px] text-slate-700 font-bold uppercase tracking-widest shrink-0 ml-4 opacity-50">2m ago</span>
                        </div>
                        <div className="flex items-start justify-between">
                            <div className="flex gap-5">
                                <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                                    <span className="material-symbols-outlined text-xl text-slate-500">photo_camera</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[15px] font-bold text-white uppercase tracking-tight leading-tight">Photos Added</p>
                                    <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest mt-2.5">Part: REAR_BRAKES</p>
                                </div>
                            </div>
                            <span className="text-[11px] text-slate-700 font-bold uppercase tracking-widest shrink-0 ml-4 opacity-50">15m ago</span>
                        </div>
                    </div>
                </section>

                {/* Bottom Spacer for fixed buttons */}
                <div className="h-32" />
            </main>

            {/* Fixed Action Buttons */}
            <div className="fixed bottom-0 left-0 right-0 p-8 z-40 max-w-[480px] mx-auto bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/95 to-transparent pt-16 pb-[max(2rem,env(safe-area-inset-bottom))]">
                <div className="flex gap-5">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/messages')}
                        className="flex-1 h-[64px] flex items-center justify-center gap-4 glass-card rounded-2xl font-bold text-[14px] uppercase tracking-[0.2em] text-white shadow-2xl backdrop-blur-xl border border-white/10"
                    >
                        <span className="material-symbols-outlined text-2xl">chat</span>
                        MESSAGE
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/approve')}
                        className="flex-[2] h-[64px] flex items-center justify-center gap-4 bg-blue-600 text-white rounded-2xl font-bold text-[14px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/40"
                    >
                        <span className="material-symbols-outlined text-2xl">fact_check</span>
                        VIEW ESTIMATE
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default VehicleStatusDashboard;
