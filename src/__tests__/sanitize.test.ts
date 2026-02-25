import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeUrl, maskCardNumber, isValidCardFormat, formatExpiry } from '../utils/sanitize';

describe('sanitizeInput', () => {
    it('strips HTML tags', () => {
        expect(sanitizeInput('<b>bold</b>')).toBe('bold');
    });

    it('strips script tags and content', () => {
        expect(sanitizeInput('<script>alert("xss")</script>Hello'))
            .toBe('Hello');
    });

    it('escapes ampersands in plain text', () => {
        const result = sanitizeInput('Tom & Jerry');
        expect(result).toBe('Tom &amp; Jerry');
    });

    it('handles empty string', () => {
        expect(sanitizeInput('')).toBe('');
    });

    it('trims whitespace', () => {
        expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('handles nested script tags', () => {
        const result = sanitizeInput('<script>alert("<script>nested</script>")</script>safe');
        expect(result).not.toContain('script');
        expect(result).toContain('safe');
    });
});

describe('sanitizeUrl', () => {
    it('allows https URLs', () => {
        expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('allows http URLs', () => {
        expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('blocks javascript: protocol', () => {
        expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    it('blocks data: URIs', () => {
        expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('allows relative URLs', () => {
        expect(sanitizeUrl('/checkout')).toBe('/checkout');
    });

    it('handles empty string', () => {
        expect(sanitizeUrl('')).toBe('');
    });
});

describe('maskCardNumber', () => {
    it('masks all but last 4 digits', () => {
        expect(maskCardNumber('4000123456789012')).toBe('•••• •••• •••• 9012');
    });

    it('handles formatted card number with spaces', () => {
        expect(maskCardNumber('4000 1234 5678 9012')).toBe('•••• •••• •••• 9012');
    });

    it('handles short number', () => {
        expect(maskCardNumber('12')).toBe('••');
    });
});

describe('isValidCardFormat', () => {
    it('accepts 16-digit card', () => {
        expect(isValidCardFormat('4000123456789012')).toBe(true);
    });

    it('accepts 13-digit card (Visa old)', () => {
        expect(isValidCardFormat('4000123456789')).toBe(true);
    });

    it('rejects too-short input', () => {
        expect(isValidCardFormat('1234')).toBe(false);
    });

    it('rejects 20+ digits', () => {
        expect(isValidCardFormat('12345678901234567890')).toBe(false);
    });
});

describe('formatExpiry', () => {
    it('formats "1225" as "12 / 25"', () => {
        expect(formatExpiry('1225')).toBe('12 / 25');
    });

    it('handles slash input "12/25"', () => {
        expect(formatExpiry('12/25')).toBe('12 / 25');
    });

    it('returns partial month alone', () => {
        expect(formatExpiry('1')).toBe('1');
    });

    it('returns just month for 2 digits', () => {
        expect(formatExpiry('12')).toBe('12');
    });
});
