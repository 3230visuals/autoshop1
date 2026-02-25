import React, { createContext, useContext, useEffect, useState } from 'react';

interface DebugContextType {
    enabled: boolean;
}

const DebugContext = createContext<DebugContextType>({ enabled: false });

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [enabled] = useState(() => import.meta.env.VITE_DEBUG_MODE === 'true');

    useEffect(() => {
        if (!enabled) return;

        const handleCapture = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            console.log('%c[DEBUG CLICK]', 'background: #f27f0d; color: #000; padding: 2px 4px; border-radius: 4px;', {
                element: target,
                tagName: target.tagName,
                classes: target.className,
                isSemantic: ['BUTTON', 'A'].includes(target.tagName) || target.closest('button, a'),
                hasOnClick: !!target.onclick || !!(target as any).__reactProps?.onClick
            });

            if (!target.closest('button, a') && target.getAttribute('onclick') === null && !(target as any).__reactProps?.onClick) {
                // Not necessarily broken, but worth a check if it's supposed to be interactive
            }
        };

        window.addEventListener('click', handleCapture, true);

        // Highlight fixed overlays
        const style = document.createElement('style');
        style.textContent = `
            [data-debug-overlay="true"] { outline: 2px solid red !important; background: rgba(255,0,0,0.1) !important; }
            .fixed, .absolute { outline: 1px dashed rgba(242,127,13,0.3); }
        `;
        document.head.appendChild(style);

        return () => {
            window.removeEventListener('click', handleCapture, true);
            document.head.removeChild(style);
        };
    }, [enabled]);

    return (
        <DebugContext.Provider value={{ enabled }}>
            {children}
            {enabled && (
                <div className="fixed bottom-4 left-4 z-[9999] bg-primary text-zinc-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest pointer-events-none shadow-2xl">
                    Debug Active
                </div>
            )}
        </DebugContext.Provider>
    );
};

export const useDebug = () => useContext(DebugContext);
