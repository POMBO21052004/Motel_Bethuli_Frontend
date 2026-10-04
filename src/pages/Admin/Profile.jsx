import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    User, Mail, Phone, Calendar, ShieldCheck,
    Lock, Edit2, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import profileService from '../../services/admin/profileService';
import { getImageUrl } from '../../utils/getImageUrl';
import PasswordModal from '../Client/PasswordModal';

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

export default function AdminProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
                            Administrateur
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">Membre depuis {memberSince}</p>
                    </div>
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ── Avatar Card ── */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center gap-4">
                        <div className="relative">
                            {profile?.profil ? (
                                <img
                                    src={getImageUrl(profile.profil)}
                                    alt="Profil"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-100"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-amber-500 text-white font-extrabold text-2xl flex items-center justify-center">
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
                                Administrateur
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

                        <Link
                            to="/admin/profile/edit"
                            className="w-full mt-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" /> Modifier mon profil
                        </Link>
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
                                to="/admin/profile/edit"
                                className="px-4 py-2 border-2 border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                            >
                                <Edit2 className="w-3.5 h-3.5" /> Modifier
                            </Link>
                        </div>
                        <InfoRow icon={User}     label="Prénom"            value={profile?.prenom} />
                        <InfoRow icon={User}     label="Nom"               value={profile?.nom} />
                        <InfoRow icon={User}     label="Sexe"              value={profile?.sexe} />
                        <InfoRow icon={Calendar} label="Date de naissance" value={profile?.date_naissance ? new Date(profile?.date_naissance).toLocaleDateString('fr-FR') : null} />
                        <InfoRow icon={Mail}     label="Adresse Email"     value={profile?.email} />
                        <InfoRow icon={Phone}    label="Téléphone"         value={profile?.phone ? `${profile?.code_phone || ''} ${profile?.phone}`.trim() : 'Non renseigné'} />
                        <InfoRow icon={Calendar} label="Membre depuis"     value={memberSince} />
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

            {/* Modals */}
            <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
        </div>
    );
}
