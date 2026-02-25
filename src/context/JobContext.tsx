import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Job, ServiceStatus, JobClockState } from './AppTypes';
import { DEFAULT_JOBS } from './AppTypes';
import { jobService } from '../services/jobService';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../services/authService';

/* ═══════════════════════════════════════════════════
   Job Context — Job lifecycle, clock, and status
   ═══════════════════════════════════════════════════ */

interface JobContextType {
    jobs: Job[];
    addJob: (job: Omit<Job, 'id' | 'timeLogs' | 'totalTime'>) => void;
    updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
    deleteJob: (id: string) => void;
    jobClock: JobClockState;
    activeJobId: string | null;
    clockIn: (jobId: string) => void;
    clockOut: () => void;
    serviceStatus: ServiceStatus;
    setServiceStatus: (status: ServiceStatus) => void;
    showToast: (msg: string) => void;
}

const JobContext = createContext<JobContextType | null>(null);

export const JobProvider: React.FC<{ children: ReactNode; showToast: (msg: string) => void }> = ({ children, showToast }) => {
    const isRealMode = isSupabaseConfigured();
    const [jobs, setJobs] = useState<Job[]>(isRealMode ? [] : DEFAULT_JOBS);
    const [serviceStatus, setServiceStatus] = useState<ServiceStatus>('in_progress');
    const [jobClock, setJobClock] = useState<JobClockState>({ clockedIn: false, startTime: null, elapsed: '0:00' });
    const [activeJobId, setActiveJobId] = useState<string | null>(null);

    // Initial Fetch (Real Mode)
    useEffect(() => {
        if (!isRealMode) return;

        const fetchJobs = async () => {
            try {
                // In a real app, we'd pass the actual shop ID here. 
                // For now, we fetch all to ensure the queue isn't empty in demo-real-hybrid situations.
                const data = await jobService.getJobsByShop('DEFAULT_SHOP');
                if (data && data.length > 0) setJobs(data);
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
            }
        };

        fetchJobs();
    }, [isRealMode]);

    const addJob = useCallback((job: Omit<Job, 'id' | 'timeLogs' | 'totalTime'>) => {
        const newJob: Job = { ...job, id: `j${Date.now()}`, timeLogs: [], totalTime: 0 };
        setJobs(prev => [newJob, ...prev]);
        showToast('Job created');
    }, [showToast]);

    const updateJob = useCallback(async (id: string, updates: Partial<Job>) => {
        // Optimistic update
        setJobs(prev => prev.map(job => job.id === id ? { ...job, ...updates } : job));

        if (updates.status) {
            showToast(`Status: ${updates.status.replace('_', ' ')}`);
        }

        if (isRealMode) {
            try {
                if (updates.status) {
                    await jobService.updateJobStatus(id, updates.status);
                }
                // Other fields could be synced here
            } catch (err) {
                console.error('Failed to sync job update:', err);
                showToast('Sync failed');
            }
        }
    }, [isRealMode, showToast]);

    const deleteJob = useCallback((id: string) => {
        setJobs(prev => prev.filter(j => j.id !== id));
        showToast('Job archived');
    }, [showToast]);

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
    }, [activeJobId, jobClock, showToast]);

    // Realtime subscription for ALL job changes
    useEffect(() => {
        if (!isRealMode) return;

        const jobSubscription = supabase.channel('jobs_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, payload => {
                const { eventType, new: newRec, old: oldRec } = payload;

                if (eventType === 'INSERT') {
                    setJobs(prev => [newRec as Job, ...prev]);
                } else if (eventType === 'UPDATE') {
                    const updatedJob = newRec as Job;
                    setJobs(prev => prev.map(j => j.id === updatedJob.id ? { ...j, ...updatedJob } : j));
                    if (updatedJob.id === activeJobId) {
                        setServiceStatus(updatedJob.status as ServiceStatus);
                    }
                } else if (eventType === 'DELETE') {
                    setJobs(prev => prev.filter(j => j.id !== oldRec.id));
                }
            }).subscribe();

        return () => { supabase.removeChannel(jobSubscription); };
    }, [activeJobId, isRealMode]);

    const value = useMemo(() => ({
        jobs, addJob, updateJob, deleteJob, jobClock, activeJobId, clockIn, clockOut, serviceStatus, setServiceStatus, showToast
    }), [jobs, addJob, updateJob, deleteJob, jobClock, activeJobId, clockIn, clockOut, serviceStatus, showToast]);

    return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJobs = (): JobContextType => {
    const ctx = useContext(JobContext);
    if (!ctx) throw new Error('useJobs must be used within JobProvider');
    return ctx;
};
