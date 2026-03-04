import { useAuth } from '../../context/useAuth';
import { SkeletonDetail } from '../../components/common/Skeletons';

const S_Team: React.FC = () => {
    const { users, isLoading, staffInvite, updateStaffInvite, sendStaffInvite, resetStaffInvite } = useAuth();

    if (isLoading) return <SkeletonDetail />;

    const staffMembers = users.filter(u => u.role === 'STAFF' || u.role === 'OWNER');

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        sendStaffInvite();
        setTimeout(() => resetStaffInvite(), 3000);
    };

    return (
        <div className="flex flex-col min-h-screen bg-page-dark-01 safe-top pb-24 overflow-x-hidden">
            {/* Header */}
            <div className="px-5 pt-4 pb-6">
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Team</h1>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Personnel & Access Control</p>
            </div>

            {/* Invite Section */}
            <div className="px-5 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4">Invite New Member</p>

                    {staffInvite.sent ? (
                        <div className="py-4 text-center animate-in fade-in zoom-in duration-300">
                            <span className="material-symbols-outlined text-4xl text-green-500 mb-2">check_circle</span>
                            <p className="text-sm font-black text-white uppercase">Invite Sent!</p>
                            <p className="text-[10px] font-bold text-white/40 uppercase mt-1">Check {staffInvite.email} for details</p>
                            <button
                                onClick={() => resetStaffInvite()}
                                className="mt-4 text-[10px] font-black text-[var(--primary)] uppercase"
                            >
                                Send Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleInvite} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-white/30 uppercase ml-1" id="name-label">Full Name</label>
                                <input
                                    type="text"
                                    aria-labelledby="name-label"
                                    value={staffInvite.name}
                                    onChange={(e) => updateStaffInvite('name', e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--primary)] transition-colors"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-white/30 uppercase ml-1" id="email-label">Email Address</label>
                                <input
                                    type="email"
                                    aria-labelledby="email-label"
                                    value={staffInvite.email}
                                    onChange={(e) => updateStaffInvite('email', e.target.value)}
                                    placeholder="john@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--primary)] transition-colors"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-white/30 uppercase ml-1" id="role-label">Role</label>
                                    <select
                                        aria-labelledby="role-label"
                                        value={staffInvite.role}
                                        onChange={(e) => updateStaffInvite('role', e.target.value as 'STAFF' | 'OWNER')}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors appearance-none"
                                    >
                                        <option value="STAFF" className="bg-zinc-900">Technician</option>
                                        <option value="OWNER" className="bg-zinc-900">Shop Manager</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="w-full bg-[var(--primary)] text-black rounded-xl py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Send Invite
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Staff List */}
            <div className="px-5">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Active Personnel</p>
                <div className="space-y-2">
                    {staffMembers.map(member => (
                        <div key={member.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl overflow-hidden border border-white/10">
                                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase">{member.name}</p>
                                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">{member.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] font-black text-white/60 uppercase">Online</span>
                                <button className="material-symbols-outlined text-white/20 hover:text-white transition-colors ml-2">more_vert</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default S_Team;
