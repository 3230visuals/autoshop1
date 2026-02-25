import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { generateInvoice } from '../utils/generateInvoice';
import { motion } from 'framer-motion';

const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();
    const { order, vehicle, resetOrder, showToast } = useAppContext();
    const [rating, setRating] = useState(4);
    const [feedback, setFeedback] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    const handleSubmitReview = () => {
        setReviewSubmitted(true);
        showToast(`Thanks for your ${rating}-star review!`);
    };

    const handleReturnDashboard = () => {
        resetOrder();
        navigate('/dashboard/owner');
    };

    return (
        <div className="bg-[#0a0a0c] font-sans text-slate-100 min-h-screen flex flex-col items-center relative overflow-hidden pb-12">
            {/* Ambient Background Glows */}
            <div className="glow-mesh top-[-100px] left-[-100px] opacity-20" />
            <div className="glow-mesh bottom-[-100px] right-[-100px] opacity-10" />

            {/* Main Container */}
            <main className="relative z-10 w-full max-w-md min-h-screen flex flex-col p-8 safe-bottom">
                {/* Top: Close Button */}
                <div className="flex justify-end pt-6 mb-12">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleReturnDashboard}
                        className="text-slate-500 hover:text-white transition-colors size-14 flex items-center justify-center rounded-2xl bg-white/2 border border-white/5"
                    >
                        <span className="material-symbols-outlined text-[32px]">close</span>
                    </motion.button>
                </div>

                {/* Success Icon */}
                <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center size-48 mb-14">
                        <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
                        <div className="relative flex items-center justify-center size-36 bg-[#0a0a0c] border-[3px] border-emerald-500/40 rounded-full shadow-[0_0_80px_rgba(52,211,153,0.3)]">
                            <span className="material-symbols-outlined text-emerald-400 text-[80px] drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]">
                                check
                            </span>
                        </div>
                    </div>

                    {/* Success Text */}
                    <h1 className="text-[40px] font-black text-white italic tracking-tighter text-center mb-5 uppercase leading-none">
                        Payment<br />Complete
                    </h1>
                    <p className="text-slate-500 text-[15px] font-bold uppercase tracking-[0.25em] leading-relaxed text-center max-w-[320px]">
                        Transaction successful. A digital receipt has been sent to your registry.
                    </p>
                </div>

                {/* Receipt Card */}
                <div className="glass-card rounded-[2.5rem] p-10 mt-14 border border-white/5 bg-white/2">
                    <div className="flex items-center justify-between mb-10">
                        <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-slate-600">Order Record</span>
                        <span className="text-[12px] bg-primary/10 text-primary px-5 py-2 rounded-xl border border-primary/20 font-black uppercase tracking-widest tabular-nums">{order.orderNumber}</span>
                    </div>
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 font-bold uppercase tracking-[0.25em] text-[11px]">Settle Amount</span>
                            <span className="font-black text-white text-[32px] tracking-tighter tabular-nums leading-none">${order.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 font-bold uppercase tracking-[0.25em] text-[11px]">Registry ID</span>
                            <span className="font-black text-white uppercase tracking-wider text-[15px] tabular-nums">{order.orderNumber}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 font-bold uppercase tracking-[0.25em] text-[11px]">Protocol</span>
                            <span className="font-black text-white uppercase tracking-wider text-[15px]">{order.paymentMethod || 'Auth Card'}</span>
                        </div>
                    </div>
                </div>

                {/* Download Invoice */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => generateInvoice(order, vehicle)}
                    className="w-full h-[64px] flex items-center justify-center gap-4 mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 text-[14px] font-black text-slate-300 uppercase tracking-[0.3em] shadow-xl"
                >
                    <span className="material-symbols-outlined text-2xl text-primary">download</span>
                    Download Invoice
                </motion.button>

                {/* Rating Section */}
                <div className="glass-card rounded-[2.5rem] p-10 mt-12 border border-white/5 bg-white/2">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Protocol Rating</h2>
                        <p className="text-[12px] text-slate-600 font-bold uppercase tracking-[0.25em] mt-3">Help us optimize service protocols.</p>
                    </div>
                    {/* Stars */}
                    <div className="flex justify-center gap-5 mb-10">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                                key={star}
                                whileTap={{ scale: 1.25, rotate: 15 }}
                                onClick={() => setRating(star)}
                                className="transition-all"
                                disabled={reviewSubmitted}
                            >
                                <span
                                    className={`material-symbols-outlined text-[56px] ${star <= rating
                                        ? 'fill text-primary drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                                        : 'text-zinc-900'
                                        }`}
                                >
                                    star
                                </span>
                            </motion.button>
                        ))}
                    </div>
                    {/* Feedback */}
                    {!reviewSubmitted ? (
                        <div className="space-y-8">
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full bg-[#0a0a0c] border border-white/10 rounded-[1.5rem] p-6 text-[17px] font-bold text-white placeholder-slate-900 focus:ring-2 focus:ring-primary/30 outline-none resize-none transition-all h-40 shadow-inner"
                                placeholder="Operational feedback..."
                            ></textarea>
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={handleSubmitReview}
                                className="w-full h-[72px] bg-primary text-white font-black text-[15px] uppercase tracking-[0.3em] rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center justify-center gap-4"
                            >
                                SUBMIT FEEDBACK
                                <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                            </motion.button>
                        </div>
                    ) : (
                        <div className="text-center py-10 animate-in zoom-in duration-500">
                            <div className="size-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
                                <span className="material-symbols-outlined text-primary text-5xl">task_alt</span>
                            </div>
                            <p className="text-[15px] font-black text-primary uppercase tracking-[0.3em]">Feedback Logged</p>
                        </div>
                    )}
                </div>

                {/* Social Links */}
                <div className="flex flex-col items-center gap-6 mt-12 pb-10">
                    <p className="text-slate-600 text-[12px] font-bold uppercase tracking-[0.3em]">Rate us on Digital Registries</p>
                    <div className="flex gap-8">
                        {[
                            { label: 'G', color: 'blue' },
                            { label: 'Y!', color: 'red' }
                        ].map((social) => (
                            <motion.button
                                key={social.label}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => showToast(`${social.label} Reviews: coming soon!`)}
                                className="flex items-center justify-center size-16 rounded-[1.25rem] bg-white/2 border border-white/5 hover:border-primary/30 transition-all group shadow-lg"
                            >
                                <span className="text-white font-black text-2xl group-hover:text-primary transition-colors uppercase">{social.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Return Button */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReturnDashboard}
                    className="w-full h-[72px] flex items-center justify-center gap-4 bg-white/2 border border-white/10 rounded-[1.5rem] font-black text-slate-300 hover:bg-white/5 transition-all mb-12 uppercase text-[15px] tracking-[0.3em] shadow-xl"
                >
                    <span className="material-symbols-outlined text-2xl">home</span>
                    Return to Hub
                </motion.button>
            </main>
        </div>
    );
};

export default PaymentSuccess;
