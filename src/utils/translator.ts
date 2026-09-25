/**
 * Gusto Culinary Translation Engine
 * Automatically translates dish names, categories, and descriptions
 * into authentic Italian (IT) and English (EN) using Gemini AI with smart local gastronomic fallbacks.
 */

import { Dish, MenuCategory, Language } from '../types';

export interface CulinaryTranslationResult {
  name_it: string;
  name_en: string;
  description_it?: string;
  description_en?: string;
  category_it?: string;
  category_en?: string;
}

// In-memory cache for fast lookups
const TRANSLATION_CACHE = new Map<string, CulinaryTranslationResult>();

// Common Culinary Terms & Lexicon Dictionary
const CULINARY_DICTIONARY: Record<
  string,
  { it: string; en: string }
> = {
  // Category presets
  'pizzas base tomate': { it: 'Pizze a Base di Pomodoro', en: 'Tomato-Base Pizzas' },
  'pizzas base creme': { it: 'Pizze a Base Bianca', en: 'Cream-Base Pizzas' },
  'pizzas base crème': { it: 'Pizze a Base Bianca', en: 'Cream-Base Pizzas' },
  'pizzas au four a bois': { it: 'Pizze al Forno a Legna', en: 'Wood-Fired Pizzas' },
  'pizzas au four à bois': { it: 'Pizze al Forno a Legna', en: 'Wood-Fired Pizzas' },
  'pizzas speciales': { it: 'Pizze Speciali', en: 'Specialty Pizzas' },
  'pizzas spéciales': { it: 'Pizze Speciali', en: 'Specialty Pizzas' },
  'pates fraiches': { it: 'Pasta Fresca Artigianale', en: 'Fresh Handmade Pasta' },
  'pâtes fraîches': { it: 'Pasta Fresca Artigianale', en: 'Fresh Handmade Pasta' },
  'plats chauds & grillades': { it: 'Secondi Piatti & Grigliate', en: 'Hot Mains & Grills' },
  'grillades & viandes': { it: 'Carni & Grigliate', en: 'Grills & Meats' },
  'salades fraiches': { it: 'Insalate Fresche', en: 'Fresh Crisp Salads' },
  'salades fraîches': { it: 'Insalate Fresche', en: 'Fresh Crisp Salads' },
  'desserts & douceurs': { it: 'Dolci & Dessert della Casa', en: 'Desserts & Sweet Treats' },
  'desserts maison': { it: 'Dolci Fatti in Casa', en: 'Homemade Desserts' },
  'boissons & vins': { it: 'Bevande & Carta dei Vini', en: 'Drinks & Wine List' },
  'vins & aperitifs': { it: 'Vini & Aperitivi', en: 'Wines & Aperitifs' },
  'vins & apéritifs': { it: 'Vini & Aperitivi', en: 'Wines & Aperitifs' },
  'entrees & antipasti': { it: 'Antipasti della Tradizione', en: 'Starters & Appetizers' },
  'entrées & antipasti': { it: 'Antipasti della Tradizione', en: 'Starters & Appetizers' },
  'menu enfant': { it: 'Menu Bambini', en: 'Kids Menu' },
  'specialites du chef': { it: 'Specialità dello Chef', en: 'Chef Specialties' },
  'spécialités du chef': { it: 'Specialità dello Chef', en: 'Chef Specialties' },
  'café & thés': { it: 'Caffetteria & Tè', en: 'Coffee & Teas' },
  'cafe & thes': { it: 'Caffetteria & Tè', en: 'Coffee & Teas' },

  // Common Dishes
  'pizza margherita': { it: 'Pizza Margherita', en: 'Classic Margherita Pizza' },
  'pizza royale': { it: 'Pizza Reale Regina', en: 'Royal Pizza with Ham & Mushrooms' },
  'pizza reine': { it: 'Pizza Regina', en: 'Regina Ham & Mushroom Pizza' },
  'pizza 4 fromages': { it: 'Pizza Quattro Formaggi', en: 'Four Cheeses Pizza' },
  'pizza quatre fromages': { it: 'Pizza Quattro Formaggi', en: 'Four Cheeses Pizza' },
  'pizza cantadora': { it: 'Pizza Cantadora Napoletana', en: 'Cantadora Neapolitan Pizza' },
  'pizza calzone': { it: 'Calzone Classico al Forno', en: 'Traditional Folded Calzone' },
  'pizza napolitaine': { it: 'Pizza Napoletana Verace', en: 'Neapolitan Style Pizza' },
  'pizza vegetarienne': { it: 'Pizza Vegetariana dell\'Orto', en: 'Garden Vegetarian Pizza' },
  'pizza végétarienne': { it: 'Pizza Vegetariana dell\'Orto', en: 'Garden Vegetarian Pizza' },
  'pizza truffe': { it: 'Pizza al Tartufo Nero', en: 'Black Truffle Pizza' },
  'pizza chevre miel': { it: 'Pizza Caprino e Miele', en: 'Goat Cheese & Honey Pizza' },
  'pizza chèvre miel': { it: 'Pizza Caprino e Miele', en: 'Goat Cheese & Honey Pizza' },
  'pizza fruits de mer': { it: 'Pizza ai Frutti di Mare', en: 'Seafood Medley Pizza' },
  'pizza burrata': { it: 'Pizza alla Burrata Pugliese', en: 'Pugliese Burrata Pizza' },
  'pizza diavola': { it: 'Pizza Diavola Piccante', en: 'Spicy Diavola Pepperoni Pizza' },
  'bavette de boeuf': { it: 'Bavetta di Manzo Grigliata', en: 'Grilled Beef Flank Steak' },
  'bavette de bœuf': { it: 'Bavetta di Manzo Grigliata', en: 'Grilled Beef Flank Steak' },
  'entrecote grillee': { it: 'Entrecôte alla Griglia', en: 'Grilled Ribeye Steak' },
  'entrecôte grillée': { it: 'Entrecôte alla Griglia', en: 'Grilled Ribeye Steak' },
  'steak hache': { it: 'Bistecca di Manzo Scelto', en: 'Prime Ground Beef Steak' },
  'steak haché': { it: 'Bistecca di Manzo Scelto', en: 'Prime Ground Beef Steak' },
  'tartare de boeuf': { it: 'Battuta di Manzo al Coltello', en: 'Hand-Cut Beef Tartare' },
  'tartare de bœuf': { it: 'Battuta di Manzo al Coltello', en: 'Hand-Cut Beef Tartare' },
  'magret de canard': { it: 'Petto d\'Anatra Arrosto', en: 'Roast Duck Breast' },
  'poulet roti': { it: 'Pollo Ruspante Arrosto', en: 'Oven-Roasted Free Range Chicken' },
  'poulet rôti': { it: 'Pollo Ruspante Arrosto', en: 'Oven-Roasted Free Range Chicken' },
  'saumon grille': { it: 'Filetto di Salmone alla Griglia', en: 'Pan-Seared Salmon Fillet' },
  'saumon grillé': { it: 'Filetto di Salmone alla Griglia', en: 'Pan-Seared Salmon Fillet' },
  'loup de mer': { it: 'Spigola ai Profumi del Mediterraneo', en: 'Mediterranean Sea Bass' },
  'tiramisu': { it: 'Tiramisù Tradizionale al Mascarpone', en: 'Traditional Mascarpone Tiramisu' },
  'tiramisù': { it: 'Tiramisù Tradizionale al Mascarpone', en: 'Traditional Mascarpone Tiramisu' },
  'panna cotta': { it: 'Panna Cotta alla Vaniglia e Frutti Rossi', en: 'Vanilla Panna Cotta with Red Berries' },
  'fondant au chocolat': { it: 'Tortino Fondente al Cioccolato Caldo', en: 'Molten Chocolate Lava Cake' },
  'cafe gourmand': { it: 'Caffè Goloso con Dolcetti Artigianali', en: 'Gourmet Coffee with Mini Desserts' },
  'café gourmand': { it: 'Caffè Goloso con Dolcetti Artigianali', en: 'Gourmet Coffee with Mini Desserts' },
  'salade cesar': { it: 'Insalata Cesare Croccante', en: 'Crisp Caesar Salad' },
  'salade césar': { it: 'Insalata Cesare Croccante', en: 'Crisp Caesar Salad' },
  'burrata': { it: 'Burrata Cremosa Pugliese e Pomodorini', en: 'Creamy Burrata with Cherry Tomatoes' },
  'lasagnes': { it: 'Lasagne alla Bolognese Tradizionali', en: 'Traditional Bolognese Lasagna' },
  'tagliatelles carbonara': { it: 'Tagliatelle alla Carbonara', en: 'Classic Carbonara Tagliatelle' },
  'tagliatelles au saumon': { it: 'Tagliatelle al Salmone Affumicato', en: 'Smoked Salmon Tagliatelle' },
  'risotto aux champignons': { it: 'Risotto ai Funghi Porcini', en: 'Wild Porcini Mushroom Risotto' },
  'risotto a la truffe': { it: 'Risotto Mantecato al Tartufo', en: 'Creamy Black Truffle Risotto' },
  'risotto à la truffe': { it: 'Risotto Mantecato al Tartufo', en: 'Creamy Black Truffle Risotto' },
};

