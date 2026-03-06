import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/useAuth';
import { jobService } from '../services/jobService';
import type { Job } from '../context/AppTypes';

type ScreenState = 'loading' | 'gateway' | 'draft-pending' | 'ready' | 'error';

const WelcomeScreen: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { forceClientLogin } = useAuth();

    const token = searchParams.get('token');
    const legacyTicketId = searchParams.get('ticketId');

    // Start in 'gateway' immediately if no invite params, skip loading spinner
    const [screenState, setScreenState] = useState<ScreenState>(
        (token || legacyTicketId) ? 'loading' : 'gateway'
    );
    const [ticket, setTicket] = useState<Job | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    // ── Resolve ticket on mount ──
    useEffect(() => {
        let cancelled = false;

        const resolveTicket = async () => {
            try {
                let resolved: Job | null = null;

                if (token) {
                    // Preferred: resolve by public_token
                    resolved = await jobService.getJobByToken(token);
                } else if (legacyTicketId) {
                    // Legacy: resolve by ticket ID
                    resolved = await jobService.getJobById(legacyTicketId);
                } else {
                    // No params at all — show gateway landing
                    if (!cancelled) {
                        setScreenState('gateway');
                    }
                    return;
                }

                if (!resolved) {
                    if (!cancelled) {
                        setErrorMessage('This link is invalid or expired. Please contact your shop for a new link.');
                        setScreenState('error');
                    }
                    return;
                }

                if (!cancelled) {
                    setTicket(resolved);
                    if (resolved.isDraft) {
                        setScreenState('draft-pending');
                    } else {
                        setScreenState('ready');
                    }
                }
            } catch (err) {
                console.error('Ticket resolution failed:', err);
                if (!cancelled) {
                    setErrorMessage('Something went wrong loading your ticket. Please try again or contact your shop.');
                    setScreenState('error');
                }
            }
        };

        void resolveTicket();
        return () => { cancelled = true; };
    }, [token, legacyTicketId]);

    // ── Subscribe to realtime updates when draft pending ──
    useEffect(() => {
        if (screenState !== 'draft-pending' || !ticket) return;

        const unsubscribe = jobService.subscribeToJob(ticket.id, (updatedJob) => {
            setTicket(updatedJob);
            if (!updatedJob.isDraft) {
                setScreenState('ready');
            }
        });

        // Also poll every 5 seconds as a fallback
        const interval = setInterval(() => {
            void (async () => {
                try {
                    const fresh = token
                        ? await jobService.getJobByToken(token)
                        : await jobService.getJobById(ticket.id);
                    if (fresh && !fresh.isDraft) {
                        setTicket(fresh);
                        setScreenState('ready');
                    }
                } catch {
                    // Ignore poll errors
                }
            })();
        }, 5000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [screenState, ticket, token]);

    // ── Navigate to client portal when ready ──
    const handleViewStatus = useCallback(() => {
        if (!ticket) return;

        // Log in the client so guards pass
        forceClientLogin({
            clientId: ticket.clientId,
            name: ticket.client ?? 'Guest',
            shopId: ticket.shopId ?? 'SHOP-01',
            shopName: 'Service Bay Software',
            phone: undefined,
        });

        void navigate(`/c/ticket/${ticket.id}`);
    }, [ticket, forceClientLogin, navigate]);

    // Auto-navigate when state transitions to ready
    useEffect(() => {
        if (screenState === 'ready' && ticket) {
            // Small delay for visual transition
            const timer = setTimeout(() => {
                handleViewStatus();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [screenState, ticket, handleViewStatus]);

    // ── GATEWAY STATE (no token — show portal selector) ──
    if (screenState === 'gateway') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-primary text-5xl">build</span>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Service Bay</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-10">Choose Your Portal</p>

                    <div className="space-y-4">
                        <button
                            onClick={() => void navigate('/s/login')}
                            className="w-full h-16 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-primary/40"
                        >
                            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                            <span>Staff / Owner Login</span>
                        </button>

                        <button
                            onClick={() => void navigate('/c/track')}
                            className="w-full h-16 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:bg-white/10"
                        >
                            <span className="material-symbols-outlined text-xl">search</span>
                            <span>Track My Repair</span>
                        </button>
                    </div>

                    <p className="mt-10 text-[8px] font-bold text-slate-700 uppercase tracking-[0.4em]">
                        &copy; 2026 Service Bay Software
                    </p>
                </motion.div>
            </div>
        );
    }

    // ── LOADING STATE ──
    if (screenState === 'loading') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center"
                >
                    <div className="size-12 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />
                    <h1 className="text-xl font-bold text-white mb-2">Loading your ticket…</h1>
                    <p className="text-slate-400 text-sm">Please wait while we find your service record.</p>
                </motion.div>
            </div>
        );
    }

    // ── ERROR STATE ──
    if (screenState === 'error') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Link Not Found</h1>
                    <p className="text-slate-400 mb-6 text-sm">{errorMessage}</p>
                    <button
                        onClick={() => void navigate('/c/track')}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-all"
                    >
                        Look Up My Ticket Instead
                    </button>
                </motion.div>
            </div>
        );
    }

    // ── DRAFT PENDING STATE ──
    if (screenState === 'draft-pending') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🔧</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Setting Things Up…</h1>
                    <p className="text-slate-400 mb-6 text-sm">
                        Your shop is finalizing your service details. This page will update automatically — no need to refresh.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="size-3 bg-blue-600 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Waiting for shop…</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── READY STATE (brief transition before auto-nav) ──
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center"
            >
                <div className="w-20 h-20 bg-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✅</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                    Welcome!
                </h1>
                <p className="text-slate-400 mb-6 text-sm">
                    {ticket?.client ? `Hi ${ticket.client}, ` : ''}Your {ticket?.vehicle ?? 'vehicle'} service ticket is ready.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleViewStatus}
                        className="w-full py-4 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] border border-primary/40 depth-raised h-16"
                    >
                        Enter Client Portal
                    </button>

                    <div className="flex items-center justify-center gap-2">
                        <div className="size-1.5 bg-primary/40 rounded-full animate-pulse" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Auto-redirecting in 5s
                        </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
                            Need the app?
                            <button
                                onClick={() => void navigate('/download?invite=true')}
                                className="ml-2 text-primary hover:underline"
                            >
                                View Install Directions
                            </button>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-sm text-slate-500">
                    Trusted by local drivers since 2024
                </p>
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;
