import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ClientGuard: React.FC = () => {
    const { clientUser, isLoading } = useAuth();
    const location = useLocation();
    const isAuth = localStorage.getItem('clientAuth') === 'true';

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-slate-500">Loading...</div>;

    if (!isAuth || !clientUser) {
        return <Navigate to="/c/track" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ClientGuard;
