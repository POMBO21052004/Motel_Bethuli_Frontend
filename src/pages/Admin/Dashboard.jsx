import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Activity, BedDouble, CalendarDays, Loader2, Star, Users, 
    TrendingUp, TrendingDown, ArrowRight, DollarSign, Hotel, AlertTriangle, ChevronRight, User as UserIcon
} from 'lucide-react';
import adminService from '../../services/adminService';
import { getGreeting } from '../../utils/dateHelpers';
import { useAuth } from '../../contexts/AuthContext';
import { getImageUrl } from '../../utils/getImageUrl';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
    surfaceVariant: '#fef3c7', secondary: '#b45309', error: '#ef4444',
};

// Colors for the pie chart
const PIE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f97316'];

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        adminService.dashboard()
            .then((response) => setData(response.data))
            .catch(() => setError('Impossible de charger le tableau de bord.'))
            .finally(() => setLoading(false));
            
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
    if (error) return <div className="rounded-xl bg-red-50 p-4 text-red-700 font-bold">{error}</div>;

    const { rooms, reservations, revenue, clients, ratings, recent_reservations, weekly_activity, top_rooms } = data || {};

    const maxActivity = Math.max(...(weekly_activity?.map(d => d.total) || [1]));

    const renderGrowthBadge = (value) => {
        const isPositive = value >= 0;
        return (
            <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{value}%
            </div>
        );
    };

    // Calculate total for pie chart
    const totalTopReservations = top_rooms?.reduce((acc, room) => acc + room.reservations_count, 0) || 1;
    let currentAngle = 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20" style={{ color: T.onSurface }}>
            
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                <div className="absolute -right-10 -top-10 opacity-5">
                    <Activity size={240} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl border backdrop-blur-md" style={{ background: `${T.primary}30`, borderColor: `${T.primary}50` }}>
                            <Hotel className="w-7 h-7" style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tight">Tableau de Bord</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#f59e0b' }}>
                                Vue d'ensemble du Motel
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <p className="text-sm font-bold opacity-80">
                            {getGreeting()} {user?.prenom || ''}, voici les activités
                        </p>
                        <p className="text-xs font-semibold opacity-60">
                            {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            {' • '}
                            {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Alertes Importantes */}
            {reservations?.expired_pending > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-900">Réservations en souffrance</h3>
                            <p className="text-sm text-red-700 mt-0.5">
                                Vous avez <strong>{reservations.expired_pending}</strong> réservation(s) en attente de confirmation depuis plus de 48h.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/reservations')}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        Traiter <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Chiffre d'Affaires */}
                <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        {renderGrowthBadge(revenue?.growth)}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revenus (Ce mois)</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">
                            {Number(revenue?.this_month || 0).toLocaleString('fr-FR')} <span className="text-sm text-slate-400">FCFA</span>
                        </h3>
                    </div>
                </div>

                {/* Réservations */}
                <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        {renderGrowthBadge(reservations?.growth)}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Réservations (Ce mois)</p>
                        <div className="flex items-end gap-2 mt-1">
                            <h3 className="text-2xl font-black text-slate-900">{reservations?.this_month || 0}</h3>
                            <p className="text-xs font-bold text-slate-400 pb-1">/ {reservations?.total} au total</p>
                        </div>
                    </div>
                </div>

                {/* Chambres Occupées */}
                <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                            <BedDouble className="w-5 h-5" />
                        </div>
                        <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            Taux: {rooms?.occupancy_rate}%
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chambres Occupées</p>
                        <div className="flex items-end gap-2 mt-1">
                            <h3 className="text-2xl font-black text-slate-900">{rooms?.occupied || 0}</h3>
                            <p className="text-xs font-bold text-slate-400 pb-1">/ {rooms?.total}</p>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${rooms?.occupancy_rate}%` }} />
                        </div>
                    </div>
                </div>

                {/* Clients & Avis */}
                <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {ratings?.average}/5
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nouveaux Clients</p>
                        <div className="flex items-end gap-2 mt-1">
                            <h3 className="text-2xl font-black text-slate-900">+{clients?.new_month || 0}</h3>
                            <p className="text-xs font-bold text-slate-400 pb-1">ce mois</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts & Lists Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Activité sur 7 jours */}
                <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6 flex flex-col" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-base font-bold text-slate-900">Activité des 7 derniers jours</h2>
                        <span className="text-[10px] font-bold uppercase text-slate-400">Réservations</span>
                    </div>
                    <div className="flex-1 flex items-end gap-2 mt-4 pt-4 border-t border-dashed border-slate-100">
                        {weekly_activity?.map((day, idx) => {
                            const heightPercent = maxActivity > 0 ? (day.total / maxActivity) * 100 : 0;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full relative flex justify-center items-end h-40 bg-slate-50/50 rounded-t-lg">
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                                            {day.total} rés. ({Number(day.revenue).toLocaleString()} FCFA)
                                        </div>
                                        {/* Bar */}
                                        <div 
                                            className="w-full mx-1 bg-amber-400 hover:bg-amber-500 transition-all duration-500 rounded-t-sm"
                                            style={{ height: `${heightPercent}%`, minHeight: day.total > 0 ? '4px' : '0' }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase text-slate-500">{day.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Chambres (Pie Chart) */}
                <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <h2 className="text-base font-bold text-slate-900 mb-6">Top Chambres</h2>
                    
                    {top_rooms?.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-slate-400 text-sm italic">
                            Aucune donnée
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="relative w-48 h-48 mb-6">
                                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                    {top_rooms?.map((room, idx) => {
                                        const percentage = (room.reservations_count / totalTopReservations) * 100;
                                        const dashArray = `${percentage} 100`;
                                        const dashOffset = -currentAngle;
                                        currentAngle += percentage;
                                        
                                        return (
                                            <circle
                                                key={room.id}
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                stroke={PIE_COLORS[idx % PIE_COLORS.length]}
                                                strokeWidth="20"
                                                strokeDasharray={dashArray}
                                                strokeDashoffset={dashOffset}
                                                className="transition-all duration-1000 hover:opacity-80 cursor-pointer"
                                            >
                                                <title>{room.name}: {room.reservations_count} réservations</title>
                                            </circle>
                                        );
                                    })}
                                    {/* White hole in the middle for a donut effect */}
                                    <circle cx="50" cy="50" r="30" fill="white" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl font-black text-slate-900">{totalTopReservations}</span>
                                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Total</span>
                                </div>
                            </div>
                            
                            <div className="w-full space-y-2">
                                {top_rooms?.map((room, idx) => (
                                    <div key={room.id} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                            <span className="font-bold text-slate-700 truncate max-w-[120px]">{room.name}</span>
                                        </div>
                                        <span className="font-black text-slate-900">{room.reservations_count} <span className="text-[9px] uppercase font-bold text-slate-400">rés.</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Dernières réservations (Pleine largeur en bas) */}
                <div className="lg:col-span-3 bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-base font-bold text-slate-900">Dernières Réservations</h2>
                        <button 
                            onClick={() => navigate('/admin/reservations')}
                            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                        >
                            Voir tout <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Client</th>
                                    <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Chambre</th>
                                    <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Date (Début - Fin)</th>
                                    <th className="px-6 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400 text-right">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recent_reservations?.map(res => (
                                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/reservations/${res.id}`)}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {res.client?.profil ? (
                                                    <img src={getImageUrl(res.client.profil)} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-white" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                                                        <UserIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-slate-900">{res.client?.prenom} {res.client?.nom}</p>
                                                    <p className="text-xs text-slate-500">{res.client?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {res.room?.primary_image?.image_path ? (
                                                    <img src={getImageUrl(res.room.primary_image.image_path)} alt={res.room?.name} className="w-12 h-8 rounded object-cover shadow-sm" />
                                                ) : (
                                                    <div className="w-12 h-8 rounded bg-slate-100 text-slate-400 flex items-center justify-center shadow-sm">
                                                        <BedDouble className="w-4 h-4" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm text-slate-800 font-bold">{res.room?.name}</p>
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                                                        {res.room?.floor === 0 ? 'Rez-de-chaussée' : res.room?.floor !== undefined ? `${res.room.floor}${res.room.floor === 1 ? 'er' : 'ème'} Étage` : 'Étage inconnu'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-800 font-bold text-xs">
                                                Du {new Date(res.reservation_date).toLocaleDateString('fr-FR')} à {res.start_time?.slice(0,5)}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                                Au {new Date(res.end_date || res.reservation_date).toLocaleDateString('fr-FR')} à {res.end_time?.slice(0,5)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-block px-2.5 py-1.5 rounded text-[10px] font-black uppercase tracking-wider
                                                ${res.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                                  res.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                                                  res.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' : 
                                                  'bg-blue-50 text-blue-600 border border-blue-100'}`}
                                            >
                                                {res.status === 'confirmed' ? 'Confirmée' :
                                                 res.status === 'pending' ? 'En attente' :
                                                 res.status === 'cancelled' ? 'Annulée' : 'Terminée'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
