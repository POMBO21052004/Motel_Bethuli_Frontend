import axios from 'axios';
import { emitToast } from '../components/common/ToastContext';

/**
 * Instance Axios centrale pour toutes les requêtes vers l'API Laravel.
 * Lit l'URL de base depuis la variable d'environnement VITE_API_URL.
 */
const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api',
    withCredentials: false,
    headers: {
        Accept: 'application/json',
    },
});

// ── Intercepteur de Requête ──────────────────────────────────────────────────
// Ajoute automatiquement le token Bearer à chaque requête sortante
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Intercepteur de Réponse ──────────────────────────────────────────────────
// Routes accessibles sans authentification : pas de redirection forcée vers /login
const PUBLIC_PATHS = ['/login', '/verify-otp', '/forgot-password', '/reset-password', '/verify'];

const isPublicPath = (pathname) =>
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        // 401 — Token invalide ou expiré → déconnexion automatique
        if (status === 401) {
            if (!isPublicPath(window.location.pathname)) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('token_expires_at');
                window.location.href = '/login';
            }
        }

        // 429 — Rate limit atteint → toast lisible avec temps d'attente
        if (status === 429) {
            const retryAfter = error.response?.data?.retry_after;
            const serverMsg  = error.response?.data?.message;
            const msg = serverMsg || (
                retryAfter
                    ? `Trop de requêtes. Réessayez dans ${retryAfter}s.`
                    : 'Trop de requêtes. Veuillez patienter avant de réessayer.'
            );
            emitToast(msg, 'error');
        }

        return Promise.reject(error);
    }
);

export default api;
