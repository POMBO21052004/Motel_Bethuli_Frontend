import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BedDouble, ArrowLeft, AlertTriangle, Key } from 'lucide-react';

const NotFound = () => {
  return (
    <main className="min-h-screen flex items-center justify-center py-20 bg-white overflow-hidden relative font-sans">
      
      {/* Decorative blurred blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-800/10 rounded-full blur-[120px] -z-10 animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="max-w-4xl mx-auto px-4 text-center relative">

        {/* Large 404 Number */}
        <div className="relative inline-block mb-0">
          <h1
            className="text-[10rem] md:text-[16rem] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(to bottom, #f59e0b, #f59e0b22)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </h1>

          {/* Floating bed icon — top left of the number */}
          <div
            className="absolute top-8 -left-6 md:-left-12 text-amber-400/50"
            style={{ animation: 'floatY 4s ease-in-out infinite' }}
          >
            <BedDouble size={48} />
          </div>

          {/* Floating key icon — bottom right of the number */}
          <div
            className="absolute bottom-8 -right-6 md:-right-12 text-slate-400/50"
            style={{ animation: 'floatY 5s ease-in-out infinite', animationDelay: '0.5s' }}
          >
            <Key size={40} />
          </div>
        </div>

        {/* Content block */}
        <div className="-mt-10 md:-mt-16">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-500 rounded-full mb-6 border border-red-100">
            <AlertTriangle size={17} />
            <span className="text-sm font-bold uppercase tracking-widest">Chambre introuvable</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-6 leading-tight tracking-tight">
            Il semble que vous soyez<br />
            <span className="text-amber-500">perdu dans nos couloirs.</span>
          </h2>

          <p className="text-lg text-gray-500 max-w-lg mx-auto mb-10 font-medium">
            La page que vous cherchez n'existe pas ou a été déplacée. 
            Pas d'inquiétude, notre équipe est là pour vous guider vers le bon chemin !
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="group bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center space-x-3 shadow-lg shadow-amber-400/30 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <Home size={18} className="group-hover:scale-110 transition-transform" />
              <span>Retour à l'accueil</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center space-x-3 transition-all hover:-translate-y-1"
            >
              <ArrowLeft size={18} />
              <span>Page précédente</span>
            </button>
          </div>

          {/* Quick links */}
          <div className="mt-14">
            <p className="text-sm text-gray-400 font-medium mb-4">Ou naviguez directement vers :</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { to: '/rooms', label: 'Nos Chambres' },
                { to: '/about', label: 'À Propos' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-5 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold hover:bg-amber-100 border border-amber-200 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative hotel-themed code block — left */}
        <div
          className="hidden xl:block absolute -left-16 top-1/2 -translate-y-1/2 text-left opacity-25"
          style={{ animation: 'fadeIn 1s ease-out 0.5s both' }}
        >
          <pre className="text-xs text-amber-600 font-mono leading-relaxed">
{`{
  "status": 404,
  "hotel": "Motel Bethuli",
  "room": "introuvable",
  "suggestion": "/"
}`}
          </pre>
        </div>

        {/* Decorative hotel-themed code block — right */}
        <div
          className="hidden xl:block absolute -right-16 top-1/2 -translate-y-1/2 text-right opacity-25"
          style={{ animation: 'fadeIn 1s ease-out 0.5s both' }}
        >
          <pre className="text-xs text-slate-500 font-mono leading-relaxed">
{`if (chambre.notFound) {
  redirect("/");
  return <Bethuli />;
}`}
          </pre>
        </div>
      </div>

      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(8deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 0.25; transform: translateX(0); }
        }
      `}</style>
    </main>
  );
};

export default NotFound;
