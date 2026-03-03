import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Lightweight page-level error boundary with a compact inline fallback
 * (as opposed to the full-screen app-level boundary).
 * Wrap individual routes/pages to isolate failures.
 */
const PageErrorFallback: React.FC<{ onReset: () => void }> = ({ onReset }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
            <span className="material-symbols-outlined text-3xl text-red-400">error_outline</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Page failed to load</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">
            Something went wrong rendering this page. Other parts of the app are still working.
        </p>
        <button
            onClick={onReset}
            className="bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all active:scale-[0.97]"
        >
            Retry
        </button>
    </div>
);

/**
 * Drop-in wrapper that isolates page render errors.
 * Usage: <PageErrorBoundary><MyPage /></PageErrorBoundary>
 */
const PageErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [resetKey, setResetKey] = React.useState(0);

    return (
        <ErrorBoundary
            key={resetKey}
            fallback={<PageErrorFallback onReset={() => setResetKey(k => k + 1)} />}
        >
            {children}
        </ErrorBoundary>
    );
};

export default PageErrorBoundary;
