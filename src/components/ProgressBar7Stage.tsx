import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICE_STAGES } from '../utils/mockTickets';
import StageChangeModal from './StageChangeModal';

/* ═══════════════════════════════════════════════════
   ProgressBar7Stage — Animation Type B
   ─ Next dot pulses then fills on advance
   ─ Connector line fills toward the active dot
   ─ ticket.stageIndex is the SINGLE SOURCE OF TRUTH
   ═══════════════════════════════════════════════════ */

interface ProgressBarProps {
    currentStageIndex: number;
    role: 'CLIENT' | 'STAFF' | 'OWNER';
    onStageChange?: (index: number) => void;
}

const ProgressBar7Stage: React.FC<ProgressBarProps> = ({ currentStageIndex, role, onStageChange }) => {
    const [showConfirm, setShowConfirm] = useState<number | null>(null);
    const prevStageRef = useRef(currentStageIndex);
    const [animatingDot, setAnimatingDot] = useState<number | null>(null);

    // Trigger fill animation when stage changes — setState calls are async (inside setTimeout)
    useEffect(() => {
        if (currentStageIndex !== prevStageRef.current) {
            prevStageRef.current = currentStageIndex;
            const showTimer = setTimeout(() => setAnimatingDot(currentStageIndex), 0);
            const hideTimer = setTimeout(() => setAnimatingDot(null), 600);
            return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
        }
    }, [currentStageIndex]);

    /* ── Permission Logic ──────────────────── */
    const handleStageClick = (index: number) => {
        if (role === 'CLIENT') return; // read-only

        if (role === 'STAFF') {
            // Staff can only advance to the NEXT stage
            if (index === currentStageIndex + 1) {
                onStageChange?.(index);
            }
            return;
        }

        if (role === 'OWNER') {
            // Owner can jump forward freely; backward requires confirmation
            if (index < currentStageIndex) {
                setShowConfirm(index);
            } else if (index !== currentStageIndex) {
                onStageChange?.(index);
            }
        }
    };

    const confirmRollback = () => {
        if (showConfirm !== null) {
            onStageChange?.(showConfirm);
            setShowConfirm(null);
        }
    };

    const totalStages = SERVICE_STAGES.length;

    return (
        <div className="w-full py-4">
            <div className="relative flex justify-between mb-8">
                {/* ── Background connector (track) ── */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/8 -translate-y-1/2 z-0 rounded-full" />

                {/* ── Filled connector (progress) ── */}
                <motion.div
                    initial={false}
                    animate={{
                        width: `${(currentStageIndex / (totalStages - 1)) * 100}%`
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 60,
                        damping: 18,
                        delay: 0.15,
                    }}
                    className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 z-0 rounded-full"
                />

                {/* ── Stage Dots ── */}
                {SERVICE_STAGES.map((_, index) => {
                    const isActive = index === currentStageIndex;
                    const isCompleted = index < currentStageIndex;
                    const isNext = index === currentStageIndex + 1;
                    const isStaffNext = role === 'STAFF' && isNext;
                    const isOwnerClickable = role === 'OWNER' && index !== currentStageIndex;
                    const isFilling = animatingDot === index;

                    return (
                        <div key={index} className="relative z-10 flex flex-col items-center">
                            <button
                                onClick={() => handleStageClick(index)}
                                className={`
                                    size-4 rounded-full border-2 transition-colors duration-300
                                    ${isActive
                                        ? 'bg-primary border-primary scale-125'
                                        : isCompleted
                                            ? 'bg-primary border-primary'
                                            : isStaffNext
                                                ? 'bg-transparent border-primary/50'
                                                : 'bg-[#09090B] border-white/15'
                                    }
                                    ${(isStaffNext || isOwnerClickable) ? 'cursor-pointer' : role === 'CLIENT' ? 'cursor-default' : 'cursor-default'}
                                `}
                            >
                                {/* Check mark for completed dots */}
                                {isCompleted && (
                                    <span className="material-symbols-outlined text-[10px] text-white flex items-center justify-center h-full">
                                        check
                                    </span>
                                )}

                                {/* Animation Type B: next dot pulses (only for staff/owner) */}
                                {isNext && role !== 'CLIENT' && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-primary/30"
                                        animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
                                    />
                                )}

                                {/* Animation Type B: fill burst when a dot becomes active */}
                                <AnimatePresence>
                                    {isFilling && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 1 }}
                                            animate={{ scale: 2, opacity: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                            className="absolute inset-0 rounded-full bg-primary"
                                        />
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* ── Current Status Label ── */}
            <div className="flex flex-col items-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Current Status</p>
                <motion.h4
                    key={currentStageIndex}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-lg font-black text-white uppercase tracking-tighter"
                >
                    {SERVICE_STAGES[currentStageIndex]}
                </motion.h4>
            </div>

            {/* ── Rollback Confirmation Modal (Owner only) ── */}
            <StageChangeModal
                isOpen={showConfirm !== null}
                targetStageIndex={showConfirm}
                onConfirm={confirmRollback}
                onCancel={() => setShowConfirm(null)}
            />
        </div>
    );
};

export default ProgressBar7Stage;
