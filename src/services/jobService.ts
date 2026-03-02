import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from './authService';
import type { Job, ServiceStatus, TimeLog } from '../context/AppTypes';
import { SERVICE_STAGES } from '../context/AppTypes';

interface RawJobData {
    id: string;
    vehicle_name?: string;
    client_name?: string;
    client_id: string;
    shop_id: string;
    status: ServiceStatus;
    priority: 'high' | 'medium' | 'low';
    bay: string;
    staff_id: string;
    time_logs?: TimeLog[];
    total_time?: number;
    services?: { name: string; price: number }[];
    financials?: { subtotal: number; tax: number; total: number };
    progress?: number;
    stage_index?: number;
    vehicle_image?: string;
    notes?: string;
    created_at?: string;
}

const mapJob = (data: RawJobData): Job => ({
    id: data.id,
    vehicle: data.vehicle_name ?? 'Vehicle',
    client: data.client_name ?? 'Client',
    clientId: data.client_id,
    shopId: data.shop_id,
    service: data.notes ?? 'Service',
    status: data.status,
    priority: data.priority,
    bay: data.bay,
    staffId: data.staff_id,
    timeLogs: data.time_logs ?? [],
    totalTime: data.total_time ?? 0,
    services: data.services ?? [],
    financials: data.financials ?? { subtotal: 0, tax: 0, total: 0 },
    progress: data.progress ?? 0,
    stageIndex: data.stage_index ?? 0,
    vehicleImage: data.vehicle_image,
    notes: data.notes,
    createdAt: data.created_at,
});

export const jobService = {
    async getJobsByShop(shopId: string): Promise<Job[]> {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: fetching jobs from local store');
            const { getTicketsByShop } = await import('../utils/mockTickets');
            const tickets = getTicketsByShop(shopId);
            return tickets.map(t => ({
                id: t.id,
                vehicle: t.vehicle,
                client: t.customerName,
                clientId: t.clientId,
                shopId: t.shopId,
                service: t.issue ?? 'Service',
                status: (t.stageIndex >= 6 ? 'Completed' : 'In Progress') as ServiceStatus,
                priority: 'medium',
                bay: 'Bay 1',
                staffId: 'u3',
                timeLogs: [],
                totalTime: 0,
                services: [],
                financials: { subtotal: 0, tax: 0, total: 0 },
                progress: Math.round((t.stageIndex / (SERVICE_STAGES.length - 1)) * 100),
                stageIndex: t.stageIndex,
                vehicleImage: t.vehicleImage,
                notes: t.issue,
                createdAt: t.createdAt
            }));
        }

        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return ((data as RawJobData[]) ?? []).map(mapJob);
    },

    async updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: updating job in local store');
            const { updateTicketStage } = await import('../utils/mockTickets');
            if (updates.stageIndex !== undefined) {
                updateTicketStage(jobId, updates.stageIndex);
            }
            return;
        }

        const payload: Record<string, string | number | boolean | object | null | undefined> = {};
        if (updates.status !== undefined) payload.status = updates.status;
        /* ... existing logic ... */
        if (updates.stageIndex !== undefined) {
            payload.stage_index = updates.stageIndex;
            payload.progress = Math.round((updates.stageIndex / (SERVICE_STAGES.length - 1)) * 100);
        }
        if (updates.vehicleImage !== undefined) payload.vehicle_image = updates.vehicleImage;
        if (updates.notes !== undefined) payload.notes = updates.notes;
        if (updates.vehicle !== undefined) payload.vehicle_name = updates.vehicle;
        if (updates.client !== undefined) payload.client_name = updates.client;

        const { error } = await supabase
            .from('jobs')
            .update(payload)
            .eq('id', jobId);

        if (error) throw (error as Error);
    },

    async addJob(job: Omit<Job, 'timeLogs' | 'totalTime' | 'createdAt'> & { id?: string }): Promise<Job> {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: adding job to local store');
            const { createTicket } = await import('../utils/mockTickets');
            const ticket = createTicket({
                customerName: job.client,
                clientId: job.clientId,
                vehicle: job.vehicle,
                vehicleName: job.vehicle,
                shopId: job.shopId,
                status: job.status,
                issue: job.notes ?? '',
                stageIndex: job.stageIndex ?? 0
            } as unknown as Parameters<typeof createTicket>[0]);
            return {
                ...job,
                id: ticket.id,
                createdAt: ticket.createdAt
            } as Job;
        }

        const { data, error } = await supabase
            .from('jobs')
            .insert([{
                ...(job.id ? { id: job.id } : {}),
                shop_id: job.shopId,
                client_id: job.clientId,
                client_name: job.client,
                vehicle_name: job.vehicle,
                vehicle_image: job.vehicleImage,
                status: job.status,
                priority: job.priority,
                bay: job.bay,
                staff_id: job.staffId ?? 'u3',
                progress: job.progress ?? 0,
                stage_index: job.stageIndex ?? 0,
                services: job.services ?? [],
                financials: job.financials ?? { subtotal: 0, tax: 0, total: 0 },
                notes: job.notes,
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            throw new Error(error.message ?? 'Insert failed');
        }
        return mapJob(data as RawJobData);
    },


    async deleteJob(jobId: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: deleting job from local store');
            const { deleteTicket } = await import('../utils/mockTickets');
            deleteTicket(jobId);
            return;
        }

        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', jobId);

        if (error) throw (error as Error);
    },

    subscribeToJobs(shopId: string, callback: (payload: { eventType: string; new: Job | null; old: { id: string } | null }) => void) {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: subscription skipped');
            return { unsubscribe: () => { /* noop */ } } as ReturnType<typeof supabase.channel>;
        }
        return supabase
            .channel(`jobs:shop_id=eq.${shopId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs', filter: `shop_id=eq.${shopId}` }, (payload) => {
                const eventType = payload.eventType;
                const newRecord = payload.new as RawJobData | null;
                const oldRecord = payload.old as { id: string } | null;
                callback({
                    eventType,
                    new: newRecord ? mapJob(newRecord) : null,
                    old: oldRecord
                });
            })
            .subscribe();
    }
};
