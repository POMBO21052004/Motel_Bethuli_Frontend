import React from 'react';
import logo from '../../assets/logo.png';

const PageLoader = () => {
    return (
        <div className="fixed inset-0 bg-white dark:bg-slate-900 z-[9999] flex flex-col items-center justify-center p-6 text-center transition-colors">
            {/* Ambient Background Blur */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-slate-200/50 dark:bg-slate-800/50 rounded-full blur-[80px] animate-[pulse_4s_ease-in-out_infinite]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-sm mx-auto">
                {/* Center Content */}
                <div className="flex flex-col items-center space-y-8">
                    {/* Animated Spinner with Logo */}
                    <div className="relative flex items-center justify-center w-24 h-24">
                        <div className="absolute inset-0 rounded-full border-[3px] border-slate-100 dark:border-slate-800"></div>
                        <div className="absolute inset-0 rounded-full border-[3px] border-amber-500 border-t-transparent animate-spin"></div>
                        <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center overflow-hidden p-1 shadow-sm border border-slate-50 dark:border-slate-800">
                            <img src={logo} alt="Motel Bethuli Logo" className="w-full h-full object-cover rounded-full" />
                        </div>
                    </div>

                    {/* Text block */}
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Connexion en cours...</h2>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Veuillez patienter pendant la vérification de votre session sécurisée.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Branding */}
            <div className="relative z-10 w-full pb-8 pt-4 flex flex-col items-center animate-in fade-in duration-1000 delay-300">
                <div className="h-px w-16 bg-slate-200 dark:bg-slate-800 mb-4 rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Système de gestion
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                    Motel Bethuli
                </span>
            </div>
        </div>
    );
};

export default PageLoader;
