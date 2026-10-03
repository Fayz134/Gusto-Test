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

export interface RestaurantSocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  website?: string;
  uberEats?: string;
  deliveroo?: string;
  googleMaps?: string;
  customLabel?: string;
  customUrl?: string;
}

export interface RestaurantExternalLinks {
  website?: string;
  uberEats?: string;
  deliveroo?: string;
  googleMaps?: string;
  customLabel?: string;
  customUrl?: string;
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
  socialLinks?: RestaurantSocialLinks;
  externalLinks?: RestaurantExternalLinks;
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
  socialLinks?: RestaurantSocialLinks;
  externalLinks?: RestaurantExternalLinks;
  isWebVerified?: boolean;
  verifiedSources?: { title: string; uri: string }[];
  isNew?: boolean;
  createdAt?: string;
  rating?: number;
  reviewsCount?: number;
  isGustoRecommended?: boolean;
  reviews?: RestaurantReview[];
  amenities?: ('terrasse' | 'parking' | 'climatisation' | 'chiens' | 'pmr' | string)[];
}

export interface DietaryProfile {
  allergens: string[];
  isHalal: boolean;
  isVegan: boolean;
  amenities: string[];
  maxKcal?: number;
  savedAt?: string;
}

export type AmenityType = 'terrasse' | 'parking' | 'climatisation' | 'chiens' | 'pmr';

export interface AmenityDefinition {
  id: AmenityType;
  label: string;
  emoji: string;
  shortLabel: string;
  description: string;
}

export const AMENITIES_MASTER_LIST: AmenityDefinition[] = [
  {
    id: 'terrasse',
    label: 'Terrasse ombragée',
    shortLabel: 'Terrasse',
    emoji: '🌿',
    description: 'Espace extérieur ombragé avec brumisateurs ou verdure provençale',
  },
  {
    id: 'parking',
    label: 'Parking gratuit',
    shortLabel: 'Parking',
    emoji: '🅿️',
    description: 'Places de stationnement gratuites réservées ou à proximité immédiate',
  },
  {
    id: 'climatisation',
    label: 'Climatisation',
    shortLabel: 'Clim',
    emoji: '❄️',
    description: 'Salle rafraîchie idéale pour les journées chaudes en Provence',
  },
  {
    id: 'chiens',
    label: 'Chiens bienvenus',
    shortLabel: 'Chiens OK',
    emoji: '🐾',
    description: 'Animaux de compagnie acceptés avec gamelle d\'eau mise à disposition',
  },
  {
    id: 'pmr',
    label: 'Accès PMR',
    shortLabel: 'Accès PMR',
    emoji: '♿',
    description: 'Accès plain-pied, rampe et sanitaires aux normes PMR',
  },
];

export interface RestaurantReviewCriteria {
  foodQuality: number; // 1-5 étoiles
  ambiance: number; // 1-5 étoiles
  dietaryCompliance: number; // 1-5 étoiles (Respect des régimes & allergènes)
}

export interface RestaurantReview {
  id: string;
  restaurantId: string;
  authorName: string;
  authorTag?: string; // ex: "Gourmet vérifié", "Sans Gluten", "Végétarien", "Habitué"
  rating: number; // Note globale sur 5
  criteria: RestaurantReviewCriteria;
  comment: string;
  date: string;
  isGustoRecommended?: boolean;
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

export type MealCourseType = 'starter' | 'main' | 'dessert' | 'drink' | 'extra';

export interface ComposedMealItem {
  dish: Dish;
  course: MealCourseType;
  quantity: number;
}

export type MealTargetGoal = 'balanced' | 'high-protein' | 'light' | 'custom';
