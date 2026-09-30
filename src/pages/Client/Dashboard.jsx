import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Activity, BedDouble, CalendarDays, CalendarCheck2, Clock3,
    Star, ChevronRight, MessageCircle, AlertTriangle, CheckCircle2,
    Loader2, ArrowRight, Hotel
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import dashboardService from '../../services/client/dashboardService';
import { getImageUrl } from '../../utils/getImageUrl.jsx';
import { ReservationModel, ReservationStatus } from '../../models/ReservationModel';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
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
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="mt-4 text-xs font-black uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{value ?? 0}</p>
            {accent && <p className="mt-1 text-[10px] font-bold text-slate-400">{accent}</p>}
        </div>
    );
}

// ── Room Card (mini) ──────────────────────────────────────────────────────────
function RoomCard({ room, onBook }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all group flex flex-col">
            <div className="relative h-36 bg-slate-100 overflow-hidden shrink-0">
                {room.primary_image?.image_path ? (
                    <img
                        src={getImageUrl(room.primary_image.image_path)}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BedDouble className="w-10 h-10 text-slate-300" />
                    </div>
                )}
                {room.is_occupied_now ? (
                    <div className="absolute top-2 left-2 bg-red-500/90 backdrop-blur text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Occupée
                    </div>
                ) : (
                    <div className="absolute top-2 left-2 bg-emerald-500/90 backdrop-blur text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        Disponible
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-1">
                <p className="font-black text-slate-900 truncate">{room.name}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2 flex-1 mt-0.5">{room.description_fr}</p>
                <div className="flex items-center justify-between mt-3">
                    <div>
                        <span className="text-sm font-black text-slate-800">{Number(room.price_per_day).toLocaleString('fr-FR')}</span>
                        <span className="text-[10px] text-slate-400 ml-1 font-bold">FCFA/nuit</span>
                    </div>
                    <button
                        onClick={() => onBook(room)}
                        disabled={room.is_occupied_now}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-amber-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Réserver
                    </button>
                </div>
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
    const dateStr = currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-6" style={{ color: T.onSurface }}>

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                <div className="absolute -right-10 -top-10 opacity-5">
                    <Hotel size={240} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20"
                    style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl border" style={{ background: `${T.primary}25`, borderColor: `${T.primary}40` }}>
                                <Hotel className="w-6 h-6" style={{ color: T.primary }} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.primary }}>
                                    Motel Bethuli • Espace Client
                                </p>
                                <p className="text-xs text-slate-400">{dateStr} — {timeStr}</p>
                            </div>
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tight">
                            {getGreeting()}, {clientUser?.prenom || 'Client'} !
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 max-w-lg">
                            Bienvenue dans votre espace personnel. Gérez vos séjours et découvrez nos chambres.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm ${cniVerified ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
                            {cniVerified
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                            <span className={`text-xs font-bold ${cniVerified ? 'text-emerald-300' : 'text-amber-300'}`}>
                                {cniVerified ? 'Identité vérifiée' : 'Non vérifié'}
                            </span>
                        </div>
                        <Link
                            to="/client/rooms"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
                            style={{ background: T.primary, color: '#fff' }}
                        >
                            <BedDouble className="w-4 h-4" /> Voir les chambres
                        </Link>
                    </div>
                </div>
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

            {/* ── PROCHAIN SÉJOUR ───────────────────────────────────────────── */}
            {next_reservation ? (
                <div>
                    <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                        <CalendarCheck2 className="w-5 h-5 text-amber-500" /> Prochain séjour
                    </h2>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                        <div className="md:w-56 h-44 md:h-auto bg-slate-100 shrink-0 relative overflow-hidden">
                            {next_reservation.room?.primary_image?.image_path ? (
                                <img src={getImageUrl(next_reservation.room.primary_image.image_path)} alt={next_reservation.room?.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <BedDouble className="w-12 h-12 text-slate-300" />
                                </div>
                            )}
                            <div className="absolute bottom-3 left-3">
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-md ${ReservationModel.getStatusColor(next_reservation.status?.value ?? next_reservation.status)}`}>
                                    {ReservationModel.getStatusLabel(next_reservation.status?.value ?? next_reservation.status)}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col justify-between flex-1">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Chambre</p>
                                <h3 className="text-xl font-black text-slate-900">{next_reservation.room?.name}</h3>
                                {next_reservation.room?.description_fr && (
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{next_reservation.room.description_fr}</p>
                                )}
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Arrivée</p>
                                    <p className="font-black text-slate-900">{new Date(next_reservation.reservation_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</p>
                                    <p className="text-xs font-bold text-amber-500">{next_reservation.start_time?.slice(0, 5)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Départ</p>
                                    <p className="font-black text-slate-900">{new Date(next_reservation.end_date || next_reservation.reservation_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</p>
                                    <p className="text-xs font-bold text-amber-500">{next_reservation.end_time?.slice(0, 5)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Montant</p>
                                    <p className="font-black text-slate-900">{Number(next_reservation.total_price).toLocaleString('fr-FR')} <span className="text-[10px] text-slate-400">FCFA</span></p>
                                </div>
                                <div className="flex items-end">
                                    {(next_reservation.status?.value ?? next_reservation.status) === ReservationStatus.PENDING && (
                                        <button
                                            onClick={() => {
                                                const text = encodeURIComponent(`Bonjour, je souhaite confirmer ma réservation pour la chambre "${next_reservation.room?.name}".`);
                                                window.open(`https://wa.me/237600000000?text=${text}`, '_blank');
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366]/10 text-[#25D366] font-bold text-xs hover:bg-[#25D366]/20 transition-colors"
                                        >
                                            <MessageCircle className="w-4 h-4" /> WhatsApp
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                    <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="font-black text-slate-400">Aucun séjour à venir</p>
                    <Link to="/client/reservations/create" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors">
                        Faire une réservation <ArrowRight className="w-4 h-4" />
                    </Link>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(available_rooms || []).map(room => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            onBook={(r) => navigate(`/client/reservations/create?room_id=${r.id}`)}
                        />
                    ))}
                </div>
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
                                    <p className="text-[11px] text-slate-500">{new Date(res.reservation_date).toLocaleDateString('fr-FR')} · {res.start_time?.slice(0, 5)}</p>
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
