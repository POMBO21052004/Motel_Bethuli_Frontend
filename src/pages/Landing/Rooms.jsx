import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { BedDouble, Users, Search, Loader2, ChevronRight, ChevronLeft, SlidersHorizontal, MapPin, ArrowRight, Wrench } from 'lucide-react';
import roomService from '../../services/roomService';
import { getImageUrl } from '../../utils/getImageUrl';

// ── Room Card ─────────────────────────────────────────────────────────────
function RoomCard({ room }) {
    const { t } = useTranslation();
    const imageUrl = room.primary_image?.image_path
        ? getImageUrl(room.primary_image.image_path)
        : null;
    const isMaintenance = room.status?.value === 'maintenance' || room.status === 'maintenance';

    return (
        <Link
            to={`/rooms/${room.id}`}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
        >
            <div className="relative h-44 shrink-0 overflow-hidden bg-slate-100">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={room.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BedDouble className="w-12 h-12 text-slate-300" />
                    </div>
                )}
                <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md bg-white/90 text-amber-600">
                        {room.floor === 0 ? 'RDC' : `Étage ${room.floor}`}
                    </span>
                </div>
                <div className="absolute top-2 right-2">
                    <div className="flex items-baseline gap-0.5 bg-amber-500 text-white px-2.5 py-1 rounded-t-lg rounded-br-lg rounded-bl-sm shadow-sm">
                        <span className="text-[13px] font-black">{Number(room.price_per_day).toLocaleString('fr-FR')}</span>
                        <span className="text-[9px] font-bold opacity-80">FCFA</span>
                    </div>
                </div>
                <div className="absolute bottom-3 left-3">
                    {isMaintenance ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-800/90 text-white backdrop-blur-md shadow-sm">
                            <Wrench className="w-3 h-3" /> {t('room_maintenance')}
                        </span>
                    ) : room.is_occupied_now ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/90 text-white backdrop-blur-md shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {t('room_occupied')}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" /> {t('room_available')}
                        </span>
                    )}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
            <div className="p-4 flex flex-col flex-1">
                <h4 className="text-base font-bold text-slate-900 leading-tight line-clamp-1 group-hover:text-amber-500 transition-colors mb-1">
                    {room.name}
                </h4>
                <p className="text-amber-500 text-xs font-bold flex items-center gap-0.5 mb-2">
                    <MapPin className="w-3.5 h-3.5" /> Motel Bethuli
                </p>
                <p className="text-slate-500 text-[12px] leading-relaxed line-clamp-2 flex-1">
                    {room.description_fr || 'Une chambre confortable au Motel Bethuli.'}
                </p>
                <div className="mt-3 pt-3 flex justify-between items-center border-t border-slate-50">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        <Users className="w-3 h-3" /> {room.capacity} Pers.
                    </span>
                    <span className="text-xs font-black text-amber-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                        {t('book_room')} <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>
            </div>
        </Link>
    );
}

