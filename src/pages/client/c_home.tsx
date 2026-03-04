import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useJobs } from '../../context/useJobs';
import type { Job } from '../../context/AppTypes';
import { SERVICE_STAGES } from '../../context/AppTypes';
import { getClientAppointments } from '../../utils/mockAppointments';

import TicketCard from '../../components/TicketCard';
import { SkeletonBoard } from '../../components/common/Skeletons';

const C_Home: React.FC = () => {
    const navigate = useNavigate();
    const { clientUser } = useAuth();
    const { jobs, isLoading } = useJobs();

    if (isLoading) return <SkeletonBoard />;

    const shopId = clientUser?.shopId ?? localStorage.getItem('activeShopId') ?? 'SHOP-01';

    const activeClientId = clientUser?.id ?? localStorage.getItem('activeClientId');
    const activeTickets = jobs.filter((t: Job) =>
        t.stageIndex < 7 &&
        (t.clientId === activeClientId)
    );

    const clientAppointments = getClientAppointments(
        shopId,
        clientUser?.id ?? localStorage.getItem('activeClientId'),
        clientUser?.phone ?? localStorage.getItem('activeClientPhone')
    );

    return (
        <div className="min-h-screen">
            <header className="px-6 pt-8 pb-10 bg-client-hero-01 relative overflow-hidden safe-top text-center">
                <div className="hero-overlay absolute inset-0 z-10" />
                <div className="relative z-20 text-center">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                        {clientUser?.shopName ?? 'Client Portal'}
                    </h1>
                    <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.4em] mt-2">Service Updates</p>
                </div>
            </header>

            <div className="p-6 -mt-8 relative z-30 space-y-4">
                <button
                    onClick={() => { void navigate('/c/track'); }}
                    className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10"
                >
                    <span className="material-symbols-outlined text-primary">monitoring</span>
                    <span className="font-bold uppercase text-xs tracking-[0.2em]">Track Ticket</span>
                </button>

                {/* Active Tickets — only this client's tickets */}
                {activeTickets.length > 0 ? (
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] ml-1">
                            Your Tickets
                        </h3>
                        {activeTickets.map((ticket: Job) => (
                            <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                onClick={() => { void navigate(`/c/ticket/${ticket.id}`); }}
                                variant="client"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-700 mb-3 block">receipt_long</span>
                        <p className="text-sm text-slate-500 font-medium">No active tickets for your account.</p>
                        <p className="text-[10px] text-slate-700 uppercase tracking-wider mt-2">Use "Track Ticket" to look up a repair.</p>
                    </div>
                )}

                {/* Appointments */}
                <section>
                    <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-3 ml-1">Appointments</h3>
                    <div className="space-y-3">
                        {clientAppointments.length === 0 && (
                            <p className="text-slate-500 text-sm glass-card">No upcoming appointments yet.</p>
                        )}
                        {clientAppointments.slice(0, 3).map((apt) => (
                            <div key={apt.appointmentId} className="glass-card">
                                <p className="text-white font-bold text-sm">{apt.serviceType}</p>
                                <p className="text-slate-400 text-xs">{apt.date} • {apt.time}</p>
                                <p className="text-slate-500 text-xs">Status: {apt.status === 'checked_in' ? 'Checked In' : 'Scheduled'}</p>
                                {apt.linkedTicketId && (
                                    <div className="mt-3">
                                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Progress</p>
                                        <div className="flex gap-1">
                                            {SERVICE_STAGES.map((_, idx) => {
                                                const stageTicket = jobs.find((t: Job) => t.id === apt.linkedTicketId);
                                                const stageIndex = stageTicket?.stageIndex ?? 0;
                                                const isFilled = idx <= stageIndex;
                                                return (
                                                    <div
                                                        key={`apt-${apt.appointmentId}-stage-${SERVICE_STAGES[idx]}`}
                                                        data-stage-index={idx}
                                                        className={`flex-1 h-1.5 rounded-full ${isFilled ? 'stage-dot-filled' : 'stage-dot-empty'}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default C_Home;
