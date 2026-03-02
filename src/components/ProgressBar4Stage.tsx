import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SERVICE_STAGES } from '../context/AppTypes';
import StageChangeModal from './StageChangeModal';

interface ProgressBarProps {
    currentStageIndex: number;
    role: 'CLIENT' | 'STAFF' | 'OWNER';
    onStageChange?: (index: number) => void;
}

const VISUAL_STEPS = [
    { label: 'Scheduled', min: 0, max: 1 },
    { label: 'In Progress', min: 2, max: 5 },
    { label: 'Ready', min: 6, max: 6 },
    { label: 'Completed', min: 7, max: 7 }
];

const ProgressBar4Stage: React.FC<ProgressBarProps> = ({ currentStageIndex, role, onStageChange }) => {
    const [showConfirm, setShowConfirm] = useState<number | null>(null);

    const currentVisualStep = VISUAL_STEPS.findIndex(s => currentStageIndex >= s.min && currentStageIndex <= s.max);

    const handleStepClick = (visualIndex: number) => {
        if (role === 'CLIENT') return;
        const targetStep = VISUAL_STEPS[visualIndex];
        if (visualIndex < currentVisualStep && role === 'OWNER') {
            setShowConfirm(targetStep.min);
        } else if (visualIndex !== currentVisualStep) {
            onStageChange?.(targetStep.min);
        }
    };

    return (
        <div className="w-full">
            {/* Step Tiles — uniform grid */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                {VISUAL_STEPS.map((step, index) => {
                    const isActive = index === currentVisualStep;
                    const isCompleted = index < currentVisualStep;

                    return (
                        <button
                            key={step.label}
                            onClick={() => handleStepClick(index)}
                            className="flex flex-col items-center gap-2 group"
                        >
                            {/* Tile */}
                            <div className={`
                                w-full min-h-[50px] rounded-2xl relative depth-raised depth-gloss
                                flex items-center justify-center transition-all duration-500
                                ${isActive
                                    ? 'border-amber-400/50 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                                    : isCompleted
                                        ? 'border-emerald-500/30 bg-emerald-500/8'
                                        : 'border-white/5 bg-white/[0.02]'}
                                ${isActive ? '' : 'group-hover:border-white/20'}
                            `}>
                                {/* LED Indicator */}
                                {isCompleted ? (
                                    <div className="depth-led text-emerald-400 p-1.5 flex items-center justify-center bg-emerald-500/20">
                                        <span className="material-symbols-outlined text-lg font-black">check</span>
                                    </div>
                                ) : isActive ? (
                                    <motion.div
                                        animate={{
                                            boxShadow: [
                                                '0 0 10px rgba(245,158,11,0.4)',
                                                '0 0 30px rgba(245,158,11,0.8)',
                                                '0 0 10px rgba(245,158,11,0.4)'
                                            ]
                                        }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="size-4 depth-led bg-amber-400 text-amber-100"
                                    />
                                ) : (
                                    <div className="size-3 rounded-full depth-track flex items-center justify-center">
                                        <div className="size-1 rounded-full bg-white/5" />
                                    </div>
                                )}
                            </div>

                            {/* Label */}
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] leading-none transition-colors
                                ${isActive ? 'text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : isCompleted ? 'text-emerald-400/60' : 'text-slate-600'}
                            `}>
                                {step.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Status Registry Card */}
            <div className="depth-track rounded-3xl p-5 flex flex-col items-center relative overflow-hidden border border-white/5">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-white/5" />
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">Service Frequency Status</p>
                <motion.div
                    key={currentStageIndex}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-center"
                >
                    <h4 className="text-xl font-black uppercase tracking-tighter text-amber-400 stage-text-glow">
                        {SERVICE_STAGES[currentStageIndex]}
                    </h4>
                    <div className="mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="size-1.5 depth-led bg-amber-400" />
                        Live Update Phase
                    </div>
                </motion.div>
            </div>

            <StageChangeModal
                isOpen={showConfirm !== null}
                targetStageIndex={showConfirm}
                onConfirm={() => { onStageChange?.(showConfirm!); setShowConfirm(null); }}
                onCancel={() => setShowConfirm(null)}
            />
        </div>
    );
};

export default ProgressBar4Stage;
