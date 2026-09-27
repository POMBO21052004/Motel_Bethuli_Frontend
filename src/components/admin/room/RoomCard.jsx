import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, BedDouble, Users, MapPin, ArrowRight } from 'lucide-react';
import { RoomModel } from '../../../models/RoomModel';
import { getImageUrl } from '../../../utils/getImageUrl';

const STATUS_CONFIG = {
    available:   { label: 'Disponible',   cls: 'bg-green-500/90 text-white' },
    occupied:    { label: 'Occupée',       cls: 'bg-red-500/90 text-white' },
    maintenance: { label: 'Maintenance',   cls: 'bg-amber-500/90 text-white' },
};

export default function RoomCard({ room, onDelete, isAdmin = true }) {
    const navigate = useNavigate();
    const imageUrl = room.primary_image 
        ? getImageUrl(room.primary_image.image_path)
        : 'https://placehold.co/600x400/f8fafc/94a3b8?text=Pas+d%27image';

    const status = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;

    const handleNavigate = () => {
        if (!isAdmin) navigate(`/rooms/${room.id}`);
    };

    return (
        <div 
            onClick={handleNavigate}
            className={`group bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-slate-200 transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full ${!isAdmin ? 'cursor-pointer' : ''}`}
        >
            {/* Image zone */}
            <div className="relative h-56 shrink-0 overflow-hidden bg-slate-100">
                <img 
                    src={imageUrl} 
                    alt={room.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                {/* TOP LEFT — Étage badge */}
                <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md bg-white/90 text-amber-600">
                        {room.floor === 0 ? 'RDC' : `Étage ${room.floor}`}
                    </span>
                </div>

                {/* TOP RIGHT — Prix */}
                <div className="absolute top-2 right-2">
                    <div className="flex items-baseline gap-0.5 bg-amber-500 text-white px-2.5 py-1 rounded-t-lg rounded-br-lg rounded-bl-sm shadow-sm">
                        <span className="text-[13px] font-black">{parseFloat(room.price_per_day).toLocaleString('fr-FR')}</span>
                        <span className="text-[9px] font-bold opacity-80">FCFA</span>
                    </div>
                </div>

                {/* BOTTOM RIGHT — Statut (admin seulement) */}
                {isAdmin && (
                    <div className="absolute bottom-3 right-3">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm ${status.cls}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                            {status.label}
                        </span>
                    </div>
                )}

                {/* Gradient overlay at bottom for readability */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            </div>
            
            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <h4 className="text-base font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-amber-500 transition-colors mb-1">
                    {room.name}
                </h4>

                <p className="text-amber-500 text-xs font-bold flex items-center gap-0.5 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    Motel Bethuli
                </p>

                <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-3 font-medium flex-1">
                    {room.description_fr || 'Une chambre confortable au Motel Bethuli.'}
                </p>
                
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-slate-50">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        <Users className="w-3 h-3" /> {room.capacity} Pers.
                    </span>
                    
                    {isAdmin ? (
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <Link 
                                to={`/admin/rooms/${room.id}`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                                title="Voir les détails"
                            >
                                <ArrowRight size={16} />
                            </Link>
                            <Link 
                                to={`/admin/rooms/${room.id}/edit`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                title="Modifier"
                            >
                                <Edit size={16} />
                            </Link>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(room.id); }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Supprimer"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="font-black text-xs flex items-center gap-1 group/btn text-amber-500">
                           Voir la chambre 
                           <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
