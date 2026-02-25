import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const InstallGuide: React.FC = () => {
    const navigate = useNavigate();

    const installSteps = [
        {
            id: 1,
            icon: 'ios_share',
            title: 'Tap Share',
            desc: 'Tap the share icon in your browser toolbar.'
        },
        {
            id: 2,
            icon: 'add_box',
            title: 'Add to Home Screen',
            desc: 'Scroll down and select "Add to Home Screen".'
        },
        {
            id: 3,
            icon: 'apps',
            title: 'Launch App',
            desc: 'Open Stitch from your home screen for the full experience.'
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-slate-100 font-display safe-top safe-bottom">
            {/* App Store Header Style */}
            <header className="p-6 pt-10 flex items-start gap-4">
                <div className="size-24 rounded-[22%] overflow-hidden shadow-2xl border border-white/5 bg-background-dark p-2">
                    <img src="/vite.svg" alt="Stitch Icon" className="w-full h-full" />
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-black tracking-tight">Stitch Auto Hub</h1>
                    <p className="text-sm text-primary font-bold uppercase tracking-widest italic">Elite Workshop SaaS</p>
                    <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <span key={i} className="material-symbols-outlined text-xs text-primary fill-1">star</span>
                        ))}
                        <span className="text-[10px] text-slate-500 font-black ml-1 uppercase">5.0 Perfect</span>
                    </div>
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        const el = document.getElementById('steps');
                        el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-primary text-zinc-950 px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                >
                    Get
                </motion.button>
            </header>

            <div className="px-6 border-y border-white/5 py-3 flex justify-between overflow-x-auto no-scrollbar">
                <div className="text-center px-4 border-r border-white/5 whitespace-nowrap">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Age</p>
                    <p className="text-sm font-black italic">4+</p>
                </div>
                <div className="text-center px-4 border-r border-white/5 whitespace-nowrap">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Developer</p>
                    <p className="text-sm font-black italic">STITCH</p>
                </div>
                <div className="text-center px-4 whitespace-nowrap">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Size</p>
                    <p className="text-sm font-black italic">4.2 MB</p>
                </div>
            </div>

            <main className="p-6 space-y-10">
                {/* 📸 Screenshot Carousel Simulation */}
                <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Preview</h2>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex-none w-[240px] aspect-[9/19.5] rounded-3xl bg-zinc-900 border border-white/10 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                                    <div className="space-y-4">
                                        <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
                                            <span className="material-symbols-outlined text-4xl text-primary">
                                                {i === 1 ? 'bar_chart' : i === 2 ? 'health_and_safety' : 'inventory'}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest">
                                            {i === 1 ? 'Precision Analytics' : i === 2 ? 'Diagnostic Speed' : 'Smart Inventory'}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-medium">Professional grade workshop management at your fingertips.</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 📝 Installation Steps */}
                <section id="steps" className="space-y-6 pt-4">
                    <header>
                        <h2 className="text-xl font-black italic uppercase tracking-tight glass-text">How to Install</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Enable Mobile App Experience</p>
                    </header>

                    <div className="space-y-4">
                        {installSteps.map((step) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: step.id * 0.1 }}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
                            >
                                <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary">{step.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">{step.title}</h3>
                                    <p className="text-xs text-slate-400 font-medium">{step.desc}</p>
                                </div>
                                <div className="ml-auto text-primary/20 font-black text-3xl">0{step.id}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="pt-8 pb-12">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/')}
                        className="w-full py-4 rounded-2xl bg-zinc-900 border border-white/10 text-sm font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                    >
                        Back to Browser Version
                    </motion.button>
                </section>
            </main>

            {/* Sticky Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pointer-events-none">
                <div className="max-w-[382px] mx-auto pointer-events-auto">
                    <motion.button
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        onClick={() => navigate('/')}
                        className="w-full py-4 rounded-2xl bg-primary text-zinc-950 font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-2"
                    >
                        <span>Launch Web App</span>
                        <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default InstallGuide;
