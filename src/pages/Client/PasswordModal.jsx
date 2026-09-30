import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import profileService from '../../services/client/profileService';

export default function PasswordModal({ isOpen, onClose }) {
    const [form, setForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (form.password !== form.password_confirmation) {
            setErrors({ password_confirmation: 'Les mots de passe ne correspondent pas.' });
            return;
        }
        if (form.password.length < 8) {
            setErrors({ password: 'Le mot de passe doit contenir au moins 8 caractères.' });
            return;
        }

        setLoading(true);
        try {
            await profileService.updatePassword({
                current_password: form.current_password,
                password: form.password,
                password_confirmation: form.password_confirmation,
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setForm({ current_password: '', password: '', password_confirmation: '' });
                onClose();
            }, 2000);
        } catch (error) {
            const serverErrors = error.response?.data?.errors || {};
            if (serverErrors.current_password) {
                setErrors({ current_password: serverErrors.current_password[0] });
            } else {
                setErrors({ general: error.response?.data?.message || 'Erreur lors de la mise à jour.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setForm({ current_password: '', password: '', password_confirmation: '' });
        setErrors({});
        setSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    const inputClass = (field) => `w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none transition-all ${
        errors[field]
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
    }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-200">
                            <Lock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Changer le mot de passe</h3>
                            <p className="text-xs text-slate-500">Minimum 8 caractères requis</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                        <h4 className="text-xl font-black text-slate-900 mb-2">Mot de passe modifié !</h4>
                        <p className="text-sm text-slate-500">Votre mot de passe a été mis à jour avec succès.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {errors.general && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                                {errors.general}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mot de passe actuel</label>
                            <div className="relative">
                                <input type={showCurrent ? 'text' : 'password'} name="current_password" value={form.current_password} onChange={handleChange} required placeholder="••••••••" className={inputClass('current_password')} />
                                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.current_password && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.current_password}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nouveau mot de passe</label>
                            <div className="relative">
                                <input type={showNew ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" className={inputClass('password')} />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {form.password.length > 0 && (
                                <div className="mt-2 flex gap-1">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                                            form.password.length >= i * 3 ? (i <= 2 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-slate-200'
                                        }`} />
                                    ))}
                                </div>
                            )}
                            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Confirmer le nouveau mot de passe</label>
                            <div className="relative">
                                <input type={showConfirm ? 'text' : 'password'} name="password_confirmation" value={form.password_confirmation} onChange={handleChange} required placeholder="••••••••" className={`${inputClass('password_confirmation')} ${form.password_confirmation && form.password === form.password_confirmation ? 'border-emerald-300 bg-white' : ''}`} />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password_confirmation && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.password_confirmation}</p>}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={handleClose} className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">
                                Annuler
                            </button>
                            <button type="submit" disabled={loading} className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-black hover:bg-amber-600 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-amber-200">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                {loading ? 'Mise à jour...' : 'Modifier'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
