import { supabase } from '../lib/supabase';
import type { Job, ServiceStatus } from '../context/AppTypes';

export const jobService = {
    async getJobsByShop(shopId: string): Promise<Job[]> {
        const { data, error } = await supabase
            .from('jobs')
            .select('*, time_logs(*)')
            .eq('shop_id', shopId);

        if (error) throw error;
        return data as Job[];
    },

    async updateJobStatus(jobId: string, status: ServiceStatus): Promise<void> {
        const { error } = await supabase
            .from('jobs')
            .update({ status })
            .eq('id', jobId);

        if (error) throw error;
    },

    async addJob(job: Omit<Job, 'id'>): Promise<Job> {
        const { data, error } = await supabase
            .from('jobs')
            .insert([job])
            .select()
            .single();

        if (error) throw error;
        return data as Job;
    },

    subscribeToJobs(shopId: string, callback: (payload: { new: Job }) => void) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (supabase
            .channel('public:jobs') as any)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'jobs',
                filter: `shop_id=eq.${shopId}`
            }, callback)
            .subscribe();
    }
};
