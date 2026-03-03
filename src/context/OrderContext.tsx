import React, { createContext, use, useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ServiceItem, OrderState } from './AppTypes';
import { serviceCatalogService } from '../services/serviceCatalogService';
import { paymentService } from '../services/paymentService';
import { shopService } from '../services/shopService';

/* ═══════════════════════════════════════════════════
   Order Context — Service items, approvals, checkout
   ═══════════════════════════════════════════════════ */

interface OrderContextType {
    serviceItems: ServiceItem[];
    addServiceItem: (item: Omit<ServiceItem, 'id'>) => Promise<void>;
    updateServiceItem: (id: string, updates: Partial<ServiceItem>) => Promise<void>;
    deleteServiceItem: (id: string) => Promise<void>;
    selectedServiceIds: Set<string>;
    toggleService: (id: string) => void;
    order: OrderState;
    approveServices: () => void;
    setTipPercent: (percent: number | null) => void;
    completePayment: (method?: string) => Promise<void>;
    startStripeCheckout: () => Promise<void>;
    resetOrder: () => void;
    refreshServices: () => Promise<void>;
    isLoading: boolean;
    isProcessing: boolean;
}

const OrderContext = createContext<OrderContextType | null>(null);

export const OrderProvider: React.FC<{ children: ReactNode; showToast: (msg: string) => void }> = ({ children, showToast }) => {
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [shopFeePercent, setShopFeePercent] = useState(1.0);
    const [isShopInTestMode, setIsShopInTestMode] = useState(true);

    const activeShopId = localStorage.getItem('activeShopId') || 'SHOP-01';

    const refreshServices = useCallback(async () => {
        try {
            setIsLoading(true);
            const [services, shopData] = await Promise.all([
                serviceCatalogService.getServicesByShop(activeShopId),
                shopService.getShopSettings(activeShopId)
            ]);
            setServiceItems(services);
            if (shopData) {
                setShopFeePercent(shopData.platformFeePercent ?? 1.0);
                setIsShopInTestMode(shopData.isTestMode ?? true);
            }
        } catch (err) {
            console.error('Failed to fetch order context data:', err);
            showToast('Failed to load shop data');
        } finally {
            setIsLoading(false);
        }
    }, [activeShopId, showToast]);

    useEffect(() => {
        void refreshServices();
    }, [refreshServices]);

    const addServiceItem = useCallback(async (item: Omit<ServiceItem, 'id'>) => {
        try {
            const newItem = await serviceCatalogService.addService(activeShopId, item);
            setServiceItems(prev => [...prev, newItem]);
            showToast('Service added to menu');
        } catch (err) {
            console.error('Failed to add service:', err);
            showToast('Failed to add service');
        }
    }, [activeShopId, showToast]);

    const updateServiceItem = useCallback(async (id: string, updates: Partial<ServiceItem>) => {
        try {
            await serviceCatalogService.updateService(id, updates);
            setServiceItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
            showToast('Service updated');
        } catch (err) {
            console.error('Failed to update service:', err);
            showToast('Update failed');
        }
    }, [showToast]);

    const deleteServiceItem = useCallback(async (id: string) => {
        try {
            await serviceCatalogService.deleteService(id);
            setServiceItems(prev => prev.filter(item => item.id !== id));
            showToast('Service removed');
        } catch (err) {
            console.error('Failed to delete service:', err);
            showToast('Deletion failed');
        }
    }, [showToast]);


    const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set([]));
    const toggleService = useCallback((id: string) => {
        setSelectedServiceIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);


    const [order, setOrder] = useState<OrderState>({
        approvedItems: [], subtotal: 0, tax: 0, tipPercent: null, tipAmount: 0, platformFee: 0,
        total: 0, paid: false, orderNumber: 'INV-1024', paymentMethod: '', paidDate: '',
        isTestMode: true
    });

    const approveServices = useCallback(() => {
        const approved = serviceItems.filter(s => selectedServiceIds.has(s.id));
        const subtotal = approved.reduce((acc, s) => acc + s.price, 0);
        const tax = subtotal * 0.08;
        const platformFee = paymentService.calculatePlatformFee(subtotal + tax, shopFeePercent);

        setOrder(prev => ({
            ...prev,
            approvedItems: approved,
            subtotal,
            tax,
            platformFee,
            total: subtotal + tax + prev.tipAmount + platformFee,
            isTestMode: isShopInTestMode
        }));
    }, [serviceItems, selectedServiceIds, shopFeePercent, isShopInTestMode]);

    const setTipPercent = useCallback((percent: number | null) => {
        setOrder(prev => {
            const tipAmount = percent ? (prev.subtotal * percent) : 0;
            const newTotal = prev.subtotal + prev.tax + tipAmount + prev.platformFee;
            return { ...prev, tipPercent: percent, tipAmount, total: newTotal };
        });
    }, []);

    const startStripeCheckout = useCallback(async () => {
        if (order.total <= 0) return;

        try {
            setIsProcessing(true);
            if (order.isTestMode) {
                showToast('Initiating Test Payment...');
                await paymentService.simulateTestPayment(order.orderNumber);
                await completePayment('Stripe (Test)');
            } else {
                const url = await paymentService.createCheckoutSession({
                    shopId: activeShopId,
                    orderId: order.orderNumber,
                    amount: order.total,
                    successUrl: window.location.origin + '/c/payment-success',
                    cancelUrl: window.location.origin + '/c/checkout',
                    description: `Invoice ${order.orderNumber} for ${activeShopId}`
                });
                window.location.href = url;
            }
        } catch (err) {
            console.error('Checkout failed:', err);
            showToast('Unable to start payment');
        } finally {
            setIsProcessing(false);
        }
    }, [order, activeShopId, showToast]);

    const completePayment = useCallback(async (method = 'Card') => {
        try {
            setOrder(prev => ({ ...prev, paid: true, paymentMethod: method, paidDate: new Date().toLocaleDateString() }));
            showToast('Transaction Secured');
        } catch {
            showToast('Payment processing error');
        }
    }, [showToast]);

    const resetOrder = useCallback(() => {
        setOrder({
            approvedItems: [], subtotal: 0, tax: 0, tipPercent: null, tipAmount: 0, platformFee: 0,
            total: 0, paid: false, orderNumber: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
            paymentMethod: '', paidDate: '', isTestMode: isShopInTestMode
        });
    }, [isShopInTestMode]);

    const value = useMemo(() => ({
        serviceItems, addServiceItem, updateServiceItem, deleteServiceItem,
        selectedServiceIds, toggleService, order, approveServices, setTipPercent,
        completePayment, startStripeCheckout, resetOrder, refreshServices, isLoading, isProcessing
    }), [serviceItems, addServiceItem, updateServiceItem, deleteServiceItem,
        selectedServiceIds, toggleService, order, approveServices, setTipPercent,
        completePayment, startStripeCheckout, resetOrder, refreshServices, isLoading, isProcessing]);

    return <OrderContext value={value}>{children}</OrderContext>;
};



export const useOrder = (): OrderContextType => {
    const ctx = use(OrderContext);
    if (!ctx) throw new Error('useOrder must be used within OrderProvider');
    return ctx;
};
