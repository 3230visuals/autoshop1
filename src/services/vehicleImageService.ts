/**
 * Vehicle Image Service
 * Resolves vehicle images based on Year + Make + Model.
 * Uses localStorage cache to avoid repeat lookups.
 * Falls back to a neutral car silhouette when no real image is available.
 *
 * Primary: Google image proxy via make/model (deterministic, fast)
 * Fallback: SVG placeholder
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

/**
 * Build a deterministic image URL from make+model using free image sources.
 * We try multiple strategies and pick the first one that works.
 */
function buildImageUrl(year: string, make: string, model: string): string {
    const q = encodeURIComponent(`${year} ${make} ${model} car`.trim());
    // Use Unsplash Source — free, no API key, returns a redirect to a real photo
    return `https://source.unsplash.com/800x600/?${q}`;
}

/**
 * Validate that an image URL actually loads.
 * Returns the URL if valid, or the placeholder if it fails.
 */
function validateImage(url: string, timeoutMs = 5000): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        const timer = setTimeout(() => {
            img.src = '';
            resolve(PLACEHOLDER);
        }, timeoutMs);

        img.onload = () => {
            clearTimeout(timer);
            // Unsplash sometimes returns a tiny 1x1 fallback — reject those
            if (img.naturalWidth > 10 && img.naturalHeight > 10) {
                resolve(url);
            } else {
                resolve(PLACEHOLDER);
            }
        };

        img.onerror = () => {
            clearTimeout(timer);
            resolve(PLACEHOLDER);
        };

        img.src = url;
    });
}

export const vehicleImageService = {
    /**
     * Get a vehicle image URL for the given year/make/model (sync).
     * Returns a constructed URL that *should* resolve to a real image.
     * Use resolveImage() for validated results.
     */
    getImageUrl(year: string, make: string, model: string): string {
        if (!make || !model) return PLACEHOLDER;

        const key = cacheKey(year, make, model);
        const cached = getCached(key);
        if (cached) return cached;

        // Return a constructed URL — it may or may not load
        return buildImageUrl(year, make, model);
    },

    /**
     * Async version that validates the image actually loads.
     * Tries multiple sources with fallback chain.
     */
    async resolveImage(year: string, make: string, model: string, trim?: string): Promise<string> {
        if (!make || !model) return PLACEHOLDER;

        const key = cacheKey(year, make, model);
        const cached = getCached(key);
        if (cached) return cached;

        // Strategy 1: Unsplash Source
        const unsplashUrl = buildImageUrl(year, make, model);
        const result1 = await validateImage(unsplashUrl);
        if (result1 !== PLACEHOLDER) {
            setCache(key, result1);
            return result1;
        }

        // Strategy 2: Wikipedia / Wikimedia commons
        try {
            const searchTerm = trim ? `${make} ${model} (${trim})` : `${make} ${model}`;
            const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`;
            const res = await fetch(wikiUrl);
            if (res.ok) {
                const data = await res.json() as { thumbnail?: { source?: string }; originalimage?: { source?: string } };
                const imgUrl = data.originalimage?.source ?? data.thumbnail?.source;
                if (imgUrl) {
                    const result2 = await validateImage(imgUrl);
                    if (result2 !== PLACEHOLDER) {
                        setCache(key, result2);
                        return result2;
                    }
                }
            }
        } catch {
            // Wikipedia lookup failed — continue to placeholder
        }

        setCache(key, PLACEHOLDER);
        return PLACEHOLDER;
    },

    /** Get the placeholder URL */
    getPlaceholder(): string {
        return PLACEHOLDER;
    }
};
