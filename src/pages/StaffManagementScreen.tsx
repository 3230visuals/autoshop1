import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import type { AuthRole } from '../context/AppTypes';
import { motion } from 'framer-motion';

const StaffManagementScreen = () => {
    const navigate = useNavigate();
    const { users, currentUser, updateUserRole, showToast } = useAppContext();

    const canManageStaff = currentUser.role === 'OWNER' || currentUser.role === 'OWNER';

    const getRoleColor = (role: AuthRole) => {
        switch (role) {
            case 'OWNER': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'OWNER': return 'text-primary bg-primary/10 border-primary/20';
            case 'STAFF': return 'text-primary bg-blue-400/10 border-blue-400/20';
            case 'CLIENT': return 'text-slate-400 bg-white/5 border-white/10';
            default: return 'text-slate-400 bg-white/5 border-white/10';
        }
    };

    const handleRoleChange = (userId: string, currentRole: AuthRole) => {
        if (!canManageStaff) {
            showToast('Only Admins or Owners can manage staff');
            return;
        }

        let nextRole: AuthRole;
        if (currentRole === 'STAFF') nextRole = 'OWNER';
        else if (currentRole === 'OWNER') nextRole = 'OWNER';
        else if (currentRole === 'OWNER') nextRole = 'STAFF';
        else nextRole = 'STAFF';

        updateUserRole(userId, nextRole);
    };

    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen flex flex-col relative">
            {/* Ambient Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[45%] h-[40%] bg-primary/5 blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[35%] bg-primary/5 blur-[100px] pointer-events-none z-0"></div>

            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center px-5 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full hover:bg-white/5 transition-colors active:scale-90"
                    >
                        <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                    </button>
                    <div className="flex-1 text-center">
                        <h1 className="font-header text-lg font-bold tracking-tight text-white uppercase tracking-widest">Team directory</h1>
                    </div>
                    <button onClick={() => navigate('/shop/invite-staff')} className="flex size-10 items-center justify-center rounded-full hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-primary">person_add</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 relative z-10 p-5 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold font-header text-white uppercase italic tracking-tighter">Personnel Registry</h2>
                    <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold">Manage roles and shop access.</p>
                </div>

                <div className="space-y-4">
                    {users.filter(u => u.role !== 'CLIENT').map((user) => (
                        <motion.div
                            key={user.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                showToast(`Staff detail: ${user.name}`);
                            }}
                            className="glass-card rounded-2xl border border-white/5 p-4 flex items-center gap-4 cursor-pointer hover:border-white/10 transition-colors"
                        >
                            <div className="relative">
                                <img src={user.avatar} alt={user.name} className="size-12 rounded-full border border-white/10" />
                                {user.id === currentUser.id && (
                                    <div className="absolute -top-1 -right-1 size-4 bg-green-500 rounded-full border-2 border-background-dark"></div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="font-bold text-slate-100 truncate">{user.name}</h3>
                                    {user.id === currentUser.id && <span className="text-[8px] bg-white/10 px-1 rounded uppercase font-black text-slate-400">You</span>}
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium truncate">{user.email}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/messages', { state: { clientName: user.name } });
                                        showToast(`Opening chat with ${user.name}`);
                                    }}
                                    className="size-9 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all text-primary"
                                >
                                    <span className="material-symbols-outlined text-lg">chat_bubble</span>
                                </motion.button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRoleChange(user.id, user.role);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-tighter transition-all active:scale-95 ${getRoleColor(user.role)}`}
                                >
                                    {user.role}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {!canManageStaff && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-8">
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-amber-500">lock</span>
                            <div>
                                <p className="text-sm font-bold text-amber-200 uppercase tracking-wide">Viewer Mode</p>
                                <p className="text-xs text-amber-200/60 leading-relaxed mt-1">
                                    You are currently viewing as a {currentUser.role}. Role adjustments are restricted to Shop Owners and Admins.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StaffManagementScreen;
