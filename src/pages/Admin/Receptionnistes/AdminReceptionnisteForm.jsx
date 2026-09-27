import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowRight, Save, Loader2, User, Mail,
    Phone, Camera, Shield, CheckCircle2, ShieldCheck
} from 'lucide-react';
import receptionnisteService from '../../../services/receptionnisteService';
import { useToast } from '../../../components/common/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
    surfaceVariant: '#fef3c7', secondary: '#b45309', error: '#ef4444',
};

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');

// ─── Shared sub-components ─────────────────────────────────────────
function Field({ label, error, hint, required, children }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider block"
                style={{ color: error ? T.error : T.onSurfaceVariant }}>
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs font-medium flex items-center gap-1" style={{ color: T.error }}>⚠ {error}</p>}
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

// ─── Main Component ────────────────────────────────────────────────
export default function AdminReceptionnisteForm() {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const isSelf = isEditing && user?.id === parseInt(id);

    const [formData, setFormData] = useState({
        prenom: '', nom: '', email: '', phone: '', code_phone: '+237',
        sexe: '', date_naissance: '', actif: true, profil: null, role: 'Admin'
    });
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!isEditing) return;
        (async () => {
            try {
                const res = await receptionnisteService.getById(id);
                const a = res.data?.data || res.data;
                setFormData({
                    prenom: a.prenom || '', nom: a.nom || '', email: a.email || '',
                    phone: a.phone || '', code_phone: a.code_phone || '+237',
                    sexe: a.sexe || '', date_naissance: a.date_naissance ? a.date_naissance.substring(0, 10) : '',
                    actif: a.actif ?? true, profil: null, role: a.role || 'Admin'
                });
                setPreview(a.profil ? `${API_BASE}/storage/${a.profil}` : null);
            } catch {
                toast.error('Impossible de charger ce profil.');
                navigate('/admin/receptionnistes');
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
        if (!formData.email.trim()) errors.email = 'L\'adresse email est obligatoire.';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email invalide.';

        if (Object.keys(errors).length) { setFieldErrors(errors); return; }

        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (val instanceof File) fd.append(key, val);
                else if (key === 'actif') fd.append('actif', val ? '1' : '0');
                else if (val !== null && val !== undefined && val !== '') fd.append(key, val);
            });
            if (isEditing) {
                await receptionnisteService.update(id, fd);
                toast.success('Receptionniste mis à jour avec succès !');
            } else {
                await receptionnisteService.create(fd);
                toast.success('Receptionniste créé ! Un email a été envoyé.');
            }
            navigate('/admin/receptionnistes');
        } catch (error) {
            const data = error.response?.data;
            if (error.response?.status === 422 && data?.errors) {
                const serverErrors = {};
                Object.entries(data.errors).forEach(([f, m]) => { serverErrors[f] = Array.isArray(m) ? m[0] : m; });
                setFieldErrors(serverErrors);
                toast.error('Erreurs de validation. Veuillez les corriger.');
            } else {
                toast.error(data?.message || 'Une erreur est survenue.');
            }
        } finally { setSubmitting(false); }
    };

    const initials = (formData.prenom?.charAt(0) || '') + (formData.nom?.charAt(0) || '');
    const fullName = `${formData.prenom || ''} ${formData.nom || ''}`.trim();
    const selectCls = "w-full h-11 px-4 rounded-xl border outline-none transition-all text-sm";
    const selectSty = { backgroundColor: T.bg, borderColor: T.outlineVariant, color: T.onSurface };

    if (fetching) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: T.primary }} />
            <span className="text-sm italic" style={{ color: T.outline }}>Chargement du profil...</span>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700" style={{ color: T.onSurface }}>
            {/* ── Breadcrumb ──────────────────────────────── */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: T.outline }}>
                <span className="hover:underline cursor-pointer" onClick={() => navigate('/admin')}>Dashboard</span>
                <ArrowRight className="w-3 h-3" />
                <span className="hover:underline cursor-pointer" onClick={() => navigate('/admin/receptionnistes')}>Receptionnistes</span>
                <ArrowRight className="w-3 h-3" />
                <span style={{ color: T.primary }}>{isEditing ? `Modifier — ${fullName || 'Admin'}` : 'Nouvel Admin'}</span>
            </div>

            {/* ── Hero Banner ─────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                <div className="absolute -right-10 -top-10 opacity-5">
                    <Shield size={200} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20"
                    style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl border" style={{ background: `${T.primary}30`, borderColor: `${T.primary}50` }}>
                            <Shield className="w-7 h-7" style={{ color: '#4ade80' }} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tight">
                                {isEditing ? `Modifier — ${fullName || 'Admin'}` : 'Nouvel Receptionniste'}
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#4ade80' }}>
                                {isEditing ? 'Mise à jour du profil Receptionniste' : 'Création d\'un compte Receptionniste · Motel Bethuli'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button type="button" onClick={() => navigate('/admin/receptionnistes')}
                            className="h-10 px-5 rounded-xl text-sm font-semibold border transition-all hover:bg-white/10"
                            style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                            Annuler
                        </button>
                        <button type="button" onClick={handleSubmit} disabled={submitting}
                            className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 shadow-lg"
                            style={{ background: T.primary, color: 'white' }}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isEditing ? 'Mettre à jour' : 'Créer l\'admin'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Two-column layout ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                {/* ═══ LEFT SIDEBAR ════════════════════════════ */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Avatar card */}
                    <div className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col items-center text-center"
                        style={{ borderColor: `${T.outlineVariant}50` }}>
                        <div className="w-full h-1 rounded-full mb-4" style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.secondary})` }} />

                        <div className="relative group cursor-pointer mb-3">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 shadow-sm"
                                style={{ borderColor: `${T.primary}30` }}>
                                {preview ? (
                                    <img src={preview} alt="Profil" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl font-bold"
                                        style={{ background: T.surfaceVariant, color: T.primary }}>
                                        {initials || <Shield className="w-7 h-7 opacity-40" />}
                                    </div>
                                )}
                            </div>
                            <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="w-5 h-5 text-white" />
                                <input type="file" name="profil" accept="image/*" onChange={handleChange} className="hidden" />
                            </label>
                        </div>

                        <p className="text-sm font-bold flex items-center gap-2" style={{ color: T.onSurface }}>
                            {fullName || 'Nouvel admin'}
                            {isSelf && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">Vous</span>}
                        </p>
                        
                        <div className="flex flex-col items-center mt-2 space-y-1.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                <ShieldCheck className="w-3.5 h-3.5" /> {formData.role}
                            </span>
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${formData.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                {formData.actif ? '● Actif' : '● Inactif'}
                            </span>
                        </div>

                        {preview && (
                            <button type="button" onClick={() => { setFormData(p => ({ ...p, profil: null })); setPreview(null); }}
                                className="mt-3 text-[11px] font-semibold text-red-400 hover:text-red-600 hover:underline">
                                Supprimer la photo
                            </button>
                        )}
                        {!preview && <p className="text-[11px] mt-2" style={{ color: T.outline }}>Survolez pour changer</p>}
                    </div>

                    {/* Status card */}
                    <div className="bg-white rounded-2xl border shadow-sm p-4" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: T.outline }}>Accès au compte</p>
                        <label className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isSelf ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'}`}>
                            <input type="checkbox" name="actif" checked={formData.actif} onChange={handleChange} disabled={isSelf}
                                className="w-5 h-5 rounded" style={{ accentColor: T.primary }} />
                            <div className="flex-1">
                                <p className="text-sm font-semibold" style={{ color: T.onSurface }}>Compte actif</p>
                                <p className="text-xs mt-0.5" style={{ color: T.onSurfaceVariant }}>
                                    {formData.actif ? 'Connexion autorisée' : 'Connexion bloquée'}
                                </p>
                            </div>
                        </label>
                        {isSelf && <p className="text-[10px] text-center mt-2 text-amber-600 font-semibold">Vous ne pouvez pas désactiver votre propre compte.</p>}
                    </div>

                    {/* Email notice (create only) */}
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

                {/* ═══ RIGHT CONTENT ═══════════════════════════ */}
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
                                            placeholder="reception@motelbethuli.com" hasError={!!fieldErrors.email} />
                                    </Field>
                                </div>
                                <Field label="Indicatif pays">
                                    <select name="code_phone" value={formData.code_phone} onChange={handleChange} className={selectCls} style={selectSty}>
                                        <option value="+237">🇨🇲 +237 (Cameroun)</option>
                                        <option value="+225">🇨🇮 +225 (Côte d'Ivoire)</option>
                                        <option value="+221">🇸🇳 +221 (Sénégal)</option>
                                        <option value="+33">🇫🇷 +33 (France)</option>
                                        <option value="+1">🇺🇸 +1 (USA)</option>
                                    </select>
                                </Field>
                                <Field label="Numéro de téléphone" error={fieldErrors.phone}>
                                    <Input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                                        placeholder="6XX XX XX XX" hasError={!!fieldErrors.phone} />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Submit footer */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={() => navigate('/admin/receptionnistes')}
                            className="h-11 px-6 rounded-xl border text-sm font-semibold transition-all hover:shadow-sm"
                            style={{ borderColor: T.outlineVariant, color: T.onSurface }}>
                            Annuler
                        </button>
                        <button type="button" onClick={handleSubmit} disabled={submitting}
                            className="flex items-center gap-2 h-11 px-7 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-lg"
                            style={{ background: T.primary, boxShadow: `0 4px 14px ${T.primary}40` }}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isEditing ? 'Mettre à jour' : 'Créer l\'admin'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
