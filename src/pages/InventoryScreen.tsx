import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import type { InventoryItem } from '../context/AppTypes';
import { motion, AnimatePresence } from 'framer-motion';

const AddInventoryModal = ({ isOpen, onClose, categories }: { isOpen: boolean; onClose: () => void; categories: string[] }) => {
    const { addInventoryItem, showToast } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        category: 'Parts',
        quantity: 1,
        price: 0,
        minStock: 5,
        location: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.category) {
            showToast('Please fill in required fields');
            return;
        }
        addInventoryItem({
            name: formData.name,
            category: formData.category as InventoryItem['category'],
            quantity: Number(formData.quantity),
            price: Number(formData.price),
            minStock: Number(formData.minStock),
            location: formData.location || 'Unassigned',
        });
        showToast(`Added ${formData.name} to inventory`);
        onClose();
        // Reset form
        setFormData({ name: '', category: 'Parts', quantity: 1, price: 0, minStock: 5, location: '' });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background-dark/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass-card w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl relative"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-100">Add New Part</h2>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="size-8 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 premium-press"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Part Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Oil Filter - Porsche GT3"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none"
                            >
                                {categories.filter(c => c !== 'All').map(cat => (
                                    <option key={cat} value={cat} className="bg-background-dark">{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Shelf A-1"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Qty</label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Min Stock</label>
                            <input
                                type="number"
                                value={formData.minStock}
                                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-primary text-background-dark font-bold py-4 rounded-xl orange-glow mt-4 transition-all premium-press"
                    >
                        Create Item
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

const InventoryScreen = () => {
    const navigate = useNavigate();
    const { inventory, updateInventoryStock, showToast } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const categories = ['All', 'Tires', 'Brakes', 'Fluid', 'Filter', 'Parts', 'Supplies'];

    const filteredInventory = inventory.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getStockStatus = (item: InventoryItem) => {
        if (item.quantity === 0) return { label: 'Out of Stock', color: 'text-status-red', bg: 'bg-status-red/10', border: 'border-status-red/30' };
        if (item.quantity <= item.minStock) return { label: 'Low Stock', color: 'text-status-yellow', bg: 'bg-status-yellow/10', border: 'border-status-yellow/30' };
        return { label: 'In Stock', color: 'text-status-green', bg: 'bg-status-green/10', border: 'border-status-green/30' };
    };

    const handleAdjustStock = (id: string, name: string, change: number) => {
        updateInventoryStock(id, change);
        showToast(`${change > 0 ? 'Added' : 'Removed'} ${Math.abs(change)} units of ${name}`);
    };

    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen flex flex-col relative">
            <AnimatePresence>
                {isModalOpen && (
                    <AddInventoryModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        categories={categories}
                    />
                )}
            </AnimatePresence>

            {/* Ambient Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[45%] h-[40%] bg-primary/5 blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[35%] bg-primary/5 blur-[100px] pointer-events-none z-0"></div>

            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center px-5 py-4">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full hover:bg-white/5 transition-colors premium-press"
                    >
                        <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                    </motion.button>
                    <div className="flex-1 text-center">
                        <h1 className="font-header text-lg font-bold tracking-tight">Inventory Management</h1>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsModalOpen(true)}
                        className="flex size-10 items-center justify-center rounded-full hover:bg-white/5 transition-colors premium-press"
                    >
                        <span className="material-symbols-outlined text-primary">add</span>
                    </motion.button>
                </div>

                {/* Search & Filter */}
                <div className="px-5 pb-4 space-y-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Search by part name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full glass-card border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all bg-transparent outline-none"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {categories.map((cat) => (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all premium-press ${selectedCategory === cat
                                    ? 'bg-primary text-background-dark orange-glow'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                                    }`}
                            >
                                {cat}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10 p-5 space-y-4 pb-12">
                {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => {
                        const status = getStockStatus(item);
                        return (
                            <div key={item.id} className="glass-card rounded-xl border border-white/5 p-4 flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.id}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10 text-slate-400 uppercase font-bold">{item.category}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-100 leading-tight">{item.name}</h3>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                                            {item.location}
                                        </p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg border flex flex-col items-center ${status.bg} ${status.border}`}>
                                        <span className={`text-[18px] font-black ${status.color}`}>{item.quantity}</span>
                                        <span className={`text-[8px] uppercase font-bold tracking-tighter ${status.color}`}>{status.label}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Unit Price</span>
                                        <span className="text-primary font-bold">${item.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleAdjustStock(item.id, item.name, -1)}
                                            className="size-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all premium-press"
                                        >
                                            <span className="material-symbols-outlined text-slate-400">remove</span>
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleAdjustStock(item.id, item.name, 1)}
                                            className="size-8 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/30 flex items-center justify-center transition-all premium-press"
                                        >
                                            <span className="material-symbols-outlined text-primary">add</span>
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <span className="material-symbols-outlined text-[64px] mb-4">inventory_2</span>
                        <p className="text-lg font-bold">No items found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default InventoryScreen;

