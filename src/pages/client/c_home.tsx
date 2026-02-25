import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MOCK_TICKETS } from '../../utils/mockTickets';
import TicketCard from '../../components/TicketCard';

const C_Home: React.FC = () => {
    const navigate = useNavigate();
    const { clientUser } = useAuth();

    // Filter tickets for this specific client and shop
    const clientTickets = MOCK_TICKETS.filter(t =>
        t.clientId === clientUser?.id && t.shopId === clientUser?.shopId
    );

    const activeTicket = clientTickets[0] || MOCK_TICKETS[0]; // Fallback for demo if none found

    return (
        <div className="min-h-screen">
            <header className="px-6 pt-16 pb-12 bg-client-hero-01 relative overflow-hidden">
                <div className="hero-overlay absolute inset-0 z-10" />
                <div className="relative z-20">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Houston First</h1>
                        <div className="size-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl">
                            <span className="material-symbols-outlined text-blue-500 font-bold">notifications</span>
                        </div>
                    </div>
                    <p className="text-[11px] font-bold text-blue-400/60 uppercase tracking-[0.4em] ml-1">Premium Repair Portal</p>
                </div>
            </header>

            <div className="p-6 -mt-8 relative z-30">
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <button
                        onClick={() => navigate('/c/track')}
                        className="group relative h-24 bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between hover:bg-white/10 transition-all overflow-hidden"
                    >
                        <div className="flex items-center gap-5">
                            <div className="size-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                                <span className="material-symbols-outlined text-blue-500 text-3xl">monitoring</span>
                            </div>
                            <div className="text-left">
                                <h4 className="text-white font-black uppercase tracking-widest text-sm">Track Repair</h4>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Live shop status</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-700 group-hover:text-blue-500 transition-colors">chevron_right</span>
                        <div className="absolute top-0 right-0 p-1">
                            <div className="size-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                        </div>
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/c/ticket/TCK-1042')}
                            className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-blue-500 text-3xl">confirmation_number</span>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center leading-tight">Open Sample<br />Ticket</span>
                        </button>
                        <button
                            onClick={() => navigate('/c/ticket/TCK-1042/messages')}
                            className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95"
                        >
                            <div className="relative">
                                <span className="material-symbols-outlined text-blue-500 text-3xl">chat</span>
                                <div className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full border-2 border-[#121214] flex items-center justify-center">
                                    <div className="size-1 bg-white rounded-full" />
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Messages</span>
                        </button>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-4 ml-1">Current Ticket</h3>
                    <TicketCard
                        ticket={activeTicket}
                        onClick={() => navigate(`/c/ticket/${activeTicket.id}`)}
                        variant="client"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#121214] border border-white/5 rounded-2xl p-5">
                        <span className="material-symbols-outlined text-blue-500 mb-3">history</span>
                        <h3 className="text-xl font-bold text-white">12</h3>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Total Services</p>
                    </div>
                    <div className="bg-[#121214] border border-white/5 rounded-2xl p-5">
                        <span className="material-symbols-outlined text-blue-500 mb-3">verified</span>
                        <h3 className="text-xl font-bold text-white">4.9</h3>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Shop Rating</p>
                    </div>
                </div>

                <section>
                    <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-4 ml-1">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full h-16 bg-[#121214] border border-white/5 rounded-2xl flex items-center px-6 gap-4 hover:border-blue-500/20 transition-all">
                            <span className="material-symbols-outlined text-slate-500">calendar_month</span>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">Schedule New Service</span>
                        </button>
                        <button className="w-full h-16 bg-[#121214] border border-white/5 rounded-2xl flex items-center px-6 gap-4 hover:border-blue-500/20 transition-all">
                            <span className="material-symbols-outlined text-slate-500">payments</span>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">Payment Methods</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default C_Home;
