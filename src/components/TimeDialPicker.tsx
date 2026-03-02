import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeDialPickerProps {
    value: string; // "HH:MM"
    onChange: (value: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')); // 5 min increments

const TimeDialPicker: React.FC<TimeDialPickerProps> = ({ value, onChange }) => {
    const [h, m] = value.split(':');
    const [hour, setHour] = useState(h);
    const [minute, setMinute] = useState(m);

    useEffect(() => {
        onChange(`${hour}:${minute}`);
    }, [hour, minute, onChange]);

    return (
        <div className="flex flex-col gap-4 p-4 bg-zinc-900/50 rounded-3xl border border-white/5">
            <p className="text-[10px] font-black uppercase text-primary tracking-widest text-center">Set Appointment Time</p>
            <div className="flex items-center justify-center gap-4 h-40 overflow-hidden relative">
                {/* Hour Dial */}
                <Wheel items={HOURS} selected={hour} onSelect={setHour} label="HR" />
                <span className="text-2xl font-black text-white/20 animate-pulse">:</span>
                {/* Minute Dial */}
                <Wheel items={MINUTES} selected={minute} onSelect={setMinute} label="MIN" />
            </div>
            <div className="text-center pt-2">
                <p className="text-2xl font-black italic text-white glass-text tracking-widest">
                    {parseInt(hour) % 12 || 12}:{minute} {parseInt(hour) >= 12 ? 'PM' : 'AM'}
                </p>
            </div>
        </div>
    );
};

interface WheelProps {
    items: string[];
    selected: string;
    onSelect: (val: string) => void;
    label: string;
}

const Wheel: React.FC<WheelProps> = ({ items, selected, onSelect, label }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Simple vertical scroll implementation
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const top = e.currentTarget.scrollTop;
        const itemHeight = 40;
        const index = Math.round(top / itemHeight);
        if (items[index] && items[index] !== selected) {
            onSelect(items[index]);
        }
    };

    return (
        <div className="relative flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-600 mb-2 uppercase tracking-tighter">{label}</span>
            <div className="h-40 w-16 relative overflow-hidden flex flex-col items-center">
                {/* Highlight box */}
                <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 bg-primary/10 border-y border-primary/20 pointer-events-none rounded-lg" />

                <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="h-full w-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory py-16"
                >
                    {items.map((item) => (
                        <div
                            key={item}
                            className={`h-10 flex items-center justify-center snap-center transition-all duration-300 ${selected === item ? 'text-primary scale-125 font-black' : 'text-slate-600 text-sm font-bold'
                                }`}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TimeDialPicker;
