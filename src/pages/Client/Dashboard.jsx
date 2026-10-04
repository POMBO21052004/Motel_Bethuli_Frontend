import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Activity, BedDouble, CalendarDays, CalendarCheck2, Clock3,
    Star, ChevronRight, MessageCircle, AlertTriangle, CheckCircle2,
    Loader2, ArrowRight, Hotel, Users, MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import dashboardService from '../../services/client/dashboardService';
import { getImageUrl } from '../../utils/getImageUrl.jsx';
import { ReservationModel, ReservationStatus } from '../../models/ReservationModel';
import slide1 from '../../assets/slides/slide1.png';
import slide2 from '../../assets/slides/slide2.png';
import slide3 from '../../assets/slides/slide3.png';
import slide4 from '../../assets/slides/slide4.png';
import slide5 from '../../assets/slides/slide5.png';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
};

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'amber', accent }) {
    const colors = {
        amber:   'bg-amber-50 text-amber-600 border-amber-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        indigo:  'bg-indigo-50 text-indigo-600 border-indigo-100',
        rose:    'bg-rose-50 text-rose-600 border-rose-100',
    };
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black text-slate-900">{value ?? 0}</p>
                    {accent && <p className="text-[10px] font-bold text-slate-400 hidden sm:block">{accent}</p>}
                </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
    );
}

// ── Room Card (style public) ───────────────────────────────────────────────────
function RoomCard({ room }) {
    const imageUrl = room.primary_image?.image_path
        ? getImageUrl(room.primary_image.image_path)
        : null;

    return (
        <Link
            to={`/client/rooms/${room.id}`}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
        >
            {/* Image */}
            <div className="relative h-44 shrink-0 overflow-hidden bg-slate-100">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={room.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BedDouble className="w-10 h-10 text-slate-300" />
                    </div>
                )}

                {/* Étage badge */}
                <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md bg-white/90 text-amber-600">
                        {room.floor === 0 ? 'RDC' : `Étage ${room.floor}`}
                    </span>
                </div>

                {/* Prix */}
                <div className="absolute top-2 right-2">
                    <div className="flex items-baseline gap-0.5 bg-amber-500 text-white px-2.5 py-1 rounded-t-lg rounded-br-lg rounded-bl-sm shadow-sm">
                        <span className="text-[13px] font-black">{Number(room.price_per_day).toLocaleString('fr-FR')}</span>
                        <span className="text-[9px] font-bold opacity-80">FCFA</span>
                    </div>
                </div>

                {/* Status */}
                <div className="absolute bottom-3 left-3">
                    {room.is_occupied_now ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/90 text-white backdrop-blur-md shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Occupée
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" /> Disponible
                        </span>
                    )}
                </div>

                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <h4 className="text-base font-bold text-slate-900 leading-tight line-clamp-1 group-hover:text-amber-500 transition-colors mb-1">
                    {room.name}
                </h4>
                <p className="text-amber-500 text-xs font-bold flex items-center gap-0.5 mb-2">
                    <MapPin className="w-3.5 h-3.5" /> Motel Bethuli
                </p>
                <p className="text-slate-500 text-[12px] leading-relaxed line-clamp-2 flex-1">
                    {room.description_fr || 'Une chambre confortable au Motel Bethuli.'}
                </p>
                <div className="mt-3 pt-3 flex justify-between items-center border-t border-slate-50">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        <Users className="w-3 h-3" /> {room.capacity} Pers.
                    </span>
                    <span className="text-xs font-black text-amber-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Réserver <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>
            </div>
        </Link>
    );
}

