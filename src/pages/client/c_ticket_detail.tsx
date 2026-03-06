import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProgressBar7Stage from '../../components/ProgressBar7Stage';
import VehicleProfileHeader from '../../components/VehicleProfileHeader';
import { SERVICE_STAGES } from '../../context/AppTypes';
import type { Job } from '../../context/AppTypes';
import { useJobs } from '../../context/useJobs';
import { SkeletonDetail } from '../../components/common/Skeletons';
import { getInvoice } from '../../services/invoiceService';
import type { InvoiceLineItem, Invoice } from '../../services/invoiceService';

const STATUS_DESCRIPTIONS: Record<string, string> = {
    'Checked In': 'Your vehicle has been received and is now in our system.',
    'Diagnosing': 'Our technician is running diagnostics to identify the issue.',
    'Waiting Approval': 'Issue identified. Please review and approve the invoice.',
    'Repair In Progress': 'Your vehicle is actively being repaired. Sit tight!',
    'Quality Check': 'Repairs are complete. Running final quality inspection.',
    'Ready for Pickup': 'Your vehicle is ready! Come pick it up at your convenience.',
    'Completed': 'Service complete. Thank you for choosing us!',
};

/* ── Inspection Check Item type (mirrors staff inspection) ── */
interface CheckItem {
    label: string;
    icon: string;
    status: 'pass' | 'fail' | 'pending';
}

