export type Language = 'fr' | 'it' | 'en';

export type ViewMode = 'cards' | 'classic';

export type MacroFilterType =
  | 'all'
  | 'high-protein'
  | 'low-cal'
  | 'low-carb'
  | 'low-fat'
  | 'high-cal'
  | 'veg'
  | 'halal';

export interface NutritionInfo {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface Dish {
  id: string;
  categoryId: string;
  name: string;
  name_fr: string;
  name_it?: string;
  name_en?: string;
  price: number;
  portion: string;
  region?: string;
  winePairing?: string;
  description: string;
  longDescription?: string;
  image: string;
  tags: string[];
  nutrition: NutritionInfo;
  allergens: string[];
  isHalal?: boolean;
  isVegan?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  name_fr: string;
  name_it?: string;
  name_en?: string;
  iconName: string;
}

export interface OpeningHours {
  isOpenNow: boolean;
  days: string;
  lunch: string;
  dinner: string;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  cuisine: string;
  priceRange: string;
  address: string;
  phone: string;
  banner: string;
  coords: {
    lat: number;
    lng: number;
  };
  distance?: number;
  avgKcal: number;
  openingHours: OpeningHours;
  categories: MenuCategory[];
  dishes: Dish[];
  isHalalCertified?: boolean;
}

export interface AllergenItem {
  id: string;
  icon: string;
  name: string;
  name_it: string;
  name_en: string;
}
