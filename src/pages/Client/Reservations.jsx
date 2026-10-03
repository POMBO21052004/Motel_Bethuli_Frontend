import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    CalendarDays, Loader2, AlertCircle, BedDouble,
    ChevronRight, Clock, MapPin, Users, Star, MessageSquare
} from 'lucide-react';
import { useClientReservations } from '../../hooks/useClientReservations';
import { ReservationModel, ReservationStatus } from '../../models/ReservationModel';
import { getImageUrl } from '../../utils/getImageUrl';

const TABS = [
    { key: 'all',       label: 'Toutes' },
    { key: 'pending',   label: 'En attente' },
    { key: 'confirmed', label: 'Confirmées' },
    { key: 'cancelled', label: 'Annulées' },
];

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function StatusBadge({ status }) {
    const colors = {
        pending:   'bg-amber-100 text-amber-700 border-amber-200',
        confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${colors[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            {ReservationModel.getStatusLabel(status)}
        </span>
    );
}

export default function ClientReservations() {
    const [activeTab, setActiveTab] = useState('all');
    const { reservations, loading, error, fetchReservations } = useClientReservations(activeTab);

    const canRate = (item) => item.status === ReservationStatus.CONFIRMED;

    return (
        <div className="space-y-8 pb-12 animate-in fade-in">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-extrabold text-slate-800">Mes réservations</h1>
                    <div className="w-16 h-1 bg-amber-500 rounded-full mt-2" />
                    <p className="text-base text-slate-500 mt-3">Consultez et suivez l'état de tous vos séjours.</p>
                </div>
                <Link
                    to="/client/reservations/create"
                    className="shrink-0 inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
                >
                    <BedDouble className="w-4 h-4" /> Nouvelle réservation
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            activeTab === tab.key
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700 font-medium text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-24">
                    <Loader2 className="h-9 w-9 animate-spin text-amber-500" />
                </div>
            ) : reservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-5">
                        <CalendarDays className="w-9 h-9 text-amber-400" />
                    </div>
                    <p className="text-lg font-bold text-slate-700 mb-1">Aucune réservation</p>
                    <p className="text-sm text-slate-500 mb-6">
                        {activeTab === 'all' ? 'Vos séjours apparaîtront ici une fois réservés.' : `Aucune réservation "${TABS.find(t => t.key === activeTab)?.label}".`}
                    </p>
                    <Link to="/client/rooms" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-sm transition-colors">
                        Découvrir les chambres
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {reservations.map((item) => {
                        const imageUrl = item.room?.primary_image?.image_path
                            ? getImageUrl(item.room.primary_image.image_path)
                            : null;
                        const floorLabel = item.room?.floor === 0 ? 'RDC' : `Étage ${item.room?.floor}`;
                        const nights = item.reservation_date && item.end_date
                            ? Math.max(1, Math.round((new Date(item.end_date) - new Date(item.reservation_date)) / 86400000))
                            : 1;

                        return (
                            <Link
                                key={item.id}
                                to={`/client/reservations/${item.id}`}
                                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200 flex flex-col sm:flex-row overflow-hidden"
                            >
                                {/* Image */}
                                <div className="sm:w-44 h-36 sm:h-auto shrink-0 bg-slate-100 relative overflow-hidden">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={item.room?.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BedDouble className="w-10 h-10 text-slate-200" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent sm:from-transparent sm:to-black/5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <StatusBadge status={item.status} />
                                            {item.rating && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-bold border border-amber-100">
                                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                    {item.rating.rating}/5
                                                </span>
                                            )}
                                            {canRate(item) && !item.rating && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 text-[11px] font-medium border border-slate-100">
                                                    <MessageSquare className="w-3 h-3" /> Avis à laisser
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-base leading-snug truncate group-hover:text-amber-600 transition-colors">
                                            {item.room?.name || 'Chambre'}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <MapPin className="w-3 h-3 text-amber-400" />
                                                {floorLabel}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <Users className="w-3 h-3 text-amber-400" />
                                                {item.room?.capacity} pers.
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <Clock className="w-3 h-3 text-amber-400" />
                                                {nights} nuit{nights > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                            <CalendarDays className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                            <span>
                                                {formatDate(item.reservation_date)}
                                                <span className="mx-1 text-slate-300">→</span>
                                                {formatDate(item.end_date)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0">
                                        <div className="text-right">
                                            <p className="text-xl font-black text-slate-900">
                                                {Number(item.total_price).toLocaleString('fr-FR')}
                                                <span className="text-xs font-medium text-slate-400 ml-0.5">FCFA</span>
                                            </p>
                                            <p className="text-[11px] text-slate-400">{nights} nuit{nights > 1 ? 's' : ''} × {Number(item.room?.price_per_day || 0).toLocaleString('fr-FR')}</p>
                                        </div>
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 group-hover:bg-amber-500 transition-colors">
                                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
