import { createContext } from 'react';
import type {
    AuthRole,
    ShopTheme, ShopUser, Vehicle, ServiceItem, OrderState, JobClockState,
    ClientInvite, Message, ServiceStatus, ServicePhoto, PaymentRecord, AppNotification,
    ServiceHistoryRecord, Referral, InventoryItem, Job, Part, VinData, StaffInvite
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
    approveServices: () => Promise<void>;
    jobs: Job[];
    addJob: (job: Omit<Job, 'id' | 'timeLogs' | 'totalTime'>) => Promise<void>;
    updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
    deleteJob: (id: string) => Promise<void>;
    jobClock: JobClockState;
    activeJobId: string | null;
    clockIn: (jobId: string) => void;
    clockOut: () => void;
    setTipPercent: (percent: number | null) => void;
    completePayment: (method?: string) => Promise<void>;
    startStripeCheckout: () => Promise<void>;
    resetOrder: () => void;
    isProcessing: boolean;
    clientInvite: ClientInvite;
    updateClientInvite: (field: keyof ClientInvite, value: string | boolean) => void;
    sendInvite: (method: 'sms' | 'email', overrides?: { name?: string; phone?: string; email?: string; ticketId?: string; vehicle?: string; shopId?: string; shopName?: string }) => void;
    resetClientInvite: () => void;
    staffInvite: StaffInvite;
    updateStaffInvite: (field: keyof StaffInvite, value: string | boolean) => void;
    sendStaffInvite: () => void;
    resetStaffInvite: () => void;
    messages: Message[];
    sendMessage: (text: string) => Promise<void>;
    shopTyping: boolean;
    inventory: InventoryItem[];
    updateInventoryStock: (id: string, change: number) => Promise<void>;
    addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
    users: ShopUser[];
    currentUser: ShopUser;
    switchUser: (id: string) => void;
    updateCurrentUser: (fields: Partial<ShopUser>) => Promise<void>;
    serviceStatus: ServiceStatus;
    setServiceStatus: (status: ServiceStatus) => void;
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
    toast: string | null;
    showToast: (message: string) => void;
    shopTheme: ShopTheme;
    setShopTheme: (theme: Partial<ShopTheme>) => void;
    decodeVin: (vin: string) => Promise<VinData>;
    updateUserRole: (userId: string, role: AuthRole) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
