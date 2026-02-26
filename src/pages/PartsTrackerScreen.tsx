import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import type { Part, PartStatus } from '../context/AppTypes';

const PART_STATUS: Record<PartStatus, { label: string; icon: string; color: string; bg: string; border: string }> = {
    needed: { label: 'Needed', icon: 'add_circle', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' },
    ordered: { label: 'Ordered', icon: 'local_shipping', color: 'text-primary', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    arrived: { label: 'Arrived', icon: 'inventory_2', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    installed: { label: 'Installed', icon: 'build_circle', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
};

const PART_STATUSES: PartStatus[] = ['needed', 'ordered', 'arrived', 'installed'];

const SEED_PARTS: Part[] = [
    { id: 'p1', name: 'Rear Brake Pads — OEM', partNumber: 'BP-911-RS-R', vehicle: '2024 Porsche 911 GT3', vendor: 'Porsche OEM', cost: 320, status: 'ordered', eta: 'Feb 21', notes: 'Rush order placed' },
    { id: 'p2', name: 'Cabin Air Filter', partNumber: 'CF-00-BMW-M3', vehicle: '2022 BMW M3', vendor: 'AutoZone', cost: 45, status: 'arrived', eta: 'In Stock', notes: '' },
    { id: 'p3', name: 'Synthetic Oil 5W-40 (6qt)', partNumber: 'OIL-5W40-6', vehicle: '2022 BMW M3', vendor: 'Wholesale', cost: 68, status: 'installed', eta: 'Done', notes: 'Used 5.5 qt' },
    { id: 'p4', name: 'Front Suspension Bushing Kit', partNumber: 'SUSP-F150-2019', vehicle: '2019 Ford F-150', vendor: 'RockAuto', cost: 145, status: 'needed', eta: 'TBD', notes: 'Verify fitment first' },
];

const PartsTrackerScreen = () => {
    const navigate = useNavigate();
    const { showToast, searchParts } = useAppContext();
    const [parts, setParts] = useState<Part[]>(SEED_PARTS);
    const [filter, setFilter] = useState<PartStatus | 'all'>('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPart, setNewPart] = useState({ name: '', vehicle: '', vendor: '', partNumber: '', cost: '', eta: '', notes: '' });

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Omit<Part, 'id' | 'status' | 'eta' | 'notes'>[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchParts(query);
            setSearchResults(results);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const selectPart = (part: Omit<Part, 'id' | 'status' | 'eta' | 'notes'>) => {
        setNewPart({
            name: part.name,
            vehicle: part.vehicle,
            vendor: part.vendor,
            partNumber: part.partNumber,
            cost: part.cost.toString(),
            eta: 'ASAP',
            notes: '',
        });
        setSearchResults([]);
        setSearchQuery('');
    };

    const advanceStatus = (id: string) => {
        setParts(prev => prev.map(p => {
            if (p.id !== id) return p;
            const idx = PART_STATUSES.indexOf(p.status);
            const next = PART_STATUSES[Math.min(idx + 1, PART_STATUSES.length - 1)];
            showToast(`Part marked as ${PART_STATUS[next].label}`);
            return { ...p, status: next };
        }));
    };

    const addPart = () => {
        if (!newPart.name.trim()) return;
        setParts(prev => [...prev, {
            ...newPart,
            id: `p${Date.now()}`,
            cost: parseFloat(newPart.cost) || 0,
            status: 'needed',
        }]);
        setNewPart({ name: '', vehicle: '', vendor: '', partNumber: '', cost: '', eta: '', notes: '' });
        setShowAddForm(false);
        showToast('Part added to tracker');
    };

    const filtered = filter === 'all' ? parts : parts.filter(p => p.status === filter);
    const counts = PART_STATUSES.reduce((acc, s) => { acc[s] = parts.filter(p => p.status === s).length; return acc; }, {} as Record<PartStatus, number>);

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
                        <h1 className="font-display text-xl font-black italic glass-text">Parts Tracker</h1>
                        <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-black mt-0.5">{parts.length} items tracked</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="size-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center premium-press shadow-lg shadow-primary/5 group"
                >
                    <span className="material-symbols-outlined text-primary text-[24px] group-hover:rotate-90 transition-transform">{showAddForm ? 'close' : 'add'}</span>
                </button>
            </header>

            {/* Add part form */}
            {showAddForm && (
                <div className="mx-5 mt-4 liquid-glass rounded-3xl border border-primary/20 p-6 space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-500">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Add New Part</p>

                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            placeholder="Search parts catalog..."
                            value={searchQuery}
                            onChange={e => handleSearch(e.target.value)}
                            className="w-full bg-zinc-950/50 border border-primary/30 rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder-slate-700 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all mb-1 shadow-inner"
                        />
                        {isSearching && (
                            <div className="absolute right-4 top-4">
                                <span className="material-symbols-outlined text-primary text-[20px] animate-spin">sync</span>
                            </div>
                        )}

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute z-50 w-full mt-2 bg-zinc-950 border border-white/10 rounded-2xl shadow-3xl overflow-hidden max-h-60 overflow-y-auto animate-in slide-in-from-top-2 backdrop-blur-3xl">
                                {searchResults.map((result, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => selectPart(result)}
                                        className="w-full text-left px-5 py-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors premium-press"
                                    >
                                        <p className="text-sm font-black text-white italic glass-text">{result.name}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{result.vehicle} • {result.partNumber}</p>
                                            <p className="text-[11px] font-black text-primary">${result.cost.toFixed(2)}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-white/5 my-2"></div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: 'name', placeholder: 'Part name *' },
                            { key: 'vehicle', placeholder: 'Vehicle Specs' },
                            { key: 'partNumber', placeholder: 'Part Number' },
                            { key: 'vendor', placeholder: 'Vendor' },
                            { key: 'cost', placeholder: 'Cost ($)' },
                            { key: 'eta', placeholder: 'ETA' },
                        ].map(f => (
                            <input
                                key={f.key}
                                placeholder={f.placeholder}
                                value={(newPart as Record<string, string>)[f.key]}
                                onChange={e => setNewPart(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-slate-700 outline-none focus:border-primary/40 transition-all shadow-inner"
                            />
                        ))}
                    </div>
                    <textarea
                        placeholder="Notes (optional)..."
                        value={newPart.notes}
                        onChange={e => setNewPart(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-slate-700 outline-none focus:border-primary/40 transition-all shadow-inner h-24 resize-none"
                    />
                    <div className="flex gap-3 pt-2">
                        <button onClick={addPart} className="flex-1 py-4 bg-primary text-zinc-950 font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/30 premium-press">ADD PART</button>
                        <button onClick={() => setShowAddForm(false)} className="px-6 py-4 border border-white/5 bg-zinc-800 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl premium-press">CANCEL</button>
                    </div>
                </div>
            )}

            {/* Filter chips */}
            <div className="px-5 py-4 flex gap-2.5 overflow-x-auto scrollbar-hide">
                <button onClick={() => setFilter('all')} className={`flex-shrink-0 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all premium-press ${filter === 'all' ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-white/5' : 'bg-zinc-900 border-white/5 text-slate-600'}`}>
                    All Parts ({parts.length})
                </button>
                {PART_STATUSES.map(s => {
                    const ps = PART_STATUS[s];
                    const active = filter === s;
                    return (
                        <button key={s} onClick={() => setFilter(s)} className={`flex-shrink-0 flex items-center gap-2 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all premium-press ${active ? `${ps.bg} ${ps.border} ${ps.color} shadow-lg` : 'bg-zinc-900 border-white/5 text-slate-600'}`}>
                            {ps.label} ({counts[s]})
                        </button>
                    );
                })}
            </div>

            {/* Parts list */}
            <div className="flex-1 px-5 mt-4 space-y-5">
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                        <div className="size-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-600 text-[40px]">inventory_2</span>
                        </div>
                        <p className="text-slate-500 text-[13px] font-bold uppercase tracking-widest">No parts found</p>
                    </div>
                )}
                {filtered.map(part => {
                    const ps = PART_STATUS[part.status];
                    const canAdvance = part.status !== 'installed';
                    const nextIdx = PART_STATUSES.indexOf(part.status) + 1;
                    const nextLabel = PART_STATUS[PART_STATUSES[Math.min(nextIdx, PART_STATUSES.length - 1)]].label;
                    return (
                        <div key={part.id} className="liquid-glass rounded-3xl border border-white/5 overflow-hidden group hover:border-white/15 transition-all shadow-xl">
                            <div className="p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`size-12 rounded-2xl ${ps.bg} ${ps.border} border flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                        <span className={`material-symbols-outlined ${ps.color} text-[24px]`}>{ps.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-[16px] text-white italic glass-text">{part.name}</p>
                                        <p className="text-[11px] font-black text-primary/80 uppercase tracking-widest mt-0.5">{part.vehicle}</p>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-full ${ps.bg} ${ps.border} border shadow-sm`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${ps.color}`}>{ps.label}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-[10px] text-slate-500 mt-5 pt-5 border-t border-white/5">
                                    <div>
                                        <p className="text-slate-600 font-black uppercase tracking-widest mb-1">Vendor</p>
                                        <p className="text-white font-bold truncate">{part.vendor || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600 font-black uppercase tracking-widest mb-1">Part Number</p>
                                        <p className="text-white font-bold truncate">{part.partNumber || '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-600 font-black uppercase tracking-widest mb-1">Cost</p>
                                        <p className="text-primary font-black text-sm">${part.cost.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5 text-emerald-500/80"><span className="material-symbols-outlined text-[16px]">schedule</span>ETA: {part.eta || 'DELIVERED'}</span>
                                    {part.notes && <span className="italic truncate max-w-[150px] text-slate-600">"{part.notes}"</span>}
                                </div>
                            </div>
                            {canAdvance && (
                                <button
                                    onClick={() => advanceStatus(part.id)}
                                    className="w-full flex items-center justify-center gap-2 py-4 border-t border-white/5 bg-zinc-950/20 hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary premium-press"
                                >
                                    <span className="material-symbols-outlined text-[18px] text-primary">arrow_forward</span>
                                    MOVE TO {nextLabel}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PartsTrackerScreen;
