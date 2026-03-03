export type AuthRole = 'OWNER' | 'STAFF' | 'CLIENT';
export interface ShopTheme {
    shopId: string;
    shopName: string;
    primary: string;
    accent: string;
    background: string;
    card: string;
    fontColor?: string;
    secondaryFontColor?: string;
    logoUrl: string;
    // Stripe Connect Fields
    stripeAccountId?: string;
    stripeOnboardingComplete?: boolean;
    platformFeePercent?: number;
    isTestMode?: boolean;
}

export type ServiceStatus =
    | 'Checked In'
    | 'Diagnosing'
    | 'Waiting Approval'
    | 'Repair In Progress'
    | 'Quality Check'
    | 'Ready for Pickup'
    | 'Completed';

export const SERVICE_STAGES: ServiceStatus[] = [
    'Checked In',
    'Diagnosing',
    'Waiting Approval',
    'Repair In Progress',
    'Quality Check',
    'Ready for Pickup',
    'Completed'
];
export type PartStatus = 'needed' | 'ordered' | 'arrived' | 'installed';

export interface Part {
    id: string;
    name: string;
    partNumber: string;
    vehicle: string;
    vendor: string;
    cost: number;
    status: PartStatus;
    eta: string;
    notes: string;
}

export interface VinData {
    year: string;
    make: string;
    model: string;
    trim?: string;
    image?: string;
    fallbackImage?: string;
    error?: string;
}

export interface ShopUser {
    id: string;
    name: string;
    email: string;
    role: AuthRole;
    shopId: string;
    avatar: string;
    shopName?: string;
    phone?: string;
    shopPhone?: string;
    shopAddress?: string;
    shopLogo?: string;
}

export interface Vehicle {
    id: string;
    year: number;
    make: string;
    model: string;
    licensePlate: string;
    vin: string;
    tag: string;
    image: string;
    healthScore: number;
    status: ServiceStatus;
}

export interface ServiceItem {
    id: string;
    name: string;
    price: number;
    severity: 'critical' | 'recommended';
    icon: string;
    iconColor: string;
    description: string;
}

export interface OrderState {
    approvedItems: ServiceItem[];
    subtotal: number;
    tax: number;
    tipPercent: number | null;
    tipAmount: number;
    platformFee: number;
    total: number;
    paid: boolean;
    orderNumber: string;
    paymentMethod: string;
    paidDate: string;
    isTestMode?: boolean;
}


export interface JobClockState {
    clockedIn: boolean;
    startTime: number | null;
    elapsed: string;
}

export interface ClientInvite {
    ticketId?: string;
    name: string;
    email: string;
    phone: string;
    year: string;
    make: string;
    model: string;
    vinPlate: string;
    image: string;
    sent: boolean;
}

export interface StaffInvite {
    name: string;
    email: string;
    role: AuthRole;
    sent: boolean;
}

export interface Message {
    id: string;
    jobId: string;
    text: string;
    sender: 'client' | 'shop';
    senderRole: 'CLIENT' | 'STAFF';
    timestamp: number;
}

export interface ServicePhoto {
    id: string;
    url: string;
    caption: string;
    serviceItemId: string | null;
    uploadedBy: string;
    timestamp: number;
}

export interface PaymentRecord {
    id: string;
    orderNumber: string;
    clientName: string;
    vehicle: string;
    items: { name: string; price: number }[];
    subtotal: number;
    tax: number;
    tipAmount: number;
    total: number;
    paymentMethod: string;
    paidAt: number;
}

export interface AppNotification {
    id: string;
    type: 'payment' | 'status' | 'message' | 'promo' | 'alert';
    title: string;
    body: string;
    timestamp: number;
    read: boolean;
}

export interface ServiceHistoryRecord {
    id: string;
    date: string;
    title: string;
    services: { name: string; price: number }[];
    total: number;
    mechanic: string;
    status: 'completed' | 'warranty';
    notes?: string;
}

export interface Referral {
    id: string;
    name: string;
    status: 'pending' | 'visited';
}

export interface InventoryItem {
    id: string;
    name: string;
    category: 'Tires' | 'Brakes' | 'Fluid' | 'Filter' | 'Parts' | 'Supplies';
    quantity: number;
    price: number;
    minStock: number;
    location: string;
}

export interface TimeLog {
    id: string;
    staffId: string;
    staffName: string;
    startTime: number;
    endTime?: number;
    duration: number;
}

export interface Job {
    id: string;
    vehicle: string;
    client: string;
    clientId: string;
    shopId: string;
    service: string;
    status: ServiceStatus;
    priority: 'high' | 'medium' | 'low';
    bay: string;
    staffId: string;
    timeLogs: TimeLog[];
    totalTime: number;
    services: { name: string; price: number }[];
    financials: {
        subtotal: number;
        tax: number;
        total: number;
        invoice?: {
            items: { name: string; price: number }[];
            laborHours: number;
            laborRate: number;
            taxRate: number;
            status: 'draft' | 'sent' | 'paid';
            createdAt: number;
        };
    };
    progress: number;
    stageIndex: number;
    vehicleImage?: string;
    notes?: string;
    createdAt?: string;
    isDraft?: boolean;
    publicToken?: string;
}
