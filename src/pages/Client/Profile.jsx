import React, { useState, useEffect } from 'react';
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

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl bg-slate-900">
                <div className="absolute -right-16 -top-16 opacity-5">
                    <User size={240} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20"
                    style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl border-2 border-amber-500/30 overflow-hidden flex items-center justify-center bg-amber-500/10 shrink-0">
                            {profile?.profil
                                ? <img src={getImageUrl(profile.profil)} alt="Profil" className="w-full h-full object-cover" />
                                : <span className="text-2xl font-black text-amber-400">{initials}</span>}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-black italic tracking-tight">{fullName}</h1>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    Client
                                </span>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70">
                                Mon Profil • Motel Bethuli
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                            <div className="w-2 h-2 rounded-full animate-pulse bg-emerald-400" />
                            <span className="text-xs font-bold text-white">Compte actif</span>
                        </div>
                        <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-center">
                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Membre depuis</p>
                            <p className="text-xs font-black text-white">{memberSince}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
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
                    Identité & CNI
                </button>
            </div>

            {/* ==================== ONGLET INFOS ==================== */}
            {tab === 'infos' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Avatar Card */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center text-center gap-4">
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full border-4 border-amber-100 overflow-hidden flex items-center justify-center bg-amber-50">
                                    {profile?.profil
                                        ? <img src={getImageUrl(profile.profil)} alt="Profil" className="w-full h-full object-cover" />
                                        : <span className="text-4xl font-black text-amber-500">{initials}</span>}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white bg-amber-500 shadow-md">
                                    <ShieldCheck className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{fullName}</h2>
                                <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700">Client</span>
                            </div>
                            <div className="w-full space-y-2 text-sm pt-2 border-t border-slate-100">
                                {profile?.email && (
                                    <div className="flex items-center gap-2 justify-center text-slate-600">
                                        <Mail className="w-4 h-4 shrink-0 text-amber-500" />
                                        <span className="truncate font-medium text-sm">{profile.email}</span>
                                    </div>
                                )}
                                {profile?.phone && (
                                    <div className="flex items-center gap-2 justify-center text-slate-600">
                                        <Phone className="w-4 h-4 shrink-0 text-amber-500" />
                                        <span className="font-medium">{profile.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 justify-center text-slate-400">
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    <span className="text-xs">Membre depuis {memberSince}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Infos + Sécurité */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <User className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">Informations Personnelles</h3>
                                    <p className="text-[10px] text-slate-400">Vos données de compte</p>
                                </div>
                            </div>
                            <InfoRow icon={User} label="Prénom" value={profile?.prenom} />
                            <InfoRow icon={User} label="Nom" value={profile?.nom} />
                            <InfoRow icon={Mail} label="Adresse Email" value={profile?.email} />
                            <InfoRow icon={Phone} label="Téléphone" value={profile?.phone || 'Non renseigné'} />
                            <InfoRow icon={Calendar} label="Membre depuis" value={memberSince} />
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">Sécurité</h3>
                                    <p className="text-[10px] text-slate-400">Gestion du mot de passe</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                        <Lock className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mot de passe</p>
                                        <p className="text-sm font-mono tracking-widest font-bold text-slate-900">••••••••</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 hover:border-slate-300 transition-all"
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
                    {/* Statut banner */}
                    <div className={`p-5 rounded-2xl border flex items-start gap-4 ${cniVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                        {cniVerified ? (
                            <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                        ) : (
                            <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
                        )}
                        <div>
                            <p className={`font-black text-base ${cniVerified ? 'text-emerald-800' : 'text-amber-800'}`}>
                                {cniVerified ? 'Identité vérifiée' : 'Identité non vérifiée'}
                            </p>
                            <p className={`text-sm mt-1 font-medium ${cniVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {cniVerified
                                    ? 'Votre identité a été validée par notre équipe. Vous pouvez effectuer des réservations.'
                                    : 'Les comptes non vérifiés ne peuvent pas faire de réservation. Veuillez compléter et soumettre vos informations CNI.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">Carte Nationale d'Identité</h3>
                                    <p className="text-[10px] text-slate-400">Vos informations d'identité</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCniModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-700 transition-all shadow-sm"
                            >
                                <Edit2 className="w-3.5 h-3.5" /> Mettre à jour
                            </button>
                        </div>

                        <div className="space-y-0">
                            <InfoRow icon={CreditCard} label="Numéro CNI" value={customerProfile?.cni_number} />
                            <InfoRow icon={MapPin} label="Adresse" value={customerProfile?.adresse} />
                            <InfoRow icon={MapPin} label="Ville" value={customerProfile?.ville} />
                            <InfoRow icon={Globe} label="Pays" value={customerProfile?.pays} />
                            <InfoRow icon={Globe} label="Nationalité" value={customerProfile?.nationalite} />
                        </div>
                    </div>

                    {/* Photos CNI */}
                    {(customerProfile?.cni_recto_path || customerProfile?.cni_verso_path) && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                                    <Camera className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">Photos de votre CNI</h3>
                                    <p className="text-[10px] text-slate-400">Cliquez sur une photo pour l'agrandir</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { path: customerProfile?.cni_recto_path, label: 'Recto (Face avant)' },
                                    { path: customerProfile?.cni_verso_path, label: 'Verso (Face arrière)' },
                                ].map(({ path, label }) => path && (
                                    <div key={label}>
                                        <p className="text-xs font-bold text-slate-500 mb-2 text-center">{label}</p>
                                        <button
                                            className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 hover:border-amber-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                                            onClick={() => setLightboxImage(getImageUrl(path))}
                                        >
                                            <img src={getImageUrl(path)} alt={label} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
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
                    <button onClick={() => setLightboxImage(null)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
}
