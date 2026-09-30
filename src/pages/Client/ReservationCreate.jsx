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

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
};

export default function ClientReservationCreate() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedRoomId = searchParams.get('room_id') || '';

    const { user } = useAuth();
    const { profile, loading: profileLoading } = useClientProfile();
    
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    
    const [formData, setFormData] = useState({
        room_id: preselectedRoomId,
        reservation_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        start_time: '12:00',
        end_time: '12:00',
        total_price: 0,
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successRes, setSuccessRes] = useState(null);

    useEffect(() => {
        roomService.publicIndex({ per_page: 100 })
            .then(res => setRooms(res.data.pagination?.data || []))
            .catch(() => setError("Impossible de charger les chambres."))
            .finally(() => setLoadingRooms(false));
    }, []);

    const selectedRoom = rooms.find(r => r.id === formData.room_id);

    // Mettre à jour le prix total basé sur la chambre sélectionnée (basique)
    useEffect(() => {
        if (selectedRoom) {
            setFormData(prev => ({ ...prev, total_price: selectedRoom.price_per_day }));
        } else {
            setFormData(prev => ({ ...prev, total_price: 0 }));
        }
    }, [selectedRoom]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-black italic tracking-tight" style={{ color: T.onSurface }}>Nouvelle Réservation</h1>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-amber-200 shadow-xl text-center">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black text-amber-800 mb-2">Vérification requise</h2>
                    <p className="text-amber-700 font-medium max-w-md mx-auto mb-8">
                        Pour des raisons de sécurité, votre identité doit être vérifiée avant de pouvoir effectuer une réservation. Veuillez soumettre votre Carte Nationale d'Identité.
                    </p>
                    <Link to="/client/profile" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-black hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200">
                        Aller à mon profil
                    </Link>
                </div>
            </div>
        );
    }

    if (successRes) {
        return (
            <div className="max-w-xl mx-auto py-10 animate-in zoom-in-95">
                <div className="bg-white rounded-3xl p-10 text-center shadow-2xl border border-slate-100">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-3">Réservation reçue !</h3>
                    <p className="text-slate-500 mb-8">Votre demande est <strong className="text-amber-500">en attente</strong>. Pour valider rapidement votre séjour, veuillez contacter notre support sur WhatsApp.</p>
                    <div className="space-y-4">
                        <button 
                            onClick={() => {
                                const text = encodeURIComponent(`Bonjour, je viens d'effectuer une réservation pour la chambre "${successRes.room?.name}" du ${successRes.reservation_date}. Pouvez-vous confirmer ?`);
                                window.open(`https://wa.me/237600000000?text=${text}`, '_blank');
                            }}
                            className="w-full py-4 rounded-xl bg-[#25D366] text-white font-black hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30"
                        >
                            <MessageCircle className="w-6 h-6" /> Contacter le support sur WhatsApp
                        </button>
                        <button onClick={() => navigate('/client/reservations')} className="w-full py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                            Voir mes réservations
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors" style={{ color: T.onSurface }}>
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tight" style={{ color: T.onSurface }}>Nouvelle Réservation</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: T.primary }}>Formulaire de création</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-sm">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Form Area */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. Choix de la chambre */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-lg font-bold border-b pb-4 mb-4" style={{ color: T.onSurface, borderColor: `${T.outlineVariant}50` }}>1. Choix de la Chambre</h2>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Sélectionner une chambre</label>
                            <select 
                                name="room_id"
                                value={formData.room_id}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-amber-500 focus:bg-white outline-none transition-all"
                            >
                                <option value="">Choisir une chambre...</option>
                                {rooms.map(r => (
                                    <option key={r.id} value={r.id} disabled={r.is_occupied_now || r.status?.value === 'maintenance'}>
                                        {r.name} {r.is_occupied_now ? '(Occupée)' : r.status?.value === 'maintenance' ? '(En maintenance)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 2. Période & Horaires */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-lg font-bold border-b pb-4" style={{ color: T.onSurface, borderColor: `${T.outlineVariant}50` }}>2. Période & Horaires</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-amber-500" /> Arrivée</h3>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Date</label>
                                    <input 
                                        type="date"
                                        name="reservation_date"
                                        value={formData.reservation_date}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Heure</label>
                                    <input 
                                        type="time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-amber-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-amber-500" /> Départ</h3>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Date</label>
                                    <input 
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                        min={formData.reservation_date}
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Heure</label>
                                    <input 
                                        type="time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-amber-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Notes & Validation */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-lg font-bold border-b pb-4" style={{ color: T.onSurface, borderColor: `${T.outlineVariant}50` }}>3. Notes & Validation</h2>
                        
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Demandes particulières (Optionnel)</label>
                            <textarea 
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Avez-vous des besoins spécifiques pour votre séjour ?"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500 focus:bg-white transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button 
                                type="submit"
                                disabled={isSubmitting || !formData.room_id}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-black text-white shadow-lg shadow-amber-200 disabled:opacity-50 hover:bg-amber-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                                style={{ background: T.primary }}
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                {isSubmitting ? 'Enregistrement...' : 'Confirmer la Réservation'}
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right Sidebar - Room Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-24" style={{ borderColor: `${T.outlineVariant}50` }}>
                        <h2 className="text-lg font-black mb-4" style={{ color: T.onSurface }}>Détails de la Chambre</h2>
                        
                        {!selectedRoom ? (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <BedDouble className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p className="text-sm font-bold text-slate-400">Veuillez sélectionner une chambre.</p>
                            </div>
                        ) : (
                            <div className="space-y-5 animate-in fade-in duration-300">
                                <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100 shadow-sm">
                                    {selectedRoom.primary_image?.image_path ? (
                                        <img src={getImageUrl(selectedRoom.primary_image.image_path)} alt={selectedRoom.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><BedDouble className="w-10 h-10 text-slate-300" /></div>
                                    )}
                                </div>
                                
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Nom</p>
                                    <p className="font-black text-slate-900 text-lg">{selectedRoom.name}</p>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-3">{selectedRoom.description_fr}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Prix par jour</p>
                                        <p className="font-black text-amber-600">{Number(selectedRoom.price_per_day).toLocaleString('fr-FR')} FCFA</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Capacité</p>
                                        <p className="font-black text-slate-700">{selectedRoom.capacity} pers.</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mt-6">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 mb-1">Montant estimé</p>
                                    <p className="text-2xl font-black text-slate-900">{Number(formData.total_price).toLocaleString('fr-FR')} <span className="text-sm text-slate-500">FCFA</span></p>
                                    <p className="text-[10px] font-medium text-slate-500 mt-2 leading-tight">Le montant final pourra être ajusté en fonction de la durée exacte de votre séjour lors de votre arrivée.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </form>
        </div>
    );
}
