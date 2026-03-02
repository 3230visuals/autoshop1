import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getInvoice } from '../../services/invoiceService';

interface PaymentRecord {
    ticketId: string;
    shopId: string;
    sessionId: string;
    amountTotal: number;
    currency: string;
    status: string;
    paidAt?: string;
}

const C_PaymentSuccess: React.FC = () => {
    const { ticketId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');

    const [payment, setPayment] = useState<PaymentRecord | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = () => {
            if (ticketId) {
                const invoice = getInvoice(ticketId);
                if (invoice) {
                    if (invoice.status === 'paid') {
                        setPayment({
                            ticketId: invoice.ticketId,
                            shopId: invoice.shopId,
                            sessionId: 'MOCK_SESSION_' + Date.now(),
                            amountTotal: Math.round((invoice.items.reduce((s, i) => s + i.price, 0) + (invoice.laborHours * invoice.laborRate)) * (1 + invoice.taxRate) * 1.01 * 100),
                            currency: 'usd',
                            status: 'paid',
                            paidAt: new Date().toISOString()
                        });
                    }
                    setLoading(false);
                }
            }
        };

        const timer = setTimeout(checkStatus, 1500); // Small delay for effect
        return () => clearTimeout(timer);
    }, [ticketId]);

    const isPaid = payment?.status === 'paid';
    const amountDisplay = payment?.amountTotal
        ? `$${(payment.amountTotal / 100).toFixed(2)}`
        : null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-8">
            {loading ? (
                <>
                    <div className="relative size-24">
                        <div className="absolute inset-0 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                        <div className="absolute inset-4 border border-white/5 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl text-primary animate-pulse">sync</span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Confirming Payment</h2>
                        <p className="text-sm text-slate-500">Waiting for confirmation from Stripe...</p>
                    </div>
                </>
            ) : isPaid ? (
                <>
                    <div className="size-28 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                        <span className="material-symbols-outlined text-6xl text-emerald-400">check_circle</span>
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Payment Complete</h2>
                        {amountDisplay && (
                            <p className="text-4xl font-black text-emerald-400 tabular-nums mb-4">{amountDisplay}</p>
                        )}
                        <p className="text-sm text-slate-500 max-w-[300px] mx-auto">
                            Your payment has been processed securely via Stripe. The shop has been notified.
                        </p>
                    </div>

                    {/* Receipt Info */}
                    <div className="bg-card-dark border border-white/5 rounded-2xl p-5 w-full max-w-sm space-y-3">
                        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Receipt</h3>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold">Ticket</span>
                            <span className="text-white font-bold">{ticketId}</span>
                        </div>
                        {sessionId && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-bold">Session</span>
                                <span className="text-white font-mono text-xs truncate ml-4 max-w-[180px]">{sessionId}</span>
                            </div>
                        )}
                        {payment?.paidAt && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-bold">Paid</span>
                                <span className="text-white font-bold">{new Date(payment.paidAt).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => { void navigate(`/c/ticket/${ticketId}`); }}
                        className="h-14 px-10 bg-primary text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        Back to Ticket
                    </button>
                </>
            ) : (
                <>
                    <div className="size-24 bg-amber-500/10 rounded-full flex items-center justify-center border-2 border-amber-500/20">
                        <span className="material-symbols-outlined text-5xl text-amber-400">hourglass_top</span>
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Payment Pending</h2>
                        <p className="text-sm text-slate-500 max-w-[300px] mx-auto">
                            We are waiting for confirmation. This usually takes a few seconds.
                            If you completed payment, it will update automatically.
                        </p>
                    </div>

                    <button
                        onClick={() => { void navigate(`/c/ticket/${ticketId}`); }}
                        className="h-14 px-8 bg-white/5 text-slate-400 rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all"
                    >
                        Back to Ticket
                    </button>
                </>
            )}
        </div>
    );
};

export default C_PaymentSuccess;
