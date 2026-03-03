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
    financials?: {
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
    progress?: number;
    stage_index?: number;
    vehicle_image?: string;
    notes?: string;
    created_at?: string;
    is_draft?: boolean;
    public_token?: string;
}

const DRAFT_PREFIX = 'DRAFT_TOKEN:';

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
    isDraft: typeof data.notes === 'string' && data.notes.startsWith(DRAFT_PREFIX),
    publicToken: typeof data.notes === 'string' && data.notes.startsWith(DRAFT_PREFIX)
        ? data.notes.slice(DRAFT_PREFIX.length)
        : undefined,
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
        // Filter out drafts from the board listing (drafts have notes starting with DRAFT_TOKEN:)
        return ((data as RawJobData[]) ?? [])
            .filter(row => typeof row.notes !== 'string' || !row.notes.startsWith(DRAFT_PREFIX))
            .map(mapJob);
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
        if (updates.stageIndex !== undefined) {
            payload.stage_index = updates.stageIndex;
            payload.progress = Math.round((updates.stageIndex / (SERVICE_STAGES.length - 1)) * 100);
        }
        if (updates.vehicleImage !== undefined) payload.vehicle_image = updates.vehicleImage;
        if (updates.notes !== undefined) payload.notes = updates.notes;
        if (updates.vehicle !== undefined) payload.vehicle_name = updates.vehicle;
        if (updates.client !== undefined) payload.client_name = updates.client;
        if (updates.clientId !== undefined) payload.client_id = updates.clientId;
        if (updates.isDraft !== undefined) payload.is_draft = updates.isDraft;
        if (updates.bay !== undefined) payload.bay = updates.bay;
        if (updates.priority !== undefined) payload.priority = updates.priority;
        if (updates.services !== undefined) payload.services = updates.services;
        if (updates.financials !== undefined) payload.financials = updates.financials;

        const { error } = await supabase
            .from('jobs')
            .update(payload)
            .eq('id', jobId);

        if (error) throw (error as Error);
    },

    async addJob(job: Partial<Job> & { id?: string; isDraft?: boolean; publicToken?: string }): Promise<Job> {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: adding job to local store');
            const { createTicket } = await import('../utils/mockTickets');
            const ticket = createTicket({
                customerName: job.client ?? 'Client',
                clientId: job.clientId ?? 'unknown',
                vehicle: job.vehicle ?? 'Vehicle',
                vehicleName: job.vehicle ?? 'Vehicle',
                shopId: job.shopId ?? 'SHOP-01',
                status: job.status ?? 'Checked In',
                issue: job.notes ?? '',
                stageIndex: job.stageIndex ?? 0
            } as unknown as Parameters<typeof createTicket>[0]);
            return {
                ...job,
                id: ticket.id,
                createdAt: ticket.createdAt,
                timeLogs: [],
                totalTime: 0,
            } as Job;
        }

        const insertPayload: Record<string, unknown> = {
            shop_id: job.shopId ?? 'SHOP-01',
            client_id: job.clientId ?? 'unknown',
            client_name: job.client ?? 'Pending',
            vehicle_name: job.vehicle ?? 'Vehicle',
            vehicle_image: job.vehicleImage,
            status: job.status ?? 'Checked In',
            priority: job.priority ?? 'medium',
            bay: job.bay ?? 'TBD',
            staff_id: job.staffId ?? 'u3',
            progress: job.progress ?? 0,
            stage_index: job.stageIndex ?? 0,
            services: job.services ?? [],
            financials: job.financials ?? { subtotal: 0, tax: 0, total: 0 },
            notes: job.notes,
        };

        // Include explicit id if provided
        if (job.id) insertPayload.id = job.id;

        const result = await supabase
            .from('jobs')
            .insert([insertPayload])
            .select()
            .single();

        const data = result.data as RawJobData | null;
        const error = result.error;

        if (error) {
            console.error('Supabase insert error:', error);
            throw new Error(error.message ?? 'Insert failed');
        }
        return mapJob(data!);
    },

    async getJobByToken(token: string): Promise<Job | null> {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: token lookup not available');
            return null;
        }

        // Look up by notes field containing the token
        const result = await supabase
            .from('jobs')
            .select('*')
            .eq('notes', `${DRAFT_PREFIX}${token}`)
            .maybeSingle();

        const data = result.data as RawJobData | null;
        const error = result.error;

        if (error) {
            console.warn('Token lookup failed:', error.message);
            return null;
        }
        if (!data) return null;
        return mapJob(data);
    },

    async getJobById(jobId: string): Promise<Job | null> {
        if (!isSupabaseConfigured()) {
            return null;
        }

        const result = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        const data = result.data as RawJobData | null;
        const error = result.error;

        if (error) {
            console.warn('Job lookup failed:', error.message);
            return null;
        }
        return mapJob(data!);
    },

    async createDraftTicket(shopId: string, clientId: string, token: string): Promise<{ id: string; token: string }> {
        // Store the token in the notes field with a DRAFT_TOKEN: prefix
        const insertPayload = {
            shop_id: shopId,
            client_id: clientId,
            client_name: 'Pending',
            vehicle_name: 'Pending',
            status: 'Checked In',
            priority: 'medium',
            bay: 'TBD',
            staff_id: 'u3',
            progress: 0,
            stage_index: 0,
            services: [] as unknown[],
            financials: { subtotal: 0, tax: 0, total: 0 },
            notes: `${DRAFT_PREFIX}${token}`,
        };

        const result = await supabase
            .from('jobs')
            .insert([insertPayload])
            .select('id')
            .single();

        const data = result.data as { id: string } | null;
        const error = result.error;

        if (error) {
            console.error('Draft creation failed:', error);
            throw new Error(error.message ?? 'Draft creation failed');
        }
        return { id: data!.id, token };
    },

    async finalizeDraft(ticketId: string, clientName: string, clientId: string, vehicle: string, vehicleImage?: string): Promise<void> {
        const { error } = await supabase
            .from('jobs')
            .update({
                client_name: clientName,
                client_id: clientId,
                vehicle_name: vehicle,
                vehicle_image: vehicleImage ?? null,
                notes: 'Initial Onboarding / Check-in',
                status: 'Checked In',
            })
            .eq('id', ticketId);

        if (error) {
            console.error('Finalize draft failed:', error);
            throw new Error(error.message ?? 'Finalize failed');
        }
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

    subscribeToJobs(shopId: string, callback: (payload: { eventType: string; new: Job | null; old: Job | null }) => void) {
        const channel = supabase
            .channel(`jobs:${shopId}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'jobs', filter: `shop_id=eq.${shopId}` },
                (payload) => {
                    callback({
                        eventType: payload.eventType,
                        new: payload.new ? mapJob(payload.new as RawJobData) : null,
                        old: payload.old ? mapJob(payload.old as RawJobData) : null,
                    });
                }
            )
            .subscribe();

        return () => { void supabase.removeChannel(channel); };
    },

    subscribeToJob(jobId: string, callback: (job: Job) => void) {
        const channel = supabase
            .channel(`job:${jobId}`)
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${jobId}` },
                (payload) => {
                    if (payload.new) {
                        callback(mapJob(payload.new as RawJobData));
                    }
                }
            )
            .subscribe();

        return () => { void supabase.removeChannel(channel); };
    },
};
