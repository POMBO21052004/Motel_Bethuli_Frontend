import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Users, BedDouble, MapPin, CalendarDays,
    ChevronLeft, ChevronRight, Loader2, Star,
    CheckCircle, AlertTriangle, Clock, MessageSquare, MessageCircle
} from 'lucide-react';
import reservationService from '../../services/client/reservationService';
import roomService from '../../services/roomService';
import { getImageUrl } from '../../utils/getImageUrl.jsx';
import { RoomModel } from '../../models/RoomModel';
import { useAuth } from '../../contexts/AuthContext';

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

function StarRow({ value, max = 5 }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < value ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                />
            ))}
        </div>
    );
}

export default function ClientRoomShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    // Booking form
    const today = new Date().toISOString().split('T')[0];
    const getNextDay = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    };
    const tomorrow = getNextDay(today);
    
    const [form, setForm] = useState({ reservation_date: today, end_date: tomorrow });
    const [availMsg, setAvailMsg] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [successData, setSuccessData] = useState(null);

    // Fetch room (public endpoint includes ratings + availability)
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await roomService.publicShow(id);
                setRoom(res.data.data);
            } catch {
                navigate('/client/rooms');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id, navigate]);

    // Debounced availability check
    useEffect(() => {
        if (!form.reservation_date || !form.end_date) { setAvailMsg(null); return; }
        if (form.end_date < form.reservation_date) { setAvailMsg(null); return; }

        setAvailMsg({ type: 'checking', text: 'Vérification en cours...' });
        let cancelled = false;

        const timer = setTimeout(async () => {
            try {
                const res = await reservationService.checkAvailability({
                    room_id: id,
                    reservation_date: form.reservation_date,
                    end_date: form.end_date,
                });
                if (cancelled) return;
                const data = res.data;
                if (data.available) {
                    setAvailMsg({ type: 'success', text: data.message, price: data.price, days: data.days });
                } else {
                    setAvailMsg({
                        type: 'error',
                        text: data.message + (data.from ? ` (du ${formatDate(data.from)} au ${formatDate(data.until)})` : ''),
                    });
                }
            } catch {
                if (!cancelled) setAvailMsg(null);
            }
        }, 500);

        return () => { cancelled = true; clearTimeout(timer); };
    }, [id, form.reservation_date, form.end_date]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (availMsg?.type === 'error') return;
        setSubmitting(true);
        try {
            const res = await reservationService.store({ ...form, room_id: id });
            setSuccessData(res.data.data);
        } catch (error) {
            setAvailMsg({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la réservation.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
                <p className="text-sm font-medium text-slate-400">Chargement de la chambre...</p>
            </div>
        );
    }
    if (!room) return null;

    const images = room.images?.length > 0
        ? room.images.map(img => getImageUrl(img.image_path))
        : [];

    const floorLabel = Number(room.floor) === 0 ? 'Rez-de-chaussée' : `Étage ${room.floor}`;
    const isMaintenance = room.status?.value === 'maintenance' || room.status === 'maintenance';
    const ratings = room.ratings || [];
    const avgRating = room.avg_rating;

    return (
        <div className="space-y-6 animate-in fade-in pb-12">

            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-amber-600 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Retour aux chambres
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* ── Left : Gallery + Description + Reviews ── */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Gallery */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                        <div className="relative aspect-video overflow-hidden bg-slate-100">
                            {images.length > 0 ? (
                                <img
                                    src={images[activeImage]}
                                    alt={room.name}
                                    className="w-full h-full object-cover transition-all duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <BedDouble className="w-16 h-16 text-slate-300" />
                                </div>
                            )}
                            {/* Status badge */}
                            <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${RoomModel.getStatusColor(room.status)}`}>
                                {RoomModel.getStatusLabel(room.status)}
                            </div>
                            {/* Nav arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setActiveImage(i => (i + 1) % images.length)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                        {images.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveImage(i)}
                                                className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? 'bg-amber-500 w-5' : 'bg-white/60 hover:bg-white'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 p-3 overflow-x-auto">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeImage ? 'border-amber-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-90'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            Description
                        </h2>
                        <p className="text-slate-600 leading-relaxed text-sm">
                            {room.description_fr || 'Aucune description disponible pour cette chambre.'}
                        </p>
                    </div>

                    {/* Inclus */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Ce qui est inclus</h2>
                        {room.features && room.features.length > 0 ? (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                                {room.features.map(item => (
                                    <li key={item} className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500 italic">Aucun équipement spécifique renseigné pour cette chambre.</p>
                        )}
                    </div>

                    {/* Reviews / Avis */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-amber-500" />
                                Avis clients
                            </h2>
                            {avgRating && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span className="font-black text-slate-800 text-sm">{avgRating}</span>
                                    <span className="text-xs text-slate-400">/ 5</span>
                                    <span className="text-xs text-slate-400">({room.ratings_count} avis)</span>
                                </div>
                            )}
                        </div>

                        {ratings.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <Star className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                                <p className="text-sm font-medium">Aucun avis pour le moment.</p>
                                <p className="text-xs mt-1">Soyez le premier à partager votre expérience !</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {ratings.map((r) => (
                                    <div key={r.id} className="border border-slate-100 rounded-xl p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-black text-amber-600">
                                                        {r.client ? r.client.prenom[0].toUpperCase() : '?'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {r.client ? `${r.client.prenom} ${r.client.nom}` : 'Anonyme'}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <StarRow value={r.rating} />
                                        </div>
                                        {r.comment && (
                                            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                                        )}
                                        {/* Sub-ratings */}
                                        {(r.cleanliness_rating || r.service_rating || r.comfort_rating) && (
                                            <div className="mt-3 pt-3 border-t border-slate-50 grid grid-cols-3 gap-3">
                                                {r.cleanliness_rating && (
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Propreté</p>
                                                        <p className="text-sm font-black text-amber-500">{r.cleanliness_rating}/5</p>
                                                    </div>
                                                )}
                                                {r.service_rating && (
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Service</p>
                                                        <p className="text-sm font-black text-amber-500">{r.service_rating}/5</p>
                                                    </div>
                                                )}
                                                {r.comfort_rating && (
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Confort</p>
                                                        <p className="text-sm font-black text-amber-500">{r.comfort_rating}/5</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right : Sticky info + Booking ── */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden sticky top-24">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white">
                            <h1 className="text-2xl font-black mb-1 leading-tight">{room.name}</h1>
                            <div className="flex items-center gap-1.5 text-amber-100 text-sm">
                                <MapPin className="w-4 h-4" />
                                {floorLabel} — Motel Bethuli
                            </div>
                            {avgRating && (
                                <div className="flex items-center gap-1.5 mt-2">
                                    <Star className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                                    <span className="text-sm font-black text-white">{avgRating}</span>
                                    <span className="text-xs text-amber-200">({room.ratings_count} avis)</span>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <div className="px-6 py-5 border-b border-slate-100">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-slate-900">
                                    {Number(room.price_per_day).toLocaleString('fr-FR')}
                                </span>
                                <span className="text-slate-400 text-sm font-medium">FCFA / nuit</span>
                            </div>
                            {availMsg?.type === 'success' && availMsg.days && (
                                <p className="text-xs font-bold text-emerald-600 mt-1">
                                    {availMsg.days} nuit{availMsg.days > 1 ? 's' : ''} → {Number(availMsg.price).toLocaleString('fr-FR')} FCFA
                                </p>
                            )}
                        </div>

                        {/* Details */}
                        <div className="px-6 py-4 space-y-3 border-b border-slate-100">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-amber-400" /> Capacité
                                </span>
                                <span className="font-semibold text-slate-800">{room.capacity} personne{room.capacity > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-amber-400" /> Étage
                                </span>
                                <span className="font-semibold text-slate-800">{floorLabel}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-400" /> Check-in/out
                                </span>
                                <span className="font-semibold text-slate-800">12h00</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-amber-400" /> Disponibilité
                                </span>
                                <span className={`font-semibold ${room.status === 'available' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {RoomModel.getStatusLabel(room.status)}
                                </span>
                            </div>
                        </div>

                        {/* Booking form */}
                        <div className="px-6 py-5 space-y-3">
                            {!isMaintenance ? (
                                <form onSubmit={handleBooking} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Arrivée</label>
                                            <input
                                                type="date"
                                                min={today}
                                                value={form.reservation_date}
                                                onChange={e => {
                                                    const newStart = e.target.value;
                                                    const minEnd = getNextDay(newStart);
                                                    setForm(f => ({
                                                        ...f, 
                                                        reservation_date: newStart, 
                                                        end_date: f.end_date <= newStart ? minEnd : f.end_date 
                                                    }));
                                                }}
                                                required
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-amber-400 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Départ</label>
                                            <input
                                                type="date"
                                                min={getNextDay(form.reservation_date)}
                                                value={form.end_date}
                                                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-amber-400 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Availability feedback */}
                                    {availMsg && (
                                        <div className={`flex items-start gap-2 p-3 rounded-xl text-xs font-semibold border ${
                                            availMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            availMsg.type === 'error'   ? 'bg-red-50 text-red-600 border-red-200' :
                                            'bg-amber-50 text-amber-600 border-amber-200'
                                        }`}>
                                            {availMsg.type === 'checking' && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 mt-0.5" />}
                                            {availMsg.type === 'success'  && <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                                            {availMsg.type === 'error'    && <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                                            <div>
                                                <p>{availMsg.text}</p>
                                                {availMsg.type === 'success' && availMsg.price && (
                                                    <p className="mt-0.5 font-black text-emerald-800">
                                                        {availMsg.days} nuit{availMsg.days > 1 ? 's' : ''} · {Number(availMsg.price).toLocaleString('fr-FR')} FCFA
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting || availMsg?.type === 'error' || availMsg?.type === 'checking'}
                                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-sm shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BedDouble className="w-4 h-4" />}
                                        {submitting ? 'En cours...' : 'Vérifier & Réserver'}
                                    </button>
                                </form>
                            ) : (
                                <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    Cette chambre est actuellement en maintenance.
                                </div>
                            )}

                            <Link
                                to="/client/rooms"
                                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-slate-200 hover:border-amber-400 text-slate-600 hover:text-amber-600 rounded-xl font-semibold text-sm transition-all"
                            >
                                Voir d'autres chambres
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {successData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 text-center shadow-2xl border border-slate-100 max-w-sm w-full animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Réservation envoyée !</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Votre demande est <strong className="text-amber-500">en attente de confirmation</strong>. Pour accélérer le processus, vous pouvez contacter notre support sur WhatsApp.
                        </p>
                        <div className="space-y-3">
                            <button 
                                onClick={() => {
                                    const text = encodeURIComponent(
`Bonjour l'équipe du Motel Bethuli,

Je vous contacte afin d'accélérer le processus de ma demande de réservation.
Voici les détails de ma demande :

*Objet :* Confirmation de réservation
*Hôtel :* Motel Bethuli
*Client :* ${user?.prenom} ${user?.nom}
*Chambre :* ${successData.room?.name || room.name} (Étage : ${room.floor === 0 ? 'RDC' : room.floor})
*Date d'arrivée :* ${new Date(successData.reservation_date).toLocaleDateString('fr-FR')}
*Date de départ :* ${new Date(successData.end_date).toLocaleDateString('fr-FR')}

Merci d'avance pour votre prise en charge rapide !`);
                                    window.open(`https://wa.me/237600000000?text=${text}`, '_blank');
                                }}
                                className="w-full px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-base shadow-md transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-5 h-5" /> Contacter sur WhatsApp
                            </button>
                            <button
                                onClick={() => navigate('/client/reservations')}
                                className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                            >
                                Voir mes réservations
                            </button>
                            <button
                                onClick={() => { setSuccessData(null); setAvailMsg(null); }}
                                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 font-medium text-sm hover:bg-slate-200 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
