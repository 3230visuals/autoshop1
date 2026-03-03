import React, { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
    Vehicle, ServicePhoto, PaymentRecord, AppNotification,
    ServiceHistoryRecord, Referral, VinData, StaffInvite, ClientInvite,
    ServiceStatus
} from './AppTypes';
import { vinService } from '../services/vinService';

import { AppContext } from './AppContextCore';
import type { AppContextType } from './AppContextCore';
import { AuthProvider, useAuth } from './AuthContext';
import { JobProvider } from './JobContext';
import { useJobs } from './useJobs';
import { OrderProvider, useOrder } from './OrderContext';
import { InventoryProvider, useInventory } from './InventoryContext';

import { MessageProvider, useMessages } from './MessageContext';
import { useTheme } from './ThemeContext';

/* ═══════════════════════════════════════════════════
   Thin inner provider — merges all contexts for
   backward compatibility with useAppContext()
   ═══════════════════════════════════════════════════ */

const AppInnerProvider: React.FC<{ children: ReactNode; showToast: (msg: string) => void; toast: string | null }> = ({ children, showToast, toast }) => {
    const [renderKey, setRenderKey] = useState(0);

    // Cross-tab Synchronization: Listen for storage changes
    React.useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            // Re-render if any of our keys change
            if (e.key?.startsWith('invoice:') ||
                e.key?.startsWith('messages:') ||
                ['staffAuth', 'clientAuth', 'activeShopId', 'tickets'].includes(e.key ?? '')) {
                setRenderKey(k => k + 1);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const auth = useAuth();
    const jobCtx = useJobs();
    const orderCtx = useOrder();
    const inventoryCtx = useInventory();
    const messageCtx = useMessages();
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
    const [clientInvite, setClientInvite] = useState<ClientInvite>({
        name: '', email: '', phone: '', year: '', make: '', model: '', vinPlate: '', image: '', sent: false, ticketId: undefined
    });

    const [staffInvite, setStaffInvite] = useState<StaffInvite>({
        name: '', email: '', role: 'STAFF', sent: false
    });

    const updateClientInvite = useCallback((field: string, value: string | boolean) => {
        setClientInvite(prev => ({ ...prev, [field]: value }));
    }, []);

    const sendInvite = useCallback((method: 'sms' | 'email', overrides?: { name?: string; phone?: string; email?: string; ticketId?: string; vehicle?: string; shopId?: string; shopName?: string; token?: string }) => {
        const baseUrl = window.location.origin;

        const finalName = overrides?.name ?? clientInvite.name;
        const finalPhone = overrides?.phone ?? clientInvite.phone;
        const finalEmail = overrides?.email ?? clientInvite.email;
        const finalVehicle = overrides?.vehicle ?? `${clientInvite.year} ${clientInvite.make} ${clientInvite.model}`.trim();
        const finalToken = overrides?.token;
        const finalTicketId = overrides?.ticketId ?? clientInvite.ticketId;

        // Build a secure URL — no PII in query params
        let inviteUrl: string;
        if (finalToken) {
            inviteUrl = `${baseUrl}/welcome?token=${finalToken}`;
        } else if (finalTicketId) {
            inviteUrl = `${baseUrl}/welcome?ticketId=${finalTicketId}`;
        } else {
            // Fallback: minimal URL (WelcomeScreen will show an error)
            inviteUrl = `${baseUrl}/welcome`;
        }

        const message = `Hi ${finalName}, welcome to Service Bay Software! Follow this link to see your ${finalVehicle}'s digital garage: ${inviteUrl}`;

        if (!overrides) setClientInvite(prev => ({ ...prev, sent: true }));

        if (method === 'sms') {
            if (!finalPhone) {
                jobCtx.showToast('Phone number missing for SMS invite');
                return;
            }
            window.open(`sms:${finalPhone}?body=${encodeURIComponent(message)}`, '_blank');
        } else {
            if (!finalEmail) {
                jobCtx.showToast('Email address missing for Email invite');
                return;
            }
            window.location.href = `mailto:${finalEmail}?subject=${encodeURIComponent('Welcome to Service Bay Software')}&body=${encodeURIComponent(message)}`;
        }

        jobCtx.showToast(`Invite link built and sent via ${method.toUpperCase()}`);
    }, [clientInvite, jobCtx]);

    const resetClientInvite = useCallback(() => {
        setClientInvite({ name: '', email: '', phone: '', year: '', make: '', model: '', vinPlate: '', image: '', sent: false, ticketId: undefined });
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

    const [serviceStatus, setServiceStatus] = useState<ServiceStatus>('Repair In Progress');

    // Merge all contexts into a single backward-compatible value
    const value = useMemo<AppContextType>(() => ({
        toast,
        showToast,
        renderKey,
        vehicle: { ...vehicle, status: serviceStatus },
        currentUser: auth.currentUser,
        users: auth.users,
        switchUser: auth.switchUser,
        updateCurrentUser: auth.updateCurrentUser,
        updateUserRole: auth.updateUserRole,
        // Jobs
        jobs: jobCtx.jobs,
        addJob: jobCtx.addJob,
        updateJob: jobCtx.updateJob,
        deleteJob: jobCtx.deleteJob,
        getJobByToken: jobCtx.getJobByToken,
        jobClock: jobCtx.jobClock,
        activeJobId: jobCtx.activeJobId,
        clockIn: jobCtx.clockIn,
        clockOut: jobCtx.clockOut,
        serviceStatus,
        setServiceStatus,
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
        // Messages
        messages: messageCtx.messages,
        sendMessage: messageCtx.sendMessage,
        shopTyping: messageCtx.shopTyping,
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
        clientInvite,
        updateClientInvite,
        sendInvite,
        resetClientInvite,
        staffInvite,
        updateStaffInvite,
        sendStaffInvite,
        resetStaffInvite,
        decodeVin,
        isLoading: jobCtx.isLoading,
    }), [
        auth, jobCtx, orderCtx, inventoryCtx, messageCtx,
        vehicle, servicePhotos, addServicePhoto, removeServicePhoto,
        paymentHistory, notifications, markAllRead, serviceHistory,
        loyaltyPoints, redeemReward, referralCode, referrals,
        clientInvite, updateClientInvite, sendInvite, resetClientInvite,
        staffInvite, updateStaffInvite, sendStaffInvite, resetStaffInvite,
        decodeVin, themeCtx, renderKey, serviceStatus, toast, showToast, auth.updateUserRole
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
        <AuthProvider>
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
