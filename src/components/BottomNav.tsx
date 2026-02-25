import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

const SHOP_NAV: { label: string; icon: string; path: string; staffOnly?: boolean }[] = [
    { label: 'Terminal', icon: 'dashboard', path: '/dashboard/shop' },
    { label: 'Inventory', icon: 'grid_view', path: '/shop/inventory' },
    { label: 'Comms', icon: 'chat', path: '/messages' },
    { label: 'Personnel', icon: 'badge', path: '/shop/staff', staffOnly: true },
];

const CLIENT_NAV = [
    { label: 'Status', icon: 'monitoring', path: '/dashboard/owner' },
    { label: 'Diagnosis', icon: 'biotech', path: '/report' },
    { label: 'Service', icon: 'build_circle', path: '/approve' },
    { label: 'Profile', icon: 'account_circle', path: '/profile' },
];

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, showToast } = useAppContext();

    const isClient = currentUser.role === 'CLIENT';
    const isMechanic = currentUser.role === 'STAFF';
    const isAdminOrOwner = currentUser.role === 'OWNER' || currentUser.role === 'OWNER';

    const navItems = useMemo(() => {
        if (isClient) return CLIENT_NAV;
        if (isMechanic) {
            return SHOP_NAV.map(item =>
                item.path === '/dashboard/shop' ? { ...item, path: '/staff' } : item
            );
        }
        return SHOP_NAV;
    }, [isClient, isMechanic]);

    // Scroll-aware visibility
    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    // Reset visibility on route change - using render-time check to avoid extra effects
    const [prevPath, setPrevPath] = useState(location.pathname);
    if (prevPath !== location.pathname) {
        setPrevPath(location.pathname);
        if (!visible) setVisible(true);
    }

    useEffect(() => {
        // Reset scroll position tracking on route change
        lastScrollY.current = 0;
    }, [location.pathname]);

    useEffect(() => {
        const onScroll = () => {
            if (!ticking.current) {
                requestAnimationFrame(() => {
                    const currentY = window.scrollY;
                    const diff = currentY - lastScrollY.current;

                    if (diff > 8 && currentY > 60) {
                        // Scrolling down — hide
                        setVisible(false);
                    } else if (diff < -8) {
                        // Scrolling up — show
                        setVisible(true);
                    }

                    lastScrollY.current = currentY;
                    ticking.current = false;
                });
                ticking.current = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handlePress = (item: (typeof SHOP_NAV)[number]) => {
        if (item.staffOnly && !isAdminOrOwner) {
            showToast('Staff management: Admin or Owner access required');
            return;
        }
        navigate(item.path);
    };

    return (
        <>
            {/* Main nav bar — slides down when hidden */}
            <motion.nav
                initial={false}
                animate={{ y: visible ? 0 : '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto"
            >
                <div className="bg-card-dark border-t border-white/5 safe-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-around items-center px-6 h-[64px]">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path ||
                                (item.path === '/report' && location.pathname.startsWith('/report')) ||
                                (item.path === '/approve' && location.pathname.startsWith('/approve')) ||
                                (item.path === '/checkout' && (location.pathname === '/checkout' || location.pathname === '/success'));
                            const isLocked = (item as { staffOnly?: boolean }).staffOnly && !isAdminOrOwner;

                            return (
                                <motion.button
                                    key={item.label}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handlePress(item)}
                                    className={`relative flex flex-col items-center justify-center gap-1.5 h-full transition-all min-w-0 flex-1 ${isActive ? 'text-white' : isLocked ? 'text-slate-700' : 'text-slate-500'
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                                        <span className={`material-symbols-outlined text-[24px] relative z-10 transition-all ${isActive ? 'text-primary font-bold' : 'opacity-60'}`}>
                                            {item.icon}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] leading-none transition-all ${isActive ? 'text-primary' : 'text-slate-600 opacity-80'}`}>
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] rounded-full bg-primary shadow-[0_4px_12px_var(--primary-muted)]"
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </motion.nav>
        </>
    );
};

export default BottomNav;
