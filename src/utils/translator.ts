/**
 * Gusto Culinary Translation Engine
 * Automatically translates dish names, categories, and descriptions
 * into authentic Italian (IT), English (EN), and Spanish (ES) using Gemini AI with smart local gastronomic fallbacks.
 */

import { Dish, MenuCategory, Language } from '../types';

export interface CulinaryTranslationResult {
  name_it: string;
  name_en: string;
  name_es?: string;
  description_it?: string;
  description_en?: string;
  description_es?: string;
  category_it?: string;
  category_en?: string;
  category_es?: string;
}

// In-memory cache for fast lookups
const TRANSLATION_CACHE = new Map<string, CulinaryTranslationResult>();

// Common Culinary Terms & Lexicon Dictionary (IT, EN, ES)
const CULINARY_DICTIONARY: Record<
  string,
  { it: string; en: string; es: string }
> = {
  // Category presets
  'pizzas base tomate': { it: 'Pizze a Base di Pomodoro', en: 'Tomato-Base Pizzas', es: 'Pizzas con Base de Tomate' },
  'pizzas base creme': { it: 'Pizze a Base Bianca', en: 'Cream-Base Pizzas', es: 'Pizzas con Base de Crema' },
  'pizzas base crème': { it: 'Pizze a Base Bianca', en: 'Cream-Base Pizzas', es: 'Pizzas con Base de Crema' },
  'pizzas au four a bois': { it: 'Pizze al Forno a Legna', en: 'Wood-Fired Pizzas', es: 'Pizzas al Horno de Leña' },
  'pizzas au four à bois': { it: 'Pizze al Forno a Legna', en: 'Wood-Fired Pizzas', es: 'Pizzas al Horno de Leña' },
  'pizzas speciales': { it: 'Pizze Speciali', en: 'Specialty Pizzas', es: 'Pizzas Especiales' },
  'pizzas spéciales': { it: 'Pizze Speciali', en: 'Specialty Pizzas', es: 'Pizzas Especiales' },
  'pates fraiches': { it: 'Pasta Fresca Artigianale', en: 'Fresh Handmade Pasta', es: 'Pasta Fresca Artesanal' },
  'pâtes fraîches': { it: 'Pasta Fresca Artigianale', en: 'Fresh Handmade Pasta', es: 'Pasta Fresca Artesanal' },
  'plats chauds & grillades': { it: 'Secondi Piatti & Grigliate', en: 'Hot Mains & Grills', es: 'Platos Calientes y Parrilladas' },
  'grillades & viandes': { it: 'Carni & Grigliate', en: 'Grills & Meats', es: 'Carnes a la Parrilla' },
  'salades fraiches': { it: 'Insalate Fresche', en: 'Fresh Crisp Salads', es: 'Ensaladas Frescas' },
  'salades fraîches': { it: 'Insalate Fresche', en: 'Fresh Crisp Salads', es: 'Ensaladas Frescas' },
  'desserts & douceurs': { it: 'Dolci & Dessert della Casa', en: 'Desserts & Sweet Treats', es: 'Postres y Dulces de la Casa' },
  'desserts maison': { it: 'Dolci Fatti in Casa', en: 'Homemade Desserts', es: 'Postres Caseros' },
  'boissons & vins': { it: 'Bevande & Carta dei Vini', en: 'Drinks & Wine List', es: 'Bebidas y Carta de Vinos' },
  'vins & aperitifs': { it: 'Vini & Aperitivi', en: 'Wines & Aperitifs', es: 'Vinos y Aperitivos' },
  'vins & apéritifs': { it: 'Vini & Aperitivi', en: 'Wines & Aperitifs', es: 'Vinos y Aperitivos' },
  'entrees & antipasti': { it: 'Antipasti della Tradizione', en: 'Starters & Appetizers', es: 'Entrantes y Aperitivos' },
  'entrées & antipasti': { it: 'Antipasti della Tradizione', en: 'Starters & Appetizers', es: 'Entrantes y Aperitivos' },
  'menu enfant': { it: 'Menu Bambini', en: 'Kids Menu', es: 'Menú Infantil' },
  'specialites du chef': { it: 'Specialità dello Chef', en: 'Chef Specialties', es: 'Especialidades del Chef' },
  'spécialités du chef': { it: 'Specialità dello Chef', en: 'Chef Specialties', es: 'Especialidades del Chef' },
  'café & thés': { it: 'Caffetteria & Tè', en: 'Coffee & Teas', es: 'Cafés e Infusiones' },
  'cafe & thes': { it: 'Caffetteria & Tè', en: 'Coffee & Teas', es: 'Cafés e Infusiones' },

  // Common Dishes
  'pizza margherita': { it: 'Pizza Margherita', en: 'Classic Margherita Pizza', es: 'Pizza Margarita Clásica' },
  'pizza royale': { it: 'Pizza Reale Regina', en: 'Royal Pizza with Ham & Mushrooms', es: 'Pizza Reina con Jamón y Champiñones' },
  'pizza reine': { it: 'Pizza Regina', en: 'Regina Ham & Mushroom Pizza', es: 'Pizza Reina con Jamón y Champiñones' },
  'pizza 4 fromages': { it: 'Pizza Quattro Formaggi', en: 'Four Cheeses Pizza', es: 'Pizza Cuatro Quesos' },
  'pizza quatre fromages': { it: 'Pizza Quattro Formaggi', en: 'Four Cheeses Pizza', es: 'Pizza Cuatro Quesos' },
  'pizza cantadora': { it: 'Pizza Cantadora Napoletana', en: 'Cantadora Neapolitan Pizza', es: 'Pizza Cantadora Napolitana' },
  'pizza calzone': { it: 'Calzone Classico al Forno', en: 'Traditional Folded Calzone', es: 'Calzone Clásico al Horno' },
  'pizza napolitaine': { it: 'Pizza Napoletana Verace', en: 'Neapolitan Style Pizza', es: 'Pizza Napolitana Tradicional' },
  'pizza vegetarienne': { it: 'Pizza Vegetariana dell\'Orto', en: 'Garden Vegetarian Pizza', es: 'Pizza Vegetariana de la Huerta' },
  'pizza végétarienne': { it: 'Pizza Vegetariana dell\'Orto', en: 'Garden Vegetarian Pizza', es: 'Pizza Vegetariana de la Huerta' },
  'pizza truffe': { it: 'Pizza al Tartufo Nero', en: 'Black Truffle Pizza', es: 'Pizza con Trufa Negra' },
  'pizza chevre miel': { it: 'Pizza Caprino e Miele', en: 'Goat Cheese & Honey Pizza', es: 'Pizza de Queso de Cabra y Miel' },
  'pizza chèvre miel': { it: 'Pizza Caprino e Miele', en: 'Goat Cheese & Honey Pizza', es: 'Pizza de Queso de Cabra y Miel' },
  'pizza fruits de mer': { it: 'Pizza ai Frutti di Mare', en: 'Seafood Medley Pizza', es: 'Pizza Frutos del Mar' },
  'pizza burrata': { it: 'Pizza alla Burrata Pugliese', en: 'Pugliese Burrata Pizza', es: 'Pizza con Burrata de Puglia' },
  'pizza diavola': { it: 'Pizza Diavola Piccante', en: 'Spicy Diavola Pepperoni Pizza', es: 'Pizza Diavola Picante' },
  'bavette de boeuf': { it: 'Bavetta di Manzo Grigliata', en: 'Grilled Beef Flank Steak', es: 'Bavette de Ternera a la Parrilla' },
  'bavette de bœuf': { it: 'Bavetta di Manzo Grigliata', en: 'Grilled Beef Flank Steak', es: 'Bavette de Ternera a la Parrilla' },
  'entrecote grillee': { it: 'Entrecôte alla Griglia', en: 'Grilled Ribeye Steak', es: 'Entrecot a la Parrilla' },
  'entrecôte grillée': { it: 'Entrecôte alla Griglia', en: 'Grilled Ribeye Steak', es: 'Entrecot a la Parrilla' },
  'steak hache': { it: 'Bistecca di Manzo Scelto', en: 'Prime Ground Beef Steak', es: 'Filete Ruso de Ternera' },
  'steak haché': { it: 'Bistecca di Manzo Scelto', en: 'Prime Ground Beef Steak', es: 'Filete Ruso de Ternera' },
  'tartare de boeuf': { it: 'Battuta di Manzo al Coltello', en: 'Hand-Cut Beef Tartare', es: 'Tartar de Ternera al Cuchillo' },
  'tartare de bœuf': { it: 'Battuta di Manzo al Coltello', en: 'Hand-Cut Beef Tartare', es: 'Tartar de Ternera al Cuchillo' },
  'magret de canard': { it: 'Petto d\'Anatra Arrosto', en: 'Roast Duck Breast', es: 'Magret de Pato Asado' },
  'poulet roti': { it: 'Pollo Ruspante Arrosto', en: 'Oven-Roasted Free Range Chicken', es: 'Pollo Asado de Corral' },
  'poulet rôti': { it: 'Pollo Ruspante Arrosto', en: 'Oven-Roasted Free Range Chicken', es: 'Pollo Asado de Corral' },
  'saumon grille': { it: 'Filetto di Salmone alla Griglia', en: 'Pan-Seared Salmon Fillet', es: 'Filete de Salmón a la Plancha' },
  'saumon grillé': { it: 'Filetto di Salmone alla Griglia', en: 'Pan-Seared Salmon Fillet', es: 'Filete de Salmón a la Plancha' },
  'loup de mer': { it: 'Spigola ai Profumi del Mediterraneo', en: 'Mediterranean Sea Bass', es: 'Lubina a los Aromas del Mediterráneo' },
  'tiramisu': { it: 'Tiramisù Tradizionale al Mascarpone', en: 'Traditional Mascarpone Tiramisu', es: 'Tiramisú Tradicional de Mascarpone' },
  'tiramisù': { it: 'Tiramisù Tradizionale al Mascarpone', en: 'Traditional Mascarpone Tiramisu', es: 'Tiramisú Tradicional de Mascarpone' },
  'panna cotta': { it: 'Panna Cotta alla Vaniglia e Frutti Rossi', en: 'Vanilla Panna Cotta with Red Berries', es: 'Panna Cotta de Vainilla con Frutos Rojos' },
  'fondant au chocolat': { it: 'Tortino Fondente al Cioccolato Caldo', en: 'Molten Chocolate Lava Cake', es: 'Coulant Fondente de Chocolate' },
  'cafe gourmand': { it: 'Caffè Goloso con Dolcetti Artigianali', en: 'Gourmet Coffee with Mini Desserts', es: 'Café Gourmet con Mini Postres Caseros' },
  'café gourmand': { it: 'Caffè Goloso con Dolcetti Artigianali', en: 'Gourmet Coffee with Mini Desserts', es: 'Café Gourmet con Mini Postres Caseros' },
  'salade cesar': { it: 'Insalata Cesare Croccante', en: 'Crisp Caesar Salad', es: 'Ensalada César Crujiente' },
  'salade césar': { it: 'Insalata Cesare Croccante', en: 'Crisp Caesar Salad', es: 'Ensalada César Crujiente' },
  'burrata': { it: 'Burrata Cremosa Pugliese e Pomodorini', en: 'Creamy Burrata with Cherry Tomatoes', es: 'Burrata Cremosa de Puglia con Tomatitos' },
  'lasagnes': { it: 'Lasagne alla Bolognese Tradizionali', en: 'Traditional Bolognese Lasagna', es: 'Lasaña Tradicional a la Boloñesa' },
  'tagliatelles carbonara': { it: 'Tagliatelle alla Carbonara', en: 'Classic Carbonara Tagliatelle', es: 'Tagliatelle a la Carbonara Tradicional' },
  'tagliatelles au saumon': { it: 'Tagliatelle al Salmone Affumicato', en: 'Smoked Salmon Tagliatelle', es: 'Tagliatelle con Salmón Ahumado' },
  'risotto aux champignons': { it: 'Risotto ai Funghi Porcini', en: 'Wild Porcini Mushroom Risotto', es: 'Risotto con Setas Porcini' },
  'risotto a la truffe': { it: 'Risotto Mantecato al Tartufo', en: 'Creamy Black Truffle Risotto', es: 'Risotto Meloso con Trufa Negra' },
  'risotto à la truffe': { it: 'Risotto Mantecato al Tartufo', en: 'Creamy Black Truffle Risotto', es: 'Risotto Meloso con Trufa Negra' },
};

