import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Users, BedDouble, MapPin, CalendarDays,
    ChevronLeft, ChevronRight, Loader2, MessageCircle,
    Star, CheckCircle, AlertTriangle
} from 'lucide-react';
import roomService from '../../services/roomService';
import { RoomModel } from '../../models/RoomModel';
import { getImageUrl } from '../../utils/getImageUrl';
import { useAuth } from '../../contexts/AuthContext';

const RoomDetail = () => {
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
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [availMsg, setAvailMsg] = useState(null);

    // Debounced availability check (public, no auth needed)
    useEffect(() => {
        if (!form.reservation_date || !form.end_date) { setAvailMsg(null); return; }
        if (form.end_date < form.reservation_date) { setAvailMsg(null); return; }

        setAvailMsg({ type: 'checking', text: 'Vérification en cours...' });
        let cancelled = false;

        const timer = setTimeout(async () => {
            try {
                const res = await roomService.publicCheckAvailability({
                    room_id: id,
                    reservation_date: form.reservation_date,
                    end_date: form.end_date,
                });
                if (cancelled) return;
                const data = res.data;
                if (data.available) {
                    setAvailMsg({ type: 'success', text: data.message, price: data.price, days: data.days });
                } else {
                    const dateInfo = data.from ? ` (du ${new Date(data.from).toLocaleDateString('fr-FR')} au ${new Date(data.until).toLocaleDateString('fr-FR')})` : '';
                    setAvailMsg({ type: 'error', text: data.message + dateInfo });
                }
            } catch {
                if (!cancelled) setAvailMsg(null);
            }
        }, 500);

        return () => { cancelled = true; clearTimeout(timer); };
    }, [id, form.reservation_date, form.end_date]);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await roomService.publicShow(id);
                setRoom(response.data.data);
            } catch (err) {
                console.error(err);
                navigate('/rooms');
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
                <p className="text-sm font-medium text-slate-400">Chargement de la chambre...</p>
            </div>
        );
    }

    if (!room) return null;

    // ── Images ──
    const images = room.images && room.images.length > 0
        ? room.images.map(img => getImageUrl(img.image_path))
        : [];

    const floorLabel = Number(room.floor) === 0 ? 'Rez-de-chaussée' : `Étage ${room.floor}`;

    // ── WhatsApp message ──
    const buildWhatsAppMessage = () => {
        const msg = [
            `Bonjour Motel Bethuli 👋`,
            ``,
            `Je suis intéressé(e) par la chambre suivante :`,
            `📌 *${room.name}*`,
            `🏨 ${floorLabel}`,
            `👥 Capacité : ${room.capacity} personne${room.capacity > 1 ? 's' : ''}`,
            `💰 Prix : ${Number(room.price_per_day).toLocaleString('fr-FR')} FCFA / nuit`,
            ``,
            `Pourriez-vous me donner plus d'informations sur les disponibilités ?`,
            `Merci !`
        ].join('\n');
        return encodeURIComponent(msg);
    };

    const WHATSAPP_NUMBER = '237600000000'; // Define a fallback or use an env variable
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`;

    const handleBook = (e) => {
        e.preventDefault();
        if (!user) {
            setShowLoginPrompt(true);
        } else {
            // Already logged in, redirect to the client's room show page where they can actually book
            navigate(`/client/rooms/${room.id}`);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
                        <Users className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-900 mb-2">Connexion requise</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Vous devez être connecté à un compte client pour pouvoir réserver une chambre.
                        </p>
                        <div className="space-y-3">
                            <button onClick={() => navigate('/login')} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors">
                                Se connecter
                            </button>
                            <button onClick={() => navigate('/register')} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                                Créer un compte
                            </button>
                            <button onClick={() => setShowLoginPrompt(false)} className="w-full py-3 text-slate-400 hover:text-slate-600 font-medium text-sm transition-colors mt-2">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-amber-600 transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Retour aux chambres
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* ── Left : Gallery + Description ── */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Gallery */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                        {/* Main image */}
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
                                    {/* Dots */}
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
                </div>

                {/* ── Right : Info card ── */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Sticky card */}
                    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden sticky top-6">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white">
                            <h1 className="text-2xl font-black mb-1 leading-tight">{room.name}</h1>
                            <div className="flex items-center gap-1.5 text-amber-100 text-sm">
                                <MapPin className="w-4 h-4" />
                                {floorLabel} — Motel Bethuli
                            </div>
                        </div>

                        {/* Price */}
                        <div className="px-6 py-5 border-b border-slate-100">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-slate-900">
                                    {Number(room.price_per_day).toLocaleString('fr-FR')}
                                </span>
                                <span className="text-slate-400 text-sm font-medium">FCFA / nuit</span>
                            </div>
                            {room.price_per_hour && (
                                <p className="text-xs text-slate-400 mt-1">
                                    Ou {Number(room.price_per_hour).toLocaleString('fr-FR')} FCFA / heure
                                </p>
                            )}
                        </div>

                        {/* Details */}
                        <div className="px-6 py-5 space-y-3 border-b border-slate-100">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2">
                                    <BedDouble className="w-4 h-4 text-amber-400" />
                                    Type
                                </span>
                                <span className="font-semibold text-slate-800">Chambre standard</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-amber-400" />
                                    Capacité
                                </span>
                                <span className="font-semibold text-slate-800">
                                    {room.capacity} personne{room.capacity > 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-amber-400" />
                                    Étage
                                </span>
                                <span className="font-semibold text-slate-800">{floorLabel}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-amber-400" />
                                    Disponibilité
                                </span>
                                <span className={`font-semibold ${room.status === 'available' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {RoomModel.getStatusLabel(room.status)}
                                </span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="px-6 py-5 space-y-3">
                            {room.status === 'available' ? (
                                <form onSubmit={handleBook} className="space-y-3">
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
                                        disabled={availMsg?.type === 'error' || availMsg?.type === 'checking'}
                                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-sm shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                                    >
                                        <BedDouble className="w-5 h-5" /> Vérifier &amp; Réserver
                                    </button>
                                </form>
                            ) : (
                                <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    Cette chambre n'est pas disponible actuellement.
                                </div>
                            )}

                            <Link
                                to="/rooms"
                                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-slate-200 hover:border-amber-400 text-slate-600 hover:text-amber-600 rounded-xl font-semibold text-sm transition-all"
                            >
                                Voir d'autres chambres
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetail;
