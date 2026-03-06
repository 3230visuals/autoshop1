import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoice, saveInvoice } from '../../services/invoiceService';
import type { Invoice } from '../../services/invoiceService';
import { useJobs } from '../../context/useJobs';

const PLATFORM_FEE_RATE = 0.01; // 1%

const C_Payment: React.FC = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const { jobs, updateJob } = useJobs();

    const invoice = useMemo((): Invoice | null => {
        if (!ticketId) return null;

        // Try Supabase financials first (embedded invoice)
        const job = jobs.find(j => j.id === ticketId);
        const financials = job?.financials as { invoice?: Omit<Invoice, 'ticketId' | 'shopId'> } | undefined;
        if (financials?.invoice) {
            const inv = financials.invoice;
            return {
                ticketId,
                shopId: job?.shopId ?? '',
                items: inv.items ?? [],
                laborHours: inv.laborHours ?? 0,
                laborRate: inv.laborRate ?? 95,
                taxRate: inv.taxRate ?? 0.0825,
                status: inv.status ?? 'draft',
                createdAt: inv.createdAt ?? 0,
            };
        }

        // Fallback to localStorage
        return getInvoice(ticketId);
    }, [ticketId, jobs]);

    const [isRedirecting, setIsRedirecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!invoice || invoice.status === 'paid') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-600">receipt_long</span>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    {invoice?.status === 'paid' ? 'Already Paid' : 'No Invoice Found'}
                </h2>
                <p className="text-sm text-slate-500">
                    {invoice?.status === 'paid'
                        ? 'This invoice has already been paid. Thank you!'
                        : 'The shop has not sent an invoice for this ticket yet.'}
                </p>
                <button onClick={() => { void navigate(-1); }} className="h-14 px-8 bg-primary text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all">
                    Go Back
                </button>
            </div>
        );
    }

    // Calculate amounts
    const partsTotal = invoice.items.reduce((s, i) => s + i.price, 0);
    const laborTotal = invoice.laborHours * invoice.laborRate;
    const subtotal = partsTotal + laborTotal;
    const tax = subtotal * invoice.taxRate;
    const repairTotal = subtotal + tax;
    const platformFee = Math.round(repairTotal * PLATFORM_FEE_RATE * 100) / 100;
    const grandTotal = repairTotal + platformFee;

    const handleStripeCheckout = async () => {
        setIsRedirecting(true);
        setError(null);

        // Simulated Payment Lag for premium feel
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            if (invoice && ticketId) {
                const paidInvoice = { ...invoice, status: 'paid' as const };

                // 1. Save to localStorage (persistent storage)
                saveInvoice(paidInvoice);

                // 2. Update the job's financials in JobContext (in-memory state)
                const partsTotal = invoice.items.reduce((s, i) => s + i.price, 0);
                const laborTotal = invoice.laborHours * invoice.laborRate;
                const subtotal = partsTotal + laborTotal;
                const tax = subtotal * (invoice.taxRate);
                const total = subtotal + tax;

                void updateJob(ticketId, {
                    financials: {
                        subtotal,
                        tax,
                        total,
                        invoice: {
                            items: invoice.items,
                            laborHours: invoice.laborHours,
                            laborRate: invoice.laborRate,
                            taxRate: invoice.taxRate,
                            status: 'paid',
                            createdAt: invoice.createdAt,
                        },
                    },
                });

                // 3. Broadcast to other tabs for instant sync
                try {
                    const bc = new BroadcastChannel('servicebay_sync');
                    bc.postMessage({ type: 'PAYMENT_RECEIVED', ticketId, status: 'paid' });
                    bc.close();
                } catch { /* BroadcastChannel not supported — localStorage fallback covers it */ }

                // 4. Fire storage event for same-tab listeners
                window.dispatchEvent(new StorageEvent('storage', {
                    key: `invoice:${ticketId}`,
                    newValue: JSON.stringify(paidInvoice)
                }));

                void navigate(`/c/ticket/${ticketId}/pay/success`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment failed');
            setIsRedirecting(false);
        }
    };

    const getItemIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('brake')) return 'settings_suggest';
        if (lower.includes('oil')) return 'oil_barrel';
        if (lower.includes('tire') || lower.includes('alignment')) return 'tire_repair';
        if (lower.includes('battery')) return 'battery_charging_full';
        if (lower.includes('diagnostic')) return 'search';
        return 'build';
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] pb-56">
            {/* Redirecting Overlay */}
            {isRedirecting && (
                <div className="fixed inset-0 z-[100] bg-[#0a0a0c]/98 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center">
                    <div className="relative size-32 mb-8">
                        <div className="absolute inset-0 border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                        <div className="absolute inset-4 border border-white/5 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-emerald-400 animate-pulse">lock</span>
                        </div>
                    </div>
                    <h2 className="text-base font-bold text-white uppercase tracking-[0.2em] mb-3">Redirecting to Stripe</h2>
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">Secure Checkout</p>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-20 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5 safe-top">
                <div className="flex items-center px-6 py-5">
                    <button onClick={() => { void navigate(-1); }} className="size-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                    </button>
                    <div className="flex-1 text-center">
                        <h1 className="text-sm font-bold tracking-[0.2em] text-white uppercase">Payment</h1>
                        <div className="flex items-center gap-2 justify-center mt-1.5">
                            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Stripe Connect</span>
                        </div>
                    </div>
                    <div className="size-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-emerald-400">
                        <span className="material-symbols-outlined text-xl">verified_user</span>
                    </div>
                </div>
            </header>

            <main className="px-6 py-6 space-y-6">
                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-400">error</span>
                        <p className="text-sm text-red-400 font-bold">{error}</p>
                    </div>
                )}

                {/* Invoice Breakdown */}
                <section className="bg-card-dark border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-slate-500">receipt_long</span>
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Repair Breakdown</h2>
                    </div>
                    <div className="space-y-3">
                        {invoice.items.map((item) => (
                            <div key={`${item.name}-${item.price}`} className="flex justify-between items-center">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="size-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-sm text-slate-500">{getItemIcon(item.name)}</span>
                                    </div>
                                    <p className="text-sm font-bold text-white truncate">{item.name}</p>
                                </div>
                                <p className="text-sm font-bold text-white tabular-nums ml-3">${item.price.toFixed(2)}</p>
                            </div>
                        ))}
                        {invoice.laborHours > 0 && (
                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-lg bg-white/5 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm text-slate-500">schedule</span>
                                    </div>
                                    <p className="text-sm font-bold text-white">Labor ({invoice.laborHours}h &times; ${invoice.laborRate}/hr)</p>
                                </div>
                                <p className="text-sm font-bold text-white tabular-nums">${laborTotal.toFixed(2)}</p>
                            </div>
                        )}
                    </div>

                    {/* Totals */}
                    <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold">Subtotal</span>
                            <span className="text-white font-bold tabular-nums">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold">Tax ({(invoice.taxRate * 100).toFixed(2)}%)</span>
                            <span className="text-white font-bold tabular-nums">${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                            <span className="text-slate-400 font-bold">Repair Total</span>
                            <span className="text-white font-black tabular-nums">${repairTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                {/* Platform Fee — Clearly Labeled */}
                <section className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-lg">toll</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white">Platform Fee (1%)</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Service processing fee</p>
                            </div>
                        </div>
                        <span className="text-lg font-black text-primary tabular-nums">${platformFee.toFixed(2)}</span>
                    </div>
                </section>

                {/* Powered by Stripe */}
                <div className="flex items-center justify-center gap-3 py-2 opacity-40">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Powered by</span>
                    <svg width="48" height="20" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12.5C5 7.25 8.5 4 13 4C15.5 4 17.5 5 19 6.5L17 9C16 8 14.5 7 13 7C10 7 8 9.5 8 12.5C8 15.5 10 18 13 18C14.5 18 16 17 17 16L19 18.5C17.5 20 15.5 21 13 21C8.5 21 5 17.75 5 12.5Z" fill="#6772E5" />
                        <text x="20" y="18" fill="#6772E5" fontSize="14" fontFamily="Arial" fontWeight="bold">Stripe</text>
                    </svg>
                </div>
            </main>

            {/* Sticky Pay Footer */}
            <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#0a0a0c]/90 backdrop-blur-2xl border-t border-white/5 safe-bottom">
                <div className="max-w-[430px] mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Total Due</p>
                            <p className="text-3xl font-black text-white tabular-nums tracking-tight">${grandTotal.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Includes</p>
                            <p className="text-sm font-bold text-primary tabular-nums">1% fee: ${platformFee.toFixed(2)}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => void handleStripeCheckout()}
                        disabled={isRedirecting}
                        className="w-full h-16 bg-emerald-500 text-white rounded-2xl font-black uppercase text-sm tracking-[0.3em] flex items-center justify-center gap-4 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-2xl">payments</span>
                        {isRedirecting ? 'Redirecting...' : 'Pay with Stripe'}
                    </button>
                    <div className="flex items-center justify-center gap-6 mt-4 opacity-50">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-slate-500">encrypted</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">256-bit SSL</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-slate-500">verified</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">PCI Compliant</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default C_Payment;
