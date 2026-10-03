import { Dish, MenuCategory, ComposedMealItem, MealCourseType, MealTargetGoal } from '../types';
import { formatPrice } from './geo';

export function detectDishCourse(dish: Dish, categories?: MenuCategory[]): MealCourseType {
  const cat = categories?.find((c) => c.id === dish.categoryId);
  const catName = (cat?.name || '').toLowerCase();
  const catId = (dish.categoryId || '').toLowerCase();
  const dishName = (dish.name_fr || dish.name || '').toLowerCase();
  const tags = (dish.tags || []).map((t) => t.toLowerCase());

  // 1. Drinks / Beverages
  if (
    catId.includes('boisson') ||
    catId.includes('bevande') ||
    catId.includes('drink') ||
    catId.includes('vin') ||
    catId.includes('cafe') ||
    catId.includes('birra') ||
    catName.includes('boisson') ||
    catName.includes('bevande') ||
    catName.includes('cocktail') ||
    catName.includes('vin') ||
    catName.includes('café') ||
    tags.includes('boisson') ||
    tags.includes('vin')
  ) {
    return 'drink';
  }

  // 2. Desserts / Dolci
  if (
    catId.includes('dessert') ||
    catId.includes('dolci') ||
    catId.includes('sucre') ||
    catName.includes('dessert') ||
    catName.includes('dolc') ||
    catName.includes('glace') ||
    catName.includes('douceur') ||
    tags.includes('dessert') ||
    tags.includes('dolci') ||
    dishName.includes('tiramisu') ||
    dishName.includes('panna cotta') ||
    dishName.includes('cannol') ||
    dishName.includes('fondant') ||
    dishName.includes('tarte') ||
    dishName.includes('profiterole')
  ) {
    return 'dessert';
  }

  // 3. Starters / Antipasti / Insalate / Entrées
  if (
    catId.includes('entree') ||
    catId.includes('antipast') ||
    catId.includes('starter') ||
    catId.includes('salade') ||
    catId.includes('insalate') ||
    catName.includes('entrée') ||
    catName.includes('antipast') ||
    catName.includes('starter') ||
    catName.includes('salade') ||
    catName.includes('bruschett') ||
    tags.includes('entrée') ||
    tags.includes('antipasti') ||
    tags.includes('starter')
  ) {
    return 'starter';
  }

  // 4. Main Dishes (pizza, pasta, piatti, secondi, burger, viandes, etc.)
  return 'main';
}

export interface MealTotals {
  totalKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalPrice: number;
  totalCount: number;
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  hasStarter: boolean;
  hasMain: boolean;
  hasDessert: boolean;
  hasDrink: boolean;
  allergensList: string[];
}

export function calculateMealTotals(items: ComposedMealItem[]): MealTotals {
  let totalKcal = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalPrice = 0;
  let totalCount = 0;

  const allergensSet = new Set<string>();

  let hasStarter = false;
  let hasMain = false;
  let hasDessert = false;
  let hasDrink = false;

  items.forEach((item) => {
    const q = item.quantity || 1;
    totalCount += q;
    totalKcal += (item.dish.nutrition.kcal || 0) * q;
    totalProtein += (item.dish.nutrition.protein || 0) * q;
    totalCarbs += (item.dish.nutrition.carbs || 0) * q;
    totalFat += (item.dish.nutrition.fat || 0) * q;
    totalPrice += (item.dish.price || 0) * q;

    if (item.course === 'starter') hasStarter = true;
    if (item.course === 'main') hasMain = true;
    if (item.course === 'dessert') hasDessert = true;
    if (item.course === 'drink') hasDrink = true;

    item.dish.allergens.forEach((alg) => allergensSet.add(alg));
  });

  const proteinKcal = totalProtein * 4;
  const carbsKcal = totalCarbs * 4;
  const fatKcal = totalFat * 9;
  const macroKcalSum = proteinKcal + carbsKcal + fatKcal;

  const proteinPercent = macroKcalSum > 0 ? Math.round((proteinKcal / macroKcalSum) * 100) : 0;
  const carbsPercent = macroKcalSum > 0 ? Math.round((carbsKcal / macroKcalSum) * 100) : 0;
  const fatPercent = macroKcalSum > 0 ? Math.max(0, 100 - proteinPercent - carbsPercent) : 0;

  return {
    totalKcal: Math.round(totalKcal),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalPrice: Math.round(totalPrice * 100) / 100,
    totalCount,
    proteinKcal: Math.round(proteinKcal),
    carbsKcal: Math.round(carbsKcal),
    fatKcal: Math.round(fatKcal),
    proteinPercent,
    carbsPercent,
    fatPercent,
    hasStarter,
    hasMain,
    hasDessert,
    hasDrink,
    allergensList: Array.from(allergensSet),
  };
}

