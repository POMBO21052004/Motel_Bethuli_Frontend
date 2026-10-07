import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowRight, Shield, Edit2, Trash2, Mail, Phone, User,
    Calendar, ShieldCheck, Loader2, ShieldOff, CheckCircle2,
    BedDouble, Clock, CreditCard, FileText, Users, ShieldAlert,
    CheckCircle, XCircle, CreditCard as IdCard, BadgeCheck, BadgeX,
    MapPin, Globe, Image as ImageIcon
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

const STATUS_STYLES = {
    pending:   { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'En attente' },
    confirmed: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Confirmée' },
    cancelled: { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Annulée' },
};

function PasswordModal({ isOpen, onClose, onConfirm, title, message, type = 'danger', requirePassword = false, loading = false }) {
    const [password, setPassword] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-red-100 text-red-600' : type === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {type === 'danger' ? <Trash2 className="w-6 h-6" /> : type === 'success' ? <CheckCircle className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                    </div>
                    <h3 className="text-lg font-bold text-center text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-center text-gray-500 mb-4">{message}</p>
                    {requirePassword && (
                        <div className="mt-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">Votre mot de passe (confirmation)</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-red-500"
                                style={{ borderColor: T.outlineVariant }} autoFocus />
                        </div>
                    )}
                </div>
                <div className="flex border-t border-gray-100">
                    <button onClick={() => { setPassword(''); onClose(); }} className="flex-1 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100">Annuler</button>
                    <button onClick={() => { onConfirm(requirePassword ? password : null); setPassword(''); }}
                        disabled={loading || (requirePassword && !password)}
                        className={`flex-1 py-3.5 text-sm font-bold transition-colors disabled:opacity-50 ${type === 'danger' ? 'text-red-600 hover:bg-red-50' : type === 'success' ? 'text-green-700 hover:bg-green-50' : 'text-amber-600 hover:bg-amber-50'}`}>
                        {loading ? 'En cours...' : 'Confirmer'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// CNI image with click-to-enlarge
function CniImage({ path, label }) {
    const [enlarged, setEnlarged] = useState(false);
    if (!path) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-slate-50 p-6" style={{ borderColor: T.outlineVariant }}>
                <ImageIcon className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-[10px] text-slate-400">Non fournie</p>
            </div>
        );
    }
    const src = `${API_BASE}/storage/${path}`;
    return (
        <>
            <div className="relative group cursor-pointer" onClick={() => setEnlarged(true)}>
                <img src={src} alt={label} className="w-full h-36 object-cover rounded-xl border shadow-sm group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                    <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Agrandir</span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center mt-2">{label}</p>
            </div>
            {enlarged && (
                <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setEnlarged(false)}>
                    <img src={src} alt={label} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
                    <button className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2" onClick={() => setEnlarged(false)}>
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>
            )}
        </>
    );
}

// TABS
const TABS = ['Réservations', 'Profil CNI'];

