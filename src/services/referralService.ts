import type { Referral } from '../context/AppTypes';

const STORAGE_KEY = 'referrals';
const CODES_KEY = 'referral_codes';
const REWARD_POINTS = 150; // Points earned per converted referral

// ── Helpers ──────────────────────────────────────

const readAll = (): Referral[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Referral[]) : [];
    } catch {
        return [];
    }
};

const writeAll = (referrals: Referral[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(referrals));
};

const readCodes = (): Record<string, string> => {
    try {
        const raw = localStorage.getItem(CODES_KEY);
        return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
        return {};
    }
};

const writeCodes = (codes: Record<string, string>) => {
    localStorage.setItem(CODES_KEY, JSON.stringify(codes));
};

const generateCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

// ── Service ──────────────────────────────────────

export const referralService = {
    /** Get or create a unique referral code for a client */
    getCodeForClient(clientId: string): string {
        const codes = readCodes();
        if (codes[clientId]) return codes[clientId];
        const code = generateCode();
        codes[clientId] = code;
        writeCodes(codes);
        return code;
    },

    /** Get all referrals made by a specific client */
    getReferralsByClient(clientId: string): Referral[] {
        return readAll().filter(r => r.referredBy === clientId);
    },

    /** Get all referrals for a shop (staff view) */
    getReferralsByShop(shopId: string): Referral[] {
        return readAll().filter(r => r.shopId === shopId);
    },

    /** Add a new referral */
    addReferral(data: Omit<Referral, 'id' | 'referredAt' | 'status'>): Referral {
        const referral: Referral = {
            ...data,
            id: `REF-${Date.now()}`,
            status: 'pending',
            referredAt: Date.now(),
        };
        const all = readAll();
        all.push(referral);
        writeAll(all);
        return referral;
    },

    /** Mark a referral as converted and assign reward points */
    markConverted(id: string): Referral | null {
        const all = readAll();
        const idx = all.findIndex(r => r.id === id);
        if (idx === -1) return null;
        all[idx] = {
            ...all[idx],
            status: 'converted',
            convertedAt: Date.now(),
            reward: REWARD_POINTS,
        };
        writeAll(all);
        return all[idx];
    },

    /** Mark a referral as visited */
    markVisited(id: string): Referral | null {
        const all = readAll();
        const idx = all.findIndex(r => r.id === id);
        if (idx === -1) return null;
        if (all[idx].status === 'converted') return all[idx]; // don't downgrade
        all[idx] = { ...all[idx], status: 'visited' };
        writeAll(all);
        return all[idx];
    },

    /** Calculate total reward points earned by a client from referrals */
    getTotalRewardPoints(clientId: string): number {
        return readAll()
            .filter(r => r.referredBy === clientId && r.status === 'converted')
            .reduce((sum, r) => sum + (r.reward ?? 0), 0);
    },

    /** Seed demo referrals for a client */
    seedDemoReferrals(clientId: string, shopId: string): void {
        const existing = readAll().filter(r => r.referredBy === clientId);
        if (existing.length > 0) return; // already seeded

        const demoReferrals: Omit<Referral, 'id' | 'referredAt' | 'status'>[] = [
            { name: 'Marcus Johnson', email: 'marcus.j@email.com', referredBy: clientId, shopId, reward: REWARD_POINTS },
            { name: 'Tina Rodriguez', phone: '555-0199', referredBy: clientId, shopId },
            { name: 'Derek Williams', email: 'derek.w@email.com', referredBy: clientId, shopId },
        ];

        const now = Date.now();
        const all = readAll();
        demoReferrals.forEach((data, i) => {
            const referral: Referral = {
                ...data,
                id: `REF-DEMO-${i}`,
                referredAt: now - (i + 1) * 86400000 * 3, // stagger by ~3 days
                status: i === 0 ? 'converted' : i === 1 ? 'visited' : 'pending',
                convertedAt: i === 0 ? now - 86400000 : undefined,
            };
            all.push(referral);
        });
        writeAll(all);
    },
};
