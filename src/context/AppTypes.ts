export type AuthRole = 'OWNER' | 'STAFF' | 'CLIENT';
export interface ShopTheme {
    shopId: string;
    shopName: string;
    primary: string;
    accent: string;
    background: string;
    card: string;
    logoUrl: string;
}
export type ServiceStatus = 'waiting' | 'in_progress' | 'ready' | 'done' | 'waiting_parts';
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
    phone?: string;
    shopName?: string;
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
    total: number;
    paid: boolean;
    orderNumber: string;
    paymentMethod: string;
    paidDate: string;
}

export interface JobClockState {
    clockedIn: boolean;
    startTime: number | null;
    elapsed: string;
}

export interface ClientInvite {
    name: string;
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
    text: string;
    sender: 'client' | 'shop';
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
    };
    progress: number;
    vehicleImage?: string;
    notes?: string;
}

export const SHOP_AUTO_REPLIES = [
    'Got it! Marcus is looking into that right now.',
    'Great question — we\'ll have an update for you shortly.',
    'Your vehicle should be ready by 4 PM today. We\'ll send a notification when it\'s done!',
    'We just uploaded new diagnostic photos to your Health Report. Take a look!',
    'Absolutely — we use OEM-spec parts for all Porsche services.',
    'Thanks for your patience! We\'re making sure everything is perfect.',
    'We found a small issue during inspection. Check the Health Report for details.',
    'Roger that! We\'ll add that to the service list.',
    'Roger that! One of our techs will be with you shortly.',
];

export const DEFAULT_USERS: ShopUser[] = [
    { id: 'u1', name: 'Sarah Chen', email: 'sarah@porschespecialists.com', role: 'STAFF', shopId: 'SHOP-01', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: 'u2', name: 'Marcus Sterling', email: 'marcus@porschespecialists.com', role: 'OWNER', shopId: 'SHOP-01', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
    { id: 'u3', name: 'Dave Miller', email: 'dave@porschespecialists.com', role: 'STAFF', shopId: 'SHOP-01', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave' },
    { id: 'u4', name: 'Alex Rivera', email: 'alex@icloud.com', role: 'CLIENT', shopId: 'SHOP-01', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
];

export const DEFAULT_JOBS: Job[] = [
    {
        id: 'j1',
        vehicle: '2022 Porsche 911 GT3',
        client: 'Alex Rivera',
        clientId: 'u4',
        shopId: 'SHOP-01',
        service: 'Brake Service & Alignment',
        status: 'in_progress',
        priority: 'high',
        bay: 'Bay 04',
        staffId: 'u3',
        timeLogs: [{ id: 't1', staffId: 'u3', staffName: 'Dave Miller', startTime: Date.now() - 3600000, duration: 3600000 }],
        totalTime: 3600000,
        services: [{ name: 'GT3 Brake Pads', price: 850 }, { name: 'Alignment', price: 250 }],
        financials: { subtotal: 1100, tax: 88, total: 1188 },
        progress: 65,
        vehicleImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80',
        notes: 'Client requested racing-spec fluid.'
    },
    {
        id: 'j2',
        vehicle: '2021 BMW M3',
        client: 'Jordan Lee',
        clientId: 'u5',
        shopId: 'SHOP-01',
        service: 'Maintenance Standard 02',
        status: 'waiting',
        priority: 'medium',
        bay: 'Bay 02',
        staffId: 'u3',
        timeLogs: [],
        totalTime: 0,
        services: [{ name: 'Synthetic Oil Change', price: 180 }, { name: 'Microfilter', price: 65 }],
        financials: { subtotal: 245, tax: 19.6, total: 264.6 },
        progress: 0,
        vehicleImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop',
    },
    {
        id: 'j3',
        vehicle: '2023 Tesla Model Y',
        client: 'Morgan Chen',
        clientId: 'u6',
        shopId: 'SHOP-02',
        service: 'Tire Rotation & Sensor Calibration',
        status: 'ready',
        priority: 'low',
        bay: 'Bay 01',
        staffId: 'u2',
        timeLogs: [],
        totalTime: 0,
        services: [{ name: 'Tire Rotation', price: 80 }],
        financials: { subtotal: 80, tax: 6.4, total: 86.4 },
        progress: 100,
        vehicleImage: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80',
    }
];
