import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useKeyboardInset } from '../../hooks/useKeyboardInset';

const CLIENT_NAV = [
    { label: 'Home', icon: 'home', path: '/c/home' },
    { label: 'Track', icon: 'monitoring', path: '/c/track' },
];

const ClientShell: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    useKeyboardInset();

    return (
        <div className="min-h-screen bg-page-dark-01 text-white flex flex-col relative overflow-hidden">
            <div className="page-overlay absolute inset-0 z-0 pointer-events-none" />
            <main className="flex-1 pb-shell-nav relative z-10">
                <Outlet />
            </main>

            <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-[#121214]/80 backdrop-blur-xl border-t border-white/5 safe-bottom keyboard-lift">
                <div className="flex justify-around items-center h-16">
                    {CLIENT_NAV.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${isActive ? 'text-blue-500' : 'text-slate-500'}`}
                            >
                                <span className={`material-symbols-outlined text-2xl ${isActive ? 'font-bold' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="clientActiveId"
                                        className="absolute top-0 w-8 h-0.5 bg-blue-500 rounded-full"
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
