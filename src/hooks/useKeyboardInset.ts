import { useEffect } from 'react';

export const useKeyboardInset = () => {
    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;

        const updateInset = () => {
            const keyboardInset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
            document.documentElement.style.setProperty('--keyboard-inset', `${keyboardInset}px`);
        };

        updateInset();
        vv.addEventListener('resize', updateInset);
        vv.addEventListener('scroll', updateInset);
        window.addEventListener('focusin', updateInset);
        window.addEventListener('focusout', updateInset);

        return () => {
            vv.removeEventListener('resize', updateInset);
            vv.removeEventListener('scroll', updateInset);
            window.removeEventListener('focusin', updateInset);
            window.removeEventListener('focusout', updateInset);
            document.documentElement.style.setProperty('--keyboard-inset', '0px');
        };
    }, []);
};
