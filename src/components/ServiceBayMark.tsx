import React from 'react';
import { Cog, Wrench } from 'lucide-react';

type ServiceBayMarkProps = {
    size?: number;
    className?: string;
};

/** Compact shop-meets-software mark for ServiceBay branding. */
const ServiceBayMark: React.FC<ServiceBayMarkProps> = ({ size = 64, className = '' }) => (
    <span
        aria-hidden="true"
        className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
        style={{ width: size, height: size }}
    >
        <Cog
            className="absolute inset-0 h-full w-full text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,.32)]"
            strokeWidth={1.45}
        />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 64 64" fill="none">
            <path d="M8 43h10v-8h8" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="43" r="2.5" fill="#38bdf8" />
            <path d="M56 21h-9v7h-6" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="56" cy="21" r="2.5" fill="#38bdf8" />
        </svg>
        <Wrench
            className="absolute h-[46%] w-[46%] -rotate-45 text-orange-300 drop-shadow-[0_2px_5px_rgba(251,146,60,.5)]"
            strokeWidth={2.4}
        />
        <span className="absolute right-[21%] top-[22%] size-[7%] rounded-full bg-emerald-300 shadow-[0_0_7px_rgba(110,231,183,.8)]" />
    </span>
);

export default ServiceBayMark;
