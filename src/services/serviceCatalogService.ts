import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from './authService';
import type { ServiceItem } from '../context/AppTypes';

interface RawServiceData {
    id: string;
    name: string;
    price: number;
    severity: string;
    icon: string;
    icon_color: string;
    description: string;
}

export const serviceCatalogService = {
    /**
     * Fetches all master services for a shop
     */
    async getServicesByShop(shopId: string): Promise<ServiceItem[]> {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: fetching service catalog');
            return [
                { id: 'srv-1', name: 'Full Synthetic Oil Change', price: 85.00, severity: 'recommended', icon: 'oil_barrel', iconColor: 'text-blue-400', description: 'Premium oil and filter replacement.' },
                { id: 'srv-2', name: 'Brake Pad Replacement', price: 189.50, severity: 'critical', icon: 'minor_crash', iconColor: 'text-red-400', description: 'Front ceramic brake pads.' },
                { id: 'srv-3', name: 'Tire Rotation & Balance', price: 45.00, severity: 'recommended', icon: 'tire_repair', iconColor: 'text-emerald-400', description: 'Extend tire life and improve ride.' }
            ];
        }

        const response = await supabase
            .from('service_catalog')
            .select('*')
            .eq('shop_id', shopId)
            .order('name');

        if (response.error) throw response.error;

        return ((response.data as RawServiceData[]) ?? []).map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            severity: item.severity as 'critical' | 'recommended',
            icon: item.icon,
            iconColor: item.icon_color,
            description: item.description
        }));
    },

    /**
     * Adds a new service to the shop catalog
     */
    async addService(shopId: string, service: Omit<ServiceItem, 'id'>): Promise<ServiceItem> {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: service catalog add skipped');
            return { ...service, id: `srv-mock-${Date.now()}` } as ServiceItem;
        }

        const response = await supabase
            .from('service_catalog')
            .insert({
                shop_id: shopId,
                name: service.name,
                price: service.price,
                severity: service.severity,
                icon: service.icon,
                icon_color: service.iconColor,
                description: service.description
            })
            .select()
            .single();

        if (response.error) throw response.error;

        const data = response.data as RawServiceData;
        return {
            id: data.id,
            name: data.name,
            price: Number(data.price),
            severity: data.severity as 'critical' | 'recommended',
            icon: data.icon,
            iconColor: data.icon_color,
            description: data.description
        };
    },

    /**
     * Updates an existing catalog item
     */
    async updateService(id: string, updates: Partial<ServiceItem>): Promise<void> {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: service catalog update skipped');
            return;
        }
        const dbUpdates: Record<string, string | number | undefined> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.severity !== undefined) dbUpdates.severity = updates.severity;
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
        if (updates.iconColor !== undefined) dbUpdates.icon_color = updates.iconColor;
        if (updates.description !== undefined) dbUpdates.description = updates.description;

        const { error } = await supabase
            .from('service_catalog')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    },


    /**
     * Deletes a service from the catalog
     */
    async deleteService(id: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            console.log('Demo mode: service catalog delete skipped');
            return;
        }
        const { error } = await supabase
            .from('service_catalog')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
