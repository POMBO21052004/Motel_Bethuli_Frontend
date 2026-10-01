import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, BedDouble, Users, Image as ImageIcon, MapPin, CalendarDays, Loader2, CheckCircle, ShieldAlert, Star, MessageSquare, Banknote, Clock } from 'lucide-react';
import roomService from '../../../services/roomService';
import { useRooms } from '../../../hooks/useRooms';
import { RoomStatus, RoomModel } from '../../../models/RoomModel';
import { getImageUrl } from '../../../utils/getImageUrl';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
    surfaceVariant: '#fef3c7', secondary: '#b45309', error: '#ef4444',
};

// PasswordModal
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

export default function RoomShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { deleteRoom } = useRooms();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    const [modalConfig, setModalConfig] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await roomService.show(id);
                const fetchedRoom = response.data.data;
                setRoom(fetchedRoom);
                
                const primary = fetchedRoom.images?.find(i => i.is_primary) || fetchedRoom.images?.[0];
                if (primary) setSelectedImage(primary);
                
            } catch (error) {
                console.error(error);
                navigate('/admin/rooms');
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [id, navigate]);

    const openModal = (config) => setModalConfig(config);
    const closeModal = () => setModalConfig(null);

    const handleDelete = () => {
        openModal({
            title: 'Supprimer la Chambre',
            message: `Vous êtes sur le point de supprimer cette chambre. Cette action est irréversible.`,
            type: 'danger', requirePassword: true,
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    await deleteRoom(id);
                    closeModal();
                    navigate('/admin/rooms');
                } catch (err) {
                    console.error(err);
                } finally { setActionLoading(false); }
            }
        });
    };

    const handleToggleStatus = async () => {
        const newStatus = room.status === 'available' ? 'maintenance' : 'available';
        setActionLoading(true);
        try {
            await roomService.updateStatus(id, newStatus);
            setRoom(prev => ({ ...prev, status: newStatus }));
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-sm font-medium text-slate-500 italic">Chargement des détails...</span>
        </div>
    );

    if (!room) return null;

    const statusLabel = RoomModel.getStatusLabel(room.status);

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20" style={{ color: T.onSurface }}>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: ${T.outlineVariant}; border-radius: 20px; }
            `}</style>
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: T.outline }}>
                <span className="hover:underline cursor-pointer transition-colors" onClick={() => navigate('/admin')}>Dashboard</span>
                <ArrowLeft className="w-3 h-3 mx-1" />
                <span className="hover:underline cursor-pointer transition-colors" onClick={() => navigate('/admin/rooms')}>Chambres</span>
                <ArrowLeft className="w-3 h-3 mx-1" />
                <span style={{ color: T.primary }}>{room.name}</span>
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
                                <BedDouble className="w-7 h-7" style={{ color: '#f59e0b' }} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tight">{room.name}</h1>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#f59e0b' }}>
                                    Motel Bethuli — {room.floor === 0 ? 'Rez-de-chaussée' : `Étage ${room.floor}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={handleToggleStatus}
                            disabled={actionLoading}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all ${
                                room.status === 'available' 
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        >
                            {room.status === 'available' ? (
                                <><ShieldAlert className="w-4 h-4" /> Mettre en maintenance</>
                            ) : (
                                <><CheckCircle className="w-4 h-4" /> Remettre disponible</>
                            )}
                        </button>
                        <Link 
                            to={`/admin/rooms/${room.id}/edit`}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
                            style={{ background: T.primary, color: 'white' }}
                        >
                            <Edit className="w-4 h-4" />
                            Modifier
                        </Link>
                        <button 
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg bg-red-500 hover:bg-red-600 active:scale-95 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne Principale */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Galerie professionnelle interactive */}
                    <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-4" style={{ borderColor: `${T.outlineVariant}50` }}>
                        {/* Grande image principale */}
                        <div className="relative w-full aspect-video md:aspect-[21/9] bg-slate-100 rounded-xl overflow-hidden group">
                            {selectedImage ? (
                                <img 
                                    key={selectedImage.id} // force re-render for transition if needed
                                    src={getImageUrl(selectedImage.image_path)} 
                                    alt={room.name}
                                    className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                    <ImageIcon className="w-12 h-12 text-slate-400" />
                                </div>
                            )}
                            {selectedImage?.is_primary && (
                                <div className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">
                                    Image Principale
                                </div>
                            )}
                        </div>
                        
                        {/* Liste des miniatures */}
                        {room.images && room.images.length > 0 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                {room.images.map(img => (
                                    <button 
                                        key={img.id}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${selectedImage?.id === img.id ? 'border-amber-500 shadow-md scale-105' : 'border-transparent hover:border-amber-300 opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={getImageUrl(img.image_path)} alt="" className="w-full h-full object-cover" />
                                        {img.is_primary && (
                                            <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">UNE</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-lg font-bold mb-4" style={{ color: T.onSurface }}>À propos de cette chambre</h2>
                        <div className="prose prose-slate max-w-none">
                            <p className="whitespace-pre-line leading-relaxed text-sm" style={{ color: T.onSurfaceVariant }}>
                                {room.description_fr || 'Aucune description fournie.'}
                            </p>
                            
                            {room.description_en && (
                                <div className="mt-6 pt-6 border-t" style={{ borderColor: `${T.outlineVariant}50` }}>
                                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: T.outline }}>Description (English)</h3>
                                    <p className="whitespace-pre-line italic text-sm" style={{ color: T.onSurfaceVariant }}>
                                        {room.description_en}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Historique des Réservations */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: `${T.outlineVariant}50` }}>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-5 h-5" style={{ color: T.primary }} />
                                <h2 className="text-lg font-bold" style={{ color: T.onSurface }}>Historique des Réservations</h2>
                            </div>
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                                {room.reservations?.length || 0} totale(s)
                            </span>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {room.reservations && room.reservations.length > 0 ? (
                                room.reservations.map(res => (
                                    <div key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border hover:shadow-sm transition-shadow" style={{ borderColor: `${T.outlineVariant}30` }}>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-sm" style={{ color: T.onSurface }}>{res.client?.prenom} {res.client?.nom}</span>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${res.status === 'confirmed' ? 'bg-green-100 text-green-700' : res.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                                                    {res.status}
                                                </span>
                                                {res.status === 'confirmed' && res.reservation_date <= new Date().toISOString().split('T')[0] && (res.end_date || res.reservation_date) >= new Date().toISOString().split('T')[0] && (
                                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">En cours</span>
                                                )}
                                            </div>
                                            <div className="text-xs flex items-center gap-2" style={{ color: T.onSurfaceVariant }}>
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                Du {new Date(res.reservation_date).toLocaleDateString('fr-FR')} au {new Date(res.end_date || res.reservation_date).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black" style={{ color: T.onSurface }}>{Number(res.total_price).toLocaleString('fr-FR')} FCFA</div>
                                            <div className="text-[10px] font-bold uppercase text-slate-400">Total</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8" style={{ color: T.outline }}>
                                    <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">Aucune réservation pour le moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Colonne Latérale */}
                <div className="space-y-6">
                    {/* Tarifs et Specs */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: `${T.outlineVariant}50` }}>
                            <h2 className="text-lg font-bold" style={{ color: T.onSurface }}>Détails & Tarifs</h2>
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {statusLabel}
                            </span>
                        </div>
                        
                        <div className="space-y-5 mb-6 pb-6 border-b" style={{ borderColor: `${T.outlineVariant}50` }}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: T.surfaceVariant, color: T.primary }}>
                                    <Banknote className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.outline }}>Prix par jour</p>
                                    <p className="text-xl font-black" style={{ color: T.onSurface }}>
                                        {parseFloat(room.price_per_day).toLocaleString('fr-FR')} <span className="text-sm font-bold opacity-80">FCFA</span>
                                    </p>
                                </div>
                            </div>
                            
                            {room.price_per_hour && parseFloat(room.price_per_hour) > 0 && (
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-500">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.outline }}>Prix par heure</p>
                                        <p className="text-lg font-bold" style={{ color: T.onSurfaceVariant }}>
                                            {parseFloat(room.price_per_hour).toLocaleString('fr-FR')} <span className="text-xs font-bold opacity-80">FCFA</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-500">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.outline }}>Capacité</p>
                                    <p className="text-lg font-bold" style={{ color: T.onSurfaceVariant }}>{room.capacity} pers.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-500">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.outline }}>Niveau</p>
                                    <p className="text-lg font-bold" style={{ color: T.onSurfaceVariant }}>
                                        {room.floor === 0 ? 'RDC' : `Étage ${room.floor}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Avis Clients (Section compacte) */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: T.onSurface }}>
                                    <MessageSquare className="w-4 h-4" />
                                    Avis Clients
                                </h2>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span className="font-black text-sm" style={{ color: T.onSurface }}>
                                        {room.avg_rating ? Number(room.avg_rating).toFixed(1) : '-'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {room.ratings && room.ratings.length > 0 ? (
                                    room.ratings.slice(0, 3).map((rating, idx) => (
                                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border" style={{ borderColor: `${T.outlineVariant}30` }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-bold text-xs" style={{ color: T.onSurface }}>
                                                    {rating.client?.prenom} {rating.client?.nom}
                                                </div>
                                                <div className="flex text-amber-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-2.5 h-2.5 ${i < rating.rating ? 'fill-current' : 'text-slate-300'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-[11px] leading-relaxed line-clamp-3" style={{ color: T.onSurfaceVariant }}>
                                                "{rating.comment || 'Aucun commentaire.'}"
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-500 italic text-center py-4">Aucun avis pour le moment.</p>
                                )}
                            </div>
                            
                            {room.ratings && room.ratings.length > 3 && (
                                <button className="w-full mt-3 py-2 text-xs font-bold text-center rounded-lg hover:bg-slate-50 transition-colors" style={{ color: T.primary }}>
                                    Voir tous les avis ({room.ratings_count})
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <PasswordModal
                isOpen={!!modalConfig} onClose={closeModal}
                onConfirm={modalConfig?.onConfirm} title={modalConfig?.title}
                message={modalConfig?.message} type={modalConfig?.type}
                requirePassword={modalConfig?.requirePassword} loading={actionLoading}
            />
        </div>
    );
}