export interface MacroTargetBenchmarks {
  targetKcal: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  label: string;
  description: string;
}

export function getMacroBenchmarks(goal: MealTargetGoal, customKcal = 750): MacroTargetBenchmarks {
  switch (goal) {
    case 'light':
      return {
        targetKcal: 550,
        targetProtein: 28,
        targetCarbs: 55,
        targetFat: 18,
        label: '🌿 Léger & Digestif',
        description: 'Repas léger, idéal pour un déjeuner rapide ou une reprise d\'activité.',
      };
    case 'high-protein':
      return {
        targetKcal: 900,
        targetProtein: 48,
        targetCarbs: 75,
        targetFat: 28,
        label: '💪 Sport & Protéines',
        description: 'Riche en protéines pour la récupération musculaire et l\'énergie.',
      };
    case 'custom':
      return {
        targetKcal: customKcal,
        targetProtein: Math.round((customKcal * 0.22) / 4),
        targetCarbs: Math.round((customKcal * 0.48) / 4),
        targetFat: Math.round((customKcal * 0.30) / 9),
        label: '🎯 Objectif Personnalisé',
        description: `Objectif calibré à ${customKcal} Kcal.`,
      };
    case 'balanced':
    default:
      return {
        targetKcal: 750,
        targetProtein: 35,
        targetCarbs: 85,
        targetFat: 26,
        label: '⚖️ Équilibré & Gourmand',
        description: 'Équilibre nutritionnel standard pour un repas complet et savoureux.',
      };
  }
}

export function generateMealShareText(
  items: ComposedMealItem[],
  restaurantName: string,
  totals: MealTotals
): string {
  const lines: string[] = [];
  lines.push(`🍽️ Mon Repas Idéal chez ${restaurantName} (via Gusto)`);
  lines.push('────────────────────────────────────────');

  const starters = items.filter((i) => i.course === 'starter');
  const mains = items.filter((i) => i.course === 'main');
  const desserts = items.filter((i) => i.course === 'dessert');
  const drinks = items.filter((i) => i.course === 'drink' || i.course === 'extra');

  if (starters.length > 0) {
    lines.push('🥗 Entrée(s) :');
    starters.forEach((i) => {
      lines.push(`  • ${i.dish.name_fr || i.dish.name} (x${i.quantity}) - ${i.dish.nutrition.kcal * i.quantity} kcal (${formatPrice(i.dish.price * i.quantity)})`);
    });
  }

  if (mains.length > 0) {
    lines.push('🍝 Plat(s) :');
    mains.forEach((i) => {
      lines.push(`  • ${i.dish.name_fr || i.dish.name} (x${i.quantity}) - ${i.dish.nutrition.kcal * i.quantity} kcal (${formatPrice(i.dish.price * i.quantity)})`);
    });
  }

  if (desserts.length > 0) {
    lines.push('🍮 Dessert(s) :');
    desserts.forEach((i) => {
      lines.push(`  • ${i.dish.name_fr || i.dish.name} (x${i.quantity}) - ${i.dish.nutrition.kcal * i.quantity} kcal (${formatPrice(i.dish.price * i.quantity)})`);
    });
  }

  if (drinks.length > 0) {
    lines.push('🍷 Boisson(s) & Extras :');
    drinks.forEach((i) => {
      lines.push(`  • ${i.dish.name_fr || i.dish.name} (x${i.quantity}) - ${i.dish.nutrition.kcal * i.quantity} kcal (${formatPrice(i.dish.price * i.quantity)})`);
    });
  }

  lines.push('────────────────────────────────────────');
  lines.push(`⚡ Total Calories : ${totals.totalKcal} Kcal`);
  lines.push(`🥩 Protéines : ${totals.totalProtein}g (${totals.proteinPercent}% kcal)`);
  lines.push(`🍞 Glucides : ${totals.totalCarbs}g (${totals.carbsPercent}% kcal)`);
  lines.push(`🥑 Lipides : ${totals.totalFat}g (${totals.fatPercent}% kcal)`);
  lines.push(`💶 Prix total : ${formatPrice(totals.totalPrice)}`);
  lines.push('────────────────────────────────────────');
  lines.push('Découvrez la carte nutritionnelle interactive sur Gusto !');

  return lines.join('\n');
}
