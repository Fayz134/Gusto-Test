import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  LayoutGrid,
  BookOpen,
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
  Crown,
  Star,
  MapPin,
  Phone,
  ExternalLink,
  Sliders,
  ShieldCheck,
  Globe,
  Instagram,
  Facebook,
  Link as LinkIcon,
  Share2,
  Plus,
} from 'lucide-react';
import { Restaurant, Language, ViewMode, Dish, MacroFilterType, ComposedMealItem, MealCourseType } from '../types';
import { I18N_DICT, ALLERGENS_MASTER_LIST } from '../data/i18n';
import { formatPrice } from '../utils/geo';
import { getAutoDishName, getAutoCategoryName, getAutoDishDesc, getAutoCuisineName, getAutoTagLabel } from '../utils/translator';
import { RestaurantCustomizerModal } from './RestaurantCustomizerModal';
import { RestaurantReviewsModal } from './RestaurantReviewsModal';
import { RestaurantSocialLinksModal } from './RestaurantSocialLinksModal';
import { MealComposerModal } from './MealComposerModal';
import { calculateMealTotals, detectDishCourse } from '../utils/mealComposer';
import { trackPhoneCall } from '../utils/analytics';

interface RestaurantViewProps {
  restaurant: Restaurant;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onBackToPortal: () => void;
  onOpenDishDetail: (dish: Dish) => void;
  onOpenQrModal?: () => void;
  onOpenBillModal?: () => void;
  onOpenAllergenModal: () => void;
  onOpenAdminModal: () => void;
  onOpenCreatorDashboard?: () => void;
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
  onEditDish?: (dish: Dish) => void;
  onToggleDishOfTheMoment?: (dishId: string | null, enabled: boolean) => void;
  onShowToast?: (msg: string) => void;
  onUpdateRestaurant?: (updatedRestaurant: Restaurant) => void;
  composedMeal?: ComposedMealItem[];
  onAddToMeal?: (dish: Dish, course?: MealCourseType) => void;
  onRemoveFromMeal?: (dishId: string) => void;
  onUpdateMealQuantity?: (dishId: string, delta: number) => void;
  onChangeMealCourse?: (dishId: string, newCourse: MealCourseType) => void;
  onClearMeal?: () => void;
  isMealComposerOpen?: boolean;
  onOpenMealComposer?: () => void;
  onCloseMealComposer?: () => void;
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
  onOpenCreatorDashboard,
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
  onEditDish,
  onToggleDishOfTheMoment,
  onShowToast,
  onUpdateRestaurant,
  composedMeal = [],
  onAddToMeal,
  onRemoveFromMeal,
  onUpdateMealQuantity,
  onChangeMealCourse,
  onClearMeal,
  isMealComposerOpen,
  onOpenMealComposer,
  onCloseMealComposer,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  // Resolve externalLinks (site web, UberEats, Deliveroo) and socialLinks (Instagram, Facebook, TikTok)
  const resolvedExternalLinks = useMemo(() => ({
    website: restaurant.externalLinks?.website || restaurant.socialLinks?.website,
    uberEats: restaurant.externalLinks?.uberEats || restaurant.socialLinks?.uberEats,
    deliveroo: restaurant.externalLinks?.deliveroo || restaurant.socialLinks?.deliveroo,
    googleMaps: restaurant.externalLinks?.googleMaps || restaurant.socialLinks?.googleMaps,
    customLabel: restaurant.externalLinks?.customLabel || restaurant.socialLinks?.customLabel,
    customUrl: restaurant.externalLinks?.customUrl || restaurant.socialLinks?.customUrl,
  }), [restaurant.externalLinks, restaurant.socialLinks]);

  const resolvedSocialLinks = useMemo(() => ({
    instagram: restaurant.socialLinks?.instagram,
    facebook: restaurant.socialLinks?.facebook,
    tiktok: restaurant.socialLinks?.tiktok,
  }), [restaurant.socialLinks]);

  const hasExternalLinks = Boolean(
    resolvedExternalLinks.website ||
    resolvedExternalLinks.uberEats ||
    resolvedExternalLinks.deliveroo
  );

  const hasSocialLinks = Boolean(
    resolvedSocialLinks.instagram ||
    resolvedSocialLinks.facebook ||
    resolvedSocialLinks.tiktok
  );

  const hasAnyLinks = hasExternalLinks || hasSocialLinks || Boolean(resolvedExternalLinks.googleMaps || resolvedExternalLinks.customUrl);
  const hasAnySocialLinks = hasAnyLinks;

  // Meal Composer helpers and fallback state
  const [internalMealComposerOpen, setInternalMealComposerOpen] = useState(false);
  const isComposerOpen = isMealComposerOpen !== undefined ? isMealComposerOpen : internalMealComposerOpen;
  const handleOpenComposer = onOpenMealComposer || (() => setInternalMealComposerOpen(true));
  const handleCloseComposer = onCloseMealComposer || (() => setInternalMealComposerOpen(false));

  const mealTotals = useMemo(() => calculateMealTotals(composedMeal), [composedMeal]);
  const isDishInMeal = (dishId: string) => composedMeal.some((i) => i.dish.id === dishId);
  const getDishMealQty = (dishId: string) =>
    composedMeal.find((i) => i.dish.id === dishId)?.quantity || 0;

