import type { Part } from '../context/AppTypes';

// Mock catalog for initial implementation
const PART_CATALOG: Omit<Part, 'id' | 'status' | 'eta' | 'notes'>[] = [
    { name: 'Brake Pad Set - Front (OEM)', partNumber: 'BP-911-F-OEM', vehicle: '2024 Porsche 911 GT3', vendor: 'Porsche Parts', cost: 450 },
    { name: 'Brake Pad Set - Rear (OEM)', partNumber: 'BP-911-R-OEM', vehicle: '2024 Porsche 911 GT3', vendor: 'Porsche Parts', cost: 380 },
    { name: 'Oil Filter - Porsche GT3', partNumber: 'OF-P-1234', vehicle: '2024 Porsche 911 GT3', vendor: 'Porsche Parts', cost: 45 },
    { name: 'Cabin Air Filter - Activated Carbon', partNumber: 'CAF-BMW-M3', vehicle: '2022 BMW M3', vendor: 'Bosch', cost: 35 },
    { name: 'Spark Plug - High Performance', partNumber: 'SP-NGK-IR', vehicle: 'Universal', vendor: 'NGK', cost: 12.50 },
    { name: 'Synthetic Oil 0W-40 (1qt)', partNumber: 'OIL-MOB-1', vehicle: 'Universal', vendor: 'Mobil 1', cost: 11.99 },
    { name: 'Front Strut Mount', partNumber: 'SM-F150-L', vehicle: '2019 Ford F-150', vendor: 'Moog', cost: 85 },
    { name: 'Brake Rotor - Vented', partNumber: 'BR-345-V', vehicle: '2019 Ford F-150', vendor: 'Brembo', cost: 125 },
];

export const partService = {
    async searchParts(query: string): Promise<Omit<Part, 'id' | 'status' | 'eta' | 'notes'>[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));

        if (!query.trim()) return [];

        const lowerQuery = query.toLowerCase();
        return PART_CATALOG.filter(part =>
            part.name.toLowerCase().includes(lowerQuery) ||
            part.partNumber.toLowerCase().includes(lowerQuery) ||
            part.vehicle.toLowerCase().includes(lowerQuery)
        );
    }
};