// Word-by-word replacement dictionary for culinary descriptions
const CULINARY_WORDS: { fr: RegExp; it: string; en: string }[] = [
  { fr: /\bsauce tomate mijotée\b/gi, it: 'salsa di pomodoro cotta a fuoco lento', en: 'slow-simmered tomato sauce' },
  { fr: /\bsauce tomate\b/gi, it: 'salsa di pomodoro', en: 'tomato sauce' },
  { fr: /\bcrème fraîche\b/gi, it: 'panna fresca', en: 'fresh cream' },
  { fr: /\bmozzarella fior di latte\b/gi, it: 'mozzarella fior di latte', en: 'fior di latte mozzarella' },
  { fr: /\bmozzarella cantadora\b/gi, it: 'mozzarella cantadora', en: 'cantadora mozzarella' },
  { fr: /\bmozzarella\b/gi, it: 'mozzarella', en: 'mozzarella' },
  { fr: /\bjambon blanc\b/gi, it: 'prosciutto cotto italiano', en: 'cured Italian ham' },
  { fr: /\bjambon cru\b/gi, it: 'prosciutto crudo stagionato', en: 'aged prosciutto' },
  { fr: /\bjambon\b/gi, it: 'prosciutto', en: 'ham' },
  { fr: /\bchampignons frais\b/gi, it: 'funghi champignon freschi', en: 'fresh mushrooms' },
  { fr: /\bchampignons\b/gi, it: 'funghi', en: 'mushrooms' },
  { fr: /\bbasilic frais\b/gi, it: 'basilico fresco profumato', en: 'fresh fragrant basil' },
  { fr: /\bbasilic\b/gi, it: 'basilico fresco', en: 'fresh basil' },
  { fr: /\bhuile d'olive vierge extra\b/gi, it: 'olio extravergine d\'oliva', en: 'extra virgin olive oil' },
  { fr: /\bhuile d'olive\b/gi, it: 'olio d\'oliva', en: 'olive oil' },
  { fr: /\bfromage de chèvre\b/gi, it: 'formaggio di capra', en: 'goat cheese' },
  { fr: /\bchèvre\b/gi, it: 'caprino', en: 'goat cheese' },
  { fr: /\bmiel\b/gi, it: 'miele millefiori', en: 'wildflower honey' },
  { fr: /\bnoix\b/gi, it: 'noci croccanti', en: 'crunchy walnuts' },
  { fr: /\bgorgonzola\b/gi, it: 'gorgonzola DOP', en: 'gorgonzola PDO' },
  { fr: /\bparmesan\b/gi, it: 'parmigiano reggiano 24 mesi', en: 'parmigiano reggiano' },
  { fr: /\broquette\b/gi, it: 'rucola fresca', en: 'fresh arugula' },
  { fr: /\bolives noires\b/gi, it: 'olive nere', en: 'black olives' },
  { fr: /\bolives\b/gi, it: 'olive', en: 'olives' },
  { fr: /\boignons caramélisés\b/gi, it: 'cipolle caramellate', en: 'caramelized onions' },
  { fr: /\boignons\b/gi, it: 'cipolle', en: 'onions' },
  { fr: /\bpiments\b/gi, it: 'peperoncino piccante', en: 'spicy peppers' },
  { fr: /\blardons\b/gi, it: 'pancetta affumicata', en: 'smoked bacon lardons' },
  { fr: /\bpancetta\b/gi, it: 'pancetta arrotolata', en: 'pancetta' },
  { fr: /\bviande hachée\b/gi, it: 'carne macinata scelta', en: 'prime ground beef' },
  { fr: /\boeuf\b/gi, it: 'manzo', en: 'beef' },
  { fr: /\bbœuf\b/gi, it: 'manzo', en: 'beef' },
  { fr: /\bpoulet\b/gi, it: 'pollo', en: 'chicken' },
  { fr: /\bsaumon\b/gi, it: 'salmone', en: 'salmon' },
  { fr: /\btruffe noire\b/gi, it: 'tartufo nero estivo', en: 'black truffle' },
  { fr: /\btruffe\b/gi, it: 'tartufo', en: 'truffle' },
  { fr: /\bcuite au four à bois\b/gi, it: 'cotta al forno a legna', en: 'wood-fired baked' },
  { fr: /\bau four à bois\b/gi, it: 'al forno a legna', en: 'wood-fired' },
  { fr: /\bfait maison\b/gi, it: 'fatto in casa', en: 'homemade' },
  { fr: /\bartisanal\b/gi, it: 'artigianale', en: 'artisanal' },
  { fr: /\bfrais\b/gi, it: 'fresco', en: 'fresh' },
  { fr: /\bfrites maison\b/gi, it: 'patatine fritte fatte in casa', en: 'housemade French fries' },
  { fr: /\bfrites\b/gi, it: 'patatine fritte', en: 'fries' },
  { fr: /\bsalade verte\b/gi, it: 'insalata verde mista', en: 'mixed green salad' },
];

