import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    x: number;
    y: number;
    delay: number;
}

const CheckeredFlagBadge: React.FC = () => {
    const [isAnimating, setIsAnimating] = useState(true);
    const [particleData] = useState<Particle[]>(() =>
        Array.from({ length: 8 }).map(() => ({
            x: (Math.random() - 0.5) * 150,
            y: (Math.random() - 0.5) * 150,
            delay: Math.random() * 0.5
        }))
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAnimating(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative size-32 flex items-center justify-center">
            <AnimatePresence mode="wait">
                {isAnimating ? (
                    <motion.div
                        key="waving"
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{
                            scale: 1,
                            rotate: 0,
                            x: [0, 5, -5, 5, 0],
                            y: [0, -2, 2, -2, 0]
                        }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{
                            duration: 0.5,
                            x: { repeat: 5, duration: 0.5, ease: "easeInOut" },
                            y: { repeat: 5, duration: 0.5, ease: "easeInOut" }
                        }}
                        className="relative size-24 bg-white rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl flex flex-wrap"
                    >
                        {/* Checkered Pattern */}
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-1/4 h-1/4 ${(Math.floor(i / 4) + i % 4) % 2 === 0 ? 'bg-black' : 'bg-white'}`}
                            />
                        ))}
                        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="static"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="size-24 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)] border-4 border-white/20"
                    >
                        <span className="material-symbols-outlined text-white text-5xl font-bold">check</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Particles/Confetti effect during animation */}
            {isAnimating && (
                <div className="absolute inset-0 pointer-events-none">
                    {particleData.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                            animate={{
                                x: p.x,
                                y: p.y,
                                opacity: 0,
                                scale: 1
                            }}
                            transition={{ duration: 1, delay: p.delay, repeat: 2 }}
                            className="absolute top-1/2 left-1/2 size-2 bg-primary rounded-full"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CheckeredFlagBadge;
