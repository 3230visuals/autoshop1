import React, { useMemo } from 'react';
import { useJobs } from '../../context/useJobs';
import { SkeletonDetail } from '../../components/common/Skeletons';
import type { Job } from '../../context/AppTypes';

const S_Finance: React.FC = () => {
    const { jobs, isLoading } = useJobs();

    const metrics = useMemo(() => {
        let grossRevenue = 0;
        let pendingRevenue = 0;
        const totalTickets = jobs.length;
        let paidCount = 0;

        jobs.forEach(job => {
            const financials = job.financials;
            if (financials?.total) {
                if (financials.invoice?.status === 'paid') {
                    grossRevenue += financials.total;
                    paidCount++;
                } else {
                    pendingRevenue += financials.total;
                }
            }
        });

        const avgTicket = paidCount > 0 ? grossRevenue / paidCount : 0;

        return {
            grossRevenue,
            pendingRevenue,
            totalTickets,
            avgTicket,
            paidCount
        };
    }, [jobs]);

    if (isLoading) return <SkeletonDetail />;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(val);
    };

    return (
        <div className="flex flex-col min-h-screen bg-page-dark-01 safe-top pb-24 overflow-x-hidden">
            {/* Header */}
            <div className="px-5 pt-4 pb-6">
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Finance</h1>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Revenue & Payments Performance</p>
            </div>

            {/* Metric Grid */}
            <div className="px-5 grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Gross Revenue</p>
                    <p className="text-xl font-black text-[var(--primary)]">
                        {formatCurrency(metrics.grossRevenue)}
                    </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Pending</p>
                    <p className="text-xl font-black text-white/80">
                        {formatCurrency(metrics.pendingRevenue)}
                    </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Tickets</p>
                    <p className="text-xl font-black text-white/80">{metrics.totalTickets}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Avg Ticket</p>
                    <p className="text-xl font-black text-white/80">{formatCurrency(metrics.avgTicket)}</p>
                </div>
            </div>

            {/* Performance Chart Placeholder (Visual Component) */}
            <div className="px-5 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Growth Forecast</p>
                        <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase text-[var(--primary)] bg-[var(--primary-muted)]"
                        >
                            +12%
                        </span>
                    </div>
                    <div className="flex items-end gap-1 h-24">
                        {[40, 65, 45, 80, 55, 95, 70].map((h, i) => (
                            <div
                                key={`chart-val-${h}-${i === 5 ? 'highlight' : 'bar'}`}
                                className={`flex-1 rounded-t-sm transition-all duration-500 hover:bg-white/30 cursor-pointer ${i === 5 ? 'bg-[var(--primary)]' : 'bg-white/10'}`}
                                style={{ height: `${h}%` } as React.CSSProperties}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-3 px-1">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => (
                            <span key={`day-label-${d}`} className="text-[8px] font-bold text-white/20">{d}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Payments */}
            <div className="px-5">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Recent Settlements</p>
                    <button className="text-[10px] font-black uppercase text-[var(--primary)]">View All</button>
                </div>

                <div className="space-y-2">
                    {jobs.filter((j: Job) => j.financials?.invoice?.status === 'paid').slice(0, 5).map((job: Job) => (
                        <div key={job.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[var(--primary)]">payments</span>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase">{job.client}</p>
                                    <p className="text-[10px] font-bold text-white/40 uppercase">{job.vehicle}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-white">{formatCurrency(job.financials?.total ?? 0)}</p>
                                <p className="text-[8px] font-bold text-green-500 uppercase">Paid</p>
                            </div>
                        </div>
                    ))}

                    {metrics.paidCount === 0 && (
                        <div className="py-10 text-center bg-white/5 border border-white/5 border-dashed rounded-2xl">
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">No settled transactions yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default S_Finance;
