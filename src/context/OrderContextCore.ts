import { createContext } from 'react';
import type { ServiceItem, OrderState } from './AppTypes';

export interface OrderContextType {
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

export const OrderContext = createContext<OrderContextType | null>(null);
