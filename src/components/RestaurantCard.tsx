import React from 'react';
import {
  MapPin,
  Flame,
  ArrowRight,
  Utensils,
  ShieldCheck,
  Sparkles,
  Star,
  Crown,
  Phone,
} from 'lucide-react';
import { Restaurant, Language, MacroFilterType, AMENITIES_MASTER_LIST } from '../types';
import { I18N_DICT } from '../data/i18n';
import { trackPhoneCall } from '../utils/analytics';
import { calcDistanceKm, calcTravelTimes } from '../utils/geo';
import { getAutoCuisineName } from '../utils/translator';
import { Share2, Footprints, Car } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  currentLang: Language;
  selectedAllergens?: string[];
  activeMacroFilter?: MacroFilterType;
  isHalalOnly?: boolean;
  isVeganOnly?: boolean;
  onSelect: (id: string) => void;
  isNewBadge?: boolean;
  onViewOnMap?: (id: string) => void;
  onShare?: (restaurant: Restaurant) => void;
  userCoords?: { lat: number; lng: number } | null;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  currentLang,
  selectedAllergens = [],
  activeMacroFilter = 'all',
  isHalalOnly = false,
  isVeganOnly = false,
  onSelect,
  isNewBadge = false,
  onViewOnMap,
  onShare,
  userCoords,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  const refLat = userCoords?.lat || 43.2929;
  const refLng = userCoords?.lng || 5.5714;
  const dist = calcDistanceKm(refLat, refLng, restaurant.coords.lat, restaurant.coords.lng);
  const travel = calcTravelTimes(dist);

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
    <div
      onClick={() => onSelect(restaurant.id)}
      className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12),0_12px_24px_-10px_rgba(153,40,26,0.07)] hover:border-[#99281a]/40 transform hover:-translate-y-1.5 hover:scale-[1.018] transition-all duration-300 ease-out flex flex-col justify-between group cursor-pointer"
    >
      <div>
        {/* Banner with badges */}
        <div
          className="relative h-48 w-full overflow-hidden bg-stone-100 cursor-pointer"
        >
          <img
            src={restaurant.banner}
            alt={restaurant.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
            {(isNewBadge || restaurant.isNew) && (
               <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 text-white shadow-[0_4px_12px_rgba(244,63,94,0.55)] border border-white/40 flex items-center gap-1 animate-pulse">
                <Sparkles className="w-2.5 h-2.5 text-amber-200 fill-amber-200" />
                <span>{currentLang === 'it' ? 'Nuovo' : currentLang === 'es' ? 'Nuevo' : currentLang === 'en' ? 'New' : 'Nouveau'}</span>
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-900/80 backdrop-blur-md text-amber-300 border border-amber-300/30">
              {getAutoCuisineName(restaurant.cuisine, currentLang)}
            </span>
            {restaurant.isHalalCertified && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600/95 backdrop-blur-md text-white border border-emerald-400/50 shadow-sm flex items-center gap-1">
                <span>🥩</span>
                <span>100% Halal</span>
              </span>
            )}
            {restaurant.isWebVerified && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-600/95 backdrop-blur-md text-white border border-blue-400/40 shadow-xs flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-blue-200" />
                <span>100% Vérifié</span>
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

          {/* Live Open Status & Recommandé badge */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 text-emerald-800 border border-stone-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{restaurant.openingHours.isOpenNow ? t('open') : t('closed')}</span>
          </div>

          {(restaurant.isGustoRecommended || (restaurant.rating || 4.8) >= 4.5) && (
            <div className="absolute bottom-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-[9px] px-2.5 py-1 rounded-full shadow-md border border-amber-200 flex items-center gap-1">
              <Crown className="w-2.5 h-2.5 fill-stone-950" />
              <span>Recommandé par Gusto</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 space-y-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h4
                className="text-xl font-serif font-bold text-stone-900 group-hover:text-[#99281a] transition-colors cursor-pointer"
                onClick={() => onSelect(restaurant.id)}
              >
                {restaurant.name}
              </h4>
              {/* Star Rating Badge */}
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/90 text-amber-900 font-black text-xs shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{restaurant.rating || 4.8}</span>
                <span className="text-stone-400 text-[10px] font-normal">
                  ({restaurant.reviewsCount || 34})
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-500 font-serif italic mt-0.5">
              {restaurant.tagline}
            </p>
          </div>

          {/* Address with View on Map CTA */}
          <div className="text-[11px] text-stone-600 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#99281a] shrink-0" />
              <span className="truncate">{restaurant.address}</span>
            </div>
            {onViewOnMap && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewOnMap(restaurant.id);
                }}
                className="shrink-0 text-[10px] text-[#99281a] hover:text-white hover:bg-[#99281a] font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 transition cursor-pointer"
                title="Voir ce restaurant sur la carte interactive"
              >
                <span>Carte</span>
                <span>🗺️</span>
              </button>
            )}
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

          {/* Estimated Travel Time */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-amber-950 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-amber-700" />
              <span>{travel.walkLabel}</span>
            </div>
            <span className="text-stone-300">•</span>
            <div className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-amber-700" />
              <span>{travel.driveLabel}</span>
            </div>
            <span className="text-amber-800 text-[10px] font-mono">({travel.distanceFormatted})</span>
          </div>

          {/* Amenities & Equipements */}
          {restaurant.amenities && restaurant.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {restaurant.amenities.slice(0, 4).map((a) => {
                const def = AMENITIES_MASTER_LIST.find((x) => x.id === a);
                return (
                  <span
                    key={a}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 font-medium flex items-center gap-1"
                  >
                    <span>{def?.emoji || '✨'}</span>
                    <span>{def?.shortLabel || a}</span>
                  </span>
                );
              })}
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

      {/* Buttons */}
      <div className="p-5 pt-0 flex items-center gap-2">
        <button
          onClick={() => onSelect(restaurant.id)}
          className="grow py-2.5 bg-[#99281a] hover:bg-[#781524] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <span>{t('consultMenu')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {onShare && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShare(restaurant);
            }}
            className="p-2.5 rounded-2xl bg-stone-100 hover:bg-blue-50 text-stone-700 hover:text-blue-700 border border-stone-200 hover:border-blue-300 transition cursor-pointer shadow-xs"
            title="Partager le restaurant et l'itinéraire"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            trackPhoneCall(restaurant.id);
            window.location.href = `tel:${restaurant.phone}`;
          }}
          className="p-2.5 rounded-2xl bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 border border-stone-200 hover:border-emerald-300 transition cursor-pointer shadow-xs"
          title={`Appeler ${restaurant.name} (${restaurant.phone})`}
        >
          <Phone className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
