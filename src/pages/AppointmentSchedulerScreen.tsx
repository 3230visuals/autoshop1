import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { motion } from 'framer-motion';

type ApptStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

interface Appointment {
    id: string;
    clientName: string;
    phone: string;
    vehicle: string;
    services: string[];
    date: string;    // 'YYYY-MM-DD'
    time: string;    // 'HH:MM'
    duration: number; // minutes
    status: ApptStatus;
    notes: string;
}

const APPT_STATUS: Record<ApptStatus, { label: string; icon: string; color: string; bg: string; border: string }> = {
    scheduled: { label: 'Scheduled', icon: 'calendar_month', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    confirmed: { label: 'Confirmed', icon: 'event_available', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    completed: { label: 'Completed', icon: 'check_circle', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    cancelled: { label: 'Cancelled', icon: 'cancel', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
};

const TODAY = new Date().toISOString().split('T')[0];
const FMT_DATE = (d: string) => {
    const dt = new Date(d + 'T00:00');
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};
const FMT_TIME = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const SEED_APPTS: Appointment[] = [
    { id: 'a1', clientName: 'Alex Rivera', phone: '(555) 101-2020', vehicle: '2022 BMW M3', services: ['Full Brake Service'], date: TODAY, time: '09:00', duration: 120, status: 'confirmed', notes: 'Customer prefers synthetic oil' },
    { id: 'a2', clientName: 'Jordan Lee', phone: '(555) 303-4040', vehicle: '2019 Ford F-150', services: ['Engine Diagnostics'], date: TODAY, time: '11:30', duration: 90, status: 'scheduled', notes: '' },
    { id: 'a3', clientName: 'Morgan Chen', phone: '(555) 505-6060', vehicle: '2021 Tesla Model 3', services: ['Tire Rotation'], date: TODAY, time: '14:00', duration: 60, status: 'completed', notes: 'Repeat customer' },
    { id: 'a4', clientName: 'Jamie Santos', phone: '(555) 707-8080', vehicle: '2023 Lexus IS500', services: ['Oil Change', 'Filter'], date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })(), time: '10:00', duration: 75, status: 'scheduled', notes: '' },
];

const AppointmentSchedulerScreen = () => {
    const navigate = useNavigate();
    const { showToast } = useAppContext();
    const [appts, setAppts] = useState<Appointment[]>(SEED_APPTS);
    const [selectedDate, setSelectedDate] = useState(TODAY);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAppt, setNewAppt] = useState({
        clientName: '', phone: '', vehicle: '', services: '',
        date: TODAY, time: '09:00', duration: '60', notes: '',
    });

    const updateStatus = (id: string, status: ApptStatus) => {
        setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        showToast(`Appointment ${APPT_STATUS[status].label}`);
    };

    const addAppt = () => {
        if (!newAppt.clientName.trim() || !newAppt.vehicle.trim()) {
            showToast('Name and vehicle are required');
            return;
        }
        setAppts(prev => [...prev, {
            id: `a${Date.now()}`,
            clientName: newAppt.clientName,
            phone: newAppt.phone,
            vehicle: newAppt.vehicle,
            services: newAppt.services.split(',').map(s => s.trim()).filter(Boolean),
            date: newAppt.date,
            time: newAppt.time,
            duration: parseInt(newAppt.duration) || 60,
            status: 'scheduled',
            notes: newAppt.notes,
        }]);
        setNewAppt({ clientName: '', phone: '', vehicle: '', services: '', date: TODAY, time: '09:00', duration: '60', notes: '' });
        setShowAddForm(false);
        showToast('Appointment booked!');
    };

    // Build a 7-day date tabs
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    });

    const dayAppts = appts.filter(a => a.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
    const totalDayCount = dayAppts.length;
    const completedDayCount = dayAppts.filter(a => a.status === 'completed').length;
    const progressPercent = totalDayCount > 0 ? (completedDayCount / totalDayCount) * 100 : 0;

    const dayLabel = (d: string) => {
        const dt = new Date(d + 'T00:00');
        return { day: dt.toLocaleDateString('en-US', { weekday: 'short' }), num: dt.getDate() };
    };

    return (
        <div className="bg-zinc-950 text-slate-100 min-h-screen flex flex-col font-body pb-32">
            {/* Ambient Background Glows */}
            <div className="glow-mesh top-[-100px] left-[-100px] opacity-20" />
            <div className="glow-mesh bottom-[-100px] right-[-100px] opacity-10" />

            <header className="sticky top-0 z-50 bg-zinc-950/40 backdrop-blur-xl border-b border-white/5 px-5 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 transition-colors active:scale-90 premium-press">
                        <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="font-display text-xl font-black italic glass-text">Appointments</h1>
                        <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-black mt-0.5">{dayAppts.length} scheduled</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="size-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center premium-press shadow-lg shadow-primary/5 group"
                >
                    <span className="material-symbols-outlined text-primary text-[24px] group-hover:rotate-90 transition-transform">{showAddForm ? 'close' : 'add'}</span>
                </button>
            </header>

            {/* Daily Progress Bar */}
            <div className="px-5 py-6">
                <div className="liquid-glass rounded-[2rem] border border-white/5 p-6 shadow-2xl relative overflow-hidden bg-white/[0.01]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.25em] mb-1">Operational Progress</p>
                            <h2 className="text-[17px] font-black text-white italic tracking-tight leading-none uppercase">Day Cycle</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-1">{completedDayCount} / {totalDayCount} COMPLETED</p>
                            <p className="text-[18px] font-black text-white italic tabular-nums leading-none">{Math.round(progressPercent)}%</p>
                        </div>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] bg-gradient-to-r from-primary to-blue-400"
                        />
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-[-20px] right-[-20px] size-24 bg-primary/5 rounded-full blur-3xl -z-10" />
                </div>
            </div>

            {/* 7-day scroll */}
            <div className="px-5 py-4 flex gap-3 overflow-x-auto scrollbar-hide border-b border-white/5">
                {days.map(d => {
                    const { day, num } = dayLabel(d);
                    const cnt = appts.filter(a => a.date === d).length;
                    const isSelected = d === selectedDate;
                    return (
                        <button
                            key={d}
                            onClick={() => setSelectedDate(d)}
                            className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border transition-all premium-press ${isSelected ? 'bg-primary/15 border-primary/30 text-primary shadow-lg shadow-primary/5' : 'bg-zinc-900 border-white/5 text-slate-600 hover:text-slate-300'}`}
                        >
                            <span className="text-[9px] font-black uppercase tracking-widest">{day}</span>
                            <span className={`text-xl font-black font-display italic ${isSelected ? 'text-primary' : 'text-slate-300'}`}>{num}</span>
                            {cnt > 0 && <span className={`size-1 rounded-full ${isSelected ? 'bg-primary animate-pulse' : 'bg-zinc-700'}`} />}
                        </button>
                    );
                })}
            </div>

            {/* Add form */}
            {showAddForm && (
                <div className="mx-5 mt-4 liquid-glass rounded-3xl border border-primary/20 p-6 space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-500">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Schedule New Appointment</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: 'clientName', placeholder: 'Client name *' },
                            { key: 'phone', placeholder: 'Phone' },
                            { key: 'vehicle', placeholder: 'Vehicle Specs *' },
                            { key: 'services', placeholder: 'Services (comma-sep)' },
                            { key: 'date', placeholder: '', type: 'date' },
                            { key: 'time', placeholder: '', type: 'time' },
                            { key: 'duration', placeholder: 'Duration (m)' },
                            { key: 'notes', placeholder: 'Notes' },
                        ].map(f => (
                            <input
                                key={f.key}
                                type={f.type || 'text'}
                                placeholder={f.placeholder}
                                value={(newAppt as Record<string, string>)[f.key]}
                                onChange={e => setNewAppt(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-slate-700 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all shadow-inner"
                            />
                        ))}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={addAppt} className="flex-1 py-4 bg-primary text-zinc-950 font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/30 premium-press">CONFIRM BOOKING</button>
                        <button onClick={() => setShowAddForm(false)} className="px-6 py-4 border border-white/5 bg-zinc-800 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl premium-press">CANCEL</button>
                    </div>
                </div>
            )}

            {/* Appointment cards for selected day */}
            <div className="flex-1 px-5 mt-5 space-y-5">
                {dayAppts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                        <div className="size-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-600 text-[40px]">calendar_month</span>
                        </div>
                        <p className="text-slate-500 text-[13px] font-bold">No appointments scheduled for {FMT_DATE(selectedDate)}</p>
                        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary/20 transition-all">
                            <span className="material-symbols-outlined text-[16px]">add</span> BOOK NEW
                        </button>
                    </div>
                )}
                {dayAppts.map(appt => {
                    const as = APPT_STATUS[appt.status];
                    return (
                        <div key={appt.id} className="liquid-glass rounded-3xl border border-white/5 overflow-hidden group hover:border-white/15 transition-all shadow-xl">
                            <div className="p-6">
                                {/* Time + status row */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <span className={`size-11 rounded-2xl ${as.bg} ${as.border} border flex items-center justify-center shadow-lg`}>
                                            <span className={`material-symbols-outlined ${as.color} text-[22px]`}>{as.icon}</span>
                                        </span>
                                        <div>
                                            <p className="text-[17px] font-black text-white italic glass-text">{FMT_TIME(appt.time)}</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{appt.duration} MIN DURATION</p>
                                        </div>
                                    </div>
                                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${as.bg} ${as.border} ${as.color} shadow-sm`}>{as.label}</span>
                                </div>

                                {/* Client + vehicle */}
                                <div className="space-y-1 mb-4">
                                    <p className="font-black text-[16px] text-white italic">{appt.clientName}</p>
                                    <p className="text-[11px] font-black text-primary/80 uppercase tracking-[0.2em]">{appt.vehicle}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {appt.services.map(s => (
                                        <span key={s} className="text-[9px] bg-white/5 border border-white/5 text-slate-400 font-black uppercase tracking-widest px-3 py-1.5 rounded-full">{s}</span>
                                    ))}
                                </div>

                                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-4 border-t border-white/5">
                                    {appt.phone && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">phone</span>{appt.phone}</span>}
                                    {appt.notes && <span className="italic truncate flex-1 text-right text-slate-600">"{appt.notes}"</span>}
                                </div>
                            </div>

                            {/* Quick action buttons */}
                            {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                                <div className="flex border-t border-white/5 bg-zinc-950/20">
                                    {appt.status === 'scheduled' && (
                                        <button onClick={() => updateStatus(appt.id, 'confirmed')} className="flex-1 flex items-center justify-center gap-2 py-4 hover:bg-primary/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary premium-press">
                                            <span className="material-symbols-outlined text-primary text-[18px]">event_available</span>CONFIRM
                                        </button>
                                    )}
                                    {(appt.status === 'confirmed' || appt.status === 'scheduled') && (
                                        <button onClick={() => updateStatus(appt.id, 'completed')} className="flex-1 flex items-center justify-center gap-2 py-4 hover:bg-emerald-500/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-400 premium-press border-l border-white/5">
                                            <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>COMPLETE
                                        </button>
                                    )}
                                    <button onClick={() => updateStatus(appt.id, 'cancelled')} className="px-6 flex items-center justify-center gap-2 py-4 hover:bg-red-500/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-red-400 premium-press border-l border-white/5">
                                        <span className="material-symbols-outlined text-red-500 text-[18px]">cancel</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AppointmentSchedulerScreen;
