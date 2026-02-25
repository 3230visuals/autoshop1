import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * RequireStaff — MVP Guard using localStorage.
 * Checks for staffAuth flag.
 */
const RequireStaff: React.FC = () => {
    const location = useLocation();
    const isAuth = localStorage.getItem('staffAuth') === 'true';

    if (!isAuth) {
        // Redirect to login, but save the intended destination
        return <Navigate to="/s/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default RequireStaff;
