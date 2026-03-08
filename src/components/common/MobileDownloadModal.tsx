import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileDownloadModal: React.FC<MobileDownloadModalProps> = ({ isOpen, onClose }) => {
    const appUrl = window.location.origin;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mirror-card w-full max-w-[360px] rounded-[2.5rem] p-8 border-white/10 relative overflow-hidden text-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                        <div className="relative z-10 space-y-6">
                            {/* Header */}
                            <div className="space-y-2">
                                <div className="size-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 mx-auto shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                    <span className="material-symbols-outlined text-3xl text-primary">install_mobile</span>
                                </div>
                                <h3 className="text-2xl font-black text-white font-header tracking-tight">Install App</h3>
                                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest px-4">Get ShopReady on your phone</p>
                            </div>

                            {/* QR Code Section */}
                            <div className="space-y-3">
                                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                                    Scan to open
                                </div>
                                <div className="p-3 bg-white rounded-3xl inline-block shadow-2xl border-4 border-white">
                                    <img src={qrImageUrl} alt="Download App QR" className="size-32" />
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="text-left space-y-4 pt-2">
                                <div className="flex gap-4 items-start bg-white/5 border border-white/5 rounded-2xl p-4">
                                    <div className="size-8 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0 border border-blue-500/30">
                                        <span className="material-symbols-outlined text-lg text-blue-400">apple</span>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase tracking-wider mb-1">On iOS (Safari)</p>
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                            Tap <span className="text-blue-400 font-bold">Share</span> button and select <br />
                                            <span className="text-blue-400 font-bold">"Add to Home Screen"</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start bg-white/5 border border-white/5 rounded-2xl p-4">
                                    <div className="size-8 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0 border border-green-500/30">
                                        <span className="material-symbols-outlined text-lg text-green-400">android</span>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase tracking-wider mb-1">On Android (Chrome)</p>
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                            Tap <span className="text-green-400 font-bold">Menu</span> (3 dots) and select <br />
                                            <span className="text-green-400 font-bold">"Install App"</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:bg-white/10 transition-all mt-4"
                            >
                                Close Guide
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MobileDownloadModal;
