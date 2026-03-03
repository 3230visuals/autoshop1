import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { useJobs } from '../context/useJobs';
import { jobService } from '../services/jobService';
import { motion } from 'framer-motion';


const InviteOnboardClient: React.FC = () => {
    const navigate = useNavigate();
    const { clientInvite, updateClientInvite, sendInvite, resetClientInvite, decodeVin } = useAppContext();
    const { showToast } = useJobs();

    // ── Stable IDs for this form session ──
    const stableClientIdRef = useRef(`CLT-${Date.now()}`);
    const stableClientId = stableClientIdRef.current;

    // ── Draft ticket state ──
    const [draftTicketId, setDraftTicketId] = useState<string | null>(null);
    const [publicToken, setPublicToken] = useState<string | null>(null);
    const [draftError, setDraftError] = useState<string | null>(null);

    // ── Loading / Error state for Save button ──
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // ── Create draft ticket on mount ──
    useEffect(() => {
        let cancelled = false;

        const createDraft = async () => {
            try {
                const shopId = localStorage.getItem('activeShopId') ?? 'SHOP-01';
                // Generate secure public token (64 hex chars)
                const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');

                // Use RPC to create draft — bypasses PostgREST column cache
                const result = await jobService.createDraftTicket(shopId, stableClientId, token);

                if (!cancelled) {
                    setDraftTicketId(String(result.id));
                    setPublicToken(token);
                }
            } catch (err) {
                console.error('Draft creation failed:', err);
                if (!cancelled) {
                    setDraftError(err instanceof Error ? err.message : 'Failed to create draft ticket');
                }
            }
        };

        void createDraft();

        return () => { cancelled = true; };
        // Run once on mount only
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Cleanup draft on unmount if still a draft ──
    // (best-effort — if user navigates away without saving)
    // We skip this for now to avoid accidental deletions

    // ── Build the invite URL using public token ──
    const inviteUrl = useMemo(() => {
        if (!publicToken) return '';
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const origin = isLocalhost ? 'https://stitch-auto-shop-app.vercel.app' : window.location.origin;
        return `${origin}/welcome?token=${publicToken}`;
    }, [publicToken]);

    // ── QR code image URL ──
    const qrImageUrl = useMemo(() => {
        if (!inviteUrl) return '';
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(inviteUrl)}`;
    }, [inviteUrl]);

    // ── Copy invite link to clipboard ──
    const handleCopyLink = async () => {
        if (!inviteUrl) {
            showToast('QR code is still generating...');
            return;
        }
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Join Portal',
                    text: `${clientInvite.name || 'Customer'}, track your vehicle service:`,
                    url: inviteUrl,
                });
            } else {
                await navigator.clipboard.writeText(inviteUrl);
                showToast('Invite link copied to clipboard!');
            }
        } catch {
            try {
                await navigator.clipboard.writeText(inviteUrl);
                showToast('Invite link copied!');
            } catch {
                showToast('Could not copy link');
            }
        }
    };

    // ── Save & Start Service handler ──
    const handleSaveAndStart = async () => {
        setSaveError('');
        if (!clientInvite.name?.trim()) {
            setSaveError('Customer name is required');
            showToast('Customer name is required');
            return;
        }

        if (!draftTicketId) {
            setSaveError('Draft ticket not ready. Please wait a moment.');
            showToast('Draft ticket not ready');
            return;
        }

        setIsSaving(true);
        try {
            const vehicleStr = `${clientInvite.year} ${clientInvite.make} ${clientInvite.model}`.trim() || 'Unspecified Vehicle';

            // FINALIZE the existing draft via RPC — bypasses PostgREST cache
            await jobService.finalizeDraft(
                draftTicketId,
                clientInvite.name,
                stableClientId,
                vehicleStr,
                clientInvite.image || undefined,
            );

            showToast(`✓ ${clientInvite.name} saved to board!`);
            void navigate('/s/board');
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('Save & Start error:', msg, err);
            setSaveError(msg);
            showToast(`Error: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Draft error UI ──
    if (draftError) {
        return (
            <div className="bg-background-dark font-display text-slate-100 min-h-screen flex flex-col items-center justify-center p-8">
                <div className="glass-card rounded-2xl p-8 border border-red-500/20 max-w-sm text-center">
                    <span className="material-symbols-outlined text-4xl text-red-400 mb-4">error</span>
                    <h2 className="text-lg font-bold text-white mb-2">Setup Error</h2>
                    <p className="text-sm text-slate-400 mb-4">{draftError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-primary text-background-dark font-bold rounded-xl text-sm"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen flex flex-col relative">
            {/* Ambient Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[45%] h-[40%] bg-primary/5 blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[35%] bg-primary/5 blur-[100px] pointer-events-none z-0"></div>

            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 safe-top">
                <div className="flex items-center px-5 py-4">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => void navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full hover:bg-white/5 transition-colors premium-press"
                    >
                        <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                    </motion.button>
                    <div className="flex-1 text-center">
                        <h1 className="font-header text-lg font-bold tracking-tight">Invite & Onboard</h1>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={resetClientInvite}
                        className="flex size-10 items-center justify-center rounded-full hover:bg-white/5 transition-colors premium-press"
                        title="Reset Form"
                    >
                        <span className="material-symbols-outlined text-slate-400">restart_alt</span>
                    </motion.button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10">
                <div className="pb-12">
                    {/* Introduction */}
                    <div className="px-6 pt-6 pb-4">
                        <h2 className="text-2xl font-bold text-slate-100 font-header">New Client Onboarding</h2>
                        <p className="text-slate-400 text-sm mt-1">Pre-fill details to personalize their mobile experience.</p>
                    </div>


                    {/* Form Section */}
                    <section className="px-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 ml-1">Customer Name</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg">person</span>
                                <input
                                    className={`w-full glass-card border rounded-xl pl-14 pr-4 py-4 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all bg-transparent ${saveError && !clientInvite.name?.trim() ? 'border-red-500/50' : 'border-white/10'}`}
                                    placeholder="Enter full name"
                                    type="text"
                                    value={clientInvite.name}
                                    onChange={(e) => { updateClientInvite('name', e.target.value); setSaveError(''); }}
                                />
                            </div>
                            {saveError && !clientInvite.name?.trim() && (
                                <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">{saveError}</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 ml-1">Phone Number</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg">phone</span>
                                <input
                                    className="w-full glass-card border border-white/10 rounded-xl pl-14 pr-4 py-4 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all bg-transparent"
                                    placeholder="(555) 000-0000"
                                    type="tel"
                                    value={clientInvite.phone}
                                    onChange={(e) => updateClientInvite('phone', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 ml-1">Customer Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg">mail</span>
                                <input
                                    className="w-full glass-card border border-white/10 rounded-xl pl-14 pr-4 py-4 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all bg-transparent"
                                    placeholder="customer@example.com"
                                    type="email"
                                    value={clientInvite.email}
                                    onChange={(e) => updateClientInvite('email', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5 pt-2">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 mb-2">Vehicle Details</div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Year</label>
                                    <input
                                        className="w-full glass-card border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                        placeholder="2024"
                                        type="text"
                                        value={clientInvite.year}
                                        onChange={(e) => updateClientInvite('year', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Make</label>
                                    <input
                                        className="w-full glass-card border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                        placeholder="Porsche"
                                        type="text"
                                        value={clientInvite.make}
                                        onChange={(e) => updateClientInvite('make', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 mt-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Model</label>
                                    <input
                                        className="w-full glass-card border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                        placeholder="911 GT3 RS"
                                        type="text"
                                        value={clientInvite.model}
                                        onChange={(e) => updateClientInvite('model', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 ml-1">Plate / VIN (Optional)</label>
                            <div className="relative flex gap-2">
                                <div className="relative flex-1">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg">directions_car</span>
                                    <input
                                        className="w-full glass-card border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all bg-transparent uppercase"
                                        placeholder="e.g. ABC-1234 or VIN"
                                        type="text"
                                        value={clientInvite.vinPlate}
                                        onChange={(e) => updateClientInvite('vinPlate', e.target.value)}
                                    />
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => {
                                        void (async () => {
                                            if (!clientInvite.vinPlate || clientInvite.vinPlate.length < 11) {
                                                showToast('Please enter a valid VIN (11+ chars)');
                                                return;
                                            }
                                            showToast('Decoding VIN...');
                                            const data = await decodeVin(clientInvite.vinPlate);
                                            if (data.error) {
                                                showToast(data.error);
                                            } else {
                                                updateClientInvite('year', data.year);
                                                updateClientInvite('make', data.make);
                                                updateClientInvite('model', `${data.model} ${data.trim ?? ''}`.trim());
                                                if (data.image) updateClientInvite('image', data.image);
                                                showToast('Vehicle details synchronized!');
                                            }
                                        })();
                                    }}
                                    className="px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-primary premium-press"
                                    title="Lookup VIN"
                                >
                                    <span className="material-symbols-outlined">search</span>
                                </motion.button>
                            </div>
                        </div>

                        {/* Vehicle Image Preview */}
                        {clientInvite.make && clientInvite.model && (
                            <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                                    <img
                                        src={clientInvite.image || '/vehicle-placeholder.svg'}
                                        alt="Vehicle Preview"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            e.currentTarget.src = '/vehicle-placeholder.svg';
                                        }}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/80 to-transparent p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-primary animate-pulse" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Live Visual Sync</p>
                                        </div>
                                        <p className="text-white font-black italic glass-text text-sm mt-0.5">{clientInvite.year} {clientInvite.make} {clientInvite.model}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* QR Code Section */}
                    <section className="px-6 mt-8">
                        <div className="glass-card rounded-xl p-8 border border-primary/10 flex flex-col items-center text-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
                                In-Person Scan
                            </div>
                            {/* Real QR Code — draft ticket token */}
                            <div className="relative p-4 bg-white rounded-lg border-4 border-primary/30 shadow-lg shadow-primary/10">
                                <div className="w-44 h-44 bg-white flex items-center justify-center overflow-hidden">
                                    {qrImageUrl ? (
                                        <img
                                            alt="QR Code for customer onboarding"
                                            className="w-full h-full"
                                            src={qrImageUrl}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.innerHTML = '<span class="material-symbols-outlined text-6xl text-slate-300">qr_code_2</span><p class="text-[9px] text-slate-400 mt-2">QR unavailable</p>';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="size-6 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
                                            <p className="text-[9px] text-slate-400">Generating…</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="mt-6 text-sm text-slate-400 font-medium">
                                Point customer camera here to<br />
                                <span className="text-slate-200">autofill details and join portal</span>
                            </p>

                            {/* Copy/Share invite link button */}
                            <button
                                onClick={() => { void handleCopyLink(); }}
                                className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                                Copy Invite Link
                            </button>
                        </div>
                    </section>

                    {/* Remote Invite Actions */}
                    <section className="px-6 mt-8 space-y-3">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Remote Invite</div>
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                                if (!clientInvite.name || !clientInvite.phone) {
                                    showToast('Please enter name and phone first');
                                    return;
                                }
                                void sendInvite('sms');
                            }}
                            className="w-full bg-primary text-background-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 orange-glow transition-all hover:brightness-110 premium-press"
                        >
                            <span className="material-symbols-outlined">sms</span>
                            Send SMS Invite
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                                if (!clientInvite.name || !clientInvite.email) {
                                    showToast('Please enter name and email first');
                                    return;
                                }
                                void sendInvite('email');
                            }}
                            className="w-full glass-card border border-white/10 text-slate-200 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all premium-press"
                        >
                            <span className="material-symbols-outlined text-primary">mail</span>
                            Email Invite Link
                        </motion.button>
                    </section>

                    <p className="text-center text-[10px] text-slate-600 mt-6 px-12">
                        By sending an invite, you agree to our Terms of Service. Customer will receive a one-time personalized setup link.
                    </p>

                    {/* Save & Start Service Button */}
                    <div className="mt-12 px-6 pb-12 safe-bottom">
                        <div className="max-w-[430px] mx-auto space-y-4">
                            {/* Error message */}
                            {saveError && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{saveError}</p>
                                </div>
                            )}

                            <motion.button
                                whileTap={isSaving ? undefined : { scale: 0.98 }}
                                disabled={isSaving}
                                onClick={() => { void handleSaveAndStart(); }}
                                className={`w-full font-black py-5 rounded-2xl flex items-center justify-center gap-3 depth-raised depth-gloss active:depth-pressed orange-glow uppercase tracking-[0.2em] text-xs transition-all ${isSaving
                                    ? 'bg-slate-800 text-slate-500 cursor-wait shadow-none'
                                    : 'bg-primary text-background-dark shadow-primary/30 hover:brightness-110'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="size-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin" />
                                        Saving Ticket...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold">save</span>
                                        Save & Start Service
                                    </>
                                )}
                            </motion.button>
                            <p className="text-[9px] text-center text-slate-500 uppercase tracking-[0.2em] font-bold">Instantly creates a ticket on your board</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InviteOnboardClient;
