import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Job, ServiceStatus, JobClockState } from './AppTypes';
import { DEFAULT_JOBS } from './AppTypes';
import { jobService } from '../services/jobService';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../services/authService';
import { JobContext } from './useJobs';


/* ═══════════════════════════════════════════════════
   Job Provider — Job lifecycle, clock, and status
   ═══════════════════════════════════════════════════ */

export const JobProvider: React.FC<{ children: ReactNode; showToast: (msg: string) => void }> = ({ children, showToast }) => {
    const isRealMode = isSupabaseConfigured();
    const [jobs, setJobs] = useState<Job[]>(isRealMode ? [] : DEFAULT_JOBS);
    const [serviceStatus, setServiceStatus] = useState<ServiceStatus>('Repair In Progress');
    const [jobClock, setJobClock] = useState<JobClockState>({ clockedIn: false, startTime: null, elapsed: '0:00' });
    const [activeJobId, setActiveJobId] = useState<string | null>(null);

    // Initial Fetch
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                let shopId = 'SHOP-01';
                if (isRealMode) {
                    const { data: { user } } = await supabase.auth.getUser();
                    shopId = (user?.user_metadata?.shopId as string) ?? 'SHOP-01';
                }

                const data = await jobService.getJobsByShop(shopId);

                // Hydrate with local demo jobs if any
                if (!isRealMode) {
                    const localDemoJobs = JSON.parse(localStorage.getItem('demo_jobs') ?? '[]') as Job[];
                    setJobs([...data, ...localDemoJobs]);
                } else {
                    setJobs(data);
                }
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
            }
        };

        void fetchJobs();
    }, [isRealMode]);

    const addJob = useCallback(async (job: Partial<Job> & { isDraft?: boolean; publicToken?: string }) => {
        const payload = { ...job, timeLogs: [], totalTime: 0 };

        if (isRealMode) {
            try {
                const newJob = await jobService.addJob(payload);
                // Only add non-draft jobs to the visible list
                if (!newJob.isDraft) {
                    setJobs(prev => [newJob, ...prev]);
                }
                return true;
            } catch (err) {
                // Supabase failed — fall back to local mode so the button ALWAYS works
                console.warn('Supabase insert failed, saving locally:', err);
                const localJob: Job = { ...payload, id: job.id ?? `j${Date.now()}` } as Job;
                if (!localJob.isDraft) {
                    setJobs(prev => [localJob, ...prev]);
                }
                return true;
            }
        } else {
            const newJob: Job = { ...payload, id: job.id ?? `j${Date.now()}` } as Job;
            if (!newJob.isDraft) {
                setJobs(prev => [newJob, ...prev]);
            }
            return true;
        }
    }, [isRealMode]);

    const updateJob = useCallback(async (id: string, updates: Partial<Job>) => {
        // Optimistic update
        setJobs(prev => prev.map(job => job.id === id ? { ...job, ...updates } : job));

        // If a draft is being finalized, add it to the jobs list
        if (updates.isDraft === false) {
            setJobs(prev => {
                const exists = prev.some(j => j.id === id);
                if (!exists) {
                    // We need to add a placeholder — the realtime subscription will fill in details
                    return [{ id, ...updates } as Job, ...prev];
                }
                return prev;
            });
        }

        if (updates.status) {
            showToast(`Status: ${updates.status}`);
        }

        if (isRealMode) {
            try {
                await jobService.updateJob(id, updates);
            } catch (err) {

                console.error('Failed to sync job update:', err);
                showToast('Sync failed');
                return false;
            }
        }
        return true;
    }, [isRealMode, showToast]);

    const deleteJob = useCallback(async (id: string) => {
        if (isRealMode) {
            try {
                await jobService.deleteJob(id);
            } catch (err) {
                console.warn('Supabase delete failed, removing locally:', err);
            }
        }
        setJobs(prev => prev.filter(j => j.id !== id));
        showToast('Job archived');
        return true;
    }, [isRealMode, showToast]);

    const getJobByToken = useCallback(async (token: string): Promise<Job | null> => {
        return jobService.getJobByToken(token);
    }, []);


    const clockIn = useCallback((jobId: string) => {
        setActiveJobId(jobId);
        setJobClock({ clockedIn: true, startTime: Date.now(), elapsed: '0:01' });
        showToast('Technical session started');
    }, [showToast]);

    const clockOut = useCallback(() => {
        if (activeJobId && jobClock.startTime) {
            const sessionsTotal = Date.now() - jobClock.startTime;
            setJobs(prev => prev.map(j =>
                j.id === activeJobId ? { ...j, totalTime: j.totalTime + sessionsTotal } : j
            ));
        }
        setActiveJobId(null);
        setJobClock({ clockedIn: false, startTime: null, elapsed: '0:00' });
        showToast('Session recorded');
    }, [activeJobId, jobClock.startTime, showToast]);

    // Realtime subscription
    useEffect(() => {
        if (!isRealMode) return;

        // Use a default or the logged in shopId
        const shopId = 'SHOP-01';

        const unsubscribe = jobService.subscribeToJobs(shopId, (payload) => {
            const { eventType, new: newJob, old: oldJob } = payload;

            if (eventType === 'INSERT' && newJob && !newJob.isDraft) {
                setJobs(prev => {
                    if (prev.some(j => j.id === newJob.id)) return prev;
                    return [newJob, ...prev];
                });
            } else if (eventType === 'UPDATE' && newJob) {
                // If draft was finalized, add to list
                if (!newJob.isDraft) {
                    setJobs(prev => {
                        const exists = prev.some(j => j.id === newJob.id);
                        if (exists) {
                            return prev.map(j => j.id === newJob.id ? newJob : j);
                        }
                        return [newJob, ...prev];
                    });
                }
                if (newJob.id === activeJobId) {
                    setServiceStatus(newJob.status);
                }
            } else if (eventType === 'DELETE' && oldJob) {
                setJobs(prev => prev.filter(j => j.id !== oldJob.id));
            }
        });

        return unsubscribe;
    }, [isRealMode, activeJobId]);

    const value = useMemo(() => ({
        jobs, addJob, updateJob, deleteJob, getJobByToken,
        jobClock, activeJobId, clockIn, clockOut,
        serviceStatus, setServiceStatus, showToast,
    }), [
        jobs, addJob, updateJob, deleteJob, getJobByToken,
        jobClock, activeJobId, clockIn, clockOut,
        serviceStatus, showToast,
    ]);

    return <JobContext value={value}>{children}</JobContext>;
};
