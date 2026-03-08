import React, { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
    Vehicle, ServicePhoto, PaymentRecord, AppNotification,
    ServiceHistoryRecord, Referral, VinData, StaffInvite
} from './AppTypes';
import { vinService } from '../services/vinService';

import { AppContext } from './AppContextCore';
import type { AppContextType } from './AppContextCore';
import { useAuth } from './useAuth';
import { JobProvider } from './JobContext';
import { useJobs } from './useJobs';
import { OrderProvider, useOrder } from './OrderContext';
import { InventoryProvider, useInventory } from './InventoryContext';
import { MessageProvider } from './MessageContext';
import { useTheme } from './ThemeContext';
import { referralService } from '../services/referralService';

/* ═══════════════════════════════════════════════════
   Thin inner provider — merges all contexts for
   backward compatibility with useAppContext()
   ═══════════════════════════════════════════════════ */

const AppInnerProvider: React.FC<{ children: ReactNode; showToast: (msg: string) => void; toast: string | null }> = ({ children, showToast, toast }) => {
    const auth = useAuth();
    const jobCtx = useJobs();
    const orderCtx = useOrder();
    const inventoryCtx = useInventory();
    const themeCtx = useTheme();

    // ── Vehicle ───────────────────────
    const [vehicle] = useState<Vehicle>({
        id: 'v1', year: 2022, make: 'Porsche', model: '911 GT3',
        licensePlate: 'FAST-GT3', vin: 'WP0AC2A8XNS25400', tag: 'PORSCHE',
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80',
        healthScore: 98, status: 'Repair In Progress',
    });

    // ── Additional State ─────────────
    const [servicePhotos, setServicePhotos] = useState<ServicePhoto[]>([]);
    const [paymentHistory] = useState<PaymentRecord[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loyaltyPoints] = useState(1250);
    const [serviceHistory] = useState<ServiceHistoryRecord[]>([]);

    // ── Referrals (live from referralService) ──
    const activeClientId = auth.currentUser?.id ?? 'u4';
    const activeShopId = auth.currentUser?.shopId ?? '';
    const [referralCode] = useState(() => referralService.getCodeForClient(activeClientId));
    const [referrals, setReferrals] = useState<Referral[]>(() => {
        referralService.seedDemoReferrals(activeClientId, activeShopId);
        return referralService.getReferralsByClient(activeClientId);
    });
    const [referralRewardPoints, setReferralRewardPoints] = useState(() =>
        referralService.getTotalRewardPoints(activeClientId)
    );

    const refreshReferrals = useCallback(() => {
        setReferrals(referralService.getReferralsByClient(activeClientId));
        setReferralRewardPoints(referralService.getTotalRewardPoints(activeClientId));
    }, [activeClientId]);



    const addReferral = useCallback((data: { name: string; email?: string; phone?: string; shopId: string }) => {
        const ref = referralService.addReferral({ ...data, referredBy: activeClientId });
        refreshReferrals();
        return ref;
    }, [activeClientId, refreshReferrals]);

    const markReferralConverted = useCallback((id: string) => {
        referralService.markConverted(id);
        refreshReferrals();
    }, [refreshReferrals]);

    const markAllRead = useCallback(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);
    const removeServicePhoto = useCallback((id: string) => setServicePhotos(prev => prev.filter(p => p.id !== id)), []);
    const addServicePhoto = useCallback((photo: Omit<ServicePhoto, 'id' | 'timestamp'>) => {
        setServicePhotos(prev => [...prev, { ...photo, id: `p${Date.now()}`, timestamp: Date.now() } as ServicePhoto]);
    }, []);
    const redeemReward = useCallback((cost: number) => showToast(`Redeemed ${cost} points`), [showToast]);

    // ── Staff Invite ──────────────────
    const [staffInvite, setStaffInvite] = useState<StaffInvite>({
        name: '', email: '', role: 'STAFF', sent: false
    });

    const updateStaffInvite = useCallback((field: keyof StaffInvite, value: string | boolean) => {
        setStaffInvite((prev) => ({ ...prev, [field]: value }));
    }, []);

    const sendStaffInvite = useCallback(() => {
        setStaffInvite((prev) => ({ ...prev, sent: true }));
        showToast(`Staff invite sent to ${staffInvite.email} as ${staffInvite.role}`);
    }, [staffInvite, showToast]);

    const resetStaffInvite = useCallback(() => {
        setStaffInvite({ name: '', email: '', role: 'STAFF', sent: false });
    }, []);

    const decodeVin = useCallback(async (vin: string): Promise<VinData> => {
        return vinService.decodeVin(vin);
    }, []);

    // Merge all contexts into a single backward-compatible value
    const value = useMemo<AppContextType>(() => ({
        toast,
        showToast,
        vehicle: { ...vehicle, status: jobCtx.serviceStatus },
        currentUser: auth.currentUser,
        users: auth.users,
        switchUser: auth.switchUser,
        updateCurrentUser: auth.updateCurrentUser,
        updateUserRole: auth.updateUserRole,
        // Order
        order: orderCtx.order,
        approveServices: orderCtx.approveServices,
        setTipPercent: orderCtx.setTipPercent,
        completePayment: orderCtx.completePayment,
        startStripeCheckout: orderCtx.startStripeCheckout,
        resetOrder: orderCtx.resetOrder,
        isProcessing: orderCtx.isProcessing,
        serviceItems: orderCtx.serviceItems,
        addServiceItem: orderCtx.addServiceItem,
        updateServiceItem: orderCtx.updateServiceItem,
        deleteServiceItem: orderCtx.deleteServiceItem,
        selectedServiceIds: orderCtx.selectedServiceIds,
        toggleService: orderCtx.toggleService,
        // Inventory
        inventory: inventoryCtx.inventory,
        updateInventoryStock: inventoryCtx.updateInventoryStock,
        addInventoryItem: inventoryCtx.addInventoryItem,
        searchParts: inventoryCtx.searchParts,
        // Theme
        shopTheme: themeCtx.theme,
        setShopTheme: (...args) => { void themeCtx.updateTheme(...args); },
        // Misc
        servicePhotos,
        addServicePhoto,
        removeServicePhoto,
        paymentHistory,
        notifications,
        markAllRead,
        serviceHistory,
        loyaltyPoints,
        redeemReward,
        referralCode,
        referrals,
        addReferral,
        markReferralConverted,
        refreshReferrals,
        referralRewardPoints,
        staffInvite,
        updateStaffInvite,
        sendStaffInvite,
        resetStaffInvite,
        decodeVin,
        isLoading: jobCtx.isLoading,
    }), [
        auth, jobCtx, orderCtx, inventoryCtx,
        vehicle, servicePhotos, addServicePhoto, removeServicePhoto,
        paymentHistory, notifications, markAllRead, serviceHistory,
        loyaltyPoints, redeemReward, referralCode, referrals, addReferral, markReferralConverted, refreshReferrals, referralRewardPoints,
        staffInvite, updateStaffInvite, sendStaffInvite, resetStaffInvite,
        decodeVin, themeCtx, toast, showToast
    ]);

    return <AppContext value={value}>{children}</AppContext>;
};

/* ═══════════════════════════════════════════════════
   Root AppProvider — composes sub-providers
   ═══════════════════════════════════════════════════ */

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<string | null>(null);
    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    }, []);

    return (
        <InventoryProvider showToast={showToast}>
            <OrderProvider showToast={showToast}>
                <JobProvider showToast={showToast}>
                    <MessageProviderWrapper showToast={showToast}>
                        <AppInnerProvider showToast={showToast} toast={toast}>
                            {children}
                        </AppInnerProvider>
                    </MessageProviderWrapper>
                </JobProvider>
            </OrderProvider>
        </InventoryProvider>
    );
};

/**
 * MessageProvider needs currentUser.role from AuthContext,
 * so we wrap it to read auth context inside the provider tree.
 */
const MessageProviderWrapper: React.FC<{ children: ReactNode; showToast: (msg: string) => void }> = ({ children, showToast }) => {
    const { currentUser } = useAuth();
    return (
        <MessageProvider showToast={showToast} currentUserRole={currentUser.role}>
            {children}
        </MessageProvider>
    );
};
