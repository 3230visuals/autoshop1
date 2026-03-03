import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import type { ReactNode } from 'react';
import { OrderProvider, useOrder } from '../context/OrderContext';
import type { ServiceItem } from '../context/AppTypes';

// Mock external dependencies
vi.mock('../services/serviceCatalogService', () => ({
    serviceCatalogService: {
        getServicesByShop: vi.fn().mockResolvedValue([
            { id: 'svc-1', name: 'Oil Change', price: 89, category: 'Maintenance' },
            { id: 'svc-2', name: 'Brake Pads', price: 249, category: 'Repair' },
            { id: 'svc-3', name: 'Tire Rotation', price: 45, category: 'Maintenance' },
        ] as ServiceItem[]),
        addService: vi.fn().mockImplementation(async (_shopId: string, item: Record<string, unknown>) => ({ ...item, id: `svc-new-${Date.now()}` })),
        updateService: vi.fn().mockResolvedValue(true),
        deleteService: vi.fn().mockResolvedValue(true),
    },
}));

vi.mock('../services/paymentService', () => ({
    paymentService: {
        calculatePlatformFee: (amount: number, percent: number) => amount * (percent / 100),
        simulateTestPayment: vi.fn().mockResolvedValue(true),
        createCheckoutSession: vi.fn().mockResolvedValue('https://stripe.com/test'),
    },
}));

vi.mock('../services/shopService', () => ({
    shopService: {
        getShopSettings: vi.fn().mockResolvedValue({
            platformFeePercent: 1.0,
            isTestMode: true,
        }),
    },
}));

const mockShowToast = vi.fn();

function wrapper({ children }: { children: ReactNode }) {
    return React.createElement(OrderProvider, { showToast: mockShowToast }, children);
}

