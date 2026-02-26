import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';

const NotificationsScreen = () => {
    const navigate = useNavigate();
    const { notifications, markAllRead } = useAppContext();
    const [expanded, setExpanded] = useState<string | null>(null);

    const unread = notifications.filter(n => !n.read);
    const read = notifications.filter(n => n.read);

    const iconMap: Record<string, { icon: string; color: string; bg: string; border: string }> = {
        payment: { icon: 'payments', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
        status: { icon: 'build_circle', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
        message: { icon: 'chat', color: 'text-primary', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
        promo: { icon: 'redeem', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
        alert: { icon: 'notifications', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    };

    const fmtTime = (ts: number) => {
        const diff = Date.now() - ts;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const NotifCard = ({ n }: { n: typeof notifications[0] }) => {
        const style = iconMap[n.type] ?? iconMap.alert;
        const isOpen = expanded === n.id;
        return (
            <button
                onClick={() => setExpanded(isOpen ? null : n.id)}
                className={`w-full flex items-start gap-4 p-5 rounded-3xl border transition-all text-left premium-press shadow-xl ${n.read ? 'liquid-glass border-white/5 opacity-80' : 'liquid-glass border-primary/20 shadow-primary/5'
                    }`}
            >
                <div className={`size-12 rounded-2xl ${style.bg} ${style.border} border flex items-center justify-center flex-shrink-0 relative`}>
                    <span className={`material-symbols-outlined ${style.color} text-[24px] drop-shadow-[0_0_8px_currentColor]`}>{style.icon}</span>
                    {!n.read && <div className="absolute -top-1 -right-1 size-3.5 bg-primary rounded-full border-2 border-zinc-950 shadow-[0_0_10px_rgba(242,127,13,0.6)]" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <p className={`text-[15px] font-black leading-tight italic glass-text ${n.read ? 'text-slate-300' : 'text-white'}`}>{n.title}</p>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0 mt-1">{fmtTime(n.timestamp)}</span>
                    </div>
                    <p className={`text-[13px] font-medium mt-1.5 leading-relaxed ${isOpen ? '' : 'line-clamp-1'} ${n.read ? 'text-slate-500' : 'text-slate-400'}`}>{n.body}</p>
                </div>
            </button>
        );
    };

    return (
        <div className="bg-zinc-950 text-slate-100 min-h-screen flex flex-col font-body pb-32">
            {/* Ambient glows */}
            <div className="glow-mesh top-[-100px] left-[-100px] opacity-15" />
            <div className="glow-mesh bottom-[-100px] right-[-100px] opacity-10" />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-zinc-950/40 backdrop-blur-xl border-b border-white/5 px-5 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 transition-colors active:scale-90 premium-press">
                        <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="font-display text-xl font-black italic glass-text">Notification Feed</h1>
                        {unread.length > 0 && <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-black mt-0.5">{unread.length} New Messages</p>}
                    </div>
                </div>
                {unread.length > 0 && (
                    <button onClick={markAllRead} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all active:scale-95 premium-press">
                        Clear All
                    </button>
                )}
            </header>

            <div className="px-5 py-6 space-y-8">
                {/* Unread */}
                {unread.length > 0 && (
                    <section className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2 flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                            Recent Activity
                        </p>
                        <div className="space-y-3">
                            {unread.map(n => <NotifCard key={n.id} n={n} />)}
                        </div>
                    </section>
                )}

                {/* Read */}
                {read.length > 0 && (
                    <section className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">Earlier Notifications</p>
                        <div className="space-y-3">
                            {read.map(n => <NotifCard key={n.id} n={n} />)}
                        </div>
                    </section>
                )}

                {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <span className="material-symbols-outlined text-slate-700 text-[52px]">notifications_off</span>
                        <p className="text-slate-500 text-sm">No notifications yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsScreen;
