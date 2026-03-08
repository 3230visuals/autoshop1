

export interface VehicleRecall {
    Manufacturer: string;
    NHTSACampaignNumber: string;
    Summary: string;
    Conequence: string;
    Remedy: string;
    ReportReceivedDate: string;
    Component: string;
}

export const vehicleInsightsService = {
    /**
     * Fetches active recalls for a vehicle via NHTSA API
     */
    async getRecalls(make: string, model: string, year: string): Promise<VehicleRecall[]> {
        try {
            const response = await fetch(
                `https://api.nhtsa.gov/recalls/recallByVehicle?make=${make}&model=${model}&modelYear=${year}`
            );
            const data = (await response.json()) as { results?: VehicleRecall[] };

            if (data?.results) {
                return data.results;
            }
            return [];
        } catch (error) {
            console.error('Error fetching recalls:', error);
            return [];
        }
    },

    /**
     * Generates standard maintenance recommendations based on vehicle age
     * In a production app, this would query a professional database (AllData, Mitchell1, etc.)
     */
    getMaintenanceRecommendations(year: number): string[] {
        const age = new Date().getFullYear() - year;
        const baseRecs = ['Oil Change', 'Tire Rotation', 'Multi-point Inspection'];

        if (age > 3) baseRecs.push('Brake Fluid Flush', 'Cabin Air Filter');
        if (age > 5) baseRecs.push('Coolant Exchange', 'Spark Plug Inspection', 'Drive Belt Check');
        if (age > 10) baseRecs.push('Timing Belt/Chain Inspection', 'Suspension Component Review');

        return baseRecs;
    }
};
