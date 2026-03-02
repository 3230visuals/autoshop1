import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SERVICE_STAGES } from '../context/AppTypes';
import { getStageColor } from '../utils/stageColors';
import StageChangeModal from './StageChangeModal';

/* ═══════════════════════════════════════════════════
   ProgressBar7Stage — Red → Yellow → Green Glow
   ─ Dots and connector glow from red to green
   ─ Next dot pulses then fills on advance
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
    const [justAdvanced, setJustAdvanced] = useState(false);

    useEffect(() => {
        if (currentStageIndex > prevStageRef.current) {
            // Trigger animation on next frame to avoid synchronous setState warning
            const startTimer = setTimeout(() => setJustAdvanced(true), 0);
            const endTimer = setTimeout(() => setJustAdvanced(false), 1200);
            prevStageRef.current = currentStageIndex;
            return () => {
                clearTimeout(startTimer);
                clearTimeout(endTimer);
            };
        }
        prevStageRef.current = currentStageIndex;
    }, [currentStageIndex]);

    const handleStageClick = (index: number) => {
        if (role === 'CLIENT') return;
        if (role === 'STAFF') {
            if (index === currentStageIndex + 1) onStageChange?.(index);
            return;
        }
        if (role === 'OWNER') {
            if (index < currentStageIndex) setShowConfirm(index);
            else if (index !== currentStageIndex) onStageChange?.(index);
        }
    };

    const confirmRollback = () => {
        if (showConfirm !== null) {
            onStageChange?.(showConfirm);
            setShowConfirm(null);
        }
    };

    const totalStages = SERVICE_STAGES.length;
    const activeColor = getStageColor(currentStageIndex, totalStages);

    return (
        <div className="w-full py-6">
            <div className="flex gap-1.5 mb-8 h-8 items-center px-1">
                {SERVICE_STAGES.map((label, index) => {
                    const isCompleted = index < currentStageIndex;
                    const isActive = index === currentStageIndex;
                    const stageColor = getStageColor(index, totalStages);
                    const isPlaySheen = isActive && justAdvanced;

                    return (
                        <div key={label} className="flex-1 h-full relative group">
                            <button
                                onClick={() => handleStageClick(index)}
                                className={`
                                    w-full h-full rounded-2xl transition-all duration-500 relative overflow-hidden
                                    border border-white/10 flex items-center justify-center
                                    ${isActive || isCompleted ? 'shadow-[0_6px_14px_rgba(0,0,0,0.55)]' : ''}
                                `}
                                style={{
                                    background: isCompleted || isActive
                                        ? `linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))`
                                        : 'rgba(255,255,255,0.03)',
                                    borderColor: isActive
                                        ? `color-mix(in srgb, ${stageColor} 40%, white 10%)`
                                        : isCompleted
                                            ? `color-mix(in srgb, ${stageColor} 20%, white 5%)`
                                            : 'rgba(255,255,255,0.08)',
                                    boxShadow: isActive
                                        ? `0 6px 14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 6px rgba(0,0,0,0.45), 0 0 15px ${stageColor}2e`
                                        : isCompleted
                                            ? `0 4px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 4px rgba(0,0,0,0.3)`
                                            : 'none'
                                }}
                            >
                                {/* Inner beveled highlight line */}
                                {(isActive || isCompleted) && (
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20 z-10" />
                                )}

                                {/* Progress Fill for Completed/Active */}
                                {(isCompleted || isActive) && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 z-0"
                                        style={{
                                            background: `linear-gradient(to bottom, ${stageColor}44, ${stageColor}11)`,
                                        }}
                                    />
                                )}

                                {/* Animated Sheen Sweep */}
                                {isPlaySheen && (
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '200%' }}
                                        transition={{ duration: 1.2, ease: "easeInOut" }}
                                        className="absolute inset-0 z-20 pointer-events-none"
                                        style={{
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                            skewX: '-20deg'
                                        }}
                                    />
                                )}

                                {/* Icon / Indicator */}
                                <div className="relative z-30">
                                    {isCompleted ? (
                                        <span className="material-symbols-outlined text-[14px] text-white/80 font-bold">check</span>
                                    ) : isActive ? (
                                        <motion.div
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: stageColor, boxShadow: `0 0 8px ${stageColor}` }}
                                        />
                                    ) : (
                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                    )}
                                </div>

                                {/* Pulse for Staff Next */}
                                {role !== 'CLIENT' && index === currentStageIndex + 1 && (
                                    <motion.div
                                        animate={{ opacity: [0, 0.5, 0], scale: [0.9, 1.1, 0.9] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute inset-0 border-2 border-primary/20 rounded-2xl pointer-events-none"
                                    />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Labels scrollable on mobile */}
            <div className="w-full overflow-x-auto no-scrollbar py-2 -mx-4 px-4 mb-4">
                <div className="flex justify-between min-w-[500px] items-start px-2">
                    {SERVICE_STAGES.map((label, index) => {
                        const isActive = index === currentStageIndex;
                        const isCompleted = index < currentStageIndex;
                        const stageColor = getStageColor(index, totalStages);

                        return (
                            <div key={label} className="flex flex-col items-center w-16 text-center">
                                <span
                                    className={`text-[8px] font-black uppercase tracking-widest leading-none mb-1 transition-colors duration-500 ${isActive || isCompleted ? 'text-white/80' : 'text-white/20'}`}
                                >
                                    Step {index + 1}
                                </span>
                                <span
                                    onClick={() => handleStageClick(index)}
                                    className={`text-[9px] font-bold uppercase tracking-tight transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100'} ${isActive || isCompleted ? '' : 'text-white/30'}`}
                                    style={{ color: isActive ? stageColor : isCompleted ? 'rgba(255,255,255,0.7)' : 'inherit' }}
                                >
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col items-center mt-2 px-6">
                <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/10" />
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-0.5 text-center">Currently in</p>
                    <motion.h4
                        key={currentStageIndex}
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-xl font-black uppercase tracking-tight text-center"
                        style={{ color: activeColor, textShadow: `0 0 12px ${activeColor}40` }}
                    >
                        {SERVICE_STAGES[currentStageIndex]}
                    </motion.h4>
                </div>
            </div>

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
