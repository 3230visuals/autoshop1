import React from 'react';

/**
 * Background Animator — Polished Car / Tech / Service Theme
 * Creates an immersive dark environment with automotive-inspired gradients,
 * subtle mesh patterns, and tech-forward visual depth.
 * 
 * NOTE: All colors use hardcoded rgba() for Safari < 16.2 compatibility.
 * Do NOT use color-mix() here — it breaks Safari rendering.
 */
export const BackgroundAnimator: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#07080a]">

            {/* ── Base gradient: Deep carbon fiber feel ── */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        radial-gradient(ellipse 120% 80% at 50% -10%, rgba(15, 23, 42, 0.8) 0%, transparent 60%),
                        radial-gradient(ellipse 80% 100% at 0% 100%, rgba(6, 11, 20, 0.6) 0%, transparent 50%),
                        radial-gradient(ellipse 80% 100% at 100% 0%, rgba(10, 15, 28, 0.4) 0%, transparent 50%),
                        linear-gradient(180deg, #07080a 0%, #0a0c10 30%, #080a0e 70%, #07080a 100%)
                    `,
                }}
            />

            {/* ── Primary accent glow: Subtly tinted top diffusion ── */}
            <div
                className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-40"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.12) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
            />

            {/* ── Accent bloom: Lower-left automotive warmth ── */}
            <div
                className="absolute bottom-0 -left-20 w-[500px] h-[400px] opacity-20"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(234, 88, 12, 0.15) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                }}
            />

            {/* ── Tech grid: Subtle horizontal scan lines ── */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 3px,
                        rgba(255, 255, 255, 0.03) 3px,
                        rgba(255, 255, 255, 0.03) 4px
                    )`,
                    backgroundSize: '100% 4px',
                }}
            />

            {/* ── Hex mesh: Dashboard instrument cluster feel ── */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `
                        linear-gradient(30deg, rgba(255,255,255,0.05) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,0.05) 87.5%, rgba(255,255,255,0.05)),
                        linear-gradient(150deg, rgba(255,255,255,0.05) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,0.05) 87.5%, rgba(255,255,255,0.05)),
                        linear-gradient(30deg, rgba(255,255,255,0.05) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,0.05) 87.5%, rgba(255,255,255,0.05)),
                        linear-gradient(150deg, rgba(255,255,255,0.05) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,0.05) 87.5%, rgba(255,255,255,0.05)),
                        linear-gradient(60deg, rgba(200,200,200,0.04) 25%, transparent 25.5%, transparent 75%, rgba(200,200,200,0.04) 75%, rgba(200,200,200,0.04)),
                        linear-gradient(60deg, rgba(200,200,200,0.04) 25%, transparent 25.5%, transparent 75%, rgba(200,200,200,0.04) 75%, rgba(200,200,200,0.04))
                    `,
                    backgroundSize: '80px 140px',
                    backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px',
                }}
            />

            {/* ── Chrome reflection: Polished metal shimmer crossing the viewport ── */}
            <div
                className="absolute top-[15%] left-0 right-0 h-[1px] opacity-[0.06]"
                style={{
                    background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.6) 70%, transparent 90%)',
                }}
            />
            <div
                className="absolute top-[15%] left-0 right-0 h-[60px] -translate-y-1/2 opacity-[0.02]"
                style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    filter: 'blur(20px)',
                }}
            />

            {/* ── Service bay divider lines: Subtle vertical marks ── */}
            <div
                className="absolute top-[30%] bottom-[30%] left-[20%] w-[1px] opacity-[0.03]"
                style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent)' }}
            />
            <div
                className="absolute top-[25%] bottom-[35%] right-[25%] w-[1px] opacity-[0.03]"
                style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent)' }}
            />

            {/* ── Corner light flares: LED workshop vibe ── */}
            <div
                className="absolute top-0 right-0 w-[300px] h-[300px] opacity-[0.04]"
                style={{
                    background: 'radial-gradient(circle at 100% 0%, rgba(79, 70, 229, 0.3) 0%, transparent 60%)',
                }}
            />
            <div
                className="absolute bottom-0 left-0 w-[200px] h-[200px] opacity-[0.03]"
                style={{
                    background: 'radial-gradient(circle at 0% 100%, rgba(234, 88, 12, 0.25) 0%, transparent 60%)',
                }}
            />

            {/* ── Vignette: Focus attention inward ── */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 50%, rgba(0,0,0,0.5) 100%)',
                }}
            />
        </div>
    );
};