describe('Order Context', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('activeShopId', 'SHOP-01');
    });

    describe('initial state', () => {
        it('loads service items from the catalog', async () => {
            const { result } = renderHook(() => useOrder(), { wrapper });

            // Wait for async initial load
            await act(async () => {
                await new Promise(r => setTimeout(r, 50));
            });

            expect(result.current.serviceItems.length).toBe(3);
        });

        it('order starts unpaid with zero total', () => {
            const { result } = renderHook(() => useOrder(), { wrapper });
            expect(result.current.order.paid).toBe(false);
            expect(result.current.order.total).toBe(0);
        });

        it('no services selected initially', () => {
            const { result } = renderHook(() => useOrder(), { wrapper });
            expect(result.current.selectedServiceIds.size).toBe(0);
        });

        it('isProcessing is false initially', () => {
            const { result } = renderHook(() => useOrder(), { wrapper });
            expect(result.current.isProcessing).toBe(false);
        });
    });

    describe('toggleService', () => {
        it('adds a service to selection', () => {
            const { result } = renderHook(() => useOrder(), { wrapper });

            act(() => {
                result.current.toggleService('svc-1');
            });

            expect(result.current.selectedServiceIds.has('svc-1')).toBe(true);
        });

        it('removes a service on second toggle', () => {
            const { result } = renderHook(() => useOrder(), { wrapper });

            act(() => {
                result.current.toggleService('svc-1');
            });
            act(() => {
                result.current.toggleService('svc-1');
            });

            expect(result.current.selectedServiceIds.has('svc-1')).toBe(false);
        });

        it('can select multiple services', () => {
            const { result } = renderHook(() => useOrder(), { wrapper });

            act(() => {
                result.current.toggleService('svc-1');
                result.current.toggleService('svc-2');
            });

            expect(result.current.selectedServiceIds.size).toBe(2);
        });
    });

    describe('approveServices', () => {
        it('calculates subtotal, tax, and total from selected services', async () => {
            const { result } = renderHook(() => useOrder(), { wrapper });

            // Wait for services to load
            await act(async () => {
                await new Promise(r => setTimeout(r, 50));
            });

            act(() => {
                result.current.toggleService('svc-1'); // $89
                result.current.toggleService('svc-2'); // $249
            });

            act(() => {
                result.current.approveServices();
            });

            const { order } = result.current;
            expect(order.subtotal).toBe(338);               // 89 + 249
            expect(order.tax).toBeCloseTo(27.04);            // 338 * 0.08
            expect(order.approvedItems.length).toBe(2);
            expect(order.total).toBeGreaterThan(0);
        });

        it('handles no selected services', async () => {
            const { result } = renderHook(() => useOrder(), { wrapper });

            await act(async () => {
                await new Promise(r => setTimeout(r, 50));
            });

            act(() => {
                result.current.approveServices();
            });

            expect(result.current.order.subtotal).toBe(0);
            expect(result.current.order.approvedItems.length).toBe(0);
        });
    });

    describe('setTipPercent', () => {
        it('applies a 15% tip to the subtotal', async () => {
            const { result } = renderHook(() => useOrder(), { wrapper });

            await act(async () => {
                await new Promise(r => setTimeout(r, 50));
            });

            act(() => {
                result.current.toggleService('svc-1'); // $89
            });

            act(() => {
                result.current.approveServices();
            });

            act(() => {
                result.current.setTipPercent(0.15);
            });

            expect(result.current.order.tipPercent).toBe(0.15);
            expect(result.current.order.tipAmount).toBeCloseTo(89 * 0.15);
        });

        it('removes tip when set to null', async () => {
            const { result } = renderHook(() => useOrder(), { wrapper });

            await act(async () => {
                await new Promise(r => setTimeout(r, 50));
            });

            act(() => {
                result.current.toggleService('svc-1');
            });
            act(() => {
                result.current.approveServices();
            });
            act(() => {
                result.current.setTipPercent(0.20);
            });
            act(() => {
                result.current.setTipPercent(null);
            });

            expect(result.current.order.tipAmount).toBe(0);
            expect(result.current.order.tipPercent).toBeNull();
        });
    });

    describe('completePayment', () => {
        it('marks order as paid', async () => {
            const { result } = renderHook(() => useOrder(), { wrapper });

            await act(async () => {
                await result.current.completePayment('Card');
            });

            expect(result.current.order.paid).toBe(true);
            expect(result.current.order.paymentMethod).toBe('Card');
            expect(mockShowToast).toHaveBeenCalledWith('Transaction Secured');
        });

        it('defaults to Card method', async () => {
            const { result } = renderHook(() => useOrder(), { wrapper });

            await act(async () => {
                await result.current.completePayment();
            });

            expect(result.current.order.paymentMethod).toBe('Card');
        });
    });

    describe('resetOrder', () => {
        it('resets order to initial state', async () => {
            const { result } = renderHook(() => useOrder(), { wrapper });

            // Complete a payment first
            await act(async () => {
                await result.current.completePayment('Cash');
            });
            expect(result.current.order.paid).toBe(true);

            // Reset
            act(() => {
                result.current.resetOrder();
            });

            expect(result.current.order.paid).toBe(false);
            expect(result.current.order.subtotal).toBe(0);
            expect(result.current.order.total).toBe(0);
            expect(result.current.order.approvedItems.length).toBe(0);
        });

        it('generates new order number on reset', async () => {
            const { result } = renderHook(() => useOrder(), { wrapper });
            const originalNumber = result.current.order.orderNumber;

            act(() => {
                result.current.resetOrder();
            });

            expect(result.current.order.orderNumber).not.toBe(originalNumber);
            expect(result.current.order.orderNumber).toMatch(/^INV-\d{4}$/);
        });
    });

    describe('end-to-end: full checkout flow', () => {
        it('select → approve → tip → pay → reset', async () => {
            const { result } = renderHook(() => useOrder(), { wrapper });

            // 1. Wait for services
            await act(async () => {
                await new Promise(r => setTimeout(r, 50));
            });
            expect(result.current.serviceItems.length).toBe(3);

            // 2. Select services
            act(() => {
                result.current.toggleService('svc-1'); // $89
                result.current.toggleService('svc-3'); // $45
            });

            // 3. Approve
            act(() => {
                result.current.approveServices();
            });
            expect(result.current.order.subtotal).toBe(134);
            expect(result.current.order.approvedItems.length).toBe(2);

            // 4. Add tip
            act(() => {
                result.current.setTipPercent(0.20);
            });
            expect(result.current.order.tipAmount).toBeCloseTo(26.8);

            // 5. Pay
            await act(async () => {
                await result.current.completePayment('Stripe (Test)');
            });
            expect(result.current.order.paid).toBe(true);

            // 6. Reset for next customer
            act(() => {
                result.current.resetOrder();
            });
            expect(result.current.order.paid).toBe(false);
            expect(result.current.order.subtotal).toBe(0);
        });
    });
});