const C_TicketDetail: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const { jobs, isLoading } = useJobs();

    const ticket = jobs.find((j: Job) => j.id === ticketId);

    /* ── Invoice state with live sync ── */
    const [liveInvoice, setLiveInvoice] = useState<Invoice | null>(null);

    const refreshInvoice = useCallback(() => {
        if (!ticketId) return;
        // Check job financials first
        const job = jobs.find(j => j.id === ticketId);
        const financials = job?.financials as { invoice?: Omit<Invoice, 'ticketId' | 'shopId'> } | undefined;
        if (financials?.invoice) {
            const inv = financials.invoice;
            setLiveInvoice({
                ticketId,
                shopId: job?.shopId ?? '',
                items: inv.items ?? [],
                laborHours: inv.laborHours ?? 0,
                laborRate: inv.laborRate ?? 95,
                taxRate: inv.taxRate ?? 0.0825,
                status: inv.status ?? 'draft',
                createdAt: inv.createdAt ?? 0,
            });
            return;
        }
        // Fallback to localStorage
        setLiveInvoice(getInvoice(ticketId));
    }, [ticketId, jobs]);

    useEffect(() => {
        refreshInvoice();
    }, [refreshInvoice]);

    // Listen for invoice changes from other tabs (e.g. staff sends invoice)
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === `invoice:${ticketId}`) refreshInvoice();
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, [ticketId, refreshInvoice]);

    const total = useMemo(() => {
        if (!liveInvoice || !Array.isArray(liveInvoice.items)) return 0;
        const subtotal = liveInvoice.items.reduce((s: number, i: InvoiceLineItem) => s + (i.price || 0), 0) + ((liveInvoice.laborHours || 0) * (liveInvoice.laborRate || 0));
        const tax = subtotal * ((liveInvoice.taxRate || 0) / 100);
        return subtotal + tax;
    }, [liveInvoice]);

    /* ── Inspection report state with live sync ── */
    const [inspectionChecks, setInspectionChecks] = useState<CheckItem[]>([]);

    const refreshInspection = useCallback(() => {
        if (!ticketId) return;
        const raw = localStorage.getItem(`inspection:${ticketId}`);
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as CheckItem[];
                if (Array.isArray(parsed)) setInspectionChecks(parsed);
            } catch { /* ignore */ }
        } else {
            setInspectionChecks([]);
        }
    }, [ticketId]);

    useEffect(() => {
        refreshInspection();
    }, [refreshInspection]);

    // Listen for inspection changes from staff portal (cross-tab)
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === `inspection:${ticketId}`) refreshInspection();
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, [ticketId, refreshInspection]);

    // Also poll every 2s for same-tab updates (same origin, no StorageEvent dispatched)
    useEffect(() => {
        const interval = setInterval(() => {
            refreshInspection();
            refreshInvoice();
        }, 2000);
        return () => clearInterval(interval);
    }, [refreshInspection, refreshInvoice]);

    if (isLoading) return <SkeletonDetail />;

    /* ── NOT FOUND STATE ── */
    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6 text-center">
                <div className="size-20 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-slate-600">search_off</span>
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Ticket Not Found</h2>
                <p className="text-sm text-slate-500 max-w-[260px]">
                    The ticket ID <span className="text-primary font-bold">{ticketId ?? '\u2014'}</span> does not exist or may have been removed.
                </p>
                <button
                    onClick={() => { void navigate('/c/track'); }}
                    className="h-14 px-8 bg-primary text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const stageName = SERVICE_STAGES[ticket.stageIndex] ?? 'Unknown';
    const stageDesc = STATUS_DESCRIPTIONS[stageName] ?? 'Status update pending.';

    // Inspection stats
    const passCount = inspectionChecks.filter(c => c.status === 'pass').length;
    const failCount = inspectionChecks.filter(c => c.status === 'fail').length;
    const hasInspection = inspectionChecks.length > 0;
    const invoiceIsPaid = liveInvoice?.status === 'paid';

    return (
        <div className="min-h-screen bg-background-dark relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[120px] rounded-full" /></div>

            <div className="p-6 relative z-10 safe-top">
                <VehicleProfileHeader
                    vehicle={ticket.vehicle}
                    customerName={ticket.client}
                    ticketId={ticket.id}
                    vehicleImage={ticket.vehicleImage}
                    onBack={() => { void navigate('/c/home'); }}
                />

                <div className="bg-card-dark border border-white/5 rounded-[2.5rem] p-6 mb-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-md">
                            <span className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_var(--primary-muted)]" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live Tracking</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-8">
                        <ProgressBar7Stage
                            currentStageIndex={ticket.stageIndex}
                            role="CLIENT"
                        />
                    </div>

                    {/* ── LIVE STATUS RELAY ── */}
                    <div className="mt-5 bg-primary/5 border border-primary/10 rounded-2xl p-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <div className="flex items-center gap-3 mb-1">
                            <span className="size-2 bg-primary rounded-full animate-pulse" />
                            <h3 className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">
                                Current Status
                            </h3>
                        </div>
                        <p className="text-base font-black text-white uppercase tracking-tight leading-tight">
                            {stageName}
                        </p>
                        <p className="text-[12px] text-slate-400 mt-1 leading-relaxed font-medium">
                            {stageDesc}
                        </p>
                    </div>

                    {/* ── INSPECTION (compact — only stats + failed items) ── */}
                    {hasInspection && (
                        <div className="mt-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-400 text-base">fact_check</span>
                                    <h3 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Inspection</h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-emerald-400">{passCount} Pass</span>
                                    {failCount > 0 && <span className="text-[9px] font-black text-red-400">{failCount} Fail</span>}
                                    <span className="text-[9px] font-bold text-slate-600">{inspectionChecks.length} Total</span>
                                </div>
                            </div>
                            {/* Only show failed items to keep it short */}
                            {failCount > 0 && (
                                <div className="mt-3 space-y-1.5">
                                    {inspectionChecks.filter(c => c.status === 'fail').map(item => (
                                        <div key={item.label} className="flex items-center gap-2 py-1 px-2 bg-red-500/5 rounded-lg">
                                            <span className="material-symbols-outlined text-sm text-red-400">cancel</span>
                                            <span className="text-xs font-semibold text-red-300">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Service notes (hidden when paid — no longer relevant) ── */}
                    {!invoiceIsPaid && (
                        <div className="mt-4">
                            <div className="bg-white/2 p-4 rounded-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all" />
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Service Notes</p>
                                <p className="text-[12px] text-slate-300 leading-relaxed font-medium">{ticket.notes ?? 'No description provided'}</p>
                            </div>
                        </div>
                    )}

                    {/* ── INVOICE / PAYMENT STATUS ── */}
                    {liveInvoice && (liveInvoice.status === 'sent' || invoiceIsPaid) && (
                        invoiceIsPaid ? (
                            /* ✅ Compact paid badge — single row */
                            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-400">verified</span>
                                    <div>
                                        <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Invoice Paid</h3>
                                        <p className="text-[8px] text-emerald-500/50 mt-0.5 font-bold uppercase tracking-wider">Verified via Stripe</p>
                                    </div>
                                </div>
                                <span className="text-base font-black text-white tabular-nums">${total.toFixed(2)}</span>
                            </div>
                        ) : (
                            /* Unpaid — show full Pay Now button */
                            <div className="mt-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-400">receipt_long</span>
                                        <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Invoice Ready</h3>
                                    </div>
                                    <span className="text-lg font-black text-white tabular-nums">${total.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-4">
                                    {liveInvoice.items.length} item{liveInvoice.items.length !== 1 ? 's' : ''}
                                    {liveInvoice.laborHours > 0 ? ` + ${liveInvoice.laborHours}h labor` : ''}
                                </p>
                                <button
                                    onClick={() => { void navigate(`/c/ticket/${ticket.id}/pay`); }}
                                    className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">payments</span>
                                    Pay Now
                                </button>
                            </div>
                        )
                    )}

                    <button
                        onClick={() => { void navigate(`/c/ticket/${ticket.id}/messages`); }}
                        className="w-full h-12 bg-primary text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 mt-5 shadow-[0_16px_32px_var(--primary-muted)] active:scale-95 hover:brightness-110 transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">forum</span>
                        Message Mechanic
                    </button>
                </div>
            </div>
        </div>
    );
};

export default C_TicketDetail;
