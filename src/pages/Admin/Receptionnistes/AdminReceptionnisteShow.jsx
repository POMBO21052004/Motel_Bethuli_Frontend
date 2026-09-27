import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowRight, Shield, Edit2, Trash2, Mail, Phone, User,
    Calendar, ShieldCheck, Loader2, ShieldAlert, ShieldOff, CheckCircle2
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

function InfoRow({ icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3.5 border-b last:border-0" style={{ borderColor: `${T.outlineVariant}30` }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: T.surfaceVariant, color: T.primary }}>
                {icon}
            </div>
            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.outline }}>{label}</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: T.onSurface }}>{value}</p>
            </div>
        </div>
    );
}

export default function AdminReceptionnisteShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [toggleLoading, setToggleLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await receptionnisteService.getById(id);
                setAdmin(res.data?.data || res.data);
            } catch {
                toast.error('Impossible de charger ce profil.');
                navigate('/admin/receptionnistes');
            } finally { setLoading(false); }
        })();
    }, [id]);
    const handleForceVerify = async () => {
        if (!window.confirm("Forcer la vérification de ce compte ?")) return;
        try {
            await receptionnisteService.forceVerify(id);
            setAdmin(prev => ({ ...prev, is_verified: true, email_verified_at: new Date().toISOString() }));
            toast.success("Compte vérifié avec succès.");
        } catch (error) {
            toast.error("Erreur lors de la vérification.");
        }
    };


    const handleToggle = async () => {
        setToggleLoading(true);
        try {
            await receptionnisteService.toggleActif(id, !admin.actif);
            setAdmin(prev => ({ ...prev, actif: !prev.actif }));
            toast.success(`Compte ${!admin.actif ? 'activé' : 'désactivé'}.`);
        } catch { toast.error('Erreur.'); } finally { setToggleLoading(false); }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await receptionnisteService.delete(id, deletePassword);
            toast.success('Receptionniste supprimé.');
            navigate('/admin/receptionnistes');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Mot de passe incorrect.');
        } finally { setDeleting(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: `${T.primary}30`, borderTopColor: T.primary }} />
            <span className="text-sm italic" style={{ color: T.outline }}>Chargement du profil...</span>
        </div>
    );

    if (!admin) return null;

    const imgUrl = admin.profil ? `${API_BASE}/storage/${admin.profil}` : null;
    const fullName = `${admin.prenom || ''} ${admin.nom || ''}`.trim();
    const initials = `${admin.prenom?.charAt(0) || ''}${admin.nom?.charAt(0) || ''}`;
    const createdDate = admin.created_at
        ? new Date(admin.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    const daysSinceLastLogin = admin.last_login
        ? Math.floor((Date.now() - new Date(admin.last_login)) / (1000 * 60 * 60 * 24))
        : null;
    const needsVerification = !admin.is_verified || daysSinceLastLogin === null || daysSinceLastLogin > 7;
    const isSelf = user && user.id === admin.id;

    return (
        <div className="space-y-6 animate-in fade-in duration-700" style={{ color: T.onSurface }}>
            {/* ── Breadcrumb ──────────────────────────────── */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: T.outline }}>
                <span className="hover:underline cursor-pointer" onClick={() => navigate('/admin')}>Dashboard</span>
                <ArrowRight className="w-3 h-3" />
                <span className="hover:underline cursor-pointer" onClick={() => navigate('/admin/receptionnistes')}>Receptionnistes</span>
                <ArrowRight className="w-3 h-3" />
                <span style={{ color: T.primary }}>{fullName}</span>
            </div>

            {/* ── Hero Banner ─────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                <div className="absolute -right-10 -top-10 opacity-5">
                    <Shield size={240} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20"
                    style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        {imgUrl ? (
                            <img src={imgUrl} alt="Profil" className="w-20 h-20 rounded-full object-cover border-4 shadow-lg flex-shrink-0"
                                style={{ borderColor: `${T.primary}60` }} />
                        ) : (
                            <div className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold border-4 shadow-lg flex-shrink-0"
                                style={{ background: `${T.primary}30`, color: '#4ade80', borderColor: `${T.primary}60` }}>
                                {initials}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg border" style={{ background: `${T.primary}30`, borderColor: `${T.primary}50` }}>
                                    <Shield className="w-5 h-5" style={{ color: '#4ade80' }} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                                        {fullName}
                                        {isSelf && <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 not-italic">Vous</span>}
                                    </h1>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#4ade80' }}>
                                        Profil Receptionniste · Motel Bethuli
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${admin.actif ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${admin.actif ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                    {admin.actif ? 'Actif' : 'Inactif'}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/80">
                                    <ShieldCheck className="w-3.5 h-3.5" /> {admin.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                        <button onClick={handleToggle} disabled={toggleLoading || isSelf}
                            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                            {admin.actif ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            {admin.actif ? 'Désactiver' : 'Activer'}
                        </button>
                        <button onClick={() => navigate(`/admin/receptionnistes/${id}/edit`)}
                            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-all hover:bg-white/10"
                            style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                            <Edit2 className="w-4 h-4" /> Modifier
                        </button>
                        <button onClick={() => setDeleteModal(true)} disabled={isSelf}
                            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ background: T.error }}>
                            <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Main grid ───────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Personal Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h3 className="text-base font-bold flex items-center gap-2 pb-4 mb-2 border-b"
                            style={{ color: T.onSurface, borderColor: `${T.outlineVariant}50` }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: T.surfaceVariant, color: T.primary }}>
                                <User className="w-4 h-4" />
                            </div>
                            Informations Personnelles
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                            <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={admin.email} />
                            <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Téléphone"
                                value={admin.phone ? `${admin.code_phone || ''} ${admin.phone}`.trim() : null} />
                            <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Sexe"
                                value={admin.sexe === 'M' ? 'Masculin' : admin.sexe === 'F' ? 'Féminin' : null} />
                            <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Date de naissance" value={admin.date_naissance} />
                            <InfoRow icon={<Shield className="w-3.5 h-3.5" />} label="Date de création" value={createdDate} />
                        </div>
                    </div>
                </div>

                {/* Right: Role & Permissions + Quick info */}
                <div className="space-y-6">

                    {/* Role card */}
                    <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <div className="h-1 rounded-full mb-4" style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.secondary})` }} />
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: T.surfaceVariant, color: T.secondary }}>
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.outline }}>Niveau d'accès</p>
                                <p className="text-base font-bold mt-0.5 truncate" style={{ color: T.onSurface }}>{admin.role}</p>
                                <p className="text-xs mt-0.5 leading-tight" style={{ color: T.outline }}>
                                    Accès aux fonctions de gestion des réservations et clients.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick actions card */}
                    <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: T.outline }}>Actions rapides</p>
                        <div className="space-y-2">
                            <button onClick={() => navigate(`/admin/receptionnistes/${id}/edit`)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:shadow-sm border"
                                style={{ borderColor: `${T.secondary}30`, color: T.secondary }}>
                                <Edit2 className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm font-semibold">Modifier le profil</span>
                            </button>
                            {needsVerification && (
                                <button onClick={handleForceVerify}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:shadow-sm border"
                                    style={{ borderColor: `#10b98130`, color: '#10b981' }}>
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm font-semibold">Forcer la vérification</span>
                                </button>
                            )}
                            {!isSelf && (
                                <button onClick={handleToggle} disabled={toggleLoading}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:shadow-sm border disabled:opacity-50"
                                    style={{ borderColor: `${T.outlineVariant}50`, color: T.onSurface }}>
                                    {admin.actif ? <ShieldOff className="w-4 h-4 flex-shrink-0 text-amber-600" /> : <Shield className="w-4 h-4 flex-shrink-0 text-green-600" />}
                                    <span className="text-sm font-semibold">{admin.actif ? 'Suspendre l\'accès' : 'Rétablir l\'accès'}</span>
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Delete Modal ─────────────────────────────── */}
            {deleteModal && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-center mb-2" style={{ color: T.onSurface }}>Supprimer l'Receptionniste</h3>
                            <p className="text-sm text-center mb-4" style={{ color: T.onSurfaceVariant }}>
                                Cette action est <strong>irréversible</strong>. Confirmez avec votre mot de passe.
                            </p>
                            <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-red-500"
                                style={{ borderColor: T.outlineVariant }} autoFocus />
                        </div>
                        <div className="flex border-t border-gray-100">
                            <button onClick={() => { setDeleteModal(false); setDeletePassword(''); }}
                                className="flex-1 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100">
                                Annuler
                            </button>
                            <button onClick={handleDelete} disabled={deleting || !deletePassword}
                                className="flex-1 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                                {deleting ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
