import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const CLIENT_NAV = [
    { label: 'Home', icon: 'home', path: '/c/home' },
    { label: 'Track', icon: 'monitoring', path: '/c/track' },
    { label: 'Settings', icon: 'settings', path: '/c/home' },
];

const ClientShell: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background-dark text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-slate-800/10 blur-[100px] rounded-full" />
            </div>
            <main className="flex-1 pb-24 relative z-10">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-card-dark/80 backdrop-blur-xl border-t border-white/5 safe-bottom">
                <div className="flex justify-around items-center h-16">
                    {CLIENT_NAV.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${isActive ? 'text-primary' : 'text-slate-500'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-2xl ${isActive ? 'font-bold' : 'opacity-60'}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isActive ? 'text-primary' : 'text-slate-600'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="clientActiveId"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full shadow-[0_0_10px_var(--primary-muted)]"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default ClientShell;
