import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from './authService';

export interface InvoiceLineItem {
    name: string;
    price: number;
}

export interface Invoice {
    ticketId: string;
    shopId: string;
    items: InvoiceLineItem[];
    laborHours: number;
    laborRate: number;
    taxRate: number;
    status: 'draft' | 'sent' | 'paid';
    createdAt: number;
}

// ── LocalStorage (demo / fallback) ──

export const getInvoice = (ticketId: string): Invoice | null => {
    try {
        const raw = localStorage.getItem(`invoice:${ticketId}`);
        return raw ? (JSON.parse(raw) as Invoice) : null;
    } catch { return null; }
};

export const saveInvoice = (invoice: Invoice) => {
    localStorage.setItem(`invoice:${invoice.ticketId}`, JSON.stringify(invoice));
};

// ── Supabase (production) ──
// Stores the full invoice inside jobs.financials JSONB — zero new columns needed

export const saveInvoiceToSupabase = async (ticketId: string, invoice: Invoice): Promise<void> => {
    if (!isSupabaseConfigured()) {
        // Demo mode fallback
        saveInvoice(invoice);
        return;
    }

    // Build the financials JSONB that includes both the totals AND the full invoice
    const partsTotal = invoice.items.reduce((s, i) => s + i.price, 0);
    const laborTotal = invoice.laborHours * invoice.laborRate;
    const subtotal = partsTotal + laborTotal;
    const tax = subtotal * invoice.taxRate;
    const total = subtotal + tax;

    const financials = {
        subtotal,
        tax,
        total,
        invoice: {
            items: invoice.items,
            laborHours: invoice.laborHours,
            laborRate: invoice.laborRate,
            taxRate: invoice.taxRate,
            status: invoice.status,
            createdAt: invoice.createdAt,
        },
    };

    const { error } = await supabase
        .from('jobs')
        .update({ financials })
        .eq('id', ticketId);

    if (error) {
        console.error('Failed to save invoice to Supabase:', error);
        throw new Error(error.message ?? 'Invoice save failed');
    }

    // Also save locally for immediate access
    saveInvoice(invoice);
};

export const getInvoiceFromSupabase = async (ticketId: string): Promise<Invoice | null> => {
    if (!isSupabaseConfigured()) {
        return getInvoice(ticketId);
    }

    const { data, error } = await supabase
        .from('jobs')
        .select('financials')
        .eq('id', ticketId)
        .single();

    if (error || !data) return getInvoice(ticketId); // fall back to local

    const financials = data.financials as { invoice?: Omit<Invoice, 'ticketId' | 'shopId'>; subtotal?: number; tax?: number; total?: number } | null;
    if (!financials?.invoice) return getInvoice(ticketId); // No invoice in Supabase, try local

    const inv = financials.invoice;
    return {
        ticketId,
        shopId: '', // Will be filled by the component if needed
        items: inv.items ?? [],
        laborHours: inv.laborHours ?? 0,
        laborRate: inv.laborRate ?? 95,
        taxRate: inv.taxRate ?? 0.0825,
        status: inv.status ?? 'draft',
        createdAt: inv.createdAt ?? Date.now(),
    };
};
