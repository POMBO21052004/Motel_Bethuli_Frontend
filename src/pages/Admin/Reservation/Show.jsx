import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Loader2, Edit, Trash2, User, BedDouble, CheckCircle, Clock, Banknote, ShieldAlert } from 'lucide-react';
import adminService from '../../../services/adminService';
import { getImageUrl } from '../../../utils/getImageUrl';
import { ReservationModel } from '../../../models/ReservationModel';

import { useToast } from '../../../components/common/ToastContext';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
    surfaceVariant: '#fef3c7', secondary: '#b45309', error: '#ef4444',
};

export default function ReservationShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchReservation = async () => {
            try {
                const response = await adminService.getReservation(id);
                setReservation(response.data.data);
            } catch (err) {
                setError("Impossible de charger les détails de la réservation.");
            } finally {
                setLoading(false);
            }
        };
        fetchReservation();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) return;
        setIsDeleting(true);
        try {
            await adminService.deleteReservation(id);
            toast.success("Réservation supprimée avec succès.");
            navigate('/admin/reservations');
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur lors de la suppression.");
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <span className="text-sm font-medium text-slate-500 italic">Chargement...</span>
            </div>
        );
    }

    if (error || !reservation) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <ShieldAlert className="w-12 h-12 text-red-500" />
                <span className="text-sm font-medium text-red-500">{error}</span>
                <button onClick={() => navigate('/admin/reservations')} className="text-amber-600 font-bold mt-2">Retour</button>
            </div>
        );
    }

    const roomImage = reservation.room?.images?.[0] ? getImageUrl(reservation.room.images[0].image_path) : null;

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20" style={{ color: T.onSurface }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: T.outline }}>
                <span className="hover:underline cursor-pointer transition-colors" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
                <ArrowLeft className="w-3 h-3 mx-1" />
                <span className="hover:underline cursor-pointer transition-colors" onClick={() => navigate('/admin/reservations')}>Réservations</span>
                <ArrowLeft className="w-3 h-3 mx-1" />
                <span style={{ color: T.primary }}>Détails</span>
            </div>

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                <div className="absolute -right-10 -top-10 opacity-5">
                    <CalendarDays size={240} className="rotate-12" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl border backdrop-blur-md" style={{ background: `${T.primary}30`, borderColor: `${T.primary}50` }}>
                            <CalendarDays className="w-7 h-7" style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tight">Réservation #{reservation.id.slice(0,8).toUpperCase()}</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#f59e0b' }}>
                                Détails du séjour
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={() => navigate(`/admin/reservations/${id}/edit`)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-all bg-white text-slate-900"
                        >
                            <Edit className="w-4 h-4" />
                            Modifier
                        </button>
                        <button 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-all bg-red-500 text-white disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            {isDeleting ? 'Suppression...' : 'Supprimer'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Informations de Séjour (Col 1 & 2) */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Status & Dates */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: `${T.outlineVariant}50` }}>
                            <h2 className="text-lg font-bold" style={{ color: T.onSurface }}>Période du Séjour</h2>
                            <span className="px-3 py-1 rounded-lg text-xs font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                                Statut: {ReservationModel.getStatusLabel(reservation.status)}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="sm:col-span-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Période</p>
                                <p className="text-lg font-black text-slate-800">Du {new Date(reservation.reservation_date).toLocaleDateString('fr-FR')} au {new Date(reservation.end_date || reservation.reservation_date).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Heure de début</p>
                                <p className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    {reservation.start_time.slice(0,5)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Heure de fin</p>
                                <p className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    {reservation.end_time.slice(0,5)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Client Info */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6 flex items-start gap-5" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <User className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold mb-1" style={{ color: T.onSurface }}>Client : {reservation.client?.prenom} {reservation.client?.nom}</h2>
                            <p className="text-sm font-medium text-slate-500">{reservation.client?.email}</p>
                            {reservation.client?.phone && <p className="text-sm font-medium text-slate-500">{reservation.client?.phone}</p>}
                        </div>
                        <button onClick={() => navigate(`/admin/clients/${reservation.client_id}`)} className="text-xs font-bold text-amber-600 hover:underline">
                            Voir le profil
                        </button>
                    </div>

                    {/* Facturation */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-lg font-bold border-b pb-4 mb-4" style={{ color: T.onSurface, borderColor: `${T.outlineVariant}50` }}>Facturation & Notes</h2>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: T.surfaceVariant, color: T.primary }}>
                                <Banknote className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.outline }}>Montant Total</p>
                                <p className="text-2xl font-black" style={{ color: T.onSurface }}>
                                    {Number(reservation.total_price).toLocaleString('fr-FR')} <span className="text-sm font-bold opacity-80">FCFA</span>
                                </p>
                            </div>
                        </div>

                        {reservation.notes && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">Notes de réservation</p>
                                <p className="text-sm font-medium text-amber-900 leading-relaxed whitespace-pre-wrap">{reservation.notes}</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Chambre (Col 3) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-lg font-bold mb-4" style={{ color: T.onSurface }}>Chambre Réservée</h2>
                        
                        <div className="space-y-4">
                            {roomImage ? (
                                <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 border border-slate-100">
                                    <img src={roomImage} alt="Room" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-full aspect-video rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                                    <BedDouble className="w-8 h-8 text-slate-300" />
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nom</p>
                                <p className="font-bold text-slate-900">{reservation.room?.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Étage</p>
                                    <p className="font-bold text-slate-700">{reservation.room?.floor === 0 ? 'RDC' : reservation.room?.floor}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capacité</p>
                                    <p className="font-bold text-slate-700">{reservation.room?.capacity} pers.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
