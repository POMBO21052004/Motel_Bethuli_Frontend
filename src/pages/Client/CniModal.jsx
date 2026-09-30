import React, { useState } from 'react';
import { X, Upload, Loader2, CreditCard, MapPin, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import profileService from '../../services/client/profileService';

export default function CniModal({ isOpen, onClose, profile, onSuccess }) {
    const [form, setForm] = useState({
        cni_number: profile?.cni_number || '',
        adresse: profile?.adresse || '',
        ville: profile?.ville || '',
        pays: profile?.pays || 'Cameroun',
        nationalite: profile?.nationalite || '',
    });
    const [files, setFiles] = useState({ cni_recto: null, cni_verso: null });
    const [previews, setPreviews] = useState({ cni_recto: null, cni_verso: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleFile = (e, key) => {
        const file = e.target.files[0];
        if (!file) return;
        setFiles(prev => ({ ...prev, [key]: file }));
        const reader = new FileReader();
        reader.onloadend = () => setPreviews(prev => ({ ...prev, [key]: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v || ''));
            if (files.cni_recto) formData.append('cni_recto', files.cni_recto);
            if (files.cni_verso) formData.append('cni_verso', files.cni_verso);
            await profileService.updateCni(formData);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onSuccess();
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm outline-none transition-all font-medium";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 rounded-t-3xl shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Informations complémentaires</h3>
                            <p className="text-xs text-slate-500">Identité & Coordonnées</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                        <h4 className="text-xl font-black text-slate-900 mb-2">Informations mises à jour !</h4>
                        <p className="text-sm text-slate-500">Votre profil a été mis à jour. En attendant la vérification par notre équipe.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
                        <div className="p-6 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex gap-3 items-start border border-red-100">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="text-sm font-bold">{error}</p>
                                </div>
                            )}

                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                                    ⚠️ Toute modification des informations de votre CNI réinitialisera votre statut de vérification. Notre équipe devra re-vérifier vos documents.
                                </p>
                            </div>

                            {/* CNI Number */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Numéro CNI</label>
                                <input type="text" name="cni_number" value={form.cni_number} onChange={handleChange} placeholder="Ex: 001234567" className={inputClass} />
                            </div>

                            {/* Photos CNI */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Photos de la CNI</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['cni_recto', 'cni_verso'].map((key) => (
                                        <div key={key}>
                                            <label className="block text-xs font-semibold text-slate-600 mb-2 text-center capitalize">
                                                {key === 'cni_recto' ? 'Recto (Face avant)' : 'Verso (Face arrière)'}
                                            </label>
                                            <label className="cursor-pointer group block">
                                                <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden hover:border-amber-400 transition-colors bg-slate-50 group-hover:bg-amber-50 aspect-video flex items-center justify-center">
                                                    {previews[key] ? (
                                                        <img src={previews[key]} alt={key} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 p-4 text-center">
                                                            <Upload className="w-8 h-8 text-slate-300 group-hover:text-amber-400 transition-colors" />
                                                            <p className="text-xs text-slate-400 font-medium">Cliquer pour uploader</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <input type="file" accept="image/*" onChange={(e) => handleFile(e, key)} className="hidden" />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Adresse */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Adresse</label>
                                    <input type="text" name="adresse" value={form.adresse} onChange={handleChange} placeholder="Votre adresse..." className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ville</label>
                                    <input type="text" name="ville" value={form.ville} onChange={handleChange} placeholder="Ex: Yaoundé" className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pays</label>
                                    <input type="text" name="pays" value={form.pays} onChange={handleChange} placeholder="Cameroun" className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nationalité</label>
                                    <input type="text" name="nationalite" value={form.nationalite} onChange={handleChange} placeholder="Camerounaise" className={inputClass} />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-white rounded-b-3xl flex gap-3 shrink-0">
                            <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">
                                Annuler
                            </button>
                            <button type="submit" disabled={loading} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sauvegarder'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