  // Customization styling variables
  const custom = restaurant.customization;
  const primaryColor = custom?.primaryColor || '#781524';
  const accentColor = custom?.accentColor || '#c58b2b';
  const fontClass =
    custom?.fontStyle === 'playfair'
      ? 'font-cinzel'
      : custom?.fontStyle === 'sans'
      ? 'font-sans'
      : 'font-serif';

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterTab, setActiveFilterTab] = useState<'regimes' | 'allergens' | null>(null);
  const [isVegetarianOnly, setIsVegetarianOnly] = useState<boolean>(false);

  // Dish of the moment memo
  const momentDish = useMemo(() => {
    if (restaurant.dishOfTheMomentId) {
      const found = restaurant.dishes.find((d) => d.id === restaurant.dishOfTheMomentId);
      if (found) return found;
    }
    return restaurant.dishes[0] || null;
  }, [restaurant.dishOfTheMomentId, restaurant.dishes]);

  const isMomentActive = restaurant.dishOfTheMomentEnabled ?? false;

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
    return getAutoDishName(dish, currentLang);
  };

  const getDishDesc = (dish: Dish) => {
    return getAutoDishDesc(dish, currentLang);
  };

  const getCategoryName = (catId: string, defaultName: string) => {
    const cat = restaurant.categories.find((c) => c.id === catId);
    if (!cat) return defaultName;
    return getAutoCategoryName(cat, currentLang) || defaultName;
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

  // Internal anchor links navigation to specific food categories with smooth scrolling
  const handleCategoryClick = (catId: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setActiveCategoryId(catId);

    if (catId === 'all') {
      const el = document.getElementById('menu-content') || document.getElementById('menu-categories-bar');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      try {
        window.history.pushState(null, '', '#menu-content');
      } catch (_) {}
    } else {
      const el = document.getElementById(`category-${catId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      try {
        window.history.pushState(null, '', `#category-${catId}`);
      } catch (_) {}
    }
  };

  // Filter dishes by category and active criteria - all categories are listed so internal anchor links can navigate to each section
  const categorizedDishes = useMemo(() => {
    const availableCats = restaurant.categories.filter((c) => c.id !== 'all');

    return availableCats.map((cat) => {
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
    searchQuery,
    selectedAllergens,
    isHalalOnly,
    isVeganOnly,
    isVegetarianOnly,
    activeMacroFilter,
  ]);

  // Scroll-spy observer to highlight the currently visible category in the categories nav bar
  useEffect(() => {
    const sections = restaurant.categories
      .filter((c) => c.id !== 'all')
      .map((c) => document.getElementById(`category-${c.id}`))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const catId = entry.target.id.replace('category-', '');
            setActiveCategoryId(catId);
          }
        });
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, [restaurant.categories, categorizedDishes]);

  // Direct anchor hash navigation on initial page load if URL contains #category-...
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      if (hash.startsWith('category-')) {
        const catId = hash.replace('category-', '');
        setTimeout(() => {
          const target = document.getElementById(hash);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveCategoryId(catId);
          }
        }, 300);
      }
    }
  }, []);

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

  const isSpotlightMatch = momentDish && filterDishMatches(momentDish);

  return (
    <div className="min-h-screen">
      {/* Top sticky navigation & back-button bar (PINNED TO TOP OF VIEWPORT) */}
      <div className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md text-white px-2.5 sm:px-6 py-2.5 sm:py-3.5 text-xs flex items-center justify-between shadow-xl border-b border-stone-800 transition-all min-h-[62px] sm:min-h-[72px] pt-[env(safe-area-inset-top,0px)] gap-2 sm:gap-4">
        {/* LEFT: Bouton Retour */}
        <div className="flex items-center gap-2 shrink-0 min-w-[70px] sm:min-w-[130px] justify-start">
          <button
            onClick={onBackToPortal}
            className="flex items-center gap-1.5 font-bold hover:text-amber-300 transition cursor-pointer text-xs sm:text-sm group py-1.5 sm:py-2 px-3 sm:px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 shrink-0 touch-manipulation min-h-[36px] sm:min-h-[40px] shadow-xs"
            title={t('backToHub')}
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform shrink-0" />
            <span className="hidden sm:inline">{t('backToHub')}</span>
            <span className="sm:hidden font-extrabold">{t('back')}</span>
          </button>
        </div>

        {/* CENTER: Nom du restaurant AGRANDI et PARFAITEMENT CENTRÉ + Spécialité AGRANDIE */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1.5 sm:gap-3 text-center min-w-0 px-1 sm:px-3">
          <h1 className="text-white font-serif font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-tight truncate drop-shadow-md max-w-full">
            {restaurant.name}
          </h1>
          <span
            className="text-white text-xs sm:text-sm md:text-base font-black px-4 sm:px-5 py-1 sm:py-1.5 rounded-full shadow-lg shrink-0 border border-white/30 tracking-wider uppercase drop-shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            {getAutoCuisineName(restaurant.cuisine, currentLang)}
          </span>
        </div>

        {/* RIGHT: Téléphone, Langue & Accès */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-[70px] sm:min-w-[130px] justify-end">
          {restaurant.phone && custom?.showPhoneBadge !== false && (
            <a
              href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
              className="hidden xl:flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition text-xs font-bold bg-emerald-950/60 hover:bg-emerald-900/80 px-2.5 py-1 rounded-full border border-emerald-500/40 shrink-0 touch-manipulation min-h-[32px] justify-center"
              title={`${t('callRestaurant')} ${restaurant.name} (${restaurant.phone})`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{restaurant.phone}</span>
            </a>
          )}

          {/* Quick Language Switcher */}
          <div className="relative shrink-0">
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer transition shadow-xs appearance-none pr-5 sm:pr-6 text-center min-h-[36px] touch-manipulation"
              aria-label="Sélectionner la langue"
            >
              <option value="fr" className="bg-[#14171a] text-white">FR</option>
              <option value="it" className="bg-[#14171a] text-white">IT</option>
              <option value="en" className="bg-[#14171a] text-white">EN</option>
              <option value="es" className="bg-[#14171a] text-white">ES</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-stone-400">
              <ChevronRight className="w-2.5 h-2.5 rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Italian ribbon accent for Italian dining */}
      {(restaurant.id === 'trattoria-bella-vista' || restaurant.id === 'la-cave-a-pizza-aubagne') && (
        <div className="h-1.5 w-full bg-italian-ribbon hidden md:block shadow-xs"></div>
      )}

      {/* Main restaurant container */}
      <div className="min-h-screen pt-2 md:pt-4 pb-28 max-w-7xl mx-auto relative z-10 bg-[#faf7f2]/95 backdrop-blur-md shadow-2xl border-x border-stone-300/80">
        
        {/* Optional Custom Hero Banner */}
        {custom?.showBannerHero !== false && (custom?.bannerUrl || restaurant.banner) && (
          <div
            className={`relative w-full overflow-hidden ${
              custom?.bannerHeight === 'compact'
                ? 'h-32 sm:h-40'
                : custom?.bannerHeight === 'tall'
                ? 'h-64 sm:h-80'
                : 'h-44 sm:h-56'
            } transition-all duration-300 group border-b border-stone-200`}
          >
            <img
              src={custom?.bannerUrl || restaurant.banner}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
            <div className="absolute bottom-3 left-4 sm:left-6 right-4 flex items-end justify-between gap-3 text-white">
              <div className="drop-shadow-md">
                <span
                  className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-xs border border-white/20 inline-block mb-1 font-bold"
                  style={{ color: accentColor }}
                >
                  {restaurant.cuisine}
                </span>
                <p className="text-xs sm:text-sm font-serif italic text-white/90 max-w-lg line-clamp-1">
                  « {restaurant.tagline || 'Excellence & Authenticité'} »
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg hover:scale-105 active:scale-95 shrink-0"
                title="Modifier la bannière et le style"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Changer l'ambiance</span>
              </button>
            </div>
          </div>
        )}

        {/* Restaurant Header - scrolls away naturally so only the top navigation bar stays sticky */}
        <header className="relative z-20 bg-[#faf7f2]/95 border-b border-stone-200/90 shadow-xs transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3">
            
            {/* Upper control bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200/70 text-xs">
              
              {/* Open status */}
              {custom?.showHoursBadge !== false && (
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
                    <Clock className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span>
                      {restaurant.openingHours.days} : {restaurant.openingHours.lunch} & {restaurant.openingHours.dinner}
                    </span>
                  </span>
                </div>
              )}

              {/* Action tools */}
              <div className="flex items-center gap-2 flex-wrap">
                
                {/* View Switcher: Photos vs Carte Élégante */}
                <div className="bg-stone-200/80 p-0.5 rounded-full flex items-center border border-stone-300/80 shadow-inner">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1 rounded-full text-[11px] sm:text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-white shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900 font-medium'
                    }`}
                    style={viewMode === 'cards' ? { color: primaryColor } : undefined}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>{t('viewPhotos')}</span>
                  </button>
                  <button
                    onClick={() => setViewMode('classic')}
                    className={`px-3 py-1 rounded-full text-[11px] sm:text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      viewMode === 'classic'
                        ? 'bg-white shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900 font-medium'
                    }`}
                    style={viewMode === 'classic' ? { color: primaryColor } : undefined}
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
                  <option value="es">🇪🇸 ES</option>
                </select>

                {/* Allergen Modal Filter */}
                <button
                  onClick={onOpenAllergenModal}
                  className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition text-[11px] font-bold shadow-xs cursor-pointer ${
                    selectedAllergens.length > 0
                      ? 'text-white animate-pulse'
                      : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                  style={
                    selectedAllergens.length > 0
                      ? { backgroundColor: primaryColor, borderColor: primaryColor }
                      : undefined
                  }
                >
                  <ShieldAlert
                    className="w-3.5 h-3.5"
                    style={{ color: selectedAllergens.length > 0 ? '#ffffff' : primaryColor }}
                  />
                  <span className="hidden sm:inline">{t('allergens')}</span>
                  {selectedAllergens.length > 0 && (
                    <span
                      className="bg-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full"
                      style={{ color: primaryColor }}
                    >
                      {selectedAllergens.length}
                    </span>
                  )}
                </button>

                {/* Bouton Réseaux & Liens */}
                <button
                  type="button"
                  onClick={() => setIsSocialModalOpen(true)}
                  className="px-2.5 py-1 rounded-full border border-stone-300/90 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800 flex items-center gap-1.5 transition text-[11px] font-bold shadow-xs cursor-pointer"
                  title="Ajouter ou modifier les réseaux sociaux (Instagram, Facebook, TikTok) et liens (Uber Eats, Deliveroo, Site web)"
                >
                  <Share2 className="w-3.5 h-3.5 text-stone-600" />
                  <span>{t('socialLinks')}</span>
                  {hasAnySocialLinks && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  )}
                </button>

                {/* Personnaliser Page Button */}
                <button
                  type="button"
                  onClick={() => setIsCustomizerOpen(true)}
                  className="px-2.5 py-1 rounded-full border border-amber-300/80 hover:border-amber-400 bg-amber-50 hover:bg-amber-100/90 text-amber-950 flex items-center gap-1.5 transition text-[11px] font-bold shadow-xs cursor-pointer"
                  title="Personnaliser les couleurs, la bannière, le titre et l'ambiance"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t('customizePage')}</span>
                </button>
              </div>
            </div>

            {/* Restaurant Brand Title & In-menu search */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-3">
              <div className="flex items-start sm:items-center gap-3.5">
                {custom?.logoType === 'image' && custom?.logoUrl ? (
                  <div
                    className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white border flex items-center justify-center shadow-md shrink-0 mt-0.5 sm:mt-0 p-1 overflow-hidden"
                    style={{ borderColor: accentColor }}
                  >
                    <img
                      src={custom.logoUrl}
                      alt={restaurant.name}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div
                    className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md shrink-0 mt-0.5 sm:mt-0 font-cinzel"
                    style={{
                      backgroundColor: custom?.logoBgColor || primaryColor,
                      color: custom?.logoTextColor || accentColor,
                      border: `1.5px solid ${accentColor}80`,
                    }}
                  >
                    {restaurant.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl ${fontClass} font-bold text-stone-900 tracking-tight`}>
                      {restaurant.name}
                    </h1>
                    {restaurant.isHalalCertified && custom?.showHalalBadge !== false && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs inline-flex items-center gap-1">
                        <span>🥩</span>
                        <span>100% Halal</span>
                      </span>
                    )}
                    {restaurant.isWebVerified && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs inline-flex items-center gap-1" title="Informations officielles vérifiées via Google Search Grounding">
                        <ShieldCheck className="w-3 h-3 text-blue-200" />
                        <span>100% Vérifié Web</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsCustomizerOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-amber-50 text-stone-800 hover:text-amber-900 border border-stone-300 hover:border-amber-400 shadow-2xs transition group text-xs cursor-pointer font-bold shrink-0"
                      title="Personnaliser les informations, le style, la bannière et le thème du restaurant"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-45 transition-transform" />
                      <span>{t('customizePage')}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                    <span
                      className="text-xs font-serif italic font-semibold tracking-wide"
                      style={{ color: primaryColor }}
                    >
                      {restaurant.tagline || t('tagline')}
                    </span>
                    <span className="text-stone-300 hidden sm:inline">•</span>
                    <span className="text-[11px] text-stone-500 font-mono hidden sm:inline">
                      {restaurant.cuisine}
                    </span>
                    {restaurant.priceRange && (
                      <>
                        <span className="text-stone-300 hidden sm:inline">•</span>
                        <span className="text-[11px] text-stone-600 font-mono hidden sm:inline">
                          {restaurant.priceRange}
                        </span>
                      </>
                    )}
                  </div>

                  {/* LIENS RÉSEAUX SOCIAUX & LIENS EXTERNES DIRECTEMENT SOUS LE NOM DU RESTAURANT */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 pt-1 pb-0.5">
                    {/* External links: Uber Eats, Deliveroo, Site web */}
                    {resolvedExternalLinks.uberEats && (
                      <a
                        href={resolvedExternalLinks.uberEats}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-bold shadow-xs hover:shadow-sm transition-all hover:scale-105 active:scale-95 group shrink-0"
                        title="Commander sur Uber Eats (livraison rapide)"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                        <span>Uber Eats</span>
                        <ExternalLink className="w-3 h-3 text-emerald-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    )}

                    {resolvedExternalLinks.deliveroo && (
                      <a
                        href={resolvedExternalLinks.deliveroo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00cdbc] hover:bg-[#00b8a8] text-stone-950 font-mono text-xs font-black shadow-xs hover:shadow-sm transition-all hover:scale-105 active:scale-95 group shrink-0"
                        title="Commander sur Deliveroo"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        <span>Deliveroo</span>
                        <ExternalLink className="w-3 h-3 text-stone-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    )}

                    {resolvedExternalLinks.website && (
                      <a
                        href={resolvedExternalLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-stone-50 text-stone-850 border border-stone-300 shadow-2xs text-xs font-semibold hover:border-stone-400 transition-all hover:scale-105 active:scale-95 group shrink-0"
                        title="Consulter le site web officiel du restaurant"
                      >
                        <Globe className="w-3.5 h-3.5 text-stone-600 group-hover:text-stone-900" />
                        <span>{currentLang === 'it' ? 'Sito web' : currentLang === 'es' ? 'Sitio web' : currentLang === 'en' ? 'Website' : 'Site web'}</span>
                        <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-stone-600" />
                      </a>
                    )}

                    {/* Social links: Instagram, Facebook, TikTok */}
                    {resolvedSocialLinks.instagram && (
                      <a
                        href={resolvedSocialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 hover:opacity-90 text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 group shrink-0"
                        title="Compte Instagram officiel"
                      >
                        <Instagram className="w-3.5 h-3.5 text-white" />
                        <span>Instagram</span>
                        <ExternalLink className="w-3 h-3 text-white/80" />
                      </a>
                    )}

                    {resolvedSocialLinks.facebook && (
                      <a
                        href={resolvedSocialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 group shrink-0"
                        title="Page Facebook officielle"
                      >
                        <Facebook className="w-3.5 h-3.5 text-white" />
                        <span>Facebook</span>
                        <ExternalLink className="w-3 h-3 text-white/80" />
                      </a>
                    )}

                    {resolvedSocialLinks.tiktok && (
                      <a
                        href={resolvedSocialLinks.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black hover:bg-stone-850 text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 group shrink-0"
                        title="Profil TikTok officiel"
                      >
                        <span className="text-[11px]">🎵</span>
                        <span>TikTok</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </a>
                    )}

                    {/* Optional extra link: Google Maps */}
                    {resolvedExternalLinks.googleMaps && (
                      <a
                        href={resolvedExternalLinks.googleMaps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95 group shrink-0"
                        title="Fiche Google Maps & Avis vérifiés"
                      >
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        <span>Google Maps</span>
                        <ExternalLink className="w-3 h-3 text-red-400" />
                      </a>
                    )}

                    {/* Optional extra custom link */}
                    {resolvedExternalLinks.customUrl && (
                      <a
                        href={resolvedExternalLinks.customUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 group shrink-0"
                        title={resolvedExternalLinks.customLabel || 'Lien externe'}
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
                        <span>{resolvedExternalLinks.customLabel || 'Lien'}</span>
                        <ExternalLink className="w-3 h-3 text-amber-700/70" />
                      </a>
                    )}

                    {/* Bouton pour ajouter ou modifier les réseaux & liens */}
                    <button
                      type="button"
                      onClick={() => setIsSocialModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold cursor-pointer transition shadow-2xs hover:scale-105 active:scale-95 shrink-0"
                      title="Ajouter ou modifier les réseaux sociaux (Instagram, Facebook, TikTok) et liens (Uber Eats, Deliveroo, Site web)"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-700" />
                      <span>
                        {hasAnyLinks
                          ? 'Gérer les liens'
                          : '+ Ajouter liens & réseaux (Uber Eats, Instagram...)'}
                      </span>
                    </button>
                  </div>

                  {/* Informations du restaurant : Adresse, Téléphone, Avis et Statistiques */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-0.5">
                    {/* Avis & Recommandations Button */}
                    <button
                      type="button"
                      onClick={() => setIsReviewsModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300/90 shadow-2xs transition group text-xs cursor-pointer font-bold"
                      title="Consulter les avis, critères 5 étoiles et recommandations de la communauté"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                      <span>{restaurant.rating || 4.8} / 5</span>
                      <span className="text-amber-800/80 font-normal">
                        ({restaurant.reviewsCount || 34} avis)
                      </span>
                      {(restaurant.isGustoRecommended || (restaurant.rating || 4.8) >= 4.5) && (
                        <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-200/90 px-2 py-0.2 rounded-full border border-amber-400">
                          <Crown className="w-2.5 h-2.5 fill-current" />
                          <span className="hidden sm:inline">Recommandé par Gusto</span>
                        </span>
                      )}
                    </button>

                    {restaurant.address && custom?.showAddressBadge !== false && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          restaurant.name + ' ' + restaurant.address
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-stone-100 text-stone-700 hover:text-stone-900 border border-stone-300/80 shadow-2xs transition group text-xs cursor-pointer font-medium"
                        title="Ouvrir l'adresse dans Google Maps (Itinéraire)"
                      >
                        <MapPin className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" style={{ color: primaryColor }} />
                        <span>{restaurant.address}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-stone-400 opacity-60 group-hover:opacity-100" />
                      </a>
                    )}

                    {restaurant.phone && custom?.showPhoneBadge !== false && (
                      <a
                        href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
                        onClick={() => trackPhoneCall(restaurant.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 shadow-2xs transition group text-xs cursor-pointer font-bold"
                        title={`Appeler ${restaurant.name} au ${restaurant.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>{restaurant.phone}</span>
                      </a>
                    )}

                    {restaurant.distance !== undefined && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200 text-[11px] font-medium">
                        <span>📍 À {restaurant.distance} km</span>
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
                    placeholder={t('searchDishPlaceholder') || 'Rechercher un plat, ingrédient...'}
                    className="w-full bg-white border border-stone-300 rounded-full pl-9 pr-8 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none shadow-xs"
                    style={{ focusBorderColor: primaryColor }}
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
                  <span>{t('allergens')}</span>
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
                  <span>{t('diets')}</span>
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
                      <span>{t('dietOptions')}</span>
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
                        <span>{t('resetAllergens')}</span>
                      </button>
                    )}

                    {activeFilterTab === 'regimes' && activeRegimesCount > 0 && (
                      <button
                        type="button"
                        onClick={handleClearRegimes}
                        className="text-xs text-emerald-800 hover:text-emerald-950 underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{t('resetDiets')}</span>
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
                            : currentLang === 'es'
                            ? (alg.name_es || alg.name)
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
                            <span className="text-xs font-black uppercase tracking-wider text-amber-700">PROTÉINES</span>
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
                            <span className="text-xs font-black uppercase tracking-wider text-teal-700">CALORIES</span>
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
                            <span className="text-xs font-black uppercase tracking-wider text-cyan-700">GLUCIDES</span>
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
                            <span className="text-xs font-black uppercase tracking-wider text-sky-700">LIPIDES</span>
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

            {/* Custom Announcement banner */}
            {custom?.showAnnouncement && custom?.announcement && (
              <div
                className="mt-3.5 mb-1 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs border transition-all"
                style={{
                  backgroundColor: `${primaryColor}0d`,
                  borderColor: `${accentColor}70`,
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0">{custom?.announcementEmoji || '📢'}</span>
                  <p className="font-medium text-stone-800 truncate">
                    {custom?.announcement}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomizerOpen(true)}
                  className="text-[11px] font-bold hover:underline shrink-0 cursor-pointer flex items-center gap-1"
                  style={{ color: primaryColor }}
                >
                  <Sliders className="w-3 h-3" />
                  <span>{t('customizePage')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Categories Nav Bar with Internal Anchor Links */}
          <div
            id="menu-categories-bar"
            className="sticky top-[45px] sm:top-[49px] z-30 max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 border-y border-stone-200 bg-[#f6f1e8]/95 backdrop-blur-md shadow-xs transition-all"
          >
            <nav className="flex overflow-x-auto no-scrollbar py-2 sm:py-2.5 gap-1.5 sm:gap-2.5 scroll-smooth touch-pan-x" aria-label="Catégories du menu">
              {restaurant.categories.map((cat) => {
                const count = getCategoryMatchingCount(cat.id);
                if (count === 0 && cat.id !== 'all') return null;

                const isSelected = activeCategoryId === cat.id;
                const targetAnchor = cat.id === 'all' ? '#menu-content' : `#category-${cat.id}`;

                return (
                  <a
                    key={cat.id}
                    href={targetAnchor}
                    onClick={(e) => handleCategoryClick(cat.id, e)}
                    className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap flex items-center gap-2 transition shrink-0 shadow-2xs cursor-pointer border ${
                      isSelected
                        ? 'text-white font-bold shadow-md scale-102 border-transparent'
                        : 'bg-white text-stone-700 hover:text-stone-950 border-stone-300/80 hover:bg-stone-50'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: primaryColor, boxShadow: `0 4px 12px ${primaryColor}40` }
                        : undefined
                    }
                  >
                    <span>{getCategoryIcon(cat.iconName)}</span>
                    <span>{getCategoryName(cat.id, cat.name)}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-[#c58b2b] text-stone-900'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {count}
                    </span>
                  </a>
                );
              })}
            </nav>
          </div>
        </header>

        {/* =========================================================================
            PLAT DU MOMENT (RECOMMANDATION DU CHEF) - OPTION ACTIVABLE / DÉSACTIVABLE
            ========================================================================= */}
        {isMomentActive && isSpotlightMatch && activeCategoryId === 'all' && !searchQuery && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 animate-in fade-in duration-300">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#781524] via-[#99281a] to-[#1e4e2b] text-white p-5 sm:p-7 shadow-classic border-2 border-[#c58b2b]/50 group">
              {/* Background glow effects */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-orange-400/10 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left: Dish thumbnail and details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 min-w-0 flex-1">
                  <div
                    onClick={() => onOpenDishDetail(momentDish)}
                    className="relative w-full sm:w-44 h-44 sm:h-36 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-300/40 shrink-0 cursor-pointer group-hover:scale-102 transition-transform"
                  >
                    <img
                      src={momentDish.image}
                      alt={getDishName(momentDish)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                      {momentDish.isHalal && (
                        <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Halal 🥩
                        </span>
                      )}
                      {momentDish.isVegan && (
                        <span className="bg-teal-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Vegan 🥑
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#c58b2b] text-stone-950 font-black text-[10px] uppercase px-3 py-1 rounded-full tracking-wider font-cinzel shadow-sm flex items-center gap-1.5 ring-2 ring-amber-300/60">
                        <Star className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
                        <span>{t('dishOfTheMomentBadge') || '⭐ Plat du Moment • Recommandation du Chef'}</span>
                      </span>
                      <span className="text-xs text-amber-200 italic font-serif hidden sm:inline">
                        {t('dishOfTheMomentSub') || 'La création exclusive du Chef mise à l\'honneur'}
                      </span>
                    </div>

                    <h2
                      onClick={() => onOpenDishDetail(momentDish)}
                      className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white tracking-wide cursor-pointer hover:text-amber-200 transition-colors line-clamp-1"
                    >
                      {getDishName(momentDish)}
                    </h2>

                    <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed font-sans line-clamp-2">
                      {getDishDesc(momentDish)}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                      <span className="font-serif text-lg sm:text-xl font-bold text-[#dfab43]">
                        {formatPrice(momentDish.price)}
                      </span>
                      <span className="bg-white/15 px-2.5 py-0.5 rounded-lg text-amber-100 text-[11px] font-bold">
                        {momentDish.nutrition?.kcal || 0} kcal
                      </span>
                      {momentDish.winePairing && (
                        <span className="bg-white/15 px-2.5 py-0.5 rounded-lg text-[11px] flex items-center gap-1 text-amber-200">
                          <Wine className="w-3.5 h-3.5" />
                          <span>{momentDish.winePairing}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: View Dish Card & Phone Booking */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenDishDetail(momentDish)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-[#dfab43] hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-2xl text-xs transition shadow-md hover:scale-105 cursor-pointer ring-2 ring-amber-300/80"
                  >
                    <span>{t('consultDishDetails')}</span>
                    <ChevronRight className="w-4 h-4 text-stone-950" />
                  </button>

                  <a
                    href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
                    className="flex items-center justify-center gap-2 bg-stone-900/60 hover:bg-stone-900 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm hover:scale-105 border border-white/20"
                  >
                    <PhoneCall className="w-4 h-4 text-amber-300" />
                    <span>
                      {t('book')} : <strong>{restaurant.phone}</strong>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dishes Listing by Categories with Internal Anchor IDs */}
        <main id="menu-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 scroll-mt-28 sm:scroll-mt-32">
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
                  <span>{t('appliedFilters')}</span>
                </span>

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-stone-200 text-stone-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    <span>{t('searchQueryLabel')} &laquo; {searchQuery} &raquo;</span>
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
                      : currentLang === 'es'
                      ? (alg?.name_es || alg?.name)
                      : alg?.name;
                  return (
                    <span
                      key={algId}
                      className="inline-flex items-center gap-1 bg-red-100 text-red-900 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    >
                      <span>{alg?.icon}</span>
                      <span>{t('without')} {name}</span>
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
                    <span>{t('vegetarianCertified')}</span>
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
                        ? 'Protéines (>25g)'
                        : activeMacroFilter === 'low-cal'
                        ? '< 500 Kcal'
                        : activeMacroFilter === 'low-carb'
                        ? 'Low Carb'
                        : activeMacroFilter === 'low-fat'
                        ? 'Faible en gras'
                        : activeMacroFilter === 'high-cal'
                        ? 'Riche en énergie'
                        : 'Végétarien'}
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
                  <span>{t('resetAllFilters')}</span>
                </button>
              </div>
            </div>
          )}

          {categorizedDishes.map((group) => {
            if (group.dishes.length === 0) return null;

            return (
              <section
                key={group.category.id}
                id={`category-${group.category.id}`}
                className="space-y-6 scroll-mt-28 sm:scroll-mt-32"
              >
                
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
                              {restaurant.dishOfTheMomentEnabled && restaurant.dishOfTheMomentId === dish.id && (
                                <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md ring-1 ring-amber-300">
                                  <Star className="w-3 h-3 fill-stone-950 text-stone-950" />
                                  <span>{t('dishOfTheMomentBadgeSmall') || 'Plat du Moment'}</span>
                                </span>
                              )}
                              {dish.isHalal && (
                                <span className="bg-emerald-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <span>🥩</span> {t('halalCertified') || 'Halal'}
                                </span>
                              )}
                              {dish.isVegan && (
                                <span className="bg-teal-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <span>🥑</span> {t('veganCertified') || 'Végétalien'}
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
                                  {getAutoTagLabel(tag, currentLang)}
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
                                  {currentLang === 'it' ? 'Prot.' : currentLang === 'es' ? 'Prot.' : currentLang === 'en' ? 'Prot.' : 'Prot.'}
                                </span>
                                <span className="font-bold text-stone-800">
                                  {dish.nutrition.protein}g
                                </span>
                              </div>
                              <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-1">
                                <span className="block text-[9px] uppercase font-bold text-stone-400">
                                  {currentLang === 'it' ? 'Carb.' : currentLang === 'es' ? 'Carb.' : currentLang === 'en' ? 'Carb.' : 'Gluc.'}
                                </span>
                                <span className="font-bold text-stone-800">
                                  {dish.nutrition.carbs}g
                                </span>
                              </div>
                              <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-1">
                                <span className="block text-[9px] uppercase font-bold text-stone-400">
                                  {currentLang === 'it' ? 'Grassi' : currentLang === 'es' ? 'Grasas' : currentLang === 'en' ? 'Fat' : 'Lip.'}
                                </span>
                                <span className="font-bold text-stone-800">
                                  {dish.nutrition.fat}g
                                </span>
                              </div>
                              <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-1">
                                <span className="block text-[9px] uppercase font-bold text-stone-400">
                                  {t('originLabel') || 'Origine'}
                                </span>
                                <span className="font-bold text-[#781524] truncate block text-[11px]">
                                  {dish.region || 'Frais'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer: Fiche du plat */}
                        <div className="p-4 pt-0 border-t border-stone-100 mt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDishDetail(dish);
                            }}
                            className="w-full py-2.5 px-4 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs touch-manipulation border border-stone-200/80 group/btn"
                          >
                            <span>🍽️ {t('consultDishDetails')}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover/btn:translate-x-0.5 transition-transform" />
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
                            {restaurant.dishOfTheMomentEnabled && restaurant.dishOfTheMomentId === dish.id && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black border border-amber-500 flex items-center gap-1 shadow-xs">
                                <Star className="w-2.5 h-2.5 fill-stone-950 text-stone-950" />
                                <span>{t('dishOfTheMomentBadgeSmall') || 'Plat du Moment'}</span>
                              </span>
                            )}
                            {dish.isHalal && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-0.5">
                                <span>🥩</span> {t('halalCertified') || 'Halal'}
                              </span>
                            )}
                            {dish.isVegan && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold border border-teal-300 flex items-center gap-0.5">
                                <span>🥑</span> {t('veganCertified') || 'Végétalien'}
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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                          <div className="text-[10px] font-mono text-stone-400">
                            <span>
                              {dish.nutrition.kcal} kcal • Prot: {dish.nutrition.protein}g • Gluc: {dish.nutrition.carbs}g • Lip: {dish.nutrition.fat}g
                            </span>
                          </div>
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
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-stone-600">
            {restaurant.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  restaurant.name + ' ' + restaurant.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#99281a] transition font-medium"
                title="Voir sur Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-[#99281a]" />
                <span className="hover:underline">{restaurant.address}</span>
              </a>
            )}
            {restaurant.address && restaurant.phone && (
              <span className="text-stone-300 hidden sm:inline">•</span>
            )}
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-1.5 hover:text-emerald-700 transition font-bold text-stone-800"
                title={`Appeler ${restaurant.name}`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hover:underline">{restaurant.phone}</span>
              </a>
            )}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={onBackToPortal}
              className="px-6 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>{t('backToHub')}</span>
            </button>
          </div>

          {/* Discreet Footer Access */}
          <div className="mt-8 pt-6 border-t border-stone-300/40 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-stone-600">
            {onOpenAdminModal && (
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="hover:text-stone-800 transition cursor-pointer flex items-center gap-1.5 opacity-60 hover:opacity-100"
              >
                <KeyRound className="w-3 h-3" />
                <span>{isAdmin ? 'Gérer la carte' : 'Espace privé'}</span>
              </button>
            )}
            {isAdmin && onLogoutAdmin && (
              <button
                type="button"
                onClick={onLogoutAdmin}
                className="hover:text-rose-600 transition cursor-pointer flex items-center gap-1.5 opacity-60 hover:opacity-100 text-rose-500"
              >
                <LogOut className="w-3 h-3" />
                <span>{t('logout')}</span>
              </button>
            )}
            {onOpenCreatorDashboard && (
              <button
                type="button"
                onClick={onOpenCreatorDashboard}
                className="hover:text-stone-800 transition cursor-pointer flex items-center gap-1.5 opacity-60 hover:opacity-100"
              >
                <Crown className="w-3 h-3" />
                <span>{t('dashboard')}</span>
              </button>
            )}
          </div>
        </footer>
      </div>

      {/* Restaurant Social Links & Online Delivery Modal */}
      <RestaurantSocialLinksModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        restaurant={restaurant}
        onSave={(updated) => {
          if (onUpdateRestaurant) {
            onUpdateRestaurant(updated);
          }
        }}
        onShowToast={onShowToast || (() => {})}
      />

      {/* Restaurant Page Customizer Modal */}
      <RestaurantCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        restaurant={restaurant}
        onSave={(updated) => {
          if (onUpdateRestaurant) {
            onUpdateRestaurant(updated);
          }
        }}
        onShowToast={onShowToast || (() => {})}
      />

      {/* Community Reviews & Ratings Modal */}
      <RestaurantReviewsModal
        restaurant={restaurant}
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        onReviewAdded={(updated) => {
          if (onUpdateRestaurant) {
            onUpdateRestaurant(updated);
          }
          if (onShowToast) {
            onShowToast('Votre avis a été publié avec succès !');
          }
        }}
      />

      {/* Fallback Meal Composer Modal if not handled by parent */}
      {!onOpenMealComposer && (
        <MealComposerModal
          isOpen={isComposerOpen}
          onClose={handleCloseComposer}
          restaurant={restaurant}
          currentLang={currentLang}
          items={composedMeal}
          onAddItem={(d, c) => onAddToMeal && onAddToMeal(d, c)}
          onRemoveItem={(dishId) => onRemoveFromMeal && onRemoveFromMeal(dishId)}
          onUpdateQuantity={(dishId, delta) => onUpdateMealQuantity && onUpdateMealQuantity(dishId, delta)}
          onChangeCourse={(dishId, course) => onChangeMealCourse && onChangeMealCourse(dishId, course)}
          onClearMeal={onClearMeal || (() => {})}
          onOpenDishDetail={onOpenDishDetail}
          onShowToast={onShowToast}
        />
      )}

      {/* BULLE FLOTTANTE « MON REPAS IDÉAL » (FIXED EN BAS À DROITE) */}
      <aside aria-label="Bulle Mon repas idéal" className="fixed bottom-6 right-6 z-40 print:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button
          type="button"
          onClick={handleOpenComposer}
          className={`flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer touch-manipulation border ${
            composedMeal.length > 0
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 border-amber-300 ring-4 ring-amber-400/30 shadow-amber-500/30'
              : 'bg-stone-900/95 hover:bg-stone-850 text-amber-300 border-amber-400/50 hover:border-amber-300 backdrop-blur-md shadow-black/40'
          }`}
          title="Ouvrir la bulle Mon repas idéal"
        >
          <div className="relative">
            <Sparkles className={`w-5 h-5 ${composedMeal.length > 0 ? 'fill-stone-950 text-stone-950' : 'text-amber-400 animate-pulse'}`} />
            {composedMeal.length > 0 && (
              <span className="absolute -top-2.5 -right-2.5 min-w-[20px] h-5 px-1 rounded-full bg-stone-950 text-amber-300 text-[10px] font-black font-mono flex items-center justify-center ring-2 ring-amber-400">
                {mealTotals.totalCount}
              </span>
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-serif font-extrabold text-xs sm:text-sm tracking-wide leading-tight">
              Mon repas idéal
            </span>
            {composedMeal.length > 0 ? (
              <span className="text-[10px] font-mono font-bold text-stone-950/80 leading-tight">
                {mealTotals.totalKcal} kcal • {mealTotals.totalProtein}g prot
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-300/80 leading-tight">
                Calculateur macros
              </span>
            )}
          </div>
        </button>
      </aside>
    </div>
  );
};
