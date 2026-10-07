import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowRight, Save, Loader2, User, Mail,
    Phone, Camera, Shield, CheckCircle2, Users
} from 'lucide-react';
import clientService from '../../../services/clientService';
import { useToast } from '../../../components/common/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
    surfaceVariant: '#fef3c7', secondary: '#b45309', error: '#ef4444',
};

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');

// Shared sub-components
function Field({ label, error, hint, required, children }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider block"
                style={{ color: error ? T.error : T.onSurfaceVariant }}>
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs font-medium flex items-center gap-1" style={{ color: T.error }}>⚠️ {error}</p>}
            {hint && !error && <p className="text-xs" style={{ color: T.outline }}>{hint}</p>}
        </div>
    );
}

function Input({ name, type = 'text', value, onChange, placeholder, hasError, autoComplete, disabled }) {
    return (
        <input type={type} name={name} value={value} onChange={onChange} disabled={disabled}
            placeholder={placeholder} autoComplete={autoComplete}
            className="w-full h-11 px-4 rounded-xl border outline-none transition-all text-sm disabled:opacity-50 disabled:bg-slate-50"
            style={{ backgroundColor: T.bg, borderColor: hasError ? T.error : T.outlineVariant, color: T.onSurface }} />
    );
}

// Main Component
export default function AdminClientForm() {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const isSelf = isEditing && user?.id === parseInt(id);

    const [formData, setFormData] = useState({
        prenom: '', nom: '', email: '', phone: '', code_phone: '+242',
        sexe: '', date_naissance: '', actif: true, profil: null
    });
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!isEditing) return;
        (async () => {
            try {
                const res = await clientService.getById(id);
                const a = res.data?.data || res.data;
                setFormData({
                    prenom: a.prenom || '', nom: a.nom || '', email: a.email || '',
                    phone: a.phone || '', code_phone: a.code_phone || '+242',
                    sexe: a.sexe || '', date_naissance: a.date_naissance ? a.date_naissance.substring(0, 10) : '',
                    actif: a.actif ?? true, profil: null
                });
                setPreview(a.profil ? `${API_BASE}/storage/${a.profil}` : null);
            } catch {
                toast.error('Impossible de charger ce profil.');
                navigate('/admin/clients');
            } finally { setFetching(false); }
        })();
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: null }));
        if (type === 'file' && files?.[0]) {
            const file = files[0];
            setFormData(prev => ({ ...prev, [name]: file }));
            const reader = new FileReader();
            reader.onload = (ev) => setPreview(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        setFieldErrors({});
        const errors = {};
        if (!formData.prenom.trim()) errors.prenom = 'Le prénom est obligatoire.';
        if (!formData.nom.trim()) errors.nom = 'Le nom est obligatoire.';
        if (!formData.email.trim()) errors.email = 'L\'email est obligatoire.';
        if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

        setSubmitting(true);
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
            if (v !== null && v !== '') fd.append(k, v);
        });

        try {
            if (isEditing) {
                await clientService.update(id, fd);
                toast.success('Profil client mis à jour.');
            } else {
                await clientService.create(fd);
                toast.success('Compte client créé avec succès.');
            }
            navigate('/admin/clients');
        } catch (err) {
            if (err.response?.status === 422) setFieldErrors(err.response.data.errors || {});
            else toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
        } finally { setSubmitting(false); }
    };

    if (fetching) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-sm font-medium text-slate-500 italic">Chargement du formulaire...</span>
        </div>
    );

    const selectCls = "w-full h-11 px-4 rounded-xl border outline-none transition-all text-sm appearance-none";
    const selectSty = { backgroundColor: T.bg, borderColor: T.outlineVariant, color: T.onSurface };

    return (
        <div className="space-y-6 animate-in fade-in duration-700" style={{ color: T.onSurface }}>
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: T.outline }}>
                <span className="hover:underline cursor-pointer" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
                <ArrowRight className="w-3 h-3" />
                <span className="hover:underline cursor-pointer" onClick={() => navigate('/admin/clients')}>Clients</span>
                <ArrowRight className="w-3 h-3" />
                <span style={{ color: T.primary }}>{isEditing ? 'Modifier' : 'Nouveau client'}</span>
            </div>

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                <div className="absolute -right-10 -top-10 opacity-5">
                    <Users size={240} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20"
                    style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />

                <div className="relative z-10 flex items-center gap-5">
                    <div className="p-4 rounded-2xl border backdrop-blur-md" style={{ background: `${T.primary}30`, borderColor: `${T.primary}50` }}>
                        <Users className="w-8 h-8" style={{ color: '#4ade80' }} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tight flex items-center gap-2">
                            {isEditing ? 'Modifier le client' : 'Créer un compte client'}
                            {isSelf && <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 not-italic">Votre profil</span>}
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">
                            {isEditing ? 'Mise à jour des informations' : 'Inscription via le panel d\'administration'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* LEFT CONTENT (Avatar & Status) */}
                <div className="space-y-5">
                    <div className="bg-white rounded-2xl border shadow-sm p-6 text-center relative overflow-hidden" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <div className="absolute inset-0 h-24" style={{ background: `linear-gradient(135deg, ${T.surfaceVariant}, transparent)` }} />
                        
                        <div className="relative">
                            <div className="w-28 h-28 mx-auto rounded-full border-4 shadow-xl mb-4 bg-white overflow-hidden relative group" style={{ borderColor: T.bg }}>
                                {preview ? (
                                    <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center" style={{ background: T.surfaceVariant, color: T.primary }}>
                                        <User className="w-10 h-10" />
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                    <Camera className="w-6 h-6 mb-1" />
                                    <span className="text-[10px] font-bold uppercase">Modifier</span>
                                    <input type="file" accept="image/*" className="hidden" name="profil" onChange={handleChange} />
                                </label>
                            </div>
                            <h3 className="text-sm font-bold" style={{ color: T.onSurface }}>Photo de profil</h3>
                            <p className="text-xs mt-1" style={{ color: T.outline }}>JPG, PNG. Max 2MB.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: `${T.outlineVariant}50` }}>
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" style={{ color: T.outline }} />
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: T.outline }}>Statut du compte</span>
                            </div>
                        </div>
                        
                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.actif ? 'bg-green-50/50' : 'bg-red-50/50'}`}
                            style={{ borderColor: formData.actif ? '#bbf7d0' : '#fecaca' }}>
                            <div className={`relative w-10 h-6 rounded-full transition-colors ${formData.actif ? 'bg-green-500' : 'bg-red-400'}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.actif ? 'left-5' : 'left-1'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-bold" style={{ color: formData.actif ? '#15803d' : '#b91c1c' }}>
                                    {formData.actif ? 'Client Actif' : 'Client Inactif'}
                                </p>
                                <p className="text-[10px]" style={{ color: formData.actif ? '#166534' : '#7f1d1d' }}>
                                    {formData.actif ? 'Peut se connecter' : 'Accès révoqué'}
                                </p>
                            </div>
                            <input type="checkbox" className="hidden" name="actif" checked={formData.actif} onChange={handleChange} disabled={isSelf} />
                        </label>
                    </div>

                    {!isEditing && (
                        <div className="rounded-xl p-4 border flex items-start gap-3"
                            style={{ background: '#e8f5ee', borderColor: `${T.primary}30` }}>
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: T.primary }} />
                            <p className="text-xs font-medium" style={{ color: T.primary }}>
                                Un email avec un mot de passe temporaire sera automatiquement envoyé après la création.
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT CONTENT */}
                <div className="lg:col-span-3 space-y-5">
                    {/* Section: Personal Info */}
                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.secondary})` }} />
                        <div className="p-6">
                            <div className="flex items-center gap-3 pb-4 mb-5 border-b" style={{ borderColor: `${T.outlineVariant}50` }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.surfaceVariant, color: T.primary }}>
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold" style={{ color: T.onSurface }}>Informations Personnelles</h2>
                                    <p className="text-xs" style={{ color: T.onSurfaceVariant }}>Identité civile</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Field label="Prénom" required error={fieldErrors.prenom}>
                                    <Input name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Ex : Jean" hasError={!!fieldErrors.prenom} />
                                </Field>
                                <Field label="Nom" required error={fieldErrors.nom}>
                                    <Input name="nom" value={formData.nom} onChange={handleChange} placeholder="Ex : Dupont" hasError={!!fieldErrors.nom} />
                                </Field>
                                <Field label="Sexe">
                                    <select name="sexe" value={formData.sexe} onChange={handleChange} className={selectCls} style={selectSty}>
                                        <option value="" disabled>Sélectionner</option>
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </select>
                                </Field>
                                <Field label="Date de naissance">
                                    <Input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Section: Contact */}
                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.secondary})` }} />
                        <div className="p-6">
                            <div className="flex items-center gap-3 pb-4 mb-5 border-b" style={{ borderColor: `${T.outlineVariant}50` }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.surfaceVariant, color: T.primary }}>
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold" style={{ color: T.onSurface }}>Coordonnées</h2>
                                    <p className="text-xs" style={{ color: T.onSurfaceVariant }}>Email et numéro de téléphone</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <Field label="Adresse email" required error={fieldErrors.email}
                                        hint={!isEditing ? "Les identifiants seront envoyés à cette adresse." : ""}>
                                        <Input name="email" type="email" value={formData.email} onChange={handleChange}
                                            placeholder="client@motelbethuli.com" hasError={!!fieldErrors.email} />
                                    </Field>
                                </div>
                                <Field label="Indicatif pays">
                                    <select name="code_phone" value={formData.code_phone} onChange={handleChange} className={selectCls} style={selectSty}>
                                        <option value="+242">🇨🇬 +242 (Congo Brazzaville)</option>
                                        <option value="+243">🇨🇩 +243 (RDC)</option>
                                        <option value="+241">🇬🇦 +241 (Gabon)</option>
                                        <option value="+237">🇨🇲 +237 (Cameroun)</option>
                                        <option value="+33">🇫🇷 +33 (France)</option>
                                    </select>
                                </Field>
                                <Field label="Numéro de téléphone" error={fieldErrors.phone}>
                                    <Input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                                        placeholder="06 XX XX XX" hasError={!!fieldErrors.phone} />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Submit footer */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={() => navigate('/admin/clients')}
                            className="h-11 px-6 rounded-xl border text-sm font-semibold transition-all hover:shadow-sm"
                            style={{ borderColor: T.outlineVariant, color: T.onSurface }}>
                            Annuler
                        </button>
                        <button type="button" onClick={handleSubmit} disabled={submitting}
                            className="flex items-center gap-2 h-11 px-7 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-lg"
                            style={{ background: T.primary, boxShadow: `0 4px 14px ${T.primary}40` }}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isEditing ? 'Mettre à jour' : 'Créer le client'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
