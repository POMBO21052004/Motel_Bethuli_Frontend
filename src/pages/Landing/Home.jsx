import React, { useEffect, useState } from 'react';
import HeroSection from '../../components/layout/HeroSection';
import TestimonialSlider from '../../components/ui/TestimonialSlider';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Map, Clock, Sparkles, Users, BedDouble, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import roomService from '../../services/roomService';
import { RoomModel } from '../../models/RoomModel';
import { getImageUrl } from '../../utils/getImageUrl';
import RoomCard from '../../components/admin/room/RoomCard';
import slide1 from '../../assets/slides/slide1.png';

const Home = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedRooms = async () => {
      try {
        const response = await roomService.publicIndex({ limit: 3 });
        setRooms(response.data.data || []);
      } catch (err) {
        console.error('Erreur chargement chambres:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedRooms();
  }, []);

  return (
    <>
      <HeroSection />
      
      {/* Featured Rooms */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            {t('featured_rooms')}
          </h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-base text-gray-500 max-w-xl mx-auto">
            {t('featured_rooms_subtitle')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <BedDouble className="w-12 h-12 mx-auto text-amber-400 mb-4" />
            <p className="text-slate-500 font-medium">{t('no_rooms')}</p>
            <p className="text-sm text-slate-400 mt-1">{t('no_rooms_subtitle')}</p>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} isAdmin={false} />
            ))}
          </div>
        )}

        {/* View all rooms */}
        {rooms.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-7 py-3 border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl font-bold text-sm transition-all"
            >
              {t('view_all_rooms')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-800 sm:text-4xl">
              {t('why_choose_us')}
            </h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {t('why_desc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 mb-6">
                <Sparkles className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{t('comfort')}</h3>
              <p className="text-gray-600">{t('comfort_desc')}</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 mb-6">
                <Map className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{t('location')}</h3>
              <p className="text-gray-600">{t('location_desc')}</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 mb-6">
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{t('support')}</h3>
              <p className="text-gray-600">{t('support_desc')}</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 mb-6">
                <ShieldCheck className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Sécurité Optimale</h3>
              <p className="text-gray-600">Surveillance 24/7 et accès sécurisé pour votre tranquillité d'esprit.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action (CTA) */}
      <div className="relative bg-slate-800 py-16">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={slide1}
            alt="Motel Bethuli ambiance"
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4">
            {t('cta_title')}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('cta_desc')}
          </p>
          <Link 
            to="/rooms" 
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-md text-slate-900 bg-amber-500 hover:bg-amber-400 transition-colors shadow-lg"
          >
            {t('book_now')}
          </Link>
        </div>
      </div>

      {/* Testimonials Section */}
      <TestimonialSlider />
    </>
  );
};

export default Home;


