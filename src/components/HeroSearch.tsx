import React from 'react';
import {
  Search,
  Navigation,
  Sparkles,
  ShieldAlert,
  X,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Dumbbell,
  Leaf,
  Droplets,
  Zap,
  Check,
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
}

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
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  const totalActiveOptionsCount =
    selectedAllergens.length +
    (isHalalOnly ? 1 : 0) +
    (isVeganOnly ? 1 : 0) +
    (activeMacroFilter !== 'all' ? 1 : 0);

  const hasActiveFilters =
    activeMacroFilter !== 'all' ||
    selectedAllergens.length > 0 ||
    searchQuery.trim() !== '' ||
    isHalalOnly ||
    isVeganOnly;

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
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 w-full">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-[#781524] text-white p-5 sm:p-8 shadow-xl border border-stone-700/50 space-y-4 sm:space-y-5">
        {/* Top Header Badge & Titles */}
        <div className="relative z-10 max-w-3xl space-y-2.5 sm:space-y-3">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs text-amber-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">{t('heroBadge')}</span>
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

            {/* Geolocation Button */}
            <button
              onClick={onRequestGeolocation}
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#b43e2b] hover:bg-[#99281a] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shrink-0 cursor-pointer active:scale-98 min-h-[42px]"
            >
              <Navigation className="w-4 h-4" />
              <span>{t('nearbyBtn')}</span>
            </button>
          </div>

          {/* SECTION 1: NUTRITIONAL MACROS & CRITERIA ("la plus riche en prot, moins calorique etc") */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-300 font-mono text-[10px] sm:text-[11px] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-amber-300" />
                <span>{t('searchCriteriaLabel')}</span>
              </span>

              {/* Mobile Quick Dropdown for macros */}
              <div className="sm:hidden">
                <select
                  value={activeMacroFilter}
                  onChange={(e) => onMacroFilterChange(e.target.value as MacroFilterType)}
                  className="bg-white/15 text-stone-100 text-[11px] font-semibold rounded-xl px-2 py-1 border border-white/20 focus:outline-none focus:ring-1 focus:ring-amber-300"
                  aria-label="Critères nutritionnels"
                >
                  <option value="all" className="text-stone-900">
                    ✨ {t('allDishes')}
                  </option>
                  <option value="high-protein" className="text-stone-900">
                    {t('highProtein')}
                  </option>
                  <option value="low-cal" className="text-stone-900">
                    {t('lowCal')}
                  </option>
                  <option value="low-carb" className="text-stone-900">
                    {t('lowCarb')}
                  </option>
                  <option value="low-fat" className="text-stone-900">
                    {t('lowFat')}
                  </option>
                  <option value="high-cal" className="text-stone-900">
                    {t('highCal')}
                  </option>
                  <option value="veg" className="text-stone-900">
                    {t('veg')}
                  </option>
                </select>
              </div>
            </div>

            {/* Macro Quick Chips */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
              <button
                type="button"
                onClick={() => onMacroFilterChange('all')}
                className={`px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition cursor-pointer shrink-0 ${
                  activeMacroFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-sm font-bold ring-1 ring-white/80'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200'
                }`}
              >
                {t('allDishes')}
              </button>

              <button
                type="button"
                onClick={() => onMacroFilterChange('high-protein')}
                className={`px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                  activeMacroFilter === 'high-protein'
                    ? 'bg-amber-400 text-stone-950 shadow-sm font-bold ring-1 ring-amber-300'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200'
                }`}
              >
                <span>💪</span>
                <span>{t('highProtein')}</span>
              </button>

              <button
                type="button"
                onClick={() => onMacroFilterChange('low-cal')}
                className={`px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                  activeMacroFilter === 'low-cal'
                    ? 'bg-emerald-400 text-stone-950 shadow-sm font-bold ring-1 ring-emerald-300'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200'
                }`}
              >
                <span>🥗</span>
                <span>{t('lowCal')}</span>
              </button>

              <button
                type="button"
                onClick={() => onMacroFilterChange('low-carb')}
                className={`px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                  activeMacroFilter === 'low-carb'
                    ? 'bg-cyan-400 text-stone-950 shadow-sm font-bold ring-1 ring-cyan-300'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200'
                }`}
              >
                <span>🥑</span>
                <span>{t('lowCarb')}</span>
              </button>

              <button
                type="button"
                onClick={() => onMacroFilterChange('low-fat')}
                className={`px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                  activeMacroFilter === 'low-fat'
                    ? 'bg-blue-300 text-stone-950 shadow-sm font-bold ring-1 ring-blue-200'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200'
                }`}
              >
                <span>💧</span>
                <span>{t('lowFat')}</span>
              </button>

              <button
                type="button"
                onClick={() => onMacroFilterChange('high-cal')}
                className={`px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                  activeMacroFilter === 'high-cal'
                    ? 'bg-orange-400 text-stone-950 shadow-sm font-bold ring-1 ring-orange-300'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200'
                }`}
              >
                <span>⚡</span>
                <span>{t('highCal')}</span>
              </button>

              <button
                type="button"
                onClick={() => onMacroFilterChange('veg')}
                className={`px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                  activeMacroFilter === 'veg'
                    ? 'bg-lime-400 text-stone-950 shadow-sm font-bold ring-1 ring-lime-300'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200'
                }`}
              >
                <span>🌱</span>
                <span>{t('veg')}</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: FAST ALLERGEN EXCLUSION CHIPS IN SEARCH BAR */}
          <div className="space-y-1.5 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-300 font-mono text-[10px] sm:text-[11px] flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-red-400" />
                <span>{t('excludeAllergensPrompt')}</span>
              </span>

              {selectedAllergens.length > 0 && (
                <button
                  onClick={onResetAllergens}
                  className="text-[10px] text-amber-300 hover:text-amber-200 underline font-mono flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>{t('resetFilters')}</span>
                </button>
              )}
            </div>

            {/* Quick 1-click Allergen toggles */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
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
                    onClick={() => onToggleAllergen(alg.id)}
                    className={`px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-red-500/90 text-white border-red-400 font-bold shadow-sm ring-1 ring-red-400/50'
                        : 'bg-white/5 hover:bg-white/15 text-stone-200 border-white/10'
                    }`}
                  >
                    <span>{alg.icon}</span>
                    <span className="truncate">{name}</span>
                    {isSelected && <X className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={onOpenAllergenModal}
                className="px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-300/30 cursor-pointer shrink-0"
              >
                {t('allAllergensBtn')}
              </button>
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
                    {activeMacroFilter === 'high-protein' && '💪 ' + t('highProtein')}
                    {activeMacroFilter === 'low-cal' && '🥗 ' + t('lowCal')}
                    {activeMacroFilter === 'low-carb' && '🥑 ' + t('lowCarb')}
                    {activeMacroFilter === 'low-fat' && '💧 ' + t('lowFat')}
                    {activeMacroFilter === 'high-cal' && '⚡ ' + t('highCal')}
                    {activeMacroFilter === 'veg' && '🌱 ' + t('veg')}
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

