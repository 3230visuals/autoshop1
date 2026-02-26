import React from 'react';

/**
 * Enterprise Operations: Background Animator
 * Neutralized to remove all visual noise, particles, and dramatic glows.
 * Keeps a very subtle gradient for depth.
 */
export const BackgroundAnimator: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0a0c]">
            {/* Extremely subtle depth highlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/[0.02] blur-[120px]"></div>
        </div>
    );
};
