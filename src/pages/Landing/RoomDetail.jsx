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

// ── Numéro WhatsApp du Motel (à changer dans .env si besoin) ──
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '242000000000';

const RoomDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

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
        : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'];

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

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`;

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
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
                        <div className="relative aspect-video overflow-hidden">
                            <img
                                src={images[activeImage]}
                                alt={room.name}
                                className="w-full h-full object-cover transition-all duration-500"
                            />
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
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                            {[
                                'Wi-Fi gratuit',
                                'Climatisation',
                                'Eau chaude',
                                'Linge de lit propre',
                                'Sécurité 24h/24',
                                'Parking sécurisé',
                            ].map(item => (
                                <li key={item} className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
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
                                <>
                                    {/* WhatsApp Button */}
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 hover:-translate-y-0.5 transition-all"
                                    >
                                        {/* WhatsApp SVG icon */}
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                        Réserver via WhatsApp
                                    </a>
                                    <p className="text-xs text-center text-slate-400">
                                        Notre équipe vous répondra dans les plus brefs délais.
                                    </p>
                                </>
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
