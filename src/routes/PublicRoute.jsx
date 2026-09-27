import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageLoader from '../components/common/PageLoader';
import PublicLayout from '../components/layout/PublicLayout';

const PublicRoute = ({ layout = false }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    if (isAuthenticated && user) {
        const role = user.role;
        if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'receptionniste') return <Navigate to="/reception/dashboard" replace />;
        if (role === 'client') return <Navigate to="/client/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    if (layout) {
        return <PublicLayout />;
    }

    return <Outlet />;
};

export default PublicRoute;
