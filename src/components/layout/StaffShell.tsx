import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useKeyboardInset } from '../../hooks/useKeyboardInset';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';
import PageTransition from '../common/PageTransition';
import PageErrorBoundary from '../common/PageErrorBoundary';
import GarageBackground from './GarageBackground';

const STAFF_NAV = [
    { label: 'Board', icon: 'dashboard', path: '/s/board' },
    { label: 'Onboard', icon: 'person_add', path: '/s/onboard' },
    { label: 'Schedule', icon: 'calendar_month', path: '/s/appointments' },
    { label: 'Messages', icon: 'chat', path: '/s/messages' },
    { label: 'Settings', icon: 'settings', path: '/s/settings' },
];

const StaffShell: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, currentUser } = useAuth();
    useKeyboardInset();
    const swipe = useSwipeNavigation(STAFF_NAV);

    const [prevPath, setPrevPath] = useState(location.pathname);
    const [direction, setDirection] = useState(0);
    const shopName = currentUser?.shopName ?? 'Staff Portal';

    if (location.pathname !== prevPath) {
        const prevIndex = STAFF_NAV.findIndex((item) => prevPath.startsWith(item.path));
        const nextIndex = STAFF_NAV.findIndex((item) => location.pathname.startsWith(item.path));

        if (nextIndex !== -1 && prevIndex !== -1 && nextIndex !== prevIndex) {
            setDirection(nextIndex > prevIndex ? 1 : -1);
        }
        setPrevPath(location.pathname);
    }

    const onLogout = () => {
        logout('staff');
        void navigate('/s/login');
    };

    return (
        <GarageBackground>
            <div className="flex flex-col min-h-screen relative text-white">
                <header className="fixed left-4 right-4 z-40 max-w-[400px] mx-auto px-4 h-12 flex items-center justify-between pointer-events-none bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border)] rounded-2xl shadow-[var(--glass-shadow)] overflow-hidden staff-header-safe">
                    <div className="absolute top-0 left-0 right-0 h-full bg-[var(--glossy-shine)] pointer-events-none z-0" />
                    <div className="relative z-10 pointer-events-auto flex items-center justify-between w-full">
                        <h2 className="text-[10px] font-black uppercase tracking-[.2em] text-white/90 truncate mr-4">{shopName}</h2>
                        <button
                            onClick={() => { void onLogout(); }}
                            className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">logout</span>
                            Logout
                        </button>
                    </div>
                </header>

                <main className="flex-1 pt-16 pb-navbar relative z-10 overflow-x-hidden" onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
                    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                        <PageTransition
                            key={location.pathname}
                            direction={direction}
                            className="w-full flex flex-col"
                        >
                            <PageErrorBoundary>
                                <Outlet />
                            </PageErrorBoundary>
                        </PageTransition>
                    </AnimatePresence>
                </main>

                <nav
                    className="fixed bottom-4 left-4 right-4 z-50 max-w-[400px] mx-auto bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border)] rounded-3xl shadow-[var(--glass-shadow)] overflow-hidden keyboard-lift"
                >
                    <div className="absolute top-0 left-0 right-0 h-full bg-[var(--glossy-shine)] pointer-events-none z-0" />
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.05
                                }
                            }
                        }}
                        className="relative z-10 flex justify-around items-center h-16"
                    >
                        {STAFF_NAV.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <motion.button
                                    key={item.label}
                                    variants={{
                                        hidden: { y: 20, opacity: 0 },
                                        show: { y: 0, opacity: 1 }
                                    }}
                                    onClick={() => void navigate(item.path)}
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
                                            layoutId="staffActiveId"
                                            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_var(--primary-muted)]"
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </nav>
            </div>
        </GarageBackground>
    );
};

export default StaffShell;
