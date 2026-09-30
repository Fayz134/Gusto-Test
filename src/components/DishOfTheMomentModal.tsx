import React, { useState, useMemo } from 'react';
import {
  X,
  Star,
  Check,
  Search,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  Wine,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Dish, Restaurant, Language } from '../types';
import { formatPrice } from '../utils/geo';
import { getAutoDishName, getAutoDishDesc } from '../utils/translator';

interface DishOfTheMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onToggleDishOfTheMoment: (dishId: string | null, enabled: boolean) => void;
  onShowToast: (msg: string) => void;
  currentLang?: Language;
}

export const DishOfTheMomentModal: React.FC<DishOfTheMomentModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  onToggleDishOfTheMoment,
  onShowToast,
  currentLang = 'fr' as Language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('all');

  const isEnabled = restaurant.dishOfTheMomentEnabled ?? false;
  const currentMomentDish = useMemo(() => {
    if (restaurant.dishOfTheMomentId) {
      const found = restaurant.dishes.find((d) => d.id === restaurant.dishOfTheMomentId);
      if (found) return found;
    }
    return restaurant.dishes[0] || null;
  }, [restaurant.dishOfTheMomentId, restaurant.dishes]);

  // Filtered dishes list for selection
  const filteredDishes = useMemo(() => {
    return restaurant.dishes.filter((dish) => {
      const matchesCat =
        selectedCatId === 'all' || dish.categoryId === selectedCatId;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        dish.name.toLowerCase().includes(q) ||
        (dish.name_fr && dish.name_fr.toLowerCase().includes(q)) ||
        (dish.description && dish.description.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [restaurant.dishes, selectedCatId, searchQuery]);

  if (!isOpen) return null;

  const handleToggleActive = (active: boolean) => {
    const targetDishId = restaurant.dishOfTheMomentId || restaurant.dishes[0]?.id || null;
    onToggleDishOfTheMoment(targetDishId, active);
    if (active) {
      const targetDish = restaurant.dishes.find((d) => d.id === targetDishId);
      onShowToast(
        `⭐ Plat du Moment (Recommandation du Chef) activé avec « ${
          targetDish ? getAutoDishName(targetDish, currentLang) : 'votre plat'
        } » !`
      );
    } else {
      onShowToast(`L'option Plat du Moment (Recommandation du Chef) a été désactivée.`);
    }
  };

  const handleSelectDish = (dish: Dish) => {
    onToggleDishOfTheMoment(dish.id, true);
    onShowToast(
      `« ${getAutoDishName(
        dish,
        currentLang
      )} » est désormais le Plat du Moment (Recommandation du Chef) ! ⭐`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden"
      >
        {/* MODAL HEADER */}
        <div className="relative px-5 py-4 sm:px-7 sm:py-5 bg-gradient-to-r from-[#781524] via-[#99281a] to-[#781524] text-white border-b border-amber-400/30 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-xl shadow-md ring-2 ring-amber-300/80 shrink-0">
                ⭐
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide flex items-center gap-2 flex-wrap">
                  <span>Option Plat du Moment</span>
                  <span className="text-xs font-serif italic text-amber-200 font-normal">
                    (Recommandation du Chef)
                  </span>
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-200 mt-0.5">
                  Activez ou désactivez cette option quand vous voulez et choisissez le plat à mettre en avant.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="grow overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
          {/* SECTION 1: MASTER TOGGLE (ACTIVER / DÉSACTIVER) */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 transition-all bg-gradient-to-r from-amber-50/80 via-white to-orange-50/70 border-amber-300 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-stone-900">
                    Statut de la mise en avant :
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      isEnabled
                        ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {isEnabled ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Actif sur la carte</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Désactivé (Masqué)</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-snug">
                  {isEnabled
                    ? 'Le plat choisi est actuellement affiché en grand en tête de votre menu pour tous les visiteurs.'
                    : 'La bannière est actuellement masquée. Activez l’interrupteur pour la rendre visible.'}
                </p>
              </div>

              {/* TOGGLE SWITCH */}
              <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-amber-200 shadow-2xs self-start sm:self-auto">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => handleToggleActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
                <span className="text-xs font-bold text-stone-900 select-none">
                  {isEnabled ? 'Activé' : 'Désactivé'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: CURRENTLY FEATURED DISH PREVIEW */}
          {currentMomentDish && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Plat actuellement sélectionné</span>
                </h4>
                {isEnabled && (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Mis en avant aujourd'hui
                  </span>
                )}
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-50/80 p-3 sm:p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <img
                  src={currentMomentDish.image}
                  alt={getAutoDishName(currentMomentDish, currentLang)}
                  className="w-full sm:w-28 h-28 rounded-xl object-cover border border-stone-200 shadow-2xs shrink-0"
                />

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-stone-900">
                      {getAutoDishName(currentMomentDish, currentLang)}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#99281a] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                      {formatPrice(currentMomentDish.price)}
                    </span>
                    {currentMomentDish.isHalal && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        🥩 Halal
                      </span>
                    )}
                    {currentMomentDish.isVegan && (
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                        🥑 Vegan
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {getAutoDishDesc(currentMomentDish, currentLang)}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-stone-600 font-mono flex-wrap pt-0.5">
                    <span className="font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded">
                      {currentMomentDish.nutrition?.kcal || 0} kcal
                    </span>
                    <span>Protéines: {currentMomentDish.nutrition?.protein}g</span>
                    <span>Glucides: {currentMomentDish.nutrition?.carbs}g</span>
                    <span>Lipides: {currentMomentDish.nutrition?.fat}g</span>
                  </div>
                </div>

                {!isEnabled && (
                  <button
                    type="button"
                    onClick={() => handleToggleActive(true)}
                    className="self-stretch sm:self-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0"
                  >
                    Activer ce plat
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: CHOOSE WHICH DISH TO FEATURE */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[#99281a]" />
                <span>Choisir le plat que vous voulez mettre</span>
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Cliquez sur n'importe quel plat de votre carte pour le définir instantanément comme Plat du Moment.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
              <div className="relative grow max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un plat par son nom..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCatId('all')}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCatId === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  Tous ({restaurant.dishes.length})
                </button>
                {restaurant.categories
                  .filter((c) => c.id !== 'all')
                  .map((cat) => {
                    const count = restaurant.dishes.filter(
                      (d) => d.categoryId === cat.id
                    ).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCatId(cat.id)}
                        className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                          selectedCatId === cat.id
                            ? 'bg-[#99281a] text-white'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                        }`}
                      >
                        {cat.name_fr || cat.name} ({count})
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1 no-scrollbar">
              {filteredDishes.map((dish) => {
                const isSelected = restaurant.dishOfTheMomentId === dish.id;

                return (
                  <div
                    key={dish.id}
                    onClick={() => handleSelectDish(dish)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
                      isSelected && isEnabled
                        ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                        : isSelected
                        ? 'bg-amber-50/50 border-amber-300'
                        : 'bg-white hover:bg-stone-50 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={dish.image}
                        alt={getAutoDishName(dish, currentLang)}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-stone-900 truncate block max-w-[170px]">
                            {getAutoDishName(dish, currentLang)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono mt-0.5">
                          <span className="font-bold text-stone-800">
                            {formatPrice(dish.price)}
                          </span>
                          <span>•</span>
                          <span>{dish.nutrition?.kcal || 0} kcal</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected && isEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400 text-stone-950 font-bold text-[10px] shadow-2xs">
                          <Check className="w-3 h-3" />
                          <span>Actuel</span>
                        </span>
                      ) : isSelected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-stone-200 text-stone-700 font-semibold text-[10px]">
                          <span>Choisi (Off)</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 text-[10px] font-bold border border-stone-200 transition cursor-pointer"
                        >
                          Choisir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500">
            {isEnabled ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Option active sur votre carte</span>
              </span>
            ) : (
              <span className="text-stone-500">
                Option désactivée (la bannière n'est pas affichée)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
