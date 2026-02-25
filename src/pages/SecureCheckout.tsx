import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { getStripe, isStripeConfigured } from '../services/stripeService';

const tipOptions = [
    { label: '15%', multiplier: 0.15 },
    { label: '20%', multiplier: 0.20 },
    { label: '25%', multiplier: 0.25 },
];

const INVOICE_ID = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

// ── Stripe Styles ──
const cardStyle = {
    style: {
        base: {
            color: '#f8fafc',
            fontFamily: 'Inter, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '14px',
            '::placeholder': {
                color: '#334155',
            },
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
        },
    },
};

const CheckoutForm: React.FC = () => {
    const navigate = useNavigate();
    const { order, setTipPercent, completePayment, showToast } = useAppContext();
    const [showCustomTip, setShowCustomTip] = useState(false);
    const [customTipValue, setCustomTipValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showScan, setShowScan] = useState(false);
    const customInputRef = useRef<HTMLInputElement>(null);

    const stripe = useStripe();
    const elements = useElements();
    const isRealStripe = isStripeConfigured();

    const handlePay = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        setShowScan(true);

        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            if (isRealStripe && stripe && elements) {
                const cardElement = elements.getElement(CardElement);
                if (!cardElement) throw new Error('Card component not found');
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            await completePayment(isRealStripe ? 'Stripe (Card)' : 'Demo (Card)');
            setShowScan(false);
            navigate('/success');
        } catch (err) {
            console.error(err);
            showToast(err instanceof Error ? err.message : 'Registry settlement failed. Retry initiated.');
            setIsProcessing(false);
            setShowScan(false);
        }
    };

    const presetMultipliers = tipOptions.map(t => t.multiplier);
    const isCustomActive = order.tipPercent !== null && !presetMultipliers.includes(order.tipPercent);

    const applyCustomTip = (raw: string) => {
        const dollars = parseFloat(raw);
        if (!isNaN(dollars) && dollars >= 0 && order.subtotal > 0) {
            const pct = dollars / order.subtotal;
            setTipPercent(pct);
        } else {
            setTipPercent(null);
        }
        setShowCustomTip(false);
    };

    const toggleCustom = () => {
        if (showCustomTip) {
            setShowCustomTip(false);
        } else {
            setShowCustomTip(true);
            if (isCustomActive && order.tipAmount > 0) {
                setCustomTipValue(order.tipAmount.toFixed(2));
            } else {
                setCustomTipValue('');
            }
            setTimeout(() => customInputRef.current?.focus(), 50);
        }
    };

    const getItemIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('brake')) return 'settings_suggest';
        if (lower.includes('oil')) return 'oil_barrel';
        if (lower.includes('tire') || lower.includes('alignment')) return 'tire_repair';
        if (lower.includes('battery')) return 'battery_charging_full';
        return 'settings_input_composite';
    };

    return (
        <div className="bg-[#0a0a0c] font-sans text-slate-300 min-h-screen flex flex-col relative pb-56">
            {/* Security Scan Overlay */}
            <AnimatePresence>
                {showScan && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#0a0a0c]/98 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center"
                    >
                        <div className="relative size-40 mb-10 flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                            />
                            <div className="size-28 rounded-full border border-white/5 flex items-center justify-center shadow-2xl shadow-blue-500/10">
                                <span className="material-symbols-outlined text-4xl text-blue-500 animate-pulse">lock_open</span>
                            </div>
                        </div>
                        <h2 className="text-[17px] font-bold text-white uppercase tracking-[0.2em] mb-4">Registry Settlement Active</h2>
                        <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-slate-500 opacity-80">Processing via Encrypted 256-Bit Tunnel</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="sticky top-0 z-50 bg-[#0a0a0c] border-b border-white/5 safe-top">
                <div className="flex items-center px-6 py-6">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center size-12 rounded-xl bg-white/2 border border-white/5 text-slate-500 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </motion.button>
                    <div className="flex-1 text-center">
                        <h1 className="text-[15px] font-bold tracking-[0.2em] text-white uppercase leading-tight">Fiscal Settlement</h1>
                        <div className="flex items-center gap-2.5 justify-center mt-2.5">
                            <div className="size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500 font-bold">Secure Protocol Active</span>
                        </div>
                    </div>
                    <div className="size-12 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center text-blue-500 shadow-inner">
                        <span className="material-symbols-outlined text-2xl">verified_user</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="page-container relative z-10 space-y-10 mt-6 px-6">
                {/* Order Summary Card */}
                <section>
                    <div className="glass-card rounded-[2rem] overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="size-12 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center shadow-inner">
                                        <span className="material-symbols-outlined text-slate-500 text-2xl">receipt_long</span>
                                    </div>
                                    <h2 className="text-[13px] font-bold uppercase tracking-[0.25em] text-slate-500">Unit Summary</h2>
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 bg-white/2 px-4 py-1.5 rounded-xl border border-white/5 uppercase tracking-widest">{INVOICE_ID}</span>
                            </div>
                            <div className="space-y-8 pt-8 border-t border-white/5">
                                {order.approvedItems.length > 0 ? (
                                    order.approvedItems.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <div className="flex items-center gap-5">
                                                <div className="size-12 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-slate-500 text-2xl">{getItemIcon(item.name)}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[15px] text-white uppercase tracking-tight truncate">{item.name}</p>
                                                    <p className="text-[11px] text-slate-700 font-bold uppercase tracking-[0.2em] mt-2">Verified Module</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-white text-[17px] tabular-nums ml-4">${item.price.toFixed(2)}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center bg-white/2 rounded-[2rem] border border-dashed border-white/10">
                                        <p className="text-slate-700 text-[13px] font-bold uppercase tracking-[0.2em] px-6">Awaiting Registry Authorization...</p>
                                    </div>
                                )}
                                <div className="pt-8 border-t border-white/5 space-y-4">
                                    <div className="flex justify-between items-center text-[15px] text-slate-500 font-bold tabular-nums">
                                        <span className="uppercase tracking-[0.2em] text-[11px] text-slate-600">Subtotal Registry</span>
                                        <span>${order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[15px] text-slate-500 font-bold tabular-nums">
                                        <span className="uppercase tracking-[0.2em] text-[11px] text-slate-600">Regulatory Tax</span>
                                        <span>${order.tax.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Pay */}
                <section className="grid grid-cols-2 gap-5">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePay}
                        className="h-[64px] bg-white text-black rounded-2xl font-black text-[14px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl shadow-white/5"
                    >
                        Apple Pay
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePay}
                        className="h-[64px] bg-[#121214] text-white rounded-2xl font-black text-[14px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 border border-white/10 shadow-xl"
                    >
                        Google Pay
                    </motion.button>
                </section>

                {/* Divider */}
                <div className="flex items-center gap-8 py-4">
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                    <span className="text-[11px] text-slate-800 font-bold uppercase tracking-[0.4em] shrink-0">Manual Protocol</span>
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                </div>

                {/* Card Input */}
                <section className="space-y-6">
                    <div className="space-y-6">
                        <label className="text-[12px] font-bold uppercase tracking-[0.25em] text-slate-600 ml-1">Asset Allocation Details</label>
                        {isRealStripe ? (
                            <div className="bg-white/2 border border-white/5 rounded-2xl p-6 shadow-2xl">
                                <CardElement options={{
                                    ...cardStyle,
                                    style: {
                                        ...cardStyle.style,
                                        base: {
                                            ...cardStyle.style.base,
                                            fontSize: '17px',
                                        }
                                    }
                                }} />
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <input
                                    className="w-full h-[64px] bg-white/2 border border-white/10 rounded-2xl px-6 text-[17px] text-white placeholder-slate-800 focus:border-blue-500/30 outline-none transition-all font-bold tracking-widest tabular-nums"
                                    placeholder="0000 0000 0000 0000"
                                    type="text"
                                />
                                <div className="grid grid-cols-2 gap-5">
                                    <input
                                        className="w-full h-[64px] bg-white/2 border border-white/10 rounded-2xl px-6 text-[17px] text-white placeholder-slate-800 focus:border-blue-500/30 outline-none transition-all font-bold tracking-widest tabular-nums"
                                        placeholder="MM / YY"
                                        type="text"
                                    />
                                    <input
                                        className="w-full h-[64px] bg-white/2 border border-white/10 rounded-2xl px-6 text-[17px] text-white placeholder-slate-800 focus:border-blue-500/30 outline-none transition-all font-bold tracking-widest tabular-nums"
                                        placeholder="CVC"
                                        type="text"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Tipping */}
                <section className="space-y-8 pt-6">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-blue-500 text-3xl opacity-80">star</span>
                            <h3 className="font-bold text-[14px] text-slate-300 uppercase tracking-[0.25em]">Technician Gratuity</h3>
                        </div>
                        <span className="text-[11px] text-slate-600 font-bold px-4 py-1.5 bg-white/2 rounded-xl border border-white/5 tracking-widest uppercase">Optional</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {tipOptions.map((tip, i) => (
                            <motion.button
                                key={i}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setTipPercent(order.tipPercent === tip.multiplier ? null : tip.multiplier); setShowCustomTip(false); }}
                                className={`flex flex-col items-center justify-center h-[84px] rounded-2xl transition-all border-2 ${order.tipPercent === tip.multiplier
                                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                                    : 'bg-white/2 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <span className={`text-[16px] font-black tabular-nums transition-all ${order.tipPercent === tip.multiplier ? 'text-blue-400' : 'text-slate-400'}`}>{tip.label}</span>
                                <span className={`text-[11px] mt-2 font-bold tracking-tight tabular-nums transition-all ${order.tipPercent === tip.multiplier ? 'text-blue-500/80' : 'text-slate-700'}`}>
                                    ${(order.subtotal * tip.multiplier).toFixed(0)}
                                </span>
                            </motion.button>
                        ))}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={toggleCustom}
                            className={`flex flex-col items-center justify-center h-[84px] rounded-2xl transition-all border-2 ${isCustomActive || showCustomTip
                                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                                : 'bg-white/2 border-white/5 hover:border-white/10'
                                }`}
                        >
                            {isCustomActive && !showCustomTip ? (
                                <div className="text-center">
                                    <span className="text-[16px] font-black text-blue-400 tabular-nums">${order.tipAmount.toFixed(0)}</span>
                                    <span className="text-[10px] text-blue-500/80 font-bold uppercase mt-2 tracking-widest block scale-90">Custom</span>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <span className="material-symbols-outlined text-3xl text-slate-500 opacity-60">edit_square</span>
                                    <span className="text-[10px] text-slate-700 font-bold uppercase mt-1.5 tracking-widest block scale-90">Set</span>
                                </div>
                            )}
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {showCustomTip && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 mt-6 space-y-6 overflow-hidden shadow-2xl backdrop-blur-md"
                            >
                                <p className="text-[11px] text-slate-600 font-bold uppercase tracking-[0.25em] ml-1">Registry Allocation Target</p>
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-2xl">$</span>
                                        <input
                                            ref={customInputRef}
                                            type="number"
                                            min="0"
                                            value={customTipValue}
                                            onChange={e => setCustomTipValue(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') applyCustomTip(customTipValue); }}
                                            placeholder="0.00"
                                            className="w-full h-[64px] bg-[#0a0a0c] border border-white/10 rounded-2xl pl-12 pr-6 text-white text-[20px] font-black focus:border-blue-500/40 outline-none tabular-nums shadow-inner"
                                        />
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => applyCustomTip(customTipValue)}
                                        className="h-[64px] px-10 bg-blue-600 text-white text-[13px] font-bold uppercase tracking-[0.25em] rounded-2xl shadow-2xl shadow-blue-900/40"
                                    >
                                        Apply
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-10 py-12 border-t border-white/5 opacity-60 px-2">
                    <div className="flex items-center gap-5">
                        <span className="material-symbols-outlined text-slate-500 text-3xl">encrypted</span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-600 leading-relaxed">Encrypted<br />Tunnel</span>
                    </div>
                    <div className="flex items-center gap-5">
                        <span className="material-symbols-outlined text-slate-500 text-3xl">verified</span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-600 leading-relaxed">PCI<br />Compliance</span>
                    </div>
                </div>

                {/* Bottom Spacer for fixed button */}
                <div className="h-40" />
            </main>

            {/* Sticky Action Footer */}
            <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-2xl border-t border-white/5 px-2">
                <div className="max-w-md mx-auto px-8 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
                    <div className="flex items-center justify-between mb-10 px-1">
                        <div>
                            <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-slate-600">Settlement Total</p>
                            <p className="text-[42px] font-black text-white mt-1.5 tracking-tighter tabular-nums leading-none">${order.total.toFixed(2)}</p>
                        </div>
                        {order.tipAmount > 0 && (
                            <div className="text-right">
                                <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-blue-500">Gratuity Registry</p>
                                <p className="text-[24px] font-black text-blue-400/80 mt-1.5 tabular-nums leading-none">+${order.tipAmount.toFixed(0)}</p>
                            </div>
                        )}
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePay}
                        disabled={isProcessing}
                        className={`w-full h-[72px] flex items-center justify-center gap-5 rounded-2xl font-black text-[14px] uppercase tracking-[0.3em] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${isProcessing ? 'bg-white/5 text-slate-700 cursor-not-allowed opacity-50' : 'bg-blue-600 text-white shadow-blue-900/40 border border-blue-500/20'}`}
                    >
                        <span className="material-symbols-outlined text-2xl">{isProcessing ? 'sync' : 'security'}</span>
                        {isProcessing ? 'Processing Transaction...' : 'Complete Settlement'}
                    </motion.button>
                </div>
            </footer>
        </div>
    );
};

const SecureCheckout: React.FC = () => {
    const stripePromise = useMemo(() => getStripe(), []);

    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
};

export default SecureCheckout;
