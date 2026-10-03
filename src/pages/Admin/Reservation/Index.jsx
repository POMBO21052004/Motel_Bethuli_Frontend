import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BedDouble, CalendarDays, Loader2, Plus, Search, CalendarCheck2, Eye, AlertTriangle, User as UserIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useAdminReservations } from '../../../hooks/useAdminReservations';
import { ReservationModel, ReservationStatus } from '../../../models/ReservationModel';
import { getImageUrl } from '../../../utils/getImageUrl';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
    surfaceVariant: '#fef3c7', secondary: '#b45309', error: '#ef4444',
};

const statuses = ['all', ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED];

const getStatusBadge = (status) => {
    switch (status) {
        case ReservationStatus.CONFIRMED:
            return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
        case ReservationStatus.CANCELLED:
            return 'bg-red-50 text-red-600 border border-red-100';
        case ReservationStatus.PENDING:
        default:
            return 'bg-amber-50 text-amber-600 border border-amber-100';
    }
};

const groupByRoom = (reservations) => {
    const map = {};
    reservations.forEach((res) => {
        const key = res.room?.id ?? 'unknown';
        if (!map[key]) {
            map[key] = { room: res.room, reservations: [] };
        }
        map[key].reservations.push(res);
    });

    Object.values(map).forEach((group) => {
        group.reservations.sort((a, b) => {
            const dateA = a.reservation_date + ' ' + a.start_time;
            const dateB = b.reservation_date + ' ' + b.start_time;
            return dateB.localeCompare(dateA);
        });
    });

    return Object.values(map).sort((a, b) => {
        const dateA = a.reservations[0]?.reservation_date + ' ' + a.reservations[0]?.start_time;
        const dateB = b.reservations[0]?.reservation_date + ' ' + b.reservations[0]?.start_time;
        return dateB.localeCompare(dateA);
    });
};

function RoomGroup({ group, navigate, updateStatus, statuses }) {
    const [expanded, setExpanded] = useState(true);
    const { room, reservations } = group;

    return (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${T.outlineVariant}50` }}>
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center gap-4 px-6 py-4 bg-slate-50 border-b hover:bg-slate-100 transition-colors"
                style={{ borderColor: `${T.outlineVariant}50` }}
            >
                <div className="flex items-center gap-4 flex-1 min-w-0 text-left">
                    {room?.primary_image?.image_path ? (
                        <img
                            src={getImageUrl(room.primary_image.image_path)}
                            alt={room?.name}
                            className="w-20 h-16 rounded-xl object-cover shadow-sm shrink-0"
                        />
                    ) : (
                        <div className="w-20 h-16 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                            <BedDouble className="w-6 h-6 text-slate-400" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <p className="font-black text-slate-900 text-base truncate">{room?.name ?? 'Chambre inconnue'}</p>
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider shrink-0">
                                {reservations.length} RÉS.
                            </span>
                        </div>
                        {room?.description_fr && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1 truncate" title={room.description_fr}>
                                {room.description_fr}
                            </p>
                        )}
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                            {room?.floor === 0 ? 'Rez-de-chaussée' : room?.floor !== undefined ? `${room.floor}${room.floor === 1 ? 'er' : 'ème'} Étage` : 'Étage inconnu'}
                        </p>
                    </div>
                </div>
                <div className="shrink-0 text-slate-400">
                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            {expanded && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Client</th>
                                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Début du séjour</th>
                                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Fin du séjour</th>
                                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Montant</th>
                                <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Statut</th>
                                <th className="px-6 py-3 text-right font-bold text-[10px] uppercase tracking-wider text-slate-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reservations.map((res) => {
                                const createdAt = res.created_at ? new Date(res.created_at) : new Date(res.reservation_date);
                                const isExpiredPending = res.status === 'pending' && (new Date() - createdAt > 2 * 24 * 60 * 60 * 1000);

                                return (
                                    <tr
                                        key={res.id}
                                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                                        onClick={() => navigate(`/admin/reservations/${res.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {res.client?.profil ? (
                                                    <img src={getImageUrl(res.client.profil)} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0 font-bold text-xs">
                                                        {res.client?.prenom?.[0]}{res.client?.nom?.[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-slate-900">{res.client?.prenom} {res.client?.nom}</p>
                                                    <p className="text-xs text-slate-400">{res.client?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800 text-xs">
                                                {new Date(res.reservation_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-amber-500 font-bold mt-0.5">{res.start_time?.slice(0, 5)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800 text-xs">
                                                {new Date(res.end_date || res.reservation_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-amber-500 font-bold mt-0.5">{res.end_time?.slice(0, 5)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-slate-900">{Number(res.total_price).toLocaleString('fr-FR')}</span>
                                            <span className="text-xs font-bold text-slate-400 ml-1">FCFA</span>
                                        </td>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex flex-col items-start gap-1.5">
                                                <select
                                                    value={res.status}
                                                    onChange={(e) => updateStatus(res.id, e.target.value)}
                                                    className={`rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider cursor-pointer outline-none transition-colors ${getStatusBadge(res.status)}`}
                                                >
                                                    {statuses.slice(1).map((s) => (
                                                        <option key={s} value={s}>{ReservationModel.getStatusLabel(s)}</option>
                                                    ))}
                                                </select>
                                                {isExpiredPending && (
                                                    <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        <span className="text-[9px] font-bold uppercase tracking-wider">&gt; 48h</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/admin/reservations/${res.id}`); }}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                                                title="Voir les détails"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default function ReservationIndex() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const params = { search, status, per_page: 200 };
    
    const { data, loading, error, updateStatus } = useAdminReservations(params);
    const reservations = data.pagination?.data || [];
    const groups = groupByRoom(reservations);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl text-white shadow-lg" style={{ backgroundColor: T.primary }}>
                            <CalendarCheck2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tight">Réservations</h1>
                            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                                Gestion des séjours • Groupées par chambre
                            </p>
                        </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-400 mt-2 bg-slate-100 inline-block px-3 py-1 rounded-full">
                        Vue par chambre, triée par date de réservation la plus récente en tête.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/reservations/create')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: T.onSurface }}
                >
                    <Plus className="w-4 h-4" strokeWidth={3} />
                    Nouvelle Réservation
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statuses.map((item) => (
                    <button
                        key={item}
                        onClick={() => setStatus(item)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                            status === item
                                ? 'bg-white shadow-md ring-2 ring-amber-500 border-transparent'
                                : 'bg-slate-50/50 hover:bg-white border-slate-200'
                        }`}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            {item === 'all' ? 'Toutes' : ReservationModel.getStatusLabel(item)}
                        </p>
                        <p className="text-2xl font-black text-slate-900">
                            {item === 'all'
                                ? (data.stats?.pending || 0) + (data.stats?.confirmed || 0) + (data.stats?.cancelled || 0)
                                : (data.stats?.[item] || 0)}
                        </p>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par client, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="py-2.5 px-4 text-sm font-bold bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none cursor-pointer"
                >
                    {statuses.map((item) => (
                        <option key={item} value={item}>
                            {item === 'all' ? 'Tous les statuts' : ReservationModel.getStatusLabel(item)}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    <span className="text-sm font-medium text-slate-500 italic">Chargement des réservations...</span>
                </div>
            ) : groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-2xl border shadow-sm" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <CalendarDays className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-sm font-bold text-slate-500">Aucune réservation trouvée.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {groups.map((group) => (
                        <RoomGroup
                            key={group.room?.id ?? 'unknown'}
                            group={group}
                            navigate={navigate}
                            updateStatus={updateStatus}
                            statuses={statuses}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
