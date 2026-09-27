import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    title: 'Bienvenue au',
    titleHighlight: 'Motel Bethuli',
    subtitle: 'Votre havre de paix au cœur de la ville. Un confort inégalé vous attend.',
  },
  {
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    title: 'Des Chambres',
    titleHighlight: 'Exceptionnelles',
    subtitle: 'Chaque chambre est conçue pour vous offrir une expérience unique de confort et de luxe.',
  },
  {
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    title: 'Un Service',
    titleHighlight: '5 Étoiles',
    subtitle: 'Notre équipe dévouée est à votre disposition 24h/24 pour répondre à tous vos besoins.',
  },
  {
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    title: 'Réservez Votre',
    titleHighlight: 'Moment de Paix',
    subtitle: 'Profitez de nos offres exclusives et planifiez votre séjour idéal en quelques clics.',
  },
  {
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    title: 'Vivez Une',
    titleHighlight: 'Expérience Unique',
    subtitle: 'Blanchisserie, salon de coiffure, service en chambre — tout est pensé pour vous.',
  },
];

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchParams, setSearchParams] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });

  const goToSlide = (idx) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(idx);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const prevSlide = () => goToSlide(current === 0 ? slides.length - 1 : current - 1);
  const nextSlide = () => goToSlide(current === slides.length - 1 ? 0 : current + 1);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/rooms?date=${searchParams.date}&start=${searchParams.startTime}&end=${searchParams.endTime}`);
  };

  return (
    <div className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      
      {/* Background Slides */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/55" />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 z-30 p-2 rounded-full bg-white/10 hover:bg-white/25 border border-white/30 text-white transition-all backdrop-blur-sm"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 z-30 p-2 rounded-full bg-white/10 hover:bg-white/25 border border-white/30 text-white transition-all backdrop-blur-sm"
        aria-label="Slide suivant"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Animated Title */}
        <div className="mb-8 min-h-[120px] sm:min-h-[160px] flex flex-col items-center justify-center">
          <h1
            key={current}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl leading-tight drop-shadow-2xl"
            style={{ animation: 'fadeSlideUp 0.8s ease-out' }}
          >
            {slides[current].title}{' '}
            <span className="text-amber-400">{slides[current].titleHighlight}</span>
          </h1>
          <p
            key={`sub-${current}`}
            className="mt-4 text-lg sm:text-xl text-gray-200 max-w-2xl"
            style={{ animation: 'fadeSlideUp 1s ease-out 0.2s both' }}
          >
            {slides[current].subtitle}
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-2 flex flex-col md:flex-row items-stretch gap-2"
        >
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="flex flex-col w-full text-left">
              <span className="text-xs text-gray-400 uppercase font-semibold">Date</span>
              <input
                type="date"
                required
                className="bg-transparent border-none focus:outline-none text-slate-800 font-semibold text-sm w-full p-0"
                value={searchParams.date}
                onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
              />
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
            <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="flex flex-col w-full text-left">
              <span className="text-xs text-gray-400 uppercase font-semibold">{t('start_time')}</span>
              <input
                type="time"
                className="bg-transparent border-none focus:outline-none text-slate-800 font-semibold text-sm w-full p-0"
                value={searchParams.startTime}
                onChange={(e) => setSearchParams({...searchParams, startTime: e.target.value})}
              />
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
            <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="flex flex-col w-full text-left">
              <span className="text-xs text-gray-400 uppercase font-semibold">{t('end_time')}</span>
              <input
                type="time"
                className="bg-transparent border-none focus:outline-none text-slate-800 font-semibold text-sm w-full p-0"
                value={searchParams.endTime}
                onChange={(e) => setSearchParams({...searchParams, endTime: e.target.value})}
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-lg transition-colors shadow-md whitespace-nowrap"
          >
            <Search className="h-5 w-5" />
            {t('search')}
          </button>
        </form>

        {/* Slide Indicators */}
        <div className="flex gap-3 mt-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === current ? 'bg-amber-400 w-8' : 'bg-white/50 hover:bg-white/80 w-2'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
