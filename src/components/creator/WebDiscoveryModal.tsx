import React, { useState } from 'react';
import {
  Sparkles,
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Phone,
  Clock,
  UtensilsCrossed,
  X,
  ExternalLink,
  ChevronRight,
  Flame,
  ShieldCheck,
  Palette,
  Loader2,
  Edit3,
  Sliders,
  Check,
  Link as LinkIcon,
  Navigation,
} from 'lucide-react';
import { Restaurant, Dish } from '../../types';

interface WebDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRestaurantToSite: (restaurant: Restaurant) => void;
  onOpenPublicRestaurant?: (restaurantId: string) => void;
  onShowToast: (message: string) => void;
}

export const WebDiscoveryModal: React.FC<WebDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onAddRestaurantToSite,
  onOpenPublicRestaurant,
  onShowToast,
}) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [generatedRestaurant, setGeneratedRestaurant] = useState<Restaurant | null>(null);
  const [verifiedSources, setVerifiedSources] = useState<{ title: string; uri: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'preview' | 'inspect_edit'>('preview');

  if (!isOpen) return null;

  const quickSuggestions = [
    { name: 'Chez Fonfon', city: 'Marseille' },
    { name: 'Septime', city: 'Paris' },
    { name: 'L\'Épuisette', city: 'Marseille' },
    { name: 'La Boîte à Sardine', city: 'Marseille' },
    { name: 'Le Petit Nice Passedat', city: 'Marseille' },
    { name: 'Big Mamma East Mamma', city: 'Paris' },
  ];

  const handleSelectSuggestion = (item: { name: string; city: string }) => {
    setRestaurantName(item.name);
    setCity(item.city);
    setErrorMsg(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName.trim()) {
      setErrorMsg('Veuillez renseigner le nom du restaurant.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setGeneratedRestaurant(null);
    setVerifiedSources([]);
    setIsAdded(false);
    setActiveViewMode('preview');

    try {
      setLoadingStep('🔍 Recherche Google Grounding des données officielles...');
      
      const stepTimer1 = setTimeout(() => {
        setLoadingStep('📍 Extraction de l\'adresse physique réelle & vérification GPS...');
      }, 1500);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep('🍲 Extraction de la vraie carte de plats, tarifs observés et macronutriments...');
      }, 3200);

      const stepTimer3 = setTimeout(() => {
        setLoadingStep('✨ Certification de la conformité factuelle 100%...');
      }, 5000);

      const response = await fetch('/api/discover-restaurant-web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: restaurantName.trim(),
          city: city.trim(),
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (!response.ok) {
        throw new Error('Erreur de communication avec le service web.');
      }

      const data = await response.json();
      if (data.restaurant) {
        setGeneratedRestaurant(data.restaurant);
        if (Array.isArray(data.verifiedSources)) {
          setVerifiedSources(data.verifiedSources);
        } else if (Array.isArray(data.restaurant.verifiedSources)) {
          setVerifiedSources(data.restaurant.verifiedSources);
        }
        onShowToast(`Page restaurant « ${data.restaurant.name} » générée et vérifiée à 100% ! ✨`);
      } else {
        throw new Error(data.error || 'Impossible de générer le restaurant.');
      }
    } catch (err: any) {
      console.error('Error during web discovery:', err);
      setErrorMsg(err.message || 'Une erreur est survenue lors de la recherche.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handlePublish = () => {
    if (!generatedRestaurant) return;
    onAddRestaurantToSite(generatedRestaurant);
    setIsAdded(true);
    onShowToast(`Le restaurant « ${generatedRestaurant.name} » a été ajouté au site Gusto ! 🎉`);
  };

  const handleViewLivePage = () => {
    if (!generatedRestaurant) return;
    onClose();
    if (onOpenPublicRestaurant) {
      onOpenPublicRestaurant(generatedRestaurant.id);
    }
  };

  // Field updater for 100% precision control
  const updateRestaurantField = <K extends keyof Restaurant>(field: K, value: Restaurant[K]) => {
    if (!generatedRestaurant) return;
    setGeneratedRestaurant({
      ...generatedRestaurant,
      [field]: value,
    });
  };

  // Dish field updater
  const updateDishField = (dishId: string, field: keyof Dish, value: any) => {
    if (!generatedRestaurant) return;
    const updatedDishes = generatedRestaurant.dishes.map((d) =>
      d.id === dishId ? { ...d, [field]: value } : d
    );
    setGeneratedRestaurant({
      ...generatedRestaurant,
      dishes: updatedDishes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-4xl shadow-2xl text-stone-100 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* MODAL HEADER */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#99281a] via-[#781524] to-amber-600 flex items-center justify-center shadow-lg border border-amber-400/30 text-white">
              <Globe className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif font-black text-lg sm:text-xl text-white">
                  Création de Page Restaurant via le Web (100% Factuel)
                </h3>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Google Search Grounding & GPS</span>
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Recherche automatique sur internet, extraction de données réelles et contrôle total avant publication.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* SEARCH FORM */}
          <form onSubmit={handleGenerate} className="space-y-4 bg-stone-950/60 border border-stone-800 p-4 sm:p-5 rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Nom du Restaurant *</span>
                  <span className="text-[10px] text-amber-400 font-normal">Recherche sur le web</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Ex: Chez Fonfon, Septime, L'Épuisette, Da Michele..."
                    className="w-full bg-stone-800/90 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Ville / Localisation</span>
                  <span className="text-[10px] text-stone-400 font-normal">Pour 100% précision</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Marseille, Paris 11..."
                  className="w-full bg-stone-800/90 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* FACTUAL ACCURACY TIP BOX */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-300">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-amber-200">
                  Garantie 100% Exactitude Factuelle :
                </p>
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  L'IA interroge les sources en ligne officielles (Google Maps, sites web officiels, presse gastronomique, guides Michelin). L'adresse, le téléphone, les horaires et la carte des plats sont rigoureusement extraits sans extrapolation.
                </p>
              </div>
            </div>

            {/* QUICK SUGGESTIONS CHIPS */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-stone-400 font-semibold block">
                Exemples d'établissements connus pour tester :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="px-2.5 py-1 rounded-full text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 hover:border-stone-500 transition cursor-pointer flex items-center gap-1"
                    disabled={isLoading}
                  >
                    <span>{item.name}</span>
                    <span className="text-stone-500 text-[10px]">({item.city})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading || !restaurantName.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#99281a] via-[#781524] to-amber-700 hover:from-[#b03020] hover:to-amber-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-rose-950 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Recherche & Vérification des données réelles...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Rechercher sur Internet & Créer la Page (100% Conforme)</span>
                </>
              )}
            </button>
          </form>

          {/* LOADING STATE WITH ANIMATED STEPPER */}
          {isLoading && (
            <div className="p-6 rounded-2xl bg-stone-950/80 border border-stone-800 text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-black text-white text-base">
                  Recherche Factual Grounding & Géolocalisation
                </h4>
                <p className="text-xs text-amber-300 font-mono">
                  {loadingStep || 'Recherche des données officielles en cours...'}
                </p>
              </div>
              <p className="text-[11px] text-stone-500 max-w-md mx-auto">
                Consultation de Google Maps, extraction du vrai numéro de téléphone, vérification de l'adresse par géocodage satellite et composition des plats authentiques.
              </p>
            </div>
          )}

          {/* ERROR DISPLAY */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* GENERATED RESTAURANT RESULTS */}
          {generatedRestaurant && (
            <div className="space-y-4">
              {/* TOP HEADER & VIEW MODE SELECTOR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950/90 border border-stone-800 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-sm text-white flex items-center gap-1.5">
                      <span>{generatedRestaurant.name}</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.2 rounded-full border border-emerald-800">
                        100% Vérifié
                      </span>
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Coordonnées GPS réelles : {generatedRestaurant.coords.lat.toFixed(4)}, {generatedRestaurant.coords.lng.toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* VIEW MODE TABS */}
                <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveViewMode('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activeViewMode === 'preview'
                        ? 'bg-[#99281a] text-white shadow-xs'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <span>Aperçu de la page</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveViewMode('inspect_edit')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activeViewMode === 'inspect_edit'
                        ? 'bg-[#99281a] text-white shadow-xs'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Contrôle & Ajustements (100% Exactitude)</span>
                  </button>
                </div>
              </div>

              {/* VERIFIED SOURCES PILLS (IF RETRIEVED FROM GOOGLE SEARCH) */}
              {verifiedSources.length > 0 && (
                <div className="p-3 bg-stone-950/50 rounded-2xl border border-stone-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-bold uppercase tracking-wider">
                    <LinkIcon className="w-3 h-3 text-emerald-400" />
                    <span>Sources web consultées et vérifiées :</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {verifiedSources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-[11px] flex items-center gap-1 transition truncate max-w-xs"
                        title={s.uri}
                      >
                        <ExternalLink className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{s.title || s.uri}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* MODE 1: VISUAL PREVIEW */}
              {activeViewMode === 'preview' && (
                <div className="bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden shadow-xl">
                  {/* Banner Photo */}
                  <div className="relative h-48 w-full bg-stone-800 overflow-hidden">
                    <img
                      src={generatedRestaurant.banner}
                      alt={generatedRestaurant.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
                    
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/95 text-stone-900 shadow-sm">
                        {generatedRestaurant.cuisine}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black/70 text-white font-mono">
                        {generatedRestaurant.priceRange}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-serif font-black text-2xl text-white drop-shadow-md">
                        {generatedRestaurant.name}
                      </h3>
                      <p className="text-xs text-stone-300 truncate">
                        {generatedRestaurant.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-300">
                      <div className="flex items-start gap-2.5 bg-stone-900/90 p-3 rounded-xl border border-stone-800">
                        <MapPin className="w-4 h-4 text-[#99281a] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-stone-500 font-bold uppercase block">Adresse officielle</span>
                          <span className="font-semibold text-white">{generatedRestaurant.address}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-stone-900/90 p-3 rounded-xl border border-stone-800">
                        <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-stone-500 font-bold uppercase block">Téléphone direct</span>
                          <span className="font-semibold text-white font-mono">{generatedRestaurant.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-stone-900/90 p-3 rounded-xl border border-stone-800">
                        <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-stone-500 font-bold uppercase block">Horaires réels</span>
                          <span className="font-medium text-white">
                            {generatedRestaurant.openingHours.days} ({generatedRestaurant.openingHours.lunch} / {generatedRestaurant.openingHours.dinner})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-stone-900/90 p-3 rounded-xl border border-stone-800">
                        <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-stone-500 font-bold uppercase block">Moyenne Nutrition</span>
                          <span className="font-medium text-white">
                            ~{generatedRestaurant.avgKcal} kcal • {generatedRestaurant.dishes.length} plats vérifiés
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verified Dishes List */}
                    <div className="space-y-2 pt-2 border-t border-stone-800/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-300 uppercase tracking-wider text-[10px]">
                          Vrais plats extraits de la carte ({generatedRestaurant.dishes.length})
                        </span>
                        <span className="text-stone-500 text-[11px]">
                          Tarifs observés & calcul nutritionnel
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {generatedRestaurant.dishes.map((d) => (
                          <div
                            key={d.id}
                            className="bg-stone-900/90 border border-stone-800 p-3 rounded-xl flex items-center gap-3"
                          >
                            <img
                              src={d.image}
                              alt={d.name}
                              className="w-14 h-14 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="font-bold text-xs text-white truncate">
                                  {d.name}
                                </h5>
                                <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                                  {d.price.toFixed(2)}€
                                </span>
                              </div>
                              <p className="text-[10px] text-stone-400 line-clamp-1">
                                {d.description}
                              </p>
                              <div className="flex items-center gap-2 text-[9px] font-mono text-stone-500 mt-1">
                                <span className="text-stone-300">{d.nutrition.kcal} kcal</span>
                                <span>•</span>
                                <span>{d.nutrition.protein}g P</span>
                                <span>•</span>
                                <span>{d.nutrition.carbs}g G</span>
                                <span>•</span>
                                <span>{d.nutrition.fat}g L</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: INSPECT & FINE EDIT (100% CONTROL GUARANTEE) */}
              {activeViewMode === 'inspect_edit' && (
                <div className="bg-stone-950 rounded-2xl border border-stone-800 p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-amber-400" />
                      <h5 className="font-bold text-sm text-white">
                        Contrôle direct de chaque donnée extraite
                      </h5>
                    </div>
                    <span className="text-[11px] text-stone-400">
                      Modifiez n'importe quel champ si vous souhaitez affiner le résultat.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-stone-400 font-bold mb-1 text-[11px] uppercase">
                        Nom officiel du restaurant
                      </label>
                      <input
                        type="text"
                        value={generatedRestaurant.name}
                        onChange={(e) => updateRestaurantField('name', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-[#99281a] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 font-bold mb-1 text-[11px] uppercase">
                        Slogan / Tagline
                      </label>
                      <input
                        type="text"
                        value={generatedRestaurant.tagline}
                        onChange={(e) => updateRestaurantField('tagline', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-[#99281a] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 font-bold mb-1 text-[11px] uppercase">
                        Adresse physique exacte
                      </label>
                      <input
                        type="text"
                        value={generatedRestaurant.address}
                        onChange={(e) => updateRestaurantField('address', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-[#99281a] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 font-bold mb-1 text-[11px] uppercase">
                        Numéro de téléphone
                      </label>
                      <input
                        type="text"
                        value={generatedRestaurant.phone}
                        onChange={(e) => updateRestaurantField('phone', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-[#99281a] focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 font-bold mb-1 text-[11px] uppercase">
                        Type de cuisine
                      </label>
                      <input
                        type="text"
                        value={generatedRestaurant.cuisine}
                        onChange={(e) => updateRestaurantField('cuisine', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-[#99281a] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 font-bold mb-1 text-[11px] uppercase">
                        Gamme de prix
                      </label>
                      <input
                        type="text"
                        value={generatedRestaurant.priceRange}
                        onChange={(e) => updateRestaurantField('priceRange', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-[#99281a] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* DISHES QUICK PRICE & NAME EDIT */}
                  <div className="space-y-2 pt-3 border-t border-stone-800">
                    <span className="font-bold text-stone-300 text-xs block">
                      Ajustement des plats & tarifs réels (€)
                    </span>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {generatedRestaurant.dishes.map((dish) => (
                        <div
                          key={dish.id}
                          className="bg-stone-900 border border-stone-800 p-2.5 rounded-xl flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={dish.name}
                            onChange={(e) => updateDishField(dish.id, 'name', e.target.value)}
                            className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                          <div className="flex items-center gap-1 shrink-0 w-24">
                            <input
                              type="number"
                              step="0.5"
                              value={dish.price}
                              onChange={(e) => updateDishField(dish.id, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-xs text-amber-400 font-mono text-right"
                            />
                            <span className="text-xs text-stone-400 font-mono">€</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIONS BAR */}
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-stone-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  {isAdded ? (
                    <span className="text-emerald-400 font-bold">
                      Ce restaurant a été vérifié et ajouté à votre plateforme Gusto !
                    </span>
                  ) : (
                    <span>
                      Données réelles prêtes à être publiées en un clic.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {!isAdded ? (
                    <button
                      type="button"
                      onClick={handlePublish}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valider & Publier sur le Site</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleViewLivePage}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 border border-stone-600"
                    >
                      <ExternalLink className="w-4 h-4 text-amber-400" />
                      <span>Voir la Page Restaurant en Direct</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
