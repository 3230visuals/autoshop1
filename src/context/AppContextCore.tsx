import { createContext } from 'react';
import type {
    AuthRole,
    ShopTheme, ShopUser, Vehicle, ServiceItem, OrderState,
    ServicePhoto, PaymentRecord, AppNotification,
    ServiceHistoryRecord, Referral, InventoryItem, VinData, StaffInvite, Part
} from './AppTypes';

export interface AppContextType {
    vehicle: Vehicle;
    searchParts: (query: string) => Promise<Omit<Part, 'id' | 'status' | 'eta' | 'notes'>[]>;
    serviceItems: ServiceItem[];
    addServiceItem: (item: Omit<ServiceItem, 'id'>) => Promise<void>;
    updateServiceItem: (id: string, updates: Partial<ServiceItem>) => Promise<void>;
    deleteServiceItem: (id: string) => Promise<void>;
    selectedServiceIds: Set<string>;
    toggleService: (id: string) => void;
    order: OrderState;
    approveServices: () => void;
    setTipPercent: (percent: number | null) => void;
    completePayment: (method?: string) => Promise<void>;
    startStripeCheckout: () => Promise<void>;
    resetOrder: () => void;
    isProcessing: boolean;
    // Invite logic (Migrated to JobContext)
    staffInvite: StaffInvite;
    updateStaffInvite: (field: keyof StaffInvite, value: string | boolean) => void;
    sendStaffInvite: () => void;
    resetStaffInvite: () => void;
    // Messaging (Migrated to MessageContext)
    inventory: InventoryItem[];
    updateInventoryStock: (id: string, change: number) => Promise<void>;
    addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
    users: ShopUser[];
    currentUser: ShopUser;
    switchUser: (id: string) => void;
    updateCurrentUser: (fields: Partial<ShopUser>) => void;
    // Job Status (Migrated to JobContext)
    servicePhotos: ServicePhoto[];
    addServicePhoto: (photo: Omit<ServicePhoto, 'id' | 'timestamp'>) => void;
    removeServicePhoto: (id: string) => void;
    paymentHistory: PaymentRecord[];
    notifications: AppNotification[];
    markAllRead: () => void;
    serviceHistory: ServiceHistoryRecord[];
    loyaltyPoints: number;
    redeemReward: (cost: number) => void;
    referralCode: string;
    referrals: Referral[];
    addReferral: (data: { name: string; email?: string; phone?: string; shopId: string }) => Referral;
    markReferralConverted: (id: string) => void;
    refreshReferrals: () => void;
    referralRewardPoints: number;
    toast: string | null;
    showToast: (message: string) => void;
    shopTheme: ShopTheme;
    setShopTheme: (theme: Partial<ShopTheme>) => void;
    decodeVin: (vin: string) => Promise<VinData>;
    updateUserRole: (userId: string, role: AuthRole) => void;
    isLoading: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
