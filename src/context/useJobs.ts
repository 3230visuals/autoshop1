import { use, createContext } from 'react';
import type { Job, ServiceStatus, JobClockState } from './AppTypes';

export interface JobContextType {
    jobs: Job[];
    addJob: (job: Omit<Job, 'timeLogs' | 'totalTime' | 'createdAt'> & { id?: string }) => Promise<boolean>;
    updateJob: (id: string, updates: Partial<Job>) => Promise<boolean>;
    deleteJob: (id: string) => Promise<boolean>;
    jobClock: JobClockState;
    activeJobId: string | null;
    clockIn: (jobId: string) => void;
    clockOut: () => void;
    serviceStatus: ServiceStatus;
    setServiceStatus: (status: ServiceStatus) => void;
    showToast: (msg: string) => void;
}

export const JobContext = createContext<JobContextType | null>(null);

export const useJobs = (): JobContextType => {
    const ctx = use(JobContext);
    if (!ctx) throw new Error('useJobs must be used within JobProvider');
    return ctx;
};
