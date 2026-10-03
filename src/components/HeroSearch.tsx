import React from 'react';
import {
  Search,
  Navigation,
  Sparkles,
  X,
  RotateCcw,
  SlidersHorizontal,
  Map,
} from 'lucide-react';
import { Language, MacroFilterType } from '../types';
import { I18N_DICT, ALLERGENS_MASTER_LIST } from '../data/i18n';

interface HeroSearchProps {
  currentLang: Language;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeMacroFilter: MacroFilterType;
  onMacroFilterChange: (filter: MacroFilterType) => void;
  onRequestGeolocation: () => void;
  selectedAllergens: string[];
  onToggleAllergen: (id: string) => void;
  onResetAllergens: () => void;
  onOpenAllergenModal: () => void;
  isHalalOnly?: boolean;
  onToggleHalal?: () => void;
  isVeganOnly?: boolean;
  onToggleVegan?: () => void;
  isOpenOnly?: boolean;
  onToggleOpenOnly?: () => void;
  onOpenMap?: () => void;
  isMapActive?: boolean;
}

const QUICK_SEARCH_SUGGESTIONS = [
  { label: '🍕 Pizzas feu de bois', query: 'pizza', keywords: ['pizza', 'pizzas'] },
  { label: '🥩 Grillades Halal', query: 'grillades', keywords: ['grillades', 'grillade', 'halal'] },
  { label: '🐟 Poissons & Daurade', query: 'daurade', keywords: ['daurade', 'poisson', 'poissons'] },
  { label: '🍜 Ramen & Gyozas', query: 'ramen', keywords: ['ramen', 'gyoza', 'gyozas'] },
  { label: '🍔 Burgers du Terroir', query: 'burger', keywords: ['burger', 'burgers'] },
  { label: '🥞 Galettes Sarrasin (Sans gluten)', query: 'galette', keywords: ['galette', 'galettes', 'sarrasin'] },
  { label: '🥑 Bowls Végétariens', query: 'bowl', keywords: ['bowl', 'bowls', 'végétarien', 'veggie'] },
  { label: '🐙 Poulpe grillé', query: 'poulpe', keywords: ['poulpe'] },
  { label: '🦐 Gambas', query: 'gambas', keywords: ['gambas', 'gamba'] },
  { label: '🥘 Terroir de Provence', query: 'terroir', keywords: ['terroir', 'provence', 'provençale'] },
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  currentLang,
  searchQuery,
  onSearchChange,
  activeMacroFilter,
  onMacroFilterChange,
  onRequestGeolocation,
  selectedAllergens,
  onToggleAllergen,
  onResetAllergens,
  onOpenAllergenModal,
  isHalalOnly = false,
  onToggleHalal,
  isVeganOnly = false,
  onToggleVegan,
  isOpenOnly = false,
  onToggleOpenOnly,
  onOpenMap,
  isMapActive = false,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  const totalActiveOptionsCount =
    selectedAllergens.length +
    (isHalalOnly ? 1 : 0) +
    (isVeganOnly ? 1 : 0) +
    (isOpenOnly ? 1 : 0) +
    (activeMacroFilter !== 'all' ? 1 : 0);

  const hasActiveFilters =
    activeMacroFilter !== 'all' ||
    selectedAllergens.length > 0 ||
    searchQuery.trim() !== '' ||
    isHalalOnly ||
    isVeganOnly ||
    isOpenOnly;

  const handleClearAllFilters = () => {
    onSearchChange('');
    onMacroFilterChange('all');
    onResetAllergens();
    if (isHalalOnly && onToggleHalal) {
      onToggleHalal();
    }
    if (isVeganOnly && onToggleVegan) {
      onToggleVegan();
    }
    if (isOpenOnly && onToggleOpenOnly) {
      onToggleOpenOnly();
    }
  };

  return (
    <section id="nutrition-section" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-2 w-full">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-[#781524] text-white p-5 sm:p-8 shadow-xl border border-stone-700/50 space-y-4 sm:space-y-5">
        {/* Top Header Badge & Titles */}
        <div className="relative z-10 max-w-3xl space-y-2.5 sm:space-y-3">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10.5px] sm:text-xs text-amber-300 font-medium max-w-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="sm:hidden font-semibold">
              {t('heroBadgeMobile') || 'Restaurants certifiés • Nutrition vérifiée'}
            </span>
            <span className="hidden sm:inline">
              {t('heroBadge')}
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-3xl lg:text-5xl font-serif font-black tracking-tight leading-snug sm:leading-tight text-white">
            {t('heroHeading1')} <br className="hidden sm:inline" />
            <span className="text-amber-300">{t('heroHeading2')}</span>
          </h2>

          <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            {t('heroDesc')}
          </p>
        </div>

        {/* PRIMARY SEARCH & CONTROLS ROW */}
        <div className="relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5">
            {/* Search Input */}
            <div className="relative grow">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 sm:top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('searchHubPlaceholder')}
                className="w-full bg-white text-stone-900 rounded-2xl pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#99281a] shadow-inner placeholder-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2.5 sm:top-3 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 transition cursor-pointer"
                  title="Effacer la recherche"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Options de Recherche & Allergènes Button */}
            <button
              type="button"
              onClick={onOpenAllergenModal}
              className={`px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-md shrink-0 cursor-pointer active:scale-98 min-h-[42px] border ${
                totalActiveOptionsCount > 0
                  ? 'bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-300/50'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title={t('searchOptionsBtn')}
            >
              <SlidersHorizontal
                className={`w-4 h-4 ${
                  totalActiveOptionsCount > 0 ? 'text-stone-950' : 'text-amber-300'
                }`}
              />
              <span className="whitespace-nowrap">{t('searchOptionsBtn')}</span>
              {totalActiveOptionsCount > 0 ? (
                <span className="w-5 h-5 rounded-full bg-stone-950 text-amber-300 text-[10px] font-black flex items-center justify-center">
                  {totalActiveOptionsCount}
                </span>
              ) : null}
            </button>

            {/* Carte Interactive Direct CTA Button */}
            {onOpenMap && (
              <button
                type="button"
                onClick={onOpenMap}
                className={`px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-md shrink-0 cursor-pointer active:scale-98 min-h-[42px] border ${
                  isMapActive
                    ? 'bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-300/50'
                    : 'bg-gradient-to-r from-amber-500/25 to-amber-600/25 hover:from-amber-500/35 hover:to-amber-600/35 text-amber-200 border-amber-400/40'
                }`}
                title="Explorer les restaurants sur la carte interactive géolocalisée"
              >
                <Map className={`w-4 h-4 ${isMapActive ? 'text-stone-950' : 'text-amber-300'}`} />
                <span className="whitespace-nowrap">Carte Interactive</span>
                <span className="hidden sm:inline-flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </button>
            )}

            {/* Geolocation Button */}
            <button
              onClick={onRequestGeolocation}
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#b43e2b] hover:bg-[#99281a] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shrink-0 cursor-pointer active:scale-98 min-h-[42px]"
            >
              <Navigation className="w-4 h-4" />
              <span>{t('nearbyBtn')}</span>
            </button>
          </div>

          {/* BANDEAU DE SUGGESTIONS RAPIDES EN 1 CLIC DANS LA RECHERCHE */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] sm:text-xs">
              <span className="text-amber-200 font-serif italic flex items-center gap-1.5 text-[11px] sm:text-xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Suggestions rapides en 1 clic :</span>
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-[10px] text-stone-300 hover:text-white underline cursor-pointer"
                >
                  Effacer
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 touch-pan-x">
              {QUICK_SEARCH_SUGGESTIONS.map((item) => {
                const currentQ = searchQuery.toLowerCase().trim();
                const isActive =
                  Boolean(currentQ) &&
                  (currentQ === item.query.toLowerCase() ||
                    currentQ === item.label.toLowerCase() ||
                    item.keywords.some((k) => currentQ === k));
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onSearchChange(isActive ? '' : item.query)}
                    className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border flex items-center gap-1.5 shadow-2xs active:scale-95 ${
                      isActive
                        ? 'bg-amber-400 text-stone-950 font-bold border-amber-300 ring-2 ring-amber-300/50 shadow-sm scale-102'
                        : 'bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white border-white/15'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <X className="w-3 h-3 text-stone-950 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: ACTIVE FILTERS SUMMARY & CLEAR BUTTON */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-[11px] flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-stone-400 font-mono text-[10px]">
                  {t('activeFilters')}
                </span>

                {searchQuery.trim() && (
                  <span className="px-2 py-0.5 rounded-lg bg-white/20 text-white flex items-center gap-1 text-[10px]">
                    « {searchQuery} »
                    <button
                      onClick={() => onSearchChange('')}
                      className="hover:text-red-300 cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {isOpenOnly && (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 flex items-center gap-1 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{t('openNowOnly') || 'Ouvert actuellement'}</span>
                    <button
                      onClick={() => onToggleOpenOnly && onToggleOpenOnly()}
                      className="hover:text-emerald-100 cursor-pointer ml-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {isHalalOnly && (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 flex items-center gap-1 text-[10px] font-bold">
                    🥩 {t('halal')}
                    <button
                      onClick={() => onToggleHalal && onToggleHalal()}
                      className="hover:text-emerald-100 cursor-pointer ml-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {isVeganOnly && (
                  <span className="px-2 py-0.5 rounded-lg bg-teal-500/30 text-teal-200 border border-teal-400/40 flex items-center gap-1 text-[10px] font-bold">
                    🥑 {t('vegan')}
                    <button
                      onClick={() => onToggleVegan && onToggleVegan()}
                      className="hover:text-teal-100 cursor-pointer ml-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {activeMacroFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-400/30 text-amber-200 border border-amber-400/40 flex items-center gap-1 text-[10px]">
                    {activeMacroFilter === 'high-protein' && t('highProtein')}
                    {activeMacroFilter === 'low-cal' && t('lowCal')}
                    {activeMacroFilter === 'low-carb' && t('lowCarb')}
                    {activeMacroFilter === 'low-fat' && t('lowFat')}
                    {activeMacroFilter === 'high-cal' && t('highCal')}
                    {activeMacroFilter === 'veg' && t('veg')}
                    <button
                      onClick={() => onMacroFilterChange('all')}
                      className="hover:text-amber-100 cursor-pointer ml-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {selectedAllergens.map((algId) => {
                  const alg = ALLERGENS_MASTER_LIST.find((a) => a.id === algId);
                  if (!alg) return null;
                  return (
                    <span
                      key={algId}
                      className="px-2 py-0.5 rounded-lg bg-red-500/30 text-red-200 border border-red-500/40 flex items-center gap-1 text-[10px]"
                    >
                      Sans {alg.name}
                      <button
                        onClick={() => onToggleAllergen(algId)}
                        className="hover:text-red-100 cursor-pointer ml-0.5"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-stone-400 hover:text-white underline font-mono text-[10px] flex items-center gap-1 cursor-pointer transition shrink-0 ml-auto"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>{t('clearFilters')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

