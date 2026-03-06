import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Job } from '../../context/AppTypes';
import { getInvoice } from '../../services/invoiceService';

interface TicketOverviewTabProps {
    ticket: Job;
    isOwner: boolean;
    onUpdateNotes: (notes: string) => Promise<boolean>;
    onUpdateJob: (id: string, updates: Partial<Job>) => Promise<boolean>;
    onDelete: (id: string) => Promise<boolean>;
    onSendInvite: (method: 'sms' | 'email', overrides: Record<string, string | undefined>) => void;
    onCopyLink: () => void;
    onDeleteNavigate: () => void;
    showToast: (msg: string) => void;
}

const TicketOverviewTab: React.FC<TicketOverviewTabProps> = ({
    ticket, isOwner, onUpdateNotes, onUpdateJob, onDelete, onSendInvite, onCopyLink, onDeleteNavigate, showToast
}) => {
    const [isEditingComplaint, setIsEditingComplaint] = useState(false);
    const [complaintText, setComplaintText] = useState('');
    const [isSavingComplaint, setIsSavingComplaint] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Edit Details State
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [isSavingDetails, setIsSavingDetails] = useState(false);
    const [editForm, setEditForm] = useState({
        client: '',
        clientEmail: '',
        clientPhone: '',
        vehicle: ''
    });

    useEffect(() => {
        if (ticket?.notes) setComplaintText(ticket.notes);
        if (ticket) {
            setEditForm({
                client: ticket.client ?? '',
                clientEmail: ticket.clientEmail ?? '',
                clientPhone: ticket.clientPhone ?? '',
                vehicle: ticket.vehicle ?? ''
            });
        }
    }, [ticket]);

    // ── Live payment detection: check BOTH job.financials AND localStorage ──
    const [isPaid, setIsPaid] = useState(false);

    const checkPaymentStatus = useCallback(() => {
        // Check 1: in-memory job financials
        if (ticket.financials?.invoice?.status === 'paid') {
            setIsPaid(true);
            return;
        }
        // Check 2: localStorage invoice (cross-tab persistence)
        const inv = getInvoice(ticket.id);
        if (inv?.status === 'paid') {
            setIsPaid(true);
            return;
        }
        setIsPaid(false);
    }, [ticket]);

    // Run on mount and whenever ticket changes
    useEffect(() => {
        checkPaymentStatus();
    }, [checkPaymentStatus]);

    // Listen for cross-tab localStorage changes
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === `invoice:${ticket.id}`) checkPaymentStatus();
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, [ticket.id, checkPaymentStatus]);

    // Listen for BroadcastChannel messages (instant cross-tab)
    useEffect(() => {
        try {
            const bc = new BroadcastChannel('servicebay_sync');
            bc.onmessage = (e: MessageEvent) => {
                const data = e.data as { type?: string; ticketId?: string };
                if (data?.type === 'PAYMENT_RECEIVED' && data?.ticketId === ticket.id) {
                    setIsPaid(true);
                    showToast('💰 Payment received!');
                }
            };
            return () => bc.close();
        } catch {
            // BroadcastChannel not supported
            return undefined;
        }
    }, [ticket.id, showToast]);

    // Also poll every 3s as ultimate fallback
    useEffect(() => {
        if (isPaid) return; // no need to poll once paid
        const interval = setInterval(checkPaymentStatus, 3000);
        return () => clearInterval(interval);
    }, [isPaid, checkPaymentStatus]);

    return (
        <div className="space-y-5">
            {/* Payment Status */}
            {isPaid && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-11 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                            <span className="material-symbols-outlined text-emerald-400">payments</span>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Invoice Paid</h4>
                            <p className="text-[10px] text-emerald-500/60 mt-1 font-bold uppercase tracking-widest">Verified via Stripe</p>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-emerald-400 text-xl">verified</span>
                </div>
            )}

            {/* ── Client & Vehicle Details Area ── */}
            <div className="glass-surface rounded-2xl p-5 shadow-xl">
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                            <span className="material-symbols-outlined text-primary text-xl">person</span>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer & Vehicle</h4>
                    </div>
                    {isOwner && !isEditingDetails && (
                        <button
                            onClick={() => setIsEditingDetails(true)}
                            className="glass-pill-btn h-8 px-3 text-[8px] text-primary/70 hover:text-primary border-primary/20"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit Details
                        </button>
                    )}
                </div>

                {isEditingDetails ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Client Name</label>
                                <input
                                    type="text"
                                    value={editForm.client}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, client: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-primary/40 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Vehicle Name</label>
                                <input
                                    type="text"
                                    value={editForm.vehicle}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, vehicle: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-primary/40 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Client Email</label>
                                <input
                                    type="email"
                                    value={editForm.clientEmail}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-primary/40 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Client Phone</label>
                                <input
                                    type="tel"
                                    value={editForm.clientPhone}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-primary/40 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => {
                                    setIsEditingDetails(false);
                                    setEditForm({
                                        client: ticket.client ?? '',
                                        clientEmail: ticket.clientEmail ?? '',
                                        clientPhone: ticket.clientPhone ?? '',
                                        vehicle: ticket.vehicle ?? ''
                                    });
                                }}
                                className="glass-pill-btn h-10 px-4 text-[9px] text-slate-400"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isSavingDetails}
                                onClick={() => {
                                    void (async () => {
                                        setIsSavingDetails(true);
                                        try {
                                            const success = await onUpdateJob(ticket.id, editForm);
                                            if (success) {
                                                showToast('Ticket details updated');
                                                setIsEditingDetails(false);
                                            }
                                        } finally {
                                            setIsSavingDetails(false);
                                        }
                                    })();
                                }}
                                className="glass-pill-btn h-10 px-5 text-[9px] bg-primary/20 border-primary/40 text-primary hover:bg-primary hover:text-white"
                            >
                                {isSavingDetails ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-y-4">
                        <div className="space-y-1">
                            <h5 className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Customer</h5>
                            <p className="text-sm font-bold text-slate-200">{ticket.client}</p>
                        </div>
                        <div className="space-y-1">
                            <h5 className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Vehicle</h5>
                            <p className="text-sm font-bold text-slate-200">{ticket.vehicle}</p>
                        </div>
                        <div className="space-y-1">
                            <h5 className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Email</h5>
                            <p className="text-sm font-medium text-slate-400">{ticket.clientEmail || 'Not Provided'}</p>
                        </div>
                        <div className="space-y-1">
                            <h5 className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Phone</h5>
                            <p className="text-sm font-medium text-slate-400">{ticket.clientPhone || 'Not Provided'}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Editable Initial Complaint ── */}
            <div className="glass-surface rounded-2xl p-5 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Initial Complaint</h4>
                    {isOwner && !isEditingComplaint && (
                        <button
                            onClick={() => setIsEditingComplaint(true)}
                            className="glass-pill-btn h-8 px-3 text-[8px] text-primary/70 hover:text-primary border-primary/20"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit
                        </button>
                    )}
                </div>

                {isEditingComplaint ? (
                    <div className="space-y-3">
                        <textarea
                            value={complaintText}
                            onChange={(e) => setComplaintText(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-slate-200 focus:border-primary/40 outline-none min-h-[100px] font-medium leading-relaxed resize-none"
                            placeholder="Enter customer complaint..."
                            maxLength={500}
                        />
                        <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${complaintText.length < 3 ? 'text-red-400/60' : complaintText.length > 450 ? 'text-amber-400/60' : 'text-slate-600'}`}>
                                {complaintText.length}/500
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditingComplaint(false);
                                        setComplaintText(ticket.notes ?? '');
                                    }}
                                    className="glass-pill-btn h-10 px-4 text-[9px] text-slate-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isSavingComplaint || complaintText.length < 3}
                                    onClick={() => {
                                        void (async () => {
                                            setIsSavingComplaint(true);
                                            try {
                                                const success = await onUpdateNotes(complaintText);
                                                if (success) showToast('Complaint updated');
                                                setIsEditingComplaint(false);
                                            } finally {
                                                setIsSavingComplaint(false);
                                            }
                                        })();
                                    }}
                                    className={`glass-pill-btn h-10 px-5 text-[9px] shadow-lg transition-all ${complaintText.length >= 3
                                        ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary hover:text-white'
                                        : 'text-slate-600 opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    {isSavingComplaint ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
                        "{ticket.notes ?? 'No specific complaint recorded.'}"
                    </p>
                )}
            </div>

            {/* ── Send App Link ── */}
            <div className="glass-surface rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="size-11 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                        <span className="material-symbols-outlined text-primary">share</span>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Send App Link</h4>
                        <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest">Client Tracker & Portal</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onSendInvite('sms', {
                            name: ticket.client,
                            phone: ticket.clientPhone,
                            ticketId: ticket.id,
                            vehicle: ticket.vehicle,
                            token: ticket.publicToken
                        })}
                        className="flex flex-col items-center gap-2 py-4 bg-primary/10 border border-primary/20 rounded-2xl group hover:bg-primary transition-all hover:border-primary min-h-[44px]"
                    >
                        <span className="material-symbols-outlined text-primary group-hover:text-white">sms</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary group-hover:text-white">SMS Link</span>
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onSendInvite('email', {
                            name: ticket.client,
                            email: ticket.clientEmail,
                            ticketId: ticket.id,
                            vehicle: ticket.vehicle,
                            token: ticket.publicToken
                        })}
                        className="flex flex-col items-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all hover:border-white/20 min-h-[44px]"
                    >
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-white">mail</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Email Link</span>
                    </motion.button>
                </div>

                <button
                    onClick={onCopyLink}
                    className="w-full mt-4 py-2.5 text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] hover:text-slate-400 transition-colors min-h-[44px]"
                >
                    Copy Link
                </button>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 mt-4 border-t border-red-500/10">
                <h4 className="text-[9px] font-black text-red-500/50 uppercase tracking-[0.2em] mb-3">Danger Zone</h4>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!confirmDelete) {
                            setConfirmDelete(true);
                            setTimeout(() => setConfirmDelete(false), 3000);
                        } else {
                            void onDelete(ticket.id).then((success) => {
                                if (success) {
                                    showToast('Ticket deleted');
                                    onDeleteNavigate();
                                }
                            });
                        }
                    }}
                    className={`w-full glass-surface rounded-2xl p-5 flex items-center justify-between group transition-all active:scale-[0.98] ${confirmDelete
                        ? 'bg-red-500 border-red-500'
                        : 'hover:bg-red-500 hover:border-red-500'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`size-11 rounded-xl flex items-center justify-center border ${confirmDelete
                            ? 'bg-white/20 border-white/20'
                            : 'bg-red-500/10 border-red-500/20 group-hover:bg-white/20 group-hover:border-white/20'
                            }`}>
                            <span className={`material-symbols-outlined ${confirmDelete ? 'text-white' : 'text-red-500 group-hover:text-white'
                                }`}>delete_forever</span>
                        </div>
                        <div className="text-left">
                            <h4 className={`text-[10px] font-black uppercase tracking-widest leading-none ${confirmDelete ? 'text-white' : 'text-red-500 group-hover:text-white'
                                }`}>
                                {confirmDelete ? 'TAP AGAIN TO DELETE' : 'Delete Ticket'}
                            </h4>
                            <p className={`text-[10px] mt-1 font-bold uppercase tracking-widest ${confirmDelete ? 'text-white/70' : 'text-slate-600 group-hover:text-white/70'
                                }`}>
                                {confirmDelete ? 'This cannot be undone' : 'Remove all records'}
                            </p>
                        </div>
                    </div>
                    <span className={`material-symbols-outlined transition-colors ${confirmDelete ? 'text-white' : 'text-red-900 group-hover:text-white'
                        }`}>chevron_right</span>
                </button>
            </div>
        </div>
    );
};

export default TicketOverviewTab;
