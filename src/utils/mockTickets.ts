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

// Mutable so check-in flow can push new tickets
// eslint-disable-next-line prefer-const
export let MOCK_TICKETS: Ticket[] = [
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

export const getTicketById = (id: string) => MOCK_TICKETS.find(t => t.id === id) || MOCK_TICKETS[0];

/** Single source of truth — mutates the real ticket's stageIndex */
export function updateTicketStage(ticketId: string, newStageIndex: number): boolean {
    const ticket = MOCK_TICKETS.find(t => t.id === ticketId);
    if (!ticket) return false;
    ticket.stageIndex = Math.max(0, Math.min(newStageIndex, SERVICE_STAGES.length - 1));
    return true;
}
