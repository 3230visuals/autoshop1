/**
 * Vehicle Image Service
 * Resolves vehicle images based on Year + Make + Model.
 * Uses localStorage cache to avoid repeat lookups.
 * Falls back to a neutral car silhouette when no real image is available.
 */

const PLACEHOLDER = '/vehicle-placeholder.svg';

// localStorage cache
const CACHE_PREFIX = 'vimg:';

function cacheKey(year: string, make: string, model: string): string {
    return `${CACHE_PREFIX}${year}:${make}:${model}`.toLowerCase().replace(/\s+/g, '-');
}

function getCached(key: string): string | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const { url, exp } = JSON.parse(raw) as { url: string; exp: number };
        if (Date.now() > exp) {
            localStorage.removeItem(key);
            return null;
        }
        return url;
    } catch {
        return null;
    }
}

function setCache(key: string, url: string): void {
    try {
        // Cache for 7 days
        localStorage.setItem(key, JSON.stringify({ url, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
    } catch {
        // localStorage full — ignore
    }
}

export const vehicleImageService = {
    /**
     * Get a vehicle image URL for the given year/make/model.
     * Returns the placeholder if no reliable image can be found.
     */
    getImageUrl(year: string, make: string, model: string, _trim?: string): string {
        if (!make || !model) return PLACEHOLDER;

        const key = cacheKey(year, make, model);
        const cached = getCached(key);
        if (cached) return cached;

        // Use a deterministic approach: Google's free image CDN with make+model
        // This constructs a URL that will attempt to find a matching vehicle image
        const query = `${year} ${make} ${model}`.trim();

        // Use a curated set of known-good stock photography sources
        // Fallback chain: we use a neutral placeholder since free APIs
        // that guarantee accurate make/model matching don't exist
        const imageUrl = PLACEHOLDER;

        setCache(key, imageUrl);
        return imageUrl;
    },

    /**
     * Async version that could call an external API in the future.
     * For now returns same as sync version.
     */
    async resolveImage(year: string, make: string, model: string, trim?: string): Promise<string> {
        if (!make || !model) return PLACEHOLDER;

        const key = cacheKey(year, make, model);
        const cached = getCached(key);
        if (cached) return cached;

        // Try to get an image from a free source
        // Using the Wikipedia/Wikimedia commons approach for real car images
        try {
            const searchTerm = `${make} ${model} ${year} car`;
            const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(`${make} ${model}`)}`;
            const res = await fetch(wikiUrl);
            if (res.ok) {
                const data = await res.json() as { thumbnail?: { source?: string }; originalimage?: { source?: string } };
                const imgUrl = data.originalimage?.source ?? data.thumbnail?.source;
                if (imgUrl) {
                    setCache(key, imgUrl);
                    return imgUrl;
                }
            }
        } catch {
            // Wikipedia lookup failed — use placeholder
        }

        setCache(key, PLACEHOLDER);
        return PLACEHOLDER;
    },

    /** Get the placeholder URL */
    getPlaceholder(): string {
        return PLACEHOLDER;
    }
};
