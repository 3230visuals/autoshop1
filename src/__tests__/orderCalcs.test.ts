import { describe, it, expect } from 'vitest';

/**
 * Unit tests for order calculation logic.
 *
 * These test the pure math that drives the order summary —
 * subtotal aggregation, tax, tip, and edge cases.
 */

// ── Pure functions extracted from order logic ──

function calcSubtotal(items: { price: number }[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
}

function calcTax(subtotal: number, rate = 0.08): number {
    return subtotal * rate;
}

function calcTip(subtotal: number, tipPercent: number | null): number {
    return tipPercent ? subtotal * tipPercent : 0;
}

function calcTotal(subtotal: number, tax: number, tip: number): number {
    return subtotal + tax + tip;
}

// ── Tests ──

describe('Order Calculations', () => {
    describe('calcSubtotal', () => {
        it('sums prices of selected services', () => {
            const items = [{ price: 149 }, { price: 89 }, { price: 450 }];
            expect(calcSubtotal(items)).toBe(688);
        });

        it('returns 0 for empty list', () => {
            expect(calcSubtotal([])).toBe(0);
        });

        it('handles single item', () => {
            expect(calcSubtotal([{ price: 125 }])).toBe(125);
        });
    });

    describe('calcTax', () => {
        it('applies 8% tax by default', () => {
            expect(calcTax(100)).toBeCloseTo(8);
        });

        it('applies custom tax rate', () => {
            expect(calcTax(200, 0.10)).toBeCloseTo(20);
        });

        it('returns 0 for $0 subtotal', () => {
            expect(calcTax(0)).toBe(0);
        });
    });

    describe('calcTip', () => {
        it('calculates 15% tip', () => {
            expect(calcTip(100, 0.15)).toBeCloseTo(15);
        });

        it('calculates 20% tip', () => {
            expect(calcTip(688, 0.20)).toBeCloseTo(137.6);
        });

        it('returns 0 when tip is null (no tip)', () => {
            expect(calcTip(500, null)).toBe(0);
        });

        it('handles 0% tip', () => {
            expect(calcTip(100, 0)).toBe(0);
        });
    });

    describe('calcTotal', () => {
        it('sums subtotal + tax + tip', () => {
            const subtotal = 688;
            const tax = calcTax(subtotal); // 55.04
            const tip = calcTip(subtotal, 0.15); // 103.20
            expect(calcTotal(subtotal, tax, tip)).toBeCloseTo(846.24);
        });

        it('total equals subtotal + tax when no tip', () => {
            const subtotal = 200;
            const tax = calcTax(subtotal); // 16
            expect(calcTotal(subtotal, tax, 0)).toBeCloseTo(216);
        });

        it('handles zero order gracefully', () => {
            expect(calcTotal(0, 0, 0)).toBe(0);
        });
    });

    describe('Real-world scenarios', () => {
        it('Full Inspection + Oil Change with 18% tip', () => {
            const items = [{ price: 149 }, { price: 89 }]; // inspection + oil
            const subtotal = calcSubtotal(items); // 238
            const tax = calcTax(subtotal);         // 19.04
            const tip = calcTip(subtotal, 0.18);   // 42.84
            const total = calcTotal(subtotal, tax, tip);
            expect(total).toBeCloseTo(299.88);
        });

        it('Brake job with no tip', () => {
            const items = [{ price: 450 }, { price: 125 }]; // pads + fluid
            const subtotal = calcSubtotal(items); // 575
            const tax = calcTax(subtotal);         // 46
            const total = calcTotal(subtotal, tax, 0);
            expect(total).toBeCloseTo(621);
        });
    });
});
