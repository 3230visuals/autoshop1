import React from 'react';

import { useNavigate } from 'react-router-dom';

interface MessageProps {
    id?: string;
    sender: 'STAFF' | 'CLIENT';
    text: string;
    timestamp: string;
    isCurrentUser: boolean;
    metadata?: {
        type: string;
        total: number;
        ticketId: string;
    };
}

const MessageItem: React.FC<MessageProps> = ({ sender, text, timestamp, isCurrentUser, metadata }) => {
    const navigate = useNavigate();
    const isInvoice = metadata?.type === 'INVOICE';

    return (
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} mb-6`}>
            <div className={`max-w-[85%] rounded-2xl overflow-hidden ${isCurrentUser
                ? 'bg-primary rounded-tr-none text-white p-4 shadow-lg'
                : 'bg-white/5 border border-white/10 rounded-tl-none text-slate-200 p-4'
                }`}>
                {isInvoice ? (
                    <div className="space-y-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                                <span className="material-symbols-outlined text-emerald-400">receipt_long</span>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Invoice Ready</h4>
                                <p className="text-[11px] text-emerald-500/60 mt-1 font-bold uppercase tracking-widest">Repair Summary</p>
                            </div>
                        </div>

                        <div className="bg-black/20 rounded-xl p-4 border border-white/5 shadow-inner">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Due</p>
                            <p className="text-2xl font-black text-white tabular-nums">${metadata?.total.toFixed(2)}</p>
                        </div>

                        <button
                            onClick={() => { void navigate(`/c/ticket/${metadata?.ticketId}/pay`); }}
                            className="w-full h-12 bg-emerald-500 rounded-xl flex items-center justify-center gap-2 group active:scale-[0.98] transition-all"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Review & Pay</span>
                            <span className="material-symbols-outlined text-white text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </div>
                ) : (
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{text}</p>
                )}
            </div>
            <div className="flex items-center gap-2 mt-2 px-1">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{sender}</span>
                <span className="text-[9px] text-slate-700 tracking-tighter">{timestamp}</span>
            </div>
        </div>
    );
};

export default MessageItem;
