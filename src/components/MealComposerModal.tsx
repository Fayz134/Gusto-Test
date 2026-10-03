import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Share2,
  Sparkles,
  Flame,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  UtensilsCrossed,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Info,
  Salad,
  Cake,
  Wine,
  Utensils,
} from 'lucide-react';
import { Dish, Restaurant, Language, ComposedMealItem, MealCourseType, MealTargetGoal } from '../types';
import { I18N_DICT, ALLERGENS_MASTER_LIST } from '../data/i18n';
import { formatPrice } from '../utils/geo';
import { getAutoDishName, getAutoDishDesc } from '../utils/translator';
import {
  calculateMealTotals,
  getMacroBenchmarks,
  generateMealShareText,
  detectDishCourse,
} from '../utils/mealComposer';

interface MealComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  currentLang: Language;
  items: ComposedMealItem[];
  onAddItem: (dish: Dish, course?: MealCourseType) => void;
  onRemoveItem: (dishId: string) => void;
  onUpdateQuantity: (dishId: string, delta: number) => void;
  onChangeCourse: (dishId: string, newCourse: MealCourseType) => void;
  onClearMeal: () => void;
  onOpenDishDetail: (dish: Dish) => void;
  onShowToast?: (msg: string) => void;
}

export const MealComposerModal: React.FC<MealComposerModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  currentLang,
  items,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onChangeCourse,
  onClearMeal,
  onOpenDishDetail,
  onShowToast,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  // Meal Goal Preset state
  const [goal, setGoal] = useState<MealTargetGoal>('balanced');
  const [customKcal, setCustomKcal] = useState<number>(750);
  const [pickerCourseOpen, setPickerCourseOpen] = useState<MealCourseType | null>(null);

  // Benchmarks & Totals
  const totals = useMemo(() => calculateMealTotals(items), [items]);
  const benchmarks = useMemo(() => getMacroBenchmarks(goal, customKcal), [goal, customKcal]);

  // Calories gauge percentage
  const kcalPercent = Math.min(150, Math.round((totals.totalKcal / benchmarks.targetKcal) * 100));
  const proteinGoalPercent = Math.min(150, Math.round((totals.totalProtein / benchmarks.targetProtein) * 100));
  const carbsGoalPercent = Math.min(150, Math.round((totals.totalCarbs / benchmarks.targetCarbs) * 100));
  const fatGoalPercent = Math.min(150, Math.round((totals.totalFat / benchmarks.targetFat) * 100));

  // Course grouped items
  const starterItems = useMemo(() => items.filter((i) => i.course === 'starter'), [items]);
  const mainItems = useMemo(() => items.filter((i) => i.course === 'main'), [items]);
  const dessertItems = useMemo(() => items.filter((i) => i.course === 'dessert'), [items]);
  const drinkItems = useMemo(() => items.filter((i) => i.course === 'drink' || i.course === 'extra'), [items]);

  // Filter available dishes for the inline picker
  const pickerDishes = useMemo(() => {
    if (!pickerCourseOpen) return [];
    return restaurant.dishes.filter((d) => {
      const detected = detectDishCourse(d, restaurant.categories);
      if (pickerCourseOpen === 'drink') {
        return detected === 'drink' || detected === 'extra';
      }
      return detected === pickerCourseOpen;
    });
  }, [pickerCourseOpen, restaurant.dishes, restaurant.categories]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setPickerCourseOpen(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShareMeal = () => {
    if (items.length === 0) return;
    const text = generateMealShareText(items, restaurant.name, totals);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (onShowToast) onShowToast(t('mealCopied') || 'Récapitulatif copié ! 📋');
      })
      .catch(() => {
        if (onShowToast) onShowToast('Partage indisponible sur cet appareil.');
      });
  };

  const getCalorieStatusColor = () => {
    if (totals.totalKcal === 0) return 'text-stone-400';
    if (kcalPercent < 75) return 'text-sky-600';
    if (kcalPercent <= 110) return 'text-emerald-600';
    if (kcalPercent <= 130) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getCalorieStatusText = () => {
    if (totals.totalKcal === 0) {
      return currentLang === 'it'
        ? 'Componi il tuo pasto per iniziare'
        : currentLang === 'en'
        ? 'Compose your meal to get started'
        : currentLang === 'es'
        ? 'Compón tu comida para comenzar'
        : 'Composez votre repas pour démarrer';
    }
    if (kcalPercent < 75) {
      return currentLang === 'it'
        ? "Pasto leggero e digeribile (sotto l'obiettivo)"
        : currentLang === 'en'
        ? 'Light & easy-to-digest meal (below target)'
        : currentLang === 'es'
        ? "Comida ligera y digestiva (por debajo del objetivo)"
        : "Repas léger & digeste (sous l'objectif)";
    }
    if (kcalPercent <= 110) {
      return currentLang === 'it'
        ? 'Perfettamente bilanciato e nel target'
        : currentLang === 'en'
        ? 'Perfectly balanced and on target'
        : currentLang === 'es'
        ? 'Perfectamente equilibrado y en el objetivo'
        : 'Parfaitement équilibré & dans la cible';
    }
    if (kcalPercent <= 130) {
      return currentLang === 'it'
        ? 'Pasto abbondante e generoso'
        : currentLang === 'en'
        ? 'Hearty & generous meal'
        : currentLang === 'es'
        ? 'Comida copiosa y generosa'
        : 'Repas copieux & généreux';
    }
    return currentLang === 'it'
      ? 'Pasto molto ricco ed energetico'
      : currentLang === 'en'
      ? 'Very rich & high-energy meal'
      : currentLang === 'es'
      ? 'Comida muy rica y energética'
      : 'Repas très riche & ultra-énergétique';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#fbf9f5] border border-stone-300 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-stone-200 bg-white/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 truncate">
                  {t('composedMealTitle') || 'Mon Repas Idéal & Totalisateur'}
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono text-[11px] font-bold border border-stone-200">
                  {totals.totalCount} {totals.totalCount > 1 ? 'plats' : 'plat'}
                </span>
              </div>
              <p className="text-xs text-stone-500 truncate">
                {restaurant.name} · {t('composedMealSubtitle') || 'Composition sur-mesure et macros en direct'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleShareMeal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer border border-stone-300/80"
                title={t('shareMeal')}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t('shareMeal') || 'Partager'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition cursor-pointer"
              aria-label={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* =========================================================================
              LIVE MACRO TOTALIZER DASHBOARD (GAUGES & METERS)
              ========================================================================= */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-5">
            {/* Goal preset segmented bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-stone-600" />
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider font-mono">
                  {t('targetBenchmark') || 'Objectif de repas :'}
                </span>
              </div>

              {/* Segmented controls for goals */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1 bg-stone-100/90 p-1 rounded-2xl border border-stone-200/80">
                <button
                  type="button"
                  onClick={() => setGoal('light')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    goal === 'light'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  🌿 Léger (550 Kcal)
                </button>
                <button
                  type="button"
                  onClick={() => setGoal('balanced')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    goal === 'balanced'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ⚖️ Équilibré (750 Kcal)
                </button>
                <button
                  type="button"
                  onClick={() => setGoal('high-protein')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    goal === 'high-protein'
                      ? 'bg-white text-indigo-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  💪 Protéiné (900 Kcal)
                </button>
                <button
                  type="button"
                  onClick={() => setGoal('custom')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    goal === 'custom'
                      ? 'bg-white text-amber-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  🎯 Personnalisé
                </button>
              </div>
            </div>

            {/* Custom slider if custom goal */}
            {goal === 'custom' && (
              <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-950">Ajustez votre cible calorique :</span>
                  <p className="text-stone-500 text-[11px]">Définissez l'apport cible pour votre déjeuner ou dîner.</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={400}
                    max={1400}
                    step={50}
                    value={customKcal}
                    onChange={(e) => setCustomKcal(Number(e.target.value))}
                    className="w-36 sm:w-48 accent-amber-600 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                    {customKcal} Kcal
                  </span>
                </div>
              </div>
            )}

            {/* MAIN GAUGES DISPLAY */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Card 1: TOTAL CALORIES GAUGE */}
              <div className="bg-stone-50/80 border border-stone-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600 font-mono">
                    <Flame className="w-4 h-4 text-orange-600" />
                    <span>Calories</span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">
                    Cible : {benchmarks.targetKcal}
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold font-serif text-stone-900">
                      {totals.totalKcal}
                    </span>
                    <span className="text-xs font-semibold text-stone-500 font-mono">Kcal</span>
                  </div>
                  <div className="mt-2 w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        kcalPercent < 75
                          ? 'bg-sky-500'
                          : kcalPercent <= 110
                          ? 'bg-emerald-500'
                          : kcalPercent <= 130
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, kcalPercent)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-1 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                  <span className={`font-semibold ${getCalorieStatusColor()}`}>
                    {kcalPercent}% de la cible
                  </span>
                  <span className="text-stone-400 font-mono">
                    {totals.totalKcal <= benchmarks.targetKcal
                      ? `-${benchmarks.targetKcal - totals.totalKcal} kcal`
                      : `+${totals.totalKcal - benchmarks.targetKcal} kcal`}
                  </span>
                </div>
              </div>

              {/* Card 2: PROTÉINES GAUGE */}
              <div className="bg-stone-50/80 border border-stone-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 font-mono flex items-center gap-1">
                    <span>🥩</span> Protéines
                  </span>
                  <span className="text-[11px] font-mono text-stone-500">
                    Cible : {benchmarks.targetProtein}g
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold font-serif text-indigo-950">
                      {totals.totalProtein}
                    </span>
                    <span className="text-xs font-semibold text-stone-500 font-mono">g</span>
                  </div>
                  <div className="mt-2 w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, proteinGoalPercent)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-1 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="font-semibold text-indigo-700">
                    {totals.proteinPercent}% de l'énergie
                  </span>
                  <span className="font-mono text-stone-400">
                    {totals.proteinKcal} kcal
                  </span>
                </div>
              </div>

              {/* Card 3: GLUCIDES GAUGE */}
              <div className="bg-stone-50/80 border border-stone-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-mono flex items-center gap-1">
                    <span>🍞</span> Glucides
                  </span>
                  <span className="text-[11px] font-mono text-stone-500">
                    Cible : {benchmarks.targetCarbs}g
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold font-serif text-amber-950">
                      {totals.totalCarbs}
                    </span>
                    <span className="text-xs font-semibold text-stone-500 font-mono">g</span>
                  </div>
                  <div className="mt-2 w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, carbsGoalPercent)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-1 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="font-semibold text-amber-800">
                    {totals.carbsPercent}% de l'énergie
                  </span>
                  <span className="font-mono text-stone-400">
                    {totals.carbsKcal} kcal
                  </span>
                </div>
              </div>

              {/* Card 4: LIPIDES GAUGE */}
              <div className="bg-stone-50/80 border border-stone-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800 font-mono flex items-center gap-1">
                    <span>🥑</span> Lipides
                  </span>
                  <span className="text-[11px] font-mono text-stone-500">
                    Cible : {benchmarks.targetFat}g
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold font-serif text-rose-950">
                      {totals.totalFat}
                    </span>
                    <span className="text-xs font-semibold text-stone-500 font-mono">g</span>
                  </div>
                  <div className="mt-2 w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, fatGoalPercent)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-1 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="font-semibold text-rose-800">
                    {totals.fatPercent}% de l'énergie
                  </span>
                  <span className="font-mono text-stone-400">
                    {totals.fatKcal} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Macro energy breakdown stacked bar */}
            {totals.totalKcal > 0 && (
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span className="font-bold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-stone-400" />
                    <span>{t('energyDistribution') || 'Répartition énergétique des macronutrients :'}</span>
                  </span>
                  <span className="font-medium italic text-stone-500 hidden sm:inline">
                    {getCalorieStatusText()}
                  </span>
                </div>

                <div className="h-3 w-full rounded-full bg-stone-100 overflow-hidden flex shadow-inner">
                  <div
                    className="bg-indigo-600 transition-all duration-500"
                    style={{ width: `${totals.proteinPercent}%` }}
                    title={`Protéines : ${totals.proteinPercent}% (${totals.proteinKcal} kcal)`}
                  />
                  <div
                    className="bg-amber-500 transition-all duration-500"
                    style={{ width: `${totals.carbsPercent}%` }}
                    title={`Glucides : ${totals.carbsPercent}% (${totals.carbsKcal} kcal)`}
                  />
                  <div
                    className="bg-rose-500 transition-all duration-500"
                    style={{ width: `${totals.fatPercent}%` }}
                    title={`Lipides : ${totals.fatPercent}% (${totals.fatKcal} kcal)`}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                      <span>Protéines <strong>{totals.proteinPercent}%</strong></span>
                    </span>
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      <span>Glucides <strong>{totals.carbsPercent}%</strong></span>
                    </span>
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                      <span>Lipides <strong>{totals.fatPercent}%</strong></span>
                    </span>
                  </div>

                  <span className="font-semibold text-stone-800">
                    {t('mealBudget')} <strong className="text-[#99281a] font-serif text-sm">{formatPrice(totals.totalPrice)}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              COMPOSED COURSES SECTIONS (ENTRÉE + PLAT + DESSERT + BOISSON)
              ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                  {t('mealComposition')}
                </h3>
                <p className="text-xs text-stone-500">
                  {currentLang === 'it'
                    ? 'Componi il tuo menu: 1 antipasto + 1 piatto + 1 dolce a scelta.'
                    : currentLang === 'en'
                    ? 'Build your balanced meal: 1 starter + 1 main + 1 dessert of your choice.'
                    : currentLang === 'es'
                    ? 'Compón tu menú: 1 entrante + 1 principal + 1 postre a elección.'
                    : 'Composez votre menu équilibré : 1 entrée + 1 plat + 1 dessert au choix.'}
                </p>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={onClearMeal}
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1 cursor-pointer transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('clearMeal') || 'Vider le repas'}</span>
                </button>
              )}
            </div>

            {/* COURSE 1: ENTRÉE */}
            <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-4 py-3 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                    🥗
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 font-mono">
                      {t('starterCourse') || '1. Entrée'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerCourseOpen(pickerCourseOpen === 'starter' ? null : 'starter')}
                    className="text-xs text-[#99281a] hover:text-[#781524] font-bold flex items-center gap-1 cursor-pointer transition bg-white px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{starterItems.length === 0 ? 'Choisir une entrée' : 'Ajouter une entrée'}</span>
                  </button>
                </div>
              </div>

              {/* Starter Dishes List */}
              <div className="p-3 divide-y divide-stone-100">
                {starterItems.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-2 px-1 text-center">
                    Aucune entrée sélectionnée pour le moment.
                  </p>
                ) : (
                  starterItems.map((item) => renderMealDishRow(item))
                )}
              </div>

              {/* Inline Dish Picker for Starter */}
              {pickerCourseOpen === 'starter' && renderInlineDishPicker('starter')}
            </div>

            {/* COURSE 2: PLAT PRINCIPAL */}
            <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-4 py-3 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs">
                    🍝
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 font-mono">
                      {t('mainCourse') || '2. Plat principal'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerCourseOpen(pickerCourseOpen === 'main' ? null : 'main')}
                    className="text-xs text-[#99281a] hover:text-[#781524] font-bold flex items-center gap-1 cursor-pointer transition bg-white px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{mainItems.length === 0 ? 'Choisir un plat' : 'Ajouter un plat'}</span>
                  </button>
                </div>
              </div>

              {/* Main Dishes List */}
              <div className="p-3 divide-y divide-stone-100">
                {mainItems.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-2 px-1 text-center">
                    Aucun plat principal sélectionné pour le moment.
                  </p>
                ) : (
                  mainItems.map((item) => renderMealDishRow(item))
                )}
              </div>

              {/* Inline Dish Picker for Main */}
              {pickerCourseOpen === 'main' && renderInlineDishPicker('main')}
            </div>

            {/* COURSE 3: DESSERT */}
            <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-4 py-3 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center text-xs">
                    🍮
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 font-mono">
                      {t('dessertCourse') || '3. Dessert'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerCourseOpen(pickerCourseOpen === 'dessert' ? null : 'dessert')}
                    className="text-xs text-[#99281a] hover:text-[#781524] font-bold flex items-center gap-1 cursor-pointer transition bg-white px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{dessertItems.length === 0 ? 'Choisir un dessert' : 'Ajouter un dessert'}</span>
                  </button>
                </div>
              </div>

              {/* Dessert Dishes List */}
              <div className="p-3 divide-y divide-stone-100">
                {dessertItems.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-2 px-1 text-center">
                    Aucun dessert sélectionné pour le moment.
                  </p>
                ) : (
                  dessertItems.map((item) => renderMealDishRow(item))
                )}
              </div>

              {/* Inline Dish Picker for Dessert */}
              {pickerCourseOpen === 'dessert' && renderInlineDishPicker('dessert')}
            </div>

            {/* COURSE 4: BOISSON & EXTRA (OPTIONNEL) */}
            <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-4 py-3 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-xs">
                    🍷
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 font-mono">
                      {t('drinkCourse') || '4. Boisson & Café (Optionnel)'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerCourseOpen(pickerCourseOpen === 'drink' ? null : 'drink')}
                    className="text-xs text-[#99281a] hover:text-[#781524] font-bold flex items-center gap-1 cursor-pointer transition bg-white px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{drinkItems.length === 0 ? 'Ajouter une boisson' : 'Autre boisson'}</span>
                  </button>
                </div>
              </div>

              {/* Drink Dishes List */}
              <div className="p-3 divide-y divide-stone-100">
                {drinkItems.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-2 px-1 text-center">
                    Aucune boisson ajoutée.
                  </p>
                ) : (
                  drinkItems.map((item) => renderMealDishRow(item))
                )}
              </div>

              {/* Inline Dish Picker for Drink */}
              {pickerCourseOpen === 'drink' && renderInlineDishPicker('drink')}
            </div>
          </div>

          {/* =========================================================================
              ALLERGENS AUDIT IN COMPOSED MEAL
              ========================================================================= */}
          {items.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('allergensCheck') || 'Vérification des Allergènes du Repas :'}</span>
                </span>
                <span className="text-[11px] text-stone-500 font-mono">
                  {totals.allergensList.length} allergène(s)
                </span>
              </div>

              <div className="pt-2.5">
                {totals.allergensList.length === 0 ? (
                  <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{t('noMajorAllergensInMeal') || 'Aucun allergène majeur répertorié dans ce menu !'}</span>
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-stone-500 mr-1">Présents dans vos plats :</span>
                    {totals.allergensList.map((algId) => {
                      const alg = ALLERGENS_MASTER_LIST.find((a) => a.id === algId);
                      return (
                        <span
                          key={algId}
                          className="px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <span>{alg?.icon || '⚠️'}</span>
                          <span>{alg?.name || algId}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state prompt if 0 items */}
          {items.length === 0 && (
            <div className="p-8 text-center bg-white border border-dashed border-stone-300 rounded-3xl space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-stone-900">
                  {t('emptyMeal') || 'Votre repas est encore vide'}
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  {t('emptyMealDesc') ||
                    'Sélectionnez vos plats (ex: 1 entrée + 1 plat + 1 dessert) depuis la carte ou directement via les boutons ci-dessus pour activer la jauge en direct.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-white border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[11px] uppercase font-bold text-stone-500 block font-mono">
                {t('mealTotal')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-serif font-extrabold text-[#99281a]">
                  {formatPrice(totals.totalPrice)}
                </span>
                <span className="text-xs font-mono font-bold text-stone-700">
                  • {totals.totalKcal} Kcal
                </span>
                <span className="text-xs font-mono text-stone-500 hidden xs:inline">
                  • {totals.totalProtein}g Prot.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleShareMeal}
                className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-stone-300"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t('copySummary')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition cursor-pointer shadow-md"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper row renderer for a composed dish
  function renderMealDishRow(item: ComposedMealItem) {
    const dish = item.dish;
    return (
      <div key={dish.id} className="py-2.5 flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
          onClick={() => onOpenDishDetail(dish)}
        >
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
            <img
              src={dish.image}
              alt={getAutoDishName(dish, currentLang)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="text-xs sm:text-sm font-serif font-bold text-stone-900 group-hover:text-[#99281a] transition-colors truncate">
              {getAutoDishName(dish, currentLang)}
            </h5>
            <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono mt-0.5 flex-wrap">
              <span className="font-bold text-stone-800">{dish.nutrition.kcal * item.quantity} kcal</span>
              <span>·</span>
              <span>P: {dish.nutrition.protein * item.quantity}g</span>
              <span>·</span>
              <span>G: {dish.nutrition.carbs * item.quantity}g</span>
              <span>·</span>
              <span>L: {dish.nutrition.fat * item.quantity}g</span>
              <span>·</span>
              <span className="font-bold text-[#99281a]">{formatPrice(dish.price * item.quantity)}</span>
            </div>
          </div>
        </div>

        {/* Quantity Controls & Delete */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center border border-stone-200 rounded-full bg-stone-50 overflow-hidden">
            <button
              type="button"
              onClick={() => onUpdateQuantity(dish.id, -1)}
              className="p-1.5 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
              title="Diminuer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-stone-800">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(dish.id, 1)}
              className="p-1.5 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
              title="Augmenter"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemoveItem(dish.id)}
            className="p-1.5 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 transition cursor-pointer"
            title="Retirer du repas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Inline Quick Dish Picker for a specific course
  function renderInlineDishPicker(course: MealCourseType) {
    return (
      <div className="p-3 bg-stone-100/90 border-t border-stone-200 animate-in fade-in duration-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-stone-700">
            Plats disponibles pour ce cours ({pickerDishes.length}) :
          </span>
          <button
            type="button"
            onClick={() => setPickerCourseOpen(null)}
            className="text-stone-500 hover:text-stone-800 text-[11px] underline cursor-pointer"
          >
            Fermer la liste
          </button>
        </div>

        {pickerDishes.length === 0 ? (
          <p className="text-xs text-stone-500 italic py-2">
            Aucun plat ne correspond à cette catégorie dans ce restaurant. Vous pouvez ajouter n'importe quel plat depuis la carte.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {pickerDishes.map((dish) => {
              const inMeal = items.find((i) => i.dish.id === dish.id);
              return (
                <div
                  key={dish.id}
                  className="bg-white p-2 rounded-xl border border-stone-200/90 flex items-center justify-between gap-2 shadow-2xs hover:border-[#99281a]/40 transition"
                >
                  <div
                    className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                    onClick={() => onOpenDishDetail(dish)}
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {getAutoDishName(dish, currentLang)}
                      </p>
                      <p className="text-[10px] text-stone-500 font-mono">
                        {dish.nutrition.kcal} Kcal · {formatPrice(dish.price)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddItem(dish, course)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                      inMeal
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-[#99281a] text-white hover:bg-[#781524]'
                    }`}
                  >
                    {inMeal ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>({inMeal.quantity})</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Ajouter</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
};
