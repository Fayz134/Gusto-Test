import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  LayoutGrid,
  BookOpen,
  QrCode,
  ShieldAlert,
  KeyRound,
  PlusCircle,
  LogOut,
  Search,
  PhoneCall,
  Wine,
  Flame,
  ChevronRight,
  Utensils,
  Sparkles,
  Wheat,
  Cake,
  Coffee,
  FolderPlus,
  Tag,
  Layers,
  Check,
  X,
  SlidersHorizontal,
  RotateCcw,
  Filter,
  Leaf,
  UtensilsCrossed,
  Pencil,
} from 'lucide-react';
import { Restaurant, Language, ViewMode, Dish, MacroFilterType } from '../types';
import { I18N_DICT, ALLERGENS_MASTER_LIST } from '../data/i18n';
import { formatPrice } from '../utils/geo';

interface RestaurantViewProps {
  restaurant: Restaurant;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onBackToPortal: () => void;
  onOpenDishDetail: (dish: Dish) => void;
  onOpenQrModal: () => void;
  onOpenBillModal?: () => void;
  onOpenAllergenModal: () => void;
  onOpenAdminModal: () => void;
  selectedAllergens: string[];
  onToggleAllergen?: (id: string) => void;
  onResetAllergens?: () => void;
  activeMacroFilter?: MacroFilterType;
  onMacroFilterChange?: (filter: MacroFilterType) => void;
  isHalalOnly?: boolean;
  onToggleHalal?: () => void;
  isVeganOnly?: boolean;
  onToggleVegan?: () => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
  orderCount?: number;
  orderTotal?: number;
  onOpenOrderModal?: () => void;
  onEditDish?: (dish: Dish) => void;
}

