import React, { useState, useEffect } from 'react';
import { AlertTriangle, Key, Loader2, X, Info, CheckCircle2 } from 'lucide-react';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'danger',
    requirePassword = false,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    isLoading = false,
    alertMessage = null
}) {
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setPassword('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (requirePassword) {
            onConfirm(password);
        } else {
            onConfirm();
        }
    };

    const isConfirmDisabled = isLoading || (requirePassword && !password);

    const types = {
        danger: {
            icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
            bg: 'bg-red-100',
            btnClass: 'bg-red-600 hover:bg-red-700 text-white',
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
            bg: 'bg-orange-100',
            btnClass: 'bg-orange-600 hover:bg-orange-700 text-white',
        },
        info: {
            icon: <Info className="w-6 h-6 text-blue-600" />,
            bg: 'bg-blue-100',
            btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        },
        success: {
            icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
            bg: 'bg-green-100',
            btnClass: 'bg-green-600 hover:bg-green-700 text-white',
        }
    };

    const currentType = types[type] || types.danger;

    return (
        <>
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto transform transition-all flex flex-col overflow-hidden">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 pb-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl flex-shrink-0 ${currentType.bg}`}>
                                {currentType.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {title}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {message}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6 space-y-4">
                        
                        {alertMessage && (
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 text-sm text-orange-800">
                                <Info className="w-5 h-5 text-orange-500 shrink-0" />
                                <p>{alertMessage}</p>
                            </div>
                        )}

                        {requirePassword && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Key className="w-4 h-4 text-slate-400" />
                                    Votre mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Confirmez avec votre mot de passe"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-slate-500">
                                    Cette action sensible nécessite une validation de sécurité.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 bg-slate-200/30 rounded-xl transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isConfirmDisabled}
                            className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
                                isConfirmDisabled ? 'opacity-50 cursor-not-allowed grayscale' : currentType.btnClass
                            }`}
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
