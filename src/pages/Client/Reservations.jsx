import React, { useState } from 'react';
import { CalendarDays, Loader2, Star, CheckCircle2, MessageCircle, AlertCircle, X } from 'lucide-react';
import { useClientReservations } from '../../hooks/useClientReservations';
import { ReservationModel, ReservationStatus } from '../../models/ReservationModel';
import ratingService from '../../services/client/ratingService';
import { getImageUrl } from '../../utils/getImageUrl';

export default function ClientReservations() {
    const { reservations, loading, error, fetchReservations } = useClientReservations();
    const [ratingModal, setRatingModal] = useState(null);
    const [ratingForm, setRatingForm] = useState({ rating: 5, comment: '' });
    const [ratingLoading, setRatingLoading] = useState(false);
    const [ratingError, setRatingError] = useState('');
    const [ratingSuccess, setRatingSuccess] = useState('');

    const openWhatsApp = (reservation) => {
        const text = encodeURIComponent(`Bonjour, je vous contacte à propos de ma réservation (En attente) pour la chambre "${reservation.room?.name}" du ${reservation.reservation_date} au ${reservation.end_date}.`);
        window.open(`https://wa.me/237600000000?text=${text}`, '_blank');
    };

    const submitRating = async (e) => {
        e.preventDefault();
        setRatingLoading(true); setRatingError(''); setRatingSuccess('');
        try {
            await ratingService.store({
                reservation_id: ratingModal.id,
                rating: ratingForm.rating,
                comment: ratingForm.comment
            });
            setRatingSuccess('Merci pour votre avis ! Votre note a bien été enregistrée.');
            setTimeout(() => {
                setRatingModal(null);
                setRatingSuccess('');
                fetchReservations(); // refresh
            }, 2000);
        } catch (err) {
            setRatingError(err.response?.data?.message || 'Erreur lors de la soumission de l\'avis.');
        } finally {
            setRatingLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-semibold text-amber-600">Réservations</p>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Mes réservations</h1>
                <p className="mt-1 text-sm text-slate-500">Consultez l'historique et l'état de vos séjours.</p>
            </div>
            
            {error && <div className="rounded-xl bg-red-50 p-4 text-red-700 font-medium text-sm">{error}</div>}
            
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>
            ) : (
                <div className="space-y-4">
                    {reservations.map((item) => (
                        <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 md:flex-row md:items-center shadow-sm overflow-hidden">
                            
                            <div className="flex items-center gap-4 flex-1">
                                {item.room?.primary_image?.image_path ? (
                                    <img src={getImageUrl(item.room.primary_image.image_path)} alt={item.room.name} className="w-20 h-16 rounded-xl object-cover" />
                                ) : (
                                    <div className="w-20 h-16 rounded-xl bg-slate-100 flex items-center justify-center"><CalendarDays className="w-6 h-6 text-slate-300" /></div>
                                )}
                                <div>
                                    <p className="font-bold text-lg text-slate-900">{item.room?.name}</p>
                                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-slate-500 font-medium">
                                        <span>Du {new Date(item.reservation_date).toLocaleDateString('fr-FR')} à {item.start_time?.slice(0,5)}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>Au {new Date(item.end_date || item.reservation_date).toLocaleDateString('fr-FR')} à {item.end_time?.slice(0,5)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between md:justify-center gap-4 md:gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                <div className="text-left md:text-right w-full flex justify-between md:flex-col items-center md:items-end">
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${ReservationModel.getStatusColor(item.status)}`}>
                                        {ReservationModel.getStatusLabel(item.status)}
                                    </span>
                                    <p className="font-black text-lg text-slate-800 md:mt-1">{Number(item.total_price).toLocaleString('fr-FR')} <span className="text-xs text-slate-400">FCFA</span></p>
                                </div>
                                
                                {item.status === ReservationStatus.PENDING && (
                                    <button onClick={() => openWhatsApp(item)} className="w-full text-xs font-bold bg-[#25D366]/10 text-[#25D366] px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#25D366]/20 transition-colors">
                                        <MessageCircle className="w-4 h-4" /> Relancer sur WhatsApp
                                    </button>
                                )}
                                
                                {(item.status === ReservationStatus.CONFIRMED || item.status === ReservationStatus.COMPLETED) && (
                                    <button onClick={() => { setRatingModal(item); setRatingForm({rating: 5, comment: ''}); }} className="w-full group relative overflow-hidden text-xs font-bold bg-amber-50 text-amber-600 px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-amber-500 hover:text-white transition-all shadow-sm">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:fill-white group-hover:text-white transition-all" /> 
                                        Donner mon avis
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {!reservations.length && (
                        <div className="rounded-2xl border border-dashed border-slate-300 py-24 text-center text-slate-500 bg-slate-50">
                            <CalendarDays className="mx-auto mb-3 h-12 w-12 opacity-30 text-slate-400" />
                            <p className="font-bold text-slate-600">Aucune réservation pour le moment.</p>
                            <p className="text-sm mt-1">Vos séjours apparaîtront ici.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de notation */}
            {ratingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500 text-white flex items-center justify-center rounded-xl shadow-md">
                                    <Star className="w-5 h-5 fill-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900">Noter mon séjour</h3>
                                    <p className="text-xs font-bold text-amber-600">{ratingModal.room?.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setRatingModal(null)} className="p-2 bg-white/50 text-slate-500 rounded-full hover:bg-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {ratingSuccess ? (
                                <div className="py-8 flex flex-col items-center justify-center text-center">
                                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                                    <h4 className="text-xl font-black text-slate-900 mb-2">Merci beaucoup !</h4>
                                    <p className="text-slate-500 font-medium text-sm">{ratingSuccess}</p>
                                </div>
                            ) : (
                                <form id="rating-form" onSubmit={submitRating} className="space-y-6">
                                    {ratingError && (
                                        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex gap-3 items-start border border-red-100">
                                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <p className="text-sm font-bold">{ratingError}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-center text-sm font-bold text-slate-700 mb-4">Quelle note donnez-vous à cette chambre ?</label>
                                        <div className="flex justify-center gap-2">
                                            {[1,2,3,4,5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRatingForm({...ratingForm, rating: star})}
                                                    className={`p-2 rounded-xl transition-all ${ratingForm.rating >= star ? 'scale-110' : 'opacity-40 hover:opacity-70 hover:scale-105'}`}
                                                >
                                                    <Star className={`w-10 h-10 ${ratingForm.rating >= star ? 'fill-amber-400 text-amber-400 drop-shadow-md' : 'text-slate-400'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2">Laissez un commentaire (Optionnel)</label>
                                        <textarea 
                                            rows="4" 
                                            value={ratingForm.comment} 
                                            onChange={(e) => setRatingForm({...ratingForm, comment: e.target.value})} 
                                            className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm outline-none transition-all resize-none" 
                                            placeholder="Partagez votre expérience avec nous..."
                                        ></textarea>
                                    </div>
                                    <button disabled={ratingLoading} type="submit" className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                        {ratingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Envoyer mon avis'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
