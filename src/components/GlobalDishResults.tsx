import React from 'react';
import { Sparkles, ArrowRight, Flame, ShieldCheck, Dumbbell, Leaf, Droplets, Zap } from 'lucide-react';
import { Dish, Language, MacroFilterType } from '../types';
import { I18N_DICT, ALLERGENS_MASTER_LIST } from '../data/i18n';
import { formatPrice } from '../utils/geo';
import { getAutoDishName, getAutoDishDesc } from '../utils/translator';

interface GlobalDishMatch {
  restaurantId: string;
  restaurantName: string;
  dish: Dish;
}

interface GlobalDishResultsProps {
  searchQuery: string;
  activeMacroFilter?: MacroFilterType;
  selectedAllergens?: string[];
  isHalalOnly?: boolean;
  isVeganOnly?: boolean;
  matches: GlobalDishMatch[];
  currentLang: Language;
  onSelectDish: (restaurantId: string, dish: Dish) => void;
}

export const GlobalDishResults: React.FC<GlobalDishResultsProps> = ({
  searchQuery,
  activeMacroFilter = 'all',
  selectedAllergens = [],
  isHalalOnly = false,
  isVeganOnly = false,
  matches,
  currentLang,
  onSelectDish,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  const isFiltering =
    searchQuery.trim() !== '' ||
    activeMacroFilter !== 'all' ||
    selectedAllergens.length > 0 ||
    isHalalOnly ||
    isVeganOnly;

  if (!isFiltering || matches.length === 0) return null;

  // Title calculation
  let title = t('dishesFoundTitle');
  if (searchQuery.trim()) {
    title = `${t('matchingDishesTitle')} « ${searchQuery} »`;
  } else if (isVeganOnly && activeMacroFilter === 'all') {
    title = currentLang === 'fr' ? 'Plats certifiés 100% Végétaliens / Vegan 🥑' : currentLang === 'it' ? 'Piatti certificati 100% Vegani 🥑' : '100% Vegan Certified Dishes 🥑';
  } else if (isHalalOnly && activeMacroFilter === 'all') {
    title = currentLang === 'fr' ? 'Plats certifiés 100% Halal 🥩' : currentLang === 'it' ? 'Piatti certificati 100% Halal 🥩' : '100% Halal Certified Dishes 🥩';
  } else if (activeMacroFilter === 'high-protein') {
    title = currentLang === 'fr' ? 'Plats les plus riches en protéines 💪' : currentLang === 'it' ? 'Piatti più ricchi di proteine 💪' : 'Highest Protein Dishes 💪';
  } else if (activeMacroFilter === 'low-cal') {
    title = currentLang === 'fr' ? 'Plats les moins caloriques 🥗' : currentLang === 'it' ? 'Piatti con meno calorie 🥗' : 'Lowest Calorie Dishes 🥗';
  } else if (activeMacroFilter === 'low-carb') {
    title = currentLang === 'fr' ? 'Plats les plus faibles en glucides 🥑' : currentLang === 'it' ? 'Piatti a basso contenuto di carboidrati 🥑' : 'Lowest Carb Dishes 🥑';
  } else if (activeMacroFilter === 'low-fat') {
    title = currentLang === 'fr' ? 'Plats les plus légers en matières grasses 💧' : currentLang === 'it' ? 'Piatti leggeri a bassi grassi 💧' : 'Lowest Fat Dishes 💧';
  } else if (activeMacroFilter === 'high-cal') {
    title = currentLang === 'fr' ? 'Plats les plus riches en énergie ⚡' : currentLang === 'it' ? 'Piatti ad alto valore energetico ⚡' : 'High Energy Dishes ⚡';
  } else if (activeMacroFilter === 'veg') {
    title = currentLang === 'fr' ? 'Plats 100% végétariens 🌱' : currentLang === 'it' ? 'Piatti vegetariani 🌱' : 'Vegetarian Dishes 🌱';
  } else if (activeMacroFilter === 'halal') {
    title = currentLang === 'fr' ? 'Plats certifiés 100% Halal 🥩' : currentLang === 'it' ? 'Piatti certificati 100% Halal 🥩' : '100% Halal Certified Dishes 🥩';
  } else if (selectedAllergens.length > 0) {
    title = currentLang === 'fr' ? 'Plats certifiés sans vos allergènes 🛡️' : currentLang === 'it' ? 'Piatti privi dei tuoi allergeni 🛡️' : 'Dishes Free from Your Allergens 🛡️';
  }

  // Active allergen names
  const excludedAllergenNames = selectedAllergens
    .map((id) => {
      const a = ALLERGENS_MASTER_LIST.find((item) => item.id === id);
      return a ? (currentLang === 'it' ? a.name_it : currentLang === 'en' ? a.name_en : a.name) : id;
    })
    .join(', ');

  return (
    <section className="space-y-4 pt-6 border-t border-stone-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <h4 className="font-serif font-bold text-lg text-stone-900">
            {title} :
          </h4>
          <span className="text-xs bg-amber-100 text-amber-900 font-mono px-2 py-0.5 rounded-full font-bold">
            {matches.length}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isHalalOnly && (
            <span className="text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
              <span>🥩</span>
              <span>100% Halal</span>
            </span>
          )}

          {isVeganOnly && (
            <span className="text-xs text-teal-800 bg-teal-100 border border-teal-300 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
              <span>🥑</span>
              <span>100% Végétalien</span>
            </span>
          )}

          {selectedAllergens.length > 0 && (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sans : {excludedAllergenNames}</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((item) => {
          const dishName = getAutoDishName(item.dish, currentLang);
          const dishDesc = getAutoDishDesc(item.dish, currentLang);

          return (
            <div
              key={`${item.restaurantId}-${item.dish.id}`}
              onClick={() => onSelectDish(item.restaurantId, item.dish)}
              className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm hover:border-[#8a3311] hover:shadow-md active:scale-[0.985] transition-all duration-200 space-y-3 flex flex-col justify-between group cursor-pointer touch-manipulation"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-[#99281a] font-bold uppercase tracking-wider block">
                        {item.restaurantName}
                      </span>
                      {(item.dish.isHalal || item.dish.tags.some((t) => t.toLowerCase() === 'halal')) && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300/80 px-1.5 py-0.2 rounded-md">
                          🥩 Halal
                        </span>
                      )}
                      {(item.dish.isVegan || item.dish.tags.some((t) => t.toLowerCase() === 'végétalien' || t.toLowerCase() === 'vegan')) && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-teal-800 bg-teal-100 border border-teal-300/80 px-1.5 py-0.2 rounded-md">
                          🥑 Végétalien
                        </span>
                      )}
                    </div>
                    <h5 className="font-serif font-bold text-sm text-stone-900 line-clamp-1 group-hover:text-[#99281a] transition-colors">
                      {dishName}
                    </h5>
                  </div>
                  <span className="font-serif font-bold text-sm text-[#99281a] shrink-0">
                    {formatPrice(item.dish.price)}
                  </span>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2">
                  {dishDesc || item.dish.description}
                </p>

                {/* Macro breakdown with dynamic highlights based on active filter */}
                <div className="grid grid-cols-4 gap-1 text-center text-[10px] bg-stone-50 p-2 rounded-2xl font-mono border border-stone-100">
                  <div
                    className={`p-1 rounded-xl transition ${
                      activeMacroFilter === 'low-cal' || activeMacroFilter === 'high-cal'
                        ? 'bg-emerald-100 text-emerald-950 font-black'
                        : ''
                    }`}
                  >
                    <span className="text-stone-400 block text-[9px] font-sans">Kcal</span>
                    <strong className="text-stone-800">{item.dish.nutrition.kcal}</strong>
                  </div>
                  <div
                    className={`p-1 rounded-xl transition ${
                      activeMacroFilter === 'high-protein'
                        ? 'bg-amber-200 text-stone-950 font-black'
                        : ''
                    }`}
                  >
                    <span className="text-stone-400 block text-[9px] font-sans">Prot.</span>
                    <strong className="text-stone-800">{item.dish.nutrition.protein}g</strong>
                  </div>
                  <div
                    className={`p-1 rounded-xl transition ${
                      activeMacroFilter === 'low-carb'
                        ? 'bg-cyan-100 text-cyan-950 font-black'
                        : ''
                    }`}
                  >
                    <span className="text-stone-400 block text-[9px] font-sans">Gluc.</span>
                    <strong className="text-stone-800">{item.dish.nutrition.carbs}g</strong>
                  </div>
                  <div
                    className={`p-1 rounded-xl transition ${
                      activeMacroFilter === 'low-fat'
                        ? 'bg-blue-100 text-blue-950 font-black'
                        : ''
                    }`}
                  >
                    <span className="text-stone-400 block text-[9px] font-sans">Lip.</span>
                    <strong className="text-stone-800">{item.dish.nutrition.fat}g</strong>
                  </div>
                </div>

                {/* Safe allergen badge */}
                {selectedAllergens.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Garanti sans vos allergènes</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onSelectDish(item.restaurantId, item.dish)}
                className="w-full py-2 bg-stone-100 hover:bg-[#99281a] hover:text-white text-stone-900 text-xs font-semibold rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t('viewInRestaurant')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

