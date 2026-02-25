import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const WelcomeScreen = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role');
    const isClientInvite = role === 'client';

    return (
        <div className="font-sans text-slate-300 antialiased overflow-x-hidden min-h-screen flex flex-col relative w-full bg-[#0a0a0c]">
            {/* Background Image Container */}
            <div className="absolute inset-0 z-0">
                <img
                    alt="Cinematic Dark Studio Background"
                    className="h-full w-full object-cover scale-105 opacity-40 grayscale saturate-50"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8kxFry5s_zjUOuyymrEbKK8R6gFy4lR32bNO50AhhkilISOFF7iMiIUzzVefGo1uFtcu2Rr-UBeeUddjrcoXYi3UPp--q2GjA6vTlavK9Kb33SQM7I6qs1pfZVYxsh4f-6ugXXSAqATVrmTcJr3QuzqvZ8VxUAI7XK98HJiPpkQowsrLpddnMsIPbutCf9Qd5pjwjknPaOOK9HfOD8SK_RIubRzrTvDFktyhdmkdgyQCJIlFYsPY5-u7KDIPtXU8-k4xRC_iaOQ"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/80 via-transparent to-[#0a0a0c] z-10"></div>
            </div>

            {/* Header: Minimalist Branding */}
            <header className="relative z-20 pt-16 px-6 flex justify-center items-center safe-top">
                <div className="flex items-center gap-4">
                    <div className="size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-primary text-2xl font-light">handyman</span>
                    </div>
                    <h2 className="text-[15px] font-bold tracking-[0.4em] uppercase text-white opacity-80">STITCH_AUTO</h2>
                </div>
            </header>

            {/* Main Content Section */}
            <main className="relative z-20 px-8 flex flex-col items-center text-center my-auto max-w-sm mx-auto w-full">
                <div className="mb-14 space-y-8">
                    <h1 className="text-[48px] font-black leading-[0.95] tracking-tighter text-white uppercase whitespace-pre-line">
                        {isClientInvite ? 'Welcome to\nYour Terminal' : 'Enterprise\nAuto OS'}
                    </h1>
                    <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-slate-500 leading-relaxed max-w-[300px] mx-auto opacity-80">
                        {isClientInvite ? 'Fleet management status is verified.' : 'Professional Grade Operational Infrastructure.'}
                    </p>
                </div>

                <div className="w-full space-y-5">
                    <motion.button
                        onClick={() => navigate('/dashboard/owner')}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-[64px] flex items-center justify-center gap-4 bg-primary text-white font-bold text-[14px] uppercase tracking-[0.2em] rounded-xl shadow-2xl shadow-primary/30"
                    >
                        <span>{isClientInvite ? 'Initiate Session' : 'Access Client Hub'}</span>
                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </motion.button>

                    {!isClientInvite && (
                        <div className="flex flex-col gap-5 w-full">
                            <motion.button
                                onClick={() => navigate('/')}
                                whileTap={{ scale: 0.98 }}
                                className="w-full h-[64px] flex items-center justify-center gap-4 bg-white/[0.03] border border-white/10 text-slate-300 font-bold text-[14px] uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all backdrop-blur-md"
                            >
                                <span>Shop Registry</span>
                                <span className="material-symbols-outlined text-xl">login</span>
                            </motion.button>

                            <motion.button
                                onClick={() => navigate('/install')}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-center gap-3 text-slate-600 hover:text-white transition-all py-4 mt-4"
                            >
                                <span className="material-symbols-outlined text-xl">install_mobile</span>
                                <span className="text-[12px] font-bold uppercase tracking-[0.2em]">Deploy to iOS Home Screen</span>
                            </motion.button>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 pb-12 px-6 safe-bottom mt-auto">
                <div className="flex flex-col items-center gap-8">
                    <div className="flex gap-12 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-700">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Safety</a>
                        <a href="#" className="hover:text-primary transition-colors">Support</a>
                    </div>
                    {/* iOS Home Indicator Spacing */}
                    <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-primary/30"></div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default WelcomeScreen;
