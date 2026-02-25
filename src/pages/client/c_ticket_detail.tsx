import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProgressBar7Stage from '../../components/ProgressBar7Stage';
import VehicleProfileHeader from '../../components/VehicleProfileHeader';
import { getTicketById } from '../../utils/mockTickets';

const C_TicketDetail: React.FC = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const ticket = getTicketById(ticketId || '');

    return (
        <div className="min-h-screen bg-background-dark relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[120px] rounded-full" /></div>

            <div className="p-6 relative z-10">
                <VehicleProfileHeader
                    vehicle={ticket.vehicle}
                    customerName={ticket.customerName}
                    ticketId={ticket.id}
                    onBack={() => navigate('/c/home')}
                />

                <div className="bg-card-dark border border-white/5 rounded-[2.5rem] p-8 mb-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-md">
                            <span className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_var(--primary-muted)]" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live Tracking</span>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 mt-12">
                        <ProgressBar7Stage
                            currentStageIndex={ticket.stageIndex}
                            role="CLIENT"
                        />
                    </div>

                    <div className="mt-12 space-y-6">
                        <div className="bg-white/2 p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all" />
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Service Description</p>
                            <p className="text-[13px] text-slate-300 leading-relaxed font-medium uppercase tracking-wider">{ticket.issue}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/c/ticket/${ticket.id}/messages`)}
                        className="w-full h-18 bg-primary text-white rounded-[1.25rem] font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-4 mt-12 shadow-[0_20px_40px_var(--primary-muted)] active:scale-95 hover:brightness-110 transition-all"
                    >
                        <span className="material-symbols-outlined text-2xl">forum</span>
                        Message Mechanic
                    </button>
                </div>
            </div>
        </div>
    );
};

export default C_TicketDetail;
