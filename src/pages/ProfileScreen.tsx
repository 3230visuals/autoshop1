import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { motion } from 'framer-motion';

const NOTIFICATION_PREFS = [
    { key: 'statusUpdates', label: 'Service status updates', icon: 'build_circle' },
    { key: 'paymentAlerts', label: 'Payment & invoice alerts', icon: 'payments' },
    { key: 'promos', label: 'Promotions & rewards', icon: 'redeem' },
    { key: 'appointmentReminders', label: 'Appointment reminders', icon: 'calendar_month' },
];

const ProfileScreen = () => {
    const navigate = useNavigate();
    const { currentUser, updateCurrentUser, showToast, loyaltyPoints } = useAppContext();

    const isClient = currentUser.role === 'CLIENT';
    const isShop = currentUser.role === 'OWNER' || currentUser.role === 'OWNER';

    // Editable fields
    const [name, setName] = useState(currentUser.name);
    const [email, setEmail] = useState(currentUser.email);
    const [phone, setPhone] = useState(currentUser.phone ?? '');
    const [editing, setEditing] = useState(false);

    // Notification toggles (local UI state)
    const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({
        statusUpdates: true, paymentAlerts: true, promos: false, appointmentReminders: true,
    });

    // Shop-specific settings
    const [shopName, setShopName] = useState(currentUser.shopName ?? 'Elite Auto Shop');
    const [shopPhone, setShopPhone] = useState(currentUser.shopPhone ?? '(312) 555-0190');
    const [shopAddress, setShopAddress] = useState(currentUser.shopAddress ?? '4820 N Western Ave, Chicago');
    const [editingShop, setEditingShop] = useState(false);

    const handleSaveProfile = () => {
        updateCurrentUser({ name, email, phone });
        setEditing(false);
        showToast('Profile saved!');
    };

    const handleSaveShop = () => {
        updateCurrentUser({ shopName, shopPhone, shopAddress });
        setEditingShop(false);
        showToast('Shop info saved!');
    };

    const TIER = loyaltyPoints >= 1500 ? 'Executive' : loyaltyPoints >= 500 ? 'Preferred' : 'Standard';
    const TIER_BG = TIER === 'Executive' ? 'bg-indigo-500/20 text-indigo-300' : TIER === 'Preferred' ? 'bg-slate-500/10 text-slate-300' : 'bg-white/5 text-slate-500';

    return (
        <div className="bg-[#0a0a0c] text-slate-200 min-h-screen font-sans pb-28">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5 px-5 py-4 flex items-center justify-between">

                <div className="flex items-center gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(-1)}
                        className="flex items-center text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </motion.button>
                    <h1 className="text-sm font-bold tracking-tight text-white">Profile & Settings</h1>
                </div>
            </header>

            <div className="px-4 py-5 space-y-5">

                {/* Avatar + Name Hero */}
                <div className="glass-card rounded-2xl border border-white/5 p-5 flex items-center gap-4">
                    <div className="relative group">
                        <div className="size-16 rounded-lg overflow-hidden border border-white/10 relative">
                            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-base text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{currentUser.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 tracking-widest">
                                {currentUser.role}
                            </span>
                            {isClient && (
                                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border border-white/5 ${TIER_BG} tracking-widest`}>
                                    {TIER} STATUS
                                </span>
                            )}
                        </div>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditing(!editing)}
                        className="size-10 rounded-lg bg-white/2 border border-white/5 flex items-center justify-center flex-shrink-0 hover:bg-white/5 transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-400 text-lg">edit</span>
                    </motion.button>
                </div>

                {/* Edit Personal Info */}
                {editing && (
                    <div className="glass-card rounded-2xl border border-indigo-500/20 p-5 space-y-4">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-1">Update Protocol</p>
                        {[
                            { label: 'Display Name', value: name, set: setName, type: 'text' },
                            { label: 'Authorized Email', value: email, set: setEmail, type: 'email' },
                            { label: 'Contact Phone', value: phone, set: setPhone, type: 'tel' },
                        ].map(f => (
                            <div key={f.label}>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{f.label}</p>
                                <input
                                    type={f.type}
                                    value={f.value}
                                    onChange={e => f.set(e.target.value)}
                                    className="w-full bg-white/2 border border-white/5 rounded-lg px-4 py-2 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50"
                                />
                            </div>
                        ))}
                        <div className="flex gap-2 pt-2">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setEditing(false)}
                                className="flex-1 py-2.5 rounded-lg border border-white/10 text-[9px] font-bold uppercase tracking-widest text-slate-500"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSaveProfile}
                                className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-widest"
                            >
                                Sync Profile
                            </motion.button>
                        </div>
                    </div>
                )}



                {/* Shop-specific: Shop Info */}
                {isShop && (
                    <div className="glass-card rounded-2xl border border-white/5 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Business Registry</p>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setEditingShop(!editingShop)}
                                className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest"
                            >
                                {editingShop ? 'Return' : 'Update'}
                            </motion.button>
                        </div>

                        {/* Shop Logo Display/Upload Area */}
                        <div className="flex items-center gap-4 py-1">
                            <div className="relative group">
                                <div className="size-14 rounded bg-white/2 border border-white/5 flex items-center justify-center overflow-hidden">
                                    {currentUser.shopLogo ? (
                                        <img src={currentUser.shopLogo} alt="Shop Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-slate-700 text-2xl">storefront</span>
                                    )}
                                    <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <span className="material-symbols-outlined text-white text-base">upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        updateCurrentUser({ shopLogo: reader.result as string });
                                                        showToast('Registry asset updated');
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white uppercase tracking-widest">Enterprise Brand</p>
                                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1">Authorized Asset Certification</p>
                            </div>
                        </div>

                        {editingShop ? (
                            <div className="space-y-4">
                                {[
                                    { label: 'Official Business Name', value: shopName, set: setShopName },
                                    { label: 'Authorized Phone Registry', value: shopPhone, set: setShopPhone },
                                    { label: 'Physical HQ Address', value: shopAddress, set: setShopAddress },
                                ].map(f => (
                                    <div key={f.label}>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{f.label}</p>
                                        <input
                                            value={f.value}
                                            onChange={e => f.set(e.target.value)}
                                            className="w-full bg-white/2 border border-white/5 rounded-lg px-4 py-2 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50"
                                        />
                                    </div>
                                ))}
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSaveShop}
                                    className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-[0.2em]"
                                >
                                    Synchronize Registry
                                </motion.button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {[
                                    { icon: 'store', label: shopName },
                                    { icon: 'call', label: shopPhone },
                                    { icon: 'location_on', label: shopAddress },
                                ].map(r => (
                                    <div key={r.icon} className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-500 text-[18px]">{r.icon}</span>
                                        <span className="text-sm text-slate-300">{r.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Notification Preferences */}
                <div className="glass-card rounded-2xl border border-white/8 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Notifications</p>
                    <div className="space-y-3">
                        {NOTIFICATION_PREFS.map(p => (
                            <div key={p.key} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400 text-[18px]">{p.icon}</span>
                                    <span className="text-sm text-slate-300">{p.label}</span>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setNotifPrefs(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                                    className={`relative w-10 h-5 rounded-full transition-all ${notifPrefs[p.key] ? 'bg-indigo-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifPrefs[p.key] ? 'left-[22px]' : 'left-0.5'}`} />
                                </motion.button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* App Preferences */}
                <div className="glass-card rounded-2xl border border-white/8 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">App Preferences</p>
                    <div className="space-y-1">
                        {[
                            { icon: 'help', label: 'Help & Support', action: () => showToast('Help center coming soon') },
                            { icon: 'privacy_tip', label: 'Privacy Policy', action: () => showToast('Privacy policy coming soon') },
                            { icon: 'description', label: 'Terms of Service', action: () => showToast('Terms coming soon') },
                            { icon: 'info', label: 'App Version', action: () => showToast('ShopReady v1.0.0') },
                        ].map(item => (
                            <motion.button
                                key={item.label}
                                whileTap={{ scale: 0.98 }}
                                onClick={item.action}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors premium-press group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-500 text-[20px]">{item.icon}</span>
                                    <span className="text-sm text-slate-300">{item.label}</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-700 text-[18px] group-hover:text-slate-500 transition-colors">chevron_right</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Sign Out */}
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { showToast('Signed out (demo mode)'); navigate('/'); }}
                    className="w-full py-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-red-500/10 premium-press"
                >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                </motion.button>

            </div>
        </div>
    );
};

export default ProfileScreen;
