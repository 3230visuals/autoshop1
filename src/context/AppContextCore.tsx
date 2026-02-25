import { createContext } from 'react';
import type {
    ShopTheme, ShopUser, Vehicle, ServiceItem, OrderState, JobClockState,
    ClientInvite, Message, ServiceStatus, ServicePhoto, PaymentRecord, AppNotification,
    ServiceHistoryRecord, Referral, InventoryItem, Job, Part, VinData, StaffInvite
} from './AppTypes';

export interface AppContextType {
    vehicle: Vehicle;
    searchParts: (query: string) => Promise<Omit<Part, 'id' | 'status' | 'eta' | 'notes'>[]>;
    serviceItems: ServiceItem[];
    addServiceItem: (item: Omit<ServiceItem, 'id'>) => void;
    updateServiceItem: (id: string, updates: Partial<ServiceItem>) => void;
    deleteServiceItem: (id: string) => void;
    selectedServiceIds: Set<string>;
    toggleService: (id: string) => void;
    order: OrderState;
    approveServices: () => void;
    jobs: Job[];
    addJob: (job: Omit<Job, 'id' | 'timeLogs' | 'totalTime'>) => void;
    updateJob: (id: string, updates: Partial<Job>) => void;
    deleteJob: (id: string) => void;
    jobClock: JobClockState;
    activeJobId: string | null;
    clockIn: (jobId: string) => void;
    clockOut: () => void;
    setTipPercent: (percent: number | null) => void;
    completePayment: (method?: string) => Promise<void>;
    resetOrder: () => void;
    clientInvite: ClientInvite;
    updateClientInvite: (field: keyof ClientInvite, value: string | boolean) => void;
    sendInvite: (method: 'sms' | 'email') => void;
    resetClientInvite: () => void;
    staffInvite: StaffInvite;
    updateStaffInvite: (field: keyof StaffInvite, value: string | boolean) => void;
    sendStaffInvite: () => void;
    resetStaffInvite: () => void;
    messages: Message[];
    sendMessage: (text: string) => Promise<void>;
    shopTyping: boolean;
    inventory: InventoryItem[];
    updateInventoryStock: (id: string, change: number) => void;
    addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
    users: ShopUser[];
    currentUser: ShopUser;
    switchUser: (id: string) => void;
    updateCurrentUser: (fields: Partial<ShopUser>) => void;
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
    setShopTheme: (theme: ShopTheme) => void;
    decodeVin: (vin: string) => Promise<VinData>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
