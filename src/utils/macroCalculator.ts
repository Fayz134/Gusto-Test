/**
 * Macro & Nutritional Calculator Utility
 * Combines server-side Gemini 3.8 Flash multimodal AI vision + text analysis
 * with an extensive local nutrition knowledge base fallback.
 */

export interface MacroBreakdownItem {
  name: string;
  estimatedWeight?: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  notes?: string;
}

export interface MacroCalculationResult {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  estimatedPortion: string;
  items: MacroBreakdownItem[];
  detectedAllergens: string[];
  dietaryHighlights: string[];
  explanation: string;
  source: 'ai_vision_gemini' | 'ai_nutritional_gemini' | 'nutritional_database';
}

// Local Nutritional Reference Database per 100g or standard unit
interface FoodRef {
  keywords: string[];
  kcalPer100g: number;
  protPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  defaultGramWeight: number;
  allergens?: string[];
  category: string;
}

const FOOD_DATABASE: FoodRef[] = [
  // Viandes & Volailles
  {
    keywords: ['steak', 'bavette', 'faux-filet', 'boeuf', 'bœuf', 'viande hachee', 'viande hachée', 'steak hache', 'steak haché', 'rumsteak', 'entrecote', 'entrecôte'],
    kcalPer100g: 245,
    protPer100g: 26,
    carbsPer100g: 0,
    fatPer100g: 15,
    fiberPer100g: 0,
    defaultGramWeight: 150,
    category: 'viande',
  },
  {
    keywords: ['poulet', 'blanc de poulet', 'filet de poulet', 'escalope', 'dinde', 'volaille'],
    kcalPer100g: 165,
    protPer100g: 31,
    carbsPer100g: 0,
    fatPer100g: 3.6,
    fiberPer100g: 0,
    defaultGramWeight: 150,
    category: 'volaille',
  },
  {
    keywords: ['canard', 'magret', 'confit'],
    kcalPer100g: 230,
    protPer100g: 20,
    carbsPer100g: 0,
    fatPer100g: 17,
    fiberPer100g: 0,
    defaultGramWeight: 160,
    category: 'volaille',
  },
  {
    keywords: ['agneau', 'gigot', 'cotelette', 'côtelette', 'merguez'],
    kcalPer100g: 280,
    protPer100g: 20,
    carbsPer100g: 1,
    fatPer100g: 22,
    fiberPer100g: 0,
    defaultGramWeight: 120,
    category: 'viande',
  },
  {
    keywords: ['porc', 'jambon', 'bacon', 'lardon', 'pancetta', 'saucisse', 'chorizo'],
    kcalPer100g: 270,
    protPer100g: 22,
    carbsPer100g: 1,
    fatPer100g: 20,
    fiberPer100g: 0,
    defaultGramWeight: 80,
    category: 'charcuterie',
  },

  // Poissons & Fruits de mer
  {
    keywords: ['saumon', 'truite', 'pave de saumon', 'pavé de saumon'],
    kcalPer100g: 208,
    protPer100g: 20,
    carbsPer100g: 0,
    fatPer100g: 14,
    fiberPer100g: 0,
    defaultGramWeight: 160,
    allergens: ['poissons'],
    category: 'poisson',
  },
  {
    keywords: ['thon', 'cabillaud', 'dorade', 'bar', 'colin', 'merlu', 'loup', 'sole', 'poisson'],
    kcalPer100g: 110,
    protPer100g: 23,
    carbsPer100g: 0,
    fatPer100g: 1.8,
    fiberPer100g: 0,
    defaultGramWeight: 160,
    allergens: ['poissons'],
    category: 'poisson',
  },
  {
    keywords: ['crevette', 'crevettes', 'gambas', 'langoustine', 'homard', 'crabe'],
    kcalPer100g: 95,
    protPer100g: 21,
    carbsPer100g: 1,
    fatPer100g: 1,
    fiberPer100g: 0,
    defaultGramWeight: 120,
    allergens: ['crustaces'],
    category: 'fruits_de_mer',
  },
  {
    keywords: ['moule', 'moules', 'poulpe', 'calamar', 'encornet', 'seiche', 'saint-jacques'],
    kcalPer100g: 90,
    protPer100g: 16,
    carbsPer100g: 3,
    fatPer100g: 1.5,
    fiberPer100g: 0,
    defaultGramWeight: 150,
    allergens: ['mollusques'],
    category: 'fruits_de_mer',
  },

  // Féculents, Céréales & Pains
  {
    keywords: ['frite', 'frites', 'pomme frites', 'patates frites'],
    kcalPer100g: 290,
    protPer100g: 3.5,
    carbsPer100g: 38,
    fatPer100g: 14,
    fiberPer100g: 3.8,
    defaultGramWeight: 160,
    category: 'feculent',
  },
  {
    keywords: ['riz', 'riz basmati', 'riz blanc', 'riz rond', 'risotto'],
    kcalPer100g: 130, // cuit
    protPer100g: 2.8,
    carbsPer100g: 28,
    fatPer100g: 0.4,
    fiberPer100g: 0.5,
    defaultGramWeight: 160,
    category: 'feculent',
  },
  {
    keywords: ['pates', 'pâtes', 'spaghetti', 'penne', 'tagliatelles', 'linguine', 'gnocchi', 'lasagne'],
    kcalPer100g: 155, // cuit
    protPer100g: 5.5,
    carbsPer100g: 31,
    fatPer100g: 0.9,
    fiberPer100g: 1.8,
    defaultGramWeight: 180,
    allergens: ['gluten'],
    category: 'feculent',
  },
  {
    keywords: ['pain', 'baguette', 'bun', 'pain burger', 'brioche', 'toast', 'croûton', 'croutons', 'pain pita', 'naan'],
    kcalPer100g: 270,
    protPer100g: 9,
    carbsPer100g: 52,
    fatPer100g: 2.5,
    fiberPer100g: 3.2,
    defaultGramWeight: 80,
    allergens: ['gluten'],
    category: 'pain',
  },
  {
    keywords: ['pâte à pizza', 'pate a pizza', 'fond de pizza'],
    kcalPer100g: 260,
    protPer100g: 8,
    carbsPer100g: 50,
    fatPer100g: 3,
    fiberPer100g: 2.5,
    defaultGramWeight: 180,
    allergens: ['gluten'],
    category: 'pain',
  },
  {
    keywords: ['pomme de terre', 'pommes de terre', 'puree', 'purée', 'patate douce'],
    kcalPer100g: 85,
    protPer100g: 2,
    carbsPer100g: 19,
    fatPer100g: 0.2,
    fiberPer100g: 2.1,
    defaultGramWeight: 180,
    category: 'feculent',
  },
  {
    keywords: ['quinoa', 'lentille', 'lentilles', 'pois chiche', 'pois chiches', 'haricot rouge'],
    kcalPer100g: 120,
    protPer100g: 8,
    carbsPer100g: 18,
    fatPer100g: 1.5,
    fiberPer100g: 5.5,
    defaultGramWeight: 150,
    category: 'legumineuse',
  },

  // Fromages & Produits Laitiers
  {
    keywords: ['mozzarella', 'fior di latte', 'burrata', 'mozza'],
    kcalPer100g: 280,
    protPer100g: 22,
    carbsPer100g: 1.5,
    fatPer100g: 21,
    fiberPer100g: 0,
    defaultGramWeight: 100,
    allergens: ['lactose'],
    category: 'fromage',
  },
  {
    keywords: ['parmesan', 'grana padano', 'pecorino'],
    kcalPer100g: 395,
    protPer100g: 33,
    carbsPer100g: 0,
    fatPer100g: 29,
    fiberPer100g: 0,
    defaultGramWeight: 25,
    allergens: ['lactose'],
    category: 'fromage',
  },
  {
    keywords: ['cheddar', 'emmental', 'gruyere', 'gruyère', 'comte', 'comté', 'raclette'],
    kcalPer100g: 390,
    protPer100g: 25,
    carbsPer100g: 1,
    fatPer100g: 32,
    fiberPer100g: 0,
    defaultGramWeight: 40,
    allergens: ['lactose'],
    category: 'fromage',
  },
  {
    keywords: ['chevre', 'chèvre', 'feta', 'ricotta', 'gorgonzola', 'bleu'],
    kcalPer100g: 270,
    protPer100g: 15,
    carbsPer100g: 2,
    fatPer100g: 22,
    fiberPer100g: 0,
    defaultGramWeight: 50,
    allergens: ['lactose'],
    category: 'fromage',
  },
  {
    keywords: ['creme', 'crème', 'creme fraiche', 'crème fraîche'],
    kcalPer100g: 300,
    protPer100g: 2.5,
    carbsPer100g: 3,
    fatPer100g: 30,
    fiberPer100g: 0,
    defaultGramWeight: 40,
    allergens: ['lactose'],
    category: 'laitier',
  },
  {
    keywords: ['beurre'],
    kcalPer100g: 720,
    protPer100g: 0.8,
    carbsPer100g: 0.7,
    fatPer100g: 81,
    fiberPer100g: 0,
    defaultGramWeight: 15,
    allergens: ['lactose'],
    category: 'matiere_grasse',
  },

  // Matières grasses & Sauces
  {
    keywords: ['huile', "huile d'olive", 'huile de tournesol', 'vinaigrette'],
    kcalPer100g: 884,
    protPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 100,
    fiberPer100g: 0,
    defaultGramWeight: 12, // 1 cuillère à soupe ~ 10-12g
    category: 'matiere_grasse',
  },
  {
    keywords: ['mayonnaise', 'sauce burger', 'tartare', 'aioli', 'aïoli'],
    kcalPer100g: 680,
    protPer100g: 1.2,
    carbsPer100g: 3,
    fatPer100g: 74,
    fiberPer100g: 0,
    defaultGramWeight: 30,
    allergens: ['oeufs', 'moutarde'],
    category: 'sauce',
  },
  {
    keywords: ['sauce tomate', 'coulis', 'tomate pelee', 'sauce marinara'],
    kcalPer100g: 40,
    protPer100g: 1.5,
    carbsPer100g: 6.5,
    fatPer100g: 0.8,
    fiberPer100g: 1.5,
    defaultGramWeight: 80,
    category: 'sauce',
  },
  {
    keywords: ['pesto', 'pesto genovese'],
    kcalPer100g: 450,
    protPer100g: 5.5,
    carbsPer100g: 6,
    fatPer100g: 45,
    fiberPer100g: 2,
    defaultGramWeight: 30,
    allergens: ['fruits-a-coque', 'lactose'],
    category: 'sauce',
  },
  {
    keywords: ['sauce poivre', 'sauce champignon', 'sauce roquefort', 'sauce béarnaise', 'bearnaise'],
    kcalPer100g: 220,
    protPer100g: 2,
    carbsPer100g: 5,
    fatPer100g: 22,
    fiberPer100g: 0.5,
    defaultGramWeight: 40,
    allergens: ['lactose'],
    category: 'sauce',
  },

  // Œufs
  {
    keywords: ['oeuf', 'œuf', 'oeufs', 'œufs', 'omelette', 'oeuf poche', 'œuf poché', 'oeuf dur'],
    kcalPer100g: 145, // ~75 kcal par oeuf de 55g
    protPer100g: 12.6,
    carbsPer100g: 0.8,
    fatPer100g: 10,
    fiberPer100g: 0,
    defaultGramWeight: 55, // 1 oeuf
    allergens: ['oeufs'],
    category: 'oeuf',
  },

  // Légumes & Fraîcheur
  {
    keywords: ['avocat', 'guacamole'],
    kcalPer100g: 160,
    protPer100g: 2,
    carbsPer100g: 8.5,
    fatPer100g: 15,
    fiberPer100g: 6.7,
    defaultGramWeight: 60,
    category: 'legume',
  },
  {
    keywords: ['salade', 'roquette', 'laitue', 'mache', 'mâche', 'epinard', 'épinards'],
    kcalPer100g: 18,
    protPer100g: 1.5,
    carbsPer100g: 2.2,
    fatPer100g: 0.3,
    fiberPer100g: 1.8,
    defaultGramWeight: 50,
    category: 'legume',
  },
  {
    keywords: ['tomate', 'tomates', 'tomates cerises'],
    kcalPer100g: 20,
    protPer100g: 1,
    carbsPer100g: 3.5,
    fatPer100g: 0.2,
    fiberPer100g: 1.2,
    defaultGramWeight: 80,
    category: 'legume',
  },
  {
    keywords: ['champignon', 'champignons', 'bolets', 'cepes', 'cèpes'],
    kcalPer100g: 28,
    protPer100g: 3,
    carbsPer100g: 3.2,
    fatPer100g: 0.3,
    fiberPer100g: 1.5,
    defaultGramWeight: 70,
    category: 'legume',
  },
  {
    keywords: ['courgette', 'aubergine', 'poivron', 'poivrons', 'oignon', 'oignons', 'brocoli', 'haricot vert', 'legumes', 'légumes'],
    kcalPer100g: 32,
    protPer100g: 1.8,
    carbsPer100g: 5.5,
    fatPer100g: 0.3,
    fiberPer100g: 2.6,
    defaultGramWeight: 100,
    category: 'legume',
  },
  {
    keywords: ['olive', 'olives'],
    kcalPer100g: 145,
    protPer100g: 1,
    carbsPer100g: 3.8,
    fatPer100g: 15,
    fiberPer100g: 3.3,
    defaultGramWeight: 30,
    category: 'condiment',
  },

  // Desserts & Sucres
  {
    keywords: ['chocolat', 'cacao', 'chocolat noir'],
    kcalPer100g: 540,
    protPer100g: 7,
    carbsPer100g: 48,
    fatPer100g: 33,
    fiberPer100g: 8,
    defaultGramWeight: 40,
    category: 'dessert',
  },
  {
    keywords: ['sucre', 'miel', 'caramel', 'sirop'],
    kcalPer100g: 390,
    protPer100g: 0,
    carbsPer100g: 99,
    fatPer100g: 0,
    fiberPer100g: 0,
    defaultGramWeight: 20,
    category: 'sucre',
  },
  {
    keywords: ['mascarpone'],
    kcalPer100g: 410,
    protPer100g: 4.5,
    carbsPer100g: 3,
    fatPer100g: 42,
    fiberPer100g: 0,
    defaultGramWeight: 50,
    allergens: ['lactose'],
    category: 'fromage',
  },
  {
    keywords: ['glace', 'sorbet'],
    kcalPer100g: 190,
    protPer100g: 3,
    carbsPer100g: 28,
    fatPer100g: 7,
    fiberPer100g: 0.5,
    defaultGramWeight: 80,
    allergens: ['lactose'],
    category: 'dessert',
  },
];