// Word-by-word replacement dictionary for culinary descriptions
const CULINARY_WORDS: { fr: RegExp; it: string; en: string; es: string }[] = [
  { fr: /\bsauce tomate mijotée\b/gi, it: 'salsa di pomodoro cotta a fuoco lento', en: 'slow-simmered tomato sauce', es: 'salsa de tomate cocinada a fuego lento' },
  { fr: /\bsauce tomate\b/gi, it: 'salsa di pomodoro', en: 'tomato sauce', es: 'salsa de tomate' },
  { fr: /\bcrème fraîche\b/gi, it: 'panna fresca', en: 'fresh cream', es: 'crema fresca' },
  { fr: /\bmozzarella fior di latte\b/gi, it: 'mozzarella fior di latte', en: 'fior di latte mozzarella', es: 'mozzarella fior di latte' },
  { fr: /\bmozzarella cantadora\b/gi, it: 'mozzarella cantadora', en: 'cantadora mozzarella', es: 'mozzarella cantadora' },
  { fr: /\bmozzarella\b/gi, it: 'mozzarella', en: 'mozzarella', es: 'mozzarella' },
  { fr: /\bjambon blanc\b/gi, it: 'prosciutto cotto italiano', en: 'cured Italian ham', es: 'jamón cocido' },
  { fr: /\bjambon cru\b/gi, it: 'prosciutto crudo stagionato', en: 'aged prosciutto', es: 'jamón curado' },
  { fr: /\bjambon\b/gi, it: 'prosciutto', en: 'ham', es: 'jamón' },
  { fr: /\bchampignons frais\b/gi, it: 'funghi champignon freschi', en: 'fresh mushrooms', es: 'champiñones frescos' },
  { fr: /\bchampignons\b/gi, it: 'funghi', en: 'mushrooms', es: 'champiñones' },
  { fr: /\bbasilic frais\b/gi, it: 'basilico fresco profumato', en: 'fresh fragrant basil', es: 'albahaca fresca aromática' },
  { fr: /\bbasilic\b/gi, it: 'basilico fresco', en: 'fresh basil', es: 'albahaca fresca' },
  { fr: /\bhuile d'olive vierge extra\b/gi, it: 'olio extravergine d\'oliva', en: 'extra virgin olive oil', es: 'aceite de oliva virgen extra' },
  { fr: /\bhuile d'olive\b/gi, it: 'olio d\'oliva', en: 'olive oil', es: 'aceite de oliva' },
  { fr: /\bfromage de chèvre\b/gi, it: 'formaggio di capra', en: 'goat cheese', es: 'queso de cabra' },
  { fr: /\bchèvre\b/gi, it: 'caprino', en: 'goat cheese', es: 'queso de cabra' },
  { fr: /\bmiel\b/gi, it: 'miele millefiori', en: 'wildflower honey', es: 'miel pura de flores' },
  { fr: /\bnoix\b/gi, it: 'noci croccanti', en: 'crunchy walnuts', es: 'nueces crujientes' },
  { fr: /\bgorgonzola\b/gi, it: 'gorgonzola DOP', en: 'gorgonzola PDO', es: 'gorgonzola DOP' },
  { fr: /\bparmesan\b/gi, it: 'parmigiano reggiano 24 mesi', en: 'parmigiano reggiano', es: 'parmesano reggiano' },
  { fr: /\broquette\b/gi, it: 'rucola fresca', en: 'fresh arugula', es: 'rúcula fresca' },
  { fr: /\bolives noires\b/gi, it: 'olive nere', en: 'black olives', es: 'aceitunas negras' },
  { fr: /\bolives\b/gi, it: 'olive', en: 'olives', es: 'aceitunas' },
  { fr: /\boignons caramélisés\b/gi, it: 'cipolle caramellate', en: 'caramelized onions', es: 'cebollas caramelizadas' },
  { fr: /\boignons\b/gi, it: 'cipolle', en: 'onions', es: 'cebollas' },
  { fr: /\bpiments\b/gi, it: 'peperoncino piccante', en: 'spicy peppers', es: 'guindillas picantes' },
  { fr: /\blardons\b/gi, it: 'pancetta affumicata', en: 'smoked bacon lardons', es: 'tiras de panceta ahumada' },
  { fr: /\bpancetta\b/gi, it: 'pancetta arrotolata', en: 'pancetta', es: 'panceta curada' },
  { fr: /\bviande hachée\b/gi, it: 'carne macinata scelta', en: 'prime ground beef', es: 'carne picada seleccionada' },
  { fr: /\boeuf\b/gi, it: 'manzo', en: 'beef', es: 'ternera' },
  { fr: /\bbœuf\b/gi, it: 'manzo', en: 'beef', es: 'ternera' },
  { fr: /\bpoulet\b/gi, it: 'pollo', en: 'chicken', es: 'pollo' },
  { fr: /\bsaumon\b/gi, it: 'salmone', en: 'salmon', es: 'salmón' },
  { fr: /\btruffe noire\b/gi, it: 'tartufo nero estivo', en: 'black truffle', es: 'trufa negra' },
  { fr: /\btruffe\b/gi, it: 'tartufo', en: 'truffle', es: 'trufa' },
  { fr: /\bcuite au four à bois\b/gi, it: 'cotta al forno a legna', en: 'wood-fired baked', es: 'horneada al horno de leña' },
  { fr: /\bau four à bois\b/gi, it: 'al forno a legna', en: 'wood-fired', es: 'al horno de leña' },
  { fr: /\bfait maison\b/gi, it: 'fatto in casa', en: 'homemade', es: 'elaboración casera' },
  { fr: /\bartisanal\b/gi, it: 'artigianale', en: 'artisanal', es: 'artesanal' },
  { fr: /\bfrais\b/gi, it: 'fresco', en: 'fresh', es: 'fresco' },
  { fr: /\bfrites maison\b/gi, it: 'patatine fritte fatte in casa', en: 'housemade French fries', es: 'patatas fritas caseras' },
  { fr: /\bfrites\b/gi, it: 'patatine fritte', en: 'fries', es: 'patatas fritas' },
  { fr: /\bsalade verte\b/gi, it: 'insalata verde mista', en: 'mixed green salad', es: 'ensalada verde variada' },
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
      name_es: entry.es,
      description_it: translateDescriptionLocally(description || '', 'it'),
      description_en: translateDescriptionLocally(description || '', 'en'),
      description_es: translateDescriptionLocally(description || '', 'es'),
      category_it: entry.it,
      category_en: entry.en,
      category_es: entry.es,
    };
  }

  // 2. Partial category matching
  if (type === 'category') {
    if (cleanName.includes('pizza')) {
      return {
        name_it: name.replace(/pizza/gi, 'Pizze'),
        name_en: name.replace(/pizzas?/gi, 'Pizzas'),
        name_es: name.replace(/pizzas?/gi, 'Pizzas'),
        category_it: name.replace(/pizza/gi, 'Pizze'),
        category_en: name.replace(/pizzas?/gi, 'Pizzas'),
        category_es: name.replace(/pizzas?/gi, 'Pizzas'),
      };
    }
    if (cleanName.includes('pâte') || cleanName.includes('pate')) {
      return {
        name_it: 'Primi Piatti & Pasta Fresca',
        name_en: 'Fresh Pasta & Specialties',
        name_es: 'Pastas Frescas & Especialidades',
        category_it: 'Primi Piatti & Pasta Fresca',
        category_en: 'Fresh Pasta & Specialties',
        category_es: 'Pastas Frescas & Especialidades',
      };
    }
    if (cleanName.includes('dessert')) {
      return {
        name_it: 'Dolci Artigianali',
        name_en: 'Housemade Desserts',
        name_es: 'Postres Caseros',
        category_it: 'Dolci Artigianali',
        category_en: 'Housemade Desserts',
        category_es: 'Postres Caseros',
      };
    }
    if (cleanName.includes('boisson') || cleanName.includes('vin')) {
      return {
        name_it: 'Bevande & Vini Selezionati',
        name_en: 'Drinks & Selected Wines',
        name_es: 'Bebidas y Vinos Seleccionados',
        category_it: 'Bevande & Vini Selezionati',
        category_en: 'Drinks & Selected Wines',
        category_es: 'Bebidas y Vinos Seleccionados',
      };
    }
    if (cleanName.includes('viande') || cleanName.includes('grill')) {
      return {
        name_it: 'Secondi Piatti & Grigliate',
        name_en: 'Meat Dishes & Grills',
        name_es: 'Carnes y Platos a la Parrilla',
        category_it: 'Secondi Piatti & Grigliate',
        category_en: 'Meat Dishes & Grills',
        category_es: 'Carnes y Platos a la Parrilla',
      };
    }
    if (cleanName.includes('salade')) {
      return {
        name_it: 'Insalate dell\'Orto',
        name_en: 'Crisp Fresh Salads',
        name_es: 'Ensaladas Frescas de la Huerta',
        category_it: 'Insalate dell\'Orto',
        category_en: 'Crisp Fresh Salads',
        category_es: 'Ensaladas Frescas de la Huerta',
      };
    }
    if (cleanName.includes('entrée') || cleanName.includes('entree') || cleanName.includes('antipasti')) {
      return {
        name_it: 'Antipasti Sfiziosi',
        name_en: 'Starters & Appetizers',
        name_es: 'Entrantes y Aperitivos',
        category_it: 'Antipasti Sfiziosi',
        category_en: 'Starters & Appetizers',
        category_es: 'Entrantes y Aperitivos',
      };
    }
  }

  // 3. Smart dish name rules
  let itName = name;
  let enName = name;
  let esName = name;

  // Prefix handling (Pizza, Salade, Carpaccio, etc.)
  if (/^pizza\s+/i.test(name)) {
    const after = name.replace(/^pizza\s+/i, '').trim();
    itName = `Pizza ${translateDishQualifier(after, 'it')}`;
    enName = `${translateDishQualifier(after, 'en')} Pizza`;
    esName = `Pizza ${translateDishQualifier(after, 'es')}`;
  } else if (/^salade\s+/i.test(name)) {
    const after = name.replace(/^salade\s+/i, '').trim();
    itName = `Insalata ${translateDishQualifier(after, 'it')}`;
    enName = `${translateDishQualifier(after, 'en')} Salad`;
    esName = `Ensalada ${translateDishQualifier(after, 'es')}`;
  } else if (/^pâtes?\s+/i.test(name) || /^pates?\s+/i.test(name)) {
    const after = name.replace(/^pâtes?\s+/i, '').replace(/^pates?\s+/i, '').trim();
    itName = `Pasta ${translateDishQualifier(after, 'it')}`;
    enName = `${translateDishQualifier(after, 'en')} Pasta`;
    esName = `Pasta ${translateDishQualifier(after, 'es')}`;
  } else {
    itName = translateDishQualifier(name, 'it');
    enName = translateDishQualifier(name, 'en');
    esName = translateDishQualifier(name, 'es');
  }

  return {
    name_it: itName,
    name_en: enName,
    name_es: esName,
    description_it: translateDescriptionLocally(description || '', 'it'),
    description_en: translateDescriptionLocally(description || '', 'en'),
    description_es: translateDescriptionLocally(description || '', 'es'),
  };
}

