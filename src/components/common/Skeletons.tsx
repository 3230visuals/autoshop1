import React from 'react';

/* ═══════════════════════════════════════════════════
   Skeleton Primitives — pulse-animated loading placeholders
   ═══════════════════════════════════════════════════ */

/** Base shimmer bar */
export const SkeletonBar: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
);

/** Circular skeleton (avatar / icon) */
export const SkeletonCircle: React.FC<{ size?: string }> = ({ size = 'size-10' }) => (
    <div className={`animate-pulse rounded-full bg-white/5 ${size}`} />
);

/* ─── Composed Skeletons ─────────────────────────── */

/** Ticket card skeleton — matches TicketCard layout */
export const SkeletonTicketCard: React.FC = () => (
    <div className="glass-card space-y-3 p-5">
        <div className="flex items-center gap-4">
            <SkeletonCircle size="size-14" />
            <div className="flex-1 space-y-2">
                <SkeletonBar className="h-4 w-3/4" />
                <SkeletonBar className="h-3 w-1/2" />
            </div>
            <SkeletonBar className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex gap-1 mt-2">
            {Array.from({ length: 7 }).map((_, i) => (
                <SkeletonBar key={`skel-stage-${String(i)}`} className="flex-1 h-1.5" />
            ))}
        </div>
    </div>
);

/** Page header skeleton */
export const SkeletonPageHeader: React.FC = () => (
    <div className="px-6 pt-10 pb-12 space-y-3 text-center">
        <SkeletonBar className="h-8 w-48 mx-auto" />
        <SkeletonBar className="h-3 w-32 mx-auto" />
    </div>
);

/** Board page skeleton — header + 3 ticket cards */
export const SkeletonBoard: React.FC = () => (
    <div className="min-h-screen">
        <SkeletonPageHeader />
        <div className="p-6 space-y-4">
            <SkeletonTicketCard />
            <SkeletonTicketCard />
            <SkeletonTicketCard />
        </div>
    </div>
);

/** Message list skeleton */
export const SkeletonMessages: React.FC = () => (
    <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skel-msg-${String(i)}`} className="flex items-center gap-3">
                <SkeletonCircle />
                <div className="flex-1 space-y-2">
                    <SkeletonBar className="h-4 w-2/3" />
                    <SkeletonBar className="h-3 w-1/3" />
                </div>
            </div>
        ))}
    </div>
);

/** Detail page skeleton — header + overview card */
export const SkeletonDetail: React.FC = () => (
    <div className="min-h-screen">
        <div className="px-6 pt-10 pb-8 space-y-4">
            <div className="flex items-center gap-4">
                <SkeletonCircle size="size-16" />
                <div className="flex-1 space-y-2">
                    <SkeletonBar className="h-5 w-3/4" />
                    <SkeletonBar className="h-3 w-1/2" />
                </div>
            </div>
        </div>
        <div className="p-6 space-y-4">
            <div className="glass-card p-5 space-y-3">
                <SkeletonBar className="h-4 w-1/3" />
                <SkeletonBar className="h-3 w-full" />
                <SkeletonBar className="h-3 w-5/6" />
                <SkeletonBar className="h-3 w-2/3" />
            </div>
            <div className="glass-card p-5 space-y-3">
                <SkeletonBar className="h-4 w-1/4" />
                <SkeletonBar className="h-10 w-full" />
            </div>
        </div>
    </div>
);

/** Payment skeleton */
export const SkeletonPayment: React.FC = () => (
    <div className="p-6 space-y-4">
        <div className="glass-card p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={`skel-pay-${String(i)}`} className="flex justify-between items-center">
                    <SkeletonBar className="h-4 w-1/3" />
                    <SkeletonBar className="h-4 w-16" />
                </div>
            ))}
            <div className="border-t border-white/5 pt-3 mt-3 flex justify-between">
                <SkeletonBar className="h-5 w-16" />
                <SkeletonBar className="h-5 w-24" />
            </div>
        </div>
        <SkeletonBar className="h-14 w-full rounded-2xl" />
    </div>
);