/**
 * Intelligent client-side culinary translation fallback
 */
export function translateCulinaryLocally(
  name: string,
  description?: string,
  type: 'dish' | 'category' = 'dish'
): CulinaryTranslationResult {
  const cleanName = (name || '').trim().toLowerCase();

  // 1. Direct dictionary match
  if (CULINARY_DICTIONARY[cleanName]) {
    const entry = CULINARY_DICTIONARY[cleanName];
    return {
      name_it: entry.it,
      name_en: entry.en,
      description_it: translateDescriptionLocally(description || '', 'it'),
      description_en: translateDescriptionLocally(description || '', 'en'),
      category_it: entry.it,
      category_en: entry.en,
    };
  }

  // 2. Partial category matching
  if (type === 'category') {
    if (cleanName.includes('pizza')) {
      return {
        name_it: name.replace(/pizza/gi, 'Pizze'),
        name_en: name.replace(/pizzas?/gi, 'Pizzas'),
        category_it: name.replace(/pizza/gi, 'Pizze'),
        category_en: name.replace(/pizzas?/gi, 'Pizzas'),
      };
    }
    if (cleanName.includes('pâte') || cleanName.includes('pate')) {
      return {
        name_it: 'Primi Piatti & Pasta Fresca',
        name_en: 'Fresh Pasta & Specialties',
      };
    }
    if (cleanName.includes('dessert')) {
      return {
        name_it: 'Dolci Artigianali',
        name_en: 'Housemade Desserts',
      };
    }
    if (cleanName.includes('boisson') || cleanName.includes('vin')) {
      return {
        name_it: 'Bevande & Vini Selezionati',
        name_en: 'Drinks & Selected Wines',
      };
    }
    if (cleanName.includes('viande') || cleanName.includes('grill')) {
      return {
        name_it: 'Secondi Piatti & Grigliate',
        name_en: 'Meat Dishes & Grills',
      };
    }
    if (cleanName.includes('salade')) {
      return {
        name_it: 'Insalate dell\'Orto',
        name_en: 'Crisp Fresh Salads',
      };
    }
    if (cleanName.includes('entrée') || cleanName.includes('entree') || cleanName.includes('antipasti')) {
      return {
        name_it: 'Antipasti Sfiziosi',
        name_en: 'Starters & Appetizers',
      };
    }
  }

  // 3. Smart dish name rules
  let itName = name;
  let enName = name;

  // Prefix handling (Pizza, Salade, Carpaccio, etc.)
  if (/^pizza\s+/i.test(name)) {
    const after = name.replace(/^pizza\s+/i, '').trim();
    itName = `Pizza ${translateDishQualifier(after, 'it')}`;
    enName = `${translateDishQualifier(after, 'en')} Pizza`;
  } else if (/^salade\s+/i.test(name)) {
    const after = name.replace(/^salade\s+/i, '').trim();
    itName = `Insalata ${translateDishQualifier(after, 'it')}`;
    enName = `${translateDishQualifier(after, 'en')} Salad`;
  } else if (/^pâtes?\s+/i.test(name) || /^pates?\s+/i.test(name)) {
    const after = name.replace(/^pâtes?\s+/i, '').replace(/^pates?\s+/i, '').trim();
    itName = `Pasta ${translateDishQualifier(after, 'it')}`;
    enName = `${translateDishQualifier(after, 'en')} Pasta`;
  } else {
    itName = translateDishQualifier(name, 'it');
    enName = translateDishQualifier(name, 'en');
  }

  return {
    name_it: itName,
    name_en: enName,
    description_it: translateDescriptionLocally(description || '', 'it'),
    description_en: translateDescriptionLocally(description || '', 'en'),
  };
}

