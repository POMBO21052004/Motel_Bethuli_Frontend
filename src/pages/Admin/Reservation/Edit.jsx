import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle, Clock, ShieldAlert, Loader2, Info, BedDouble, Edit2 } from 'lucide-react';
import adminService from '../../../services/adminService';
import roomService from '../../../services/roomService';
import { ReservationStatus } from '../../../models/ReservationModel';
import { useToast } from '../../../components/common/ToastContext';
import { getImageUrl } from '../../../utils/getImageUrl';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
    surfaceVariant: '#fef3c7', secondary: '#b45309', error: '#ef4444',
};

export default function ReservationEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [rooms, setRooms] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);

    const [availabilityMsg, setAvailabilityMsg] = useState(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    const [formData, setFormData] = useState({
        room_id: '',
        client_id: '',
        reservation_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        total_price: '',
        status: '',
        notes: '',
    });

    // Load initial reservation data + rooms + clients
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resResponse, roomsResponse, clientsResponse] = await Promise.all([
                    adminService.getReservation(id),
                    adminService.rooms({ per_page: 100 }),
                    adminService.clients({ per_page: 100 }),
                ]);

                const reservation = resResponse.data.data;
                setFormData({
                    room_id: reservation.room_id,
                    client_id: reservation.client_id,
                    reservation_date: reservation.reservation_date.split('T')[0],
                    end_date: reservation.end_date ? reservation.end_date.split('T')[0] : reservation.reservation_date.split('T')[0],
                    start_time: reservation.start_time.slice(0, 5),
                    end_time: reservation.end_time.slice(0, 5),
                    total_price: reservation.total_price,
                    status: reservation.status,
                    notes: reservation.notes || '',
                });

                setRooms(roomsResponse.data.pagination?.data || []);
                setClients(clientsResponse.data.pagination?.data || []);

                // Load current room details for sidebar
                const roomDetail = await roomService.show(reservation.room_id);
                setSelectedRoomDetails(roomDetail.data.data);

            } catch (err) {
                setError('Impossible de charger les données pour la modification.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Reload room details when room_id changes
    useEffect(() => {
        if (!formData.room_id || loading) return;
        const fetchRoom = async () => {
            try {
                const response = await roomService.show(formData.room_id);
                setSelectedRoomDetails(response.data.data);
            } catch (err) {
                console.error('Error fetching room details', err);
            }
        };
        fetchRoom();
    }, [formData.room_id]);

    // Check availability via backend — exclude current reservation from conflict check
    useEffect(() => {
        const { room_id, reservation_date, end_date, start_time, end_time } = formData;
        if (!room_id || !reservation_date || !end_date || !start_time || !end_time || loading) {
            setAvailabilityMsg(null);
            return;
        }

        let cancelled = false;
        const delay = setTimeout(async () => {
            setCheckingAvailability(true);
            try {
                const response = await adminService.checkAvailability({
                    room_id,
                    reservation_date,
                    end_date: formData.end_date,
                    start_time,
                    end_time,
                    exclude_id: id,
                });
                if (cancelled) return;
                const data = response.data;
                if (data.available) {
                    setAvailabilityMsg({ type: 'success', text: 'La chambre est disponible pour ce créneau.' });
                } else {
                    setAvailabilityMsg({
                        type: 'error',
                        text: data.occupied_by
                            ? `${data.message} (Par ${data.occupied_by} du ${data.from} au ${data.until})`
                            : data.message || 'La chambre n\'est pas disponible.',
                    });
                }
            } catch (err) {
                if (!cancelled) setAvailabilityMsg(null);
            } finally {
                if (!cancelled) setCheckingAvailability(false);
            }
        }, 500);

        return () => { cancelled = true; clearTimeout(delay); };
    }, [formData.room_id, formData.reservation_date, formData.end_date, formData.start_time, formData.end_time, loading]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (availabilityMsg?.type === 'error' && formData.status !== 'cancelled') {
            toast.error('Veuillez choisir un autre créneau ou une autre chambre.');
            return;
        }
        setIsSubmitting(true);
        try {
            await adminService.updateReservation(id, formData);
            toast.success('Réservation modifiée avec succès !');
            navigate(`/admin/reservations/${id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Une erreur est survenue lors de la modification.');
            setIsSubmitting(false);
        }
    };

    // ─── Loading / Error states ───────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <span className="text-sm font-medium text-slate-500 italic">Chargement...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <ShieldAlert className="w-12 h-12 text-red-500" />
                <span className="text-sm font-medium text-red-500">{error}</span>
                <button onClick={() => navigate('/admin/reservations')} className="text-amber-600 font-bold mt-2">Retour</button>
            </div>
        );
    }

    const roomImage = selectedRoomDetails?.images?.find(i => i.is_primary) || selectedRoomDetails?.images?.[0];

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20" style={{ color: T.onSurface }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: T.outline }}>
                <span className="hover:underline cursor-pointer" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
                <ArrowLeft className="w-3 h-3 mx-1" />
                <span className="hover:underline cursor-pointer" onClick={() => navigate('/admin/reservations')}>Réservations</span>
                <ArrowLeft className="w-3 h-3 mx-1" />
                <span className="hover:underline cursor-pointer" onClick={() => navigate(`/admin/reservations/${id}`)}>#{id.slice(0,8).toUpperCase()}</span>
                <ArrowLeft className="w-3 h-3 mx-1" />
                <span style={{ color: T.primary }}>Modifier</span>
            </div>

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                <div className="absolute -right-10 -top-10 opacity-5">
                    <Edit2 size={240} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 rounded-xl border backdrop-blur-md" style={{ background: `${T.primary}30`, borderColor: `${T.primary}50` }}>
                        <CalendarDays className="w-7 h-7" style={{ color: '#f59e0b' }} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tight">Modifier la Réservation</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#f59e0b' }}>
                            #{id.slice(0, 8).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Séjour */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-lg font-bold border-b pb-4" style={{ color: T.onSurface, borderColor: `${T.outlineVariant}50` }}>1. Informations du Séjour</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Room select */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700">Chambre <span className="text-red-500">*</span></label>
                                <select
                                    name="room_id"
                                    value={formData.room_id}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer"
                                >
                                    <option value="">Sélectionnez une chambre...</option>
                                    {rooms.filter(r => r.status === 'available').length > 0 && (
                                        <optgroup label="✅ Disponibles">
                                            {rooms.filter(r => r.status === 'available').map(r => (
                                                <option key={r.id} value={r.id}>
                                                    {r.name} — {r.floor === 0 ? 'RDC' : `Étage ${r.floor}`} ({r.price_per_day} FCFA/j)
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                    {rooms.filter(r => r.status === 'maintenance').length > 0 && (
                                        <optgroup label="🔧 En maintenance (non réservables)">
                                            {rooms.filter(r => r.status === 'maintenance').map(r => (
                                                <option key={r.id} value={r.id} disabled style={{ color: '#f59e0b' }}>
                                                    {r.name} — {r.floor === 0 ? 'RDC' : `Étage ${r.floor}`} [MAINTENANCE]
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>

                                {selectedRoomDetails && selectedRoomDetails.status !== 'available' && (
                                    <div className="mt-2 p-3 rounded-xl flex items-center gap-3 bg-red-50 border border-red-200 text-red-700">
                                        <Info className="w-5 h-5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold">Chambre non disponible</p>
                                            <p className="text-xs mt-0.5">
                                                Cette chambre est en maintenance. Veuillez en sélectionner une autre.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Date et Heure Début */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Date Début <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name="reservation_date"
                                        value={formData.reservation_date}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Heure Début <span className="text-red-500">*</span></label>
                                    <input
                                        type="time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-amber-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Date et Heure Fin */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Date Fin <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        min={formData.reservation_date}
                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-amber-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Heure Fin <span className="text-red-500">*</span></label>
                                    <input
                                        type="time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-amber-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Availability check display */}
                        {formData.room_id && (checkingAvailability ? (
                            <div className="p-4 rounded-xl flex items-center gap-3 bg-slate-50 border border-slate-200 text-slate-500">
                                <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
                                <p className="text-sm font-medium">Vérification de la disponibilité...</p>
                            </div>
                        ) : availabilityMsg && (
                            <div className={`p-4 rounded-xl flex items-start gap-3 border ${availabilityMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                                {availabilityMsg.type === 'error' ? <Info className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
                                <div>
                                    <p className="text-sm font-bold">{availabilityMsg.type === 'error' ? '⛔ Indisponible' : '✅ Disponible'}</p>
                                    <p className="text-xs mt-0.5">{availabilityMsg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Client */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-lg font-bold border-b pb-4" style={{ color: T.onSurface, borderColor: `${T.outlineVariant}50` }}>2. Client & Statut</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700">Client <span className="text-red-500">*</span></label>
                                <select
                                    name="client_id"
                                    value={formData.client_id}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-amber-500 outline-none transition-all cursor-pointer"
                                >
                                    <option value="">Sélectionnez un client...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.prenom} {c.nom} ({c.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700">Statut de la réservation</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-amber-500 outline-none transition-all cursor-pointer"
                                >
                                    <option value={ReservationStatus.PENDING}>En attente</option>
                                    <option value={ReservationStatus.CONFIRMED}>Confirmée</option>
                                    <option value={ReservationStatus.CANCELLED}>Annulée</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Facturation & Notes */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-lg font-bold border-b pb-4" style={{ color: T.onSurface, borderColor: `${T.outlineVariant}50` }}>3. Facturation & Notes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Prix Total (FCFA)</label>
                                <input
                                    type="number"
                                    name="total_price"
                                    value={formData.total_price}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:border-amber-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700">Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Demande spéciale, etc."
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-amber-500 outline-none transition-all"
                                ></textarea>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate(`/admin/reservations/${id}`)}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    checkingAvailability ||
                                    (availabilityMsg?.type === 'error' && formData.status !== 'cancelled') ||
                                    (selectedRoomDetails && selectedRoomDetails.status !== 'available')
                                }
                                className="px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                                style={{ background: T.primary }}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar — Room Details */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-lg font-bold mb-4" style={{ color: T.onSurface }}>Détails Chambre</h2>

                        {!selectedRoomDetails ? (
                            <div className="text-center py-10 opacity-50">
                                <BedDouble className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                <p className="text-sm font-medium">Sélectionnez une chambre.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {roomImage ? (
                                    <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-100">
                                        <img src={getImageUrl(roomImage.image_path)} alt="Room" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-full h-32 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <BedDouble className="w-8 h-8 text-slate-300" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nom</p>
                                    <p className="font-bold text-slate-900">{selectedRoomDetails.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prix / Jour</p>
                                        <p className="font-bold text-amber-600">{selectedRoomDetails.price_per_day} FCFA</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capacité</p>
                                        <p className="font-bold text-slate-700">{selectedRoomDetails.capacity} pers.</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 5 Dernières Réservations
                                    </p>
                                    {selectedRoomDetails.reservations?.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedRoomDetails.reservations.slice(0, 5).map(res => (
                                                <div key={res.id} className={`p-2.5 rounded-lg bg-slate-50 border text-xs ${res.id === id ? 'border-amber-300 bg-amber-50' : 'border-slate-100'}`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-slate-700">{res.client?.prenom} {res.client?.nom}</span>
                                                        {res.id === id && <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">Actuelle</span>}
                                                        {res.id !== id && (
                                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${res.status === 'confirmed' ? 'bg-green-100 text-green-700' : res.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                                                                {res.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-slate-500">
                                                        Le {new Date(res.reservation_date).toLocaleDateString('fr-FR')}<br />
                                                        {res.start_time.slice(0, 5)} à {res.end_time.slice(0, 5)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 italic">Aucune réservation récente.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </form>
        </div>
    );
}
