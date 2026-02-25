import React from 'react';
import { useAppContext } from '../../context/useAppContext';

export const Toast: React.FC = () => {
    const { toast } = useAppContext();
    if (!toast) return null;
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
            <div className="glass-card border border-primary/30 rounded-xl px-5 py-3 text-sm font-bold text-primary flex items-center gap-2 shadow-2xl orange-glow">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {toast}
            </div>
        </div>
    );
};
