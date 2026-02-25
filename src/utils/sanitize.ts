/**
 * Input sanitization utilities for XSS prevention and data masking.
 */

/**
 * Strips HTML tags and script content from a string.
 * Use on all user-generated text before rendering or storing.
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';
    // 1. Strip script tags and their content first (before entity escaping)
    let result = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // 2. Strip remaining HTML tags
    result = result.replace(/<[^>]*>/g, '');
    // 3. Escape special characters in the remaining text
    return result
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}

/**
 * Validates that a URL uses an allowed scheme.
 * Prevents javascript: protocol and data: URI attacks.
 */
export function sanitizeUrl(url: string): string {
    if (!url) return '';
    const trimmed = url.trim();
    const allowed = ['http:', 'https:', 'mailto:', 'sms:', 'tel:'];
    try {
        const parsed = new URL(trimmed);
        if (!allowed.includes(parsed.protocol)) {
            return '';
        }
        return trimmed;
    } catch {
        // Relative URL or invalid — allow relative, block suspicious patterns
        if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed)) {
            return '';
        }
        return trimmed;
    }
}

/**
 * Masks a card number, showing only the last 4 digits.
 * Example: "4000123456789012" → "•••• •••• •••• 9012"
 */
export function maskCardNumber(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 4) return '•'.repeat(digits.length);
    const last4 = digits.slice(-4);
    return `•••• •••• •••• ${last4}`;
}

/**
 * Validates basic card number format (Luhn-agnostic, just length + digits).
 */
export function isValidCardFormat(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, '');
    return digits.length >= 13 && digits.length <= 19;
}

/**
 * Formats an expiry string like "1225" or "12/25" → "12 / 25"
 */
export function formatExpiry(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)} / ${digits.slice(2, 4)}`;
}
