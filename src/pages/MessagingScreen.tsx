import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { motion } from 'framer-motion';
import type { Message } from '../context/AppTypes';

/* ── Helpers ──────────────────────────────── */
const formatTime = (ts: number) => {
    const d = new Date(ts);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m} ${ampm}`;
};

const formatDateLabel = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* ── Chat Bubble ──────────────────────────── */
const ChatBubble = ({ message, isSelf }: { message: Message, isSelf: boolean }) => {
    return (
        <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-5`}>
            {/* Other's avatar */}
            {!isSelf && (
                <div className="flex-shrink-0 size-10 rounded-xl bg-orange-500/20 flex items-center justify-center mr-3 mt-auto mb-1 border border-orange-500/10">
                    <span className="text-orange-500 text-[11px] font-black uppercase">
                        {message.sender === 'shop' ? 'MV' : 'CL'}
                    </span>
                </div>
            )}
            <div className={`max-w-[82%] relative group`}>
                <div
                    className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${isSelf
                        ? 'bg-orange-500 text-zinc-950 rounded-br-md font-bold shadow-lg shadow-orange-500/20'
                        : 'bg-white/5 border border-white/10 text-slate-100 rounded-bl-md'
                        }`}
                >
                    {message.text}
                </div>
                <span
                    className={`text-[11px] text-slate-600 mt-2 block font-bold uppercase tracking-widest ${isSelf ? 'text-right mr-1' : 'ml-1'}`}
                >
                    {formatTime(message.timestamp)}
                </span>
            </div>
            {/* Self avatar (optional) */}
        </div>
    );
};

/* ── Typing Indicator ─────────────────────── */
const TypingIndicator = ({ label }: { label: string }) => (
    <div className="flex justify-start mb-5">
        <div className="flex-shrink-0 size-10 rounded-xl bg-orange-500/20 flex items-center justify-center mr-3 mt-auto mb-1 border border-orange-500/10">
            <span className="text-orange-500 text-[11px] font-black uppercase">{label}</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-6 py-4 flex items-center gap-2 shadow-inner">
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0ms]"></span>
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:150ms]"></span>
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:300ms]"></span>
        </div>
    </div>
);

/* ── Quick Reply Chips ────────────────────── */
const QUICK_REPLIES = [
    'When will my car be ready?',
    'Can I see photos?',
    'How much will it cost?',
    'Sounds good, thanks!',
];

interface MessageNavigationState {
    clientName?: string;
    vehicle?: string;
    tag?: string;
}

const MessagingScreen = () => {
    const location = useLocation();
    const state = location.state as MessageNavigationState;
    const navigate = useNavigate();
    const { messages, sendMessage, shopTyping, vehicle, currentUser } = useAppContext();

    // Use state-passed client info or fallback to context defaults
    const chatClientName = state?.clientName || (currentUser.role === 'CLIENT' ? 'Shop Support' : 'Customer Chat');
    const chatVehicle = state?.vehicle || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    const chatTag = state?.tag || vehicle.tag;

    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isStaff = currentUser.role === 'OWNER' || currentUser.role === 'OWNER' || currentUser.role === 'STAFF';

    // Auto-scroll to bottom when new messages arrive or typing starts
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, shopTyping]);

    const handleSend = () => {
        const text = input.trim();
        if (!text) return;
        sendMessage(text);
        setInput('');
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Group messages by date
    const groupedMessages: { label: string; msgs: Message[] }[] = [];
    let lastLabel = '';
    for (const msg of messages) {
        const label = formatDateLabel(msg.timestamp);
        if (label !== lastLabel) {
            groupedMessages.push({ label, msgs: [msg] });
            lastLabel = label;
        } else {
            groupedMessages[groupedMessages.length - 1].msgs.push(msg);
        }
    }

    return (
        <div className="bg-[#0a0a0c] font-sans text-slate-100 min-h-screen flex flex-col relative overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5 safe-top">
                <div className="flex items-center px-5 py-4">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(-1)}
                        className="flex size-11 items-center justify-center rounded-xl bg-white/2 border border-white/5 transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-400 text-xl">arrow_back</span>
                    </motion.button>
                    {/* Chat Identity */}
                    <div className="flex items-center gap-4 flex-1 ml-3">
                        <div className="relative">
                            <div className="size-11 rounded-xl bg-orange-500/10 flex items-center justify-center overflow-hidden border border-orange-500/20 shadow-lg shadow-orange-500/5">
                                {isStaff ? (
                                    <span className="text-orange-500 font-black text-xs uppercase">
                                        {chatClientName.substring(0, 2)}
                                    </span>
                                ) : (
                                    <span className="text-orange-500 font-black text-sm uppercase">SR</span>
                                )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0a0c]"></div>
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-bold text-[15px] tracking-tight truncate">
                                {isStaff ? chatClientName : 'ShopReady Premium'}
                            </h1>
                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">
                                {isStaff ? 'Client • Online' : 'Online • Marcus V.'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/report')}
                        className="flex size-11 items-center justify-center rounded-xl bg-white/2 border border-white/5 transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-400 text-xl">analytics</span>
                    </motion.button>
                </div>

                {/* Vehicle context bar */}
                <div className="flex items-center gap-2.5 px-6 pb-4">
                    <span className="material-symbols-outlined text-orange-500 text-base">directions_car</span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 truncate">
                        {chatVehicle} • {chatTag}
                    </span>
                </div>
            </header>

            {/* ── Messages Area ── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-8 relative z-10 pb-44">
                {groupedMessages.map((group) => (
                    <div key={group.label}>
                        {/* Date separator */}
                        <div className="flex items-center justify-center my-8">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 bg-white/2 px-5 py-2 rounded-full border border-white/5 backdrop-blur-md">
                                {group.label}
                            </span>
                        </div>
                        {group.msgs.map((msg) => {
                            const isSelf = isStaff ? msg.sender === 'shop' : msg.sender === 'client';
                            return <ChatBubble key={msg.id} message={msg} isSelf={isSelf} />;
                        })}
                    </div>
                ))}
                {shopTyping && <TypingIndicator label={isStaff ? 'CL' : 'SR'} />}
            </div>

            {/* ── Footer Continer ── */}
            <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#0a0a0c]/90 backdrop-blur-2xl border-t border-white/5 safe-bottom">
                {/* ── Quick Replies ── */}
                {!shopTyping && !isStaff && messages.length <= 4 && (
                    <div className="px-5 pt-5 pb-2 flex gap-3 overflow-x-auto no-scrollbar relative z-10">
                        {QUICK_REPLIES.map((text) => (
                            <motion.button
                                key={text}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => sendMessage(text)}
                                className="flex-shrink-0 text-[11px] font-bold uppercase tracking-widest text-orange-500 bg-orange-500/10 border border-orange-500/20 px-5 py-3 rounded-xl transition-all whitespace-nowrap"
                            >
                                {text}
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* ── Input Bar ── */}
                <div className="px-5 py-5 flex items-center gap-3">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="w-full h-[56px] bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 text-[15px] font-bold text-white placeholder-slate-700 focus:border-orange-500/30 outline-none transition-all shadow-inner"
                        />
                        {/* Attachment icon inside input */}
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors size-10 flex items-center justify-center"
                            onClick={() => { }}
                        >
                            <span className="material-symbols-outlined text-xl">attach_file</span>
                        </button>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={`flex items-center justify-center size-[56px] rounded-2xl transition-all ${input.trim()
                            ? 'bg-orange-500 text-zinc-950 shadow-xl shadow-orange-900/30'
                            : 'bg-white/2 text-slate-700 border border-white/5'
                            }`}
                    >
                        <span className="material-symbols-outlined text-2xl font-bold">send</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default MessagingScreen;
