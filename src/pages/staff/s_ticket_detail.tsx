import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProgressBar4Stage from '../../components/ProgressBar4Stage';
import VehicleProfileHeader from '../../components/VehicleProfileHeader';
import TicketOverviewTab from '../../components/ticket/TicketOverviewTab';
import TicketMessagesTab from '../../components/ticket/TicketMessagesTab';
import { useJobs } from '../../context/useJobs';
import { useAppContext } from '../../context/useAppContext';
import { useMessages } from '../../context/MessageContext';
import { useAuth } from '../../context/AuthContext';
import type { Job } from '../../context/AppTypes';
import { SkeletonDetail } from '../../components/common/Skeletons';

const S_TicketDetail: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const { jobs, updateJob, deleteJob, showToast, isLoading } = useJobs();
    const { messages: globalMessages, sendMessage: sendGlobalMessage } = useMessages();
    const { sendInvite } = useAppContext();

    // Permissions
    const { staffUser } = useAuth();
    const storedRole = staffUser?.role?.toLowerCase() ?? 'staff';
    const isOwner = storedRole.toLowerCase() === 'owner';
    const role = isOwner ? 'OWNER' : 'STAFF';

    // State
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MESSAGES'>('OVERVIEW');
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Mapping to local messages
    const chatMessages = useMemo(() => {
        if (!ticketId) return [];
        return globalMessages
            .filter(m => m.jobId === ticketId)
            .map(m => ({
                id: m.id,
                sender: m.senderRole,
                text: m.text,
                timestamp: m.timestamp
            }));
    }, [globalMessages, ticketId]);

    if (isLoading) return <SkeletonDetail />;

    // Ticket data
    const ticket = jobs.find((j: Job) => j.id === ticketId);

    /* ── NOT FOUND STATE ── */
    if (!ticket) {
        return <div className="p-10 text-white font-black uppercase text-center">Ticket not found</div>;
    }

    const handleStageChange = (newIndex: number) => {
        void updateJob(ticket.id, { stageIndex: newIndex });
    };

    const TABS = [
        { id: 'OVERVIEW', label: 'Overview', icon: 'info' },
        { id: 'INSPECTION', label: 'Inspect', icon: 'fact_check' },
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
                    <TicketOverviewTab
                        ticket={ticket}
                        isOwner={isOwner}
                        onUpdateNotes={(notes) => updateJob(ticket.id, { notes })}
                        onDelete={deleteJob}
                        onSendInvite={sendInvite}
                        onCopyLink={() => {
                            const url = `${window.location.origin}/c/ticket/${ticket.id}`;
                            void navigator.clipboard.writeText(url);
                            showToast('Link copied to clipboard');
                        }}
                        onDeleteNavigate={() => { void navigate('/s/board'); }}
                        showToast={showToast}
                    />
                ) : (
                    <TicketMessagesTab
                        messages={chatMessages}
                        onSendMessage={(text) => {
                            void sendGlobalMessage(text, ticket.id);
                        }}
                    />
                )}
            </div>

            {/* Bottom spacer — clears bottom nav + safe area */}
            <div className="h-36 bg-card-dark border-x border-white/5" />
        </div>
    );
};

export default S_TicketDetail;
