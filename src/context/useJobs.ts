import { use, createContext } from 'react';
import type { Job, ServiceStatus, JobClockState } from './AppTypes';

export interface JobContextType {
    jobs: Job[];
    isLoading: boolean;
    addJob: (job: Partial<Job> & { isDraft?: boolean; publicToken?: string }) => Promise<boolean>;
    updateJob: (id: string, updates: Partial<Job>) => Promise<boolean>;
    deleteJob: (id: string) => Promise<boolean>;
    getJobByToken: (token: string) => Promise<Job | null>;
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
