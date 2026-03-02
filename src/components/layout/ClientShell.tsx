import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboardInset } from '../../hooks/useKeyboardInset';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';
import PageTransition from '../common/PageTransition';
import GarageBackground from './GarageBackground';

const CLIENT_NAV = [
    { label: 'Home', icon: 'home', path: '/c/home' },
    { label: 'Track', icon: 'monitoring', path: '/c/track' },
    { label: 'Payments', icon: 'payments', path: '/c/payments' },
    { label: 'App', icon: 'install_mobile', path: '/download' },
];

import { useAuth } from '../../context/AuthContext';
const ClientShell: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clientUser } = useAuth();
    const shopName = clientUser?.shopName ?? 'Client Portal';
    useKeyboardInset();
    const swipe = useSwipeNavigation(CLIENT_NAV);

    const [direction, setDirection] = useState(0);
    const prevIndexRef = useRef(CLIENT_NAV.findIndex((item) => location.pathname.startsWith(item.path)));

    useEffect(() => {
        const nextIndex = CLIENT_NAV.findIndex((item) =>
            location.pathname.startsWith(item.path)
        );
        if (nextIndex !== -1 && nextIndex !== prevIndexRef.current) {
            // eslint-disable-next-line
            setDirection(nextIndex > prevIndexRef.current ? 1 : -1);
            prevIndexRef.current = nextIndex;
        }
    }, [location.pathname]);

    return (
        <GarageBackground>
            <div className="flex flex-col min-h-screen relative text-white">
                <header className="fixed top-2 left-4 right-4 z-40 max-w-[400px] mx-auto px-4 h-12 flex items-center justify-between pointer-events-none safe-top bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border)] rounded-2xl shadow-[var(--glass-shadow)] overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-full bg-[var(--glossy-shine)] pointer-events-none z-0" />
                    <div className="relative z-10 pointer-events-auto flex items-center justify-center w-full">
                        <h2 className="text-[10px] font-black uppercase tracking-[.2em] text-white/90 truncate">{shopName}</h2>
                    </div>
                </header>

                <main className="flex-1 pt-16 pb-navbar relative z-10 overflow-x-hidden" onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
                    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                        <PageTransition
                            key={location.pathname}
                            direction={direction}
                            className="w-full flex flex-col"
                        >
                            <Outlet />
                        </PageTransition>
                    </AnimatePresence>
                </main>

                <nav className="fixed bottom-6 left-4 right-4 z-50 max-w-[400px] mx-auto bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border)] rounded-3xl shadow-[var(--glass-shadow)] overflow-hidden safe-bottom keyboard-lift">
                    <div className="absolute top-0 left-0 right-0 h-full bg-[var(--glossy-shine)] pointer-events-none z-0" />
                    <div className="relative z-10 flex justify-around items-center h-16">
                        {CLIENT_NAV.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => { void navigate(item.path); }}
                                    className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative border-none bg-transparent shadow-none hover:bg-white/5 active:scale-95 ${isActive ? 'text-primary' : 'text-slate-500'}`}
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
                                            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_var(--primary-muted)]"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </GarageBackground>
    );
};

export default ClientShell;
