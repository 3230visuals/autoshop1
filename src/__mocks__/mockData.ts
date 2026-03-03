/**
 * Mock / demo data — used ONLY when Supabase is not configured.
 *
 * In production with a real Supabase backend, none of this data is used.
 * It exists solely so the app can run in "demo mode" without credentials.
 */
import type { ShopUser, Job } from '../context/AppTypes';

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
        status: 'Repair In Progress',
        priority: 'high',
        bay: 'Bay 04',
        staffId: 'u3',
        timeLogs: [{ id: 't1', staffId: 'u3', staffName: 'Dave Miller', startTime: Date.now() - 3600000, duration: 3600000 }],
        totalTime: 3600000,
        services: [{ name: 'GT3 Brake Pads', price: 850 }, { name: 'Alignment', price: 250 }],
        financials: { subtotal: 1100, tax: 88, total: 1188 },
        progress: 65,
        stageIndex: 3,
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
        status: 'Checked In',
        priority: 'medium',
        bay: 'Bay 02',
        staffId: 'u3',
        timeLogs: [],
        totalTime: 0,
        services: [{ name: 'Synthetic Oil Change', price: 180 }, { name: 'Microfilter', price: 65 }],
        financials: { subtotal: 245, tax: 19.6, total: 264.6 },
        progress: 0,
        stageIndex: 0,
        vehicleImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop',
    },
    {
        id: 'j3',
        vehicle: '2023 Tesla Model Y',
        client: 'Morgan Chen',
        clientId: 'u6',
        shopId: 'SHOP-02',
        service: 'Tire Rotation & Sensor Calibration',
        status: 'Ready for Pickup',
        priority: 'low',
        bay: 'Bay 01',
        staffId: 'u2',
        timeLogs: [],
        totalTime: 0,
        services: [{ name: 'Tire Rotation', price: 80 }],
        financials: { subtotal: 80, tax: 6.4, total: 86.4 },
        progress: 100,
        stageIndex: 5,
        vehicleImage: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80',
    }
];
