import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/useJobs';
import { useAuth } from '../../context/useAuth';
import { getAppointmentsByShop, addAppointment, checkInAppointment } from '../../utils/mockAppointments';

const S_Appointments: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useJobs();
    const { staffUser } = useAuth();
    const shopId = staffUser?.shopId ?? '';
    const [showForm, setShowForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Use LOCAL date, not UTC — toISOString() returns UTC which shifts after 6PM CST
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const allAppointments = useMemo(
        () => getAppointmentsByShop(shopId),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [shopId, refreshKey]
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
        void navigate(`/s/ticket/${ticketId}`);
    };

    return (
        <div className="min-h-screen">
            <header className="px-6 pt-10 pb-10 bg-staff-hero-01 relative overflow-hidden border-b border-white/5 text-center safe-top">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Appointments</h1>
                <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.45em] mt-2">Shop Scheduler</p>
            </header>

            <div className="p-6 space-y-4">
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className={`w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.25em] text-[11px] transition-all active:scale-[0.98] border border-white/20 shadow-lg ${!showForm ? 'ring-2 ring-primary/20 ring-offset-4 ring-offset-[#0a0a0c]' : ''}`}
                >
                    {showForm ? 'Close Form' : 'New Appointment'}
                </button>

                {showForm && (
                    <div className="bg-card-dark border border-white/10 rounded-3xl p-5 space-y-3">
                        <input aria-label="Customer name" className="w-full h-12 rounded-xl bg-white/5 px-4 text-white placeholder:text-slate-600" placeholder="Customer name" value={form.customerName} onChange={(e) => updateField('customerName', e.target.value)} />
                        <input aria-label="Phone" className="w-full h-12 rounded-xl bg-white/5 px-4 text-white placeholder:text-slate-600" placeholder="Phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                        <div className="grid grid-cols-2 gap-3">
                            <input aria-label="Date" className="h-12 rounded-xl bg-white/5 px-4 text-white" type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} />
                            <input aria-label="Time" className="h-12 rounded-xl bg-white/5 px-4 text-white placeholder:text-slate-600" placeholder="10:00 AM" value={form.time} onChange={(e) => updateField('time', e.target.value)} />
                        </div>
                        <input aria-label="Service type" className="w-full h-12 rounded-xl bg-white/5 px-4 text-white placeholder:text-slate-600" placeholder="Service type" value={form.serviceType} onChange={(e) => updateField('serviceType', e.target.value)} />
                        <div className="grid grid-cols-3 gap-3">
                            <input aria-label="Vehicle Year" className="h-12 rounded-xl bg-white/5 px-3 text-white placeholder:text-slate-600" placeholder="Year" value={form.vehicleYear} onChange={(e) => updateField('vehicleYear', e.target.value)} />
                            <input aria-label="Vehicle Make" className="h-12 rounded-xl bg-white/5 px-3 text-white placeholder:text-slate-600" placeholder="Make" value={form.vehicleMake} onChange={(e) => updateField('vehicleMake', e.target.value)} />
                            <input aria-label="Vehicle Model" className="h-12 rounded-xl bg-white/5 px-3 text-white placeholder:text-slate-600" placeholder="Model" value={form.vehicleModel} onChange={(e) => updateField('vehicleModel', e.target.value)} />
                        </div>
                        <textarea aria-label="Notes" className="w-full min-h-20 rounded-xl bg-white/5 p-4 text-white placeholder:text-slate-600" placeholder="Notes" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
                        <button onClick={handleSave} className="w-full h-12 rounded-xl bg-primary font-bold text-white">Save Appointment</button>
                    </div>
                )}

                <div className="space-y-3">
                    {allAppointments.length === 0 && <p className="text-slate-500 text-sm">No appointments.</p>}
                    {allAppointments.map((apt) => (
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
