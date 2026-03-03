import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/useJobs';
import { useAppContext } from '../../context/useAppContext';
import { getInvoice, saveInvoiceToSupabase } from '../../services/invoiceService';
import type { Invoice, InvoiceLineItem } from '../../services/invoiceService';
import { useAuth } from '../../context/AuthContext';

const StaffInvoice: React.FC = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const { jobs } = useJobs();
    const ticket = jobs.find(j => j.id === ticketId);
    const { showToast } = useJobs();
    const { serviceItems, sendInvite } = useAppContext();

    const { staffUser } = useAuth();
    const storedRole = staffUser?.role?.toLowerCase() ?? 'staff';
    const isOwner = storedRole.toLowerCase() === 'owner';

    const existingInvoice = useMemo(() => getInvoice(ticketId ?? ''), [ticketId]);

    const [items, setItems] = useState<InvoiceLineItem[]>(existingInvoice?.items ?? []);
    const [laborHours, setLaborHours] = useState(existingInvoice?.laborHours ?? 0);
    const [laborRate, setLaborRate] = useState(existingInvoice?.laborRate ?? 95);
    const [taxRate] = useState(existingInvoice?.taxRate ?? 0.0825);
    const [customName, setCustomName] = useState('');
    const [customPrice, setCustomPrice] = useState('');
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [status, setStatus] = useState<'draft' | 'sent' | 'paid'>(existingInvoice?.status ?? 'draft');

    const partsSubtotal = items.reduce((sum, i) => sum + i.price, 0);
    const laborTotal = laborHours * laborRate;
    const subtotal = partsSubtotal + laborTotal;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const addQuickItem = (item: { name: string; price: number }) => {
        setItems(prev => [...prev, { name: item.name, price: item.price }]);
    };

    const addCustomItem = () => {
        const price = parseFloat(customPrice);
        if (!customName.trim() || isNaN(price) || price <= 0) return;
        setItems(prev => [...prev, { name: customName.trim(), price }]);
        setCustomName('');
        setCustomPrice('');
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async (newStatus: 'draft' | 'sent' | 'paid') => {
        if (!ticket) return;
        const invoice: Invoice = {
            ticketId: ticket.id,
            shopId: ticket.shopId,
            items,
            laborHours,
            laborRate,
            taxRate,
            status: newStatus,
            createdAt: existingInvoice?.createdAt ?? Date.now(),
        };
        await saveInvoiceToSupabase(ticket.id, invoice);
        setStatus(newStatus);
    };

    const handleSendInApp = async () => {
        if (!ticket) return;
        try {
            // Save invoice to Supabase (jobs.financials JSONB)
            const invoice: Invoice = {
                ticketId: ticket.id,
                shopId: ticket.shopId,
                items,
                laborHours,
                laborRate,
                taxRate,
                status: 'sent',
                createdAt: existingInvoice?.createdAt ?? Date.now(),
            };
            await saveInvoiceToSupabase(ticket.id, invoice);
            setStatus('sent');

            showToast('✓ Invoice sent to client');
        } catch (err) {
            console.error('Failed to send in-app invoice:', err);
            showToast('Failed to send invoice. Please try again.');
        }
    };


    if (!ticket) return <div className="p-10 text-white font-black uppercase text-center">Ticket not found</div>;

    return (
        <div className="min-h-screen bg-page-dark-01">
            <header className="px-6 pt-4 pb-6 border-b border-white/5 safe-top bg-card-dark">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => { void navigate(-1); }} className="size-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-black text-white uppercase tracking-tight">Invoice Builder</h1>
                        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.4em] mt-1">
                            {ticket.id} &bull; {ticket.client}
                        </p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : status === 'sent' ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-white/5 border-white/10 text-slate-500'
                        }`}>
                        {status}
                    </div>
                </div>
            </header>

            <div className="p-6 space-y-6 pb-navbar-tall">
                {/* ── Line Items ── */}
                <section className="bg-card-dark border border-white/5 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Parts & Services</h3>
                        <button onClick={() => setShowQuickAdd(!showQuickAdd)} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            Quick Add
                        </button>
                    </div>

                    {/* Quick add grid */}
                    {showQuickAdd && (
                        <div className="grid grid-cols-2 gap-2">
                            {serviceItems.map((svc) => (
                                <button
                                    key={svc.id}
                                    onClick={() => { addQuickItem(svc); setShowQuickAdd(false); }}
                                    className="text-left bg-white/2 border border-white/5 rounded-xl p-3 hover:border-primary/20 transition-all active:scale-[0.97]"
                                >
                                    <p className="text-xs font-bold text-white truncate">{svc.name}</p>
                                    <p className="text-[10px] text-primary font-bold mt-1">${svc.price.toFixed(2)}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Existing items */}
                    {items.length === 0 ? (
                        <div className="text-center py-8">
                            <span className="material-symbols-outlined text-2xl text-slate-700 block mb-2">receipt_long</span>
                            <p className="text-xs text-slate-600">No line items yet. Tap Quick Add above.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div key={`item-${item.name}-${item.price}-${idx}`} className="flex items-center justify-between bg-white/2 border border-white/5 rounded-xl p-3 group">



                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-sm text-primary">build</span>
                                        </div>
                                        <p className="text-sm font-bold text-white truncate">{item.name}</p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-sm font-bold text-white tabular-nums">${item.price.toFixed(2)}</span>
                                        <button onClick={() => removeItem(idx)} className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center transition-all active:scale-95">
                                            <span className="material-symbols-outlined text-xs text-red-400">close</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Custom item */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Custom Item</p>
                        <div className="flex gap-2">
                            <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Service name" className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-primary/30" />
                            <input value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} placeholder="$0.00" type="number" className="w-24 h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-primary/30 tabular-nums" />
                            <button onClick={addCustomItem} className="size-10 rounded-xl bg-primary flex items-center justify-center text-white flex-shrink-0">
                                <span className="material-symbols-outlined text-lg">add</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Labor ── */}
                <section className="bg-card-dark border border-white/5 rounded-3xl p-6 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Labor</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Hours</label>
                            <input type="number" min="0" step="0.5" value={laborHours || ''} onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)} placeholder="0" className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-white text-sm outline-none focus:border-primary/30 tabular-nums" />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Rate/hr</label>
                            <input type="number" min="0" value={laborRate || ''} onChange={(e) => setLaborRate(parseFloat(e.target.value) || 0)} placeholder="95" className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-white text-sm outline-none focus:border-primary/30 tabular-nums" />
                        </div>
                    </div>
                    {laborTotal > 0 && (
                        <div className="flex justify-between text-sm font-bold text-slate-400">
                            <span>{laborHours}h x ${laborRate}/hr</span>
                            <span className="text-white">${laborTotal.toFixed(2)}</span>
                        </div>
                    )}
                </section>

                {/* ── Totals ── */}
                <section className="bg-card-dark border border-white/5 rounded-3xl p-6 space-y-3">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Summary</h3>
                    <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-500">Parts & Services</span>
                        <span className="text-white tabular-nums">${partsSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-500">Labor</span>
                        <span className="text-white tabular-nums">${laborTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/5">
                        <span className="text-slate-500">Tax ({(taxRate * 100).toFixed(2)}%)</span>
                        <span className="text-white tabular-nums">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <span className="text-xs font-black text-white uppercase tracking-widest">Repair Total</span>
                        <span className="text-2xl font-black text-primary tabular-nums">${total.toFixed(2)}</span>
                    </div>
                    {/* Stripe Connect 1% fee preview */}
                    <div className="mt-3 pt-3 border-t border-dashed border-white/10 space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-primary/60 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-xs">toll</span>
                                Platform Fee (1%)
                            </span>
                            <span className="text-primary/60 tabular-nums">+${(total * 0.01).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Client Pays</span>
                            <span className="text-lg font-black text-emerald-400 tabular-nums">${(total * 1.01).toFixed(2)}</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* ── Sticky Action Footer ── */}
            {isOwner && (
                <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a0c]/90 backdrop-blur-2xl border-t border-white/5 p-6 safe-bottom" style={{ bottom: 'var(--shell-nav-height)' }}>
                    <div className="max-w-[430px] mx-auto space-y-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() => void handleSendInApp()}
                                disabled={items.length === 0}
                                className="flex-1 h-16 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all disabled:opacity-40 flex flex-col items-center justify-center gap-1"
                            >
                                <span className="material-symbols-outlined text-lg">chat</span>
                                <span>Send In-App</span>
                            </button>
                            <button
                                onClick={() => {
                                    void (async () => {
                                        // Save to Supabase first so data is ready for client
                                        const invoice: Invoice = {
                                            ticketId: ticket.id,
                                            shopId: ticket.shopId,
                                            items,
                                            laborHours,
                                            laborRate,
                                            taxRate,
                                            status: 'sent',
                                            createdAt: existingInvoice?.createdAt ?? Date.now(),
                                        };
                                        await saveInvoiceToSupabase(ticket.id, invoice);
                                        setStatus('sent');

                                        sendInvite('sms', {
                                            name: ticket.client,
                                            ticketId: ticket.id,
                                            vehicle: ticket.vehicle,
                                            shopId: ticket.shopId,
                                            token: ticket.publicToken
                                        });
                                    })();
                                }}
                                disabled={items.length === 0}
                                className="flex-1 h-16 rounded-2xl bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
                            >
                                <span className="material-symbols-outlined text-lg">sms</span>
                                <span>SMS</span>
                            </button>
                            <button
                                onClick={() => {
                                    void (async () => {
                                        // Save to Supabase first so data is ready for client
                                        const invoice: Invoice = {
                                            ticketId: ticket.id,
                                            shopId: ticket.shopId,
                                            items,
                                            laborHours,
                                            laborRate,
                                            taxRate,
                                            status: 'sent',
                                            createdAt: existingInvoice?.createdAt ?? Date.now(),
                                        };
                                        await saveInvoiceToSupabase(ticket.id, invoice);
                                        setStatus('sent');

                                        sendInvite('email', {
                                            name: ticket.client,
                                            ticketId: ticket.id,
                                            vehicle: ticket.vehicle,
                                            shopId: ticket.shopId,
                                            token: ticket.publicToken
                                        });
                                    })();
                                }}
                                disabled={items.length === 0}
                                className="flex-1 h-16 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
                            >
                                <span className="material-symbols-outlined text-lg">mail</span>
                                <span>Email</span>
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                void (async () => {
                                    await handleSave('draft');
                                    showToast('Draft invoice saved');
                                })();
                            }}
                            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] active:scale-95 transition-all"
                        >
                            Save Draft
                        </button>
                    </div>
                </div>
            )}

            {!isOwner && (
                <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#0a0a0c]/90 backdrop-blur-2xl border-t border-white/5 p-6 safe-bottom" style={{ bottom: 'var(--shell-nav-height)' }}>
                    <div className="max-w-[430px] mx-auto">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <span className="material-symbols-outlined text-slate-600 text-xl block mb-1">lock</span>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Owner-only: Invoice sending is restricted</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffInvoice;
