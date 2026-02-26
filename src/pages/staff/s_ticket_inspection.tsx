import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findTicket, SERVICE_STAGES } from '../../utils/mockTickets';
import type { Ticket } from '../../utils/mockTickets';

/* ═══════════════════════════════════════════════════
   Inspection Checklist — /s/ticket/:ticketId/inspection
   ═══════════════════════════════════════════════════ */

interface CheckItem {
    label: string;
    icon: string;
    status: 'pass' | 'fail' | 'pending';
}

const DEFAULT_CHECKS: Omit<CheckItem, 'status'>[] = [
    { label: 'Visual / Body Inspection', icon: 'visibility' },
    { label: 'Tires & Alignment', icon: 'tire_repair' },
    { label: 'Brakes & Rotors', icon: 'do_not_disturb_on' },
    { label: 'Fluid Levels', icon: 'water_drop' },
    { label: 'Electrical / Battery', icon: 'bolt' },
    { label: 'Engine & Belts', icon: 'settings' },
    { label: 'Exhaust System', icon: 'air' },
    { label: 'Suspension & Steering', icon: 'swap_vert' },
];

const storageKey = (ticketId: string) => `inspection:${ticketId}`;

const loadChecks = (ticketId: string): CheckItem[] => {
    const raw = localStorage.getItem(storageKey(ticketId));
    if (raw) {
        try {
            const parsed = JSON.parse(raw) as CheckItem[];
            if (Array.isArray(parsed) && parsed.length === DEFAULT_CHECKS.length) return parsed;
        } catch { /* fall through */ }
    }
    return DEFAULT_CHECKS.map((c) => ({ ...c, status: 'pending' as const }));
};

const StaffInspection: React.FC = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [checks, setChecks] = useState<CheckItem[]>([]);

    useEffect(() => {
        if (!ticketId) { setNotFound(true); return; }
        const t = findTicket(ticketId);
        if (!t) { setNotFound(true); return; }
        setTicket(t);
        setChecks(loadChecks(ticketId));
    }, [ticketId]);

    const persist = useCallback((next: CheckItem[]) => {
        if (ticketId) localStorage.setItem(storageKey(ticketId), JSON.stringify(next));
    }, [ticketId]);

    const cycle = (index: number) => {
        setChecks((prev) => {
            const next = prev.map((c, i) => {
                if (i !== index) return c;
                const order: CheckItem['status'][] = ['pending', 'pass', 'fail'];
                const nextStatus = order[(order.indexOf(c.status) + 1) % order.length];
                return { ...c, status: nextStatus };
            });
            persist(next);
            return next;
        });
    };

    const passCount = checks.filter((c) => c.status === 'pass').length;
    const failCount = checks.filter((c) => c.status === 'fail').length;

    /* ── NOT FOUND STATE ── */
    if (notFound) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6 text-center">
                <div className="size-20 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-slate-600">search_off</span>
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Ticket Not Found</h2>
                <p className="text-sm text-slate-500 max-w-[260px]">
                    The ticket ID <span className="text-primary font-bold">{ticketId ?? '—'}</span> does not exist or has been removed.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="h-14 px-8 bg-primary text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!ticket) return null;

    /* ── MAIN VIEW ── */
    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <header className="px-6 pt-8 pb-6 border-b border-white/5">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Back to Ticket</span>
                </button>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Inspection</h1>
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.4em] mt-1">
                    {ticket.id} • {ticket.vehicle}
                </p>
            </header>

            {/* Ticket Summary */}
            <div className="p-6 space-y-6">
                <div className="bg-card-dark border border-white/5 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-white font-bold">{ticket.customerName}</p>
                            <p className="text-slate-500 text-xs">{ticket.vehicle}</p>
                        </div>
                        <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                            {SERVICE_STAGES[ticket.stageIndex]}
                        </span>
                    </div>
                    <p className="text-sm text-slate-400">{ticket.issue}</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-card-dark border border-white/5 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-white">{checks.length}</p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Total</p>
                    </div>
                    <div className="bg-card-dark border border-emerald-500/10 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-emerald-400">{passCount}</p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Pass</p>
                    </div>
                    <div className="bg-card-dark border border-red-500/10 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-red-400">{failCount}</p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Fail</p>
                    </div>
                </div>

                {/* Checklist */}
                <section className="space-y-3">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">Inspection Checklist</h3>
                    {checks.map((item, idx) => (
                        <button
                            key={item.label}
                            onClick={() => cycle(idx)}
                            className="w-full flex items-center gap-4 bg-card-dark border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all active:scale-[0.98] text-left"
                        >
                            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${item.status === 'pass' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                                item.status === 'fail' ? 'bg-red-500/10 border border-red-500/20' :
                                    'bg-white/5 border border-white/10'
                                }`}>
                                <span className={`material-symbols-outlined text-lg ${item.status === 'pass' ? 'text-emerald-400' :
                                    item.status === 'fail' ? 'text-red-400' :
                                        'text-slate-600'
                                    }`}>
                                    {item.status === 'pass' ? 'check_circle' :
                                        item.status === 'fail' ? 'cancel' :
                                            item.icon}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold ${item.status === 'pass' ? 'text-emerald-300' :
                                    item.status === 'fail' ? 'text-red-300' :
                                        'text-white'
                                    }`}>{item.label}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                                    Tap to cycle: {item.status}
                                </p>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${item.status === 'pass' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                item.status === 'fail' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                                    'text-slate-600 bg-white/5 border-white/10'
                                }`}>
                                {item.status}
                            </span>
                        </button>
                    ))}
                </section>
            </div>
        </div>
    );
};

export default StaffInspection;
