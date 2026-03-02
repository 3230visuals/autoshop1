import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import type { AuthRole } from '../context/AppTypes';

interface RoleGuardProps {
    children: React.ReactNode;
    allowed: AuthRole[];
    redirect?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowed, redirect }) => {
    const { currentUser } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!allowed.includes(currentUser.role)) {
            console.warn(`Access denied for ${currentUser.role} to this route. Redirecting...`);

            if (redirect) {
                void navigate(redirect);
            } else {
                // Smart default redirects
                if (currentUser.role === 'CLIENT') void navigate('/dashboard/owner');
                else if (currentUser.role === 'STAFF') void navigate('/staff');
                else if (currentUser.role === 'OWNER' || currentUser.role === 'OWNER') void navigate('/dashboard/shop');
                else void navigate('/');
            }
        }
    }, [currentUser, allowed, redirect, navigate]);

    // Don't render protected content while redirecting
    if (!allowed.includes(currentUser.role)) {
        return <div className="min-h-screen bg-background-dark flex items-center justify-center text-slate-500">Redirecting...</div>;
    }

    return <>{children}</>;
};

export default RoleGuard;
