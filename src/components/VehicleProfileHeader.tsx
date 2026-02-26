import React from 'react';

interface VehicleProfileHeaderProps {
    vehicle: string;
    customerName: string;
    ticketId: string;
    onBack: () => void;
    title?: string;
}

const VehicleProfileHeader: React.FC<VehicleProfileHeaderProps> = ({ vehicle, customerName, ticketId, onBack, title = "Ticket Details" }) => {
    return (
        <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="size-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                    <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                </button>
                <div className="flex items-center gap-4">
                    <div className="size-14 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center overflow-hidden shadow-2xl shadow-primary/10">
                        <span className="material-symbols-outlined text-primary text-3xl">directions_car</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter text-white">{title}</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{ticketId}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end">
                <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">{vehicle}</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">{customerName}</p>
            </div>
        </header>
    );
};

export default VehicleProfileHeader;
