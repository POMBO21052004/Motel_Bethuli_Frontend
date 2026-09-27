import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BedDouble, Users, Search, Loader2, ChevronRight, SlidersHorizontal } from 'lucide-react';
import roomService from '../../services/roomService';
import { RoomModel } from '../../models/RoomModel';
import { getImageUrl } from '../../utils/getImageUrl';
import RoomCard from '../../components/admin/room/RoomCard';

const Rooms = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params = { per_page: 9, page: currentPage };
      if (capacityFilter) params.capacity = capacityFilter;
      const response = await roomService.publicIndex(params);
      const pagData = response.data.pagination;
      setRooms(pagData?.data || response.data.data || []);
      setLastPage(pagData?.last_page || 1);
    } catch (err) {
      console.error('Erreur chargement chambres:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, capacityFilter]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Filtrage côté client sur searchTerm (le reste est filtré en backend)
  const filtered = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.description_fr || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800">{t('rooms')}</h1>
        <div className="w-16 h-1 bg-amber-500 mt-2 rounded-full"></div>
        <p className="mt-3 text-base text-slate-500 max-w-2xl">
          Explorez nos chambres disponibles et réservez celle qui correspond à vos besoins.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une chambre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={capacityFilter}
            onChange={e => { setCapacityFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer transition-all"
          >
            <option value="">Toutes capacités</option>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <option key={n} value={n}>{n} personne{n > 1 ? 's' : ''} min.</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
          <p className="text-sm font-medium text-slate-400">Chargement des chambres...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BedDouble className="w-10 h-10 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Aucune chambre disponible</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {searchTerm || capacityFilter
              ? 'Aucune chambre ne correspond à vos critères. Essayez de modifier vos filtres.'
              : 'Il n\'y a aucune chambre disponible pour le moment. Revenez bientôt !'}
          </p>
          {(searchTerm || capacityFilter) && (
            <button
              onClick={() => { setSearchTerm(''); setCapacityFilter(''); }}
              className="mt-6 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(room => (
                <RoomCard key={room.id} room={room} isAdmin={false} />
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Précédent
              </button>
              <span className="text-sm text-slate-500 font-medium">
                Page {currentPage} / {lastPage}
              </span>
              <button
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Rooms;

