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

export const getInvoice = (ticketId: string): Invoice | null => {
    try {
        const raw = localStorage.getItem(`invoice:${ticketId}`);
        return raw ? (JSON.parse(raw) as Invoice) : null;
    } catch { return null; }
};

export const saveInvoice = (invoice: Invoice) => {
    localStorage.setItem(`invoice:${invoice.ticketId}`, JSON.stringify(invoice));
};
