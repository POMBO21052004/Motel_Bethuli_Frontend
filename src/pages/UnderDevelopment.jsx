import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, ArrowLeft, Construction, Rocket, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UnderDevelopment = ({ title = "Page" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Rediriger vers le bon dashboard selon le rôle
  const getDashboard = () => {
    switch (user?.role) {
      case 'admin': return '/admin/dashboard';
      case 'receptionniste': return '/reception/dashboard';
      case 'client': return '/client/dashboard';
      default: return '/';
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative mb-8">
        {/* Cercle d'ambiance dorée */}
        <div className="absolute inset-0 -m-6 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 rounded-full blur-2xl animate-pulse" />

        {/* Icône principale */}
        <div className="relative w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-center text-amber-500">
          <Wrench className="animate-bounce" size={40} />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-lg">
            <Sparkles size={16} className="animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-500/25">
          <Construction size={12} />
          En Construction
        </span>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
          {title}
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
          Cette fonctionnalité est en cours de développement. Notre équipe travaille activement pour vous offrir la meilleure expérience possible. Revenez bientôt !
        </p>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate(getDashboard())}
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all active:scale-95 shrink-0"
        >
          <Rocket size={14} />
          Tableau de bord
        </button>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black uppercase tracking-widest text-[10px] hover:-translate-y-0.5 transition-all active:scale-95 shrink-0"
        >
          <ArrowLeft size={14} />
          Retour
        </button>
      </div>
    </div>
  );
};

export default UnderDevelopment;
