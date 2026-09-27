import React from 'react';
import { Check } from 'lucide-react';

export default function RoomStepper({ steps, currentStep }) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    
                    return (
                        <div key={step.id} className="flex flex-col items-center relative z-10 w-full">
                            {/* Connecteur */}
                            {index !== 0 && (
                                <div className={`absolute top-5 left-[-50%] w-full h-[2px] -z-10 transition-colors duration-300 ${
                                    isCompleted || isCurrent ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                                }`} />
                            )}
                            
                            {/* Bulle */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border-2 ${
                                isCompleted
                                    ? 'bg-amber-500 border-amber-500 text-white'
                                    : isCurrent
                                        ? 'bg-white dark:bg-slate-900 border-amber-500 text-amber-600 dark:text-amber-500 shadow-amber-500/20'
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                            }`}>
                                {isCompleted ? <Check className="w-5 h-5" /> : <span className="font-bold text-sm">{index + 1}</span>}
                            </div>
                            
                            {/* Titres (visibles sur desktop) */}
                            <div className="mt-3 hidden md:flex flex-col items-center">
                                <span className={`text-xs font-bold uppercase tracking-wider text-center ${
                                    isCurrent ? 'text-amber-600 dark:text-amber-500' : isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'
                                }`}>
                                    {step.title}
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5 text-center">{step.subtitle}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Titre de l'étape courante (visible uniquement sur mobile) */}
            <div className="mt-6 md:hidden flex flex-col items-center text-center">
                <span className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                    {steps[currentStep]?.title}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                    {steps[currentStep]?.subtitle}
                </span>
            </div>
        </div>
    );
}
