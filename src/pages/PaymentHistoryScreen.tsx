import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import type { PaymentRecord } from '../context/AppTypes';

// Utility: format timestamp
const FMT_DATE = (ts: number) =>
    new Date(ts).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const FMT_TIME = (ts: number) =>
    new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// Payment method icon
function MethodIcon({ method }: { method: string }) {
    if (method.toLowerCase().includes('apple'))
        return <span className="text-white font-bold text-xs bg-black px-2 py-0.5 rounded">  </span>;
    if (method.toLowerCase().includes('google'))
        return <span className="font-bold text-base text-primary">G</span>;
    return <span className="material-symbols-outlined text-[16px] text-slate-400">credit_card</span>;
}

const PaymentHistoryScreen = () => {
    const navigate = useNavigate();
    const { paymentHistory } = useAppContext();
    const [expanded, setExpanded] = useState<string | null>(null);

    const totalRevenue = paymentHistory.reduce((s, p) => s + p.total, 0);
    const totalTips = paymentHistory.reduce((s, p) => s + p.tipAmount, 0);

    // Group by day
    const groups: { label: string; records: PaymentRecord[] }[] = [];
    const seen = new Set<string>();
    for (const rec of paymentHistory) {
        const dayKey = new Date(rec.paidAt).toDateString();
        if (!seen.has(dayKey)) {
            seen.add(dayKey);
            const label = (() => {
                const d = new Date(rec.paidAt);
                const today = new Date();
                const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
                if (d.toDateString() === today.toDateString()) return 'Today';
                if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
                return FMT_DATE(rec.paidAt);
            })();
            groups.push({ label, records: paymentHistory.filter(r => new Date(r.paidAt).toDateString() === dayKey) });
        }
    }

    return (
        <div className="bg-zinc-950 text-slate-100 min-h-screen flex flex-col font-body pb-32">
            {/* Ambient Background Glows */}
            <div className="glow-mesh top-[-100px] left-[-100px] opacity-20" />
            <div className="glow-mesh bottom-[-100px] right-[-100px] opacity-10" />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-zinc-950/40 backdrop-blur-xl border-b border-white/5 px-5 py-5 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 transition-colors active:scale-90 premium-press">
                    <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                </button>
                <div>
                    <h1 className="font-display text-xl font-black italic glass-text">Payment History</h1>
                    <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-black mt-0.5">{paymentHistory.length} ledger entries</p>
                </div>
            </header>

            {/* Revenue summary cards */}
            <div className="px-5 pt-5 grid grid-cols-3 gap-4">
                <div className="liquid-glass rounded-2xl border border-white/5 p-4 text-center shadow-lg">
                    <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500 mb-1.5">Net Flow</p>
                    <p className="text-lg font-black text-primary font-display italic glass-text">${totalRevenue.toFixed(0)}</p>
                </div>
                <div className="liquid-glass rounded-2xl border border-white/5 p-4 text-center shadow-lg">
                    <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500 mb-1.5">Entries</p>
                    <p className="text-lg font-black text-white font-display italic glass-text">{paymentHistory.length}</p>
                </div>
                <div className="liquid-glass rounded-2xl border border-white/5 p-4 text-center shadow-lg">
                    <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500 mb-1.5">Gratiuty</p>
                    <p className="text-lg font-black text-emerald-400 font-display italic glass-text">${totalTips.toFixed(0)}</p>
                </div>
            </div>

            {/* Empty state */}
            {paymentHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 gap-3 py-24">
                    <span className="material-symbols-outlined text-slate-600 text-[52px]">receipt_long</span>
                    <p className="text-slate-500 text-sm">No payments recorded yet</p>
                </div>
            )}

            {/* Transaction list grouped by day */}
            <div className="px-5 mt-8 space-y-8">
                {groups.map(group => (
                    <div key={group.label}>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 px-2">{group.label}</p>
                        <div className="space-y-4">
                            {group.records.map(rec => {
                                const isOpen = expanded === rec.id;
                                return (
                                    <div key={rec.id} className="liquid-glass rounded-3xl border border-white/5 overflow-hidden shadow-xl transition-all hover:border-white/10">
                                        {/* Row */}
                                        <button
                                            onClick={() => setExpanded(isOpen ? null : rec.id)}
                                            className="w-full flex items-center gap-4 p-5 text-left active:bg-white/5 transition-all premium-press"
                                        >
                                            {/* Avatar / icon */}
                                            <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                                                <span className="material-symbols-outlined text-emerald-400 text-[24px]">payments</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-[15px] text-white italic truncate">{rec.vehicle}</p>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 truncate">{rec.orderNumber} • {FMT_TIME(rec.paidAt)}</p>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                <p className="font-black text-[17px] text-emerald-400 font-display italic glass-text">+${rec.total.toFixed(2)}</p>
                                                <div className="flex items-center gap-2 justify-end mt-1">
                                                    <MethodIcon method={rec.paymentMethod} />
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{rec.paymentMethod}</span>
                                                </div>
                                            </div>

                                            <span className={`material-symbols-outlined text-slate-700 text-[20px] transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}>expand_more</span>
                                        </button>

                                        {/* Expanded details */}
                                        {isOpen && (
                                            <div className="border-t border-white/5 px-5 py-5 space-y-4 bg-zinc-950/20 animate-in slide-in-from-top-2 duration-300">
                                                {/* Service items */}
                                                <div className="space-y-2">
                                                    {rec.items.map(item => (
                                                        <div key={item.name} className="flex justify-between items-center text-[13px] font-bold">
                                                            <span className="text-slate-400 uppercase tracking-tighter text-[11px]">{item.name}</span>
                                                            <span className="text-white font-black">${item.price.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Totals breakdown */}
                                                <div className="border-t border-white/5 pt-4 space-y-2">
                                                    <div className="flex justify-between text-[11px] font-black text-slate-600 uppercase tracking-widest">
                                                        <span>Subtotal</span><span>${rec.subtotal.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[11px] font-black text-slate-600 uppercase tracking-widest">
                                                        <span>Tax Est.</span><span>${rec.tax.toFixed(2)}</span>
                                                    </div>
                                                    {rec.tipAmount > 0 && (
                                                        <div className="flex justify-between text-[11px] font-black text-emerald-500 uppercase tracking-widest">
                                                            <span>Gratuity</span><span>+${rec.tipAmount.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center text-[16px] font-black text-white pt-3 border-t border-white/5 font-display italic">
                                                        <span className="glass-text">Total Settlement</span><span className="text-emerald-400 glass-text">${rec.total.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] pt-2">
                                                    <span className="material-symbols-outlined text-[14px]">verified</span>
                                                    Finalized {FMT_DATE(rec.paidAt)} · PROCESSED
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentHistoryScreen;
