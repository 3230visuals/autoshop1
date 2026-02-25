import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { motion } from 'framer-motion';
import type { AuthRole } from '../context/AppTypes';

const InviteOnboardStaff: React.FC = () => {
    const navigate = useNavigate();
    const { staffInvite, updateStaffInvite, sendStaffInvite, resetStaffInvite, showToast } = useAppContext();

    const roles: AuthRole[] = ['STAFF', 'OWNER', 'OWNER'];

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
                        <h1 className="font-header text-lg font-bold tracking-tight">Invite Staff</h1>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={resetStaffInvite}
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
                    <h2 className="text-2xl font-bold text-slate-100 font-header">New Team Member</h2>
                    <p className="text-slate-400 text-sm mt-1">Add a technician or admin to your shop ecosystem.</p>
                </div>

                {/* Form Section */}
                <section className="px-6 space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 ml-1">Full Name</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg">person</span>
                            <input
                                className="w-full glass-card border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all bg-transparent"
                                placeholder="Enter staff name"
                                type="text"
                                value={staffInvite.name}
                                onChange={(e) => updateStaffInvite('name', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 ml-1">Email Address</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg">mail</span>
                            <input
                                className="w-full glass-card border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all bg-transparent"
                                placeholder="staff@example.com"
                                type="email"
                                value={staffInvite.email}
                                onChange={(e) => updateStaffInvite('email', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-widest">Assign Role</label>
                        <div className="grid grid-cols-1 gap-2">
                            {roles.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => updateStaffInvite('role', role)}
                                    className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${staffInvite.role === role
                                        ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(255,119,0,0.15)] text-primary'
                                        : 'bg-white/5 border-white/10 text-slate-400'
                                        }`}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold tracking-tight">{role}</span>
                                        <span className="text-[10px] opacity-60">
                                            {role === 'OWNER' && 'Full access + billing'}
                                            {role === 'OWNER' && 'Manage jobs & staff'}
                                            {role === 'STAFF' && 'Clock-in & task updates'}
                                        </span>
                                    </div>
                                    <span className={`material-symbols-outlined ${staffInvite.role === role ? 'opacity-100' : 'opacity-0'}`}>
                                        check_circle
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* QR Code Section */}
                <section className="px-6 mt-10">
                    <div className="glass-card rounded-xl p-8 border border-white/5 flex flex-col items-center text-center">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
                            Direct Boarding
                        </div>
                        <div className="relative p-2 bg-white/5 rounded-lg border border-white/10">
                            <img
                                alt="QR Code for staff onboarding"
                                className="w-40 h-40 filter invert brightness-200"
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/?mode=signup&role=${staffInvite.role}&invite=true`)}`}
                            />
                        </div>
                        <p className="mt-6 text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-relaxed">
                            Technician can scan to<br />
                            <span className="text-slate-300">auto-configure mobile toolkit</span>
                        </p>
                    </div>
                </section>

                {/* Invite Actions */}
                <section className="px-6 mt-8 space-y-3">
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                            if (!staffInvite.name || !staffInvite.email) {
                                showToast('Please enter name and email first');
                                return;
                            }
                            sendStaffInvite();
                        }}
                        className="w-full bg-primary text-background-dark font-black py-4 rounded-xl flex items-center justify-center gap-3 orange-glow transition-all hover:brightness-110 premium-press uppercase text-xs tracking-widest"
                    >
                        <span className="material-symbols-outlined">send</span>
                        Send Digital Invite
                    </motion.button>
                </section>

                <p className="text-center text-[10px] text-slate-600 mt-6 px-12 italic">
                    All invites are logged with a security hash. Access expires in 24h.
                </p>
            </main>
        </div>
    );
};

export default InviteOnboardStaff;
