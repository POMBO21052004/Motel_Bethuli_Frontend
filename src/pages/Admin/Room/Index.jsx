import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Loader2, BedDouble, AlertCircle, ArrowRight, X, RefreshCw, Trash2, CheckCircle, ShieldAlert, SlidersHorizontal, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { useRooms } from '../../../hooks/useRooms';
import RoomCard from '../../../components/admin/room/RoomCard';
import { RoomStatus } from '../../../models/RoomModel';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
    surfaceVariant: '#fef3c7', secondary: '#b45309', error: '#ef4444',
};

// Modal
function PasswordModal({ isOpen, onClose, onConfirm, title, message, type = 'danger', requirePassword = false, loading = false }) {
    const [password, setPassword] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-red-100 text-red-600' : type === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {type === 'danger' ? <Trash2 className="w-6 h-6" /> : type === 'success' ? <CheckCircle className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                    </div>
                    <h3 className="text-lg font-bold text-center text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-center text-gray-500 mb-4">{message}</p>
                    {requirePassword && (
                        <div className="mt-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">Votre mot de passe (confirmation)</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-red-500"
                                style={{ borderColor: T.outlineVariant }} autoFocus />
                        </div>
                    )}
                </div>
                <div className="flex border-t border-gray-100">
                    <button onClick={() => { setPassword(''); onClose(); }} className="flex-1 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100">Annuler</button>
                    <button onClick={() => { onConfirm(requirePassword ? password : null); setPassword(''); }}
                        disabled={loading || (requirePassword && !password)}
                        className={`flex-1 py-3.5 text-sm font-bold transition-colors disabled:opacity-50 ${type === 'danger' ? 'text-red-600 hover:bg-red-50' : type === 'success' ? 'text-green-700 hover:bg-green-50' : 'text-amber-600 hover:bg-amber-50'}`}>
                        {loading ? 'En cours...' : 'Confirmer'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function RoomIndex() {
    const navigate = useNavigate();
    const { rooms, stats, loading, error, fetchRooms, deleteRoom } = useRooms();
    const [searchTerm, setSearchTerm]   = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        start_date: '',
        end_date: '',
        capacity: '',
        max_price: '',
        floor: '',
    });
    const [activeAdvanced, setActiveAdvanced] = useState({});

    const [modalConfig, setModalConfig] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const getNextDay = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    };

    const handleAdvancedChange = (e) => {
        const { name, value } = e.target;
        setAdvancedFilters(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'start_date' && value) {
                const minEnd = getNextDay(value);
                if (!next.end_date || next.end_date <= value) next.end_date = minEnd;
            }
            return next;
        });
    };

    const applyAdvanced = () => {
        setActiveAdvanced({ ...advancedFilters });
    };

    const clearAdvanced = () => {
        const empty = { start_date: '', end_date: '', capacity: '', max_price: '', floor: '' };
        setAdvancedFilters(empty);
        setActiveAdvanced({});
    };

    const hasActiveAdvanced = Object.values(activeAdvanced).some(v => v !== '');

    useEffect(() => {
        const params = { search: searchTerm, status: statusFilter };
        if (activeAdvanced.start_date) params.start_date = activeAdvanced.start_date;
        if (activeAdvanced.end_date)   params.end_date   = activeAdvanced.end_date;
        const t = setTimeout(() => fetchRooms(params), 400);
        return () => clearTimeout(t);
    }, [fetchRooms, searchTerm, statusFilter, activeAdvanced]);

    // Compute disabledReason for each room based on active advanced filters
    const roomsWithOverlay = rooms.map(room => {
        let disabledReason = null;
        if (room.is_occupied_for_dates) {
            disabledReason = "Occupée pour cette période";
        } else if (activeAdvanced.floor && parseInt(room.floor) !== parseInt(activeAdvanced.floor)) {
            disabledReason = "Indisponible (Étage)";
        } else if (activeAdvanced.capacity && parseInt(room.capacity) < parseInt(activeAdvanced.capacity)) {
            disabledReason = "Indisponible (Capacité)";
        } else if (activeAdvanced.max_price && parseFloat(room.price_per_day) > parseFloat(activeAdvanced.max_price)) {
            disabledReason = "Indisponible (Budget)";
        }
        return { ...room, disabledReason };
    });

    const openModal = (config) => setModalConfig(config);
    const closeModal = () => setModalConfig(null);

    const handleDelete = (id) => {
        openModal({
            title: 'Supprimer la Chambre',
            message: `Vous êtes sur le point de supprimer cette chambre. Cette action est irréversible.`,
            type: 'danger', requirePassword: true,
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    await deleteRoom(id);
                    closeModal();
                } catch (err) {
                    console.error(err);
                } finally { setActionLoading(false); }
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700" style={{ color: T.onSurface }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: T.outline }}>
                <span className="hover:underline cursor-pointer transition-colors" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
                <ArrowRight className="w-3 h-3" />
                <span style={{ color: T.primary }}>Gestion des Chambres</span>
            </div>

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                {/* Background decoration */}
                <div className="absolute -right-10 -top-10 opacity-5">
                    <BedDouble size={240} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 rounded-xl border backdrop-blur-md" style={{ background: `${T.primary}30`, borderColor: `${T.primary}50` }}>
                                <BedDouble className="w-7 h-7" style={{ color: '#4ade80' }} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tight">Chambres</h1>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#4ade80' }}>
                                    Parc Hôtelier — Motel Bethuli
                                </p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                            Gérez les chambres, suites et espaces de votre hôtel. Modifiez leurs caractéristiques, prix et statuts d'occupation en temps réel.
                        </p>
                    </div>

                    {/* Stats panel */}
                    {stats && (
                        <div className="flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                            {[
                                { label: 'Total', value: stats.total, color: '#f8fafc' },
                                { label: 'Libres', value: stats.available, color: '#4ade80' },
                            ].map((s, i) => (
                                <React.Fragment key={s.label}>
                                    {i > 0 && <div className="w-px h-10 opacity-20 bg-white" />}
                                    <div className="text-center px-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{s.label}</p>
                                        <p className="text-2xl font-black italic" style={{ color: s.color }}>{s.value}</p>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Search + Actions */}
            <div className="bg-white rounded-2xl border shadow-sm" style={{ borderColor: `${T.outlineVariant}50` }}>
                {/* Top bar */}
                <div className="p-4 flex flex-col lg:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T.outline }} />
                        <input type="text" placeholder="Rechercher par nom, description..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                            style={{ background: T.bg, color: T.onSurface }} />
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 lg:flex-none" style={{ background: T.bg }}>
                            <Filter className="w-4 h-4 flex-shrink-0" style={{ color: T.outline }} />
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer outline-none"
                                style={{ color: T.onSurface }}>
                                <option value="all">Toutes les chambres</option>
                                <option value={RoomStatus.AVAILABLE}>Disponibles</option>
                                <option value={RoomStatus.MAINTENANCE}>En Maintenance</option>
                            </select>
                        </div>

                        {/* Advanced filters toggle */}
                        <button
                            onClick={() => setShowAdvanced(v => !v)}
                            title="Filtres avancés"
                            className={`relative p-2.5 rounded-xl transition-colors border ${showAdvanced ? 'border-amber-400 bg-amber-50 text-amber-600' : 'border-transparent hover:bg-gray-100'}`}
                            style={{ color: showAdvanced ? T.primary : T.outline }}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            {hasActiveAdvanced && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white" />
                            )}
                        </button>

                        {(searchTerm || statusFilter !== 'all') && (
                            <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                                className="p-2.5 rounded-xl transition-colors hover:bg-red-50 hover:text-red-500"
                                style={{ color: T.outline }}>
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <button onClick={() => { const params = { search: searchTerm, status: statusFilter }; if (activeAdvanced.start_date) params.start_date = activeAdvanced.start_date; if (activeAdvanced.end_date) params.end_date = activeAdvanced.end_date; fetchRooms(params); }} title="Actualiser"
                            className="p-2.5 rounded-xl transition-colors hover:bg-gray-100" style={{ color: T.outline }}>
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => navigate('/admin/rooms/create')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
                            style={{ background: T.primary }}>
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Nouvelle Chambre</span>
                        </button>
                    </div>
                </div>

                {/* Advanced filter panel */}
                {showAdvanced && (
                    <div className="border-t px-4 pb-4 pt-4" style={{ borderColor: `${T.outlineVariant}40`, background: '#fafafa' }}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: T.outline }}>
                                <CalendarDays className="w-3.5 h-3.5" /> Filtres de disponibilité
                            </p>
                            {hasActiveAdvanced && (
                                <button onClick={clearAdvanced} className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-1">
                                    <X className="w-3 h-3" /> Réinitialiser
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {/* Date d'arrivée */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: T.outline }}>Date d'arrivée</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={advancedFilters.start_date}
                                    onChange={handleAdvancedChange}
                                    className="w-full px-3 py-2 rounded-xl text-sm border outline-none focus:ring-1 focus:ring-amber-400"
                                    style={{ borderColor: T.outlineVariant, color: T.onSurface, background: '#fff' }}
                                />
                            </div>
                            {/* Date de départ */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: T.outline }}>Date de départ</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={advancedFilters.end_date}
                                    min={advancedFilters.start_date || undefined}
                                    onChange={handleAdvancedChange}
                                    className="w-full px-3 py-2 rounded-xl text-sm border outline-none focus:ring-1 focus:ring-amber-400"
                                    style={{ borderColor: T.outlineVariant, color: T.onSurface, background: '#fff' }}
                                />
                            </div>
                            {/* Capacité */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: T.outline }}>Capacité</label>
                                <select
                                    name="capacity"
                                    value={advancedFilters.capacity}
                                    onChange={handleAdvancedChange}
                                    className="w-full px-3 py-2 rounded-xl text-sm border outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                                    style={{ borderColor: T.outlineVariant, color: T.onSurface, background: '#fff' }}
                                >
                                    <option value="">Peu importe</option>
                                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} personne{n > 1 ? 's' : ''}</option>)}
                                </select>
                            </div>
                            {/* Prix maximum */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: T.outline }}>Prix maximum</label>
                                <input
                                    type="number"
                                    name="max_price"
                                    value={advancedFilters.max_price}
                                    onChange={handleAdvancedChange}
                                    placeholder="Ex: 50000"
                                    className="w-full px-3 py-2 rounded-xl text-sm border outline-none focus:ring-1 focus:ring-amber-400"
                                    style={{ borderColor: T.outlineVariant, color: T.onSurface, background: '#fff' }}
                                />
                            </div>
                            {/* Étage */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: T.outline }}>Étage</label>
                                <select
                                    name="floor"
                                    value={advancedFilters.floor}
                                    onChange={handleAdvancedChange}
                                    className="w-full px-3 py-2 rounded-xl text-sm border outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                                    style={{ borderColor: T.outlineVariant, color: T.onSurface, background: '#fff' }}
                                >
                                    <option value="">Tous les étages</option>
                                    <option value="0">Rez-de-chaussée</option>
                                    {[1,2,3,4,5].map(n => <option key={n} value={n}>Étage {n}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={applyAdvanced}
                                className="px-5 py-2 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
                                style={{ background: T.primary }}
                            >
                                Appliquer les filtres
                            </button>
                        </div>
                    </div>
                )}
            </div>


            {/* Content */}
            {error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            ) : loading && roomsWithOverlay.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-amber-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-sm font-bold text-slate-500">Chargement des chambres...</p>
                </div>
            ) : roomsWithOverlay.length > 0 ? (
                (() => {
                    // Group rooms by floor, sorted numerically
                    const grouped = roomsWithOverlay.reduce((acc, room) => {
                        const f = room.floor ?? 0;
                        if (!acc[f]) acc[f] = [];
                        acc[f].push(room);
                        return acc;
                    }, {});
                    const floors = Object.keys(grouped).map(Number).sort((a, b) => a - b);

                    return (
                        <div className="space-y-10">
                            {floors.map(floor => (
                                <div key={floor}>
                                    {/* Floor header */}
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shadow-sm"
                                                style={{ background: T.onSurface, color: T.primary }}>
                                                {floor === 0 ? 'RDC' : floor}
                                            </div>
                                            <div>
                                                <h2 className="text-base font-black tracking-tight" style={{ color: T.onSurface }}>
                                                    {floor === 0 ? 'Rez-de-chaussée' : `Étage ${floor}`}
                                                </h2>
                                                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.outline }}>
                                                    {grouped[floor].length} chambre{grouped[floor].length > 1 ? 's' : ''}
                                                    {' · '}
                                                    {grouped[floor].filter(r => r.status === 'available').length} disponible{grouped[floor].filter(r => r.status === 'available').length > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-1 h-px" style={{ background: `${T.outlineVariant}50` }} />
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                                            style={{ background: T.surfaceVariant, color: T.secondary }}>
                                            {floor === 0 ? 'RDC' : `Niv. ${floor}`}
                                        </span>
                                    </div>

                                    {/* Rooms grid for this floor */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {grouped[floor].map(room => (
                                            <RoomCard key={room.id} room={room} onDelete={handleDelete} isAdmin={true} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()
            ) : (
                <div className="bg-white rounded-2xl border p-16 text-center shadow-sm" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: T.bg }}>
                        <BedDouble className="w-8 h-8 opacity-20" style={{ color: T.onSurface }} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: T.onSurface }}>Aucune chambre trouvée</h3>
                    <p className="text-sm mb-6" style={{ color: T.outline }}>
                        {searchTerm || statusFilter !== 'all' ? 'Modifiez vos filtres de recherche.' : 'Ajoutez votre première chambre pour commencer.'}
                    </p>
                    <button onClick={() => navigate('/admin/rooms/create')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90"
                        style={{ background: T.primary }}>
                        <Plus className="w-4 h-4" /> Ajouter une chambre
                    </button>
                </div>
            )}
            
            <PasswordModal
                isOpen={!!modalConfig} onClose={closeModal}
                onConfirm={modalConfig?.onConfirm} title={modalConfig?.title}
                message={modalConfig?.message} type={modalConfig?.type}
                requirePassword={modalConfig?.requirePassword} loading={actionLoading}
            />
        </div>
    );
}
