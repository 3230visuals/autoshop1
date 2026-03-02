/**
 * VIN Lookup Service using NHTSA vPIC API (Free)
 * Decodes 17-character VINs to get Year, Make, Model.
 * Caches results in localStorage to avoid repeat API calls.
 */

import type { VinData } from '../context/AppTypes';
import { vehicleImageService } from './vehicleImageService';

// Define a type for the NHTSA API response result
interface NHTSAVinDecodeResult {
    Make?: string;
    Model?: string;
    ModelYear?: string;
    Trim?: string;
}

// localStorage cache for VIN decodes
const VIN_CACHE_PREFIX = 'vin:';

function getCachedVin(vin: string): VinData | null {
    try {
        const raw = localStorage.getItem(`${VIN_CACHE_PREFIX}${vin.toUpperCase()}`);
        if (!raw) return null;
        const { data, exp } = JSON.parse(raw) as { data: VinData; exp: number };
        if (Date.now() > exp) {
            localStorage.removeItem(`${VIN_CACHE_PREFIX}${vin.toUpperCase()}`);
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

function setCachedVin(vin: string, data: VinData): void {
    try {
        // Cache for 30 days — VIN data doesn't change
        localStorage.setItem(
            `${VIN_CACHE_PREFIX}${vin.toUpperCase()}`,
            JSON.stringify({ data, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })
        );
    } catch {
        // localStorage full — ignore
    }
}

export const vinService = {
    /**
     * Decodes a VIN using the NHTSA API
     * @param vin - 17 character Vehicle Identification Number
     */
    decodeVin: async (vin: string): Promise<VinData> => {
        if (!vin || vin.length < 11) {
            return { year: '', make: '', model: '', error: 'Invalid VIN length' };
        }

        // Check cache first
        const cached = getCachedVin(vin);
        if (cached) return cached;

        try {
            const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`);
            if (!response.ok) throw new Error('NHTSA API Unreachable');

            const data = (await response.json()) as { Results: NHTSAVinDecodeResult[] };
            const result = data.Results?.[0];

            if (!result?.Make) {
                return { year: '', make: '', model: '', error: 'VIN not found or invalid' };
            }

            const year = result.ModelYear ?? '';
            const make = result.Make ?? '';
            const model = result.Model ?? '';
            const trim = result.Trim ?? '';

            // Get a real vehicle image (async, with fallback)
            const image = await vehicleImageService.resolveImage(year, make, model, trim);

            const vinData: VinData = {
                year,
                make,
                model,
                trim,
                image,
                fallbackImage: vehicleImageService.getPlaceholder(),
            };

            // Cache the result
            setCachedVin(vin, vinData);

            return vinData;

        } catch (error) {
            console.error('VIN Decoding Error:', error);
            return { year: '', make: '', model: '', error: 'Failed to lookup VIN' };
        }
    }
};
