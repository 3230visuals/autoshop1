import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';
import type { InventoryItem } from '../../context/AppTypes';

const CATEGORIES: InventoryItem['category'][] = ['Tires', 'Brakes', 'Fluid', 'Filter', 'Parts', 'Supplies'];

const S_Parts: React.FC = () => {
    const navigate = useNavigate();
    const { inventory, updateInventoryStock, addInventoryItem, showToast } = useAppContext();
    const [search, setSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ name: '', category: 'Parts' as InventoryItem['category'], quantity: '0', price: '', minStock: '1', location: '' });

    const visibleItems = useMemo(() => {
        const query = search.trim().toLowerCase();
        return inventory.filter((item) =>
            !query || `${item.name} ${item.category} ${item.location}`.toLowerCase().includes(query)
        );
    }, [inventory, search]);

    const saveItem = async (event: React.FormEvent) => {
        event.preventDefault();
        const quantity = Number(form.quantity);
        const price = Number(form.price);
        const minStock = Number(form.minStock);
        if (!form.name.trim() || !form.location.trim() || !Number.isFinite(quantity) || quantity < 0 || !Number.isFinite(price) || price < 0 || !Number.isFinite(minStock) || minStock < 0) {
            showToast('Enter a name, location, and valid stock and price values.');
            return;
        }
        await addInventoryItem({
            name: form.name.trim(),
            category: form.category,
            quantity,
            price,
            minStock,
            location: form.location.trim(),
        });
        setForm({ name: '', category: 'Parts', quantity: '0', price: '', minStock: '1', location: '' });
        setIsAdding(false);
    };

    return (
        <div className="min-h-screen bg-page-dark-01 pb-shell-nav">
            <header className="px-6 pt-8 pb-8 bg-staff-hero-01 relative overflow-hidden border-b border-white/5 text-center safe-top">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Inventory</h1>
                <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.45em] mt-2">Parts & Supplies</p>
            </header>

            <main className="p-5 space-y-5">
                <div className="flex gap-3">
                    <input
                        aria-label="Search inventory"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search parts or locations"
                        className="min-w-0 flex-1 h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-slate-500"
                    />
                    <button onClick={() => setIsAdding(true)} className="px-4 rounded-xl bg-primary text-black text-xs font-black uppercase">Add Item</button>
                </div>

                {visibleItems.length === 0 ? (
                    <div className="glass-card rounded-2xl p-8 text-center text-sm text-slate-400">
                        {inventory.length === 0 ? 'No inventory items yet. Add your first item.' : 'No parts match that search.'}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {visibleItems.map((item) => (
                            <article key={item.id} className="glass-card rounded-2xl p-4 border border-white/5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="font-bold text-white truncate">{item.name}</h2>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">{item.category} · {item.location}</p>
                                        <p className="text-xs text-slate-300 mt-2">${item.price.toFixed(2)} each · Reorder at {item.minStock}</p>
                                    </div>
                                    {item.quantity <= item.minStock && <span className="shrink-0 text-[9px] font-black uppercase text-amber-300">Low stock</span>}
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-slate-400">On hand</span>
                                    <div className="flex items-center gap-3">
                                        <button aria-label={`Remove one ${item.name}`} onClick={() => { void updateInventoryStock(item.id, -1); }} disabled={item.quantity === 0} className="size-9 rounded-lg border border-white/10 text-white disabled:opacity-40">−</button>
                                        <span className="min-w-6 text-center font-black text-white">{item.quantity}</span>
                                        <button aria-label={`Add one ${item.name}`} onClick={() => { void updateInventoryStock(item.id, 1); }} className="size-9 rounded-lg border border-white/10 text-white">+</button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <button onClick={() => showToast('QR scanning is not available in this build.')} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Scan QR · unavailable
                </button>
                <button onClick={() => { void navigate('/s/board'); }} className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                    Back to Dashboard
                </button>
            </main>

            {isAdding && (
                <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm p-5 flex items-center justify-center">
                    <form onSubmit={(event) => { void saveItem(event); }} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#101114] p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-white">Add inventory item</h2>
                            <button type="button" aria-label="Close" onClick={() => setIsAdding(false)} className="text-slate-400">✕</button>
                        </div>
                        <input aria-label="Item name" required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Item name" className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-3 text-white" />
                        <select aria-label="Category" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as InventoryItem['category'] }))} className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-3 text-white">
                            {CATEGORIES.map((category) => <option key={category} value={category} className="bg-zinc-900">{category}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-3">
                            <input aria-label="Quantity" required type="number" min="0" step="1" value={form.quantity} onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))} placeholder="Quantity" className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-3 text-white" />
                            <input aria-label="Unit price" required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} placeholder="Unit price" className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-3 text-white" />
                            <input aria-label="Minimum stock" required type="number" min="0" step="1" value={form.minStock} onChange={(event) => setForm((prev) => ({ ...prev, minStock: event.target.value }))} placeholder="Minimum stock" className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-3 text-white" />
                            <input aria-label="Location" required value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} placeholder="Shelf / location" className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-3 text-white" />
                        </div>
                        <button type="submit" className="w-full h-12 rounded-xl bg-primary text-black font-black uppercase text-xs">Save Item</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default S_Parts;
