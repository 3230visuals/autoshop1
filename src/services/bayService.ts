import type { Job } from '../context/AppTypes';

export interface BayStatus {
    id: string;
    label: string;
    isOccupied: boolean;
    currentJob?: Job;
    hasConflict: boolean;
}

export const bayService = {
    /**
     * Standardizes bay labels and checks occupancy
     */
    getBayStatus(jobs: Job[], totalBays: number): BayStatus[] {
        const statuses: BayStatus[] = [];

        for (let i = 1; i <= totalBays; i++) {
            const bayLabel = `Bay ${i}`;
            const activeJobsInBay = jobs.filter(j =>
                j.bay === bayLabel &&
                j.stageIndex < 6 // 6 is 'Ready for Pickup', let's say it stays in bay until then
            );

            statuses.push({
                id: i.toString(),
                label: bayLabel,
                isOccupied: activeJobsInBay.length > 0,
                currentJob: activeJobsInBay[0],
                hasConflict: activeJobsInBay.length > 1
            });
        }

        return statuses;
    },

    /**
     * Recommends the next available bay using basic scheduling logic.
     * In the future, this can be expanded with 'Drum-Buffer-Rope' logic
     * based on technician load or job type.
     */
    recommendBay(jobs: Job[], totalBays: number): string {
        const statuses = this.getBayStatus(jobs, totalBays);
        const freeBay = statuses.find(s => !s.isOccupied);

        if (freeBay) return freeBay.label;

        // If all full, suggest the one closest to completion (Stage Index 5: Quality Check)
        const closestToDone = [...statuses]
            .filter(s => s.currentJob)
            .sort((a, b) => (b.currentJob?.stageIndex ?? 0) - (a.currentJob?.stageIndex ?? 0))[0];

        return closestToDone ? closestToDone.label : 'TBD';
    }
};
