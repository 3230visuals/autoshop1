import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProgressBar7Stage from '../../components/ProgressBar7Stage';
import VehicleProfileHeader from '../../components/VehicleProfileHeader';
import { SERVICE_STAGES } from '../../context/AppTypes';
import type { Job } from '../../context/AppTypes';
import { useJobs } from '../../context/useJobs';
import { getInvoice } from '../../services/invoiceService';
import type { InvoiceLineItem } from '../../services/invoiceService';


const STATUS_DESCRIPTIONS: Record<string, string> = {
    'Checked In': 'Your vehicle has been received and is now in our system.',
    'Diagnosing': 'Our technician is running diagnostics to identify the issue.',
    'Waiting Approval': 'Issue identified. Please review and approve the invoice.',
    'Repair In Progress': 'Your vehicle is actively being repaired. Sit tight!',
    'Quality Check': 'Repairs are complete. Running final quality inspection.',
    'Ready for Pickup': 'Your vehicle is ready! Come pick it up at your convenience.',
    'Completed': 'Service complete. Thank you for choosing us!',
};

const C_TicketDetail: React.FC = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const { jobs } = useJobs();

    const ticket = jobs.find((j: Job) => j.id === ticketId);

    const invoice = useMemo(() => {
        if (!ticket?.id) return null;
        return getInvoice(ticket.id);
    }, [ticket?.id]);

    const total = useMemo(() => {
        if (!invoice || !Array.isArray(invoice.items)) return 0;
        const subtotal = invoice.items.reduce((s: number, i: InvoiceLineItem) => s + (i.price || 0), 0) + ((invoice.laborHours || 0) * (invoice.laborRate || 0));
        const tax = subtotal * ((invoice.taxRate || 0) / 100);
        return subtotal + tax;
    }, [invoice]);

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

                    {/* ── LIVE STATUS RELAY ── */}
                    <div className="mt-8 bg-primary/5 border border-primary/10 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <div className="flex items-center gap-3 mb-2">
                            <span className="size-2.5 bg-primary rounded-full animate-pulse" />
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                                Current Status
                            </h3>
                        </div>
                        <p className="text-lg font-black text-white uppercase tracking-tight leading-tight">
                            {stageName}
                        </p>
                        <p className="text-[13px] text-slate-400 mt-2 leading-relaxed font-medium">
                            {stageDesc}
                        </p>
                    </div>

                    <div className="mt-6 space-y-6">
                        <div className="bg-white/2 p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all" />
                            <p className="text-[10px] font-black uppercase text-slate-600 mb-2 tracking-widest">Invoice Ready</p>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Service Description</p>
                            <p className="text-[13px] text-slate-300 leading-relaxed font-medium uppercase tracking-wider">{ticket.notes ?? 'No description provided'}</p>
                        </div>
                    </div>

                    {/* ── PAY INVOICE (only shown when owner has sent one) ── */}
                    {invoice && (invoice.status === 'sent' || invoice.status === 'paid') && (
                        <div className="mt-8 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-400">receipt_long</span>
                                    <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">
                                        {invoice.status === 'paid' ? 'Invoice Paid' : 'Invoice Ready'}
                                    </h3>
                                </div>
                                <span className="text-lg font-black text-white tabular-nums">${total.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">
                                {invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}
                                {invoice.laborHours > 0 ? ` + ${invoice.laborHours}h labor` : ''}
                            </p>
                            {invoice.status !== 'paid' && (
                                <button
                                    onClick={() => { void navigate(`/c/ticket/${ticket.id}/pay`); }}
                                    className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">payments</span>
                                    Pay Now
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => { void navigate(`/c/ticket/${ticket.id}/messages`); }}
                        className="w-full h-18 bg-primary text-white rounded-[1.25rem] font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-4 mt-8 shadow-[0_20px_40px_var(--primary-muted)] active:scale-95 hover:brightness-110 transition-all"
                    >
                        <span className="material-symbols-outlined text-2xl">forum</span>
                        Message Mechanic
                    </button>

                </div >
            </div >
        </div >
    );
};

export default C_TicketDetail;
