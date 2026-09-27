import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, MessageSquare, Star, Trash2, BedDouble, AlertCircle, Sparkles } from 'lucide-react';
import adminService from '../../../services/adminService';
import { useToast } from '../../../components/common/ToastContext';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
    surfaceVariant: '#fef3c7', secondary: '#b45309', error: '#ef4444',
};

export default function RatingIndex() {
    const [data, setData] = useState({ pagination: { data: [] }, stats: {} });
    const [rating, setRating] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const toast = useToast();

    const load = useCallback(() => {
        setLoading(true);
        adminService.ratings({ rating })
            .then((response) => setData(response.data))
            .catch(() => setError('Impossible de charger les avis.'))
            .finally(() => setLoading(false));
    }, [rating]);

    useEffect(() => { load(); }, [load]);

    const remove = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;
        try {
            await adminService.deleteRating(id);
            toast.success('Avis supprimé avec succès.');
            load();
        } catch {
            toast.error('La suppression a échoué.');
        }
    };

    // Grouper les avis par nom de chambre
    const groupedRatings = data.pagination?.data?.reduce((groups, item) => {
        const roomName = item.reservation?.room?.name || 'Chambre Inconnue';
        if (!groups[roomName]) {
            groups[roomName] = [];
        }
        groups[roomName].push(item);
        return groups;
    }, {}) || {};

    const renderStars = (ratingValue) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((value) => (
                    <Star 
                        key={value} 
                        className={`w-4 h-4 ${value <= ratingValue ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20" style={{ color: T.onSurface }}>
            
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                <div className="absolute -right-10 -top-10 opacity-5">
                    <Star size={240} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl border backdrop-blur-md" style={{ background: `${T.primary}30`, borderColor: `${T.primary}50` }}>
                            <Sparkles className="w-7 h-7" style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tight">Avis & Notes</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#f59e0b' }}>
                                Retours Clients
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <select 
                            value={rating} 
                            onChange={(e) => setRating(e.target.value)} 
                            className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer backdrop-blur-md"
                        >
                            <option value="all" className="text-slate-900">Toutes les notes</option>
                            {[5, 4, 3, 2, 1].map((value) => (
                                <option key={value} value={value} className="text-slate-900">{value} étoiles</option>
                            ))}
                        </select>
                    </div>
                </div>
                <p className="relative z-10 text-sm font-medium opacity-80 max-w-md leading-relaxed mt-4">
                    Consultez les retours et les notes laissées par vos clients après leur séjour. Les avis sont regroupés par chambre pour faciliter l'analyse.
                </p>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border bg-white flex items-center justify-between shadow-sm" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.outline }}>Note Globale Moyenne</p>
                        <div className="flex items-end gap-2 mt-2">
                            <span className="text-4xl font-black" style={{ color: T.primary }}>{data.stats.average || '0.0'}</span>
                            <span className="text-lg font-bold pb-1" style={{ color: T.outline }}>/ 5</span>
                        </div>
                    </div>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-amber-50">
                        <Star className="w-8 h-8 fill-amber-500 text-amber-500" />
                    </div>
                </div>
                <div className="p-6 rounded-2xl border bg-white flex items-center justify-between shadow-sm" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.outline }}>Total des Avis</p>
                        <div className="flex items-end gap-2 mt-2">
                            <span className="text-4xl font-black" style={{ color: T.onSurface }}>{data.stats.total || 0}</span>
                            <span className="text-sm font-bold pb-2" style={{ color: T.outline }}>avis récoltés</span>
                        </div>
                    </div>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-50">
                        <MessageSquare className="w-8 h-8 text-slate-400" />
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl flex items-center gap-3 bg-red-50 border border-red-200 text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            {/* Ratings List Grouped by Room */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    <span className="text-sm font-medium text-slate-500 italic">Chargement des avis...</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.keys(groupedRatings).length === 0 ? (
                        <div className="text-center py-20 border rounded-2xl bg-white border-dashed" style={{ borderColor: T.outlineVariant }}>
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: T.onSurface }} />
                            <p className="text-sm font-bold" style={{ color: T.onSurfaceVariant }}>Aucun avis trouvé.</p>
                        </div>
                    ) : (
                        Object.keys(groupedRatings).map(roomName => (
                            <div key={roomName} className="bg-white rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: `${T.outlineVariant}50` }}>
                                
                                {/* Room Group Header */}
                                <div className="px-6 py-4 border-b flex items-center gap-3 bg-slate-50" style={{ borderColor: `${T.outlineVariant}50` }}>
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <BedDouble className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <h2 className="text-lg font-black tracking-tight" style={{ color: T.onSurface }}>
                                        {roomName}
                                    </h2>
                                    <span className="ml-auto text-xs font-bold px-2.5 py-1 bg-white border rounded-full shadow-sm" style={{ color: T.onSurfaceVariant, borderColor: `${T.outlineVariant}50` }}>
                                        {groupedRatings[roomName].length} avis
                                    </span>
                                </div>

                                {/* Room Reviews List */}
                                <div className="divide-y" style={{ borderColor: `${T.outlineVariant}30` }}>
                                    {groupedRatings[roomName].map(item => (
                                        <div key={item.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="font-bold text-sm" style={{ color: T.onSurface }}>
                                                        {item.client?.prenom} {item.client?.nom}
                                                    </p>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: T.outline }}>
                                                        Séjour du {item.reservation?.reservation_date ? new Date(item.reservation.reservation_date).toLocaleDateString('fr-FR') : 'Inconnu'}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {renderStars(item.rating)}
                                                    <button 
                                                        onClick={() => remove(item.id)} 
                                                        className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 text-slate-300 transition-colors mt-2"
                                                        title="Supprimer cet avis"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {item.comment ? (
                                                <div className="p-4 rounded-xl bg-slate-50 border text-sm relative" style={{ borderColor: `${T.outlineVariant}30`, color: T.onSurfaceVariant }}>
                                                    <MessageSquare className="w-4 h-4 absolute top-4 left-4 opacity-20" />
                                                    <p className="leading-relaxed pl-6 italic">"{item.comment}"</p>
                                                </div>
                                            ) : (
                                                <p className="text-xs italic" style={{ color: T.outline }}>Aucun commentaire textuel fourni.</p>
                                            )}

                                            {/* Detailed Ratings */}
                                            <div className="flex flex-wrap items-center gap-6 mt-5 pt-4 border-t border-dashed" style={{ borderColor: `${T.outlineVariant}30` }}>
                                                {item.cleanliness_rating > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold uppercase" style={{ color: T.outline }}>Propreté</span>
                                                        <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">{item.cleanliness_rating}/5</span>
                                                    </div>
                                                )}
                                                {item.service_rating > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold uppercase" style={{ color: T.outline }}>Service</span>
                                                        <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">{item.service_rating}/5</span>
                                                    </div>
                                                )}
                                                {item.comfort_rating > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold uppercase" style={{ color: T.outline }}>Confort</span>
                                                        <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">{item.comfort_rating}/5</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
