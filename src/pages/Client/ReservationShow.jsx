import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, BedDouble, CalendarDays, Clock, MapPin, Users,
    Loader2, Star, CheckCircle, AlertTriangle, MessageSquare,
    ChevronLeft, ChevronRight, X, Send
} from 'lucide-react';
import reservationService from '../../services/client/reservationService';
import ratingService from '../../services/client/ratingService';
import { ReservationModel, ReservationStatus } from '../../models/ReservationModel';
import { getImageUrl } from '../../utils/getImageUrl.jsx';

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const formatDateShort = (d) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function StatusBadge({ status }) {
    const map = {
        pending:   'bg-amber-100 text-amber-700 border-amber-200',
        confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
        completed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${map[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            {ReservationModel.getStatusLabel(status)}
        </span>
    );
}

function StarInput({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    className="focus:outline-none"
                >
                    <Star
                        className={`w-8 h-8 transition-colors ${
                            n <= (hovered || value)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 fill-slate-200'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

function SubStarInput({ label, value, onChange }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{label}</span>
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => onChange(n)} className="focus:outline-none">
                        <Star className={`w-4 h-4 transition-colors ${n <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                    </button>
                ))}
            </div>
        </div>
    );
}

// ── Rating Modal ────────────────────────────────────────────────────────────
function RatingModal({ reservation, existingRating, onClose, onSuccess }) {
    const [form, setForm] = useState({
        rating: existingRating?.rating || 5,
        comment: existingRating?.comment || '',
        cleanliness_rating: existingRating?.cleanliness_rating || 0,
        service_rating: existingRating?.service_rating || 0,
        comfort_rating: existingRating?.comfort_rating || 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await ratingService.upsert({
                reservation_id: reservation.id,
                rating: form.rating,
                comment: form.comment,
                cleanliness_rating: form.cleanliness_rating || null,
                service_rating: form.service_rating || null,
                comfort_rating: form.comfort_rating || null,
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la soumission.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-lg font-black text-slate-900">
                            {existingRating ? 'Modifier votre avis' : 'Laisser un avis'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{reservation.room?.name}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5">
                    {/* Global rating */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Note globale</label>
                        <StarInput value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} />
                        <p className="text-xs text-slate-400 mt-1">
                            {['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent'][form.rating]}
                        </p>
                    </div>

                    {/* Sub ratings */}
                    <div className="space-y-3 bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Critères détaillés (optionnel)</p>
                        <SubStarInput label="Propreté"  value={form.cleanliness_rating} onChange={(v) => setForm(f => ({ ...f, cleanliness_rating: v }))} />
                        <SubStarInput label="Service"   value={form.service_rating}     onChange={(v) => setForm(f => ({ ...f, service_rating: v }))} />
                        <SubStarInput label="Confort"   value={form.comfort_rating}     onChange={(v) => setForm(f => ({ ...f, comfort_rating: v }))} />
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Commentaire</label>
                        <textarea
                            value={form.comment}
                            onChange={(e) => setForm(f => ({ ...f, comment: e.target.value }))}
                            placeholder="Décrivez votre expérience..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors resize-none"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {existingRating ? 'Mettre à jour' : 'Envoyer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ClientReservationShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [showRatingModal, setShowRatingModal] = useState(false);

    const fetchReservation = async () => {
        try {
            const res = await reservationService.show(id);
            setReservation(res.data.data);
        } catch {
            navigate('/client/reservations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReservation(); }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
                <p className="text-sm font-medium text-slate-400">Chargement de la réservation...</p>
            </div>
        );
    }
    if (!reservation) return null;

    const room = reservation.room;
    const images = room?.images?.length > 0
        ? room.images.map(img => getImageUrl(img.image_path))
        : (room?.primary_image?.image_path ? [getImageUrl(room.primary_image.image_path)] : []);
    const floorLabel = room?.floor === 0 ? 'Rez-de-chaussée' : `Étage ${room?.floor}`;
    const nights = reservation.reservation_date && reservation.end_date
        ? Math.max(1, Math.round((new Date(reservation.end_date) - new Date(reservation.reservation_date)) / 86400000))
        : 1;
    const canRate = reservation.status === ReservationStatus.CONFIRMED || reservation.status === ReservationStatus.COMPLETED;
    const existingRating = reservation.rating;

    return (
        <div className="space-y-6 animate-in fade-in pb-12">
            {/* Rating Modal */}
            {showRatingModal && (
                <RatingModal
                    reservation={reservation}
                    existingRating={existingRating}
                    onClose={() => setShowRatingModal(false)}
                    onSuccess={() => {
                        setShowRatingModal(false);
                        fetchReservation();
                    }}
                />
            )}

            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-amber-600 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Mes réservations
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* ── Left ── */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Gallery */}
                    {images.length > 0 && (
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                            <div className="relative aspect-video overflow-hidden">
                                <img
                                    src={images[activeImage]}
                                    alt={room?.name}
                                    className="w-full h-full object-cover transition-all duration-500"
                                />
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setActiveImage(i => (i + 1) % images.length)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                            {images.map((_, i) => (
                                                <button key={i} onClick={() => setActiveImage(i)}
                                                    className={`h-1.5 rounded-full transition-all ${i === activeImage ? 'bg-amber-500 w-5' : 'bg-white/60 w-1.5'}`} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-2 p-3 overflow-x-auto">
                                    {images.map((img, i) => (
                                        <button key={i} onClick={() => setActiveImage(i)}
                                            className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeImage ? 'border-amber-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-90'}`}>
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dates & Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-amber-500" />
                            Détails du séjour
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Arrivée</p>
                                <p className="font-bold text-slate-800 text-sm">{formatDateShort(reservation.reservation_date)}</p>
                                <p className="text-xs text-slate-400 mt-0.5">à 12h00</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Départ</p>
                                <p className="font-bold text-slate-800 text-sm">{formatDateShort(reservation.end_date)}</p>
                                <p className="text-xs text-slate-400 mt-0.5">à 12h00</p>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock className="w-4 h-4 text-amber-400" />
                                <span className="font-semibold">{nights} nuit{nights > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="w-4 h-4 text-amber-400" />
                                <span className="font-semibold">{floorLabel}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Users className="w-4 h-4 text-amber-400" />
                                <span className="font-semibold">{room?.capacity} personne{room?.capacity > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        {reservation.notes && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                                <p className="text-sm text-slate-600 leading-relaxed">{reservation.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Avis */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-amber-500" />
                                {existingRating ? 'Votre avis' : 'Laisser un avis'}
                            </h2>
                            {canRate && (
                                <button
                                    onClick={() => setShowRatingModal(true)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-colors"
                                >
                                    <Star className="w-3.5 h-3.5" />
                                    {existingRating ? 'Modifier' : 'Évaluer'}
                                </button>
                            )}
                        </div>

                        {!canRate ? (
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl text-sm text-slate-500">
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                Un avis ne peut être laissé que pour une réservation confirmée.
                            </div>
                        ) : existingRating ? (
                            <div className="space-y-3">
                                {/* Stars */}
                                <div className="flex items-center gap-2">
                                    {[1,2,3,4,5].map(n => (
                                        <Star key={n} className={`w-5 h-5 ${n <= existingRating.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                                    ))}
                                    <span className="font-black text-slate-800 ml-1">{existingRating.rating}/5</span>
                                </div>
                                {existingRating.comment && (
                                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">
                                        "{existingRating.comment}"
                                    </p>
                                )}
                                {/* Sub-ratings */}
                                {(existingRating.cleanliness_rating || existingRating.service_rating || existingRating.comfort_rating) && (
                                    <div className="grid grid-cols-3 gap-3 pt-2">
                                        {existingRating.cleanliness_rating && (
                                            <div className="text-center bg-amber-50 rounded-xl p-3">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Propreté</p>
                                                <p className="text-lg font-black text-amber-500 mt-0.5">{existingRating.cleanliness_rating}/5</p>
                                            </div>
                                        )}
                                        {existingRating.service_rating && (
                                            <div className="text-center bg-amber-50 rounded-xl p-3">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Service</p>
                                                <p className="text-lg font-black text-amber-500 mt-0.5">{existingRating.service_rating}/5</p>
                                            </div>
                                        )}
                                        {existingRating.comfort_rating && (
                                            <div className="text-center bg-amber-50 rounded-xl p-3">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Confort</p>
                                                <p className="text-lg font-black text-amber-500 mt-0.5">{existingRating.comfort_rating}/5</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Star className="w-7 h-7 text-amber-300" />
                                </div>
                                <p className="text-sm font-medium text-slate-600">Partagez votre expérience</p>
                                <p className="text-xs text-slate-400 mt-1">Votre avis aide les autres voyageurs à choisir.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: Summary card ── */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden sticky top-24">
                        {/* Gradient header */}
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white">
                            <h1 className="text-2xl font-black mb-1 leading-tight">{room?.name || 'Chambre'}</h1>
                            <div className="flex items-center gap-1.5 text-amber-100 text-sm">
                                <MapPin className="w-4 h-4" />
                                {floorLabel} — Motel Bethuli
                            </div>
                        </div>

                        {/* Status */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Statut</span>
                            <StatusBadge status={reservation.status} />
                        </div>

                        {/* Price breakdown */}
                        <div className="px-6 py-5 space-y-3 border-b border-slate-100">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Prix / nuit</span>
                                <span className="font-semibold text-slate-800">{Number(room?.price_per_day || 0).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Durée</span>
                                <span className="font-semibold text-slate-800">{nights} nuit{nights > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center justify-between font-black text-base pt-2 border-t border-slate-100">
                                <span className="text-slate-800">Total</span>
                                <span className="text-amber-500">{Number(reservation.total_price).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-5 space-y-3">
                            {reservation.status === ReservationStatus.PENDING && (
                                <a
                                    href={`https://wa.me/237600000000?text=${encodeURIComponent(`Bonjour, je vous contacte pour confirmer ma réservation (${reservation.id}) pour la chambre "${room?.name}" du ${formatDateShort(reservation.reservation_date)} au ${formatDateShort(reservation.end_date)}.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-sm transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.116 1.526 5.845L0 24l6.347-1.505A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.899 0-3.68-.497-5.23-1.37l-.375-.214-3.891.922.979-3.789-.234-.389A9.94 9.94 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                                    Confirmer via WhatsApp
                                </a>
                            )}
                            {canRate && (
                                <button
                                    onClick={() => setShowRatingModal(true)}
                                    className="flex items-center justify-center gap-2 w-full py-3 border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl font-bold text-sm transition-all"
                                >
                                    <Star className="w-4 h-4" />
                                    {existingRating ? 'Modifier mon avis' : 'Évaluer ce séjour'}
                                </button>
                            )}
                            <Link
                                to="/client/reservations"
                                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-slate-200 hover:border-amber-400 text-slate-600 hover:text-amber-600 rounded-xl font-semibold text-sm transition-all"
                            >
                                Toutes mes réservations
                            </Link>
                            <Link
                                to={`/client/rooms/${room?.id}`}
                                className="flex items-center justify-center gap-2 w-full py-2.5 text-slate-400 hover:text-amber-500 text-sm font-medium transition-colors"
                            >
                                <BedDouble className="w-4 h-4" />
                                Voir la chambre
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
