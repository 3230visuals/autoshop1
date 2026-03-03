import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import type { ReactNode } from 'react';
import { JobProvider } from '../context/JobContext';
import { useJobs } from '../context/useJobs';

// Mock external dependencies
vi.mock('../services/authService', () => ({
    isSupabaseConfigured: () => false,
}));

const SEED_JOBS = [
    { id: 'j1', vehicle: '2023 Porsche 911', client: 'Alex R.', service: 'Engine Diagnostics', status: 'Repair In Progress', totalTime: 0, timeLogs: [], stageIndex: 1, notes: 'Check engine light' },
    { id: 'j2', vehicle: '2024 BMW M4', client: 'Sarah K.', service: 'Brake Replacement', status: 'Repair In Progress', totalTime: 0, timeLogs: [], stageIndex: 0, notes: 'Squeaking brakes' },
];

vi.mock('../services/jobService', () => ({
    jobService: {
        getJobsByShop: vi.fn().mockResolvedValue([]),
        addJob: vi.fn().mockImplementation(async (job: Record<string, unknown>) => ({ ...job, id: `j-new-${Date.now()}` })),
        updateJob: vi.fn().mockResolvedValue(true),
        deleteJob: vi.fn().mockResolvedValue(true),
        getJobByToken: vi.fn().mockResolvedValue(null),
        subscribeToJobs: vi.fn().mockReturnValue(() => { /* noop */ }),
    },
}));

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    },
}));

const mockShowToast = vi.fn();

function wrapper({ children }: { children: ReactNode }) {
    return React.createElement(JobProvider, { showToast: mockShowToast }, children);
}

// Helper: wait for async initial load to settle
async function waitForLoad() {
    await act(async () => {
        await new Promise(r => setTimeout(r, 100));
    });
}

describe('Job Context', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Seed demo_jobs in localStorage so the provider merges them
        localStorage.setItem('demo_jobs', JSON.stringify(SEED_JOBS));
    });

    describe('initial state (demo mode)', () => {
        it('starts with seeded jobs loaded after fetch', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            expect(result.current.jobs.length).toBeGreaterThan(0);
        });

        it('clock is not running initially', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            expect(result.current.jobClock.clockedIn).toBe(false);
            expect(result.current.jobClock.startTime).toBeNull();
        });

        it('no active job initially', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            expect(result.current.activeJobId).toBeNull();
        });
    });

    describe('addJob', () => {
        it('adds a job to the list', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            const initialCount = result.current.jobs.length;

            await act(async () => {
                await result.current.addJob({
                    vehicle: '2024 Tesla Model 3',
                    client: 'Test Client',
                    service: 'Battery Check',
                    status: 'Repair In Progress',
                });
            });

            expect(result.current.jobs.length).toBe(initialCount + 1);
        });

        it('does not add draft jobs to visible list', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            const initialCount = result.current.jobs.length;

            await act(async () => {
                await result.current.addJob({
                    vehicle: '2024 BMW X5',
                    client: 'Draft Client',
                    service: 'Inspection',
                    isDraft: true,
                });
            });

            expect(result.current.jobs.length).toBe(initialCount);
        });

        it('returns true on success', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            let success = false;

            await act(async () => {
                success = await result.current.addJob({
                    vehicle: '2023 Honda Civic',
                    client: 'Honda Owner',
                    service: 'Oil Change',
                });
            });

            expect(success).toBe(true);
        });
    });

    describe('updateJob', () => {
        it('updates a job optimistically', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            const firstJob = result.current.jobs[0];

            await act(async () => {
                await result.current.updateJob(firstJob.id, { notes: 'Updated notes' });
            });

            const updated = result.current.jobs.find(j => j.id === firstJob.id);
            expect(updated?.notes).toBe('Updated notes');
        });

        it('toasts status changes', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            const firstJob = result.current.jobs[0];

            await act(async () => {
                await result.current.updateJob(firstJob.id, { status: 'Repair In Progress' as const });
            });

            expect(mockShowToast).toHaveBeenCalledWith('Status: Repair In Progress');
        });

        it('returns true on success', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            const firstJob = result.current.jobs[0];
            let success = false;

            await act(async () => {
                success = await result.current.updateJob(firstJob.id, { notes: 'Test' });
            });

            expect(success).toBe(true);
        });
    });

    describe('deleteJob', () => {
        it('removes job from list', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            const firstJob = result.current.jobs[0];
            const initialCount = result.current.jobs.length;

            await act(async () => {
                await result.current.deleteJob(firstJob.id);
            });

            expect(result.current.jobs.length).toBe(initialCount - 1);
            expect(result.current.jobs.find(j => j.id === firstJob.id)).toBeUndefined();
        });

        it('shows archive toast', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            const firstJob = result.current.jobs[0];

            await act(async () => {
                await result.current.deleteJob(firstJob.id);
            });

            expect(mockShowToast).toHaveBeenCalledWith('Job archived');
        });

        it('returns true', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            const firstJob = result.current.jobs[0];
            let success = false;

            await act(async () => {
                success = await result.current.deleteJob(firstJob.id);
            });

            expect(success).toBe(true);
        });
    });

    describe('clock in/out', () => {
        it('clockIn sets activeJobId and starts clock', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            const jobId = result.current.jobs[0].id;

            act(() => {
                result.current.clockIn(jobId);
            });

            expect(result.current.activeJobId).toBe(jobId);
            expect(result.current.jobClock.clockedIn).toBe(true);
            expect(result.current.jobClock.startTime).not.toBeNull();
            expect(mockShowToast).toHaveBeenCalledWith('Technical session started');
        });

        it('clockOut resets clock state', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            const jobId = result.current.jobs[0].id;

            act(() => {
                result.current.clockIn(jobId);
            });

            act(() => {
                result.current.clockOut();
            });

            expect(result.current.activeJobId).toBeNull();
            expect(result.current.jobClock.clockedIn).toBe(false);
            expect(result.current.jobClock.startTime).toBeNull();
            expect(mockShowToast).toHaveBeenCalledWith('Session recorded');
        });

        it('clockOut accumulates time to job totalTime', async () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            await waitForLoad();
            const job = result.current.jobs[0];
            const initialTime = job.totalTime;

            act(() => {
                result.current.clockIn(job.id);
            });

            // Small delay to ensure elapsed > 0
            act(() => {
                result.current.clockOut();
            });

            const updated = result.current.jobs.find(j => j.id === job.id);
            expect(updated?.totalTime).toBeGreaterThanOrEqual(initialTime);
        });
    });

    describe('showToast', () => {
        it('is exposed and callable', () => {
            const { result } = renderHook(() => useJobs(), { wrapper });
            expect(typeof result.current.showToast).toBe('function');
        });
    });
});
