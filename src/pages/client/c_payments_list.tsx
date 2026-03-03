import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/useJobs';
import type { Job } from '../../context/AppTypes';
import { getInvoice } from '../../services/invoiceService';

interface FinancialsWithInvoice {
    subtotal?: number;
    tax?: number;
    total?: number;
    invoice?: {
        items: { name: string; price: number }[];
        laborHours: number;
        laborRate: number;
        taxRate: number;
        status: 'draft' | 'sent' | 'paid';
        createdAt: number;
    };
}

const C_PaymentsList: React.FC = () => {
    const navigate = useNavigate();
    const { jobs } = useJobs();

    const { pending, paid } = useMemo(() => {
        const pendingInvoices: { job: Job; total: number }[] = [];
        const paidInvoices: { job: Job; total: number }[] = [];

        jobs.forEach(job => {
            // Try Supabase financials first (contains embedded invoice)
            const financials = job.financials as FinancialsWithInvoice | undefined;
            const embeddedInvoice = financials?.invoice;

            if (embeddedInvoice) {
                // Invoice from Supabase
                const partsTotal = embeddedInvoice.items.reduce((s, i) => s + i.price, 0);
                const laborTotal = embeddedInvoice.laborHours * embeddedInvoice.laborRate;
                const subtotal = partsTotal + laborTotal;
                const tax = subtotal * embeddedInvoice.taxRate;
                const grandTotal = subtotal + tax + (subtotal + tax) * 0.01; // 1% platform fee

                if (embeddedInvoice.status === 'paid') {
                    paidInvoices.push({ job, total: grandTotal });
                } else if (embeddedInvoice.status === 'sent') {
                    pendingInvoices.push({ job, total: grandTotal });
                }
            } else {
                // Fallback to localStorage (demo mode)
                const invoice = getInvoice(job.id);
                if (invoice) {
                    const partsTotal = invoice.items.reduce((s, i) => s + i.price, 0);
                    const laborTotal = invoice.laborHours * invoice.laborRate;
                    const subtotal = partsTotal + laborTotal;
                    const tax = subtotal * invoice.taxRate;
                    const grandTotal = subtotal + tax + (subtotal + tax) * 0.01;

                    if (invoice.status === 'paid') {
                        paidInvoices.push({ job, total: grandTotal });
                    } else if (invoice.status === 'sent') {
                        pendingInvoices.push({ job, total: grandTotal });
                    }
                }
            }
        });

        return {
            pending: pendingInvoices,
            paid: paidInvoices,
        };
    }, [jobs]);

    return (
        <div className="min-h-screen pb-16">
            <header className="px-6 pt-10 pb-12 bg-client-hero-01 relative overflow-hidden safe-top text-center">
                <div className="hero-overlay absolute inset-0 z-10" />
                <div className="relative z-20 text-center">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                        Payments
                    </h1>
                    <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.4em] mt-2">Billing & History</p>
                </div>
            </header>

            <div className="p-6 -mt-8 relative z-30 space-y-8">
                {pending.length === 0 && paid.length === 0 && (
                    <div className="glass-card text-center py-10 mt-4">
                        <span className="material-symbols-outlined text-4xl text-slate-700 mb-4 block">receipt_long</span>
                        <p className="text-sm text-slate-500 font-medium">No invoices found for your account.</p>
                        <p className="text-[10px] text-slate-700 uppercase tracking-wider mt-2">Check back when your vehicle is ready.</p>
                    </div>
                )}

                {pending.length > 0 && (
                    <section>
                        <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-4 ml-1 flex items-center gap-2">
                            <span className="size-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]"></span>
                            Action Required
                        </h3>
                        <div className="space-y-4">
                            {pending.map(({ job, total }) => (
                                <div key={job.id} onClick={() => { void navigate(`/c/ticket/${job.id}/pay`); }} className="glass-card cursor-pointer hover:border-primary/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-white font-bold">{job.vehicle}</h4>
                                            <p className="text-xs text-slate-500 line-clamp-1">{job.service}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-wider rounded-md border border-yellow-500/20">
                                            Due
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                        <p className="text-xl font-black text-white">${total.toFixed(2)}</p>
                                        <button className="h-8 px-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 group-hover:bg-primary-hover transition-colors">
                                            Pay Now
                                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {paid.length > 0 && (
                    <section>
                        <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-4 ml-1">
                            Payment History
                        </h3>
                        <div className="space-y-3">
                            {paid.map(({ job, total }) => (
                                <div key={job.id} onClick={() => { void navigate(`/c/ticket/${job.id}`); }} className="bg-card-dark border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{job.vehicle}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Paid • ${total.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">chevron_right</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default C_PaymentsList;
