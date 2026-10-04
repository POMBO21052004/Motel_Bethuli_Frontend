import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Loader2, Save, ArrowLeft, AlertTriangle, CheckCircle2, Calendar, Camera, Globe, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import profileService from '../../services/admin/profileService';
import { getImageUrl } from '../../utils/getImageUrl';

export default function AdminProfileEdit() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        code_phone: '',
        phone: '',
        sexe: '',
        date_naissance: ''
    });

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await profileService.get();
                const data = res.data.data;
                setFormData({
                    nom: data.nom || '',
                    prenom: data.prenom || '',
                    code_phone: data.code_phone || '',
                    phone: data.phone || '',
                    sexe: data.sexe || '',
                    date_naissance: data.date_naissance || ''
                });
                if (data.profil) {
                    setAvatarPreview(getImageUrl(data.profil));
                }
            } catch (err) {
                setError('Impossible de charger les informations du profil.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
        setSuccess(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        const data = new FormData();
        data.append('nom', formData.nom);
        data.append('prenom', formData.prenom);
        if (formData.code_phone) data.append('code_phone', formData.code_phone);
        if (formData.phone) data.append('phone', formData.phone);
        if (formData.sexe) data.append('sexe', formData.sexe);
        if (formData.date_naissance) data.append('date_naissance', formData.date_naissance);
        
        if (avatarFile) {
            data.append('profil', avatarFile);
        }

        try {
            const res = await profileService.update(data);
            setSuccess(true);
            
            if (setUser && res.data.data) {
                setUser(res.data.data);
            }

            setTimeout(() => {
                navigate('/admin/profile');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
                <p className="text-sm font-medium text-slate-400">Chargement de vos informations...</p>
            </div>
        );
    }

    const initials = `${formData.prenom?.[0] || ''}${formData.nom?.[0] || ''}`.toUpperCase() || '👤';

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Link to="/admin/profile" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-500 transition-colors mb-3 uppercase tracking-wider">
                        <ArrowLeft className="w-3.5 h-3.5" /> Retour
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-slate-800 tracking-tight">Paramètres du profil</h1>
                    <div className="w-12 h-1 bg-amber-500 rounded-full mt-3" />
                </div>
                <div className="hidden md:flex text-sm text-slate-500 items-center gap-2 font-medium">
                    <span className="text-amber-500">Profil</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>Édition</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Form Section (Left) */}
                <div className="lg:col-span-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {error && (
                            <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 shadow-sm animate-in slide-in-from-top-2">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 shadow-sm animate-in slide-in-from-top-2">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-medium">Vos informations ont été mises à jour. Redirection en cours...</p>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Informations de base</h3>
                            </div>
                            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Prénom */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Prénom <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-amber-500 text-slate-400">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="prenom"
                                            value={formData.prenom}
                                            onChange={handleChange}
                                            required
                                            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300"
                                            placeholder="John"
                                        />
                                    </div>
                                </div>

                                {/* Nom */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Nom <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-amber-500 text-slate-400">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="nom"
                                            value={formData.nom}
                                            onChange={handleChange}
                                            required
                                            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                {/* Sexe */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Sexe</label>
                                    <select
                                        name="sexe"
                                        value={formData.sexe}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all appearance-none cursor-pointer"
                                        style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%2394a3b8\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                    >
                                        <option value="">Non spécifié</option>
                                        <option value="Homme">Homme</option>
                                        <option value="Femme">Femme</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>

                                {/* Date de naissance */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Date de naissance</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-amber-500 text-slate-400">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="date"
                                            name="date_naissance"
                                            value={formData.date_naissance}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all cursor-text [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Coordonnées</h3>
                            </div>
                            <div className="p-6 sm:p-8">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Téléphone principal</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative sm:w-1/3 group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-amber-500 text-slate-400">
                                            <Globe className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="code_phone"
                                            value={formData.code_phone}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300"
                                            placeholder="Code ex: +237"
                                        />
                                    </div>
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-amber-500 text-slate-400">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300"
                                            placeholder="Numéro sans le code"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-slate-400 mt-3 flex items-center gap-1.5">
                                    Un numéro valide facilite vos échanges avec la réception via WhatsApp.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4">
                            <Link 
                                to="/admin/profile"
                                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-slate-600 bg-white border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all text-center"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={saving || !formData.nom || !formData.prenom}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Mettre à jour mon profil
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Section (Right) */}
                <div className="lg:col-span-4">
                    <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden sticky top-24 border border-slate-800">
                        {/* Decorative Top */}
                        <div className="h-24 bg-gradient-to-br from-amber-400 to-amber-600 w-full relative">
                            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8L3N2Zz4=')]"></div>
                        </div>
                        
                        <div className="px-6 pb-8 pt-0 relative flex flex-col items-center text-center">
                            {/* Avatar Upload area */}
                            <div className="relative -mt-12 mb-5 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="p-1.5 bg-slate-900 rounded-full shadow-xl">
                                    {avatarPreview ? (
                                        <img 
                                            src={avatarPreview} 
                                            alt="Preview" 
                                            className="w-24 h-24 rounded-full object-cover border-2 border-slate-700 bg-slate-800"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-slate-800 text-slate-300 font-extrabold text-3xl flex items-center justify-center border-2 border-slate-700">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-[6px] bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <Camera className="w-6 h-6 text-white mb-1" />
                                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">Modifier</span>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                            />
                            
                            <h4 className="text-xl font-serif font-black text-white leading-tight">
                                {formData.prenom || 'Prénom'} {formData.nom || 'Nom'}
                            </h4>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 mt-3 border border-amber-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-wider">Client vérifié</span>
                            </div>
                            
                            <div className="mt-8 w-full space-y-4">
                                <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div className="text-left overflow-hidden">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Téléphone</p>
                                        <p className="text-sm font-medium truncate">
                                            {formData.phone ? `${formData.code_phone || ''} ${formData.phone}` : 'Non renseigné'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                        <div className="text-left overflow-hidden">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sexe</p>
                                            <p className="text-xs font-medium truncate">{formData.sexe || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                        <div className="text-left overflow-hidden">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Naissance</p>
                                            <p className="text-xs font-medium truncate">
                                                {formData.date_naissance ? new Date(formData.date_naissance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

