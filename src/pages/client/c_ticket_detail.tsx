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
        <div className="min-h-screen bg-page-dark-01 relative overflow-hidden">
            <div className="page-overlay absolute inset-0 z-0 pointer-events-none" />

            <div className="p-6 relative z-10">
                <VehicleProfileHeader
                    vehicle={ticket.vehicle}
                    customerName={ticket.customerName}
                    ticketId={ticket.id}
                    onBack={() => navigate('/c/home')}
                />

                <div className="bg-[#121214] border border-white/5 rounded-[2.5rem] p-8 mb-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 backdrop-blur-md">
                            <span className="size-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Live Tracking</span>
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
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/20 group-hover:bg-blue-600 transition-all" />
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Service Description</p>
                            <p className="text-[13px] text-slate-300 leading-relaxed font-medium uppercase tracking-wider">{ticket.issue}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/c/ticket/${ticket.id}/messages`)}
                        className="w-full h-18 bg-blue-600 text-white rounded-[1.25rem] font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-4 mt-12 shadow-[0_20px_40px_rgba(37,99,235,0.2)] active:scale-95 hover:bg-blue-500 transition-all"
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
