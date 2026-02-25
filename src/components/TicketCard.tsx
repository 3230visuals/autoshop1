import type { Ticket } from '../utils/mockTickets';
import { SERVICE_STAGES } from '../utils/mockTickets';

interface TicketCardProps {
    ticket: Ticket;
    onClick: () => void;
    variant?: 'client' | 'staff';
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick, variant = 'staff' }) => {
    const progress = ((ticket.stageIndex + 1) / SERVICE_STAGES.length) * 100;

    if (variant === 'client') {
        return (
            <button
                onClick={onClick}
                className="w-full text-left bg-card-dark border border-white/5 rounded-2xl p-0 overflow-hidden hover:border-primary/30 transition-all group shadow-xl"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">{ticket.vehicle}</h3>
                            <p className="text-sm text-slate-500 font-medium">Houston First Service Center</p>
                        </div>
                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                            <span className="material-symbols-outlined text-primary">directions_car</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Current Stage</span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{SERVICE_STAGES[ticket.stageIndex]}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary shadow-[0_0_12px_var(--primary-muted)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
                {/* ... other code ... */}
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-card-dark border border-white/5 rounded-2xl p-5 hover:border-primary/30 transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">{ticket.vehicle}</h3>
                    <p className="text-xs text-slate-500 font-medium">{ticket.customerName}</p>
                </div>
                <span className="text-[9px] font-bold text-slate-600 bg-white/2 px-2 py-1 rounded-md border border-white/5 uppercase tracking-widest">
                    {ticket.id}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary shadow-[0_0_8px_var(--primary-muted)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">
                    {SERVICE_STAGES[ticket.stageIndex]}
                </span>
            </div>
        </button>

    );
};

export default TicketCard;
