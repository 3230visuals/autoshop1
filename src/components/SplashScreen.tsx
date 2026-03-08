import React, { useState, useEffect, useRef } from 'react';

/**
 * SERVICEBAY Branded Splash Screen
 * Shows on first app load with a premium logo animation,
 * then fades out after content is ready.
 * Includes a hard safety timeout to guarantee it clears.
 */
const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'logo' | 'text' | 'exit'>('logo');
    const completedRef = useRef(false);

    useEffect(() => {
        const safeComplete = () => {
            if (!completedRef.current) {
                completedRef.current = true;
                onComplete();
            }
        };

        const t1 = setTimeout(() => setPhase('text'), 400);
        const t2 = setTimeout(() => setPhase('exit'), 1500);
        const t3 = setTimeout(safeComplete, 2000);
        // Hard safety: if for any reason the above timers don't fire (e.g. Safari throttling),
        // force-clear the splash after 4 seconds no matter what.
        const safety = setTimeout(safeComplete, 4000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(safety);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-500 ${phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
            style={{ background: '#07080a' }}
        >
            {/* Logo + text container */}
            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Animated logo icon */}
                <div
                    className={`flex items-center justify-center transition-all duration-700 ${phase === 'logo' ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
                        }`}
                >
                    <div className="relative">
                        <div
                            className="size-24 rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'radial-gradient(50% 40% at 50% 45%, rgba(79, 70, 229, 0.12) 0%, transparent 100%)',
                                border: '1px solid rgba(79,70,229,0.2)',
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    fontSize: '44px',
                                    color: '#4F46E5',
                                    fontVariationSettings: "'FILL' 1, 'wght' 600",
                                }}
                            >
                                precision_manufacturing
                            </span>
                        </div>
                    </div>
                </div>

                {/* Brand text */}
                <div
                    className={`flex flex-col items-center gap-2 transition-all duration-700 delay-200 ${phase === 'logo' ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
                        }`}
                >
                    <h1
                        className="text-2xl font-black tracking-[0.3em] text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        SERVICEBAY
                    </h1>
                    <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/30">
                        Auto Repair Management
                    </p>
                </div>

                {/* Loading bar */}
                <div
                    className={`w-32 h-0.5 bg-white/5 rounded-full overflow-hidden mt-4 transition-opacity duration-500 ${phase === 'text' ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <div
                        className="h-full rounded-full"
                        style={{
                            background: 'linear-gradient(90deg, rgba(79,70,229,0.6), #4F46E5)',
                            animation: 'splash-load 1s ease-in-out forwards',
                        }}
                    />
                </div>
            </div>

            <style>{`
                @keyframes splash-load {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;

