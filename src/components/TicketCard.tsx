import type { Job } from '../context/AppTypes';
import { SERVICE_STAGES } from '../context/AppTypes';
import { getStageColor } from '../utils/stageColors';
import { useJobs } from '../context/useJobs';
import React from 'react';
import { motion } from 'framer-motion';

interface TicketCardProps {
    ticket: Job;
    onClick: () => void;
    variant?: 'client' | 'staff';
}

/* ── Segmented progress bar — recessed LED style ── */
const SegmentedBar: React.FC<{ stageIndex: number; size?: 'sm' | 'md' }> = ({ stageIndex, size = 'md' }) => {
    const h = size === 'sm' ? 'h-2' : 'h-2.5';
    return (
        <div className={`flex gap-1.5 w-full ${h} depth-track p-0.5 rounded-full`}>
            {SERVICE_STAGES.map((stageName, idx) => {
                const isCompleted = idx < stageIndex;
                const isActive = idx === stageIndex;
                const isFilled = isCompleted || isActive;
                const color = getStageColor(idx, SERVICE_STAGES.length);
                return (
                    <div
                        key={stageName}
                        style={{
                            '--segment-bg': isFilled ? color : 'transparent',
                            '--segment-border': isFilled ? '1px solid rgba(255,255,255,0.2)' : 'none',
                            '--segment-color': color
                        } as React.CSSProperties}
                        className={`flex-1 rounded-full transition-all duration-500 relative depth-gloss bg-[var(--segment-bg)] border-[var(--segment-border)] ${isFilled ? 'opacity-100' : 'opacity-10'} ${isActive ? 'ticket-segment-active' : ''}`}
                    >
                        {isActive && (
                            <motion.div
                                animate={{ opacity: [0.4, 0.8, 0.4] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-white/20 rounded-full"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick, variant = 'staff' }) => {
    const { deleteJob } = useJobs();
    const storedRole = localStorage.getItem('staffRole') ?? 'staff';
    const isOwner = storedRole.toLowerCase() === 'owner';
    const isPaid = ticket.financials?.invoice?.status === 'paid';

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`DELETE TICKET ${ticket.id}?`)) {
            await deleteJob(ticket.id);
        }
    };
    if (variant === 'client') {
        return (
            <button
                onClick={onClick}
                className="w-full text-left depth-raised depth-gloss p-0 overflow-hidden hover:scale-[1.01] active:depth-pressed transition-all group rounded-2xl"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight">{ticket.vehicle}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Service Bay Software Center</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="size-10 depth-track rounded-xl flex items-center justify-center border border-white/5 overflow-hidden shrink-0">
                                {ticket.vehicleImage ? (
                                    <img src={ticket.vehicleImage} alt={ticket.vehicle} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-primary">directions_car</span>
                                )}
                            </div>
                            {isPaid && (
                                <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-1 shrink-0">
                                    <span className="material-symbols-outlined text-[10px] text-emerald-400">check_circle</span>
                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Paid</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Current Stage</span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{SERVICE_STAGES[ticket.stageIndex]}</span>
                        </div>
                        <SegmentedBar stageIndex={ticket.stageIndex} />
                    </div>
                </div>
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className="w-full text-left depth-raised depth-gloss hover:border-primary/30 active:depth-pressed transition-all group relative p-5 rounded-2xl"
        >
            <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight leading-tight line-clamp-2 mb-1">
                        {ticket.vehicle}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                        {ticket.client}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-slate-500 depth-track px-2 py-1 rounded-md border border-white/5 uppercase tracking-[0.2em]">
                            {ticket.id}
                        </span>
                        <div className="size-8 rounded-lg overflow-hidden border border-white/5 depth-track shadow-inner">
                            {ticket.vehicleImage ? (
                                <img src={ticket.vehicleImage} alt={ticket.vehicle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-sm">directions_car</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {isPaid && (
                        <div className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center gap-1">
                            <span className="material-symbols-outlined text-[8px] text-emerald-400">check_circle</span>
                            <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">Paid</span>
                        </div>
                    )}
                    {isOwner && variant === 'staff' && (
                        <button
                            onClick={(e) => { void handleDelete(e); }}
                            className="size-8 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/40 flex items-center justify-center hover:bg-red-500 hover:text-white hover:text-opacity-100 hover:border-red-500 transition-all active:scale-90"
                        >
                            <span className="material-symbols-outlined text-base">close</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <SegmentedBar stageIndex={ticket.stageIndex} size="sm" />
                <div className="flex justify-end">
                    <div className="flex items-center gap-1.5 opacity-80">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,178,0,0.5)] depth-led" />
                        <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em] whitespace-nowrap">
                            {SERVICE_STAGES[ticket.stageIndex]}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
};

export default TicketCard;
