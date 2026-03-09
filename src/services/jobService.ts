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
    // ✅ FIX 1: public_token is its OWN dedicated column, not stuffed in notes
    public_token?: string;
    client_email?: string;
    client_phone?: string;
}

// ✅ FIX 2: Accept both real UUIDs AND slug-style shop IDs like SHOP-01
const isValidShopId = (str: string): boolean => {
    if (!str || str.trim() === '') return false;
    // Accept standard UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(str)) return true;
    // Accept slug-style IDs: alphanumeric, hyphens, underscores, 2-64 chars
    const slugRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-_]{1,63}$/;
    return slugRegex.test(str);
};

const isUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};

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
    // ✅ FIX 1: isDraft uses the dedicated is_draft column, not notes hacking
    isDraft: data.is_draft === true,
    // ✅ FIX 1: publicToken comes from its own column
    publicToken: data.public_token ?? undefined,
    clientEmail: data.client_email,
    clientPhone: data.client_phone,
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
                createdAt: t.createdAt,
                clientEmail: t.email,
                clientPhone: t.phone
            }));
        }

        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('shop_id', shopId)
            // ✅ FIX 1: Filter drafts by the dedicated is_draft column
            .neq('is_draft', true)
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
        if (updates.clientEmail !== undefined) payload.client_email = updates.clientEmail;
        if (updates.clientPhone !== undefined) payload.client_phone = updates.clientPhone;

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
                shopId: job.shopId ?? '',
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

        const shopId = job.shopId ?? '';
        // ✅ FIX 2: Use isValidShopId instead of isUUID — accepts SHOP-01 slugs
        if (!isValidShopId(shopId)) {
            throw new Error(`Invalid shop identifier: ${shopId}. Please ensure you are logged in to a valid shop.`);
        }

        const insertPayload: Record<string, unknown> = {
            shop_id: shopId,
            client_name: job.client ?? 'Pending',
            vehicle_name: job.vehicle ?? 'Vehicle',
            vehicle_image: job.vehicleImage,
            status: job.status ?? 'Checked In',
            priority: job.priority ?? 'medium',
            bay: job.bay ?? 'TBD',
            progress: job.progress ?? 0,
            stage_index: job.stageIndex ?? 0,
            services: job.services ?? [],
            financials: job.financials ?? { subtotal: 0, tax: 0, total: 0 },
            notes: job.notes,
            is_draft: job.isDraft ?? false,
        };

        // ✅ FIX 1: Store publicToken in its own column
        if (job.publicToken) {
            insertPayload.public_token = job.publicToken;
        }

        if (job.staffId && isUUID(job.staffId)) {
            insertPayload.staff_id = job.staffId;
        }

        if (job.clientId && isUUID(job.clientId)) {
            insertPayload.client_id = job.clientId;
        }

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

    // ✅ FIX 1: getJobByToken now queries the dedicated public_token column
    // Works for both draft AND finalized tickets — token is NEVER overwritten
    async getJobByToken(token: string): Promise<Job | null> {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: token lookup not available');
            return null;
        }

        const result = await supabase
            .from('jobs')
            .select('*')
            .eq('public_token', token)
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

    // ✅ FIX 1: createDraftTicket stores token in public_token column + is_draft flag
    // ✅ FIX 2: Uses isValidShopId to accept slug IDs
    async createDraftTicket(shopId: string, clientId: string, token: string): Promise<{ id: string; token: string }> {
        if (!isValidShopId(shopId)) {
            throw new Error(`Invalid shop identifier: ${shopId}. Please ensure you are logged in to a valid shop.`);
        }

        const insertPayload: Partial<RawJobData> = {
            shop_id: shopId,
            client_name: 'Pending',
            vehicle_name: 'Pending',
            status: 'Checked In',
            priority: 'medium',
            bay: 'TBD',
            progress: 0,
            stage_index: 0,
            services: [] as { name: string; price: number }[],
            financials: { subtotal: 0, tax: 0, total: 0 },
            notes: 'Draft — awaiting staff finalization',
            // ✅ Token lives here permanently — finalizeDraft will NOT touch this column
            public_token: token,
            is_draft: true,
        };

        if (clientId && isUUID(clientId)) {
            insertPayload.client_id = clientId;
        }

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

    // ✅ FIX 1: finalizeDraft NEVER touches public_token — token survives finalization
    // ✅ FIX 3: Sets is_draft = false so the board and WelcomeScreen both update correctly
    async finalizeDraft(
        ticketId: string,
        clientName: string,
        clientId: string,
        vehicle: string,
        vehicleImage?: string,
        clientEmail?: string,
        clientPhone?: string,
    ): Promise<void> {
        const payload: Partial<RawJobData> = {
            client_name: clientName,
            vehicle_name: vehicle,
            vehicle_image: vehicleImage ?? undefined,
            notes: 'Initial Onboarding / Check-in',
            status: 'Checked In',
            // ✅ This is the critical flag — triggers WelcomeScreen to advance to 'ready'
            is_draft: false,
            // ✅ Optionally store contact info at finalization time
            client_email: clientEmail,
            client_phone: clientPhone,
            // ✅ NOTE: public_token is intentionally NOT set here — it stays as-is
        };

        if (clientId && isUUID(clientId)) {
            payload.client_id = clientId;
        }

        const { error } = await supabase
            .from('jobs')
            .update(payload)
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
