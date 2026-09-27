import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Loader2, BedDouble, AlertCircle, ArrowRight, X, RefreshCw, Trash2, CheckCircle, ShieldAlert } from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    const [modalConfig, setModalConfig] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => fetchRooms({ search: searchTerm, status: statusFilter }), 400);
        return () => clearTimeout(t);
    }, [fetchRooms, searchTerm, statusFilter]);

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
                <span className="hover:underline cursor-pointer transition-colors" onClick={() => navigate('/admin')}>Dashboard</span>
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
                                { label: 'Occupées', value: stats.occupied, color: '#f87171' },
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
            <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col lg:flex-row items-center gap-4" style={{ borderColor: `${T.outlineVariant}50` }}>
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
                            <option value={RoomStatus.OCCUPIED}>Occupées</option>
                            <option value={RoomStatus.MAINTENANCE}>En Maintenance</option>
                        </select>
                    </div>
                    {(searchTerm || statusFilter !== 'all') && (
                        <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                            className="p-2.5 rounded-xl transition-colors hover:bg-red-50 hover:text-red-500"
                            style={{ color: T.outline }}>
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={() => fetchRooms({ search: searchTerm, status: statusFilter })} title="Actualiser"
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

            {/* Content */}
            {error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            ) : loading && rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-amber-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-sm font-bold text-slate-500">Chargement des chambres...</p>
                </div>
            ) : rooms.length > 0 ? (
                (() => {
                    // Group rooms by floor, sorted numerically
                    const grouped = rooms.reduce((acc, room) => {
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
