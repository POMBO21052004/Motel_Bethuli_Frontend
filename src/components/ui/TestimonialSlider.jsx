import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Marie Dubois",
    role: "Voyageuse d'affaires",
    content: "Un séjour exceptionnel. La chambre était d'une propreté impeccable et le service de blanchisserie m'a sauvé la mise pour ma réunion !",
    rating: 5,
  },
  {
    id: 2,
    name: "Jean-Paul Kamdem",
    role: "Touriste",
    content: "Le personnel est incroyablement chaleureux. J'ai adoré le salon de coiffure sur place, c'est un vrai plus pour se détendre.",
    rating: 5,
  },
  {
    id: 3,
    name: "Sophie et Marc",
    role: "En couple",
    content: "Le cadre est paisible et les chambres très confortables. Le rapport qualité-prix est tout simplement imbattable. Nous reviendrons !",
    rating: 4,
  },
  {
    id: 4,
    name: "Alain T.",
    role: "Client régulier",
    content: "C'est mon hôtel préféré lors de mes passages en ville. L'emplacement est parfait et le calme qui y règne permet de vraiment se ressourcer.",
    rating: 5,
  },
  {
    id: 5,
    name: "Claire Ndjeng",
    role: "Vacancière",
    content: "J'ai été bluffée par la qualité de la literie ! Et le personnel à l'accueil m'a beaucoup aidée à organiser mes déplacements.",
    rating: 5,
  },
  {
    id: 6,
    name: "Patrick L.",
    role: "Voyageur de passage",
    content: "Service impeccable 24/7. Arrivé très tard dans la nuit, j'ai été accueilli avec le sourire et ma chambre était prête. Super !",
    rating: 4,
  }
];

const TestimonialSlider = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setVisibleCards(3);
      else if (window.innerWidth >= 768) setVisibleCards(2);
      else setVisibleCards(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = testimonials.length - visibleCards;

  // Auto-scroll every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= maxIndex ? 0 : prevIndex + 1
      );
    }, 15000); // 15 seconds

    return () => clearInterval(timer);
  }, [maxIndex]);

  return (
    <div className="bg-white py-16 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-800">{t('testimonials')}</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="relative w-full mx-auto">
          {/* Slider Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-in-out" 
              style={{ transform: `translateX(-${currentIndex * (100 / visibleCards)}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4">
                  <div className="bg-slate-50 rounded-2xl p-6 relative shadow-sm border border-gray-100 h-full flex flex-col justify-between">
                    <Quote className="absolute top-4 left-4 text-amber-200 h-10 w-10 opacity-50" />
                    <div className="relative z-10 pt-4 flex-grow flex flex-col">
                      <div className="flex justify-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < testimonial.rating ? 'text-amber-500 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-base text-gray-700 text-center italic font-light mb-6 flex-grow">
                        "{testimonial.content}"
                      </p>
                      <div className="text-center">
                        <div className="font-bold text-slate-800 text-base">{testimonial.name}</div>
                        <div className="text-amber-500 text-xs font-medium uppercase tracking-wide mt-1">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center mt-8 space-x-3">
            {[...Array(maxIndex + 1)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-3 w-3 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-amber-500' : 'bg-gray-300 hover:bg-amber-300'
                }`}
                aria-label={`Aller à la page ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlider;