/**
 * Extracts weight in grams from text item like "180g saumon", "200 g de frites", "2 oeufs", "1 cuillère à soupe d'huile"
 */
function extractWeightAndName(line: string): { weightG: number; cleanName: string } {
  let cleaned = line.trim();
  let weightG = 0;

  // Pattern: "180g", "180 g", "180 gr"
  const gramMatch = cleaned.match(/^(\d+(?:[.,]\d+)?)\s*(?:g|gr|grammes?)\b/i) ||
                    cleaned.match(/\b(\d+(?:[.,]\d+)?)\s*(?:g|gr|grammes?)\b/i);
  if (gramMatch) {
    weightG = parseFloat(gramMatch[1].replace(',', '.'));
  }

  // Pattern: "1 cuillère à soupe", "2 c. à soupe" (~10g - 15g)
  const spoonMatch = cleaned.match(/(\d+)?\s*(?:c\.?\s*à\s*soupe|cuill[eè]res?\s*à\s*soupe|cas)\b/i);
  if (spoonMatch) {
    const qty = spoonMatch[1] ? parseInt(spoonMatch[1], 10) : 1;
    weightG = qty * 12;
  }

  // Pattern: "2 tranches", "3 tranches"
  const trancheMatch = cleaned.match(/(\d+)\s*tranches?\b/i);
  if (trancheMatch && weightG === 0) {
    const qty = parseInt(trancheMatch[1], 10);
    weightG = qty * 30;
  }

  // Pattern: "2 oeufs", "3 œufs"
  const eggMatch = cleaned.match(/(\d+)\s*(?:oeufs?|œufs?)\b/i);
  if (eggMatch && weightG === 0) {
    const qty = parseInt(eggMatch[1], 10);
    weightG = qty * 55;
  }

  return { weightG, cleanName: cleaned };
}

