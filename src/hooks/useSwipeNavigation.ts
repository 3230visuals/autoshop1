import { useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
    path: string;
    [key: string]: unknown;
}

/**
 * Hook that adds horizontal swipe navigation between tab pages.
 * Returns a ref to attach to the swipeable container and touch handlers.
 */
export const useSwipeNavigation = (navItems: NavItem[]) => {
    const navigate = useNavigate();
    const location = useLocation();
    const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

    const currentIndex = navItems.findIndex((item) =>
        location.pathname.startsWith(item.path)
    );

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    }, []);

    const onTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            if (!touchStart.current || currentIndex === -1) return;

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStart.current.x;
            const deltaY = touch.clientY - touchStart.current.y;
            const elapsed = Date.now() - touchStart.current.time;

            touchStart.current = null;

            // Must be a horizontal swipe: enough distance, fast enough, more horizontal than vertical
            const MIN_DISTANCE = 80; // Increased from 60 for stability
            const MAX_TIME = 400;

            if (
                Math.abs(deltaX) < MIN_DISTANCE ||
                elapsed > MAX_TIME ||
                Math.abs(deltaY) > Math.abs(deltaX) * 0.6 // Slightly stricter horizontal requirement
            ) {
                return;
            }

            if (deltaX < 0 && currentIndex < navItems.length - 1) {
                // Swipe left → go to next tab
                void navigate(navItems[currentIndex + 1].path);
            } else if (deltaX > 0 && currentIndex > 0) {
                // Swipe right → go to previous tab
                void navigate(navItems[currentIndex - 1].path);
            }
        },
        [currentIndex, navItems, navigate]
    );

    return { onTouchStart, onTouchEnd };
};
