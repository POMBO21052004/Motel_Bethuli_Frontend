import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
    Calendar, Clock, CheckCircle, BedDouble, AlertTriangle, 
    ArrowLeft, Loader2, MessageCircle 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useClientProfile } from '../../hooks/useClientProfile';
import roomService from '../../services/roomService';
import reservationService from '../../services/client/reservationService';
import { getImageUrl } from '../../utils/getImageUrl.jsx';

export default function ClientReservationCreate() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedRoomId = searchParams.get('room_id') || '';

    const { user } = useAuth();
    const { profile, loading: profileLoading } = useClientProfile();
    
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultEnd = (() => {
        const d = new Date(todayStr);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    })();

    const [formData, setFormData] = useState({
        room_id: preselectedRoomId,
        reservation_date: todayStr,
        end_date: defaultEnd,
        start_time: '12:00',
        end_time: '12:00',
        total_price: 0,
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successRes, setSuccessRes] = useState(null);
    const [availMsg, setAvailMsg] = useState(null); // { type: 'checking'|'success'|'error', text, price, days }

    useEffect(() => {
        roomService.publicIndex({ per_page: 100 })
            .then(res => setRooms(res.data.pagination?.data || []))
            .catch(() => setError("Impossible de charger les chambres."))
            .finally(() => setLoadingRooms(false));
    }, []);

    const selectedRoom = rooms.find(r => r.id === formData.room_id);

    // Calculate nights for display
    const nights = (() => {
        const start = new Date(formData.reservation_date);
        const end = new Date(formData.end_date);
        const diff = Math.ceil((end - start) / 86400000);
        return diff <= 0 ? 1 : diff;
    })();

    // Availability check: debounced, triggered when room/dates change
    useEffect(() => {
        if (!formData.room_id || !formData.reservation_date || !formData.end_date) {
            setAvailMsg(null);
            return;
        }
        if (formData.end_date < formData.reservation_date) {
            setAvailMsg({ type: 'error', text: 'La date de départ doit être après la date d\'arrivée.' });
            return;
        }

        setAvailMsg({ type: 'checking', text: 'Vérification de la disponibilité...' });
        let cancelled = false;

        const timer = setTimeout(async () => {
            try {
                const res = await reservationService.checkAvailability({
                    room_id: formData.room_id,
                    reservation_date: formData.reservation_date,
                    end_date: formData.end_date,
                });
                if (cancelled) return;
                const data = res.data;
                if (data.available) {
                    setAvailMsg({ type: 'success', text: data.message, price: data.price, days: data.days });
                } else {
                    setAvailMsg({ type: 'error', text: data.message });
                }
            } catch {
                if (!cancelled) setAvailMsg(null);
            }
        }, 600);

        return () => { cancelled = true; clearTimeout(timer); };
    }, [formData.room_id, formData.reservation_date, formData.end_date]);

    const getNextDay = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'reservation_date') {
                const minEnd = getNextDay(value);
                if (next.end_date <= value) {
                    next.end_date = minEnd;
                }
            }
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (availMsg?.type === 'error' || availMsg?.type === 'checking') return;
        setError(null);
        setIsSubmitting(true);
        try {
            const res = await reservationService.store(formData);
            setSuccessRes(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la réservation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const cniVerified = profile?.customer_profile?.cni_verified;

    if (profileLoading || loadingRooms) {
        return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
    }

    if (!cniVerified && !successRes) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
                <div className="mb-6">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </button>
                    <h1 className="text-3xl font-serif font-extrabold text-slate-800">Nouvelle Réservation</h1>
                    <div className="w-16 h-1 bg-amber-500 rounded-full mt-2"></div>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-amber-800 mb-2">Vérification requise</h2>
                    <p className="text-amber-700 text-sm mb-6">
                        Pour des raisons de sécurité, votre identité doit être vérifiée avant de pouvoir effectuer une réservation. Veuillez soumettre votre Carte Nationale d'Identité.
                    </p>
                    <Link to="/client/profile" className="inline-block w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-base shadow-md transition-colors">
                        Aller à mon profil
                    </Link>
                </div>
            </div>
        );
    }

    if (successRes) {
        return (
            <div className="max-w-xl mx-auto py-10 animate-in zoom-in-95">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-serif font-extrabold text-slate-800 mb-3">Réservation reçue !</h3>
                    <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md text-sm mb-8 inline-block">
                        Votre demande est en attente.
                    </div>
                    <p className="text-slate-600 mb-8">Pour valider rapidement votre séjour, veuillez contacter notre support sur WhatsApp.</p>
                    <div className="space-y-4">
                        <button 
                            onClick={() => {
                                const text = encodeURIComponent(
`Bonjour l'équipe du Motel Bethuli,

Je vous contacte afin d'accélérer le processus de ma demande de réservation.
Voici les détails de ma demande :

*Objet :* Confirmation de réservation
*Hôtel :* Motel Bethuli
*Client :* ${user?.prenom} ${user?.nom}
*Chambre :* ${successRes.room?.name} (Étage : ${successRes.room?.floor === 0 ? 'RDC' : successRes.room?.floor})
*Date d'arrivée :* ${new Date(successRes.reservation_date).toLocaleDateString('fr-FR')}
*Date de départ :* ${new Date(successRes.end_date).toLocaleDateString('fr-FR')}

Merci d'avance pour votre prise en charge rapide !`);
                                window.open(`https://wa.me/237600000000?text=${text}`, '_blank');
                            }}
                            className="w-full px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-base shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" /> Contacter sur WhatsApp pour accélérer
                        </button>
                        <button onClick={() => navigate('/client/reservations')} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors">
                            Voir mes réservations
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div>
                <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <h1 className="text-3xl font-serif font-extrabold text-slate-800">Nouvelle Réservation</h1>
                <div className="w-16 h-1 bg-amber-500 rounded-full mt-2"></div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700 mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Form Area */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. Choix de la chambre */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-3 mb-5">1. Choix de la Chambre</h2>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sélectionner une chambre</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {rooms.map(r => {
                                    const isSelected = r.id === formData.room_id;
                                    const isDisabled = r.is_occupied_now || r.status?.value === 'maintenance';
                                    return (
                                        <div 
                                            key={r.id} 
                                            onClick={() => !isDisabled && setFormData(prev => ({...prev, room_id: r.id}))}
                                            className={`cursor-pointer p-4 transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'bg-white'} rounded-xl border-2 ${isSelected ? 'border-amber-500 bg-amber-50' : 'border-transparent hover:border-amber-400 border-slate-200 shadow-sm'}`}
                                        >
                                            <div className="font-bold text-slate-800 mb-1">{r.name}</div>
                                            <div className="text-sm font-medium text-amber-600">{Number(r.price_per_day).toLocaleString('fr-FR')} FCFA</div>
                                            {r.is_occupied_now && <div className="text-xs text-red-500 mt-2 font-medium">Occupée</div>}
                                            {r.status?.value === 'maintenance' && <div className="text-xs text-red-500 mt-2 font-medium">Maintenance</div>}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 2. Période & Horaires */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-3 mb-5">2. Date du Séjour</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-amber-500" /> Date d'arrivée
                                </label>
                                <input 
                                    type="date"
                                    name="reservation_date"
                                    value={formData.reservation_date}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-500" /> Date de départ
                                </label>
                                <input 
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    min={getNextDay(formData.reservation_date)}
                                    required
                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Notes & Validation */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-3 mb-5">3. Notes & Validation</h2>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Demandes particulières (Optionnel)</label>
                            <textarea 
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Avez-vous des besoins spécifiques pour votre séjour ?"
                                className="block w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                            ></textarea>
                        </div>

                        {/* Availability feedback */}
                        {availMsg && formData.room_id && (
                            <div className={`flex items-start gap-2.5 p-4 rounded-xl text-sm font-medium border mb-5 ${
                                availMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                availMsg.type === 'error'   ? 'bg-red-50 text-red-600 border-red-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {availMsg.type === 'checking' && <Loader2 className="w-4 h-4 animate-spin shrink-0 mt-0.5" />}
                                {availMsg.type === 'success'  && <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                                {availMsg.type === 'error'    && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                                <div>
                                    <p>{availMsg.text}</p>
                                    {availMsg.type === 'success' && availMsg.price && (
                                        <p className="mt-1 font-black text-emerald-800">
                                            {availMsg.days} nuit{availMsg.days > 1 ? 's' : ''} · {Number(availMsg.price).toLocaleString('fr-FR')} FCFA
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button 
                                type="submit"
                                disabled={isSubmitting || !formData.room_id || availMsg?.type === 'error' || availMsg?.type === 'checking'}
                                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-base shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                {isSubmitting ? 'Enregistrement...' : 'Confirmer la Réservation'}
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right Sidebar - Room Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-3 mb-5">Détails de la Chambre</h2>
                        
                        {!selectedRoom ? (
                            <div className="text-center py-10">
                                <BedDouble className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm font-medium text-gray-500">Veuillez sélectionner une chambre pour voir les détails.</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                                    {selectedRoom.primary_image?.image_path ? (
                                        <img src={getImageUrl(selectedRoom.primary_image.image_path)} alt={selectedRoom.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><BedDouble className="w-10 h-10 text-gray-300" /></div>
                                    )}
                                </div>
                                
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-1">{selectedRoom.name}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-3">{selectedRoom.description_fr}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1 font-medium">Prix / Jour</p>
                                        <p className="font-bold text-slate-800">{Number(selectedRoom.price_per_day).toLocaleString('fr-FR')} FCFA</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1 font-medium">Capacité</p>
                                        <p className="font-bold text-slate-800">{selectedRoom.capacity} pers.</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 mt-2">
                                    <p className="block text-sm font-medium text-slate-700 mb-1">Montant estimé</p>
                                    <div className="text-3xl font-extrabold text-slate-800">
                                        {Number(formData.total_price).toLocaleString('fr-FR')}
                                        <span className="text-slate-400 text-base font-normal ml-1">FCFA</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Le montant final pourra être ajusté en fonction de la durée exacte de votre séjour lors de votre arrivée.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </form>
        </div>
    );
}
