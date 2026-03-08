import React, { useEffect, useState } from 'react';
import type { VehicleRecall } from '../services/vehicleInsightsService';
import { vehicleInsightsService } from '../services/vehicleInsightsService';
import { motion, AnimatePresence } from 'framer-motion';

interface VehicleHealthCardProps {
    make: string;
    model: string;
    year: number | string;
}

const VehicleHealthCard: React.FC<VehicleHealthCardProps> = ({ make, model, year }) => {
    const [recalls, setRecalls] = useState<VehicleRecall[]>([]);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        let active = true;
        const fetchInsights = async () => {
            const recallData = await vehicleInsightsService.getRecalls(make, model, year.toString());
            if (active) setRecalls(recallData);
        };
        if (make && model && year) {
            void fetchInsights();
        }
        return () => { active = false; };
    }, [make, model, year]);

    const recommendations = vehicleInsightsService.getMaintenanceRecommendations(Number(year));
    const healthScore = recalls.length > 0 ? 85 : 98; // Simulated scoring

    return (
        <div className="mirror-card border-white/5 overflow-hidden">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className={`size-11 rounded-xl flex items-center justify-center border shadow-lg ${recalls.length > 0 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 animate-aura-pulse'}`}>
                            <span className="material-symbols-outlined text-[24px]">{recalls.length > 0 ? 'warning' : 'verified'}</span>
                        </div>
                        <div>
                            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500 leading-none">Vehicle Status</p>
                            <h4 className="text-[14px] font-black text-white mt-1 capitalize">{recalls.length > 0 ? 'Critical Attention' : 'Optimal Health'}</h4>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[18px] font-black text-white leading-none" style={{ fontFamily: 'var(--font-family-headings)' }}>{healthScore}%</p>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-1">Health Score</p>
                    </div>
                </div>

                {/* Recalls Indicator */}
                <div className={`px-3 py-2.5 rounded-xl border mb-4 flex items-center justify-between transition-all ${recalls.length > 0 ? 'bg-red-500/10 border-red-500/10 active-glow' : 'bg-white/5 border-white/5 opacity-60'}`}>
                    <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-sm ${recalls.length > 0 ? 'text-red-400' : 'text-slate-400'}`}>campaign</span>
                        <span className={`text-[11px] font-black uppercase tracking-wider ${recalls.length > 0 ? 'text-red-300' : 'text-slate-400'}`}>
                            {recalls.length} NHTSA Safety Recalls Found
                        </span>
                    </div>
                    {recalls.length > 0 && (
                        <button onClick={() => setExpanded(!expanded)} className="text-[11px] font-black uppercase tracking-widest text-red-400/80 underline">
                            {expanded ? 'Hide' : 'View Details'}
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-3 mb-4 max-h-[200px] overflow-y-auto no-scrollbar"
                        >
                            {recalls.slice(0, 3).map((r, i) => (
                                <div key={i} className="p-3 bg-red-950/20 border border-red-500/10 rounded-lg">
                                    <p className="text-[11px] font-black text-red-400 uppercase tracking-widest underline">{r.NHTSACampaignNumber}</p>
                                    <p className="text-[12px] font-bold text-white mt-1 leading-relaxed">{r.Summary.slice(0, 100)}...</p>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Maintenance Forecast */}
                <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-400/50 ml-1">Service Forecast</p>
                    <div className="grid grid-cols-2 gap-2">
                        {recommendations.slice(0, 4).map((rec, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-gradient-to-br from-white/5 to-transparent border border-white/5 rounded-lg">
                                <span className="size-1.5 rounded-full bg-orange-400/40" />
                                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide truncate">{rec}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">Verified via NHTSA vPIC</p>
                <div className="flex gap-1.5">
                    <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] depth-led" />
                    <div className="size-1.5 rounded-full bg-slate-700" />
                </div>
            </div>
        </div>
    );
};

export default VehicleHealthCard;
