import api from '../api/axios';

const authService = {
    login: async (email, password) => {
        return await api.post('/login', { email, password });
    },
    
    register: async (data) => {
        return await api.post('/register', data);
    },

    logout: async () => {
        return await api.post('/logout');
    },

    me: async () => {
        return await api.get('/me');
    },

    forgotPassword: async (email) => {
        return await api.post('/forgot-password', { email });
    },

    resetPassword: async (data) => {
        return await api.post('/reset-password', data);
    },

    verifyOtp: async (data) => {
        return await api.post('/verify-otp', data);
    },

    resendOtp: async (email) => {
        return await api.post('/resend-otp', { email });
    }
};

export default authService;
