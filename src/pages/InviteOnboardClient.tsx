import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { motion } from 'framer-motion';

const InviteOnboardClient: React.FC = () => {
    const navigate = useNavigate();
    const { clientInvite, updateClientInvite, sendInvite, resetClientInvite, showToast, decodeVin } = useAppContext();

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
                        onClick={() => navigate(-1)}
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
            <main className="flex-1 relative z-10 pb-28">
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
                                className="w-full glass-card border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all bg-transparent"
                                placeholder="Enter full name"
                                type="text"
                                value={clientInvite.name}
                                onChange={(e) => updateClientInvite('name', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 ml-1">Phone Number</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg">phone</span>
                            <input
                                className="w-full glass-card border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all bg-transparent"
                                placeholder="(555) 000-0000"
                                type="tel"
                                value={clientInvite.phone}
                                onChange={(e) => updateClientInvite('phone', e.target.value)}
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
                                onClick={async () => {
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
                                        updateClientInvite('model', `${data.model} ${data.trim || ''}`.trim());
                                        if (data.image) updateClientInvite('image', data.image);
                                        showToast('Vehicle details & image synchronized!');
                                    }
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
                                    src={clientInvite.image || `https://loremflickr.com/800/600/${(clientInvite.make || 'car').replace(/\s+/g, ',')},${(clientInvite.model || '').replace(/\s+/g, ',')},luxury,studio/all`}
                                    alt="Vehicle Preview"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => {
                                        // Use the premium fallback if the dynamic one fails
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000&auto=format&fit=crop';
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
                        {/* Dynamic QR Code */}
                        <div className="relative p-4 bg-white rounded-lg border-4 border-primary/30 shadow-lg shadow-primary/10">
                            <div className="w-44 h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
                                <img
                                    alt="QR Code for customer onboarding"
                                    className="w-full h-full"
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/welcome?invite=true&role=client&name=${encodeURIComponent(clientInvite.name)}&vehicle=${encodeURIComponent(`${clientInvite.year} ${clientInvite.make} ${clientInvite.model}`)}`)}`}
                                />
                            </div>
                        </div>
                        <p className="mt-6 text-sm text-slate-400 font-medium">
                            Point customer camera here to<br />
                            <span className="text-slate-200">autofill details and join portal</span>
                        </p>
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
                            sendInvite('sms');
                        }}
                        className="w-full bg-primary text-background-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 orange-glow transition-all hover:brightness-110 premium-press"
                    >
                        <span className="material-symbols-outlined">sms</span>
                        Send SMS Invite
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                            if (!clientInvite.name) {
                                showToast('Please enter a customer name first');
                                return;
                            }
                            sendInvite('email');
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
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background-dark/90 backdrop-blur-xl border-t border-white/5 px-4 pb-8 pt-3">
                <div className="flex justify-around items-center max-w-lg mx-auto">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/dashboard/shop')}
                        className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors premium-press"
                    >
                        <span className="material-symbols-outlined">home</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="flex flex-col items-center gap-1 text-primary premium-press"
                    >
                        <span className="material-symbols-outlined fill-1">person_add</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Onboard</span>
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/shop/actions')}
                        className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors premium-press"
                    >
                        <span className="material-symbols-outlined">group</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Clients</span>
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => showToast('Settings coming soon!')}
                        className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors premium-press"
                    >
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Settings</span>
                    </motion.button>
                </div>
            </nav>
        </div>
    );
};

export default InviteOnboardClient;
