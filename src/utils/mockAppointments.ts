import { MOCK_TICKETS } from './mockTickets';
import type { Ticket } from './mockTickets';

/* ═══════════════════════════════════════════════════
   Appointment Data Model
   ═══════════════════════════════════════════════════ */

export interface AppointmentVehicle {
    year: string;
    make: string;
    model: string;
    vin?: string;
}

export interface Appointment {
    appointmentId: string;
    shopId: string;
    customerName: string;
    phone: string;
    vehicle: AppointmentVehicle;
    date: string;        // "2026-02-25"
    time: string;        // "10:00 AM"
    serviceType: string;
    notes: string;
    status: 'scheduled' | 'checked_in';
    linkedTicketId?: string;
}

/* ═══════════════════════════════════════════════════
   Seed Data — today's appointments
   ═══════════════════════════════════════════════════ */

const today = new Date().toISOString().split('T')[0];

export const appointments: Appointment[] = [
    {
        appointmentId: 'APT-1001',
        shopId: 'SHOP-01',
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

/* ═══════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════ */

let aptCounter = 1004;
let tckCounter = 1048; // Updated to start after existing seed tickets (TCK-1047)

export function addAppointment(data: Omit<Appointment, 'appointmentId' | 'status' | 'linkedTicketId'>): Appointment {
    const apt: Appointment = {
        ...data,
        appointmentId: `APT-${aptCounter++}`,
        status: 'scheduled',
    };
    appointments.push(apt);
    return apt;
}

export function checkInAppointment(appointmentId: string): string | null {
    const apt = appointments.find(a => a.appointmentId === appointmentId);
    if (!apt || apt.status === 'checked_in') return null;

    const ticketId = `TCK-${tckCounter++}`;
    const vehicleStr = `${apt.vehicle.year} ${apt.vehicle.make} ${apt.vehicle.model}${apt.vehicle.vin ? ` [${apt.vehicle.vin}]` : ''}`;

    // Use activeShopId from localStorage for the new ticket
    const shopId = localStorage.getItem('activeShopId') || 'SHOP-01';

    // Create a new ticket linked to this appointment
    const newTicket: Ticket = {
        id: ticketId,
        clientId: 'CLIENT-001', // MVP Placeholder
        shopId: shopId,
        customerName: apt.customerName,
        vehicle: vehicleStr,
        stageIndex: 0,  // Checked In
        issue: apt.serviceType + (apt.notes ? ` — ${apt.notes}` : ''),
        createdAt: new Date().toISOString(),
    };

    MOCK_TICKETS.push(newTicket);

    apt.status = 'checked_in';
    apt.linkedTicketId = ticketId;

    return ticketId;
}
