import React from 'react';
import { MapPin, Flame, ArrowRight, Utensils, ShieldCheck, Sparkles } from 'lucide-react';
import { Restaurant, Language, MacroFilterType } from '../types';
import { I18N_DICT } from '../data/i18n';

interface RestaurantCardProps {
  restaurant: Restaurant;
  currentLang: Language;
  selectedAllergens?: string[];
  activeMacroFilter?: MacroFilterType;
  isHalalOnly?: boolean;
  isVeganOnly?: boolean;
  onSelect: (id: string) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  currentLang,
  selectedAllergens = [],
  activeMacroFilter = 'all',
  isHalalOnly = false,
  isVeganOnly = false,
  onSelect,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  // Halal dish count
  const halalDishesCount = restaurant.dishes.filter(
    (d) =>
      d.isHalal ||
      d.tags.some((t) => t.toLowerCase() === 'halal') ||
      restaurant.isHalalCertified
  ).length;

  // Vegan dish count
  const veganDishesCount = restaurant.dishes.filter(
    (d) =>
      d.isVegan ||
      d.tags.some((t) => {
        const lower = t.toLowerCase();
        return lower === 'végétalien' || lower === 'vegan';
      })
  ).length;

  // Safe dishes count based on allergen filter
  const safeDishesCount =
    selectedAllergens.length > 0
      ? restaurant.dishes.filter(
          (d) => !d.allergens.some((alg) => selectedAllergens.includes(alg))
        ).length
      : restaurant.dishes.length;

  // Macro compatible count
  const macroMatchCount =
    activeMacroFilter === 'high-protein'
      ? restaurant.dishes.filter((d) => d.nutrition.protein >= 25).length
      : activeMacroFilter === 'low-cal'
      ? restaurant.dishes.filter((d) => d.nutrition.kcal <= 500).length
      : activeMacroFilter === 'low-carb'
      ? restaurant.dishes.filter((d) => d.nutrition.carbs <= 20).length
      : activeMacroFilter === 'low-fat'
      ? restaurant.dishes.filter((d) => d.nutrition.fat <= 12).length
      : activeMacroFilter === 'high-cal'
      ? restaurant.dishes.filter((d) => d.nutrition.kcal >= 700).length
      : activeMacroFilter === 'veg'
      ? restaurant.dishes.filter((d) =>
          d.tags.some((t) => t.toLowerCase().includes('végétarien'))
        ).length
      : activeMacroFilter === 'halal'
      ? restaurant.dishes.filter(
          (d) =>
            d.isHalal ||
            d.tags.some((t) => t.toLowerCase() === 'halal') ||
            restaurant.isHalalCertified
        ).length
      : 0;

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl hover:border-[#99281a]/50 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Banner with badges */}
        <div
          className="relative h-48 w-full overflow-hidden bg-stone-100 cursor-pointer"
          onClick={() => onSelect(restaurant.id)}
        >
          <img
            src={restaurant.banner}
            alt={restaurant.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-900/80 backdrop-blur-md text-amber-300 border border-amber-300/30">
              {restaurant.cuisine}
            </span>
            {restaurant.isHalalCertified && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600/95 backdrop-blur-md text-white border border-emerald-400/50 shadow-sm flex items-center gap-1">
                <span>🥩</span>
                <span>100% Halal</span>
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-stone-800">
              {restaurant.priceRange}
            </span>
          </div>

          {/* Distance */}
          <div className="absolute top-3 right-3 bg-[#99281a] text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            <MapPin className="w-3 h-3" />
            <span>
              {restaurant.distance !== undefined
                ? `${restaurant.distance} km`
                : 'Aubagne Centre'}
            </span>
          </div>

          {/* Live Open Status */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 text-emerald-800 border border-stone-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{restaurant.openingHours.isOpenNow ? t('open') : t('closed')}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5 space-y-3">
          <div>
            <h4
              className="text-xl font-serif font-bold text-stone-900 group-hover:text-[#99281a] transition-colors cursor-pointer"
              onClick={() => onSelect(restaurant.id)}
            >
              {restaurant.name}
            </h4>
            <p className="text-xs text-stone-500 font-serif italic mt-0.5">
              {restaurant.tagline}
            </p>
          </div>

          {/* Address */}
          <div className="text-[11px] text-stone-600 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#99281a] shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>

          {/* Allergen & Macro Compatibility Badges */}
          {(selectedAllergens.length > 0 || activeMacroFilter !== 'all' || isHalalOnly || isVeganOnly) && (
            <div className="flex flex-col gap-1 pt-1">
              {isHalalOnly && (
                <div className="text-[11px] px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 font-medium">
                  <span className="text-xs">🥩</span>
                  <span className="font-bold">
                    {restaurant.isHalalCertified
                      ? 'Établissement 100% Halal certifié'
                      : `${halalDishesCount} plat(s) Halal disponible(s)`}
                  </span>
                </div>
              )}

              {isVeganOnly && (
                <div className="text-[11px] px-2.5 py-1 rounded-xl bg-teal-50 text-teal-900 border border-teal-300 flex items-center gap-1.5 font-medium">
                  <span className="text-xs">🥑</span>
                  <span className="font-bold">
                    {veganDishesCount} plat(s) 100% Végétalien(s)
                  </span>
                </div>
              )}

              {selectedAllergens.length > 0 && (
                <div
                  className={`text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-medium ${
                    safeDishesCount > 0
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {safeDishesCount > 0
                      ? `${safeDishesCount} ${t('safeDishesFound')}`
                      : t('noSafeDishes')}
                  </span>
                </div>
              )}

              {activeMacroFilter !== 'all' && macroMatchCount > 0 && (
                <div className="text-[11px] px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {activeMacroFilter === 'halal'
                      ? `${macroMatchCount} plat(s) certifiés Halal`
                      : `${macroMatchCount} plat(s) répondant à vos critères`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Nutrition Summary Box */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/90 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-stone-700 font-semibold">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                {t('avgKcalLabel')} :
              </span>
              <strong className="text-stone-900 font-mono">
                {restaurant.avgKcal} Kcal
              </strong>
            </div>
            <div className="flex items-center justify-between text-stone-500 text-[10px]">
              <span className="flex items-center gap-1">
                <Utensils className="w-3 h-3 text-stone-400" />
                {t('specialtiesCount')} :
              </span>
              <span className="font-bold text-[#99281a]">
                {restaurant.dishes.length} {t('specialtiesListed')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="p-5 pt-0">
        <button
          onClick={() => onSelect(restaurant.id)}
          className="w-full py-2.5 bg-[#99281a] hover:bg-[#781524] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span>{t('consultMenu')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
