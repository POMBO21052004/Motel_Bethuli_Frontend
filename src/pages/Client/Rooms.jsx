import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BedDouble, Loader2, ChevronDown, ChevronUp,
    Clock, Wrench, Users, X
} from 'lucide-react';
import clientRoomService from '../../services/client/roomService';
import { getImageUrl } from '../../utils/getImageUrl.jsx';

const T = {
    onSurface: '#0f172a', primary: '#f59e0b',
    outlineVariant: '#cbd5e1',
};

// ── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({ room, onClose, onSuccess }) {
    const today = new Date().toISOString().slice(0, 10);
    const [form, setForm] = useState({ reservation_date: today, start_time: '12:00', end_date: today, end_time: '12:00', notes: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await reservationService.store({ room_id: room.id, ...form });
            onSuccess(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la réservation.');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 rounded-t-3xl shrink-0">
                    <div>
                        <h3 className="font-black text-lg text-slate-900">Réserver</h3>
                        <p className="text-sm font-bold text-amber-600">{room.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-200 text-slate-500 rounded-full hover:bg-slate-300 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form id="rooms-book-form" onSubmit={submit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex gap-3 items-start border border-red-100 text-sm font-bold">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />{error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Date arrivée</label>
                            <input required type="date" min={today} value={form.reservation_date} onChange={e => setForm({...form, reservation_date: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-200" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Heure</label>
                            <input required type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-200" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Date départ</label>
                            <input required type="date" min={form.reservation_date} value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-200" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Heure</label>
                            <input required type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-200" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Notes (optionnel)</label>
                        <textarea rows="3" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 text-sm resize-none outline-none" placeholder="Demandes particulières..." />
                    </div>
                </form>
                <div className="p-6 border-t border-slate-100 shrink-0">
                    <button type="submit" form="rooms-book-form" disabled={loading} className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-black hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-100">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer la réservation'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Success Modal ─────────────────────────────────────────────────────────────
function SuccessModal({ reservation, onClose }) {
    const openWhatsApp = () => {
        const text = encodeURIComponent(`Bonjour, je viens d'effectuer une réservation pour la chambre "${reservation.room?.name}". Pouvez-vous confirmer ?`);
        window.open(`https://wa.me/237600000000?text=${text}`, '_blank');
    };
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
            <div className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl animate-in zoom-in-95">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CalendarCheck2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Réservation reçue !</h3>
                <p className="text-slate-500 text-sm mb-6">Votre demande est <strong className="text-amber-500">en attente</strong>. Contactez-nous sur WhatsApp pour une confirmation rapide.</p>
                <div className="space-y-3">
                    <button onClick={openWhatsApp} className="w-full py-3.5 rounded-xl bg-[#25D366] text-white font-black hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2">
                        <MessageCircle className="w-5 h-5" /> Contacter sur WhatsApp
                    </button>
                    <button onClick={onClose} className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">Fermer</button>
                </div>
            </div>
        </div>
    );
}

// ── Floor Group Card ──────────────────────────────────────────────────────────
function FloorGroup({ group, onBook }) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" style={{ borderColor: `${T.outlineVariant}50` }}>
            {/* Floor header */}
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-100"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-100">
                        <BedDouble className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-slate-900">{group.floor_label}</p>
                        <p className="text-xs text-slate-500 font-medium">{group.rooms.length} chambre{group.rooms.length > 1 ? 's' : ''}</p>
                    </div>
                </div>
                {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {/* Rooms grid */}
            {expanded && (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {group.rooms.map(room => (
                        <RoomDetailCard key={room.id} room={room} onBook={onBook} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Room Detail Card ──────────────────────────────────────────────────────────
function RoomDetailCard({ room, onBook }) {
    const [imgIndex, setImgIndex] = useState(0);
    const [lightbox, setLightbox] = useState(null);
    const images = room.images?.length > 0 ? room.images : (room.primary_image ? [room.primary_image] : []);
    const isOccupied = room.is_occupied_now;
    const isMaintenance = room.status?.value === 'maintenance' || room.status === 'maintenance';

    return (
        <div className="group flex flex-col rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {/* Image */}
            <div className="relative h-44 bg-slate-100 overflow-hidden shrink-0">
                {images.length > 0 ? (
                    <>
                        <img
                            src={getImageUrl(images[imgIndex]?.image_path)}
                            alt={room.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                            onClick={() => setLightbox(getImageUrl(images[imgIndex]?.image_path))}
                        />
                        {images.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                {images.map((_, i) => (
                                    <button key={i} onClick={() => setImgIndex(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${imgIndex === i ? 'bg-white scale-125' : 'bg-white/50'}`} />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BedDouble className="w-12 h-12 text-slate-300" />
                    </div>
                )}
                {/* Status badge */}
                {isMaintenance ? (
                    <div className="absolute top-3 left-3 bg-slate-800/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur">
                        <Wrench className="w-3 h-3" /> Maintenance
                    </div>
                ) : isOccupied ? (
                    <div className="absolute top-3 left-3 bg-red-500/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Occupée
                    </div>
                ) : (
                    <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" /> Disponible
                    </div>
                )}
                {/* Price */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-slate-900 text-sm font-black px-2.5 py-1 rounded-xl shadow-md">
                    {Number(room.price_per_day).toLocaleString('fr-FR')}
                    <span className="text-[9px] text-slate-500 font-bold ml-0.5">FCFA/nuit</span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-black text-slate-900 text-base">{room.name}</h3>
                {room.description_fr && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex-1">{room.description_fr}</p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 font-medium">
                    {room.capacity && (
                        <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {room.capacity} pers.
                        </div>
                    )}
                    {room.price_per_hour && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {Number(room.price_per_hour).toLocaleString('fr-FR')} FCFA/h
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onBook(room)}
                    disabled={isOccupied || isMaintenance}
                    className="mt-4 w-full py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 text-white hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-100 active:scale-95"
                >
                    {isMaintenance ? 'En maintenance' : isOccupied ? 'Occupée' : 'Réserver cette chambre'}
                </button>
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
                    <img src={lightbox} alt="Chambre" className="max-w-full max-h-full rounded-xl object-contain" />
                    <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientRooms() {
    const navigate = useNavigate();
    const [groups, setGroups]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        clientRoomService.index()
            .then(r => setGroups(r.data.data || []))
            .catch(() => setError('Impossible de charger les chambres.'))
            .finally(() => setLoading(false));
    }, []);

    const totalRooms     = groups.reduce((s, g) => s + g.rooms.length, 0);
    const availableCount = groups.reduce((s, g) => s + g.rooms.filter(r => !r.is_occupied_now && (r.status?.value ?? r.status) !== 'maintenance').length, 0);

    if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
    if (error)   return <div className="rounded-xl bg-red-50 p-4 text-red-700 font-bold text-sm">{error}</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                <div className="absolute -right-10 -top-10 opacity-5">
                    <BedDouble size={220} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl border" style={{ background: `${T.primary}25`, borderColor: `${T.primary}40` }}>
                            <BedDouble className="w-6 h-6" style={{ color: T.primary }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tight">Nos Chambres</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.primary }}>
                                Motel Bethuli • Découvrez nos espaces
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm max-w-xl">Consultez l'ensemble de nos chambres groupées par étage. Les statuts d'occupation sont mis à jour en temps réel.</p>
                    <div className="flex gap-4 mt-4">
                        <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
                            <p className="text-lg font-black text-white">{totalRooms} chambres</p>
                        </div>
                        <div className="px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Disponibles</p>
                            <p className="text-lg font-black text-emerald-300">{availableCount} chambres</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Groups ───────────────────────────────────────────────────── */}
            {groups.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                    <BedDouble className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">Aucune chambre disponible pour le moment.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {groups.map(group => (
                        <FloorGroup key={group.floor} group={group} onBook={(room) => navigate(`/client/reservations/create?room_id=${room.id}`)} />
                    ))}
                </div>
            )}
        </div>
    );
}
