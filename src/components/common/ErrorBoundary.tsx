import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * React Error Boundary — catches render errors in child components
 * and displays a styled fallback UI instead of a white screen.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
        // TODO: Send to error monitoring service (e.g. Sentry)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto">
                            <span className="material-symbols-outlined text-4xl text-red-400">warning</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white mb-2">Something went wrong</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                An unexpected error occurred. Please try again or contact support if the issue persists.
                            </p>
                        </div>
                        {import.meta.env.DEV && this.state.error && (
                            <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4 text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Debug Info</p>
                                <pre className="text-xs text-red-300/70 overflow-x-auto whitespace-pre-wrap break-words font-mono">
                                    {this.state.error.message}
                                </pre>
                            </div>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="bg-primary hover:bg-primary/90 text-zinc-950 font-black py-3.5 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.97] text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
