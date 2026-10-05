import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import slide1 from '../../assets/slides/slide1.png';
import slide2 from '../../assets/slides/slide2.png';
import slide3 from '../../assets/slides/slide3.png';
import slide4 from '../../assets/slides/slide4.png';
import slide5 from '../../assets/slides/slide5.png';

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const slides = [
    { image: slide1, title: t('slide1_title'), titleHighlight: t('slide1_highlight'), subtitle: t('slide1_subtitle') },
    { image: slide2, title: t('slide2_title'), titleHighlight: t('slide2_highlight'), subtitle: t('slide2_subtitle') },
    { image: slide3, title: t('slide3_title'), titleHighlight: t('slide3_highlight'), subtitle: t('slide3_subtitle') },
    { image: slide4, title: t('slide4_title'), titleHighlight: t('slide4_highlight'), subtitle: t('slide4_subtitle') },
    { image: slide5, title: t('slide5_title'), titleHighlight: t('slide5_highlight'), subtitle: t('slide5_subtitle') },
  ];
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: ''
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
    navigate(`/rooms?start_date=${searchParams.startDate}&end_date=${searchParams.endDate}`);
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
          className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-2 flex flex-col md:flex-row items-stretch gap-2 transition-colors duration-300"
        >
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors duration-300">
            <Calendar className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="flex flex-col w-full text-left">
              <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">{t('arrival')}</span>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="bg-transparent border-none focus:outline-none text-slate-800 dark:text-white font-semibold text-sm w-full p-0 [color-scheme:light] dark:[color-scheme:dark]"
                value={searchParams.startDate}
                onChange={(e) => setSearchParams({...searchParams, startDate: e.target.value})}
              />
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors duration-300">
            <Calendar className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="flex flex-col w-full text-left">
              <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">{t('departure')}</span>
              <input
                type="date"
                required
                min={searchParams.startDate || new Date().toISOString().split('T')[0]}
                className="bg-transparent border-none focus:outline-none text-slate-800 dark:text-white font-semibold text-sm w-full p-0 [color-scheme:light] dark:[color-scheme:dark]"
                value={searchParams.endDate}
                onChange={(e) => setSearchParams({...searchParams, endDate: e.target.value})}
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
