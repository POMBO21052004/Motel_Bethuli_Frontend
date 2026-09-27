import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Loader2, Plus, Search, CalendarCheck2, ArrowRight, Eye, MoreVertical, AlertTriangle } from 'lucide-react';
import { useAdminReservations } from '../../../hooks/useAdminReservations';
import { ReservationModel, ReservationStatus } from '../../../models/ReservationModel';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
    surfaceVariant: '#fef3c7', secondary: '#b45309', error: '#ef4444',
};

const statuses = ['all', ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.COMPLETED, ReservationStatus.CANCELLED];

export default function ReservationIndex() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const params = { search, status };
    
    const { data, loading, error, updateStatus } = useAdminReservations(params);

    const getStatusStyle = (statusValue) => {
        switch(statusValue) {
            case ReservationStatus.CONFIRMED: return 'bg-blue-100 text-blue-700 border-blue-200';
            case ReservationStatus.COMPLETED: return 'bg-green-100 text-green-700 border-green-200';
            case ReservationStatus.CANCELLED: return 'bg-red-100 text-red-700 border-red-200';
            case ReservationStatus.PENDING: default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20" style={{ color: T.onSurface }}>
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                {/* Background decoration */}
                <div className="absolute -right-10 -top-10 opacity-5">
                    <CalendarCheck2 size={240} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 rounded-xl border backdrop-blur-md" style={{ background: `${T.primary}30`, borderColor: `${T.primary}50` }}>
                                <CalendarDays className="w-7 h-7" style={{ color: '#f59e0b' }} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tight">Réservations</h1>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#f59e0b' }}>
                                    Gestion des séjours
                                </p>
                            </div>
                        </div>
                        <p className="text-sm font-medium opacity-80 max-w-md leading-relaxed mt-4">
                            Gérez les séjours de vos clients. Suivez les arrivées, mettez à jour les statuts et ajoutez de nouvelles réservations facilement.
                        </p>
                    </div>

                    <button 
                        onClick={() => navigate('/admin/reservations/create')}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all w-full md:w-auto justify-center"
                        style={{ background: T.primary, color: 'white' }}
                    >
                        <Plus className="w-5 h-5" />
                        Nouvelle Réservation
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-red-700 text-sm font-bold border border-red-200">
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statuses.slice(1).map((item) => (
                    <div key={item} className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
                            <CalendarCheck2 className="w-12 h-12" style={{ color: T.primary }} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: T.outline }}>
                            {ReservationModel.getStatusLabel(item)}
                        </p>
                        <p className="text-3xl font-black" style={{ color: T.onSurface }}>
                            {data.stats?.[item] || 0}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-2xl border shadow-sm" style={{ borderColor: `${T.outlineVariant}50` }}>
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        placeholder="Rechercher par client ou chambre..." 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                    />
                </div>
                <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="md:w-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer"
                >
                    {statuses.map((item) => (
                        <option key={item} value={item}>
                            {item === 'all' ? 'Tous les statuts' : ReservationModel.getStatusLabel(item)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    <span className="text-sm font-medium text-slate-500 italic">Chargement des réservations...</span>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Client & Chambre</th>
                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Période</th>
                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Montant</th>
                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Statut Rapide</th>
                                    <th className="px-6 py-4 text-right font-bold text-xs uppercase tracking-wider text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(data.pagination?.data || []).map((item) => {
                                    // Check if reservation is pending and older than 48 hours
                                    const createdAt = item.created_at ? new Date(item.created_at) : new Date(item.reservation_date);
                                    const isExpiredPending = item.status === 'pending' && (new Date() - createdAt > 2 * 24 * 60 * 60 * 1000);

                                    return (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-amber-600 font-bold text-xs shrink-0">
                                                    {item.client?.prenom?.[0]}{item.client?.nom?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{item.client?.prenom} {item.client?.nom}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{item.room?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-700">{new Date(item.reservation_date).toLocaleDateString('fr-FR')}</p>
                                            <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                                {item.start_time.slice(0,5)} à {item.end_time.slice(0,5)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-slate-900">{Number(item.total_price).toLocaleString('fr-FR')}</span>
                                            <span className="text-xs font-bold text-slate-400 ml-1">FCFA</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-2">
                                                <select 
                                                    value={item.status} 
                                                    onChange={(event) => updateStatus(item.id, event.target.value)} 
                                                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold cursor-pointer outline-none transition-colors ${getStatusStyle(item.status)}`}
                                                >
                                                    {statuses.slice(1).map((value) => (
                                                        <option key={value} value={value}>{ReservationModel.getStatusLabel(value)}</option>
                                                    ))}
                                                </select>
                                                {isExpiredPending && (
                                                    <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100" title="Non confirmée depuis plus de 48h">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">Alerte &gt; 48h</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => navigate(`/admin/reservations/${item.id}`)}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                                                title="Voir les détails"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })}
                                {!data.pagination?.data?.length && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <CalendarDays className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                            <p className="text-sm font-bold text-slate-500">Aucune réservation trouvée.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
