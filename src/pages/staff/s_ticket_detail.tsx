import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProgressBar4Stage from '../../components/ProgressBar4Stage';
import VehicleProfileHeader from '../../components/VehicleProfileHeader';
import { getInvoice } from '../../services/invoiceService';
import { useJobs } from '../../context/useJobs';
import { useAppContext } from '../../context/useAppContext';
import { messageService } from '../../services/messageService';
import type { Message as SupabaseMessage } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Job } from '../../context/AppTypes';


interface TicketMessage {
    id: string;
    sender: 'STAFF' | 'CLIENT';
    text: string;
    timestamp: number;
}


const S_TicketDetail: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const { jobs, updateJob, deleteJob } = useJobs();
    const { showToast, sendInvite } = useAppContext();
    const { currentUser } = useAuth();
    const ticket = jobs.find((j: Job) => j.id === ticketId);

    const storedRole = localStorage.getItem('staffRole') ?? 'staff';
    const isOwner = storedRole.toLowerCase() === 'owner';
    const role = isOwner ? 'OWNER' : 'STAFF';

    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MESSAGES'>('OVERVIEW');
    const [chatMessages, setChatMessages] = useState<TicketMessage[]>([]);
    const [msgInput, setMsgInput] = useState('');
    const [isMsgLoading, setIsMsgLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Complaint Editing State
    const [isEditingComplaint, setIsEditingComplaint] = useState(false);
    const [complaintText, setComplaintText] = useState(ticket?.notes ?? '');
    const [isSavingComplaint, setIsSavingComplaint] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const mapSupabaseToUI = useCallback((msg: SupabaseMessage): TicketMessage => ({
        id: msg.id,
        sender: msg.sender_role,
        text: msg.content,
        timestamp: new Date(msg.created_at).getTime(),
    }), []);


    useEffect(() => {
        if (activeTab === 'MESSAGES') {
            setIsMsgLoading(true);
            void (async () => {
                try {
                    if (!ticketId) return;
                    const msgs = await messageService.getMessagesByJob(ticketId);
                    setChatMessages(msgs.map(mapSupabaseToUI));
                } catch (err) {
                    console.error('Failed to fetch messages:', err);
                } finally {
                    setIsMsgLoading(false);
                }
            })();
        }
    }, [activeTab, ticketId, mapSupabaseToUI]);


    useEffect(() => {
        if (activeTab !== 'MESSAGES' || !ticketId) return;
        const channel = supabase
            .channel(`messages:${ticketId}`)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `job_id=eq.${ticketId}` },
                (payload) => {
                    const newMsg = mapSupabaseToUI(payload.new as SupabaseMessage);
                    setChatMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
                }
            )
            .subscribe();

        return () => { void supabase.removeChannel(channel); };
    }, [activeTab, ticketId, mapSupabaseToUI]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatMessages]);


    /* ── NOT FOUND STATE ── */
    if (!ticket) {
        return <div className="p-10 text-white font-black uppercase text-center">Ticket not found</div>;
    }

    const handleStageChange = (newIndex: number) => {
        void updateJob(ticket.id, { stageIndex: newIndex });
    };

    const handleSendMsg = () => {
        const text = msgInput.trim();
        if (!text || !ticketId || !currentUser) return;

        void (async () => {
            try {
                const staffId = currentUser.id;
                await messageService.sendMessage({
                    job_id: ticketId,
                    sender_id: staffId,
                    sender_role: 'STAFF',
                    content: text,
                });
                setMsgInput('');
            } catch (err) {
                console.error('Failed to send message:', err);
                showToast('Failed to send message');
            }
        })();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMsg();
        }
    };

    const formatTime = (ts: number) => {
        const d = new Date(ts);
        const h = d.getHours();
        const m = d.getMinutes().toString().padStart(2, '0');
        return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
    };

    const TABS = [
        { id: 'OVERVIEW', label: 'Overview', icon: 'info' },
        { id: 'INSPECTION', label: 'Inspect', icon: 'fact_check' },
        // Only owners can see the Invoice tab
        ...(isOwner ? [{ id: 'ESTIMATE', label: 'Invoice', icon: 'request_quote' }] : []),
        { id: 'MESSAGES', label: 'Messages', icon: 'chat' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-page-dark-01 safe-top pb-shell-nav overflow-x-hidden">
            {/* ── Header Area ── */}
            <div className="px-5 pt-4 pb-0">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <VehicleProfileHeader
                            vehicle={ticket.vehicle}
                            customerName={ticket.client}
                            ticketId={ticket.id}
                            vehicleImage={ticket.vehicleImage}
                            onBack={() => { void navigate(-1); }}
                        />
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1 mb-4">
                        <div className={`glass-pill-btn h-9 px-3 text-[8px] font-black tracking-widest ${isOwner
                            ? 'border-primary/30 text-primary bg-primary/10'
                            : 'text-slate-500 border-white/5 bg-white/5'
                            }`}>
                            {isOwner ? 'OWNER' : 'STAFF'}
                        </div>

                        <a
                            href={`/c/ticket/${ticket.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass-pill-btn h-9 w-9 p-0 flex items-center justify-center border-primary/20 text-primary hover:bg-primary/10 transition-all active:scale-95"
                            title="View Client Portal"
                        >
                            <span className="material-symbols-outlined text-base">visibility</span>
                        </a>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!confirmDelete) {
                                    setConfirmDelete(true);
                                    setTimeout(() => setConfirmDelete(false), 3000);
                                } else {
                                    void deleteJob(ticket.id).then((success) => {
                                        if (success) {
                                            showToast('Ticket deleted');
                                            void navigate('/s/board');
                                        }
                                    });
                                }
                            }}
                            className={`glass-pill-btn h-9 px-3 p-0 transition-all active:scale-95 ${confirmDelete
                                ? 'bg-red-500 border-red-500 text-white min-w-[100px]'
                                : 'border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 w-9'
                                }`}
                            title="Delete Ticket"
                        >
                            {confirmDelete ? (
                                <span className="text-[9px] font-black uppercase tracking-wider">Confirm?</span>
                            ) : (
                                <span className="material-symbols-outlined text-base">delete</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Progress Stepper Card */}
                <div className="glass-surface rounded-3xl p-5 mt-4 shadow-2xl">
                    <ProgressBar4Stage
                        currentStageIndex={ticket.stageIndex}
                        role={role}
                        onStageChange={handleStageChange}
                    />
                </div>
            </div>

            {/* ── Navigation Tabs ── */}
            <div className="px-5 mt-3">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (tab.id === 'INSPECTION') void navigate(`/s/ticket/${ticket.id}/inspection`);
                                    else if (tab.id === 'ESTIMATE') void navigate(`/s/ticket/${ticket.id}/invoice`);
                                    else setActiveTab(tab.id as 'OVERVIEW' | 'MESSAGES');
                                }}
                                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border transition-all duration-300 whitespace-nowrap min-h-[40px] min-w-[80px] justify-center depth-gloss
                                    ${isActive
                                        ? 'bg-primary/20 border-primary/40 text-primary depth-pressed shadow-lg shadow-primary/20'
                                        : 'bg-white/[0.03] border-white/5 text-slate-500 hover:border-white/10 active:scale-95 depth-raised'
                                    }
                                `}
                            >
                                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-wide">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div className="flex-1 bg-card-dark border-x border-white/5 px-5 py-6 overflow-y-auto">
                {activeTab === 'OVERVIEW' ? (
                    <div className="space-y-5">
                        {/* Payment Status */}
                        {(() => {
                            const invoice = getInvoice(ticket.id);
                            if (invoice?.status === 'paid') {
                                return (
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
                                );
                            }
                            return null;
                        })()}

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
                                                            const success = await updateJob(ticket.id, { notes: complaintText });
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
                                    onClick={() => {
                                        sendInvite('sms', {
                                            name: ticket.client,
                                            ticketId: ticket.id,
                                            vehicle: ticket.vehicle
                                        });
                                    }}
                                    className="flex flex-col items-center gap-2 py-4 bg-primary/10 border border-primary/20 rounded-2xl group hover:bg-primary transition-all hover:border-primary min-h-[44px]"
                                >
                                    <span className="material-symbols-outlined text-primary group-hover:text-white">sms</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary group-hover:text-white">SMS Link</span>
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => {
                                        sendInvite('email', {
                                            name: ticket.client,
                                            ticketId: ticket.id,
                                            vehicle: ticket.vehicle
                                        });
                                    }}
                                    className="flex flex-col items-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all hover:border-white/20 min-h-[44px]"
                                >
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-white">mail</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Email Link</span>
                                </motion.button>
                            </div>

                            <button
                                onClick={() => {
                                    const url = `${window.location.origin}/c/ticket/${ticket.id}`;
                                    void navigator.clipboard.writeText(url);
                                    showToast('Link copied to clipboard');
                                }}
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
                                        void deleteJob(ticket.id).then((success) => {
                                            if (success) {
                                                showToast('Ticket deleted');
                                                void navigate('/s/board');
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
                ) : (
                    /* ── Messages Panel ── */
                    <div className="h-full flex flex-col">
                        <div className="glass-surface rounded-2xl h-[400px] overflow-hidden flex flex-col">
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                                {isMsgLoading ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : chatMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                                        <span className="material-symbols-outlined text-3xl text-slate-700">forum</span>
                                        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">No messages yet</p>
                                    </div>
                                ) : null}

                                {chatMessages.map((msg) => {
                                    const isSelf = msg.sender === 'STAFF';
                                    return (
                                        <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${isSelf
                                                ? 'bg-primary text-white rounded-br-md'
                                                : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-md'
                                                }`}>
                                                <p>{msg.text}</p>
                                                <span className={`text-[9px] mt-1 block font-bold uppercase tracking-widest ${isSelf ? 'text-white/50 text-right' : 'text-slate-600'}`}>
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="p-4 border-t border-white/5 bg-black/20">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={msgInput}
                                        onChange={(e) => setMsgInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:border-primary outline-none min-h-[44px] text-white placeholder:text-slate-600"
                                    />
                                    <button
                                        onClick={handleSendMsg}
                                        disabled={!msgInput.trim()}
                                        className={`size-11 rounded-xl flex items-center justify-center transition-all min-h-[44px] ${msgInput.trim()
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'bg-white/5 text-slate-700'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom spacer — clears bottom nav + safe area */}
            <div className="h-36 bg-card-dark border-x border-white/5" />
        </div>
    );
};

export default S_TicketDetail;
