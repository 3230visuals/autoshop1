import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useKeyboardInset } from '../../hooks/useKeyboardInset';

const STAFF_NAV = [
    { label: 'Board', icon: 'dashboard', path: '/s/board' },
    { label: 'Schedule', icon: 'calendar_month', path: '/s/appointments' },
    { label: 'Messages', icon: 'chat', path: '/s/messages' },
    { label: 'Settings', icon: 'settings', path: '/s/settings' },
];

const StaffShell: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    useKeyboardInset();

    const handleLogout = () => {
        localStorage.removeItem('staffAuth');
        localStorage.removeItem('staffRole');
        navigate('/s/login');
    };

    return (
        <div className="min-h-screen bg-page-dark-01 text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/8 blur-[150px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-primary/4 blur-[120px] rounded-full" />
                <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-accent/3 blur-[100px] rounded-full" />
            </div>

            <header className="fixed top-0 left-0 right-0 z-40 max-w-[430px] mx-auto px-6 h-16 flex items-center justify-between pointer-events-none">
                <div className="pointer-events-auto">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Staff Dashboard</h2>
                </div>
                <button
                    onClick={handleLogout}
                    className="pointer-events-auto size-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-all active:scale-90"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
            </header>

            <main className="flex-1 pt-16 pb-shell-nav relative z-10">
                <Outlet />
            </main>

            <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-card-dark/80 backdrop-blur-xl border-t border-white/5 safe-bottom keyboard-lift">
                <div className="flex justify-around items-center h-16">
                    {STAFF_NAV.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${isActive ? 'text-primary' : 'text-slate-500'}`}
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

export default StaffShell;
