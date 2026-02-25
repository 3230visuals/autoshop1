import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import type { ServiceItem } from '../context/AppTypes';

const ServicesManagement: React.FC = () => {
    const navigate = useNavigate();
    const { serviceItems, addServiceItem, updateServiceItem, deleteServiceItem, currentUser, showToast } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Omit<ServiceItem, 'id'>>({
        name: '',
        price: 0,
        severity: 'recommended',
        icon: 'build',
        iconColor: 'text-slate-400',
        description: '',
    });

    const isOwner = currentUser.role === 'OWNER' || currentUser.role === 'OWNER';

    if (!isOwner) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="text-center space-y-4">
                    <span className="material-symbols-outlined text-red-500 text-6xl">lock</span>
                    <h1 className="text-2xl font-bold text-slate-100">Access Restricted</h1>
                    <p className="text-slate-400">Only shop owners can manage services.</p>
                    <button onClick={() => navigate(-1)} className="px-6 py-2 bg-white/10 rounded-full text-slate-200">Go Back</button>
                </div>
            </div>
        );
    }

    const resetForm = () => {
        setFormData({
            name: '',
            price: 0,
            severity: 'recommended',
            icon: 'build',
            iconColor: 'text-slate-400',
            description: '',
        });
        setEditingId(null);
    };

    const handleOpenAdd = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: ServiceItem) => {
        setFormData({
            name: item.name,
            price: item.price,
            severity: item.severity,
            icon: item.icon,
            iconColor: item.iconColor,
            description: item.description,
        });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.name || formData.price <= 0) {
            showToast('Please enter a valid name and price');
            return;
        }

        if (editingId) {
            updateServiceItem(editingId, formData);
        } else {
            addServiceItem(formData);
        }
        setIsModalOpen(false);
        resetForm();
    };

    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen flex flex-col relative pb-24">
            {/* Ambient Background */}
            <div className="fixed top-[-20%] right-[-10%] w-[60%] h-[50%] bg-primary/5 blur-[120px] pointer-events-none z-0"></div>

            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-dark/80 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                    </button>
                    <h1 className="font-bold text-lg">Service Menu</h1>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 bg-primary text-background-dark px-4 py-2 rounded-full font-bold text-xs orange-glow hover:brightness-110 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add Service
                </button>
            </header>

            {/* Content */}
            <main className="flex-1 p-5 relative z-10 space-y-4">
                <p className="text-slate-400 text-xs px-1">Manage the services and pricing available to your clients.</p>

                <div className="grid gap-4">
                    {serviceItems.map(item => (
                        <div key={item.id} className="glass-card p-4 rounded-xl border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`size-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 ${item.iconColor}`}>
                                        <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-100">{item.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm font-bold text-primary">${item.price.toFixed(2)}</span>
                                            {item.severity === 'critical' && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 font-bold uppercase tracking-wider">Critical</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenEdit(item)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this service?')) {
                                                deleteServiceItem(item.id);
                                            }
                                        }}
                                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-3 line-clamp-2">{item.description}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4 bg-background-dark border border-white/10 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Service' : 'New Service'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Service Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none mt-1 text-white"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Synthetic Oil Change"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Price ($)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none mt-1 text-white"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none mt-1 text-white [&>option]:bg-background-dark"
                                        value={formData.severity}
                                        onChange={e => setFormData({ ...formData, severity: e.target.value as 'recommended' | 'critical' })}
                                    >
                                        <option value="recommended">Standard</option>
                                        <option value="critical">Critical / Repair</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Icon</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none mt-1 text-white [&>option]:bg-background-dark"
                                    value={formData.icon}
                                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                >
                                    <option value="build">Build (Wrench)</option>
                                    <option value="oil_barrel">Oil</option>
                                    <option value="tire_repair">Tire</option>
                                    <option value="local_car_wash">Wash/Detail</option>
                                    <option value="bolt">Electrical</option>
                                    <option value="water_drop">Fluid</option>
                                    <option value="monitor_heart">Inspection</option>
                                    <option value="warning">Warning/Repair</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none mt-1 text-white resize-none h-20"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of what's included..."
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleSubmit}
                                className="w-full py-3.5 rounded-xl font-bold bg-primary text-background-dark hover:brightness-110 transition active:scale-[0.98]"
                            >
                                {editingId ? 'Save Changes' : 'Create Service'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesManagement;
