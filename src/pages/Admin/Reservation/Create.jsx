import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, UserPlus, Search, Info, CheckCircle, Clock, BedDouble, Plus, CalendarCheck2, Loader2 } from 'lucide-react';
import { useAdminReservations } from '../../../hooks/useAdminReservations';
import clientService from '../../../services/clientService';
import roomService from '../../../services/roomService';
import { useToast } from '../../../components/common/ToastContext';
import { getImageUrl } from '../../../utils/getImageUrl';

import adminService from '../../../services/adminService';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
    surfaceVariant: '#fef3c7', secondary: '#b45309', error: '#ef4444',
};

export default function ReservationCreate() {
    const navigate = useNavigate();
    const toast = useToast();
    const { clients, rooms, createReservation } = useAdminReservations();
    
    // Form States
    const [formData, setFormData] = useState({
        room_id: '',
        client_id: '',
        reservation_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        start_time: '12:00',
        end_time: '12:00',
        total_price: '',
        notes: '',
    });

    const [isNewClient, setIsNewClient] = useState(false);
    const [newClientData, setNewClientData] = useState({
        nom: '', prenom: '', email: '', phone: ''
    });

    const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);
    const [roomLoading, setRoomLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availabilityMsg, setAvailabilityMsg] = useState(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    // Fetch room details when room_id changes
    useEffect(() => {
        if (!formData.room_id) {
            setSelectedRoomDetails(null);
            setAvailabilityMsg(null);
            return;
        }
        
        const fetchRoom = async () => {
            setRoomLoading(true);
            try {
                const response = await roomService.show(formData.room_id);
                setSelectedRoomDetails(response.data.data);
                
                // Set default price based on room price if empty
                if (!formData.total_price) {
                    setFormData(prev => ({ ...prev, total_price: response.data.data.price_per_day }));
                }
            } catch (err) {
                console.error("Error fetching room details", err);
            } finally {
                setRoomLoading(false);
            }
        };
        fetchRoom();
    }, [formData.room_id]);

    // Check Availability via BACKEND — triggered on date/time/room changes
    useEffect(() => {
        const { room_id, reservation_date, end_date, start_time, end_time } = formData;
        if (!room_id || !reservation_date || !end_date || !start_time || !end_time) {
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
        }, 500); // 500ms debounce

        return () => { cancelled = true; clearTimeout(delay); };
    }, [formData.room_id, formData.reservation_date, formData.end_date, formData.start_time, formData.end_time]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewClientChange = (e) => {
        const { name, value } = e.target;
        setNewClientData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (availabilityMsg?.type === 'error') {
            toast.error("Veuillez choisir un autre créneau, la chambre est occupée.");
            return;
        }

        setIsSubmitting(true);
        try {
            let finalClientId = formData.client_id;
            
            // 1. Create client if new
            if (isNewClient) {
                if (!newClientData.nom || !newClientData.prenom || !newClientData.email) {
                    toast.error("Veuillez remplir les informations obligatoires du client.");
                    setIsSubmitting(false);
                    return;
                }
                const clientRes = await clientService.create(newClientData);
                finalClientId = clientRes.data.data.id;
                
                // Show message with password
                toast.success(`Client créé avec succès ! Un email avec ses accès lui sera envoyé.`);
            }

            if (!finalClientId) {
                toast.error("Veuillez sélectionner ou créer un client.");
                setIsSubmitting(false);
                return;
            }

            // 2. Create Reservation
            const payload = {
                ...formData,
                client_id: finalClientId,
            };

            await createReservation(payload);
            toast.success("Réservation créée avec succès !");
            navigate('/admin/reservations');
            
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20" style={{ color: T.onSurface }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: T.outline }}>
                <span className="hover:underline cursor-pointer transition-colors" onClick={() => navigate('/admin')}>Dashboard</span>
                <ArrowLeft className="w-3 h-3 mx-1" />
                <span className="hover:underline cursor-pointer transition-colors" onClick={() => navigate('/admin/reservations')}>Réservations</span>
                <ArrowLeft className="w-3 h-3 mx-1" />
                <span style={{ color: T.primary }}>Nouvelle</span>
            </div>

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                <div className="absolute -right-10 -top-10 opacity-5">
                    <CalendarCheck2 size={240} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 rounded-xl border backdrop-blur-md" style={{ background: `${T.primary}30`, borderColor: `${T.primary}50` }}>
                                <CalendarCheck2 className="w-7 h-7" style={{ color: '#f59e0b' }} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tight">Nouvelle Réservation</h1>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#f59e0b' }}>
                                    Assignation d'une chambre
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Form Area */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Choix de la chambre & Dates */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-lg font-bold border-b pb-4" style={{ color: T.onSurface, borderColor: `${T.outlineVariant}50` }}>1. Informations du Séjour</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    {/* Group available rooms first */}
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

                                {/* Room Status Warning Banner */}
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
                            </div>{/* end md:col-span-2 */}

                            {/* Début */}
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

                            {/* Fin */}
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

                        {/* Availability Alert */}
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

                    {/* Choix du Client */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `${T.outlineVariant}50` }}>
                            <h2 className="text-lg font-bold" style={{ color: T.onSurface }}>2. Informations du Client</h2>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <input 
                                type="checkbox"
                                id="newClient"
                                checked={isNewClient}
                                onChange={(e) => setIsNewClient(e.target.checked)}
                                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                            />
                            <div>
                                <label htmlFor="newClient" className="text-sm font-bold text-slate-900 cursor-pointer">Nouveau Client ?</label>
                                <p className="text-xs text-slate-500 mt-0.5">Cochez si le client n'a pas encore de compte. Un email lui sera envoyé avec ses accès.</p>
                            </div>
                        </div>

                        {!isNewClient ? (
                            <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                                <label className="text-sm font-bold text-slate-700">Sélectionner un client existant <span className="text-red-500">*</span></label>
                                <select 
                                    name="client_id"
                                    value={formData.client_id}
                                    onChange={handleInputChange}
                                    required={!isNewClient}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-amber-500 outline-none transition-all cursor-pointer"
                                >
                                    <option value="">Choisir...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.prenom} {c.nom} ({c.email})</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Prénom <span className="text-red-500">*</span></label>
                                    <input type="text" name="prenom" value={newClientData.prenom} onChange={handleNewClientChange} required className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Nom <span className="text-red-500">*</span></label>
                                    <input type="text" name="nom" value={newClientData.nom} onChange={handleNewClientChange} required className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Email <span className="text-red-500">*</span></label>
                                    <input type="email" name="email" value={newClientData.email} onChange={handleNewClientChange} required className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Téléphone</label>
                                    <input type="text" name="phone" value={newClientData.phone} onChange={handleNewClientChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Facturation */}
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
                                <label className="text-sm font-bold text-slate-700">Notes (Optionnel)</label>
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

                        <div className="pt-4 flex justify-end">
                            <button 
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    availabilityMsg?.type === 'error' ||
                                    checkingAvailability ||
                                    (selectedRoomDetails && selectedRoomDetails.status !== 'available')
                                }
                                className="px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                                style={{ background: T.primary }}
                            >
                                {isSubmitting ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                {isSubmitting ? 'Enregistrement...' : 'Confirmer la Réservation'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Room Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-lg font-bold mb-4" style={{ color: T.onSurface }}>Détails Chambre</h2>
                        
                        {!selectedRoomDetails ? (
                            <div className="text-center py-10 opacity-50">
                                <BedDouble className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                <p className="text-sm font-medium">Sélectionnez une chambre pour voir ses détails.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {selectedRoomDetails.images?.[0] && (
                                    <div className="w-full h-32 rounded-xl overflow-hidden mb-4">
                                        <img src={getImageUrl(selectedRoomDetails.images[0].image_path)} alt="Room" className="w-full h-full object-cover" />
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

                                <div className="pt-4 border-t border-slate-100 mt-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 5 Dernières Réservations
                                    </p>
                                    
                                    {selectedRoomDetails.reservations?.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedRoomDetails.reservations.slice(0, 5).map(res => (
                                                <div key={res.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-slate-700">{res.client?.prenom} {res.client?.nom}</span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${res.status === 'confirmed' ? 'bg-green-100 text-green-700' : res.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                                                            {res.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-slate-500">
                                                        Le {new Date(res.reservation_date).toLocaleDateString()}
                                                        <br/>
                                                        {res.start_time.slice(0,5)} à {res.end_time.slice(0,5)}
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
