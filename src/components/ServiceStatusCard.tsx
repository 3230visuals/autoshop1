import { useAppContext } from '../context/useAppContext';
import type { ServiceStatus } from '../context/AppTypes';

const STATUSES: { key: ServiceStatus; label: string; icon: string; color: string; bg: string; border: string }[] = [
    { key: 'waiting', label: 'Waiting', icon: 'schedule', color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    { key: 'in_progress', label: 'Processing', icon: 'build_circle', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
    { key: 'ready', label: 'Ready', icon: 'notifications', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
    { key: 'done', label: 'Completed', icon: 'check_circle', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
];

const ServiceStatusCard = () => {
    const { serviceStatus, setServiceStatus, showToast, vehicle } = useAppContext();

    const current = STATUSES.find(s => s.key === serviceStatus) ?? STATUSES[1];

    const handleSet = (status: ServiceStatus) => {
        setServiceStatus(status);
        const label = STATUSES.find(s => s.key === status)?.label ?? status;
        showToast(`Status updated: ${label}`);
    };

    return (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/5">
                <div className={`size-8 rounded-lg ${current.bg} ${current.border} border flex items-center justify-center flex-shrink-0`}>
                    <span className={`material-symbols-outlined ${current.color} text-base`}>{current.icon}</span>
                </div>
                <div className="flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Service Telemetry</p>
                    <p className={`text-xs font-bold text-slate-200`}>{vehicle.year} {vehicle.make} {vehicle.model} — <span className={current.color}>{current.label}</span></p>
                </div>
            </div>

            {/* One-tap status buttons */}
            <div className="grid grid-cols-4 gap-2 p-3">
                {STATUSES.map((s) => {
                    const isActive = serviceStatus === s.key;
                    return (
                        <button
                            key={s.key}
                            onClick={() => handleSet(s.key)}
                            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${isActive
                                ? `${s.bg} ${s.border} ${s.color}`
                                : 'bg-white/5 border-white/5 text-slate-600 hover:text-slate-400'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[20px]`}>
                                {s.icon}
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-widest leading-none">{s.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ServiceStatusCard;
