import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../context/useAppContext';

export const Toast: React.FC = () => {
    const { toast } = useAppContext();
    const [visible, setVisible] = useState(false);
    const [displayText, setDisplayText] = useState<string | null>(null);
    const [progress, setProgress] = useState(100);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!toast) {
            setVisible(false);
            return;
        }
        // Use microtask to batch state updates
        queueMicrotask(() => {
            setDisplayText(toast);
            setVisible(true);
            setProgress(100);
        });

        // Animate the progress bar
        const startTime = Date.now();
        const duration = 3000;
        const tick = () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
            if (remaining > 0) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };
        rafRef.current = requestAnimationFrame(tick);

        const hideTimer = setTimeout(() => setVisible(false), 3000);
        const clearTimer = setTimeout(() => setDisplayText(null), 3400);

        return () => {
            clearTimeout(hideTimer);
            clearTimeout(clearTimer);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [toast]);

    if (!displayText) return null;

    // Determine icon based on content
    const isError = displayText.toLowerCase().includes('error') || displayText.toLowerCase().includes('fail');
    const isSuccess = displayText.includes('✓') || displayText.toLowerCase().includes('saved') || displayText.toLowerCase().includes('copied');
    const icon = isError ? 'error' : isSuccess ? 'check_circle' : 'info';
    const borderColor = isError ? 'border-red-500/30' : 'border-primary/30';
    const textColor = isError ? 'text-red-400' : 'text-primary';
    const glowClass = isError ? '' : 'orange-glow';
    const progressColor = isError
        ? 'bg-gradient-to-r from-red-500/60 to-red-400'
        : 'bg-gradient-to-r from-primary/60 to-primary';

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none transition-all duration-400 ${visible
                ? 'translate-y-6 opacity-100'
                : '-translate-y-full opacity-0'
                }`}
        >
            <div className={`glass-card border ${borderColor} rounded-xl px-5 py-3 text-sm font-bold ${textColor} flex flex-col gap-1.5 shadow-2xl ${glowClass} pointer-events-auto max-w-[90vw]`}>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">{icon}</span>
                    <span className="truncate">{displayText}</span>
                </div>
                {/* Progress bar */}
                <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${progressColor} rounded-full`}
                        style={{
                            width: `${progress}%`,
                            transition: 'width 100ms linear',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
