import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ClientGuard — Layout route guard for protected client pages.
 * Renders <Outlet /> when clientUser is set.
 * Redirects to /c/track if not authenticated.
 */
const ClientGuard: React.FC = () => {
    const { clientUser, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-slate-500">Loading...</div>;

    if (!clientUser) {
        return <Navigate to="/c/track" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ClientGuard;
