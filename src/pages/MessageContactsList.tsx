import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../context/useJobs';
import { useAuth } from '../context/useAuth';
import type { Job } from '../context/AppTypes';



/* ── contacts built from real shop data ── */
interface Contact {
    id: string;
    name: string;
    role: 'client' | 'staff';
    vehicle?: string;
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
}

const STAFF_MEMBERS: Contact[] = [
    { id: 'staff-marcus', name: 'Marcus Sterling', role: 'staff', lastMessage: 'Bay 4 is clear now', time: '2:15 PM', unread: 0, online: true },
    { id: 'staff-sarah', name: 'Sarah Chen', role: 'staff', lastMessage: 'Oil filter ordered', time: '1:40 PM', unread: 0, online: true },
    { id: 'staff-dave', name: 'Dave Miller', role: 'staff', lastMessage: 'Alignment done ✓', time: '11:22 AM', unread: 0, online: false },
];

const MessageContactsList = () => {
    const navigate = useNavigate();
    const { showToast } = useJobs();
    const { staffUser } = useAuth();
    const { jobs, deleteJob } = useJobs();

    const shopId = staffUser?.shopId ?? 'SHOP-01';
    const isOwner = staffUser?.role === 'OWNER';

    const [tab, setTab] = useState<'all' | 'clients' | 'staff'>('all');
    const [search, setSearch] = useState('');

    /* Build client contacts from live jobs */
    const clientContacts: Contact[] = useMemo(() => {
        const seen = new Set<string>();
        const contacts: Contact[] = [];

        const shopTickets = jobs.filter((j: Job) => j.shopId === shopId);

        for (const t of shopTickets) {
            // We group by client name for the list, though it could be by clientId
            if (!seen.has(t.client)) {
                seen.add(t.client);
                contacts.push({
                    id: t.id, // Using ticket ID as base
                    name: t.client,
                    role: 'client',
                    vehicle: t.vehicle,
                    lastMessage: t.notes ?? 'New service ticket',
                    time: t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
                    unread: t.stageIndex < 3 ? 1 : 0,
                    online: t.stageIndex > 0 && t.stageIndex < 5,
                });
            }
        }

        return contacts;
    }, [shopId, jobs]);

    const allContacts = useMemo(() => {
        let list = [...clientContacts, ...STAFF_MEMBERS];
        if (tab === 'clients') list = list.filter(c => c.role === 'client');
        if (tab === 'staff') list = list.filter(c => c.role === 'staff');
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(c => c.name.toLowerCase().includes(q) || c.vehicle?.toLowerCase().includes(q));
        }
        // Sort: unread first, then alphabetical
        list.sort((a, b) => b.unread - a.unread || a.name.localeCompare(b.name));
        return list;
    }, [clientContacts, tab, search]);

    const openChat = (contact: Contact) => {
        if (contact.role === 'client') {
            void navigate(`/s/ticket/${contact.id}`); // Deep link to ticket with messages tab
        } else {
            void navigate('/s/messages/chat', {
                state: {
                    clientName: contact.name,
                    vehicle: contact.vehicle ?? '',
                    tag: 'STAFF',
                },
            });
        }
    };

    const handleDeleteClient = (e: React.MouseEvent, contact: Contact) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isOwner) return;

        if (window.confirm(`PERMANENTLY DELETE CLIENT & TICKET "${contact.name.toUpperCase()}"?\n\nThis will remove all associated records. This action cannot be undone.`)) {
            void deleteJob(contact.id).then((success: boolean) => {
                if (success) {
                    showToast(`Client "${contact.name}" and ticket removed.`);
                }
            });
        }

    };


    const TABS = [
        { id: 'all', label: 'All' },
        { id: 'clients', label: 'Clients' },
        { id: 'staff', label: 'Staff' },
    ];

    return (
        <div className="min-h-screen">
            <header className="px-6 pt-16 pb-6 bg-staff-hero-01 relative overflow-hidden border-b border-white/5 text-center">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Messages</h1>
                <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.45em] mt-2">Conversations</p>
            </header>

            <div className="p-6 space-y-4">
                {/* Search */}
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xl">search</span>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search contacts..."
                        className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 pl-12 pr-4 text-white text-sm placeholder:text-slate-600 focus:border-primary/30 outline-none transition-all"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as 'all' | 'clients' | 'staff')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${tab === t.id
                                ? 'bg-primary/10 border-primary/30 text-primary'
                                : 'bg-white/2 border-white/5 text-slate-500'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Contact List */}
                <div className="space-y-2">
                    {allContacts.length === 0 && (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-3xl text-slate-700 mb-2 block">forum</span>
                            <p className="text-slate-500 text-sm">No conversations yet.</p>
                        </div>
                    )}
                    {allContacts.map((contact) => (
                        <button
                            key={contact.id}
                            onClick={() => openChat(contact)}
                            className="w-full text-left bg-card-dark border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/20 transition-all active:scale-[0.98] group"
                        >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className={`size-12 rounded-2xl flex items-center justify-center border ${contact.role === 'staff'
                                    ? 'bg-accent/10 border-accent/20'
                                    : 'bg-primary/10 border-primary/20'
                                    }`}>
                                    <span className={`text-xs font-black uppercase ${contact.role === 'staff' ? 'text-accent' : 'text-primary'
                                        }`}>
                                        {contact.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                    </span>
                                </div>
                                {contact.online && (
                                    <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-emerald-500 rounded-full border-2 border-card-dark" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                                        {contact.name}
                                    </h3>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex-shrink-0 ml-2">
                                        {contact.time}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-500 truncate">
                                        {contact.vehicle && <span className="text-slate-600">{contact.vehicle} · </span>}
                                        {contact.lastMessage}
                                    </p>
                                    {contact.unread > 0 && (
                                        <span className="flex-shrink-0 ml-2 size-5 bg-primary rounded-full flex items-center justify-center">
                                            <span className="text-[10px] font-black text-white">{contact.unread}</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Delete Action (Owner Only) */}
                            {isOwner && contact.role === 'client' && (
                                <button
                                    onClick={(e) => handleDeleteClient(e, contact)}
                                    className="size-10 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all ml-2 flex items-center justify-center flex-shrink-0"
                                    title="Delete Client Records"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            )}

                            {/* Arrow */}
                            <span className="material-symbols-outlined text-slate-700 text-lg group-hover:text-primary transition-colors flex-shrink-0 ml-1">
                                chevron_right
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MessageContactsList;
