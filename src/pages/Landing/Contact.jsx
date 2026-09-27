import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Message envoyé avec succès !');
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-800">{t('contact_us_title')}</h1>
        <div className="w-24 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Notre équipe est à votre disposition 24h/24 et 7j/7 pour répondre à toutes vos questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start">
            <div className="bg-amber-50 p-3 rounded-lg mr-4">
              <MapPin className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Notre Adresse</h3>
              <p className="text-gray-600">123 Avenue de l'Hôtel<br/>Quartier Résidentiel, Ville</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start">
            <div className="bg-amber-50 p-3 rounded-lg mr-4">
              <Phone className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Téléphone</h3>
              <p className="text-gray-600">+237 600 000 000<br/>+237 222 000 000</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start">
            <div className="bg-amber-50 p-3 rounded-lg mr-4">
              <Mail className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Email</h3>
              <p className="text-gray-600">contact@motelbethuli.com<br/>reservation@motelbethuli.com</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Envoyez-nous un message</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3 border" 
                  placeholder="Votre nom"
                  required 
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Adresse Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3 border" 
                  placeholder="votre@email.com"
                  required 
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
              <input 
                type="text" 
                id="subject" 
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3 border" 
                placeholder="Sujet de votre message"
                required 
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                id="message" 
                rows={5} 
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3 border" 
                placeholder="Comment pouvons-nous vous aider ?"
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
