import React from 'react';
import { motion } from 'framer-motion';

interface GarageBackgroundProps {
    children: React.ReactNode;
}

const GarageBackground: React.FC<GarageBackgroundProps> = ({ children }) => {
    return (
        <div className="relative min-h-screen bg-[#0f1114] overflow-hidden">
            {/* ── Layer 1: Metal Grate Texture ── */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-60"
                style={{
                    backgroundImage: `
                        repeating-linear-gradient(
                            45deg,
                            rgba(255,255,255,0.035) 0 2px,
                            transparent 2px 14px
                        ),
                        repeating-linear-gradient(
                            -45deg,
                            rgba(255,255,255,0.03) 0 2px,
                            transparent 2px 14px
                        )
                    `
                }}
            />

            {/* ── Layer 2: Vignette Depth ── */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(at 50% 30%, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
                }}
            />
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{
                    background: 'radial-gradient(at 50% 120%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
                }}
            />

            {/* ── Layer 3: Noise Grain ── */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.07]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* ── Layer 4: Cinematic Light Sweep ── */}
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.10]"
                initial={{ x: '-50%', y: '-20%', rotate: -12 }}
                animate={{
                    x: ['-50%', '50%'],
                    y: ['-20%', '20%']
                }}
                transition={{
                    duration: 14,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                style={{
                    width: '180%',
                    height: '180%',
                    background: `
                        linear-gradient(
                            120deg,
                            transparent 35%,
                            rgba(255,255,255,0.2) 50%,
                            transparent 65%
                        )
                    `
                }}
            />

            {/* ── Content Layer ── */}
            <div className="relative z-10 w-full min-h-screen">
                {children}
            </div>
        </div>
    );
};

export default GarageBackground;
