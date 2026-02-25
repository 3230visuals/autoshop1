/**
 * VIN Lookup Service using NHTSA vPIC API (Free)
 * Decodes 17-character VINs to get Year, Make, Model.
 */

import type { VinData } from '../context/AppTypes';

export const vinService = {
    /**
     * Decodes a VIN using the NHTSA API
     * @param vin - 17 character Vehicle Identification Number
     */
    decodeVin: async (vin: string): Promise<VinData> => {
        if (!vin || vin.length < 11) {
            return { year: '', make: '', model: '', error: 'Invalid VIN length' };
        }

        try {
            const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`);
            if (!response.ok) throw new Error('NHTSA API Unreachable');

            const data = await response.json();
            const result = data.Results?.[0];

            if (!result || !result.Make) {
                return { year: '', make: '', model: '', error: 'VIN not found or invalid' };
            }

            // Keywords refined for professional "Studio" look
            const query = `${result.Make} ${result.Model} ${result.Trim || ''}`.trim();
            const carImage = `https://loremflickr.com/800/600/${query.replace(/\s+/g, ',')},car,luxury,studio,sideview/all`;

            return {
                year: result.ModelYear || '',
                make: result.Make || '',
                model: result.Model || '',
                trim: result.Trim || '',
                image: carImage,
                // Add an extra field for a verified Unsplash fallback if flickr fails
                fallbackImage: `https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000&auto=format&fit=crop`
            };
        } catch (error) {
            console.error('VIN Decoding Error:', error);
            return { year: '', make: '', model: '', error: 'Failed to lookup VIN' };
        }
    }
};
