import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    User, Mail, Phone, Calendar, Shield, ShieldCheck, ShieldX,
    Lock, CreditCard, MapPin, Globe, Edit2, AlertTriangle, CheckCircle2,
    Loader2, Camera, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import profileService from '../../services/client/profileService';
import { getImageUrl } from '../../utils/getImageUrl';
import PasswordModal from './PasswordModal';
import CniModal from './CniModal';

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-4 py-3.5 border-b border-slate-100 last:border-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-50">
                <Icon className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                <p className="text-sm font-bold text-slate-800 truncate">{value || '—'}</p>
            </div>
        </div>
    );
}

export default function ClientProfile() {
    const { user: authUser, setUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('infos');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isCniModalOpen, setIsCniModalOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await profileService.get();
            setProfile(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    const fullName = `${profile?.prenom || ''} ${profile?.nom || ''}`.trim() || 'Mon Profil';
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const memberSince = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
        : '—';

    const customerProfile = profile?.customer_profile;
    const cniVerified = customerProfile?.cni_verified;
    const cniHasFiles = customerProfile?.cni_recto_path && customerProfile?.cni_verso_path;

    return (
        <div className="space-y-6 pb-10 max-w-5xl mx-auto">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-extrabold text-slate-800">Mon Profil</h1>
                    <div className="w-16 h-1 bg-amber-500 rounded-full mt-2" />
                    <p className="text-base text-slate-500 mt-3">
                        Gérez vos informations personnelles et votre sécurité
                    </p>
                </div>

                {/* Avatar + name summary */}
                <div className="flex items-center gap-3 shrink-0">
                    {profile?.profil ? (
                        <img
                            src={getImageUrl(profile.profil)}
                            alt="Profil"
                            className="w-20 h-20 rounded-full object-cover border-4 border-amber-100"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-amber-500 text-white font-extrabold text-2xl flex items-center justify-center">
                            {initials}
                        </div>
                    )}
                    <div>
                        <p className="font-bold text-slate-800">{fullName}</p>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                            Client
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">Membre depuis {memberSince}</p>
                    </div>
                </div>
            </div>

            {/* ── Tab Switcher ── */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-full max-w-xs">
                <button
                    onClick={() => setTab('infos')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'infos' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Mon profil
                </button>
                <button
                    onClick={() => setTab('cni')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'cni' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Identité &amp; CNI
                </button>
            </div>

            {/* ==================== ONGLET INFOS ==================== */}
            {tab === 'infos' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ── Avatar Card ── */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center gap-4">
                            <div className="relative">
                                {profile?.profil ? (
                                    <img
                                        src={getImageUrl(profile.profil)}
                                        alt="Profil"
                                        className="w-20 h-20 rounded-full object-cover border-4 border-amber-100"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-amber-500 text-white font-extrabold text-2xl flex items-center justify-center">
                                        {initials}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white bg-amber-500 shadow-md">
                                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{fullName}</h2>
                                <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                    Client
                                </span>
                            </div>

                            <div className="w-full pt-2 border-t border-gray-100 space-y-2">
                                {profile?.email && (
                                    <div className="flex items-center gap-2 justify-center text-slate-600">
                                        <Mail className="w-4 h-4 shrink-0 text-amber-500" />
                                        <span className="truncate text-sm">{profile.email}</span>
                                    </div>
                                )}
                                {profile?.phone && (
                                    <div className="flex items-center gap-2 justify-center text-slate-600">
                                        <Phone className="w-4 h-4 shrink-0 text-amber-500" />
                                        <span className="text-sm">{`${profile.code_phone || ''} ${profile.phone}`.trim()}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 justify-center text-slate-400">
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    <span className="text-xs">Membre depuis {memberSince}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Infos + Sécurité ── */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Informations Personnelles */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">Informations Personnelles</h3>
                                    <p className="text-sm text-slate-500">Vos données de compte</p>
                                </div>
                                <Link 
                                    to="/client/profile/edit"
                                    className="px-4 py-2 border-2 border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                                >
                                    <Edit2 className="w-3.5 h-3.5" /> Modifier
                                </Link>
                            </div>
                            <InfoRow icon={User}     label="Prénom"         value={profile?.prenom} />
                            <InfoRow icon={User}     label="Nom"            value={profile?.nom} />
                            <InfoRow icon={User}     label="Sexe"           value={profile?.sexe} />
                            <InfoRow icon={Calendar} label="Date de naissance" value={profile?.date_naissance ? new Date(profile?.date_naissance).toLocaleDateString('fr-FR') : null} />
                            <InfoRow icon={Mail}     label="Adresse Email"  value={profile?.email} />
                            <InfoRow icon={Phone}    label="Téléphone"      value={profile?.phone ? `${profile?.code_phone || ''} ${profile?.phone}`.trim() : 'Non renseigné'} />
                            <InfoRow icon={Calendar} label="Membre depuis"  value={memberSince} />
                        </div>

                        {/* Sécurité */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Sécurité</h3>
                            <p className="text-sm text-slate-500 mb-5">Gestion du mot de passe</p>

                            <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                        <Lock className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mot de passe</p>
                                        <p className="text-sm font-mono tracking-widest font-bold text-slate-900">••••••••</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="px-5 py-2.5 border-2 border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                                >
                                    <Edit2 className="w-3.5 h-3.5" /> Modifier
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
                                <ShieldCheck className="w-5 h-5 shrink-0 text-amber-500" />
                                <p className="text-xs font-semibold text-amber-700">Votre compte est sécurisé et actif.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== ONGLET CNI ==================== */}
            {tab === 'cni' && (
                <div className="space-y-6">

                    {/* Status Banner */}
                    {cniVerified ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
                            <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-slate-800 text-base">Identité vérifiée</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    Votre identité a été validée par notre équipe. Vous pouvez effectuer des réservations.
                                </p>
                                <span className="inline-block mt-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                                    ✓ Vérifié
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
                            <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-slate-800 text-base">Identité non vérifiée</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    Les comptes non vérifiés ne peuvent pas faire de réservation. Veuillez compléter et soumettre vos informations CNI.
                                </p>
                                <span className="inline-block mt-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">
                                    En attente de vérification
                                </span>
                            </div>
                        </div>
                    )}

                    {/* CNI Details Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Carte Nationale d'Identité</h3>
                                <p className="text-sm text-slate-500">Vos informations d'identité</p>
                            </div>
                            <button
                                onClick={() => setIsCniModalOpen(true)}
                                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Edit2 className="w-3.5 h-3.5" /> Mettre à jour
                            </button>
                        </div>

                        <InfoRow icon={CreditCard} label="Numéro CNI"  value={customerProfile?.cni_number} />
                        <InfoRow icon={MapPin}     label="Adresse"     value={customerProfile?.adresse} />
                        <InfoRow icon={MapPin}     label="Ville"       value={customerProfile?.ville} />
                        <InfoRow icon={Globe}      label="Pays"        value={customerProfile?.pays} />
                        <InfoRow icon={Globe}      label="Nationalité" value={customerProfile?.nationalite} />
                    </div>

                    {/* Photos CNI */}
                    {(customerProfile?.cni_recto_path || customerProfile?.cni_verso_path) && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Photos de votre CNI</h3>
                            <p className="text-sm text-slate-500 mb-5">Cliquez sur une photo pour l'agrandir</p>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { path: customerProfile?.cni_recto_path, label: 'Recto (Face avant)' },
                                    { path: customerProfile?.cni_verso_path, label: 'Verso (Face arrière)' },
                                ].map(({ path, label }) => path && (
                                    <div key={label}>
                                        <p className="text-xs font-bold text-slate-500 mb-2 text-center">{label}</p>
                                        <button
                                            className="w-full aspect-video border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-xl overflow-hidden cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                                            onClick={() => setLightboxImage(getImageUrl(path))}
                                        >
                                            <img
                                                src={getImageUrl(path)}
                                                alt={label}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
            <CniModal
                isOpen={isCniModalOpen}
                onClose={() => setIsCniModalOpen(false)}
                profile={customerProfile}
                onSuccess={fetchProfile}
            />

            {/* Lightbox */}
            {lightboxImage && (
                <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
                    <img src={lightboxImage} alt="CNI" className="max-w-full max-h-full rounded-xl shadow-2xl object-contain" />
                    <button
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
}
