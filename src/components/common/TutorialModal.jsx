import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Map, PlayCircle, BookOpen, Users, LayoutDashboard, CreditCard, Award, Volume2, VolumeX } from 'lucide-react';
import slide1 from '../../assets/images/tutorial-slide-1.png';
import slide2 from '../../assets/images/tutorial-slide-2.png';
import slide3 from '../../assets/images/tutorial-slide-3.png';
import slide4 from '../../assets/images/tutorial-slide-4.png';
import slide5 from '../../assets/images/tutorial-slide-5.png';
import slide6 from '../../assets/images/tutorial-slide-6.png';
import slide7 from '../../assets/images/tutorial-slide-7.png';

const slides = [
  {
    title: "Bienvenue sur l'Aide AGA",
    icon: <Map className="w-8 h-8 text-primary" />,
    description: "Ce tutoriel interactif vous guide pas-à-pas à travers le processus complet de création et gestion, de A à Z. Utilisez les flèches pour naviguer.",
    details: "Avant de commencer, notez que la barre de navigation supérieure (Navbar) vous permet : d'ouvrir le menu latéral, de faire une recherche rapide (Ctrl+K), de basculer en mode sombre/clair, de voir vos notifications et d'accéder à votre profil. L'icône Point d'interrogation y est toujours disponible pour rouvrir ce tutoriel à tout moment.",
    imagePath: slide1,
    imageInstructions: "L'image 1 doit montrer la Navbar globale de l'application (en haut de l'écran) avec des flèches ou cercles rouges mettant en évidence le bouton Menu, la barre de Recherche, le bouton Mode Sombre, la Cloche de notification et l'icône Profil. (Vue d'ensemble de l'en-tête)."
  },
  {
    title: "Étape 1 : Configuration Initiale (Admin)",
    icon: <LayoutDashboard className="w-8 h-8 text-indigo-500" />,
    description: "Tout commence par la préparation des Modèles et Catégories (Rôle Administrateur).",
    details: "En tant qu'Administrateur, allez dans les paramètres pour configurer les 'Types d'attestation' avec vos logos et signatures. Ensuite, créez les 'Catégories d'objectifs' pédagogiques. Ces éléments serviront de socle à toutes vos futures formations.",
    imagePath: slide2,
    imageInstructions: "L'image 2 doit montrer le module 'Paramètres > Modèles' (accessible aux admins) avec le bouton 'Nouveau modèle' bien visible et la liste des modèles existants."
  },
  {
    title: "Étape 2 : Création de la Formation (Admin)",
    icon: <BookOpen className="w-8 h-8 text-emerald-500" />,
    description: "Créez le catalogue de vos offres de formation (Rôle Administrateur).",
    details: "Toujours sous la responsabilité de l'Admin : dans le module 'Formations', créez la fiche de formation. Définissez le nom, le domaine, la durée, ajoutez les 'Objectifs pédagogiques', et surtout, affectez-y le Modèle d'attestation (créé à l'étape 1).",
    imagePath: slide3,
    imageInstructions: "L'image 3 doit montrer le formulaire de création ou d'édition d'une formation par un Admin, en mettant l'accent sur le champ déroulant 'Modèle d'attestation' et l'ajout d'objectifs."
  },
  {
    title: "Étape 3 : Recensement d'Entreprise",
    icon: <Users className="w-8 h-8 text-blue-500" />,
    description: "Étape optionnelle si vous formez des professionnels d'une entreprise partenaire (Admin & Gestionnaire).",
    details: "Si le groupe d'apprenants vient d'une même entreprise cliente, allez dans le module 'Entreprises' pour l'ajouter. Vous pourrez ensuite rattacher vos apprenants à cette entreprise lors de leur inscription.",
    imagePath: slide4,
    imageInstructions: "L'image 4 doit montrer la liste des entreprises avec le bouton 'Nouvelle Entreprise', ou la fenêtre modale d'ajout avec les champs 'Nom', 'Secteur', 'Contact'."
  },
  {
    title: "Étape 4 : Session et Inscription",
    icon: <PlayCircle className="w-8 h-8 text-amber-500" />,
    description: "Lancez une session et ajoutez vos participants (Admin & Gestionnaire).",
    details: "Dans le module 'Sessions', le Gestionnaire ou l'Admin crée une nouvelle cohorte à partir d'une Formation existante. Ensuite, ajoutez vos apprenants manuellement ou utilisez 'Import Excel' pour importer toute une liste d'un seul coup.",
    imagePath: slide5,
    imageInstructions: "L'image 5 doit montrer le tableau de bord intérieur d'une Session ouverte, avec la vue sur l'onglet 'Participants' et les boutons 'Ajout Manuel' / 'Import Excel' mis en évidence."
  },
  {
    title: "Étape 5 : Suivi des Paiements",
    icon: <CreditCard className="w-8 h-8 text-rose-500" />,
    description: "Assurez-vous que les frais sont réglés.",
    details: "Pour chaque participant, enregistrez le paiement de sa formation. Indiquez le montant, le mode de paiement et joignez la preuve ou le reçu. N'oubliez pas de passer le statut du paiement en 'Validé' pour autoriser l'édition de l'attestation finale.",
    imagePath: slide6,
    imageInstructions: "L'image 6 doit montrer la modale ou la page d'ajout d'un paiement, illustrant le champ montant, la sélection du mode de paiement et la zone de téléchargement pour la preuve de paiement."
  },
  {
    title: "Étape 6 : Génération des Attestations",
    icon: <Award className="w-8 h-8 text-yellow-500" />,
    description: "L'étape finale : la délivrance du certificat.",
    details: "Une fois la session terminée et les paiements validés, sélectionnez les apprenants concernés et cliquez sur 'Générer'. L'attestation PDF est alors créée instantanément avec un numéro matricule unique et un QR Code infalsifiable !",
    imagePath: slide7,
    imageInstructions: "L'image 7 doit montrer la liste des attestations avec les statuts (ex: 'Valide') et idéalement la vue de 'prévisualisation' ou de téléchargement PDF d'une attestation finale."
  }
];

