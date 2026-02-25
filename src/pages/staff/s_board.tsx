import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MOCK_TICKETS } from '../../utils/mockTickets';
import TicketCard from '../../components/TicketCard';

const S_Board: React.FC = () => {
    const navigate = useNavigate();
    const { staffUser } = useAuth();

    // Filter tickets for this shop only
    const shopTickets = MOCK_TICKETS.filter(t => t.shopId === staffUser?.shopId || t.shopId === 'SHOP-01');

    return (
        <div className="min-h-screen">
            <header className="px-6 pt-16 pb-12 bg-staff-hero-01 relative overflow-hidden border-b border-white/5">
                <div className="hero-overlay absolute inset-0 z-10" />
                <div className="relative z-20">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Shop Board</h1>
                        <div className="size-12 bg-primary/10 backdrop-blur-md rounded-2xl border border-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary font-bold">hub</span>
                        </div>
                    </div>
                    <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.5em] ml-1">Operations Dashboard</p>
                </div>
            </header>

            <div className="p-6 relative z-30">
                {shopTickets.map((ticket) => (
                    <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onClick={() => navigate(`/s/ticket/${ticket.id}`)}
                        variant="staff"
                    />
                ))}
            </div>

            <button className="fixed bottom-24 right-6 size-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 z-20 active:scale-95 transition-all">

                <span className="material-symbols-outlined text-white text-3xl font-bold">add</span>
            </button>
        </div>
    );
};

export default S_Board;
