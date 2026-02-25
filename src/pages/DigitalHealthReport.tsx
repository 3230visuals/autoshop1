import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { motion } from 'framer-motion';

/* ── VIN Decoder (NHTSA free API) ─────────────────────── */
interface DecodedVehicle {
    year: string;
    make: string;
    model: string;
    bodyClass: string;
}

const decodeVin = async (vin: string): Promise<DecodedVehicle | null> => {
    try {
        const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
        const data = await res.json();
        const get = (id: number) => data.Results?.find((r: { VariableId: number }) => r.VariableId === id)?.Value || '';
        return {
            year: get(29),
            make: get(26),
            model: get(28),
            bodyClass: get(5),
        };
    } catch {
        return null;
    }
};

/* ── Custom hook for VIN decoding ──────────────────── */
const useVinDecoder = (vin: string) => {
    const shouldDecode = vin.length >= 17;
    const [state, setState] = useState<{
        decoded: DecodedVehicle | null;
        decoding: boolean;
    }>({ decoded: null, decoding: shouldDecode });
    const hasRun = useRef(false);

    useEffect(() => {
        if (!shouldDecode || hasRun.current) return;
        hasRun.current = true;
        let cancelled = false;
        decodeVin(vin).then((result) => {
            if (!cancelled) setState({ decoded: result, decoding: false });
        });
        return () => { cancelled = true; };
    }, [vin, shouldDecode]);

    return state;
};

const CAR_SILHOUETTE = (
    <svg viewBox="0 0 400 160" fill="none" className="w-full h-full text-slate-800 opacity-60">
        <path d="M40 110C40 110 40 95 60 88C80 81 100 81 130 55C160 29 240 29 270 55C300 81 340 88 370 95C390 99 390 110 390 125C390 140 370 145 330 145L70 145C40 145 40 140 40 110Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="95" cy="145" r="20" stroke="currentColor" strokeWidth="2" />
        <circle cx="315" cy="145" r="20" stroke="currentColor" strokeWidth="2" />
        <path d="M140 65L260 65L275 90L130 90L140 65Z" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
    </svg>
);

