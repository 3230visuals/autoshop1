import React, { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
    Vehicle, ServicePhoto, PaymentRecord, AppNotification,
    ServiceHistoryRecord, Referral, VinData, StaffInvite
} from './AppTypes';
import { vinService } from '../services/vinService';

import { AppContext } from './AppContextCore';
import { AuthProvider, useAuth } from './AuthContext';
import { JobProvider, useJobs } from './JobContext';
import { OrderProvider, useOrder } from './OrderContext';
import { InventoryProvider, useInventory } from './InventoryContext';
import { MessageProvider, useMessages } from './MessageContext';
import { useTheme } from './ThemeContext';

/* ═══════════════════════════════════════════════════
   Thin inner provider — merges all contexts for
   backward compatibility with useAppContext()
   ═══════════════════════════════════════════════════ */

const AppInnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuth();
    const jobCtx = useJobs();
    const orderCtx = useOrder();
    const inventoryCtx = useInventory();
    const messageCtx = useMessages();
    const themeCtx = useTheme();

    // ── Toast ─────────────────────────
    // (shared via showToast prop to sub-providers, but also exposed on context)
    // The toast state lives here since it's cross-cutting
    // Sub-providers receive it via their showToast prop

    // ── Vehicle ───────────────────────
    const [vehicle] = useState<Vehicle>({
        id: 'v1', year: 2022, make: 'Porsche', model: '911 GT3',
        licensePlate: 'FAST-GT3', vin: 'WP0AC2A8XNS25400', tag: 'PORSCHE',
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80',
        healthScore: 98, status: 'in_progress',
    });

    // ── Additional State ─────────────
    const [servicePhotos, setServicePhotos] = useState<ServicePhoto[]>([]);
    const [paymentHistory] = useState<PaymentRecord[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loyaltyPoints] = useState(1250);
    const [referralCode] = useState('GT3-FAST');
    const [referrals] = useState<Referral[]>([]);
    const [serviceHistory] = useState<ServiceHistoryRecord[]>([]);

    const markAllRead = useCallback(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);
    const removeServicePhoto = useCallback((id: string) => setServicePhotos(prev => prev.filter(p => p.id !== id)), []);
    const addServicePhoto = useCallback((photo: Omit<ServicePhoto, 'id' | 'timestamp'>) => {
        setServicePhotos(prev => [...prev, { ...photo, id: `p${Date.now()}`, timestamp: Date.now() } as ServicePhoto]);
    }, []);
    const redeemReward = useCallback((cost: number) => jobCtx.showToast(`Redeemed ${cost} points`), [jobCtx]);

    // ── Client Invite ─────────────────
    const [clientInvite, setClientInvite] = useState({
        name: '', phone: '', year: '', make: '', model: '', vinPlate: '', image: '', sent: false
    });

    const [staffInvite, setStaffInvite] = useState<StaffInvite>({
        name: '', email: '', role: 'STAFF', sent: false
    });

    const updateClientInvite = useCallback((field: string, value: string | boolean) => {
        setClientInvite(prev => ({ ...prev, [field]: value }));
    }, []);

    const sendInvite = useCallback((method: 'sms' | 'email') => {
        const baseUrl = window.location.origin;
        const inviteUrl = `${baseUrl}/welcome?invite=true&name=${encodeURIComponent(clientInvite.name)}&vehicle=${encodeURIComponent(`${clientInvite.year} ${clientInvite.make} ${clientInvite.model}`)}`;
        const message = `Hi ${clientInvite.name}, welcome to Stitch! Follow this link to see your ${clientInvite.make}'s digital garage: ${inviteUrl}`;

        setClientInvite(prev => ({ ...prev, sent: true }));

        if (method === 'sms') {
            window.open(`sms:${clientInvite.phone}?body=${encodeURIComponent(message)}`, '_blank');
        } else {
            window.open(`mailto:?subject=Welcome to Stitch Auto Shop&body=${encodeURIComponent(message)}`, '_blank');
        }

        jobCtx.showToast(`Invite link built and sent via ${method.toUpperCase()}`);
    }, [clientInvite, jobCtx]);

    const resetClientInvite = useCallback(() => {
        setClientInvite({ name: '', phone: '', year: '', make: '', model: '', vinPlate: '', image: '', sent: false });
    }, []);

    const updateStaffInvite = useCallback((field: keyof StaffInvite, value: string | boolean) => {
        setStaffInvite((prev) => ({ ...prev, [field]: value }));
    }, []);

    const sendStaffInvite = useCallback(() => {
        setStaffInvite((prev) => ({ ...prev, sent: true }));
        jobCtx.showToast(`Staff invite sent to ${staffInvite.email} as ${staffInvite.role}`);
    }, [staffInvite, jobCtx]);

    const resetStaffInvite = useCallback(() => {
        setStaffInvite({ name: '', email: '', role: 'STAFF', sent: false });
    }, []);

    const decodeVin = useCallback(async (vin: string): Promise<VinData> => {
        return vinService.decodeVin(vin);
    }, []);

    // Merge all contexts into a single backward-compatible value
    const value = useMemo(() => ({
        // Toast (from job context for now — cross-cutting)
        toast: null as string | null,
        showToast: jobCtx.showToast,
        // Vehicle
        vehicle,
        // Auth
        currentUser: auth.currentUser,
        users: auth.users,
        switchUser: auth.switchUser,
        updateCurrentUser: auth.updateCurrentUser,
        shopTheme: themeCtx.theme,
        setShopTheme: themeCtx.updateTheme,
        // Order
        serviceItems: orderCtx.serviceItems,
        addServiceItem: orderCtx.addServiceItem,
        updateServiceItem: orderCtx.updateServiceItem,
        deleteServiceItem: orderCtx.deleteServiceItem,
        selectedServiceIds: orderCtx.selectedServiceIds,
        toggleService: orderCtx.toggleService,
        order: orderCtx.order,
        approveServices: orderCtx.approveServices,
        setTipPercent: orderCtx.setTipPercent,
        completePayment: orderCtx.completePayment,
        resetOrder: orderCtx.resetOrder,
        // Jobs
        jobs: jobCtx.jobs,
        addJob: jobCtx.addJob,
        updateJob: jobCtx.updateJob,
        deleteJob: jobCtx.deleteJob,
        jobClock: jobCtx.jobClock,
        activeJobId: jobCtx.activeJobId,
        clockIn: jobCtx.clockIn,
        clockOut: jobCtx.clockOut,
        serviceStatus: jobCtx.serviceStatus,
        setServiceStatus: jobCtx.setServiceStatus,
        // Inventory
        inventory: inventoryCtx.inventory,
        updateInventoryStock: inventoryCtx.updateInventoryStock,
        addInventoryItem: inventoryCtx.addInventoryItem,
        searchParts: inventoryCtx.searchParts,
        // Messages
        messages: messageCtx.messages,
        sendMessage: messageCtx.sendMessage,
        shopTyping: messageCtx.shopTyping,
        // Misc
        servicePhotos, addServicePhoto, removeServicePhoto,
        paymentHistory, notifications, markAllRead,
        serviceHistory, loyaltyPoints, redeemReward,
        referralCode, referrals,
        clientInvite, updateClientInvite, sendInvite, resetClientInvite,
        staffInvite, updateStaffInvite, sendStaffInvite, resetStaffInvite,
        decodeVin,
    }), [
        auth, jobCtx, orderCtx, inventoryCtx, messageCtx,
        vehicle, servicePhotos, addServicePhoto, removeServicePhoto,
        paymentHistory, notifications, markAllRead, serviceHistory,
        loyaltyPoints, redeemReward, referralCode, referrals,
        clientInvite, updateClientInvite, sendInvite, resetClientInvite,
        staffInvite, updateStaffInvite, sendStaffInvite, resetStaffInvite,
        decodeVin, themeCtx
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/* ═══════════════════════════════════════════════════
   Root AppProvider — composes sub-providers
   ═══════════════════════════════════════════════════ */

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Shared toast function — lifted here and passed to each sub-provider
    const [, setToast] = useState<string | null>(null);
    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    }, []);

    return (
        <AuthProvider>
            <JobProvider showToast={showToast}>
                <OrderProvider showToast={showToast}>
                    <InventoryProvider showToast={showToast}>
                        <MessageProviderWrapper showToast={showToast}>
                            <AppInnerProvider>{children}</AppInnerProvider>
                        </MessageProviderWrapper>
                    </InventoryProvider>
                </OrderProvider>
            </JobProvider>
        </AuthProvider>
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