/**
 * Fallback Local Database Calculation Engine
 * Parses text ingredients and accurately calculates all macros
 */
export function calculateMacrosFromDatabase(
  alimentsText: string,
  dishName = '',
  targetPortion = ''
): MacroCalculationResult {
  const items: MacroBreakdownItem[] = [];
  const detectedAllergensSet = new Set<string>();

  // Split ingredients by commas, semicolons, newlines, bullets or '+'
  const rawSegments = alimentsText
    .split(/[\n,;+•\*\-]|\bet\b/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);

  // If no segments found, check if dishName provides hints
  const segments = rawSegments.length > 0 ? rawSegments : [dishName];

  let totalKcal = 0;
  let totalProt = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalWeightG = 0;

  for (const seg of segments) {
    const { weightG, cleanName } = extractWeightAndName(seg);
    const lowerName = cleanName.toLowerCase();

    // Find best match in food database
    let bestMatch: FoodRef | null = null;
    let maxMatchLen = 0;

    for (const food of FOOD_DATABASE) {
      for (const kw of food.keywords) {
        if (lowerName.includes(kw) && kw.length > maxMatchLen) {
          bestMatch = food;
          maxMatchLen = kw.length;
        }
      }
    }

    const actualWeightG = weightG > 0 ? weightG : bestMatch?.defaultGramWeight || 100;
    const factor = actualWeightG / 100;

    let itemKcal = 0;
    let itemProt = 0;
    let itemCarbs = 0;
    let itemFat = 0;
    let itemFiber = 0;

    if (bestMatch) {
      itemKcal = Math.round(bestMatch.kcalPer100g * factor);
      itemProt = Math.round(bestMatch.protPer100g * factor * 10) / 10;
      itemCarbs = Math.round(bestMatch.carbsPer100g * factor * 10) / 10;
      itemFat = Math.round(bestMatch.fatPer100g * factor * 10) / 10;
      itemFiber = Math.round(bestMatch.fiberPer100g * factor * 10) / 10;

      if (bestMatch.allergens) {
        bestMatch.allergens.forEach((a) => detectedAllergensSet.add(a));
      }
    } else {
      // General culinary estimate for unidentified prepared ingredient (~150 kcal/100g)
      itemKcal = Math.round(150 * factor);
      itemProt = Math.round(7 * factor * 10) / 10;
      itemCarbs = Math.round(15 * factor * 10) / 10;
      itemFat = Math.round(6 * factor * 10) / 10;
      itemFiber = Math.round(1.5 * factor * 10) / 10;
    }

    totalKcal += itemKcal;
    totalProt += itemProt;
    totalCarbs += itemCarbs;
    totalFat += itemFat;
    totalFiber += itemFiber;
    totalWeightG += actualWeightG;

    items.push({
      name: cleanName,
      estimatedWeight: `${Math.round(actualWeightG)}g`,
      kcal: itemKcal,
      protein: Math.round(itemProt),
      carbs: Math.round(itemCarbs),
      fat: Math.round(itemFat),
      fiber: Math.round(itemFiber),
    });
  }

  // Dietary highlights
  const highlights: string[] = [];
  if (totalProt >= 30) highlights.push('⚡ Riche en Protéines (>30g)');
  if (totalCarbs <= 20) highlights.push('🥑 Faible en Glucides (Low-Carb)');
  if (totalKcal <= 500) highlights.push('🥗 Équilibré & Léger (<500 kcal)');
  if (totalFiber >= 6) highlights.push('🌾 Source de Fibres');

  const finalPortion = targetPortion.trim() || `${Math.round(totalWeightG)}g`;

  return {
    kcal: Math.round(totalKcal),
    protein: Math.round(totalProt),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat),
    fiber: Math.round(totalFiber),
    estimatedPortion: finalPortion,
    items,
    detectedAllergens: Array.from(detectedAllergensSet),
    dietaryHighlights: highlights,
    explanation: `Calcul établi sur la base des ingrédients saisis (${items.length} aliment(s) identifié(s)) pour une portion estimée à ${finalPortion}.`,
    source: 'nutritional_database',
  };
}

