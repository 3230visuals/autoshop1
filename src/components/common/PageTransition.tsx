import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
    direction?: number; // 1 for next (slide from right), -1 for prev (slide from left)
    className?: string;
}

const variants = {
    enter: (direction: number) => ({
        x: direction === 0 ? 0 : (direction > 0 ? 24 : -24),
        opacity: 0,
        scale: 0.985,
        filter: 'blur(6px)',
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
    },
    exit: (direction: number) => ({
        x: direction === 0 ? 0 : (direction > 0 ? -16 : 16),
        opacity: 0,
        scale: 0.99,
        filter: 'blur(4px)',
    }),
};

const PageTransition = ({ children, direction = 0, className = "w-full min-h-screen flex flex-col" }: PageTransitionProps) => {
    return (
        <motion.div
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
                default: { type: "spring", stiffness: 360, damping: 34, mass: 0.72 },
                opacity: { duration: 0.18, ease: "easeOut" },
                filter: { duration: 0.18, ease: "easeOut" },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