export const RestaurantView: React.FC<RestaurantViewProps> = ({
  restaurant,
  currentLang,
  onLanguageChange,
  onBackToPortal,
  onOpenDishDetail,
  onOpenQrModal,
  onOpenBillModal,
  onOpenAllergenModal,
  onOpenAdminModal,
  selectedAllergens = [],
  onToggleAllergen,
  onResetAllergens,
  activeMacroFilter = 'all',
  onMacroFilterChange,
  isHalalOnly = false,
  onToggleHalal,
  isVeganOnly = false,
  onToggleVegan,
  isAdmin,
  onLogoutAdmin,
  orderCount = 0,
  orderTotal = 0,
  onOpenOrderModal,
  onEditDish,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterTab, setActiveFilterTab] = useState<'regimes' | 'allergens' | null>(null);
  const [isVegetarianOnly, setIsVegetarianOnly] = useState<boolean>(false);

  // Ensure filter panel is always closed when entering or switching restaurants
  useEffect(() => {
    setActiveFilterTab(null);
  }, [restaurant.id]);

  const isSansGlutenActive = selectedAllergens.includes('gluten');
  const isSansLactoseActive = selectedAllergens.includes('lactose');
  const isHighProtein = activeMacroFilter === 'high-protein';
  const isLowCal = activeMacroFilter === 'low-cal';
  const isLowCarb = activeMacroFilter === 'low-carb';
  const isLowFat = activeMacroFilter === 'low-fat';

  const activeRegimesCount =
    (isHalalOnly ? 1 : 0) +
    (isVeganOnly ? 1 : 0) +
    (isVegetarianOnly ? 1 : 0) +
    (isSansGlutenActive ? 1 : 0) +
    (isSansLactoseActive ? 1 : 0) +
    (activeMacroFilter !== 'all' ? 1 : 0);

  const totalActiveFiltersCount =
    selectedAllergens.length +
    (isHalalOnly ? 1 : 0) +
    (isVeganOnly ? 1 : 0) +
    (isVegetarianOnly ? 1 : 0) +
    (activeMacroFilter !== 'all' ? 1 : 0);

  const handleClearAllMenuFilters = () => {
    setSearchQuery('');
    if (onResetAllergens) onResetAllergens();
    if (isHalalOnly && onToggleHalal) onToggleHalal();
    if (isVeganOnly && onToggleVegan) onToggleVegan();
    setIsVegetarianOnly(false);
    if (onMacroFilterChange) onMacroFilterChange('all');
  };

  const handleClearRegimes = () => {
    if (isHalalOnly && onToggleHalal) onToggleHalal();
    if (isVeganOnly && onToggleVegan) onToggleVegan();
    setIsVegetarianOnly(false);
    if (onMacroFilterChange) onMacroFilterChange('all');
    if (isSansGlutenActive && onToggleAllergen) onToggleAllergen('gluten');
    if (isSansLactoseActive && onToggleAllergen) onToggleAllergen('lactose');
  };

  const getDishName = (dish: Dish) => {
    if (!dish) return '';
    if (currentLang === 'it' && dish.name_it) return dish.name_it;
    if (currentLang === 'en' && dish.name_en) return dish.name_en;
    return dish.name_fr || dish.name || '';
  };

  const getDishDesc = (dish: Dish) => {
    return dish.description || '';
  };

  const getCategoryName = (catId: string, defaultName: string) => {
    const cat = restaurant.categories.find((c) => c.id === catId);
    if (!cat) return defaultName;
    if (currentLang === 'fr' && cat.name_fr) return cat.name_fr;
    if (currentLang === 'it' && cat.name_it) return cat.name_it;
    if (currentLang === 'en' && cat.name_en) return cat.name_en;
    return cat.name || defaultName;
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'utensils':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'sparkles':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'wheat':
        return <Wheat className="w-3.5 h-3.5" />;
      case 'flame':
        return <Flame className="w-3.5 h-3.5" />;
      case 'cake':
        return <Cake className="w-3.5 h-3.5" />;
      case 'wine':
        return <Wine className="w-3.5 h-3.5" />;
      case 'coffee':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'tag':
        return <Tag className="w-3.5 h-3.5" />;
      default:
        return <Utensils className="w-3.5 h-3.5" />;
    }
  };

  // Filter single dish against all active criteria: search query, allergens, halal, vegan, and macros
  const filterDishMatches = (d: Dish) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      d.name.toLowerCase().includes(q) ||
      (d.name_fr && d.name_fr.toLowerCase().includes(q)) ||
      (d.name_it && d.name_it.toLowerCase().includes(q)) ||
      (d.name_en && d.name_en.toLowerCase().includes(q)) ||
      d.description.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q)) ||
      (q === 'halal' && (d.isHalal || restaurant.isHalalCertified));

    // Exclude dish if it contains ANY selected allergen
    const matchAllergens =
      selectedAllergens.length === 0 ||
      !d.allergens.some((a) => selectedAllergens.includes(a));

    // Halal filter
    const matchHalal =
      !isHalalOnly ||
      d.isHalal === true ||
      restaurant.isHalalCertified === true ||
      d.tags.some((t) => t.toLowerCase() === 'halal');

    // Vegan filter
    const matchVegan =
      !isVeganOnly ||
      d.isVegan === true ||
      d.tags.some((t) => {
        const lower = t.toLowerCase();
        return lower === 'végétalien' || lower === 'vegan';
      });

    // Vegetarian filter
    const matchVegetarian =
      !isVegetarianOnly ||
      d.isVegan === true ||
      d.tags.some((t) => {
        const lower = t.toLowerCase();
        return lower.includes('végétarien') || lower.includes('veggie') || lower.includes('vegetariano');
      });

    // Macro filter
    let matchMacro = true;
    if (activeMacroFilter && activeMacroFilter !== 'all') {
      if (activeMacroFilter === 'high-protein') matchMacro = d.nutrition.protein >= 25;
      else if (activeMacroFilter === 'low-cal') matchMacro = d.nutrition.kcal <= 500;
      else if (activeMacroFilter === 'low-carb') matchMacro = d.nutrition.carbs <= 20;
      else if (activeMacroFilter === 'low-fat') matchMacro = d.nutrition.fat <= 12;
      else if (activeMacroFilter === 'high-cal') matchMacro = d.nutrition.kcal >= 700;
      else if (activeMacroFilter === 'veg') {
        matchMacro = d.tags.some((t) => t.toLowerCase().includes('végétarien'));
      } else if (activeMacroFilter === 'halal') {
        matchMacro =
          d.isHalal === true ||
          restaurant.isHalalCertified === true ||
          d.tags.some((t) => t.toLowerCase() === 'halal');
      }
    }

    return matchQuery && matchAllergens && matchHalal && matchVegan && matchVegetarian && matchMacro;
  };

  // Filter dishes by category and active criteria
  const categorizedDishes = useMemo(() => {
    const activeCats =
      activeCategoryId === 'all'
        ? restaurant.categories.filter((c) => c.id !== 'all')
        : restaurant.categories.filter((c) => c.id === activeCategoryId);

    return activeCats.map((cat) => {
      const dishes = restaurant.dishes.filter(
        (d) => d.categoryId === cat.id && filterDishMatches(d)
      );

      return {
        category: cat,
        dishes,
      };
    });
  }, [
    restaurant,
    activeCategoryId,
    searchQuery,
    selectedAllergens,
    isHalalOnly,
    isVeganOnly,
    isVegetarianOnly,
    activeMacroFilter,
  ]);

  // Total matching dishes across entire restaurant menu
  const totalMatchingDishes = useMemo(() => {
    return restaurant.dishes.filter(filterDishMatches).length;
  }, [restaurant, searchQuery, selectedAllergens, isHalalOnly, isVeganOnly, isVegetarianOnly, activeMacroFilter]);

  // Category matching dish counter
  const getCategoryMatchingCount = (catId: string) => {
    if (catId === 'all') {
      return totalMatchingDishes;
    }
    return restaurant.dishes.filter((d) => d.categoryId === catId && filterDishMatches(d)).length;
  };

  const spotlightDish = restaurant.dishes[0];
  const isSpotlightMatch = spotlightDish && filterDishMatches(spotlightDish);

  return (
    <div className="min-h-screen">
      {/* Top sticky return bar */}
      <div className="bg-stone-900 text-white px-4 py-2 text-xs flex items-center justify-between sticky top-0 z-50 shadow-md">
        <button
          onClick={onBackToPortal}
          className="flex items-center gap-1.5 font-bold hover:text-amber-300 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToHub')}</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-stone-300 hidden sm:inline">
            {restaurant.name}
          </span>
          <span className="bg-[#99281a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {restaurant.cuisine}
          </span>
        </div>
      </div>

      {/* Italian ribbon accent for Italian dining */}
      {(restaurant.id === 'trattoria-bella-vista' || restaurant.id === 'la-cave-a-pizza-aubagne') && (
        <div className="h-1.5 w-full bg-italian-ribbon hidden md:block md:fixed md:top-8 left-0 z-40 shadow-xs"></div>
      )}

      {/* Main restaurant container */}
      <div className="min-h-screen pt-2 md:pt-4 pb-28 max-w-7xl mx-auto relative z-10 bg-[#faf7f2]/95 backdrop-blur-md shadow-2xl border-x border-stone-300/80">
        
        {/* Header - on mobile it scrolls away naturally so search bar does not descend with scroll */}
        <header className="relative md:sticky md:top-8 z-30 bg-[#faf7f2]/95 backdrop-blur-xl border-b border-stone-200/90 shadow-xs transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3">
            
            {/* Upper control bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200/70 text-xs">
              
              {/* Open status */}
              <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase text-stone-600">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    restaurant.openingHours.isOpenNow
                      ? 'bg-emerald-600 shadow-[0_0_10px_#16a34a] animate-pulse'
                      : 'bg-rose-600'
                  }`}
                ></span>
                <span
                  className={
                    restaurant.openingHours.isOpenNow
                      ? 'text-emerald-800 font-bold'
                      : 'text-rose-700 font-bold'
                  }
                >
                  {restaurant.openingHours.isOpenNow ? t('open') : t('closed')}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-600 hidden sm:inline-flex items-center gap-1 font-sans">
                  <Clock className="w-3.5 h-3.5 text-[#99281a]" />
                  <span>
                    {restaurant.openingHours.days} : {restaurant.openingHours.lunch} & {restaurant.openingHours.dinner}
                  </span>
                </span>
              </div>

              {/* Action tools */}
              <div className="flex items-center gap-2 flex-wrap">
                
                {/* View Switcher: Photos vs Carte Élégante */}
                <div className="bg-stone-200/80 p-0.5 rounded-full flex items-center border border-stone-300/80 shadow-inner">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1 rounded-full text-[11px] sm:text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-white text-[#99281a] shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900 font-medium'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>{t('viewPhotos')}</span>
                  </button>
                  <button
                    onClick={() => setViewMode('classic')}
                    className={`px-3 py-1 rounded-full text-[11px] sm:text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      viewMode === 'classic'
                        ? 'bg-white text-[#99281a] shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900 font-medium'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="font-bold">Carte Élégante</span>
                  </button>
                </div>

                {/* Language Switcher */}
                <select
                  value={currentLang}
                  onChange={(e) => onLanguageChange(e.target.value as Language)}
                  className="bg-white hover:bg-stone-100 border border-stone-300 rounded-full px-2.5 py-1 text-[11px] font-bold text-stone-800 focus:outline-none cursor-pointer shadow-xs"
                >
                  <option value="fr">🇫🇷 FR</option>
                  <option value="it">🇮🇹 IT</option>
                  <option value="en">🇬🇧 EN</option>
                </select>

                {/* Allergen Modal Filter */}
                <button
                  onClick={onOpenAllergenModal}
                  className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition text-[11px] font-bold shadow-xs cursor-pointer ${
                    selectedAllergens.length > 0
                      ? 'bg-[#99281a] text-white border-[#99281a] animate-pulse'
                      : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <ShieldAlert
                    className={`w-3.5 h-3.5 ${
                      selectedAllergens.length > 0 ? 'text-white' : 'text-[#99281a]'
                    }`}
                  />
                  <span className="hidden sm:inline">{t('allergens')}</span>
                  {selectedAllergens.length > 0 && (
                    <span className="bg-white text-[#99281a] font-extrabold text-[9px] px-1.5 py-0.2 rounded-full">
                      {selectedAllergens.length}
                    </span>
                  )}
                </button>

                {/* Admin Portal (Espace Privé) */}
                {!isAdmin ? (
                  <button
                    onClick={onOpenAdminModal}
                    className="p-1.5 sm:px-3 sm:py-1 rounded-full bg-[#781524] hover:bg-[#99281a] text-white font-bold border border-amber-400/40 text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 shrink-0"
                    title="Accéder à l'Espace Privé"
                    aria-label="Accéder à l'Espace Privé"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="hidden sm:inline font-bold">{t('privateSpace')}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={onOpenAdminModal}
                      className="p-1.5 sm:px-3 sm:py-1 rounded-full bg-[#99281a] hover:bg-[#781524] text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      title="Gérer la carte"
                      aria-label="Gérer la carte"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Gérer la carte</span>
                    </button>
                    <button
                      onClick={onLogoutAdmin}
                      className="p-1.5 rounded-full bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 text-rose-600 transition cursor-pointer"
                      title={t('logout')}
                      aria-label={t('logout')}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Restaurant Brand Title & In-menu search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#781524] text-[#dfab43] border border-[#c58b2b]/40 flex items-center justify-center font-cinzel font-bold text-xl shadow-md shrink-0">
                  {restaurant.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 tracking-tight">
                    {restaurant.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-serif italic text-[#99281a] font-semibold tracking-wide">
                      {restaurant.tagline || t('tagline')}
                    </span>
                    <span className="text-stone-300 hidden sm:inline">•</span>
                    <span className="text-[11px] text-stone-500 font-mono hidden sm:inline">
                      {restaurant.cuisine}
                    </span>
                    {restaurant.isHalalCertified && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs inline-flex items-center gap-1">
                        <span>🥩</span>
                        <span>100% Halal</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* In-restaurant search & filter options toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                {/* Search text input */}
                <div className="relative w-full sm:w-56 md:w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un plat, ingrédient..."
                    className="w-full bg-white border border-stone-300 rounded-full pl-9 pr-8 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#99281a] focus:ring-2 focus:ring-[#99281a]/20 shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 p-0.5 rounded-full cursor-pointer"
                      title="Effacer la recherche"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Bouton Allergènes */}
                <button
                  type="button"
                  onClick={() => setActiveFilterTab((curr) => (curr === 'allergens' ? null : 'allergens'))}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs shrink-0 cursor-pointer border active:scale-95 ${
                    activeFilterTab === 'allergens'
                      ? 'bg-[#99281a] text-white border-[#99281a] ring-2 ring-[#99281a]/25 shadow-sm font-bold'
                      : selectedAllergens.length > 0
                      ? 'bg-red-50 text-red-900 border-red-300 hover:bg-red-100 font-bold'
                      : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300'
                  }`}
                  title="Filtrer les allergènes à exclure"
                >
                  <ShieldAlert
                    className={`w-3.5 h-3.5 ${
                      activeFilterTab === 'allergens'
                        ? 'text-white'
                        : selectedAllergens.length > 0
                        ? 'text-red-600'
                        : 'text-[#99281a]'
                    }`}
                  />
                  <span>Allergènes</span>
                  {selectedAllergens.length > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black flex items-center justify-center ${
                        activeFilterTab === 'allergens' ? 'bg-white text-[#99281a]' : 'bg-red-600 text-white'
                      }`}
                    >
                      {selectedAllergens.length}
                    </span>
                  )}
                </button>

                {/* Bouton Régimes */}
                <button
                  type="button"
                  onClick={() => setActiveFilterTab((curr) => (curr === 'regimes' ? null : 'regimes'))}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs shrink-0 cursor-pointer border active:scale-95 ${
                    activeFilterTab === 'regimes'
                      ? 'bg-emerald-800 text-white border-emerald-900 ring-2 ring-emerald-700/25 shadow-sm font-bold'
                      : activeRegimesCount > 0
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 font-bold'
                      : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300'
                  }`}
                  title="Options des régimes alimentaires"
                >
                  <Leaf
                    className={`w-3.5 h-3.5 ${
                      activeFilterTab === 'regimes'
                        ? 'text-white'
                        : activeRegimesCount > 0
                        ? 'text-emerald-700'
                        : 'text-emerald-700'
                    }`}
                  />
                  <span>Régimes</span>
                  {activeRegimesCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black flex items-center justify-center ${
                        activeFilterTab === 'regimes' ? 'bg-white text-emerald-800' : 'bg-emerald-700 text-white'
                      }`}
                    >
                      {activeRegimesCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Dedicated Filter Panel: Allergènes or Régimes */}
            {activeFilterTab && (
              <div className="mt-3.5 p-3.5 sm:p-4 bg-stone-50/95 border border-stone-200/90 rounded-2xl shadow-xs animate-in fade-in duration-200 space-y-3">
                {/* Header of the panel with Sub-tabs and actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-stone-200/70">
                  {/* Segmented Switch between Allergènes & Régimes */}
                  <div className="inline-flex items-center bg-stone-200/80 p-1 rounded-xl gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('allergens')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        activeFilterTab === 'allergens'
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                      <span>Allergènes</span>
                      {selectedAllergens.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {selectedAllergens.length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('regimes')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        activeFilterTab === 'regimes'
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Options des régimes</span>
                      {activeRegimesCount > 0 && (
                        <span className="bg-emerald-700 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {activeRegimesCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Panel Actions (Reset current category & Close) */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {activeFilterTab === 'allergens' && selectedAllergens.length > 0 && (
                      <button
                        type="button"
                        onClick={onResetAllergens}
                        className="text-xs text-[#99281a] hover:text-[#781524] underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Réinitialiser les allergènes</span>
                      </button>
                    )}

                    {activeFilterTab === 'regimes' && activeRegimesCount > 0 && (
                      <button
                        type="button"
                        onClick={handleClearRegimes}
                        className="text-xs text-emerald-800 hover:text-emerald-950 underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Réinitialiser les régimes</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveFilterTab(null)}
                      className="text-xs text-stone-500 hover:text-stone-800 p-1 rounded-lg hover:bg-stone-200/60 cursor-pointer flex items-center gap-1"
                      title="Masquer le volet"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Masquer</span>
                    </button>
                  </div>
                </div>

                {/* Tab 1: Allergènes */}
                {activeFilterTab === 'allergens' && (
                  <div className="space-y-2">
                    <p className="text-xs text-stone-600 font-medium">
                      Exclure les plats contenant : <span className="text-stone-400 font-normal">(cliquez sur un allergène pour l'éliminer de la carte)</span>
                    </p>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
                      {ALLERGENS_MASTER_LIST.map((alg) => {
                        const isSelected = selectedAllergens.includes(alg.id);
                        const name =
                          currentLang === 'it'
                            ? alg.name_it
                            : currentLang === 'en'
                            ? alg.name_en
                            : alg.name;

                        return (
                          <button
                            type="button"
                            key={alg.id}
                            onClick={() => onToggleAllergen && onToggleAllergen(alg.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 border cursor-pointer ${
                              isSelected
                                ? 'bg-red-600 text-white border-red-700 font-bold shadow-xs'
                                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                            }`}
                          >
                            <span className="text-sm">{alg.icon}</span>
                            <span>{isSelected ? `Sans ${name}` : name}</span>
                            {isSelected && <X className="w-3 h-3 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab 2: Options des Régimes */}
                {activeFilterTab === 'regimes' && (
                  <div className="space-y-2">
                    <p className="text-xs text-stone-600 font-medium">
                      Sélectionnez vos régimes & objectifs : <span className="text-stone-400 font-normal">(cumulable)</span>
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-0.5">
                      {/* Halal */}
                      {onToggleHalal && (
                        <button
                          type="button"
                          onClick={onToggleHalal}
                          className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                            isHalalOnly
                              ? 'bg-emerald-700 text-white border-emerald-800 font-bold shadow-xs'
                              : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-base">🥩</span>
                            {isHalalOnly && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="mt-1">
                            <div className="text-xs font-bold">100% Halal</div>
                            <div className={`text-[10px] line-clamp-1 ${isHalalOnly ? 'text-emerald-100' : 'text-stone-500'}`}>
                              Viande certifiée
                            </div>
                          </div>
                        </button>
                      )}

                      {/* Végétarien */}
                      <button
                        type="button"
                        onClick={() => setIsVegetarianOnly((prev) => !prev)}
                        className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                          isVegetarianOnly
                            ? 'bg-lime-700 text-white border-lime-800 font-bold shadow-xs'
                            : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base">🌱</span>
                          {isVegetarianOnly && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="mt-1">
                          <div className="text-xs font-bold">Végétarien</div>
                          <div className={`text-[10px] line-clamp-1 ${isVegetarianOnly ? 'text-lime-100' : 'text-stone-500'}`}>
                            Sans viande ni poisson
                          </div>
                        </div>
                      </button>

                      {/* Végétalien / Vegan */}
                      {onToggleVegan && (
                        <button
                          type="button"
                          onClick={onToggleVegan}
                          className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                            isVeganOnly
                              ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs'
                              : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-base">🥑</span>
                            {isVeganOnly && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="mt-1">
                            <div className="text-xs font-bold">Végétalien (Vegan)</div>
                            <div className={`text-[10px] line-clamp-1 ${isVeganOnly ? 'text-emerald-100' : 'text-stone-500'}`}>
                              100% végétal
                            </div>
                          </div>
                        </button>
                      )}

                      {/* Sans Gluten */}
                      <button
                        type="button"
                        onClick={() => onToggleAllergen && onToggleAllergen('gluten')}
                        className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                          isSansGlutenActive
                            ? 'bg-amber-600 text-white border-amber-700 font-bold shadow-xs'
                            : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base">🌾</span>
                          {isSansGlutenActive && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="mt-1">
                          <div className="text-xs font-bold">Sans Gluten</div>
                          <div className={`text-[10px] line-clamp-1 ${isSansGlutenActive ? 'text-amber-100' : 'text-stone-500'}`}>
                            Sans blé, orge, seigle
                          </div>
                        </div>
                      </button>

                      {/* Sans Lactose */}
                      <button
                        type="button"
                        onClick={() => onToggleAllergen && onToggleAllergen('lactose')}
                        className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                          isSansLactoseActive
                            ? 'bg-blue-600 text-white border-blue-700 font-bold shadow-xs'
                            : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base">🥛</span>
                          {isSansLactoseActive && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="mt-1">
                          <div className="text-xs font-bold">Sans Lactose</div>
                          <div className={`text-[10px] line-clamp-1 ${isSansLactoseActive ? 'text-blue-100' : 'text-stone-500'}`}>
                            Sans produits laitiers
                          </div>
                        </div>
                      </button>

                      {/* Riche en Protéines */}
                      {onMacroFilterChange && (
                        <button
                          type="button"
                          onClick={() => onMacroFilterChange(isHighProtein ? 'all' : 'high-protein')}
                          className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                            isHighProtein
                              ? 'bg-[#c58b2b] text-stone-950 border-amber-600 font-black shadow-xs'
                              : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-base">💪</span>
                            {isHighProtein && <Check className="w-3.5 h-3.5 text-stone-950" />}
                          </div>
                          <div className="mt-1">
                            <div className="text-xs font-bold">Protéiné (&gt;25g)</div>
                            <div className={`text-[10px] line-clamp-1 ${isHighProtein ? 'text-stone-900' : 'text-stone-500'}`}>
                              Sport & fitness
                            </div>
                          </div>
                        </button>
                      )}

                      {/* Moins de 500 Kcal */}
                      {onMacroFilterChange && (
                        <button
                          type="button"
                          onClick={() => onMacroFilterChange(isLowCal ? 'all' : 'low-cal')}
                          className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                            isLowCal
                              ? 'bg-teal-700 text-white border-teal-800 font-bold shadow-xs'
                              : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-base">🥗</span>
                            {isLowCal && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="mt-1">
                            <div className="text-xs font-bold">&lt; 500 Kcal</div>
                            <div className={`text-[10px] line-clamp-1 ${isLowCal ? 'text-teal-100' : 'text-stone-500'}`}>
                              Léger & équilibré
                            </div>
                          </div>
                        </button>
                      )}

                      {/* Low Carb */}
                      {onMacroFilterChange && (
                        <button
                          type="button"
                          onClick={() => onMacroFilterChange(isLowCarb ? 'all' : 'low-carb')}
                          className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                            isLowCarb
                              ? 'bg-cyan-700 text-white border-cyan-800 font-bold shadow-xs'
                              : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-base">🥑</span>
                            {isLowCarb && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="mt-1">
                            <div className="text-xs font-bold">Low Carb</div>
                            <div className={`text-[10px] line-clamp-1 ${isLowCarb ? 'text-cyan-100' : 'text-stone-500'}`}>
                              ≤ 20g de glucides
                            </div>
                          </div>
                        </button>
                      )}

                      {/* Faible en matières grasses */}
                      {onMacroFilterChange && (
                        <button
                          type="button"
                          onClick={() => onMacroFilterChange(isLowFat ? 'all' : 'low-fat')}
                          className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                            isLowFat
                              ? 'bg-sky-700 text-white border-sky-800 font-bold shadow-xs'
                              : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-base">💧</span>
                            {isLowFat && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="mt-1">
                            <div className="text-xs font-bold">Faible en gras</div>
                            <div className={`text-[10px] line-clamp-1 ${isLowFat ? 'text-sky-100' : 'text-stone-500'}`}>
                              ≤ 12g de lipides
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Categories Nav Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-200 bg-[#f6f1e8]/90">
            <nav className="flex overflow-x-auto no-scrollbar py-2.5 gap-2 sm:gap-2.5 scroll-smooth">
              {restaurant.categories.map((cat) => {
                const count = getCategoryMatchingCount(cat.id);

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap flex items-center gap-2 transition shrink-0 shadow-2xs cursor-pointer ${
                      activeCategoryId === cat.id
                        ? 'bg-[#781524] text-white font-bold shadow-md ring-2 ring-[#c58b2b]/50 scale-105'
                        : 'bg-white text-stone-700 hover:text-[#781524] border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span>{getCategoryIcon(cat.iconName)}</span>
                    <span>{getCategoryName(cat.id, cat.name)}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        activeCategoryId === cat.id
                          ? 'bg-[#c58b2b] text-stone-900'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Chef Spotlight Banner - only if compatible with active filters and not searching */}
        {isSpotlightMatch && activeCategoryId === 'all' && !searchQuery && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#781524] via-[#99281a] to-[#1e4e2b] text-white p-5 sm:p-6 shadow-classic border border-[#c58b2b]/30">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#c58b2b] text-stone-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider font-cinzel shadow-sm">
                      {t('dishOfDay')}
                    </span>
                    <span className="text-xs text-amber-200 italic font-serif">
                      {t('chefSuggestion')}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                    {getDishName(spotlightDish)}
                  </h2>
                  <p className="text-xs text-stone-200/90 leading-relaxed font-sans line-clamp-2">
                    {getDishDesc(spotlightDish)}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    <span className="font-serif text-lg font-bold text-[#dfab43]">
                      {formatPrice(spotlightDish.price)}
                    </span>
                    {spotlightDish.winePairing && (
                      <span className="bg-white/15 px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 backdrop-blur-sm">
                        <Wine className="w-3.5 h-3.5 text-amber-300" />
                        <span>{spotlightDish.winePairing}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Actions: View Dish Card & Phone Booking */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                  {isAdmin && onEditDish && (
                    <button
                      type="button"
                      onClick={() => onEditDish(spotlightDish)}
                      className="flex items-center justify-center gap-1.5 bg-white/95 hover:bg-white text-stone-900 px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm hover:scale-105 cursor-pointer border border-stone-200"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#99281a]" />
                      <span>Modifier dans l'espace privé</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenDishDetail(spotlightDish)}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-amber-50 text-stone-900 px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm hover:scale-105 cursor-pointer"
                  >
                    <span>Consulter la fiche & commander</span>
                    <ChevronRight className="w-4 h-4 text-[#99281a]" />
                  </button>

                  <a
                    href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
                    className="flex items-center justify-center gap-2 bg-[#c58b2b] hover:bg-amber-400 text-stone-950 px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm hover:scale-105"
                  >
                    <PhoneCall className="w-4 h-4 text-stone-950" />
                    <span>
                      {t('book')} : <strong>{restaurant.phone}</strong>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dishes Listing by Categories */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          {/* Carte Élégante Title Header */}
          {viewMode === 'classic' && (
            <div className="text-center py-6 border-b border-stone-300 bg-white/60 rounded-3xl p-6 shadow-2xs backdrop-blur-xs">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#99281a] font-serif font-bold block mb-1">
                Menu Traditionnel de la Maison
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
                Carte Élégante
              </h2>
              <div className="w-16 h-0.5 bg-[#dfab43] mx-auto mt-2.5 mb-1.5"></div>
              <p className="text-xs text-stone-500 font-serif italic max-w-md mx-auto">
                {restaurant.name} • Présentation épurée avec détails nutritionnels et provenance des ingrédients
              </p>
            </div>
          )}

          {/* Active Filters Summary Badge Strip */}
          {(totalActiveFiltersCount > 0 || searchQuery) && (
            <div className="bg-stone-100/90 border border-stone-200/90 rounded-2xl p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#99281a]" />
                  <span>Filtres appliqués :</span>
                </span>

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-stone-200 text-stone-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    <span>Recherche : &laquo; {searchQuery} &raquo;</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="hover:text-stone-950 cursor-pointer ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedAllergens.map((algId) => {
                  const alg = ALLERGENS_MASTER_LIST.find((a) => a.id === algId);
                  const name =
                    currentLang === 'it'
                      ? alg?.name_it
                      : currentLang === 'en'
                      ? alg?.name_en
                      : alg?.name;
                  return (
                    <span
                      key={algId}
                      className="inline-flex items-center gap-1 bg-red-100 text-red-900 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    >
                      <span>{alg?.icon}</span>
                      <span>Sans {name}</span>
                      <button
                        type="button"
                        onClick={() => onToggleAllergen && onToggleAllergen(algId)}
                        className="hover:text-red-950 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}

                {isHalalOnly && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <span>🥩</span>
                    <span>100% Halal</span>
                    <button
                      type="button"
                      onClick={onToggleHalal}
                      className="hover:text-emerald-950 cursor-pointer ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {isVeganOnly && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <span>🥑</span>
                    <span>{t('vegan')}</span>
                    <button
                      type="button"
                      onClick={onToggleVegan}
                      className="hover:text-emerald-950 cursor-pointer ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {isVegetarianOnly && (
                  <span className="inline-flex items-center gap-1 bg-lime-100 text-lime-900 border border-lime-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <span>🌱</span>
                    <span>Végétarien</span>
                    <button
                      type="button"
                      onClick={() => setIsVegetarianOnly(false)}
                      className="hover:text-lime-950 cursor-pointer ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeMacroFilter && activeMacroFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 border border-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <span>
                      {activeMacroFilter === 'high-protein'
                        ? '💪 Protéines (>25g)'
                        : activeMacroFilter === 'low-cal'
                        ? '🥗 < 500 Kcal'
                        : activeMacroFilter === 'low-carb'
                        ? '🥑 Low Carb'
                        : activeMacroFilter === 'low-fat'
                        ? '💧 Faible en gras'
                        : activeMacroFilter === 'high-cal'
                        ? '⚡ Riche en énergie'
                        : '🌱 Végétarien'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onMacroFilterChange && onMacroFilterChange('all')}
                      className="hover:text-amber-950 cursor-pointer ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span className="text-xs font-mono text-stone-600 font-semibold">
                  {totalMatchingDishes} {t('safeDishesFound')}
                </span>
                <button
                  type="button"
                  onClick={handleClearAllMenuFilters}
                  className="text-xs text-[#99281a] hover:text-[#781524] underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('resetFilters')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Empty state if 0 dishes match */}
          {totalMatchingDishes === 0 && (
            <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-stone-200/90 rounded-3xl text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <ShieldAlert className="w-7 h-7 text-[#99281a]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  {t('noSafeDishes')}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  Aucun plat de la carte ne correspond à la combinaison actuelle de recherche, allergènes exclus et options diététiques.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClearAllMenuFilters}
                  className="px-5 py-2.5 rounded-full bg-[#99281a] hover:bg-[#781524] text-white font-bold text-xs transition shadow-sm cursor-pointer inline-flex items-center gap-2 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser les critères et allergènes</span>
                </button>
              </div>
            </div>
          )}
          {categorizedDishes.map((group) => {
            if (group.dishes.length === 0) return null;

            return (
              <section key={group.category.id} className="space-y-6">
                
                {/* Category header */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-stone-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-[#781524]/10 border border-[#781524]/20 text-[#781524]">
                      {getCategoryIcon(group.category.iconName)}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-wide">
                        {getCategoryName(group.category.id, group.category.name)}
                      </h2>
                      <p className="text-xs text-stone-500 font-serif italic">
                        {group.dishes.length} {t('specialtiesCount')}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200">
                    {group.dishes.length} {t('dishesUnit')}
                  </span>
                </div>

                {/* MODE 1: MODERN PHOTO CARDS */}
                {viewMode === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.dishes.map((dish) => (
                      <article
                        key={dish.id}
                        onClick={() => onOpenDishDetail(dish)}
                        className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#8a3311]/50 active:scale-[0.985] transition-all duration-200 flex flex-col justify-between group cursor-pointer touch-manipulation"
                      >
                        <div>
                          {/* Photo */}
                          <div
                            className="relative h-56 w-full bg-stone-100 overflow-hidden"
                          >
                            <img
                              src={dish.image}
                              alt={getDishName(dish)}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                              }}
                            />

                            {/* Tags */}
                            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                              {dish.isHalal && (
                                <span className="bg-emerald-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <span>🥩</span> Halal
                                </span>
                              )}
                              {dish.isVegan && (
                                <span className="bg-teal-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <span>🥑</span> Végétalien
                                </span>
                              )}
                              {dish.tags
                                .filter((tag) => {
                                  const lower = tag.toLowerCase();
                                  if (dish.isHalal && lower === 'halal') return false;
                                  if (dish.isVegan && (lower === 'végétalien' || lower === 'vegan')) return false;
                                  return true;
                                })
                                .map((tag) => (
                                <span
                                  key={tag}
                                  className="bg-stone-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Admin Quick Edit Button */}
                            {isAdmin && onEditDish && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditDish(dish);
                                }}
                                className="absolute top-3 right-3 bg-white/95 hover:bg-white text-stone-800 p-2 rounded-full shadow-md border border-stone-200 transition hover:scale-105 z-10 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                                title="Modifier ce plat dans l'espace privé"
                              >
                                <Pencil className="w-3.5 h-3.5 text-[#99281a]" />
                                <span className="hidden sm:inline">Modifier</span>
                              </button>
                            )}

                            {/* Calories & Portion */}
                            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-stone-800 text-[11px] font-bold border border-stone-200 flex items-center gap-1.5 shadow-2xs">
                              <Flame className="w-3 h-3 text-[#99281a]" />
                              <span>{dish.nutrition.kcal} Kcal</span>
                              <span className="text-stone-300">•</span>
                              <span className="text-stone-500 font-normal">
                                {dish.portion || '350g'}
                              </span>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <h3
                                className="text-lg font-bold font-serif text-stone-900 hover:text-[#99281a] transition-colors cursor-pointer"
                                onClick={() => onOpenDishDetail(dish)}
                              >
                                {getDishName(dish)}
                              </h3>
                              <div className="flex items-center gap-2 shrink-0">
                                {isAdmin && onEditDish && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditDish(dish);
                                    }}
                                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 transition cursor-pointer"
                                    title="Modifier ce plat dans l'espace privé"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-[#99281a]" />
                                  </button>
                                )}
                                <span className="text-xl font-extrabold text-[#99281a] font-serif">
                                  {formatPrice(dish.price)}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                              {getDishDesc(dish)}
                            </p>

                            {/* Macro Breakdown */}
                            <div className="pt-2 border-t border-stone-100 grid grid-cols-4 gap-1.5 text-center text-xs">
                              <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-1">
                                <span className="block text-[9px] uppercase font-bold text-stone-400">
                                  Prot.
                                </span>
                                <span className="font-bold text-stone-800">
                                  {dish.nutrition.protein}g
                                </span>
                              </div>
                              <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-1">
                                <span className="block text-[9px] uppercase font-bold text-stone-400">
                                  Gluc.
                                </span>
                                <span className="font-bold text-stone-800">
                                  {dish.nutrition.carbs}g
                                </span>
                              </div>
                              <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-1">
                                <span className="block text-[9px] uppercase font-bold text-stone-400">
                                  Lip.
                                </span>
                                <span className="font-bold text-stone-800">
                                  {dish.nutrition.fat}g
                                </span>
                              </div>
                              <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-1">
                                <span className="block text-[9px] uppercase font-bold text-stone-400">
                                  Origine
                                </span>
                                <span className="font-bold text-[#781524] truncate block text-[11px]">
                                  {dish.region || 'Frais'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-5 pt-0 border-t border-stone-100 mt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDishDetail(dish);
                            }}
                            className="w-full py-2.5 px-4 rounded-2xl bg-stone-50 hover:bg-[#8a3311] active:bg-[#71290d] text-stone-700 hover:text-white active:text-white text-xs font-bold transition flex items-center justify-between group/btn cursor-pointer shadow-2xs touch-manipulation"
                          >
                            <span className="flex items-center gap-2">
                              <span>🍽️</span>
                              <span>Consulter la fiche & commander</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-stone-400 group-hover/btn:text-white transition-transform group-hover/btn:translate-x-0.5" />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {/* MODE 2: CLASSIC ELEGANT PAPER MENU */}
                {viewMode === 'classic' && (
                  <div className="bg-white border border-stone-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                    {group.dishes.map((dish) => (
                      <div
                        key={dish.id}
                        className="space-y-1 pb-4 border-b border-stone-100 last:border-0 cursor-pointer hover:bg-stone-50/80 active:bg-stone-100 p-3 rounded-2xl transition touch-manipulation"
                        onClick={() => onOpenDishDetail(dish)}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-serif font-bold text-stone-900">
                              {getDishName(dish)}
                            </h3>
                            {dish.isHalal && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-0.5">
                                <span>🥩</span> Halal
                              </span>
                            )}
                            {dish.isVegan && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold border border-teal-300 flex items-center gap-0.5">
                                <span>🥑</span> Végétalien
                              </span>
                            )}
                            {dish.region && (
                              <span className="text-[10px] text-[#781524] font-serif italic">
                                ({dish.region})
                              </span>
                            )}
                          </div>
                          <div className="grow mx-3 dotted-leader hidden sm:block h-3"></div>
                          <span className="text-lg font-serif font-bold text-[#99281a] shrink-0">
                            {formatPrice(dish.price)}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {getDishDesc(dish)}
                        </p>
                        <div className="text-[10px] font-mono text-stone-400">
                          <span>
                            {dish.nutrition.kcal} kcal • Prot: {dish.nutrition.protein}g • Gluc: {dish.nutrition.carbs}g • Lip: {dish.nutrition.fat}g
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </main>

        {/* Restaurant Footer */}
        <footer className="mt-16 border-t border-stone-300/80 bg-[#f6f1e8] pt-8 pb-10 px-4 text-center">
          <h3 className="text-xl font-serif font-bold text-stone-900">
            {restaurant.name}
          </h3>
          <p className="text-xs text-stone-600 mt-1">
            {restaurant.address} • {restaurant.phone}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={onOpenQrModal}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5 text-[#781524]" />
              <span>Afficher le QR Code Table</span>
            </button>
            <button
              onClick={onBackToPortal}
              className="px-6 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition cursor-pointer shadow-md"
            >
              {t('backToHub')}
            </button>
          </div>
        </footer>
        {/* Floating Mobile Espace Privé Quick Access Button */}
        {onOpenAdminModal && (
          <div
            className={`fixed ${
              orderCount > 0 ? 'bottom-24' : 'bottom-5'
            } right-4 z-40 sm:hidden transition-all duration-300`}
          >
            <button
              onClick={onOpenAdminModal}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#99281a] to-[#781524] text-white border-2 border-[#dfab43]/80 shadow-xl flex items-center justify-center cursor-pointer active:scale-90 transition hover:scale-105"
              title="Accéder à l'Espace Privé"
              aria-label="Accéder à l'Espace Privé"
            >
              {isAdmin ? (
                <SlidersHorizontal className="w-5 h-5 text-amber-300" />
              ) : (
                <KeyRound className="w-5 h-5 text-amber-300" />
              )}
            </button>
          </div>
        )}

        {/* Floating Bottom Table Order Bar */}
        {orderCount > 0 && onOpenOrderModal && (
          <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 z-40 max-w-md animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-stone-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#8a3311] flex items-center justify-center text-white text-base shadow-inner">
                  🛍️
                </div>
                <div>
                  <span className="text-xs text-stone-300 block">
                    Votre commande table
                  </span>
                  <span className="text-sm font-bold text-white">
                    {orderCount} {orderCount > 1 ? 'plats' : 'plat'} • <span className="text-[#dfab43]">{formatPrice(orderTotal)}</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenOrderModal}
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                Consulter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
