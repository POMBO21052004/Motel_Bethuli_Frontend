import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await authService.me();
                    setUser(response.data.user);
                    setIsAuthenticated(true);
                } catch (error) {
                    localStorage.removeItem('access_token');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const response = await authService.login(email, password);
        const data = response.data;
        
        if (data.require_otp) {
            return data;
        }

        localStorage.setItem('access_token', data.access_token);
        setUser(data.user);
        setIsAuthenticated(true);
        return data;
    };

    const loginWithToken = (data) => {
        localStorage.setItem('access_token', data.access_token);
        setUser(data.user);
        setIsAuthenticated(true);
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        const data = response.data;
        
        localStorage.setItem('access_token', data.access_token);
        setUser(data.user);
        setIsAuthenticated(true);
        return data;
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            localStorage.removeItem('access_token');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const isClient = () => user?.role === 'client';
    const isAdmin = () => user?.role === 'admin';
    const isReceptionist = () => user?.role === 'receptionniste';

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            login,
            loginWithToken,
            register,
            logout,
            isClient,
            isAdmin,
            isReceptionist
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    }
    return context;
};