const DigitalHealthReport = () => {
    const navigate = useNavigate();
    const { vehicle } = useAppContext();
    const [xray, setXray] = useState(false);
    const [activeMarker, setActiveMarker] = useState<string | null>(null);
    const { decoded } = useVinDecoder(vehicle.vin);

    const displayName = decoded?.year && decoded?.make && decoded?.model
        ? `${decoded.year} ${decoded.make} ${decoded.model}`
        : `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

    const diagnosticMarkers = [
        { id: 'engine', label: 'Engine Module', status: 'optimal', top: '55%', left: '28%' },
        { id: 'trans', label: 'Transmission', status: 'monitor', top: '55%', left: '50%' },
        { id: 'front-brakes', label: 'Front Rotors', status: 'optimal', top: '78%', left: '24%' },
        { id: 'rear-brakes', label: 'Rear Brakes', status: 'repair', top: '78%', left: '78%' },
    ];

    return (
        <div className="bg-[#0a0a0c] font-sans text-slate-300 min-h-screen pb-32">
            {/* Header Navigation */}
            <header className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md px-6 py-6 flex items-center justify-between border-b border-white/5 safe-top w-full">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center size-12 rounded-xl bg-white/2 border border-white/5 text-slate-500 hover:text-white transition-colors shrink-0"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </motion.button>
                <div className="flex flex-col items-center flex-1 mx-4 text-center">
                    <h1 className="text-[17px] font-black text-white uppercase tracking-tight italic leading-none">Vehicle Health Report</h1>
                    <span className="text-[11px] font-bold text-primary tracking-[0.3em] uppercase mt-2.5">Real-time Diagnostics</span>
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setXray(!xray)}
                    className={`flex items-center justify-center size-12 rounded-xl transition-all shrink-0 ${xray ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-white/2 text-slate-500 border border-white/5'}`}
                >
                    <span className="material-symbols-outlined text-2xl">{xray ? 'visibility' : 'filter_center_focus'}</span>
                </motion.button>
            </header>

            <main className="page-container relative z-10 px-6">
                {/* Vehicle Context & Score */}
                <section className="text-center space-y-4 py-12">
                    <h2 className="text-[32px] font-black text-white tracking-tighter uppercase leading-none italic">{displayName}</h2>
                    <p className="text-slate-600 text-[13px] font-bold tracking-[0.2em] uppercase">VIN: {vehicle.vin}</p>

                    <div className="pt-16 relative flex flex-col items-center">
                        <div className="relative size-64 flex items-center justify-center">
                            {/* Progress Ring (SVG) */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    className="text-white/[0.03]"
                                    cx="50%"
                                    cy="50%"
                                    fill="transparent"
                                    r="46"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <circle
                                    className="text-primary"
                                    cx="50%"
                                    cy="50%"
                                    fill="transparent"
                                    r="46"
                                    stroke="currentColor"
                                    strokeDasharray={2 * Math.PI * 46}
                                    strokeDashoffset={2 * Math.PI * 46 - (2 * Math.PI * 46 * vehicle.healthScore / 100)}
                                    strokeLinecap="round"
                                    strokeWidth="8"
                                />
                            </svg>
                            <div className="z-10 flex flex-col items-center justify-center text-center">
                                <span className="text-[84px] font-black block text-white leading-none tracking-tighter tabular-nums">{vehicle.healthScore}<span className="text-[20px] text-slate-600 ml-1 font-black opacity-40">/100</span></span>
                                <span className="text-[13px] text-slate-500 font-bold uppercase tracking-[0.25em] mt-4 block italic leading-none">Health Index</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* X-Ray Visualization */}
                <section className="relative flex justify-center mt-6">
                    <div className={`relative w-full rounded-2xl overflow-hidden glass-card transition-all duration-700 bg-white/[0.01] ${xray ? 'border-primary/30' : 'border-white/5'}`}>
                        <div className="relative w-full aspect-[16/9] bg-black/40 flex items-center justify-center p-8">
                            <div className={`w-full max-w-[80%] h-auto transition-all duration-700 ${xray ? 'brightness-150 scale-105' : 'opacity-80'}`}>
                                {CAR_SILHOUETTE}
                            </div>

                            {/* Scanning Line Animation */}
                            {xray && (
                                <motion.div
                                    initial={{ top: '0%' }}
                                    animate={{ top: '100%' }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-x-0 h-[1px] bg-primary/30 z-20 pointer-events-none"
                                />
                            )}

                            {/* Relative Diagnostic Markers */}
                            {diagnosticMarkers.map((marker) => (
                                <div
                                    key={marker.id}
                                    className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
                                    style={{ top: marker.top, left: marker.left }}
                                >
                                    <button
                                        onClick={() => setActiveMarker(activeMarker === marker.id ? null : marker.id)}
                                        className={`size-4 rounded-full border-2 border-background-dark shadow-lg transition-transform active:scale-90 ${marker.status === 'optimal' ? 'bg-emerald-500 shadow-emerald-500/20' :
                                            marker.status === 'monitor' ? 'bg-amber-500 shadow-amber-500/20' :
                                                'bg-red-500 shadow-red-500/20'
                                            }`}
                                    />

                                    {/* Tooltip */}
                                    {activeMarker === marker.id && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap shadow-2xl z-40 border border-white/10"
                                        >
                                            {marker.label}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Summary Legend */}
                        <div className="flex items-center justify-center gap-10 py-5 bg-white/2 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Repair</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Monitor</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Optimal</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Maintenance Roadmap */}
                <section className="space-y-6 pt-12">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-700 px-1 italic">Service Milestones</h3>
                    <div className="glass-card p-10 rounded-[2rem] border border-white/2">
                        <div className="timeline-neutral px-1 space-y-16">
                            <div className="timeline-line bg-white/5 left-[7px] top-2 bottom-2"></div>

                            <div className="timeline-step">
                                <div className="timeline-dot bg-red-500 border-background-dark size-4 -left-[6px] shadow-[0_0_0_8px_rgba(239,68,68,0.1)]"></div>
                                <div className="timeline-content flex-1 pl-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[17px] font-black uppercase tracking-tight text-white leading-none italic">Brake Cycle</p>
                                        <span className="text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 shrink-0 ml-4 leading-none">Critical</span>
                                    </div>
                                    <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest mt-4 opacity-80 leading-relaxed">Full Pad Replacement & Subsystem Flush</p>
                                </div>
                            </div>

                            <div className="timeline-step">
                                <div className="timeline-dot bg-amber-500 border-background-dark size-4 -left-[6px] shadow-[0_0_0_8px_rgba(245,158,11,0.1)]"></div>
                                <div className="timeline-content flex-1 pl-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[17px] font-black uppercase tracking-tight text-slate-400 leading-none italic">Standard 02</p>
                                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest shrink-0 ml-4 leading-none tabular-nums">6k Mi</span>
                                    </div>
                                    <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest mt-4 opacity-80 leading-relaxed">Primary Module Diagnostic Inspection</p>
                                </div>
                            </div>

                            <div className="timeline-step opacity-30">
                                <div className="timeline-dot bg-slate-800 border-background-dark size-4 -left-[6px]"></div>
                                <div className="timeline-content flex-1 pl-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[17px] font-black uppercase tracking-tight text-slate-700 leading-none italic">Calibration</p>
                                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest shrink-0 ml-4 leading-none tabular-nums">12k Mi</span>
                                    </div>
                                    <p className="text-[13px] text-slate-800 font-bold uppercase tracking-widest mt-4">Full Drivetrain Stress Analysis</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Diagnostic Cards */}
                <section className="space-y-5 pt-10">
                    {/* Critical Issue */}
                    <div className="glass-card p-6 space-y-8 border-l-[4px] border-l-red-500 rounded-2xl bg-white/[0.01]">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-5">
                                <div className="size-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-red-400 text-3xl">warning</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[17px] font-bold text-white uppercase tracking-tight">Rear Brake Subsystem</h3>
                                    <div className="status-indicator status-red mt-2.5 inline-flex scale-110 origin-left">
                                        <div className="status-dot"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Terminal Point</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-[14px] leading-relaxed text-slate-500 font-bold uppercase tracking-tight opacity-90">Attention required. Brake pads are dangerously low. Fix immediately to ensure safety.</p>
                        <motion.button
                            onClick={() => navigate('/approve')}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-[64px] bg-primary text-white font-bold text-[13px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-4 shadow-2xl shadow-primary/30"
                        >
                            Approve Fix
                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                        </motion.button>
                    </div>

                    {/* Monitor Issue */}
                    <div className="glass-card p-7 border-l-[4px] border-l-amber-500 rounded-2xl bg-white/[0.01]">
                        <div className="flex items-start gap-6">
                            <div className="size-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-amber-500 text-3xl">visibility</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[17px] font-bold text-white uppercase tracking-tight">Environmental Filtration</h3>
                                <div className="status-indicator status-yellow mt-2.5 inline-flex scale-110 origin-left">
                                    <div className="status-dot"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Monitoring</span>
                                </div>
                                <p className="text-[13px] text-slate-500 font-bold mt-4 uppercase tracking-widest leading-relaxed opacity-80">Minor debris occlusion. Flagged for secondary inspection cycle.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technician Notes */}
                <section className="space-y-5 pt-8 pb-32 mt-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-700 px-1">Technician Notes</h3>
                    <div className="glass-card p-8 rounded-2xl bg-white/[0.01]">
                        <p className="text-[15px] text-slate-400 leading-[1.85] font-bold italic border-l-2 border-white/5 pl-6 opacity-90">
                            "System telemetry indicates stable performance. Identified wear on rear brake pads during physical verification. Immediate resolution is advised to maintain safety protocols. All other modules operating within optimal parameters."
                        </p>
                        <div className="flex items-center gap-5 mt-10 pt-8 border-t border-white/5 w-full">
                            <div className="size-14 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center text-[15px] font-black text-slate-500 uppercase tracking-[0.2em] shrink-0">
                                MS
                            </div>
                            <div className="min-w-0">
                                <p className="text-[16px] font-bold text-white uppercase tracking-tight truncate">Marcus Steiner</p>
                                <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest mt-1.5">Lead Technician</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default DigitalHealthReport;
