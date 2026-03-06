import type { Job } from '../context/AppTypes';

export interface TimelineEntry {
    id: string;
    date: string;          // ISO date string
    timestamp: number;     // for sorting
    title: string;         // e.g. "Brake Pad Replacement"
    vehicle: string;
    services: { name: string; price: number }[];
    total: number;
    mechanic: string;
    status: 'completed' | 'warranty';
    notes?: string;
    vehicleImage?: string;
}

const STORAGE_KEY = 'service_history';

// ── Seed Data ────────────────────────────────────

const createSeedHistory = (clientId: string, shopId: string): TimelineEntry[] => [
    {
        id: `SH-${shopId}-${clientId}-1`,
        date: '2024-01-15T10:00:00Z',
        timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
        title: 'Full Synthetic Oil Change',
        vehicle: '2022 Ford F-150',
        services: [
            { name: 'Full Synthetic Oil Change', price: 79.99 },
            { name: 'Oil Filter Replacement', price: 15.00 },
            { name: 'Multi-Point Inspection', price: 0 },
        ],
        total: 94.99,
        mechanic: 'Mike Torres',
        status: 'completed',
        notes: 'Next oil change due at 75,000 miles or 6 months.',
    },
    {
        id: `SH-${shopId}-${clientId}-2`,
        date: '2023-11-08T14:30:00Z',
        timestamp: new Date('2023-11-08T14:30:00Z').getTime(),
        title: 'Brake Service — Front & Rear',
        vehicle: '2022 Ford F-150',
        services: [
            { name: 'Front Brake Pads', price: 189.99 },
            { name: 'Rear Brake Pads', price: 169.99 },
            { name: 'Brake Fluid Flush', price: 49.99 },
        ],
        total: 409.97,
        mechanic: 'Carlos Mendez',
        status: 'completed',
        notes: 'Rotors in good condition — re-surfaced.',
    },
    {
        id: `SH-${shopId}-${clientId}-3`,
        date: '2023-08-22T09:00:00Z',
        timestamp: new Date('2023-08-22T09:00:00Z').getTime(),
        title: 'A/C System Repair',
        vehicle: '2020 Honda Civic',
        services: [
            { name: 'A/C Compressor Replacement', price: 649.99 },
            { name: 'Refrigerant Recharge', price: 89.99 },
            { name: 'Labor (3 hrs)', price: 255.00 },
        ],
        total: 994.98,
        mechanic: 'Mike Torres',
        status: 'warranty',
        notes: '12-month parts warranty included on compressor.',
    },
    {
        id: `SH-${shopId}-${clientId}-4`,
        date: '2023-05-10T11:15:00Z',
        timestamp: new Date('2023-05-10T11:15:00Z').getTime(),
        title: 'Tire Rotation & Balance',
        vehicle: '2022 Ford F-150',
        services: [
            { name: 'Tire Rotation', price: 29.99 },
            { name: 'Wheel Balance (4 wheels)', price: 49.99 },
            { name: 'Tire Pressure Sensor Check', price: 0 },
        ],
        total: 79.98,
        mechanic: 'Carlos Mendez',
        status: 'completed',
    },
];

// ── Persistence ──────────────────────────────────

const readAll = (clientId: string): TimelineEntry[] => {
    try {
        const raw = localStorage.getItem(`${STORAGE_KEY}:${clientId}`);
        return raw ? (JSON.parse(raw) as TimelineEntry[]) : [];
    } catch {
        return [];
    }
};

const writeAll = (clientId: string, entries: TimelineEntry[]) => {
    localStorage.setItem(`${STORAGE_KEY}:${clientId}`, JSON.stringify(entries));
};

// ── Service ──────────────────────────────────────

export const serviceHistoryService = {
    /** Get full timeline for a client, combining seeded + completed jobs */
    getTimeline(clientId: string, shopId: string, jobs: Job[]): TimelineEntry[] {
        // Seed if needed
        let stored = readAll(clientId);
        if (stored.length === 0) {
            stored = createSeedHistory(clientId, shopId);
            writeAll(clientId, stored);
        }

        // Derive entries from completed jobs (stageIndex >= 6 = "Ready for Pickup" or "Completed")
        const jobEntries: TimelineEntry[] = jobs
            .filter(j => j.clientId === clientId && j.stageIndex >= 6)
            .map(j => ({
                id: `JOB-${j.id}`,
                date: j.createdAt ?? new Date().toISOString(),
                timestamp: j.createdAt ? new Date(j.createdAt).getTime() : Date.now(),
                title: j.service ?? j.notes ?? 'Vehicle Service',
                vehicle: j.vehicle,
                services: j.services ?? [],
                total: j.financials?.total ?? 0,
                mechanic: j.staffId ?? 'Shop Staff',
                status: 'completed' as const,
                notes: j.notes,
                vehicleImage: j.vehicleImage,
            }));

        // Merge & deduplicate
        const allIds = new Set(stored.map(e => e.id));
        for (const je of jobEntries) {
            if (!allIds.has(je.id)) {
                stored.push(je);
                allIds.add(je.id);
            }
        }

        // Sort newest first
        return stored.sort((a, b) => b.timestamp - a.timestamp);
    },

    /** Get summary stats */
    getStats(entries: TimelineEntry[]) {
        const totalSpent = entries.reduce((sum, e) => sum + e.total, 0);
        const vehicles = new Set(entries.map(e => e.vehicle));
        return {
            totalVisits: entries.length,
            totalSpent,
            vehicleCount: vehicles.size,
        };
    },
};
