import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';
import { useAuth } from '../../context/AuthContext';
import {
    appointments,
    addAppointment,
    checkInAppointment,
} from '../../utils/mockAppointments';
import type { Appointment } from '../../utils/mockAppointments';

/* ═══════════════════════════════════════════════════
   Staff Appointments Page — /s/appointments
   ═══════════════════════════════════════════════════ */

const S_Appointments: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useAppContext();
    const { staffUser } = useAuth();
    const [, forceUpdate] = useState(0);
    const rerender = useCallback(() => forceUpdate(n => n + 1), []);

    const [showForm, setShowForm] = useState(false);

    // Filter for this shop only
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(
        a => a.shopId === staffUser?.shopId && a.date === todayStr
    );

    /* ── Check-In Handler ─────────────────── */
    const handleCheckIn = (apt: Appointment) => {
        const ticketId = checkInAppointment(apt.appointmentId);
        if (ticketId) {
            showToast(`Checked in — Ticket ${ticketId} created`);
            navigate(`/s/ticket/${ticketId}`);
        }
    };

    /* ── Form State ─────────────────────── */
    const [form, setForm] = useState({
        customerName: '',
        phone: '',
        date: todayStr,
        time: '',
        serviceType: '',
        vehicleYear: '',
        vehicleMake: '',
        vehicleModel: '',
        vin: '',
        notes: '',
    });

    const updateField = (field: string, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSave = () => {
        if (!form.customerName || !form.time || !form.serviceType) return;
        addAppointment({
            shopId: staffUser?.shopId || 'SHOP-01',
            customerName: form.customerName,
            phone: form.phone,
            date: form.date || todayStr,
            time: form.time,
            serviceType: form.serviceType,
            vehicle: {
                year: form.vehicleYear,
                make: form.vehicleMake,
                model: form.vehicleModel,
                vin: form.vin,
            },
            notes: form.notes,
        });
        showToast('Appointment saved');
        setForm({
            customerName: '', phone: '', date: todayStr, time: '',
            serviceType: '', vehicleYear: '', vehicleMake: '', vehicleModel: '', vin: '', notes: '',
        });
        setShowForm(false);
        rerender();
    };

    return (
        <div className="min-h-screen">
            {/* ═══════ Header ═══════ */}
            <header className="px-6 pt-16 pb-12 bg-staff-hero-01 relative overflow-hidden border-b border-white/5">
                <div className="hero-overlay absolute inset-0 z-10" />
                <div className="relative z-20">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Appointments</h1>
                        <div className="size-12 bg-primary/10 backdrop-blur-md rounded-2xl border border-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary font-bold">calendar_month</span>
                        </div>
                    </div>
                    <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.5em] ml-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </header>

            {/* ═══════ Today's List ═══════ */}
            <div className="p-6 space-y-4">
                {todayAppointments.length === 0 && (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-5xl text-slate-700 mb-4 block">event_busy</span>
                        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">No appointments today</p>
                    </div>
                )}

                {todayAppointments.map((apt) => (
                    <div
                        key={apt.appointmentId}
                        className="bg-card-dark border border-white/5 rounded-3xl p-6 relative overflow-hidden group"
                    >
                        {/* Status indicator */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${apt.status === 'checked_in' ? 'bg-emerald-500' : 'bg-primary/30'}`} />

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">{apt.customerName}</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-0.5">
                                    {apt.vehicle.year} {apt.vehicle.make} {apt.vehicle.model}
                                </p>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${apt.status === 'checked_in'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-primary/10 border-primary/20 text-primary'
                                }`}>
                                <span className={`size-1.5 rounded-full ${apt.status === 'checked_in' ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} />
                                {apt.status === 'checked_in' ? 'Checked In' : 'Scheduled'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-600 text-lg">schedule</span>
                                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{apt.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-600 text-lg">build</span>
                                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{apt.serviceType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-600 text-lg">phone</span>
                                <span className="text-[11px] font-bold text-slate-400 tracking-wider">{apt.phone}</span>
                            </div>
                            {apt.linkedTicketId && (
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-lg">confirmation_number</span>
                                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">{apt.linkedTicketId}</span>
                                </div>
                            )}
                        </div>

                        {apt.notes && (
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4 border-t border-white/5 pt-3">{apt.notes}</p>
                        )}

                        {apt.status === 'scheduled' && (
                            <button
                                onClick={() => handleCheckIn(apt)}
                                className="w-full h-12 bg-primary text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_12px_30px_var(--primary-muted)] active:scale-[0.97] hover:bg-primary/90 transition-all"
                            >
                                <span className="material-symbols-outlined text-xl">login</span>
                                Check In
                            </button>
                        )}

                        {apt.status === 'checked_in' && apt.linkedTicketId && (
                            <button
                                onClick={() => navigate(`/s/ticket/${apt.linkedTicketId}`)}
                                className="w-full h-12 bg-white/5 text-slate-300 border border-white/10 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                            >
                                <span className="material-symbols-outlined text-xl">visibility</span>
                                View Ticket
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* ═══════ FAB ═══════ */}
            <button
                onClick={() => setShowForm(true)}
                className="fixed bottom-24 right-6 size-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 z-20 active:scale-95 transition-all"
            >
                <span className="material-symbols-outlined text-white text-3xl font-bold">add</span>
            </button>

            {/* ═══════ New Appointment Form (Overlay) ═══════ */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="relative w-full max-w-[430px] bg-[#0e0e10] border-t border-white/10 rounded-t-[2rem] p-6 pb-10 max-h-[85vh] overflow-y-auto animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">New Appointment</h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="size-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-slate-400">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <FormField label="Customer Name" value={form.customerName} onChange={v => updateField('customerName', v)} placeholder="James Wilson" />
                            <FormField label="Phone" value={form.phone} onChange={v => updateField('phone', v)} placeholder="(555) 123-4567" type="tel" />

                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="Date" value={form.date} onChange={v => updateField('date', v)} type="date" />
                                <FormField label="Time" value={form.time} onChange={v => updateField('time', v)} placeholder="10:00 AM" />
                            </div>

                            <FormField label="Service Type" value={form.serviceType} onChange={v => updateField('serviceType', v)} placeholder="Oil Change, Brake Insp." />

                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mt-2 ml-1">Vehicle Details</p>
                            <div className="grid grid-cols-3 gap-3">
                                <FormField label="Year" value={form.vehicleYear} onChange={v => updateField('vehicleYear', v)} placeholder="2024" />
                                <FormField label="Make" value={form.vehicleMake} onChange={v => updateField('vehicleMake', v)} placeholder="Honda" />
                                <FormField label="Model" value={form.vehicleModel} onChange={v => updateField('vehicleModel', v)} placeholder="Civic" />
                            </div>
                            <FormField label="VIN (Optional)" value={form.vin} onChange={v => updateField('vin', v)} placeholder="17-Digit VIN" />

                            <FormField label="Notes" value={form.notes} onChange={v => updateField('notes', v)} placeholder="Optional details" />

                            <button
                                onClick={handleSave}
                                disabled={!form.customerName || !form.time || !form.serviceType}
                                className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-3 shadow-[0_20px_40px_var(--primary-muted)] active:scale-[0.97] hover:bg-primary/90 transition-all disabled:opacity-40 disabled:pointer-events-none mt-2"
                            >
                                <span className="material-symbols-outlined text-xl">save</span>
                                Save Appointment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── Reusable Form Field ─────────────────── */
interface FormFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1.5 ml-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold text-[12px] uppercase tracking-wider placeholder:text-slate-700 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
        />
    </div>
);

export default S_Appointments;