/**
 * Main Automatic Macro Calculation Function
 * 1. Tries the server-side multimodal Gemini API endpoint (/api/calculate-macros)
 *    passing the photo (base64 or URL) and user aliments/ingredients.
 * 2. If server API is unavailable or fails, falls back gracefully to local nutritional engine.
 */
export async function calculateDishMacrosAuto(params: {
  dishName?: string;
  ingredients: string;
  image?: string;
  portion?: string;
}): Promise<MacroCalculationResult> {
  const { dishName = '', ingredients, image, portion = '' } = params;

  // Attempt server-side Gemini 3.8 Flash analysis
  try {
    const res = await fetch('/api/calculate-macros', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dishName,
        ingredients,
        image,
        portion,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.kcal === 'number') {
        return {
          kcal: Math.round(data.kcal),
          protein: Math.round(data.protein || 0),
          carbs: Math.round(data.carbs || 0),
          fat: Math.round(data.fat || 0),
          fiber: Math.round(data.fiber || 0),
          estimatedPortion: data.estimatedPortion || portion || '350g',
          items: Array.isArray(data.items) ? data.items : [],
          detectedAllergens: Array.isArray(data.detectedAllergens) ? data.detectedAllergens : [],
          dietaryHighlights: Array.isArray(data.dietaryHighlights) ? data.dietaryHighlights : [],
          explanation: data.explanation || 'Calcul optimisé par intelligence artificielle visuelle & nutritionnelle Gemini.',
          source: image ? 'ai_vision_gemini' : 'ai_nutritional_gemini',
        };
      }
    }
  } catch (err) {
    console.warn('Backend Gemini macro endpoint unreachable, using client nutritional database:', err);
  }

  // Graceful fallback to smart local nutritional database
  return calculateMacrosFromDatabase(ingredients, dishName, portion);
}
