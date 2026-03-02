import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ComingSoonPlaceholderProps {
    title: string;
    icon: string;
}

const ComingSoonPlaceholder: React.FC<ComingSoonPlaceholderProps> = ({ title, icon }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="size-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
                <span className="material-symbols-outlined text-primary text-5xl">{icon}</span>
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">{title}</h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-12">System Module coming soon</p>
            
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => void navigate('/s/board')}
                className="px-8 h-14 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 transition-all"
            >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                Return to Dashboard
            </motion.button>
        </div>
    );
};

export default ComingSoonPlaceholder;
