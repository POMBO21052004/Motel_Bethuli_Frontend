import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;
    const { loginWithToken } = useAuth(); 

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await authService.verifyOtp({ email, code });
            const data = response.data;
            
            loginWithToken(data);
            navigate(getDashboardRoute(data.user.role), { replace: true });
            
        } catch (err) {
            if (err.response?.data?.errors) {
                setError(Object.values(err.response.data.errors)[0][0]);
            } else {
                setError(err.response?.data?.message || "Code invalide.");
            }
        } finally {
            setLoading(false);
        }
    };

    const getDashboardRoute = (role) => {
        switch (role) {
            case 'admin': return '/admin/dashboard';
            case 'receptionniste': return '/reception/dashboard';
            case 'client': return '/';
            default: return '/';
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setError(null);
        setMessage(null);

        try {
            await authService.resendOtp(email);
            setMessage("Un nouveau code a été envoyé à votre adresse email.");
        } catch (err) {
            setError("Erreur lors de l'envoi du code.");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                    <h2 className="text-3xl font-extrabold text-slate-900 font-serif">Vérification Requise</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Pour des raisons de sécurité, veuillez entrer le code à 6 chiffres envoyé à <strong>{email}</strong>.
                    </p>
                </div>

                {message && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                        <p className="text-sm text-green-700">{message}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="code" className="sr-only">Code de vérification</label>
                        <input
                            id="code"
                            name="code"
                            type="text"
                            required
                            maxLength="6"
                            className="focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-xl text-center tracking-[0.5em] border-gray-300 rounded-md py-3 border font-mono uppercase"
                            placeholder="000000"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || code.length !== 6}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                        >
                            {loading ? 'Vérification...' : 'Valider le code'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-500 disabled:opacity-50"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${resendLoading ? 'animate-spin' : ''}`} />
                        Renvoyer le code
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;
