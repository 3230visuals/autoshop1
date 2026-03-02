import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const DownloadPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    const isClientContext = searchParams.get('role') === 'client' || searchParams.get('invite') === 'true';

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white p-6 safe-top flex flex-col">
            <header className="py-8 text-center space-y-2">
                <div className="size-20 bg-primary/20 rounded-[2rem] border-2 border-primary/30 flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                    <img src="/icons/icon.png" alt="Service Bay Software" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter">Install Service Bay Software</h1>
                <p className="text-[10px] font-bold text-primary/80 uppercase tracking-[0.4em]">Official Native Experience</p>
            </header>

            <main className="flex-1 max-w-sm mx-auto w-full py-4 space-y-10">
                {/* Instant Instruction Hook */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary italic animate-pulse">
                        <span className="material-symbols-outlined text-sm">bolt</span>
                        Instant Native Access
                    </div>
                    <p className="text-slate-400 text-sm font-medium px-4">
                        Service Bay Software runs as a native app on your device. Follow these quick steps to add it to your apps:
                    </p>
                </div>

                {/* Direct Visual Guide */}
                <section className="space-y-6">
                    {isIOS ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-6 group">
                                <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white group-hover:border-primary/40 transition-colors">1</div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Step One</p>
                                    <p className="text-lg font-bold">Tap the <span className="bg-white/10 px-2 py-1 rounded inline-flex items-center gap-1"><span className="material-symbols-outlined text-primary text-xl">ios_share</span> Share</span> button</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 group">
                                <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white group-hover:border-primary/40 transition-colors">2</div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Step Two</p>
                                    <p className="text-lg font-bold">Scroll to <span className="text-primary">Add to Home Screen</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 group">
                                <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white group-hover:border-primary/40 transition-colors">3</div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Step Three</p>
                                    <p className="text-lg font-bold">Tap <span className="text-primary font-black">ADD</span> in the corner</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-6 group">
                                <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white group-hover:border-primary/40 transition-colors">1</div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Step One</p>
                                    <p className="text-lg font-bold">Tap the <span className="bg-white/10 px-2 py-1 rounded inline-flex items-center gap-1"><span className="material-symbols-outlined text-primary text-xl">more_vert</span> Menu</span> icon</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 group">
                                <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white group-hover:border-primary/40 transition-colors">2</div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Step Two</p>
                                    <p className="text-lg font-bold text-primary">Tap "Install App"</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 group">
                                <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white group-hover:border-primary/40 transition-colors">3</div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Step Three</p>
                                    <p className="text-lg font-bold">Confirm in the popup</p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            <footer className="py-12 text-center space-y-6">
                <div className="bg-card-dark border border-white/5 rounded-3xl p-6 text-center">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">App Store Status</h4>
                    <p className="text-[12px] font-bold text-slate-300 italic">Submitting to iOS & Android Stores Soon...</p>
                </div>

                <button
                    onClick={() => {
                        if (isClientContext) {
                            void navigate(`/welcome?${searchParams.toString()}`);
                        } else {
                            window.history.back();
                        }
                    }}
                    className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                    &larr; {isClientContext ? 'Return to Setup' : 'Return to Dashboard'}
                </button>
            </footer>
        </div>
    );
};

export default DownloadPage;
