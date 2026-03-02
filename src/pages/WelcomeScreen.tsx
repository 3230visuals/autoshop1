import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import type { Job } from '../context/AppTypes';

type ScreenState = 'loading' | 'draft-pending' | 'ready' | 'error';

const WelcomeScreen: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { forceClientLogin } = useAuth();

    const token = searchParams.get('token');
    const legacyTicketId = searchParams.get('ticketId');

    const [screenState, setScreenState] = useState<ScreenState>('loading');
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
                    // No params at all — show error
                    if (!cancelled) {
                        setErrorMessage('No ticket link provided. Please use the link sent by your shop.');
                        setScreenState('error');
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
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [screenState, ticket, handleViewStatus]);

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

                <button
                    onClick={handleViewStatus}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                >
                    View Vehicle Status
                </button>

                <p className="mt-8 text-sm text-slate-500">
                    Trusted by local drivers since 2024
                </p>
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;
