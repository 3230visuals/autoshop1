import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
    direction?: number; // 1 for next (slide from right), -1 for prev (slide from left)
    className?: string;
}

const variants = {
    enter: (direction: number) => ({
        x: direction === 0 ? 0 : (direction > 0 ? '100%' : '-100%'),
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction === 0 ? 0 : (direction > 0 ? '-100%' : '100%'),
        opacity: 0,
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
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