export default function AdminClientShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();

    const [client, setClient] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalConfig, setModalConfig] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Réservations');
    const [cniLoading, setCniLoading] = useState(false);

    const openModal = (config) => setModalConfig(config);
    const closeModal = () => setModalConfig(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await clientService.getById(id);
                setClient(res.data?.data || res.data);
                setReservations(res.data?.reservations || []);
            } catch {
                toast.error('Impossible de charger ce profil.');
                navigate('/admin/clients');
            } finally { setLoading(false); }
        })();
    }, [id]);

    const handleForceVerify = () => {
        openModal({
            title: 'Vérification du compte',
            message: "Forcer la vérification de ce compte ?",
            type: 'warning', requirePassword: false,
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    await clientService.forceVerify(id);
                    setClient(prev => ({ ...prev, is_verified: true, email_verified_at: new Date().toISOString() }));
                    toast.success('Compte vérifié avec succès.');
                    closeModal();
                } catch { toast.error('Erreur.'); }
                finally { setActionLoading(false); }
            }
        });
    };

    const handleTerminateSessions = () => {
        openModal({
            title: 'Révoquer les sessions',
            message: 'Toutes les sessions de ce client seront déconnectées.',
            type: 'warning', requirePassword: false,
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    await clientService.terminateSessions(id);
                    toast.success('Sessions révoquées.');
                    closeModal();
                } catch { toast.error('Erreur.'); }
                finally { setActionLoading(false); }
            }
        });
    };

    const handleToggle = () => {
        const newStatus = !client.actif;
        openModal({
            title: newStatus ? 'Activer le compte' : 'Désactiver le compte',
            message: `Voulez-vous vraiment ${newStatus ? 'activer' : 'désactiver'} l'accès de ce client ?`,
            type: newStatus ? 'success' : 'warning', requirePassword: false,
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    await clientService.toggleActif(id, newStatus);
                    setClient(prev => ({ ...prev, actif: !prev.actif }));
                    toast.success(`Compte ${newStatus ? 'activé' : 'désactivé'}.`);
                    closeModal();
                } catch { toast.error('Erreur.'); }
                finally { setActionLoading(false); }
            }
        });
    };

    const handleDelete = () => {
        openModal({
            title: 'Supprimer ce profil',
            message: 'Cette action est irréversible et supprimera le compte de ce client.',
            type: 'danger', requirePassword: true,
            onConfirm: async (password) => {
                setActionLoading(true);
                try {
                    await clientService.delete(id, password);
                    toast.success('Profil supprimé avec succès.');
                    closeModal();
                    navigate('/admin/clients');
                } catch (err) {
                    toast.error(err?.response?.data?.message || 'Mot de passe incorrect.');
                } finally { setActionLoading(false); }
            }
        });
    };

    const handleToggleCniVerified = async () => {
        const profile = client?.customer_profile;
        if (!profile?.cni_recto_path || !profile?.cni_verso_path) {
            toast.error('Les deux faces de la CNI (recto et verso) doivent être présentes avant de pouvoir vérifier.');
            return;
        }
        setCniLoading(true);
        try {
            const res = await clientService.toggleCniVerified(id);
            const newVerified = res.data?.cni_verified;
            setClient(prev => ({
                ...prev,
                customer_profile: { ...prev.customer_profile, cni_verified: newVerified }
            }));
            toast.success(res.data?.message || 'Statut CNI mis à jour.');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Impossible de mettre à jour le statut CNI.');
        } finally {
            setCniLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-sm font-medium text-slate-500 italic">Chargement du profil...</span>
        </div>
    );
    if (!client) return null;

    const imgUrl = client.profil ? `${API_BASE}/storage/${client.profil}` : null;
    const fullName = `${client.prenom || ''} ${client.nom || ''}`.trim();
    const initials = `${client.prenom?.charAt(0) || ''}${client.nom?.charAt(0) || ''}`;
    const createdDate = client.created_at
        ? new Date(client.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Inconnue';

    const daysSinceLastLogin = client.last_login
        ? Math.floor((Date.now() - new Date(client.last_login)) / (1000 * 60 * 60 * 24))
        : null;

    const isSelf = user && user.id === client.id;

    const totalDepense = reservations
        .filter(r => r.status === 'confirmed')
        .reduce((acc, r) => acc + parseFloat(r.total_price || 0), 0);

    const profile = client?.customer_profile;
    const cniVerified = profile?.cni_verified;
    const hasRecto = !!profile?.cni_recto_path;
    const hasVerso = !!profile?.cni_verso_path;
    const canToggleCni = hasRecto && hasVerso;

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20" style={{ color: T.onSurface }}>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: T.outline }}>
                <span className="hover:underline cursor-pointer" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
                <ArrowRight className="w-3 h-3" />
                <span className="hover:underline cursor-pointer" onClick={() => navigate('/admin/clients')}>Clients</span>
                <ArrowRight className="w-3 h-3" />
                <span style={{ color: T.primary }}>{fullName}</span>
            </div>

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                <div className="absolute -right-10 -top-10 opacity-5">
                    <Users size={240} className="rotate-12" />
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
                                {initials.toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg border" style={{ background: `${T.primary}30`, borderColor: `${T.primary}50` }}>
                                    <Users className="w-5 h-5" style={{ color: '#4ade80' }} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                                        {fullName}
                                        {isSelf && <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 not-italic">Vous</span>}
                                    </h1>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#4ade80' }}>
                                        Profil Client — Motel Bethuli
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${client.actif ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${client.actif ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                    {client.actif ? 'Actif' : 'Inactif'}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/80">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Client
                                </span>
                                {/* CNI badge */}
                                {cniVerified ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                                        <BadgeCheck className="w-3.5 h-3.5" /> CNI Vérifiée
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400">
                                        <BadgeX className="w-3.5 h-3.5" /> CNI non vérifiée
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                        <button onClick={handleToggle} disabled={isSelf}
                            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                            {client.actif ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            {client.actif ? 'Désactiver' : 'Activer'}
                        </button>
                        <button onClick={() => navigate(`/admin/clients/${id}/edit`)}
                            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-all hover:bg-white/10"
                            style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                            <Edit2 className="w-4 h-4" /> Modifier
                        </button>
                        <button onClick={handleDelete} disabled={isSelf}
                            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ background: T.error }}>
                            <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                    </div>
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Personal Info + Security */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h3 className="text-base font-bold flex items-center gap-2 pb-4 mb-2 border-b"
                            style={{ color: T.onSurface, borderColor: `${T.outlineVariant}50` }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: T.surfaceVariant, color: T.primary }}>
                                <User className="w-4 h-4" />
                            </div>
                            Informations Personnelles
                        </h3>
                        <div className="grid grid-cols-1 gap-x-8">
                            <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={client.email} />
                            <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Téléphone"
                                value={client.phone ? `${client.code_phone || ''} ${client.phone}`.trim() : null} />
                            <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Sexe"
                                value={client.sexe === 'M' ? 'Masculin' : client.sexe === 'F' ? 'Féminin' : null} />
                            <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Date de naissance" value={client.date_naissance} />
                            <InfoRow icon={<Shield className="w-3.5 h-3.5" />} label="Inscrit le" value={createdDate} />
                            {profile?.adresse && <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Adresse" value={`${profile.adresse}${profile.ville ? ', ' + profile.ville : ''}`} />}
                            {profile?.pays && <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Pays / Nationalité" value={`${profile.pays}${profile.nationalite ? ' · ' + profile.nationalite : ''}`} />}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h3 className="text-base font-bold flex items-center gap-2 pb-4 mb-4 border-b"
                            style={{ color: T.onSurface, borderColor: `${T.outlineVariant}50` }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: T.surfaceVariant, color: T.primary }}>
                                <ShieldAlert className="w-4 h-4" />
                            </div>
                            Sécurité &amp; Accès
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: `${T.outlineVariant}40`, background: `${T.surfaceVariant}10` }}>
                                <div>
                                    <p className="text-sm font-bold" style={{ color: T.onSurface }}>Statut de l'email</p>
                                    <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5" style={{ color: client.is_verified ? '#059669' : '#dc2626' }}>
                                        {client.is_verified ? 'Vérifié' : 'Non vérifié'}
                                    </p>
                                </div>
                                {client.is_verified ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                    <button onClick={handleForceVerify}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-colors">
                                        Forcer vérif.
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <button onClick={handleTerminateSessions}
                                    className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold border transition-all hover:bg-amber-50"
                                    style={{ color: '#d97706', borderColor: `${T.outlineVariant}60` }}>
                                    <ShieldOff className="w-4 h-4" />
                                    Révoquer les sessions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Tabs (Réservations / Profil CNI) */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Total réserv.', value: reservations.length, icon: <BedDouble className="w-5 h-5" />, color: T.primary },
                            { label: 'Confirmées', value: reservations.filter(r => r.status === 'confirmed').length, icon: <ShieldCheck className="w-5 h-5" />, color: '#3b82f6' },
                            { label: 'Annulées', value: reservations.filter(r => r.status === 'cancelled').length, icon: <XCircle className="w-5 h-5" />, color: '#ef4444' },
                            { label: 'Dépenses', value: `${totalDepense.toLocaleString('fr-FR')} FCFA`, icon: <CreditCard className="w-5 h-5" />, color: '#8b5cf6', small: true },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: `${T.outlineVariant}50` }}>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
                                <p className={`font-black ${s.small ? 'text-sm sm:text-base' : 'text-2xl'}`} style={{ color: s.color }}>{s.value}</p>
                                <p className="text-[11px] font-bold uppercase tracking-wider mt-0.5" style={{ color: T.outline }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tabs bar */}
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-white shadow text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab: Réservations */}
                    {activeTab === 'Réservations' && (
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${T.outlineVariant}50` }}>
                            <div className="p-5 border-b flex items-center gap-2" style={{ borderColor: `${T.outlineVariant}30` }}>
                                <div className="p-1.5 rounded-lg" style={{ background: T.surfaceVariant, color: T.primary }}>
                                    <FileText className="w-4 h-4" />
                                </div>
                                <p className="text-sm font-bold" style={{ color: T.onSurface }}>Historique des réservations</p>
                                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: T.surfaceVariant, color: T.secondary }}>{reservations.length}</span>
                            </div>

                            {reservations.length === 0 ? (
                                <div className="p-12 text-center">
                                    <BedDouble className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: T.onSurface }} />
                                    <p className="text-sm font-semibold" style={{ color: T.outline }}>Aucune réservation pour ce client.</p>
                                </div>
                            ) : (
                                <div className="divide-y" style={{ borderColor: `${T.outlineVariant}20` }}>
                                    {reservations.map(r => {
                                        const s = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                                        const floor = r.floor === 0 ? 'Rez-de-chaussée' : r.floor != null ? `Étage ${r.floor}` : '';
                                        return (
                                            <div key={r.id} className="p-4 hover:bg-amber-50/20 transition-colors">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: T.surfaceVariant }}>
                                                            <BedDouble className="w-4 h-4" style={{ color: T.primary }} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold" style={{ color: T.onSurface }}>{r.room_name || '—'}</p>
                                                            {floor && <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: T.outline }}>{floor}</p>}
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}>
                                                        {s.label}
                                                    </span>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" style={{ color: T.outline }} />
                                                        <span className="text-xs font-medium" style={{ color: T.onSurfaceVariant }}>
                                                            {r.reservation_date ? `Du ${new Date(r.reservation_date).toLocaleDateString('fr-FR')}` : '—'}
                                                            {r.end_date && r.end_date !== r.reservation_date ? ` au ${new Date(r.end_date).toLocaleDateString('fr-FR')}` : ''}
                                                        </span>
                                                    </div>
                                                    {(r.start_time || r.end_time) && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" style={{ color: T.outline }} />
                                                            <span className="text-xs font-medium" style={{ color: T.onSurfaceVariant }}>{r.start_time?.slice(0,5) || '—'} → {r.end_time?.slice(0,5) || '—'}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5">
                                                        <CreditCard className="w-3.5 h-3.5" style={{ color: T.outline }} />
                                                        <span className="text-xs font-bold" style={{ color: T.secondary }}>
                                                            {parseFloat(r.total_price || 0).toLocaleString('fr-FR')} FCFA
                                                        </span>
                                                    </div>
                                                </div>
                                                {r.notes && (
                                                    <p className="mt-3 text-xs font-medium px-3 py-2 rounded-lg" style={{ background: T.surfaceVariant, color: T.onSurfaceVariant }}>
                                                        {r.notes}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Profil CNI */}
                    {activeTab === 'Profil CNI' && (
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${T.outlineVariant}50` }}>
                            <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: `${T.outlineVariant}30` }}>
                                <div className="p-1.5 rounded-lg" style={{ background: T.surfaceVariant, color: T.primary }}>
                                    <IdCard className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold" style={{ color: T.onSurface }}>Carte Nationale d'Identité</p>
                                    <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5" style={{ color: cniVerified ? '#059669' : '#d97706' }}>
                                        {cniVerified ? 'CNI vérifiée ✓' : 'CNI non vérifiée'}
                                    </p>
                                </div>
                                {/* Verification button */}
                                <button
                                    onClick={handleToggleCniVerified}
                                    disabled={!canToggleCni || cniLoading}
                                    title={!canToggleCni ? 'Les deux faces de la CNI doivent être présentes' : ''}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed
                                        ${cniVerified
                                            ? 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'
                                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'}`}
                                >
                                    {cniLoading
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : cniVerified
                                            ? <><BadgeX className="w-4 h-4" /> Annuler vérification</>
                                            : <><BadgeCheck className="w-4 h-4" /> Marquer vérifiée</>
                                    }
                                </button>
                            </div>

                            {/* Info notice */}
                            <div className="mx-5 mt-5 flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
                                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-amber-800">Réservations conditionnées à la vérification</p>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        Les comptes dont la CNI n'est pas vérifiée ne pourront pas effectuer de réservation. Vérifiez les deux faces avant de valider.
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                {/* CNI Number */}
                                {profile?.cni_number ? (
                                    <div className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50" style={{ borderColor: `${T.outlineVariant}50` }}>
                                        <IdCard className="w-4 h-4 text-slate-400" />
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Numéro CNI</p>
                                            <p className="text-sm font-black text-slate-900 font-mono tracking-widest mt-0.5">{profile.cni_number}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic text-center">Aucun numéro de CNI renseigné.</p>
                                )}

                                {/* CNI Images */}
                                <div className="grid grid-cols-2 gap-4">
                                    <CniImage path={profile?.cni_recto_path} label="Recto" />
                                    <CniImage path={profile?.cni_verso_path} label="Verso" />
                                </div>

                                {!canToggleCni && (
                                    <p className="text-xs font-semibold text-center text-orange-600 bg-orange-50 border border-orange-200 rounded-xl p-3">
                                        ⚠ Les deux faces de la CNI doivent être uploadées avant de pouvoir passer le statut à « vérifiée ».
                                    </p>
                                )}

                                {/* Additional profile info */}
                                {profile && (
                                    <div className="pt-2 border-t" style={{ borderColor: `${T.outlineVariant}30` }}>
                                        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: T.outline }}>Informations complémentaires</p>
                                        <div className="space-y-1">
                                            <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Adresse" value={profile.adresse} />
                                            <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Ville" value={profile.ville} />
                                            <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Pays" value={profile.pays} />
                                            <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Nationalité" value={profile.nationalite} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <PasswordModal
                isOpen={!!modalConfig} onClose={closeModal}
                onConfirm={modalConfig?.onConfirm} title={modalConfig?.title}
                message={modalConfig?.message} type={modalConfig?.type}
                requirePassword={modalConfig?.requirePassword} loading={actionLoading}
            />
        </div>
    );
}
