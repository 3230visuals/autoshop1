import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/useAppContext';
import { useNavigate } from 'react-router-dom';

export const RoleSwitcher: React.FC = () => {
    const { currentUser, switchUser, users } = useAppContext();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleSwitch = (userId: string) => {
        switchUser(userId);
        setIsOpen(false);

        const user = users.find(u => u.id === userId);
        if (user?.role === 'CLIENT') {
            navigate('/dashboard/owner'); // Alex's dashboard
        } else if (user?.role === 'STAFF') {
            navigate('/staff'); // Mechanic dashboard
        } else if (user?.role === 'OWNER' || user?.role === 'OWNER') {
            navigate('/dashboard/shop'); // Marcus's dashboard
        }
    };

    return (
        <div className="fixed top-24 right-4 z-[9999]">
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="size-12 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10 overflow-hidden group"
            >
                <img
                    src={currentUser.avatar}
                    alt="Role"
                    className="size-8 rounded-full border border-white/20 transition-transform group-hover:scale-110"
                />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10, x: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10, x: 10 }}
                            className="absolute right-0 mt-3 w-56 glass-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl origin-top-right"
                        >
                            <div className="p-4 border-b border-white/5 bg-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Role Play Switcher</p>
                                <p className="text-xs text-slate-400 mt-1">Test multi-device sync</p>
                            </div>
                            <div className="p-2 space-y-1">
                                {users.map((user) => (
                                    <motion.button
                                        key={user.id}
                                        whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                        onClick={() => handleSwitch(user.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentUser.id === user.id ? 'bg-primary/10 border border-primary/20' : 'border border-transparent'
                                            }`}
                                    >
                                        <img src={user.avatar} alt={user.name} className="size-8 rounded-full border border-white/10" />
                                        <div className="text-left">
                                            <p className={`text-xs font-bold ${currentUser.id === user.id ? 'text-primary' : 'text-slate-200'}`}>
                                                {user.name}
                                            </p>
                                            <p className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold">{user.role}</p>
                                        </div>
                                        {currentUser.id === user.id && (
                                            <span className="material-symbols-outlined text-primary text-sm ml-auto">check_circle</span>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                            <div className="p-3 bg-primary/5 text-center">
                                <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">Live Sync Active 📡</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
