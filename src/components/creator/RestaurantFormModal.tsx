import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Building2,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  Camera,
  Check,
  ShieldCheck,
  Save,
  UtensilsCrossed,
  FileEdit,
} from 'lucide-react';
import { Restaurant, MenuCategory, Dish } from '../../types';
import { processImageFile } from '../../utils/imageUpload';

interface RestaurantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRestaurant?: Restaurant | null; // If provided -> EDIT MODE, otherwise -> ADD MODE
  onSaveRestaurant: (restaurant: Restaurant, isEdit: boolean) => void;
  onEditMenu?: (restaurantId: string) => void;
  onShowToast: (message: string) => void;
}

const PRESET_BANNERS = [
  {
    name: 'Pizzeria & Four à Bois',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Trattoria Étoilée',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Terrasse Italienne Chic',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Cave à Vins & Antipasti',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Bistrot Méditerranéen',
    url: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Rôtisserie & Grillades',
    url: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200&q=80',
  },
];

const PRESET_CITIES = [
  { name: 'Aubagne', lat: 43.2925, lng: 5.5708 },
  { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
  { name: 'Aix-en-Provence', lat: 43.5297, lng: 5.4474 },
  { name: 'Cassis', lat: 43.2144, lng: 5.5392 },
  { name: 'La Ciotat', lat: 43.1748, lng: 5.6045 },
  { name: 'Toulon', lat: 43.1242, lng: 5.928 },
  { name: 'Nice', lat: 43.7102, lng: 7.262 },
];

/**
 * Automatically determine coordinates based on city name or address
 * without asking the user to manually enter GPS latitude/longitude.
 */
function resolveCoordsAutomatically(
  address: string,
  existingCoords?: { lat: number; lng: number }
): { lat: number; lng: number } {
  if (existingCoords && existingCoords.lat && existingCoords.lng) {
    return existingCoords;
  }
  const clean = address.toLowerCase();
  for (const c of PRESET_CITIES) {
    if (clean.includes(c.name.toLowerCase())) {
      return { lat: c.lat, lng: c.lng };
    }
  }
  return { lat: 43.2925, lng: 5.5708 };
}

export const RestaurantFormModal: React.FC<RestaurantFormModalProps> = ({
  isOpen,
  onClose,
  initialRestaurant,
  onSaveRestaurant,
  onEditMenu,
  onShowToast,
}) => {
  const isEdit = Boolean(initialRestaurant);

  // Form states
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [cuisine, setCuisine] = useState('Pizzeria & Cuisine Italienne');
  const [priceRange, setPriceRange] = useState('€€ (15-30€)');
  const [phone, setPhone] = useState('04 42 00 11 22');
  const [address, setAddress] = useState('12 Avenue de la République, 13400 Aubagne');
  const [banner, setBanner] = useState(PRESET_BANNERS[0].url);
  const [customBannerUrl, setCustomBannerUrl] = useState('');
  const [isHalalCertified, setIsHalalCertified] = useState(false);
  const [days, setDays] = useState('Mardi - Dimanche');
  const [lunch, setLunch] = useState('12h00 - 14h30');
  const [dinner, setDinner] = useState('19h00 - 23h00');
  const [isOpenNow, setIsOpenNow] = useState(true);
  const [starterTemplate, setStarterTemplate] = useState<'pizzeria' | 'trattoria' | 'blank'>('pizzeria');
  const [isUploading, setIsUploading] = useState(false);

  // Populate form if in edit mode
  useEffect(() => {
    if (initialRestaurant) {
      setName(initialRestaurant.name || '');
      setTagline(initialRestaurant.tagline || '');
      setCuisine(initialRestaurant.cuisine || '');
      setPriceRange(initialRestaurant.priceRange || '€€ (15-30€)');
      setPhone(initialRestaurant.phone || '');
      setAddress(initialRestaurant.address || '');
      setBanner(initialRestaurant.banner || PRESET_BANNERS[0].url);
      setCustomBannerUrl('');
      setIsHalalCertified(Boolean(initialRestaurant.isHalalCertified));
      setDays(initialRestaurant.openingHours?.days || 'Mardi - Dimanche');
      setLunch(initialRestaurant.openingHours?.lunch || '12h00 - 14h30');
      setDinner(initialRestaurant.openingHours?.dinner || '19h00 - 23h00');
      setIsOpenNow(initialRestaurant.openingHours?.isOpenNow ?? true);
    } else {
      // Reset for add mode
      setName('');
      setTagline('');
      setCuisine('Pizzeria & Cuisine Italienne');
      setPriceRange('€€ (15-30€)');
      setPhone('04 42 00 11 22');
      setAddress('12 Avenue de la République, 13400 Aubagne');
      setBanner(PRESET_BANNERS[0].url);
      setCustomBannerUrl('');
      setIsHalalCertified(false);
      setDays('Mardi - Dimanche');
      setLunch('12h00 - 14h30');
      setDinner('19h00 - 23h00');
      setIsOpenNow(true);
      setStarterTemplate('pizzeria');
    }
  }, [initialRestaurant, isOpen]);

  if (!isOpen) return null;

  const handleApplyCityPreset = (city: { name: string; lat: number; lng: number }) => {
    if (address.includes(city.name)) return;
    setAddress(`10 Place Centrale, ${city.name}`);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const optimizedUrl = await processImageFile(file);
      setBanner(optimizedUrl);
      setCustomBannerUrl('');
      onShowToast('Bannière du restaurant mise à jour ! 📸');
    } catch {
      onShowToast('Erreur lors du traitement de l’image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('Veuillez indiquer le nom de l’établissement');
      return;
    }

    if (isEdit && initialRestaurant) {
      // Automatically keep or resolve coordinates
      const finalCoords = resolveCoordsAutomatically(address, initialRestaurant.coords);

      const updatedRestaurant: Restaurant = {
        ...initialRestaurant,
        name: name.trim(),
        tagline: tagline.trim() || 'Restaurant Gastronomique & Convivial',
        cuisine: cuisine.trim(),
        priceRange,
        address: address.trim(),
        phone: phone.trim(),
        banner: customBannerUrl.trim() || banner,
        coords: finalCoords,
        isHalalCertified,
        openingHours: {
          isOpenNow,
          days: days.trim() || 'Mardi - Dimanche',
          lunch: lunch.trim() || '12h00 - 14h30',
          dinner: dinner.trim() || '19h00 - 23h00',
        },
      };

      onSaveRestaurant(updatedRestaurant, true);
      onShowToast(`L'établissement « ${updatedRestaurant.name} » a été mis à jour ! ✨`);
      onClose();
      return;
    }

    // ADD MODE
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const restaurantId = `${slug || 'restaurant'}-${Date.now().toString().slice(-4)}`;
    const finalCoords = resolveCoordsAutomatically(address);

    let categories: MenuCategory[] = [];
    let dishes: Dish[] = [];

    if (starterTemplate === 'pizzeria') {
      categories = [
        { id: 'all', name: 'Toute la carte', name_fr: 'Toute la carte', name_it: 'Tutto il Menu', name_en: 'Full Menu', iconName: 'utensils' },
        { id: 'pizzas', name: 'Pizzas au Four à Bois', name_fr: 'Pizzas au Four à Bois', name_it: 'Pizze Tradizionali', name_en: 'Wood-Fired Pizzas', iconName: 'flame' },
        { id: 'boissons', name: 'Boissons & Bières', name_fr: 'Boissons & Bières', name_it: 'Bevande', name_en: 'Drinks & Beers', iconName: 'wine' },
        { id: 'desserts', name: 'Desserts Maison', name_fr: 'Desserts Maison', name_it: 'Dolci', name_en: 'Desserts', iconName: 'cake' },
      ];

      dishes = [
        {
          id: `${restaurantId}_d1`,
          categoryId: 'pizzas',
          name: 'Pizza Margherita Verace',
          name_fr: 'Pizza Margherita Verace Napolitaine',
          name_it: 'Pizza Margherita Verace Napoletana',
          name_en: 'Authentic Neapolitan Margherita Pizza',
          price: 13.0,
          portion: '380g',
          region: 'Campania',
          description: 'Sauce tomate San Marzano DOP, mozzarella fior di latte, basilic frais et huile d\'olive extra vierge.',
          image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
          tags: ['Spécialité', 'Four à Bois'],
          nutrition: { kcal: 780, protein: 32, carbs: 98, fat: 28, fiber: 5 },
          allergens: ['gluten', 'lactose'],
        },
        {
          id: `${restaurantId}_d2`,
          categoryId: 'pizzas',
          name: 'Pizza Regina Tradizionale',
          name_fr: 'Pizza Regina Jambon Blanc & Champignons Frais',
          name_it: 'Pizza Regina con Prosciutto Cotto e Funghi',
          name_en: 'Regina Ham & Fresh Mushrooms Pizza',
          price: 15.0,
          portion: '410g',
          description: 'Sauce tomate mijotée, mozzarella fondante, jambon blanc cuit au torchon, champignons de Paris frais.',
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
          tags: ['Classique', 'Populaire'],
          nutrition: { kcal: 860, protein: 39, carbs: 102, fat: 32, fiber: 6 },
          allergens: ['gluten', 'lactose'],
        },
        {
          id: `${restaurantId}_d3`,
          categoryId: 'desserts',
          name: 'Tiramisù au Mascarpone',
          name_fr: 'Tiramisù Fait Maison au Mascarpone & Café Illy',
          name_it: 'Tiramisù Tradizionale al Mascarpone',
          name_en: 'Traditional Mascarpone Tiramisu',
          price: 7.5,
          portion: '160g',
          description: 'Biscuits savoiardi imbibés de café espresso italien, crème aérienne de mascarpone et cacao amer Valrhona.',
          image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
          tags: ['Fait Maison', 'Incontournable'],
          nutrition: { kcal: 390, protein: 7, carbs: 42, fat: 22, fiber: 2 },
          allergens: ['lactose', 'oeufs', 'gluten'],
        },
      ];
    } else if (starterTemplate === 'trattoria') {
      categories = [
        { id: 'all', name: 'Toute la carte', name_fr: 'Toute la carte', name_it: 'Tutto il Menu', name_en: 'Full Menu', iconName: 'utensils' },
        { id: 'antipasti', name: 'Antipasti & Entrées', name_fr: 'Antipasti & Entrées', name_it: 'Antipasti della Casa', name_en: 'Starters', iconName: 'sparkles' },
        { id: 'primi', name: 'Pâtes Fraîches', name_fr: 'Pâtes Fraîches & Risottos', name_it: 'Primi Piatti', name_en: 'Pasta & Risotto', iconName: 'wheat' },
        { id: 'dolci', name: 'Desserts', name_fr: 'Desserts & Douceurs', name_it: 'Dolci', name_en: 'Desserts', iconName: 'cake' },
      ];

      dishes = [
        {
          id: `${restaurantId}_d1`,
          categoryId: 'antipasti',
          name: 'Burrata Crémeuse & Tomates Datterini',
          name_fr: 'Burrata Crémeuse des Pouilles & Tomates Datterini',
          name_it: 'Burrata Pugliese con Pomodorini',
          name_en: 'Creamy Burrata with Cherry Tomatoes',
          price: 15.5,
          portion: '240g',
          description: 'Burrata fraîche 200g, tomates cerises confites au four, réduction balsamique de Modène et basilic.',
          image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb228cc?auto=format&fit=crop&w=800&q=80',
          tags: ['Spécialité'],
          nutrition: { kcal: 460, protein: 24, carbs: 14, fat: 34, fiber: 2 },
          allergens: ['lactose'],
        },
        {
          id: `${restaurantId}_d2`,
          categoryId: 'primi',
          name: 'Tagliatelles à la Truffe Noire',
          name_fr: 'Tagliatelles Fraîches à la Crème de Truffe Noire',
          name_it: 'Tagliatelle al Tartufo Nero',
          name_en: 'Fresh Tagliatelle with Black Truffle Cream',
          price: 21.0,
          portion: '320g',
          description: 'Pâtes fraîches maison, émulsion de beurre fermier, brisures de truffe noire d\'été et parmesan reggiano.',
          image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80',
          tags: ['Prestige', 'Signature'],
          nutrition: { kcal: 620, protein: 19, carbs: 74, fat: 28, fiber: 4 },
          allergens: ['gluten', 'lactose', 'oeufs'],
        },
      ];
    } else {
      categories = [
        { id: 'all', name: 'Toute la carte', name_fr: 'Toute la carte', name_it: 'Tutto il Menu', name_en: 'Full Menu', iconName: 'utensils' },
        { id: 'plats', name: 'Plats Principaux', name_fr: 'Plats Principaux', name_it: 'Piatti Principali', name_en: 'Main Courses', iconName: 'utensils' },
      ];
    }

    const newRestaurant: Restaurant = {
      id: restaurantId,
      name: name.trim(),
      tagline: tagline.trim() || 'Restaurant Gastronomique & Convivial',
      cuisine: cuisine.trim(),
      priceRange,
      address: address.trim(),
      phone: phone.trim(),
      banner: customBannerUrl.trim() || banner,
      coords: finalCoords,
      avgKcal: 620,
      isHalalCertified,
      openingHours: {
        isOpenNow,
        days: days.trim() || 'Mardi - Dimanche',
        lunch: lunch.trim() || '12h00 - 14h30',
        dinner: dinner.trim() || '19h00 - 23h00',
      },
      categories,
      dishes,
    };

    onSaveRestaurant(newRestaurant, false);
    onShowToast(`L'établissement « ${newRestaurant.name} » a été ajouté avec succès ! 🎉`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 to-stone-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#99281a] to-amber-600 flex items-center justify-center shadow-md">
              {isEdit ? <FileEdit className="w-5 h-5 text-white" /> : <Building2 className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="font-serif font-black text-lg sm:text-xl text-white">
                {isEdit ? `Modifier : ${initialRestaurant?.name}` : 'Ajouter un Nouvel Établissement'}
              </h3>
              <p className="text-xs text-stone-300">
                {isEdit
                  ? 'Mettez à jour les informations et coordonnées de la page restaurant'
                  : 'Enregistrement d’un nouvel établissement sur le portail Gusto'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit mode quick callout for editing dishes */}
        {isEdit && initialRestaurant && onEditMenu && (
          <div className="bg-amber-50 border-b border-amber-200/80 px-5 py-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <UtensilsCrossed className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Carte actuelle :</strong> {initialRestaurant.dishes?.length || 0} plats et {initialRestaurant.categories?.length || 0} catégories.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditMenu(initialRestaurant.id);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer shrink-0 flex items-center gap-1 active:scale-95"
            >
              <span>Éditer la carte des plats</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. General Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 border-b border-stone-200 pb-1">
              1. Informations Générales
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nom du restaurant *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Ristorante Da Marco"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="ex: Spécialités napolitaines au feu de bois"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Type de Cuisine
                </label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="ex: Italienne, Pizzeria Napolitaine"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Fourchette de Prix
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none cursor-pointer"
                >
                  <option value="€ (Moins de 15€)">€ (Économique / Moins de 15€)</option>
                  <option value="€€ (15-30€)">€€ (Modéré / 15-30€)</option>
                  <option value="€€€ (30-60€)">€€€ (Gastronomique / 30-60€)</option>
                  <option value="€€€€ (+60€)">€€€€ (Haute Gastronomie / +60€)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Téléphone de Réservation
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="04 42 00 11 22"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none"
                />
              </div>

              {/* Halal Certification checkbox */}
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="halalCert"
                  checked={isHalalCertified}
                  onChange={(e) => setIsHalalCertified(e.target.checked)}
                  className="w-4 h-4 rounded text-[#99281a] focus:ring-[#99281a] cursor-pointer"
                />
                <label htmlFor="halalCert" className="text-xs font-bold text-stone-800 cursor-pointer flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Établissement certifié 100% Halal</span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. Location (GPS Coordinates Removed - Automatic Background Resolution) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-400">
                2. Adresse & Localisation
              </h4>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                ✓ Géolocalisation automatique
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Adresse physique complète *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ex: 12 Rue de la République, 13400 Aubagne"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none font-medium"
              />
            </div>

            {/* Quick city badges to auto-fill city name */}
            <div>
              <span className="text-[11px] font-bold text-stone-500 mb-1 block">
                Sélection rapide de ville :
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_CITIES.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleApplyCityPreset(c)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold transition cursor-pointer border border-stone-200 hover:border-stone-300"
                  >
                    📍 {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Opening Hours & Live Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 border-b border-stone-200 pb-1">
              3. Horaires & État du Service
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Jours d'ouverture
                </label>
                <input
                  type="text"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="Mardi - Dimanche"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Service Midi
                </label>
                <input
                  type="text"
                  value={lunch}
                  onChange={(e) => setLunch(e.target.value)}
                  placeholder="12h00 - 14h30"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Service Soir
                </label>
                <input
                  type="text"
                  value={dinner}
                  onChange={(e) => setDinner(e.target.value)}
                  placeholder="19h00 - 23h00"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isOpenNowCheck"
                checked={isOpenNow}
                onChange={(e) => setIsOpenNow(e.target.checked)}
                className="w-4 h-4 rounded text-[#99281a] focus:ring-[#99281a] cursor-pointer"
              />
              <label htmlFor="isOpenNowCheck" className="text-xs font-bold text-stone-800 cursor-pointer">
                Indiquer comme <span className="text-emerald-700 font-black">« Ouvert actuellement »</span> sur le portail
              </label>
            </div>
          </div>

          {/* 4. Banner Image */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 border-b border-stone-200 pb-1">
              4. Image de Bannière du Restaurant
            </h4>

            {/* Banner preview */}
            <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-stone-200 shadow-2xs group">
              <img
                src={customBannerUrl || banner}
                alt="Bannière preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-xl">
                  Aperçu de la bannière
                </span>
              </div>
            </div>

            {/* Preset banners gallery */}
            <div>
              <span className="text-[11px] font-bold text-stone-600 mb-1.5 block">
                Sélectionner parmi les modèles gastronomiques :
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_BANNERS.map((preset) => {
                  const isSelected = banner === preset.url && !customBannerUrl;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setBanner(preset.url);
                        setCustomBannerUrl('');
                      }}
                      className={`relative h-14 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                        isSelected ? 'border-[#99281a] shadow-xs scale-102' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#99281a]/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File upload or custom URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-stone-300 hover:border-[#99281a] hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer transition">
                <Camera className="w-4 h-4 text-[#99281a]" />
                <span>{isUploading ? 'Chargement...' : 'Téléverser une photo (Appareil)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              <input
                type="url"
                value={customBannerUrl}
                onChange={(e) => setCustomBannerUrl(e.target.value)}
                placeholder="Ou coller une URL d'image..."
                className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Starter Template (Only when creating a new restaurant) */}
          {!isEdit && (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 border-b border-stone-200 pb-1">
                5. Carte & Menu de Départ
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label
                  className={`p-3 rounded-2xl border-2 flex flex-col gap-1 cursor-pointer transition ${
                    starterTemplate === 'pizzeria'
                      ? 'border-[#99281a] bg-rose-50/50'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">Pizzeria au Feu de Bois</span>
                    <input
                      type="radio"
                      name="starter"
                      checked={starterTemplate === 'pizzeria'}
                      onChange={() => setStarterTemplate('pizzeria')}
                      className="text-[#99281a]"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500">
                    Prépare 4 catégories et 3 pizzas stars avec macros & allergènes.
                  </span>
                </label>

                <label
                  className={`p-3 rounded-2xl border-2 flex flex-col gap-1 cursor-pointer transition ${
                    starterTemplate === 'trattoria'
                      ? 'border-[#99281a] bg-rose-50/50'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">Trattoria & Pâtes Fraîches</span>
                    <input
                      type="radio"
                      name="starter"
                      checked={starterTemplate === 'trattoria'}
                      onChange={() => setStarterTemplate('trattoria')}
                      className="text-[#99281a]"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500">
                    Prépare antipasti, tagliatelles fraîches et burrata des Pouilles.
                  </span>
                </label>

                <label
                  className={`p-3 rounded-2xl border-2 flex flex-col gap-1 cursor-pointer transition ${
                    starterTemplate === 'blank'
                      ? 'border-[#99281a] bg-rose-50/50'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">Carte Vierge</span>
                    <input
                      type="radio"
                      name="starter"
                      checked={starterTemplate === 'blank'}
                      onChange={() => setStarterTemplate('blank')}
                      className="text-[#99281a]"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500">
                    Structure vide. Les plats seront ajoutés manuellement.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#99281a] hover:bg-[#781524] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer active:scale-95"
            >
              {isEdit ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isEdit ? 'Enregistrer les Modifications' : 'Créer & Déployer l’Établissement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
