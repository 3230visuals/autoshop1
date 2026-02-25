// Invoice PDF generator using jsPDF
// Usage: generateInvoice(order, vehicle) → triggers download

import type {  } from '../context/AppTypes';
import type {  } from '../context/AppTypes';

export const generateInvoice = async (order: OrderState, vehicle: Vehicle) => {
    // Dynamically import to avoid increasing initial bundle size
    const { default: jsPDF } = await import('jspdf');

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 20;
    const col2 = 140;

    // ── Colors ─────────────────────────────────
    const orange: [number, number, number] = [255, 119, 0];
    const dark: [number, number, number] = [15, 15, 15];
    const mid: [number, number, number] = [100, 100, 100];
    const light: [number, number, number] = [230, 230, 230];

    // ── Header bar ─────────────────────────────
    doc.setFillColor(...orange);
    doc.rect(0, 0, pageW, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AUTO SHOP', margin, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Service Invoice', margin, 19);
    doc.text(`Order #${order.orderNumber}`, pageW - margin, 12, { align: 'right' });
    doc.text(`Date: ${order.paidDate || new Date().toLocaleDateString()}`, pageW - margin, 19, { align: 'right' });

    // ── Vehicle info ────────────────────────────
    let y = 38;
    doc.setTextColor(...dark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('VEHICLE', margin, y);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mid);
    y += 6;
    doc.text(vehicle.name, margin, y);
    y += 5;
    doc.text(`VIN: ${vehicle.vin}`, margin, y);
    y += 5;
    doc.text(`Tag: ${vehicle.tag}`, margin, y);

    // ── Services table ───────────────────────────
    y += 12;
    doc.setFillColor(...light);
    doc.rect(margin, y - 5, pageW - margin * 2, 8, 'F');

    doc.setTextColor(...dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICE', margin + 2, y);
    doc.text('PRICE', col2, y, { align: 'right' });

    y += 4;
    doc.setDrawColor(...light);
    doc.line(margin, y, pageW - margin, y);

    order.approvedItems.forEach((item) => {
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...mid);
        doc.text(item.name, margin + 2, y);
        doc.setTextColor(...dark);
        doc.text(`$${item.price.toFixed(2)}`, col2, y, { align: 'right' });
        doc.setDrawColor(240, 240, 240);
        doc.line(margin, y + 2, pageW - margin, y + 2);
    });

    // ── Totals ───────────────────────────────────
    y += 12;
    const rows = [
        { label: 'Subtotal', value: `$${order.subtotal.toFixed(2)}`, bold: false },
        { label: 'Tax (8%)', value: `$${order.tax.toFixed(2)}`, bold: false },
        ...(order.tipAmount > 0 ? [{ label: `Tip (${order.tipPercent}%)`, value: `$${order.tipAmount.toFixed(2)}`, bold: false }] : []),
        { label: 'TOTAL', value: `$${order.total.toFixed(2)}`, bold: true },
    ];

    const setColor = (rgb: [number, number, number]) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);

    rows.forEach((row) => {
        doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
        doc.setFontSize(row.bold ? 11 : 9);
        setColor(row.bold ? orange : mid);
        doc.text(row.label, col2 - 30, y);
        doc.text(row.value, col2, y, { align: 'right' });
        y += row.bold ? 8 : 6;
    });

    // ── Payment method ───────────────────────────
    y += 4;
    doc.setFillColor(255, 245, 230);
    doc.rect(margin, y - 4, pageW - margin * 2, 12, 'F');
    doc.setTextColor(...orange);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`PAID via ${order.paymentMethod || 'Credit Card'}`, margin + 4, y + 3);

    // ── Footer ────────────────────────────────────
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mid);
    doc.text('Thank you for choosing us! Questions? Contact us at shop@autoshop.com', pageW / 2, 285, { align: 'center' });

    // ── Download ─────────────────────────────────
    doc.save(`invoice-${order.orderNumber}.pdf`);
};
