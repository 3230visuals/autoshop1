import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICE_STAGES } from '../utils/mockTickets';

interface StageChangeModalProps {
    isOpen: boolean;
    targetStageIndex: number | null;
    onConfirm: () => void;
    onCancel: () => void;
}

const StageChangeModal: React.FC<StageChangeModalProps> = ({ isOpen, targetStageIndex, onConfirm, onCancel }) => {
    if (!isOpen || targetStageIndex === null) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-12 sm:items-center sm:p-0">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="relative bg-[#121214] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />

                    <div className="flex flex-col items-center text-center">
                        <div className="size-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                            <span className="material-symbols-outlined text-blue-500 text-4xl">history</span>
                        </div>

                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Confirm Rollback</h3>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            You are moving this ticket back to <span className="text-blue-400 font-bold uppercase tracking-widest text-[11px]">{SERVICE_STAGES[targetStageIndex]}</span>. This will notify the client.
                        </p>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <button
                                onClick={onCancel}
                                className="h-14 bg-white/5 border border-white/10 rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="h-14 bg-blue-600 rounded-xl font-bold uppercase text-[10px] tracking-widest text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default StageChangeModal;
