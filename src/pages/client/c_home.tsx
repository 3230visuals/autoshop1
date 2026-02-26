import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { getTicketsByShop } from '../../utils/mockTickets';
import { getClientAppointments } from '../../utils/mockAppointments';


import TicketCard from '../../components/TicketCard';

const C_Home: React.FC = () => {
    const navigate = useNavigate();
    const { clientUser } = useAuth();

    const shopId = clientUser?.shopId || localStorage.getItem('activeShopId') || 'SHOP-01';
  
  
    const allShopTickets = getTicketsByShop(shopId);
    const clientTickets = allShopTickets.filter((t) => t.clientId === clientUser?.id);
    const activeTicket = clientTickets[0] || allShopTickets[0];

    const clientAppointments = getClientAppointments(
        shopId,
        clientUser?.id || localStorage.getItem('activeClientId'),
        clientUser?.phone || localStorage.getItem('activeClientPhone')
    );

    return (
        <div className="min-h-screen">
            <header className="px-6 pt-16 pb-12 bg-client-hero-01 relative overflow-hidden">
                <div className="hero-overlay absolute inset-0 z-10" />
                <div className="relative z-20">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Client Portal</h1>
                    <p className="text-[11px] font-bold text-blue-400/60 uppercase tracking-[0.4em] ml-1">Service Updates</p>
                </div>
            </header>

            <div className="p-6 -mt-8 relative z-30 space-y-6">
                <button
                    onClick={() => navigate('/c/track')}
                    className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10"
                >
                    <span className="material-symbols-outlined text-blue-500">monitoring</span>
                    <span className="font-bold uppercase text-xs tracking-[0.2em]">Track Ticket</span>
                </button>

                {activeTicket && (
                    <div>
                        <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-4 ml-1">Current Ticket</h3>
                        <TicketCard
                            ticket={activeTicket}
                            onClick={() => navigate(`/c/ticket/${activeTicket.id}`)}
                            variant="client"
                        />
                    </div>
                )}
                <section>
                    <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-3 ml-1">Appointments</h3>
                    <div className="space-y-3">
                        {clientAppointments.length === 0 && (
                            <p className="text-slate-500 text-sm bg-[#121214] border border-white/5 rounded-2xl p-4">No upcoming appointments yet.</p>
                        )}
                        {clientAppointments.slice(0, 3).map((apt) => (
                            <div key={apt.appointmentId} className="bg-[#121214] border border-white/5 rounded-2xl p-4">
                                <p className="text-white font-bold text-sm">{apt.serviceType}</p>
                                <p className="text-slate-400 text-xs">{apt.date} • {apt.time}</p>
                                <p className="text-slate-500 text-xs">Status: {apt.status === 'checked_in' ? 'Checked In' : 'Scheduled'}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default C_Home;
