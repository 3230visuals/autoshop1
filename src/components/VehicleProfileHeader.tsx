import React from 'react';

interface VehicleProfileHeaderProps {
    vehicle: string;
    customerName: string;
    ticketId: string;
    onBack: () => void;
    title?: string;
    vehicleImage?: string;
}

const VehicleProfileHeader: React.FC<VehicleProfileHeaderProps> = ({ vehicle, customerName, ticketId, onBack, title = "Ticket Details", vehicleImage }) => {
    return (
        <header className="flex items-start gap-3 mb-4">
            <button onClick={onBack} className="size-11 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95 shrink-0">
                <span className="material-symbols-outlined text-slate-400">arrow_back</span>
            </button>
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="size-12 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center overflow-hidden shadow-2xl shadow-primary/10 shrink-0">
                    {vehicleImage ? (
                        <img src={vehicleImage} alt={vehicle} className="w-full h-full object-cover" />
                    ) : (
                        <span className="material-symbols-outlined text-primary text-2xl">directions_car</span>
                    )}
                </div>
                <div className="min-w-0">
                    <h1 className="text-lg font-black uppercase tracking-tighter text-white leading-tight truncate">{title}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{ticketId}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest truncate">{vehicle}</span>
                    </div>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.15em] mt-0.5 truncate">{customerName}</p>
                </div>
            </div>
        </header>
    );
};

export default VehicleProfileHeader;
