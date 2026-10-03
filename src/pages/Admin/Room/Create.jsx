import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, Save, BedDouble, Plus } from 'lucide-react';
import { useRooms } from '../../../hooks/useRooms';
import { RoomStatus, RoomModel } from '../../../models/RoomModel';
import RoomStepper from '../../../components/admin/room/RoomStepper';

const STEPS = [
    { id: 'general', title: 'Général', subtitle: 'Informations de base' },
    { id: 'pricing', title: 'Tarifs & Statut', subtitle: 'Prix et disponibilité' },
    { id: 'images', title: 'Photos', subtitle: 'Galerie d\'images' },
    { id: 'recap', title: 'Récapitulatif', subtitle: 'Vérification' }
];

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
    surfaceVariant: '#fef3c7', secondary: '#b45309', error: '#ef4444',
};

const PREDEFINED_FEATURES = [
    "Wi-Fi gratuit",
    "Climatisation",
    "Eau chaude",
    "Linge de lit propre",
    "Sécurité 24h/24",
    "Parking sécurisé",
    "Télévision",
    "Mini-réfrigérateur"
];

export default function RoomCreate() {
// ... existing state and logic ...
    const navigate = useNavigate();
    const { createRoom, loading } = useRooms();
    const [currentStep, setCurrentStep] = useState(0);
    const [newFeature, setNewFeature] = useState("");
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        floor: 0,
        capacity: 1,
        price_per_day: '',
        price_per_hour: '',
        status: RoomStatus.AVAILABLE,
        description_fr: '',
        description_en: '',
        features: [],
    });
    
    const [images, setImages] = useState([]); // Fichiers locaux ou URLs
    const [imagePreviews, setImagePreviews] = useState([]); // URLs de prévisualisation
    const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
    const [imageUrlInput, setImageUrlInput] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddFeature = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
                setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
                setNewFeature('');
            }
        }
    };

    const removeFeature = (f) => {
        setFormData(prev => ({ ...prev, features: prev.features.filter(x => x !== f) }));
    };

    const toggleFeature = (f) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(f) 
                ? prev.features.filter(x => x !== f) 
                : [...prev.features, f]
        }));
    };

    const handleAddImageUrl = () => {
        if (!imageUrlInput.trim()) return;
        if (imagePreviews.length >= 10) {
            alert('Vous ne pouvez pas uploader plus de 10 images.');
            return;
        }
        
        // Add the URL to both images and previews
        setImages(prev => [...prev, imageUrlInput.trim()]);
        setImagePreviews(prev => [...prev, imageUrlInput.trim()]);
        setImageUrlInput('');
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 10) {
            alert('Vous ne pouvez pas uploader plus de 10 images.');
            return;
        }
        
        setImages(prev => [...prev, ...files]);
        
        // Créer les prévisualisations
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, i) => i !== indexToRemove));
        setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
        if (primaryImageIndex === indexToRemove) setPrimaryImageIndex(0);
        else if (primaryImageIndex > indexToRemove) setPrimaryImageIndex(prev => prev - 1);
    };

    // Validation par étape — détermine si le bouton "Suivant" est activé
    const isStepValid = () => {
        if (currentStep === 0) return formData.name.trim() !== '' && formData.description_fr.trim() !== '';
        if (currentStep === 1) return formData.price_per_day !== '' && Number(formData.price_per_day) > 0;
        return true; // étapes images & recap toujours valides
    };

    const handleNext = () => {
        if (!isStepValid()) return;
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    };

    const handlePrev = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (Array.isArray(formData[key])) {
                formData[key].forEach(val => data.append(`${key}[]`, val));
            } else if (formData[key] !== null && formData[key] !== '') {
                data.append(key, formData[key]);
            }
        });
        
        images.forEach(image => {
            if (typeof image === 'string') {
                data.append('image_urls[]', image); // Send URLs as an array of strings
            } else {
                data.append('images[]', image); // Send Files as usual
            }
        });
        
        data.append('primary_image', primaryImageIndex);

        try {
            await createRoom(data);
            navigate('/admin/rooms');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700" style={{ color: T.onSurface }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: T.outline }}>
                <span className="hover:underline cursor-pointer transition-colors" onClick={() => navigate('/admin')}>Dashboard</span>
                <ArrowLeft className="w-3 h-3 mx-1" />
                <span className="hover:underline cursor-pointer transition-colors" onClick={() => navigate('/admin/rooms')}>Chambres</span>
                <ArrowLeft className="w-3 h-3 mx-1" />
                <span style={{ color: T.primary }}>Nouvelle</span>
            </div>

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                {/* Background decoration */}
                <div className="absolute -right-10 -top-10 opacity-5">
                    <BedDouble size={240} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 rounded-xl border backdrop-blur-md" style={{ background: `${T.primary}30`, borderColor: `${T.primary}50` }}>
                                <BedDouble className="w-7 h-7" style={{ color: '#f59e0b' }} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tight">Nouvelle Chambre</h1>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#f59e0b' }}>
                                    Configuration étape par étape
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: `${T.outlineVariant}50` }}>
                <RoomStepper steps={STEPS} currentStep={currentStep} />
            </div>

            {/* Form Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8">
                    
                    {/* Step 1: Général */}
                    {currentStep === 0 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                                Informations Générales
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nom de la chambre <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Suite Présidentielle 404"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Étage <span className="text-red-500">*</span></label>
                                    <select 
                                        name="floor"
                                        value={formData.floor}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="0">Rez-de-chaussée (0)</option>
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i+1} value={i+1}>Étage {i+1}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Capacité (personnes) <span className="text-red-500">*</span></label>
                                    <select
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer"
                                    >
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i+1} value={i+1}>{i+1} personne{i > 0 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description <span className="text-red-500">*</span></label>
                                    <textarea 
                                        name="description_fr"
                                        value={formData.description_fr}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder="Décrivez la chambre..."
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all resize-y"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2 mt-4 border-t pt-4">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Équipements inclus</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {PREDEFINED_FEATURES.map(f => (
                                            <button key={f} type="button" onClick={() => toggleFeature(f)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${formData.features?.includes(f) ? 'bg-amber-100 text-amber-700 border-2 border-amber-500/30' : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'}`}>
                                                {f} {formData.features?.includes(f) ? '✓' : '+'}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            value={newFeature} 
                                            onChange={e => setNewFeature(e.target.value)} 
                                            onKeyDown={handleAddFeature} 
                                            placeholder="Ajouter un équipement (ex: Netflix) et appuyez sur Entrée..." 
                                            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => handleAddFeature({key: 'Enter', preventDefault: ()=>{}})}
                                            className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-sm hover:bg-slate-700 transition-colors"
                                        >
                                            Ajouter
                                        </button>
                                    </div>
                                    {formData.features?.filter(f => !PREDEFINED_FEATURES.includes(f)).length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                            {formData.features.filter(f => !PREDEFINED_FEATURES.includes(f)).map(f => (
                                                <span key={f} className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-amber-200">
                                                    {f} 
                                                    <button type="button" onClick={() => removeFeature(f)} className="hover:text-amber-900 focus:outline-none w-4 h-4 flex items-center justify-center rounded-full hover:bg-amber-200 transition-colors">
                                                        &times;
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Tarifs & Statut */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                                Tarification & Disponibilité
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Prix par Jour (FCFA) <span className="text-red-500">*</span></label>
                                    <input 
                                        type="number" 
                                        name="price_per_day"
                                        value={formData.price_per_day}
                                        onChange={handleInputChange}
                                        min="0"
                                        placeholder="Ex: 50000"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Statut initial <span className="text-red-500">*</span></label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer"
                                    >
                                        <option value={RoomStatus.AVAILABLE}>Disponible</option>
                                        <option value={RoomStatus.OCCUPIED}>Occupée</option>
                                        <option value={RoomStatus.MAINTENANCE}>En maintenance</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Images */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                                Galerie Photos
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                    {images.length}/10 max
                                </span>
                            </h2>
                            
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer group mb-4">
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <Plus className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Cliquez ou glissez-déposez vos images ici</p>
                                    <p className="text-xs text-slate-500 mt-2">Formats acceptés : JPG, PNG, WEBP (Max 5Mo)</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 mb-6">
                                <input
                                    type="url"
                                    placeholder="Ou collez l'URL d'une image existante (http://...)"
                                    value={imageUrlInput}
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddImageUrl}
                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
                                >
                                    Ajouter URL
                                </button>
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className={`relative group rounded-xl overflow-hidden aspect-video border-2 ${primaryImageIndex === index ? 'border-amber-500' : 'border-transparent'}`}>
                                            <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                            
                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => setPrimaryImageIndex(index)}
                                                    className="px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-amber-500 hover:text-white transition-colors"
                                                >
                                                    Définir Principal
                                                </button>
                                                <button 
                                                    onClick={() => removeImage(index)}
                                                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                            
                                            {primaryImageIndex === index && (
                                                <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                                    PRINCIPALE
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Récapitulatif */}
                    {currentStep === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                                Récapitulatif
                            </h2>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Général</h3>
                                        <dl className="space-y-3 text-sm">
                                            <div className="flex justify-between"><dt className="text-slate-500">Nom :</dt><dd className="font-bold text-slate-900 dark:text-white">{formData.name}</dd></div>
                                            <div className="flex justify-between"><dt className="text-slate-500">Étage :</dt><dd className="font-bold text-slate-900 dark:text-white">{Number(formData.floor) === 0 ? 'Rez-de-chaussée' : `Étage ${formData.floor}`}</dd></div>
                                            <div className="flex justify-between"><dt className="text-slate-500">Capacité :</dt><dd className="font-bold text-slate-900 dark:text-white">{formData.capacity} personne{formData.capacity > 1 ? 's' : ''}</dd></div>
                                        </dl>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Tarifs & Statut</h3>
                                        <dl className="space-y-3 text-sm">
                                            <div className="flex justify-between"><dt className="text-slate-500">Prix / Jour :</dt><dd className="font-bold text-amber-600">{Number(formData.price_per_day).toLocaleString('fr-FR')} FCFA</dd></div>
                                            <div className="flex justify-between"><dt className="text-slate-500">Statut :</dt><dd className="font-bold text-slate-900 dark:text-white">{RoomModel.getStatusLabel(formData.status)}</dd></div>
                                        </dl>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Description (FR)</h3>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{formData.description_fr}</p>
                                    </div>
                                    
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Photos ({images.length})</h3>
                                        {imagePreviews.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-2">
                                                {imagePreviews.slice(0, 3).map((prev, i) => (
                                                    <img key={i} src={prev} className="w-full aspect-square object-cover rounded-lg border border-slate-200" alt="" />
                                                ))}
                                                {imagePreviews.length > 3 && (
                                                    <div className="w-full aspect-square rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500">
                                                        +{imagePreviews.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">Aucune image sélectionnée.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
                
                {/* Footer Controls */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button 
                        onClick={handlePrev}
                        disabled={currentStep === 0 || loading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            currentStep === 0 
                                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Précédent
                    </button>
                    
                    {currentStep < STEPS.length - 1 ? (
                        <button 
                            onClick={handleNext}
                            disabled={!isStepValid()}
                            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                isStepValid()
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 hover:-translate-y-0.5'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            Suivant
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <>Traitement...</>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Créer la chambre
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
