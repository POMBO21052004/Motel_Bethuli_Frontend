import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageLoader from '../components/common/PageLoader';

const PrivateRoute = ({ allowedRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
        const role = user?.role;
        if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'receptionniste') return <Navigate to="/reception/dashboard" replace />;
        if (role === 'client') return <Navigate to="/client/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
