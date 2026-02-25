import React from 'react';
import CheckeredFlagBadge from './CheckeredFlagBadge';

interface SuccessCardProps {
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
    variant?: 'client' | 'staff';
}

const SuccessCard: React.FC<SuccessCardProps> = ({ title, description, actionLabel, onAction, variant = 'client' }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
            <CheckeredFlagBadge />

            <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter text-white mt-8">{title}</h1>
            <p className="text-slate-500 mb-12 max-w-xs font-bold uppercase tracking-widest text-[10px]">
                {description}
            </p>

            <button
                onClick={onAction}
                className={`w-full max-w-xs h-16 rounded-2xl font-bold uppercase text-[12px] tracking-[0.3em] text-white transition-all ${variant === 'client'
                        ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                        : 'bg-blue-600 shadow-2xl shadow-blue-900/30'
                    }`}
            >
                {actionLabel}
            </button>
        </div>
    );
};

export default SuccessCard;
