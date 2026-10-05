import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shirt, Scissors, CheckCircle } from 'lucide-react';
import aboutImg from '../../assets/about.png';

const About = () => {
  const { t } = useTranslation();

  const features = [
    t('feature_ac'),
    t('feature_security'),
    t('feature_room_service'),
    t('feature_wifi'),
  ];

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Intro Section */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-4">{t('about_us_title')}</h1>
          <div className="w-16 h-1 bg-amber-500 mb-6 rounded-full"></div>
          <p className="text-lg text-gray-600 mb-6">{t('about_intro1')}</p>
          <p className="text-lg text-gray-600 mb-8">{t('about_intro2')}</p>

          <ul className="space-y-4">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-amber-500 mr-3" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 lg:mt-0">
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
          <img
              src={aboutImg}
              alt="Motel Bethuli — Chambre de luxe"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="mt-24 bg-slate-50 rounded-2xl p-8 md:p-12 border border-gray-100">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800">{t('our_values')}</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
              <span className="text-2xl">🌟</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t('value_excellence')}</h3>
            <p className="text-gray-600">{t('value_excellence_desc')}</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t('value_hospitality')}</h3>
            <p className="text-gray-600">{t('value_hospitality_desc')}</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t('value_integrity')}</h3>
            <p className="text-gray-600">{t('value_integrity_desc')}</p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800">{t('services')}</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">{t('services_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Laundry */}
          <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="md:w-1/3 bg-amber-50 flex items-center justify-center p-8">
              <Shirt className="h-16 w-16 text-amber-500" />
            </div>
            <div className="p-8 md:w-2/3">
              <h3 className="text-2xl font-bold text-slate-800 mb-3">{t('laundry')}</h3>
              <p className="text-gray-600">{t('laundry_detail')}</p>
            </div>
          </div>

          {/* Hair Salon */}
          <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="md:w-1/3 bg-amber-50 flex items-center justify-center p-8">
              <Scissors className="h-16 w-16 text-amber-500" />
            </div>
            <div className="p-8 md:w-2/3">
              <h3 className="text-2xl font-bold text-slate-800 mb-3">{t('salon')}</h3>
              <p className="text-gray-600">{t('salon_detail')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
