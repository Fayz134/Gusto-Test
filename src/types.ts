export type Language = 'fr' | 'it' | 'en' | 'es';

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
  name_es?: string;
  price: number;
  portion: string;
  region?: string;
  winePairing?: string;
  description: string;
  description_es?: string;
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
  name_es?: string;
  iconName: string;
}

export interface OpeningHours {
  isOpenNow: boolean;
  days: string;
  lunch: string;
  dinner: string;
}

export interface RestaurantCustomization {
  themePreset?: 'rubis' | 'olive' | 'slate' | 'terracotta' | 'riviera' | 'cuivre' | 'custom';
  primaryColor?: string; // Hex color for buttons, badges, highlights
  accentColor?: string; // Hex color for borders, text accents
  bannerUrl?: string;
  bannerHeight?: 'compact' | 'medium' | 'tall';
  showBannerHero?: boolean;
  announcement?: string;
  showAnnouncement?: boolean;
  announcementEmoji?: string;
  logoType?: 'monogram' | 'image';
  logoUrl?: string;
  logoBgColor?: string;
  logoTextColor?: string;
  fontStyle?: 'serif' | 'sans' | 'playfair';
  showHalalBadge?: boolean;
  showPhoneBadge?: boolean;
  showAddressBadge?: boolean;
  showHoursBadge?: boolean;
  welcomeMessage?: string;
  cardStyle?: 'rounded' | 'sharp' | 'glass';
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
  dishOfTheMomentId?: string;
  dishOfTheMomentEnabled?: boolean;
  customization?: RestaurantCustomization;
  isWebVerified?: boolean;
  verifiedSources?: { title: string; uri: string }[];
}

export interface AllergenItem {
  id: string;
  icon: string;
  name: string;
  name_it: string;
  name_en: string;
  name_es?: string;
}

export type RegistrationStatus = 'en_attente' | 'valide' | 'refuse';

export interface RestaurantRegistration {
  id: string;
  restaurantName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  cuisine: string;
  priceRange: string;
  description: string;
  submittedAt: string;
  status: RegistrationStatus;
  notes?: string;
  isHalalCertified?: boolean;
  website?: string;
  openingHoursPreview?: string;
  sampleDishes?: string;
  draftRestaurant?: Restaurant;
}
