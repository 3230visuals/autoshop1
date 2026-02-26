import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProgressBar7Stage from '../../components/ProgressBar7Stage';
import VehicleProfileHeader from '../../components/VehicleProfileHeader';
import MessageThread from '../../components/MessageThread';
import { getTicketById, updateTicketStage } from '../../utils/mockTickets';

const S_TicketDetail: React.FC = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [, setRenderKey] = useState(0);
    const forceRerender = useCallback(() => setRenderKey(n => n + 1), []);
    const ticket = getTicketById(ticketId || '');

    // Read actual role from localStorage
    const storedRole = localStorage.getItem('staffRole') || 'staff';
    const role = storedRole.toUpperCase() as 'STAFF' | 'OWNER';

    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MESSAGES'>('OVERVIEW');

    /** Single source of truth: mutate the real ticket, then re-render */
    const handleStageChange = (newIndex: number) => {
        updateTicketStage(ticket.id, newIndex);
        forceRerender();
    };

    const TABS = [
        { id: 'OVERVIEW', label: 'Overview', icon: 'info' },
        { id: 'INSPECTION', label: 'Inspection', icon: 'fact_check' },
        { id: 'ESTIMATE', label: 'Estimate', icon: 'request_quote' },
        { id: 'MESSAGES', label: 'Messages', icon: 'chat' },
    ];

    const MOCK_MESSAGES = [
        { sender: 'STAFF' as const, text: 'Hello! Starting the diagnostic now.', timestamp: '10:30 AM', isCurrentUser: true },
        { sender: 'CLIENT' as const, text: 'Keep me posted.', timestamp: '10:35 AM', isCurrentUser: false },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-page-dark-01">
            <div className="p-6 pb-0">
                <VehicleProfileHeader
                    vehicle={ticket.vehicle}
                    customerName={ticket.customerName}
                    ticketId={ticket.id}
                    onBack={() => navigate(-1)}
                />

                <div className="bg-card-dark border border-white/5 rounded-t-[2.5rem] p-8 pb-4 mt-6 relative overflow-hidden">
                    <ProgressBar7Stage
                        currentStageIndex={ticket.stageIndex}
                        role={role}
                        onStageChange={handleStageChange}
                    />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 bg-card-dark border-x border-white/5">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 border-b border-white/5">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (tab.id === 'INSPECTION') navigate(`/s/ticket/${ticket.id}/inspection`);
                                else if (tab.id === 'ESTIMATE') navigate(`/s/ticket/${ticket.id}/estimate`);
                                else setActiveTab(tab.id as 'OVERVIEW' | 'MESSAGES');
                            }}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-primary/10 border-primary/30 text-primary shadow-inner shadow-primary/5'
                                : 'bg-white/2 border-white/5 text-slate-500'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-card-dark border-x border-white/5 p-6 overflow-y-auto">
                {activeTab === 'OVERVIEW' ? (
                    <div className="space-y-6">
                        <div className="bg-white/2 border border-white/5 rounded-3xl p-6">
                            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Initial Complaint</h4>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium">{ticket.issue}</p>
                        </div>

                        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="material-symbols-outlined text-primary">lock_open</span>
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Active Permissions</h4>
                            </div>
                            <p className="text-[11px] text-primary/60 leading-relaxed font-bold uppercase tracking-widest">
                                {role === 'STAFF'
                                    ? 'Restricted Mode: You can only advance the repair status forward.'
                                    : 'Elevated Mode: Full control restricted to shop owners only.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className="bg-white/2 border border-white/5 rounded-3xl h-[400px] overflow-hidden flex flex-col relative">
                            <div className="flex-1 overflow-y-auto">
                                <MessageThread messages={MOCK_MESSAGES} />
                            </div>
                            <div className="p-4 border-t border-white/5 bg-black/20">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type internal note or reply..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-[11px] font-bold uppercase tracking-widest focus:border-primary outline-none h-12 text-white"
                                    />
                                    <button className="size-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <span className="material-symbols-outlined">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="h-24 bg-card-dark border-x border-white/5" />
        </div>
    );
};

export default S_TicketDetail;