export default function TutorialModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageError, setImageError] = useState({});
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [magnifier, setMagnifier] = useState({ visible: false, x: 0, y: 0, w: 0, h: 0 });
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 1, h: 1 });

  const [speaking, setSpeaking] = useState(false);
  const supported = 'speechSynthesis' in window;

  // Stop reading when slide changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [currentSlide]);

  // Stop reading when modal closes
  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [isOpen]);

  const handleSpeak = () => {
    if (speaking) { 
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return; 
    }
    
    const slide = slides[currentSlide];
    const text = `${slide.title}. ${slide.description}. ${slide.details}`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    utter.rate = 0.95;
    
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith('fr'));
    if (frVoice) {
      utter.voice = frVoice;
    }

    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  const ZOOM = 2.5;
  const LENS = 440;

  const handleMouseMove = (e) => {
    if (imageError[currentSlide]) return;
    const b = e.currentTarget.getBoundingClientRect();
    setMagnifier({ visible: true, x: e.clientX - b.left, y: e.clientY - b.top, w: b.width, h: b.height });
  };

  const handleMouseLeave = () => setMagnifier(m => ({ ...m, visible: false }));

  if (!isOpen) return null;

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];

  const handleImageError = () => {
    setImageError(prev => ({ ...prev, [currentSlide]: true }));
  };

  const handleImageLoad = (e) => {
    setImgNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  };

  // Compute actual rendered image rect inside container (object-contain)
  const getRenderedRect = () => {
    const { w: cw, h: ch } = magnifier;
    const { w: iw, h: ih } = imgNaturalSize;
    if (!cw || !ch || !iw || !ih) return { rw: cw, rh: ch, ox: 0, oy: 0 };
    const cRatio = cw / ch;
    const iRatio = iw / ih;
    let rw, rh, ox, oy;
    if (iRatio > cRatio) {
      rw = cw; rh = cw / iRatio;
      ox = 0; oy = (ch - rh) / 2;
    } else {
      rh = ch; rw = ch * iRatio;
      oy = 0; ox = (cw - rw) / 2;
    }
    return { rw, rh, ox, oy };
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-200 dark:border-slate-800" style={{height: '612px', maxHeight: '90vh'}}>
        
        {/* Left Side : Image */}
        <div
          className={`relative bg-slate-100 dark:bg-slate-800 overflow-hidden min-h-[320px] md:min-h-0 transition-all duration-300 ${isPanelCollapsed ? 'flex-1' : 'w-full md:w-[60%]'}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: magnifier.visible ? 'crosshair' : 'default' }}
        >

          {!imageError[currentSlide] ? (
            <>
              <img 
                src={slide.imagePath} 
                alt={slide.title}
                onError={handleImageError}
                onLoad={handleImageLoad}
                className="absolute inset-0 w-full h-full object-contain"
                draggable={false}
              />
              {/* Magnifier Lens — fixed at center, shows zoomed area under cursor */}
              {magnifier.visible && (() => {
                const { rw, rh, ox, oy } = getRenderedRect();
                // Clamp cursor to actual image bounds
                const relX = Math.max(0, Math.min(rw, magnifier.x - ox));
                const relY = Math.max(0, Math.min(rh, magnifier.y - oy));
                const bgX = -(relX * ZOOM - LENS / 2);
                const bgY = -(relY * ZOOM - LENS / 2);
                return (
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: LENS,
                      height: LENS,
                      borderRadius: '50%',
                      border: '4px solid white',
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.25), 0 8px 30px rgba(0,0,0,0.35)',
                      backgroundImage: `url(${slide.imagePath})`,
                      backgroundSize: `${rw * ZOOM}px ${rh * ZOOM}px`,
                      backgroundPosition: `${bgX}px ${bgY}px`,
                      backgroundRepeat: 'no-repeat',
                      pointerEvents: 'none',
                      zIndex: 20,
                    }}
                  />
                );
              })()}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="p-4 bg-white dark:bg-slate-700 rounded-full shadow-lg">
                {slide.icon}
              </div>
              <div className="bg-slate-200 dark:bg-slate-700 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 w-full max-w-[90%]">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Image introuvable</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 break-words font-mono bg-slate-100 dark:bg-slate-800 p-1 rounded">
                  {slide.imagePath}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 font-medium">
                  Ce que cette image doit montrer :
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                  "{slide.imageInstructions}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider / Toggle Tab */}
        <div className="hidden md:flex items-center justify-center relative z-10 bg-slate-200 dark:bg-slate-700" style={{width: '28px', flexShrink: 0}}>
          <button
            onClick={() => setIsPanelCollapsed(p => !p)}
            title={isPanelCollapsed ? 'Afficher les explications' : 'Masquer les explications'}
            className="absolute flex items-center justify-center w-6 h-10 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-full shadow-md hover:bg-slate-50 dark:hover:bg-slate-500 transition-all text-slate-500 dark:text-slate-300"
          >
            {isPanelCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right Side : Content */}
        <div className={`transition-all duration-300 overflow-hidden flex flex-col justify-between relative bg-white dark:bg-slate-900 ${
          isPanelCollapsed ? 'w-0 p-0 opacity-0 pointer-events-none' : 'flex-1 p-6 md:p-10 opacity-100'
        }`}>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full">
                Étape {currentSlide + 1} / {slides.length}
              </span>
              {supported && (
                <button
                  onClick={handleSpeak}
                  title={speaking ? 'Arrêter la lecture' : 'Lire à voix haute'}
                  className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    speaking
                      ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
                      : 'bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {speaking ? 'Arrêter' : 'Lire'}
                </button>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              {slide.title}
            </h2>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              {slide.description}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {slide.details}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="mt-12 flex items-center justify-between">
            <div className="flex gap-1.5">
              {slides.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide 
                      ? 'w-6 bg-primary' 
                      : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer'
                  }`}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                  currentSlide === 0 
                    ? 'text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-800 cursor-not-allowed' 
                    : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {currentSlide === slides.length - 1 ? (
                <button 
                  onClick={onClose}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
                >
                  Terminer
                </button>
              ) : (
                <button 
                  onClick={nextSlide}
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100"
                >
                  Suivant
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
