import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useJobs } from '../../context/useJobs';
import type { Job } from '../../context/AppTypes';

import TicketCard from '../../components/TicketCard';

const S_Board: React.FC = () => {
    const navigate = useNavigate();
    const { staffUser } = useAuth();
    const { theme } = useTheme();
    const { jobs } = useJobs();

    const shopId = staffUser?.shopId ?? localStorage.getItem('activeShopId') ?? 'SHOP-01';
    const shopTickets = jobs.filter((j: Job) => j.shopId === shopId);

    // Live sync for payment status
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    React.useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key?.startsWith('invoice:')) forceUpdate();
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <div className="min-h-screen">
            <header className="px-6 pt-10 pb-12 bg-staff-hero-01 relative overflow-hidden border-b border-white/5 safe-top">
                <div className="hero-overlay absolute inset-0 z-10" />
                <div className="relative z-20 text-center">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{theme.shopName || 'Shop Board'}</h1>
                    <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.5em] mt-2">Operations Dashboard</p>
                </div>
            </header>

            <div className="p-6 relative z-30 space-y-4">
                {shopTickets.length === 0 && (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-4xl text-slate-700 mb-3 block">inbox</span>
                        <p className="text-slate-500 text-sm font-medium">No active tickets</p>
                    </div>
                )}
                {shopTickets.map((ticket: Job) => (
                    <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onClick={() => { void navigate(`/s/ticket/${ticket.id}`); }}
                        variant="staff"
                    />
                ))}
            </div>
        </div>
    );
};

export default S_Board;
