import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, ArrowUpRight, Cog, Search, Wrench } from 'lucide-react';
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
            shopId: ticket.shopId ?? '',
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
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090a0d] px-5 py-12 text-white">
                <div className="pointer-events-none absolute inset-0 opacity-[0.14]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                    maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
                }} />
                <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-32 left-1/2 size-[26rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[100px]"
                    animate={{ scale: [1, 1.16, 1], opacity: [0.45, 0.8, 0.45] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-52 -right-40 size-[28rem] rounded-full bg-blue-500/10 blur-[110px]"
                    animate={{ x: [0, -28, 0], y: [0, -18, 0], opacity: [0.25, 0.55, 0.25] }}
                    transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 26, scale: 0.97, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    transition={{ type: 'spring', stiffness: 170, damping: 22, mass: 0.8 }}
                    className="relative z-10 w-full max-w-md"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.45 }}
                        className="mb-8 flex items-center justify-center gap-2.5"
                    >
                        <span className="relative flex size-2.5">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50 motion-reduce:animate-none" />
                            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.8)]" />
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-200/80">Service system online</span>
                    </motion.div>

                    <motion.header
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.22, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-9 text-center"
                    >
                        <div className="relative mx-auto mb-6 flex size-[76px] items-center justify-center rounded-[25px] border border-orange-400/30 bg-orange-400/[0.08] shadow-[0_0_60px_rgba(249,115,22,.12),inset_0_1px_0_rgba(255,255,255,.06)]">
                            <motion.div
                                aria-hidden="true"
                                className="absolute -inset-2 rounded-[29px] border border-dashed border-orange-300/20"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                            />
                            <Cog aria-hidden="true" className="text-orange-300" size={38} strokeWidth={1.7} />
                        </div>
                        <h1 className="text-[clamp(2.9rem,13vw,4rem)] font-black uppercase leading-[0.88] tracking-[-0.07em]">
                            <span className="block text-white">Service</span>
                            <span className="block bg-gradient-to-r from-orange-300 via-amber-200 to-orange-500 bg-clip-text text-transparent">Bay</span>
                        </h1>
                        <p className="mx-auto mt-5 max-w-[19rem] text-sm leading-6 text-slate-300/75">
                            The shop floor and the driver seat, connected in real time.
                        </p>
                    </motion.header>

                    <div className="space-y-3.5">
                        <motion.button
                            onClick={() => void navigate('/s/login')}
                            initial={{ opacity: 0, x: -22 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.38, type: 'spring', stiffness: 260, damping: 24 }}
                            whileHover={{ y: -4, scale: 1.015 }}
                            whileTap={{ scale: 0.985 }}
                            className="group relative flex min-h-[104px] w-full items-center gap-4 overflow-hidden rounded-[26px] border border-orange-300/30 bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-left shadow-[0_16px_42px_rgba(234,88,12,.2)] transition-shadow hover:shadow-[0_22px_50px_rgba(234,88,12,.32)]"
                        >
                            <motion.span
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-22deg] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                animate={{ x: ['0%', '500%'] }}
                                transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' }}
                            />
                            <span className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-black/10 shadow-inner">
                                <Wrench aria-hidden="true" size={25} strokeWidth={2.1} />
                            </span>
                            <span className="relative min-w-0 flex-1">
                                <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.22em] text-orange-100/80">For the crew</span>
                                <span className="block text-lg font-black uppercase leading-tight tracking-wide">Staff / owner</span>
                                <span className="mt-1 block text-xs font-medium text-orange-50/80">Run the bay. Move work forward.</span>
                            </span>
                            <ArrowUpRight aria-hidden="true" className="relative shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" size={23} />
                        </motion.button>

                        <motion.button
                            onClick={() => void navigate('/c/track')}
                            initial={{ opacity: 0, x: 22 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 24 }}
                            whileHover={{ y: -4, scale: 1.015, borderColor: 'rgba(255,255,255,.24)' }}
                            whileTap={{ scale: 0.985 }}
                            className="group flex min-h-[104px] w-full items-center gap-4 rounded-[26px] border border-white/10 bg-white/[0.045] p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-xl transition-colors hover:bg-white/[0.075]"
                        >
                            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-orange-200 shadow-inner">
                                <Search aria-hidden="true" size={25} strokeWidth={2} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.22em] text-orange-200/75">For drivers</span>
                                <span className="block text-lg font-black uppercase leading-tight tracking-wide text-white">Track a repair</span>
                                <span className="mt-1 block text-xs font-medium text-slate-300/70">Get the latest on your vehicle.</span>
                            </span>
                            <ArrowRight aria-hidden="true" className="shrink-0 text-white/45 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-orange-200" size={22} />
                        </motion.button>
                    </div>

                    <motion.footer
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="mt-8 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500/80"
                    >
                        <Activity aria-hidden="true" size={13} className="text-orange-400/70" />
                        <span>Built for the shop floor</span>
                    </motion.footer>
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
