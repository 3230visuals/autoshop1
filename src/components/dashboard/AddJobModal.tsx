import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface NewJobData {
    vehicle: string;
    client: string;
    service: string;
    priority: string;
    bay: string;
    vehicleImage: string;
}

interface AddJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (job: NewJobData) => void;
}

const AddJobModal: React.FC<AddJobModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState<NewJobData>({
        vehicle: '',
        client: '',
        service: '',
        priority: 'medium',
        bay: '',
        vehicleImage: '',
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0a0a0c]/90 backdrop-blur-md animate-in fade-in">
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                className="glass-card w-full max-w-md p-8 rounded-t-[2.5rem] sm:rounded-2xl border-t border-white/10 space-y-8 bg-card-dark pb-navbar"
            >
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Init Work Order</h2>
                    <button onClick={onClose} className="size-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-1">Vehicle Specification</p>
                        <input
                            type="text"
                            placeholder="e.g. 2023 BMW M4"
                            className="w-full h-[56px] bg-white/5 border border-white/10 rounded-2xl px-5 text-[17px] text-slate-200 focus:border-indigo-500 outline-none"
                            value={formData.vehicle}
                            onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-1">Client Identity</p>
                        <input
                            type="text"
                            placeholder="Registry Name"
                            className="w-full h-[56px] bg-white/5 border border-white/10 rounded-2xl px-5 text-[17px] text-slate-200 focus:border-indigo-500 outline-none"
                            value={formData.client}
                            onChange={e => setFormData({ ...formData, client: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-1">Protocol / Service</p>
                        <input
                            type="text"
                            placeholder="Primary Objective"
                            className="w-full h-[56px] bg-white/5 border border-white/10 rounded-2xl px-5 text-[17px] text-slate-200 focus:border-indigo-500 outline-none"
                            value={formData.service}
                            onChange={e => setFormData({ ...formData, service: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-1">Priority</p>
                            <select
                                title="Priority level"
                                className="w-full h-[56px] bg-white/5 border border-white/10 rounded-2xl px-5 text-[17px] text-slate-200 focus:border-indigo-500 outline-none appearance-none"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-1">Bay Allocation</p>
                            <input
                                type="text"
                                placeholder="#00"
                                className="w-full h-[56px] bg-white/5 border border-white/10 rounded-2xl px-5 text-[17px] text-slate-200 focus:border-indigo-500 outline-none"
                                value={formData.bay}
                                onChange={e => setFormData({ ...formData, bay: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 pt-4">
                    <button onClick={() => { onAdd(formData); onClose(); }} className="flex-[2] h-[64px] rounded-2xl font-black bg-indigo-600 text-white uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20">Init Job</button>
                    <button onClick={onClose} className="flex-1 h-[64px] rounded-2xl font-bold bg-white/5 text-slate-500 uppercase tracking-widest">Abort</button>
                </div>
            </motion.div>
        </div>
    );
};

export default AddJobModal;
