import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Redirects unauthenticated users to login.
 * Shows a loading spinner while the session is being checked.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading, isDemo } = useAuth();
    const location = useLocation();

    // Demo mode: always allow access
    if (isDemo) return <>{children}</>;

    // Still checking session — show loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Verifying Session</p>
                </div>
            </div>
        );
    }

    // Not authenticated — redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