function translateDishQualifier(text: string, targetLang: 'it' | 'en' | 'es'): string {
  let res = text;
  const lower = text.toLowerCase();

  if (CULINARY_DICTIONARY[lower]) {
    return CULINARY_DICTIONARY[lower][targetLang];
  }

  for (const item of CULINARY_WORDS) {
    if (item.fr.test(res)) {
      res = res.replace(item.fr, item[targetLang]);
    }
  }

  // Capitalize nicely
  return res.charAt(0).toUpperCase() + res.slice(1);
}

function translateDescriptionLocally(desc: string, targetLang: 'it' | 'en' | 'es'): string {
  if (!desc) return '';
  let out = desc;
  for (const item of CULINARY_WORDS) {
    out = out.replace(item.fr, item[targetLang]);
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
          name_es: data.name_es || translateCulinaryLocally(name, description, type).name_es,
          description_it: data.description_it || translateDescriptionLocally(description, 'it'),
          description_en: data.description_en || translateDescriptionLocally(description, 'en'),
          description_es: data.description_es || translateDescriptionLocally(description, 'es'),
          category_it: data.category_it,
          category_en: data.category_en,
          category_es: data.category_es || translateCulinaryLocally(categoryName, '', 'category').category_es,
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
  if (lang === 'es') {
    if (dish.name_es && dish.name_es.trim()) return dish.name_es;
    const local = translateCulinaryLocally(dish.name_fr || dish.name, dish.description, 'dish');
    return local.name_es || local.name_it || dish.name_fr || dish.name;
  }
  return dish.name_fr || dish.name || '';
}

/**
 * Synchronous resolver for category names with automatic translation fallback
 */
export function getAutoCategoryName(
  cat: MenuCategory | { id?: string; name: string; name_fr?: string; name_it?: string; name_en?: string; name_es?: string } | null | undefined,
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
  if (lang === 'es') {
    if (cat.name_es && cat.name_es.trim()) return cat.name_es;
    const local = translateCulinaryLocally(baseName, '', 'category');
    return local.name_es || local.category_es || baseName;
  }
  return baseName;
}

/**
 * Synchronous resolver for dish description with automatic translation fallback
 */
export function getAutoDishDesc(dish: Dish | null | undefined, lang: Language): string {
  if (!dish) return '';
  const desc = dish.description_es && lang === 'es' ? dish.description_es : dish.description || '';
  if (!desc) return '';
  if (lang === 'fr') return desc;
  return translateDescriptionLocally(desc, lang === 'it' ? 'it' : lang === 'es' ? 'es' : 'en');
}

const CUISINE_DICTIONARY: Record<string, { it: string; en: string; es: string }> = {
  'pizzeria artisanale / cuite au feu de bois': {
    it: 'Pizzeria Artigianale al Forno a Legna',
    en: 'Artisan Wood-Fired Pizzeria',
    es: 'Pizzería Artesanal al Horno de Leña',
  },
  'pizzeria artisanale / feu de bois': {
    it: 'Pizzeria Artigianale al Forno a Legna',
    en: 'Artisan Wood-Fired Pizzeria',
    es: 'Pizzería Artesanal al Horno de Leña',
  },
  'pizzeria napolitaine / feu de bois': {
    it: 'Pizzeria Napoletana al Forno a Legna',
    en: 'Neapolitan Wood-Fired Pizzeria',
    es: 'Pizzería Napolitana al Horno de Leña',
  },
  'pizzeria & grillades au feu de bois': {
    it: 'Pizzeria & Grigliate al Forno a Legna',
    en: 'Wood-Fired Pizza & Grills',
    es: 'Pizzería y Parrilladas al Horno de Leña',
  },
  'poissons & fruits de mer': {
    it: 'Pesce Fresco & Frutti di Mare',
    en: 'Fresh Seafood & Fish',
    es: 'Pescados y Mariscos Frescos',
  },
  'japonaise & ramen': {
    it: 'Giapponese & Ramen Bar',
    en: 'Japanese & Ramen Bar',
    es: 'Japonesa y Ramen Bar',
  },
  'japonaise & ramen bar': {
    it: 'Giapponese & Ramen Bar',
    en: 'Japanese & Ramen Bar',
    es: 'Japonesa y Ramen Bar',
  },
  'japonaise & sushis / ramen': {
    it: 'Giapponese, Sushi & Ramen',
    en: 'Japanese, Sushi & Ramen',
    es: 'Japonesa, Sushi y Ramen',
  },
  'japonaise & healthy bowls': {
    it: 'Giapponese & Healthy Bowls',
    en: 'Japanese & Healthy Bowls',
    es: 'Japonesa y Bowls Saludables',
  },
  'burgers du terroir': {
    it: 'Burger Gourmet del Territorio',
    en: 'Gourmet Artisan Burgers',
    es: 'Hamburguesas Gourmet Artesanales',
  },
  'crêperie & terroir': {
    it: 'Crêperie Tradizionale & Terroir',
    en: 'Traditional Crêperie & Local Flavors',
    es: 'Crepería Tradicional y Terruño',
  },
  'grillades & brasero halal': {
    it: 'Grigliate & Brace Halal',
    en: 'Halal Wood-Fired BBQ & Grills',
    es: 'Carnes a la Brasa Halal',
  },
  'grillades halal & braises': {
    it: 'Grigliate Halal & Braci',
    en: 'Halal Grills & Charcoal BBQ',
    es: 'Parrilladas Halal y Brasas',
  },
  'cuisine provençale & terroir': {
    it: 'Cucina Provenzale & Tradizione',
    en: 'Provençal Cuisine & Local Tradition',
    es: 'Cocina Provenzal y Terruño',
  },
  'provençale & terroir': {
    it: 'Cucina Provenzale & Terroir',
    en: 'Provençal & Local Heritage',
    es: 'Provenzal y Terruño',
  },
  'bistrot provençal': {
    it: 'Bistrot Provenzale Tradizionale',
    en: 'Traditional Provençal Bistro',
    es: 'Bistró Provenzal Tradicional',
  },
  'bistronomique provençale': {
    it: 'Bistronomia Provenzale',
    en: 'Provençal French Bistronomy',
    es: 'Bistronomía Provenzal',
  },
  'cuisine française & bistronomique': {
    it: 'Cucina Francese & Bistronomica',
    en: 'French Bistronomy & Fine Dining',
    es: 'Cocina Francesa y Bistronómica',
  },
  'bistrot de terroir & bar à vins': {
    it: 'Bistrot di Territorio & Wine Bar',
    en: 'Local Terroir Bistro & Wine Bar',
    es: 'Bistró de Terruño y Bar de Vinos',
  },
  'street food thaïlandaise & wok': {
    it: 'Street Food Thailandese & Wok',
    en: 'Thai Street Food & Wok',
    es: 'Street Food Tailandés y Wok',
  },
  'italienne contemporaine': {
    it: 'Cucina Italiana Contemporanea',
    en: 'Contemporary Italian Dining',
    es: 'Cocina Italiana Contemporánea',
  },
  'trattoria & épicerie italienne': {
    it: 'Trattoria & Bottega Gastronomica',
    en: 'Italian Trattoria & Delicatessen',
    es: 'Trattoria y Tienda Italiana',
  },
  'méditerranéenne & traditionnelle': {
    it: 'Mediterranea & Tradizionale',
    en: 'Mediterranean & Traditional',
    es: 'Mediterránea y Tradicional',
  },
};

const TAGS_DICTIONARY: Record<string, { it: string; en: string; es: string }> = {
  'spécialité': { it: 'Specialità', en: 'Specialty', es: 'Especialidad' },
  'specialite': { it: 'Specialità', en: 'Specialty', es: 'Especialidad' },
  'spécialité maison': { it: 'Specialità della Casa', en: 'House Specialty', es: 'Especialidad de la Casa' },
  'spécialité locale': { it: 'Specialità Locale', en: 'Local Specialty', es: 'Especialidad Local' },
  'four à bois': { it: 'Forno a Legna', en: 'Wood-Fired', es: 'Horno de Leña' },
  'bestseller': { it: 'Più Venduto', en: 'Bestseller', es: 'Más Vendido' },
  'coup de cœur': { it: 'Scelta dello Chef', en: "Chef's Pick", es: 'Favorito del Chef' },
  'coup de coeur': { it: 'Scelta dello Chef', en: "Chef's Pick", es: 'Favorito del Chef' },
  'plat du moment': { it: 'Piatto del Momento', en: 'Dish of the Moment', es: 'Plato del Momento' },
  'halal': { it: 'Halal', en: 'Halal', es: 'Halal' },
  '100% halal': { it: '100% Halal', en: '100% Halal', es: '100% Halal' },
  'végétarien': { it: 'Vegetariano', en: 'Vegetarian', es: 'Vegetariano' },
  'végétalien': { it: 'Vegano', en: 'Vegan', es: 'Vegano' },
  'vegan': { it: 'Vegano', en: 'Vegan', es: 'Vegano' },
  'high protein': { it: 'Alto Contenuto Proteico', en: 'High Protein', es: 'Alto en Proteínas' },
  'faible en glucides': { it: 'Bassi Carboidrati', en: 'Low Carb', es: 'Bajo en Carbohidratos' },
  'faible en lipides': { it: 'Pochi Grassi', en: 'Low Fat', es: 'Bajo en Grasas' },
  'terroir de provence': { it: 'Tradizione Provenzale', en: 'Provençal Heritage', es: 'Tradición Provenzal' },
  '100% terroir': { it: '100% Territorio', en: '100% Local Heritage', es: '100% Terruño' },
  'à partager': { it: 'Da Condividere', en: 'To Share', es: 'Para Compartir' },
};

/**
 * Translates restaurant cuisine and specialties authentically
 */
export function getAutoCuisineName(cuisine: string | undefined | null, lang: Language): string {
  if (!cuisine) return '';
  if (lang === 'fr') return cuisine;
  const key = cuisine.trim().toLowerCase();
  if (CUISINE_DICTIONARY[key]) {
    return CUISINE_DICTIONARY[key][lang === 'it' ? 'it' : lang === 'es' ? 'es' : 'en'] || cuisine;
  }
  // Try partial word replacements
  return translateDescriptionLocally(cuisine, lang === 'it' ? 'it' : lang === 'es' ? 'es' : 'en');
}

/**
 * Translates culinary tags (e.g. Four à Bois, Halal, Bestseller)
 */
export function getAutoTagLabel(tag: string | undefined | null, lang: Language): string {
  if (!tag) return '';
  if (lang === 'fr') return tag;
  const key = tag.trim().toLowerCase();
  if (TAGS_DICTIONARY[key]) {
    return TAGS_DICTIONARY[key][lang === 'it' ? 'it' : lang === 'es' ? 'es' : 'en'] || tag;
  }
  return translateDescriptionLocally(tag, lang === 'it' ? 'it' : lang === 'es' ? 'es' : 'en');
}

