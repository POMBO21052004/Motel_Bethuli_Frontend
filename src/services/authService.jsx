import api from '../api/api';

/**
 * Service d'Authentification
 * Gère : Login, OTP, Mot de passe oublié, Reset password, Logout
 */
const authService = {
    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    verifyOtp: (email, code) =>
        api.post('/auth/verify-otp', { email, code }),

    resendOtp: (email) =>
        api.post('/auth/resend-otp', { email }),

    me: () =>
        api.get('/auth/me'),

    logout: () =>
        api.post('/auth/logout'),

    forgotPassword: (email) =>
        api.post('/auth/forgot-password', { email }),

    resetPassword: (email, token, password, password_confirmation) =>
        api.post('/auth/reset-password', { email, token, password, password_confirmation }),

    updateProfile: (data) =>
        api.post('/auth/update-profile', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    updatePassword: (current_password, password, password_confirmation) =>
        api.post('/auth/update-password', { current_password, password, password_confirmation }),
};

export default authService;