function translateDishQualifier(text: string, targetLang: 'it' | 'en'): string {
  let res = text;
  const lower = text.toLowerCase();

  if (CULINARY_DICTIONARY[lower]) {
    return CULINARY_DICTIONARY[lower][targetLang];
  }

  for (const item of CULINARY_WORDS) {
    if (item.fr.test(res)) {
      res = res.replace(item.fr, targetLang === 'it' ? item.it : item.en);
    }
  }

  // Capitalize nicely
  return res.charAt(0).toUpperCase() + res.slice(1);
}

function translateDescriptionLocally(desc: string, targetLang: 'it' | 'en'): string {
  if (!desc) return '';
  let out = desc;
  for (const item of CULINARY_WORDS) {
    out = out.replace(item.fr, targetLang === 'it' ? item.it : item.en);
  }
  return out;
}

/**
 * Main automatic translation function (Calls Gemini backend API first, falls back instantly)
 */
export async function autoTranslateCulinary(params: {
  name: string;
  description?: string;
  categoryName?: string;
  type?: 'dish' | 'category';
}): Promise<CulinaryTranslationResult> {
  const { name, description = '', categoryName = '', type = 'dish' } = params;
  const cacheKey = `${type}_${name.trim().toLowerCase()}_${description.trim().slice(0, 30)}`;

  if (TRANSLATION_CACHE.has(cacheKey)) {
    return TRANSLATION_CACHE.get(cacheKey)!;
  }

  // Try Server Gemini API
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        categoryName,
        type,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.name_it && data.name_en) {
        const result: CulinaryTranslationResult = {
          name_it: data.name_it,
          name_en: data.name_en,
          description_it: data.description_it || translateDescriptionLocally(description, 'it'),
          description_en: data.description_en || translateDescriptionLocally(description, 'en'),
          category_it: data.category_it,
          category_en: data.category_en,
        };
        TRANSLATION_CACHE.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Backend translation failed, falling back to local culinary engine', err);
  }

  // Fallback to local culinary dictionary
  const fallback = translateCulinaryLocally(name, description, type);
  TRANSLATION_CACHE.set(cacheKey, fallback);
  return fallback;
}