// ── Floor Section ─────────────────────────────────────────────────────────────
function FloorSection({ floor, rooms }) {
    const { t } = useTranslation();
    const label = floor === 0 ? t('ground_floor') : `${t('floor')} ${floor}`;
    const roomWord = rooms.length > 1 ? t('rooms_count') : t('room');
    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                    <span className="text-xs font-black text-amber-600">{floor}</span>
                </div>
                <h2 className="text-base font-black text-slate-800">{label}</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">{rooms.length} {roomWord}</span>
                <div className="flex-1 h-px bg-slate-100"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {rooms.map(room => <RoomCard key={room.id} room={room} />)}
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Rooms() {
    const { t } = useTranslation();
    const location = useLocation();
    
    const [rooms, setRooms]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [searchTerm, setSearchTerm]     = useState('');
    const [currentPage, setCurrentPage]   = useState(1);
    const [lastPage, setLastPage]         = useState(1);
    
    const [formFilters, setFormFilters] = useState({
        start_date: '',
        end_date: '',
        capacity: '',
        max_price: '',
        floor: ''
    });

    const [activeFilters, setActiveFilters] = useState({});

    // Parse URL parameters on initial mount
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const startDate = queryParams.get('start_date') || '';
        const endDate = queryParams.get('end_date') || '';
        
        if (startDate || endDate) {
            const initialFilters = {
                ...formFilters,
                start_date: startDate,
                end_date: endDate
            };
            setFormFilters(initialFilters);
            setActiveFilters(initialFilters);
        }
    }, [location.search]);

    const fetchRooms = useCallback(async () => {
        setLoading(true);
        try {
            const params = { per_page: 50, page: currentPage, ...activeFilters };
            
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await roomService.publicIndex(params);
            const pagData = response.data.pagination;
            setRooms(pagData?.data || response.data.data || []);
            setLastPage(pagData?.last_page || 1);
        } catch (err) {
            console.error('Erreur chargement chambres:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, activeFilters]);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setActiveFilters(formFilters);
            setCurrentPage(1);
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [formFilters]);

    const getNextDay = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormFilters(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'start_date' && value) {
                const minEnd = getNextDay(value);
                if (!next.end_date || next.end_date <= value) {
                    next.end_date = minEnd;
                }
            }
            return next;
        });
    };

    const filtered = rooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.description_fr || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Grouper par étage
    const grouped = filtered.reduce((acc, room) => {
        const f = room.floor ?? 0;
        if (!acc[f]) acc[f] = [];
        acc[f].push(room);
        return acc;
    }, {});
    const sortedFloors = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full animate-in fade-in">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-serif font-extrabold text-slate-800">{t('rooms')}</h1>
                <div className="w-16 h-1 bg-amber-500 rounded-full mt-2 mb-3"></div>
                <p className="text-base text-slate-500 max-w-2xl">Explorez nos chambres disponibles et réservez celle qui correspond à vos besoins.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar */}
                <div className="w-full lg:w-1/4 shrink-0">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm sticky top-24">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <SlidersHorizontal className="w-5 h-5 text-amber-500" />
                            Filtres
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Date d'arrivée</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formFilters.start_date}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Date de départ</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    min={formFilters.start_date ? getNextDay(formFilters.start_date) : new Date().toISOString().split('T')[0]}
                                    value={formFilters.end_date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Capacité</label>
                                <select
                                    name="capacity"
                                    value={formFilters.capacity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer"
                                >
                                    <option value="">Peu importe</option>
                                    {[1, 2, 3, 4, 5, 6].map(n => (
                                        <option key={n} value={n}>{n} personne{n > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Prix maximum</label>
                                <input
                                    type="number"
                                    name="max_price"
                                    placeholder="Ex: 50000"
                                    value={formFilters.max_price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Étage</label>
                                <select
                                    name="floor"
                                    value={formFilters.floor}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer"
                                >
                                    <option value="">Tous les étages</option>
                                    {[0, 1, 2, 3, 4, 5].map(n => (
                                        <option key={n} value={n}>{n === 0 ? 'RDC' : `Étage ${n}`}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom de chambre..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"
                        />
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
                            <p className="text-sm font-medium text-slate-400">Recherche des meilleures chambres...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
                            <BedDouble className="w-12 h-12 text-amber-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Aucune chambre trouvée</h3>
                            <p className="text-sm text-slate-400 max-w-md mx-auto">
                                Essayez de modifier vos filtres ou vos dates.
                            </p>
                            <button
                                onClick={() => { setSearchTerm(''); setFormFilters({start_date:'', end_date:'', capacity:'', max_price:'', floor:''}); setActiveFilters({}); }}
                                className="mt-5 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors"
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-10 bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                            {sortedFloors.map(floor => (
                                <FloorSection key={floor} floor={floor} rooms={grouped[floor]} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {lastPage > 1 && (
                        <div className="flex justify-center items-center gap-3 pt-4">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" /> Précédent
                            </button>
                            <span className="text-sm text-slate-500 font-medium">Page {currentPage} / {lastPage}</span>
                            <button
                                disabled={currentPage === lastPage}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                Suivant <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
