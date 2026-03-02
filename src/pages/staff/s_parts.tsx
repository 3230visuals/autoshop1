import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const S_Parts: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-page-dark-01">
            <header className="px-6 pt-8 pb-8 bg-staff-hero-01 relative overflow-hidden border-b border-white/5 text-center safe-top">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Inventory</h1>
                <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.45em] mt-2">Parts & Supplies</p>
            </header>

            <div className="p-6 space-y-6">
                <div className="glass-card p-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center space-y-4">
                    <div className="size-20 bg-primary/10 rounded-[2rem] border border-primary/20 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-primary text-4xl">inventory_2</span>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Inventory Engine</h2>
                    <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed">
                        Parts catalog, inventory tracking, and vendor ordering system is being synchronized.
                    </p>
                    <div className="pt-6 w-full space-y-3">
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: "65%" }}
                                transition={{ duration: 2, ease: "easeOut" }}
                            />
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">65% Synchronized</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center opacity-60">
                        <span className="material-symbols-outlined text-slate-500 mb-2">add_box</span>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Item</p>
                    </button>
                    <button className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center opacity-60">
                        <span className="material-symbols-outlined text-slate-500 mb-2">qr_code_2</span>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan QR</p>
                    </button>
                </div>

                <button 
                    onClick={() => void navigate('/s/board')}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default S_Parts;
