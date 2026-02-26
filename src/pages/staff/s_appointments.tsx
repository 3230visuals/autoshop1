import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';
import { getAppointmentsByShop, addAppointment, checkInAppointment } from '../../utils/mockAppointments';

const S_Appointments: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useAppContext();
    const shopId = localStorage.getItem('activeShopId') || 'SHOP-01';
    const [showForm, setShowForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = useMemo(
        () => getAppointmentsByShop(shopId).filter((a) => a.date === todayStr),
        [shopId, todayStr, refreshKey]
    );

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

    const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = () => {
        if (!form.customerName || !form.phone || !form.time || !form.serviceType) {
            showToast('Name, phone, time, and service are required');
            return;
        }

        addAppointment({
            shopId,
            customerName: form.customerName,
            phone: form.phone,
            date: form.date || todayStr,
            time: form.time,
            serviceType: form.serviceType,
            vehicle: { year: form.vehicleYear, make: form.vehicleMake, model: form.vehicleModel, vin: form.vin },
            notes: form.notes,
        });

        showToast('Appointment saved');
        setForm({ customerName: '', phone: '', date: todayStr, time: '', serviceType: '', vehicleYear: '', vehicleMake: '', vehicleModel: '', vin: '', notes: '' });
        setShowForm(false);
        setRefreshKey((k) => k + 1);
    };

    const handleCheckIn = (appointmentId: string) => {
        const ticketId = checkInAppointment(shopId, appointmentId);
        if (!ticketId) return;
        showToast(`Checked in — Ticket ${ticketId} created`);
        setRefreshKey((k) => k + 1);
        navigate(`/s/ticket/${ticketId}`);
    };

    return (
        <div className="min-h-screen">
            <header className="px-6 pt-16 pb-10 bg-staff-hero-01 relative overflow-hidden border-b border-white/5">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Appointments</h1>
                <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.45em] ml-1">Shop Scheduler</p>
            </header>

            <div className="p-6 space-y-4">
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.25em] text-[11px]"
                >
                    {showForm ? 'Close Form' : 'New Appointment'}
                </button>

                {showForm && (
                    <div className="bg-card-dark border border-white/10 rounded-3xl p-5 space-y-3">
                        <input className="w-full h-12 rounded-xl bg-white/5 px-4" placeholder="Customer name" value={form.customerName} onChange={(e) => updateField('customerName', e.target.value)} />
                        <input className="w-full h-12 rounded-xl bg-white/5 px-4" placeholder="Phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                        <div className="grid grid-cols-2 gap-3">
                            <input className="h-12 rounded-xl bg-white/5 px-4" type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} />
                            <input className="h-12 rounded-xl bg-white/5 px-4" placeholder="10:00 AM" value={form.time} onChange={(e) => updateField('time', e.target.value)} />
                        </div>
                        <input className="w-full h-12 rounded-xl bg-white/5 px-4" placeholder="Service type" value={form.serviceType} onChange={(e) => updateField('serviceType', e.target.value)} />
                        <div className="grid grid-cols-3 gap-3">
                            <input className="h-12 rounded-xl bg-white/5 px-3" placeholder="Year" value={form.vehicleYear} onChange={(e) => updateField('vehicleYear', e.target.value)} />
                            <input className="h-12 rounded-xl bg-white/5 px-3" placeholder="Make" value={form.vehicleMake} onChange={(e) => updateField('vehicleMake', e.target.value)} />
                            <input className="h-12 rounded-xl bg-white/5 px-3" placeholder="Model" value={form.vehicleModel} onChange={(e) => updateField('vehicleModel', e.target.value)} />
                        </div>
                        <textarea className="w-full min-h-20 rounded-xl bg-white/5 p-4" placeholder="Notes" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
                        <button onClick={handleSave} className="w-full h-12 rounded-xl bg-primary font-bold">Save Appointment</button>
                    </div>
                )}

                <div className="space-y-3">
                    {todayAppointments.length === 0 && <p className="text-slate-500 text-sm">No appointments today.</p>}
                    {todayAppointments.map((apt) => (
                        <div key={apt.appointmentId} className="bg-card-dark border border-white/10 rounded-2xl p-4">
                            <div className="flex justify-between items-start gap-3">
                                <div>
                                    <p className="text-white font-bold">{apt.customerName}</p>
                                    <p className="text-slate-400 text-sm">{apt.time} • {apt.serviceType}</p>
                                    <p className="text-slate-500 text-xs">{apt.phone}</p>
                                </div>
                                <button
                                    disabled={apt.status === 'checked_in'}
                                    onClick={() => handleCheckIn(apt.appointmentId)}
                                    className="px-3 py-2 rounded-lg bg-primary disabled:bg-slate-700 text-xs font-bold"
                                >
                                    {apt.status === 'checked_in' ? 'Checked In' : 'Check In'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default S_Appointments;
