import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Job } from '../../context/AppTypes';
import { bayService } from '../../services/bayService';
import type { BayStatus } from '../../services/bayService';

interface BayMapGridProps {
    jobs: Job[];
    totalBays: number;
    onBayClick?: (bay: BayStatus) => void;
}

const BayMapGrid: React.FC<BayMapGridProps> = ({ jobs, totalBays, onBayClick }) => {
    const bayStatuses = bayService.getBayStatus(jobs, totalBays);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {bayStatuses.map((bay, index) => (
                <motion.div
                    key={bay.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onBayClick?.(bay)}
                    className={`
                        relative group cursor-pointer mirror-card p-3 border-white/5 
                        transition-all duration-500 overflow-hidden
                        ${bay.isOccupied ? 'border-primary/20' : 'hover:border-white/20'}
                        ${bay.hasConflict ? 'border-red-500/40 animate-pulse' : ''}
                    `}
                >
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 p-1 opacity-10">
                        <span className="material-symbols-outlined text-4xl">garage</span>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-primary transition-colors">
                                #{bay.id.padStart(2, '0')}
                            </span>
                            <div className={`size-1.5 rounded-full ${bay.isOccupied ? 'bg-primary' : 'bg-white/10'}`} />
                        </div>

                        <div className="h-10 flex flex-col justify-center">
                            {bay.isOccupied ? (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={bay.currentJob?.id}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 5 }}
                                    >
                                        <p className="text-[12px] font-bold text-white truncate uppercase tracking-tight">
                                            {bay.currentJob?.vehicle.split(' ').slice(-2).join(' ')}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase truncate">
                                            {bay.currentJob?.status}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            ) : (
                                <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
                                    AVAILABLE
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Conflict Indicator */}
                    {bay.hasConflict && (
                        <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center pointer-events-none">
                            <span className="material-symbols-outlined text-red-500 text-sm animate-bounce">warning</span>
                        </div>
                    )}

                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
            ))}
        </div>
    );
};

export default BayMapGrid;
