import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail } from 'lucide-react';

const Contact = () => {
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(t('message_sent'));
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-800">{t('contact_us_title')}</h1>
        <div className="w-24 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t('contact_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start">
            <div className="bg-amber-50 p-3 rounded-lg mr-4">
              <MapPin className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">{t('our_address')}</h3>
              <p className="text-gray-600 whitespace-pre-line">{t('address_value')}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start">
            <div className="bg-amber-50 p-3 rounded-lg mr-4">
              <Phone className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">{t('phone')}</h3>
              <p className="text-gray-600">+237 673 44 56 82</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start">
            <div className="bg-amber-50 p-3 rounded-lg mr-4">
              <Mail className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">{t('email')}</h3>
              <p className="text-gray-600">contact@motelbethuli.com<br/>reservation@motelbethuli.com</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">{t('send_us_message')}</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{t('full_name')}</label>
                <input
                  type="text"
                  id="name"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3 border"
                  placeholder={t('full_name_placeholder')}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('email_address')}</label>
                <input
                  type="email"
                  id="email"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3 border"
                  placeholder={t('email_placeholder')}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">{t('subject')}</label>
              <input
                type="text"
                id="subject"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3 border"
                placeholder={t('subject_placeholder')}
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">{t('message')}</label>
              <textarea
                id="message"
                rows={5}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3 border"
                placeholder={t('message_placeholder')}
                required
              ></textarea>
            </div>
            <div>
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 bg-amber-500 text-white font-semibold rounded-md shadow-md hover:bg-amber-600 transition-colors"
              >
                {t('send_message')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