/**
 * Synchronous resolver for dish names with automatic translation fallback
 */
export function getAutoDishName(dish: Dish | null | undefined, lang: Language): string {
  if (!dish) return '';
  if (lang === 'fr') {
    return dish.name_fr || dish.name || '';
  }
  if (lang === 'it') {
    if (dish.name_it && dish.name_it.trim()) return dish.name_it;
    const local = translateCulinaryLocally(dish.name_fr || dish.name, dish.description, 'dish');
    return local.name_it;
  }
  if (lang === 'en') {
    if (dish.name_en && dish.name_en.trim()) return dish.name_en;
    const local = translateCulinaryLocally(dish.name_fr || dish.name, dish.description, 'dish');
    return local.name_en;
  }
  return dish.name_fr || dish.name || '';
}

/**
 * Synchronous resolver for category names with automatic translation fallback
 */
export function getAutoCategoryName(
  cat: MenuCategory | { id?: string; name: string; name_fr?: string; name_it?: string; name_en?: string } | null | undefined,
  lang: Language
): string {
  if (!cat) return '';
  const baseName = cat.name_fr || cat.name || '';
  if (lang === 'fr') {
    return baseName;
  }
  if (lang === 'it') {
    if (cat.name_it && cat.name_it.trim()) return cat.name_it;
    const local = translateCulinaryLocally(baseName, '', 'category');
    return local.name_it;
  }
  if (lang === 'en') {
    if (cat.name_en && cat.name_en.trim()) return cat.name_en;
    const local = translateCulinaryLocally(baseName, '', 'category');
    return local.name_en;
  }
  return baseName;
}

/**
 * Synchronous resolver for dish description with automatic translation fallback
 */
export function getAutoDishDesc(dish: Dish | null | undefined, lang: Language): string {
  if (!dish) return '';
  const desc = dish.description || '';
  if (!desc) return '';
  if (lang === 'fr') return desc;
  return translateDescriptionLocally(desc, lang === 'it' ? 'it' : 'en');
}
