export const SERVICE_STAGES = [
    'Checked In',
    'Diagnosing',
    'Waiting Approval',
    'Repair In Progress',
    'Quality Check',
    'Ready for Pickup',
    'Completed'
];

export interface Ticket {
    id: string;
    clientId: string;
    shopId: string;
    customerName: string;
    vehicle: string;
    stageIndex: number;
    issue: string;
    createdAt: string;
}

const STORAGE_PREFIX = 'tickets:';

const SEED_TICKETS: Ticket[] = [
    {
        id: 'TCK-1042',
        clientId: 'u4',
        shopId: 'SHOP-01',
        customerName: 'James Wilson',
        vehicle: '2022 Ford F-150',
        stageIndex: 1,
        issue: 'Transmission slipping in 3rd gear',
        createdAt: '2024-02-25T08:00:00Z'
    },
    {
        id: 'TCK-1043',
        clientId: 'u5',
        shopId: 'SHOP-01',
        customerName: 'Sarah Miller',
        vehicle: '2021 Toyota Camry',
        stageIndex: 3,
        issue: 'Brake pad replacement',
        createdAt: '2024-02-24T14:30:00Z'
    },
    {
        id: 'TCK-1044',
        clientId: 'u6',
        shopId: 'SHOP-02',
        customerName: 'Robert Garcia',
        vehicle: '2023 Tesla Model 3',
        stageIndex: 5,
        issue: 'Software update',
        createdAt: '2024-02-25T10:15:00Z'
    },
    {
        id: 'TCK-1045',
        clientId: 'u4',
        shopId: 'SHOP-01',
        customerName: 'Emily Chen',
        vehicle: '2020 Honda Civic',
        stageIndex: 2,
        issue: 'Oil leak under engine',
        createdAt: '2024-02-25T09:00:00Z'
    },
    {
        id: 'TCK-1046',
        clientId: 'u7',
        shopId: 'SHOP-01',
        customerName: 'Michael Brown',
        vehicle: '2019 RAM 1500',
        stageIndex: 4,
        issue: 'Suspension squeaking',
        createdAt: '2024-02-25T11:00:00Z'
    },
    {
        id: 'TCK-1047',
        clientId: 'u8',
        shopId: 'SHOP-02',
        customerName: 'Jessica Lee',
        vehicle: '2024 Porsche 911',
        stageIndex: 0,
        issue: 'First service check',
        createdAt: '2024-02-25T12:00:00Z'
    }
];

const byShop = (tickets: Ticket[]) => tickets.reduce<Record<string, Ticket[]>>((acc, ticket) => {
    acc[ticket.shopId] = acc[ticket.shopId] || [];
    acc[ticket.shopId].push(ticket);
    return acc;
}, {});

const readTickets = (shopId: string): Ticket[] => {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${shopId}`);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw) as Ticket[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const writeTickets = (shopId: string, tickets: Ticket[]) => {
    localStorage.setItem(`${STORAGE_PREFIX}${shopId}`, JSON.stringify(tickets));
};

const initializeStore = () => {
    const grouped = byShop(SEED_TICKETS);
    Object.entries(grouped).forEach(([shopId, tickets]) => {
        if (!localStorage.getItem(`${STORAGE_PREFIX}${shopId}`)) {
            writeTickets(shopId, tickets);
        }
    });
};

initializeStore();

const getAllTickets = () => {
    const knownShopIds = new Set<string>(['SHOP-01', 'SHOP-02']);
    Object.keys(localStorage)
        .filter((k) => k.startsWith(STORAGE_PREFIX))
        .forEach((k) => knownShopIds.add(k.replace(STORAGE_PREFIX, '')));

    return Array.from(knownShopIds).flatMap((shopId) => readTickets(shopId));
};

let tckCounter = Math.max(
    1048,
    ...getAllTickets().map((t) => Number.parseInt(t.id.replace('TCK-', ''), 10) + 1).filter(Number.isFinite)
);

export const getTicketsByShop = (shopId: string): Ticket[] => readTickets(shopId);

export const getTicketById = (id: string): Ticket => {
    const ticket = getAllTickets().find((t) => t.id.toLowerCase() === id.toLowerCase());
    return ticket || getAllTickets()[0] || SEED_TICKETS[0];
};

export const findTicket = (id: string): Ticket | undefined =>
    getAllTickets().find((t) => t.id.toLowerCase() === id.toLowerCase());

export function createTicket(data: Omit<Ticket, 'id' | 'createdAt'>): Ticket {
    const next: Ticket = {
        ...data,
        id: `TCK-${tckCounter++}`,
        createdAt: new Date().toISOString(),
    };
    const tickets = getTicketsByShop(data.shopId);
    writeTickets(data.shopId, [...tickets, next]);
    return next;
}

export function updateTicketStage(ticketId: string, newStageIndex: number): boolean {
    const ticket = findTicket(ticketId);
    if (!ticket) return false;

    const nextStage = Math.max(0, Math.min(newStageIndex, SERVICE_STAGES.length - 1));
    const tickets = getTicketsByShop(ticket.shopId).map((t) =>
        t.id === ticketId ? { ...t, stageIndex: nextStage } : t
    );
    writeTickets(ticket.shopId, tickets);
    return true;
}
