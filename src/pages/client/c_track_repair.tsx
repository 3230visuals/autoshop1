import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const C_TrackRepair: React.FC = () => {
    const navigate = useNavigate();
    const { clientLogin, clientUser, authError, clearAuthError, isLoading } = useAuth();
    const [ticketId, setTicketId] = useState('');
    const [phone, setPhone] = useState('');
    const pendingTicketRef = useRef<string | null>(null);

    // Navigate once clientUser is set after a successful lookup
    useEffect(() => {
        if (clientUser && pendingTicketRef.current) {
            const tid = pendingTicketRef.current;
            pendingTicketRef.current = null;
            navigate(`/c/ticket/${tid}`);
        }
    }, [clientUser, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearAuthError();
        if (!ticketId.trim()) return;

        pendingTicketRef.current = ticketId.trim();
        await clientLogin(ticketId.trim(), phone.trim() || undefined);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm">
                {/* Logo / Brand */}
                <div className="text-center mb-12">
                    <div className="size-20 mx-auto bg-blue-600/10 rounded-3xl border border-blue-500/20 flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-blue-500 text-4xl">monitoring</span>
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Track Repair</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2">Enter your ticket ID to view status</p>
                </div>

                {/* Lookup Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 ml-1">
                            Ticket ID
                        </label>
                        <input
                            type="text"
                            value={ticketId}
                            onChange={(e) => { setTicketId(e.target.value); clearAuthError(); }}
                            placeholder="TCK-1042"
                            className="w-full h-14 bg-[#121214] border border-white/10 rounded-2xl px-5 text-white font-bold text-sm uppercase tracking-wider placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 ml-1">
                            Phone <span className="text-slate-700">(optional)</span>
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(555) 123-4567"
                            className="w-full h-14 bg-[#121214] border border-white/10 rounded-2xl px-5 text-white font-bold text-sm tracking-wider placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    {authError && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                            <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                            <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider">{authError}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !ticketId.trim()}
                        className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(37,99,235,0.15)] active:scale-[0.97] hover:bg-blue-500 transition-all disabled:opacity-40 disabled:pointer-events-none mt-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Verifying
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-xl">search</span>
                                Look Up Ticket
                            </>
                        )}
                    </button>
                </form>

                {/* Help text */}
                <p className="text-center text-[9px] font-bold text-slate-700 uppercase tracking-[0.3em] mt-8">
                    Your ticket ID was sent via text or email
                </p>
            </div>
        </div>
    );
};

export default C_TrackRepair;
