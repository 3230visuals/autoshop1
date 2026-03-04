import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * RequireStaff — Route guard using AuthContext.
 * Checks for a valid staffUser in React state (not localStorage).
 */
const RequireStaff: React.FC = () => {
    const location = useLocation();
    const { staffUser, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-slate-500">Loading…</div>;
    }

    if (!staffUser) {
        return <Navigate to="/s/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default RequireStaff;