// ── Reservation Card (prochain séjour) ────────────────────────────────────────
function NextStayCard({ reservation }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-w-0">
            {/* Image */}
            <div className="h-32 bg-slate-100 relative shrink-0 overflow-hidden">
                {reservation.room?.primary_image?.image_path ? (
                    <img src={getImageUrl(reservation.room.primary_image.image_path)} alt={reservation.room?.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BedDouble className="w-10 h-10 text-slate-300" />
                    </div>
                )}
                <div className="absolute bottom-2 left-2">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-md ${ReservationModel.getStatusColor(reservation.status?.value ?? reservation.status)}`}>
                        {ReservationModel.getStatusLabel(reservation.status?.value ?? reservation.status)}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Chambre</p>
                    <p className="font-black text-slate-900 truncate">{reservation.room?.name}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Arrivée</p>
                        <p className="font-black text-slate-800">{new Date(reservation.reservation_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</p>
                        <p className="font-bold text-amber-500 text-[10px]">12:00</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Départ</p>
                        <p className="font-black text-slate-800">{new Date(reservation.end_date || reservation.reservation_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</p>
                        <p className="font-bold text-amber-500 text-[10px]">12:00</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Montant</p>
                        <p className="font-black text-slate-800 text-[11px]">{Number(reservation.total_price).toLocaleString('fr-FR')}</p>
                        <p className="font-bold text-slate-400 text-[10px]">FCFA</p>
                    </div>
                </div>
                {(reservation.status?.value ?? reservation.status) === ReservationStatus.PENDING && (
                    <button
                        onClick={() => {
                            const text = encodeURIComponent(`Bonjour, je souhaite confirmer ma réservation pour la chambre "${reservation.room?.name}".`);
                            window.open(`https://wa.me/237600000000?text=${text}`, '_blank');
                        }}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#25D366]/10 text-[#25D366] font-bold text-xs hover:bg-[#25D366]/20 transition-colors mt-auto"
                    >
                        <MessageCircle className="w-3.5 h-3.5" /> Confirmer via WhatsApp
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function ClientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData]               = useState(null);
    const [loading, setLoading]         = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        dashboardService.get()
            .then(r => setData(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
        const t = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    // -- Slides Carousel --
    const [currentSlide, setCurrentSlide] = useState(0);
    
    // We construct heroSlides array inside render, so length is always constant (6)
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % 6);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    const { stats, next_reservation, recent_reservations, available_rooms, available_rooms_count } = data || {};
    const clientUser  = data?.user;
    const cniVerified = clientUser?.customer_profile?.cni_verified;

    const timeStr = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Upcoming reservations: next_reservation + recent ones that are upcoming
    const upcomingReservations = next_reservation ? [next_reservation] : [];

    const prenom = clientUser?.prenom || 'Client';
    
    const heroSlides = [
        {
            title: `Bienvenue, ${prenom} !`,
            subtitle: "Heureux de vous revoir dans votre espace personnel.",
            image: slide1
        },
        {
            title: "Votre confort, notre priorité",
            subtitle: "Réservez facilement et suivez l'historique de vos séjours en temps réel.",
            image: slide2
        },
        {
            title: `${prenom}, prêt pour un nouveau séjour ?`,
            subtitle: "Découvrez nos nouvelles chambres et suites élégantes, équipées pour votre repos.",
            image: slide3
        },
        {
            title: "Gérez vos réservations en un clic",
            subtitle: "Validation, suivi et détails de votre séjour à portée de main.",
            image: slide4
        },
        {
            title: `Merci de votre confiance, ${prenom}`,
            subtitle: "Profitez de l'excellence de nos services depuis cet espace dédié.",
            image: slide5
        },
        {
            title: "Un service 5 étoiles au Motel Bethuli",
            subtitle: "Notre équipe dévouée est là pour vous garantir un séjour inoubliable.",
            image: slide3
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-6" style={{ color: T.onSurface }}>

            {/* ── HERO CAROUSEL ──────────────────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl min-h-[350px] shadow-2xl flex flex-col justify-between">
                {/* Background Slides */}
                {heroSlides.map((slide, idx) => (
                    <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
                    >
                        <img src={slide.image} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30" />
                    </div>
                ))}

                {/* Top Overlay: Identity, Date, Badge */}
                <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl border bg-amber-500/25 border-amber-500/40 backdrop-blur-sm">
                            <Hotel className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                                Motel Bethuli • Espace Client
                            </p>
                            <p className="text-xs text-slate-300 font-medium">Nous sommes le {dateStr} et il est {timeStr}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md ${cniVerified ? 'border-emerald-500/50 bg-emerald-500/20' : 'border-amber-500/50 bg-amber-500/20'}`}>
                            {cniVerified
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                            <span className={`text-xs font-bold ${cniVerified ? 'text-emerald-300' : 'text-amber-300'}`}>
                                {cniVerified ? 'Identité vérifiée' : 'Non vérifié'}
                            </span>
                        </div>
                        <Link
                            to="/client/rooms"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg bg-amber-500 text-white hover:bg-amber-600"
                        >
                            <BedDouble className="w-4 h-4" /> Voir les chambres
                        </Link>
                    </div>
                </div>

                {/* Bottom Overlay: Animated Text */}
                <div className="relative z-10 p-6 sm:p-8 mt-auto">
                    <div className="max-w-2xl min-h-[100px]">
                        <h1 
                            key={`title-${currentSlide}`}
                            className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold tracking-tight text-white mb-2"
                            style={{ animation: 'fadeSlideUp 0.8s ease-out' }}
                        >
                            {heroSlides[currentSlide].title}
                        </h1>
                        <p 
                            key={`sub-${currentSlide}`}
                            className="text-slate-300 text-sm sm:text-base font-medium"
                            style={{ animation: 'fadeSlideUp 1s ease-out 0.2s both' }}
                        >
                            {heroSlides[currentSlide].subtitle}
                        </p>
                    </div>
                    {/* Dots indicator */}
                    <div className="flex gap-2 mt-6">
                        {heroSlides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-amber-500 w-6' : 'bg-white/30 hover:bg-white/60 w-1.5'}`}
                            />
                        ))}
                    </div>
                </div>

                <style>{`
                    @keyframes fadeSlideUp {
                        from { opacity: 0; transform: translateY(15px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>

            {/* ── ALERTE CNI ────────────────────────────────────────────────── */}
            {!cniVerified && (
                <div className="flex items-start gap-4 p-5 rounded-2xl border border-amber-200 bg-amber-50">
                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-black text-amber-800 text-sm">Votre identité n'est pas encore vérifiée</p>
                        <p className="text-amber-700 text-xs mt-1">Pour effectuer une réservation, vous devez compléter et soumettre vos informations CNI.</p>
                    </div>
                    <Link to="/client/profile" className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-black hover:bg-amber-600 transition-colors">
                        Compléter →
                    </Link>
                </div>
            )}

            {/* ── STATS ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={CalendarDays}  label="Réservations"  value={stats?.total}         color="amber"   accent="Toutes périodes" />
                <StatCard icon={Clock3}         label="En attente"    value={stats?.pending}        color="rose"    accent="À confirmer" />
                <StatCard icon={CheckCircle2}   label="Confirmées"   value={stats?.confirmed}      color="emerald" accent="Séjours validés" />
                <StatCard icon={Star}           label="Avis déposés" value={stats?.ratings_count}  color="indigo"  accent="Notes laissées" />
            </div>

            {/* ── PROCHAIN SÉJOUR — seulement si existe, scroll horizontal si 3+ ── */}
            {upcomingReservations.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <CalendarCheck2 className="w-5 h-5 text-amber-500" /> Prochain séjour
                        </h2>
                        <Link to="/client/reservations" className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                            Tout voir <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="flex overflow-x-auto snap-x gap-4 pb-2" style={{ scrollbarWidth: 'none' }}>
                        {upcomingReservations.map(r => (
                            <div key={r.id} className="w-full md:w-[calc(50%-0.5rem)] shrink-0 snap-start">
                                <NextStayCard reservation={r} />
                            </div>
                        ))}
                        {upcomingReservations.length === 1 && (
                            <div className="hidden md:flex w-[calc(50%-0.5rem)] shrink-0 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50 items-center justify-center transition-colors group cursor-pointer"
                                 onClick={() => navigate('/client/rooms')}
                            >
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <BedDouble className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <p className="font-bold text-slate-700 text-sm">Ajouter un séjour</p>
                                    <p className="text-xs text-slate-400 mt-1">Découvrez nos chambres</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── CHAMBRES DISPONIBLES ──────────────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <BedDouble className="w-5 h-5 text-amber-500" />
                        Nos chambres
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black">{available_rooms_count} disponibles</span>
                    </h2>
                    <Link to="/client/rooms" className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                        Tout voir <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
                {/* 4 par ligne sur PC, max 4 affichées */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(available_rooms || []).slice(0, 4).map(room => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </div>
                {available_rooms?.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <BedDouble className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="font-black text-slate-400 text-sm">Aucune chambre disponible pour le moment</p>
                    </div>
                )}
            </div>

            {/* ── ACTIVITÉ RÉCENTE ──────────────────────────────────────────── */}
            {recent_reservations?.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-amber-500" /> Activité récente
                        </h2>
                        <Link to="/client/reservations" className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                            Tout voir <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                        {recent_reservations.map(res => (
                            <div key={res.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                                <div className="w-12 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                    {res.room?.primary_image?.image_path
                                        ? <img src={getImageUrl(res.room.primary_image.image_path)} alt={res.room.name} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center"><BedDouble className="w-4 h-4 text-slate-300" /></div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{res.room?.name}</p>
                                    <p className="text-[11px] text-slate-500">{new Date(res.reservation_date).toLocaleDateString('fr-FR')} → {new Date(res.end_date || res.reservation_date).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <span className={`shrink-0 text-[10px] font-black px-2 py-1 rounded-full ${ReservationModel.getStatusColor(res.status?.value ?? res.status)}`}>
                                    {ReservationModel.getStatusLabel(res.status?.value ?? res.status)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
