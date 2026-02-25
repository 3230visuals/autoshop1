import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ServiceItem, OrderState } from './AppTypes';

/* ═══════════════════════════════════════════════════
   Order Context — Service items, approvals, checkout
   ═══════════════════════════════════════════════════ */

interface OrderContextType {
    serviceItems: ServiceItem[];
    addServiceItem: (item: Omit<ServiceItem, 'id'>) => void;
    updateServiceItem: (id: string, updates: Partial<ServiceItem>) => void;
    deleteServiceItem: (id: string) => void;
    selectedServiceIds: Set<string>;
    toggleService: (id: string) => void;
    order: OrderState;
    approveServices: () => void;
    setTipPercent: (percent: number | null) => void;
    completePayment: (method?: string) => Promise<void>;
    resetOrder: () => void;
}

const OrderContext = createContext<OrderContextType | null>(null);

export const OrderProvider: React.FC<{ children: ReactNode; showToast: (msg: string) => void }> = ({ children, showToast }) => {
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>([
        { id: 's1', name: 'Full Inspection', price: 149, severity: 'recommended', icon: 'search', iconColor: 'text-primary', description: 'Comprehensive diagnostic scan and physical check.' },
        { id: 's2', name: 'Synthetic Oil Change', price: 89, severity: 'recommended', icon: 'oil_barrel', iconColor: 'text-orange-400', description: 'High-performance 0W-40 full synthetic oil and filter.' },
        { id: 's3', name: 'Brake Pad Replacement', price: 450, severity: 'critical', icon: 'minor_crash', iconColor: 'text-red-400', description: 'OEM-spec high-performance pads and sensor replacement.' },
        { id: 's4', name: 'Brake Fluid Flush', price: 125, severity: 'recommended', icon: 'water_drop', iconColor: 'text-primary', description: 'Complete system bleed and fresh DOT-4 fluid.' },
    ]);

    const addServiceItem = useCallback((item: Omit<ServiceItem, 'id'>) => {
        setServiceItems(prev => [...prev, { ...item, id: `s${Date.now()}` }]);
        showToast('Service added');
    }, [showToast]);

    const updateServiceItem = useCallback((id: string, updates: Partial<ServiceItem>) => {
        setServiceItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    }, []);

    const deleteServiceItem = useCallback((id: string) => {
        setServiceItems(prev => prev.filter(item => item.id !== id));
        showToast('Service removed');
    }, [showToast]);

    const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set(['s1', 's2']));
    const toggleService = useCallback((id: string) => {
        setSelectedServiceIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const [order, setOrder] = useState<OrderState>({
        approvedItems: [], subtotal: 0, tax: 0, tipPercent: null, tipAmount: 0,
        total: 0, paid: false, orderNumber: 'INV-1024', paymentMethod: '', paidDate: '',
    });

    const approveServices = useCallback(() => {
        const approved = serviceItems.filter(s => selectedServiceIds.has(s.id));
        const subtotal = approved.reduce((acc, s) => acc + s.price, 0);
        const tax = subtotal * 0.08;
        setOrder(prev => ({ ...prev, approvedItems: approved, subtotal, tax, total: subtotal + tax + prev.tipAmount }));
    }, [serviceItems, selectedServiceIds]);

    const setTipPercent = useCallback((percent: number | null) => {
        setOrder(prev => {
            const tipAmount = percent ? (prev.subtotal * percent) : 0;
            return { ...prev, tipPercent: percent, tipAmount, total: prev.subtotal + prev.tax + tipAmount };
        });
    }, []);

    const completePayment = useCallback(async (method: string = 'Card') => {
        try {
            setOrder(prev => ({ ...prev, paid: true, paymentMethod: method, paidDate: new Date().toLocaleDateString() }));
            showToast('Transaction Secured');
        } catch {
            showToast('Payment processing error');
        }
    }, [showToast]);

    const resetOrder = useCallback(() => {
        setOrder({
            approvedItems: [], subtotal: 0, tax: 0, tipPercent: null, tipAmount: 0,
            total: 0, paid: false, orderNumber: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
            paymentMethod: '', paidDate: '',
        });
    }, []);

    const value = useMemo(() => ({
        serviceItems, addServiceItem, updateServiceItem, deleteServiceItem,
        selectedServiceIds, toggleService, order, approveServices, setTipPercent,
        completePayment, resetOrder
    }), [serviceItems, addServiceItem, updateServiceItem, deleteServiceItem,
        selectedServiceIds, toggleService, order, approveServices, setTipPercent,
        completePayment, resetOrder]);

    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = (): OrderContextType => {
    const ctx = useContext(OrderContext);
    if (!ctx) throw new Error('useOrder must be used within OrderProvider');
    return ctx;
};
