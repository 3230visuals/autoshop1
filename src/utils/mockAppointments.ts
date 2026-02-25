import { createTicket } from './mockTickets';

export interface AppointmentVehicle {
    year: string;
    make: string;
    model: string;
    vin?: string;
}

export interface Appointment {
    appointmentId: string;
    shopId: string;
    clientId: string;
    customerName: string;
    phone: string;
    vehicle: AppointmentVehicle;
    date: string;
    time: string;
    serviceType: string;
    notes: string;
    status: 'scheduled' | 'checked_in';
    linkedTicketId?: string;
}

const STORAGE_PREFIX = 'appointments:';
const today = new Date().toISOString().split('T')[0];

const SEED_APPOINTMENTS: Appointment[] = [
    {
        appointmentId: 'APT-1001',
        shopId: 'SHOP-01',
        clientId: 'u4',
        customerName: 'James Wilson',
        phone: '(555) 234-5678',
        vehicle: { year: '2022', make: 'Ford', model: 'F-150' },
        date: today,
        time: '9:00 AM',
        serviceType: 'Transmission Diagnostic',
        notes: 'Customer reports slipping in 3rd gear',
        status: 'scheduled',
    },
    {
        appointmentId: 'APT-1002',
        shopId: 'SHOP-01',
        clientId: 'u5',
        customerName: 'Linda Park',
        phone: '(555) 345-6789',
        vehicle: { year: '2023', make: 'Honda', model: 'Accord' },
        date: today,
        time: '11:00 AM',
        serviceType: 'Brake Inspection',
        notes: 'Squeaking when stopping',
        status: 'scheduled',
    },
    {
        appointmentId: 'APT-1003',
        shopId: 'SHOP-01',
        clientId: 'u6',
        customerName: 'Carlos Mendez',
        phone: '(555) 456-7890',
        vehicle: { year: '2021', make: 'Toyota', model: 'Tacoma', vin: '5TFCZ5AN1MX123456' },
        date: today,
        time: '2:00 PM',
        serviceType: 'Oil Change + Rotation',
        notes: '',
        status: 'scheduled',
    },
];

const readAppointments = (shopId: string): Appointment[] => {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${shopId}`);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw) as Appointment[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const writeAppointments = (shopId: string, appointments: Appointment[]) => {
    localStorage.setItem(`${STORAGE_PREFIX}${shopId}`, JSON.stringify(appointments));
};

const initializeStore = () => {
    const shopId = 'SHOP-01';
    if (!localStorage.getItem(`${STORAGE_PREFIX}${shopId}`)) {
        writeAppointments(shopId, SEED_APPOINTMENTS.filter((a) => a.shopId === shopId));
    }
};

initializeStore();

let aptCounter = Math.max(
    1004,
    ...Object.keys(localStorage)
        .filter((k) => k.startsWith(STORAGE_PREFIX))
        .flatMap((k) => readAppointments(k.replace(STORAGE_PREFIX, '')))
        .map((a) => Number.parseInt(a.appointmentId.replace('APT-', ''), 10) + 1)
        .filter(Number.isFinite)
);

const buildClientId = (phone: string) => {
    const normalized = phone.replace(/\D/g, '');
    return normalized ? `CLIENT-${normalized}` : `CLIENT-${Date.now()}`;
};

export const getAppointmentsByShop = (shopId: string): Appointment[] => readAppointments(shopId);

export const getClientAppointments = (shopId: string, clientId?: string | null, phone?: string | null): Appointment[] => {
    const normalizedPhone = (phone || '').replace(/\D/g, '');
    return getAppointmentsByShop(shopId).filter((apt) => {
        if (clientId && apt.clientId === clientId) return true;
        if (!normalizedPhone) return false;
        return apt.phone.replace(/\D/g, '') === normalizedPhone;
    });
};

export function addAppointment(data: Omit<Appointment, 'appointmentId' | 'status' | 'linkedTicketId' | 'clientId'>): Appointment {
    const next: Appointment = {
        ...data,
        clientId: buildClientId(data.phone),
        appointmentId: `APT-${aptCounter++}`,
        status: 'scheduled',
    };

    const appointments = getAppointmentsByShop(data.shopId);
    writeAppointments(data.shopId, [...appointments, next]);
    return next;
}

export function checkInAppointment(shopId: string, appointmentId: string): string | null {
    const appointments = getAppointmentsByShop(shopId);
    const apt = appointments.find((a) => a.appointmentId === appointmentId);
    if (!apt || apt.status === 'checked_in') return null;

    const vehicleStr = `${apt.vehicle.year} ${apt.vehicle.make} ${apt.vehicle.model}${apt.vehicle.vin ? ` [${apt.vehicle.vin}]` : ''}`;

    const newTicket = createTicket({
        clientId: apt.clientId,
        shopId,
        customerName: apt.customerName,
        vehicle: vehicleStr,
        stageIndex: 0,
        issue: apt.serviceType + (apt.notes ? ` — ${apt.notes}` : ''),
    });

    const next = appointments.map((item) =>
        item.appointmentId === appointmentId
            ? { ...item, status: 'checked_in' as const, linkedTicketId: newTicket.id }
            : item
    );

    writeAppointments(shopId, next);
    return newTicket.id;
}
