import React, { useState, useMemo, useEffect } from 'react';
import { Restaurant, RestaurantRegistration, Language, MacroFilterType, Dish, MenuCategory } from './types';
import { INITIAL_RESTAURANTS_DATA } from './data/restaurants';
import { INITIAL_REGISTRATIONS_DATA } from './data/registrations';
import { I18N_DICT } from './data/i18n';
import { calcDistanceKm, getCityNameFromCoords } from './utils/geo';
import { PortalHeader } from './components/PortalHeader';
import { HeroSearch } from './components/HeroSearch';
import { RestaurantCard } from './components/RestaurantCard';
import { GlobalDishResults } from './components/GlobalDishResults';
import { RestaurantView } from './components/RestaurantView';
import { DishDetailModal } from './components/DishDetailModal';
import { AllergenFilterModal } from './components/AllergenFilterModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { RestaurantRegistrationModal } from './components/RestaurantRegistrationModal';
import { CreatorDashboardPage } from './components/creator/CreatorDashboardPage';
import { Toast } from './components/Toast';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { DietaryProfileModal } from './components/DietaryProfileModal';
import { ShareRestaurantModal } from './components/ShareRestaurantModal';
import { getSavedDietaryProfile } from './utils/dietaryProfile';
import { DietaryProfile } from './types';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { KeyRound, Crown, LogOut, Building2, Sparkles, LayoutGrid, Map } from 'lucide-react';
import {
  trackSiteVisit,
  trackRestaurantView,
  trackDishView,
} from './utils/analytics';
import { InteractiveRestaurantsMap } from './components/InteractiveRestaurantsMap';
import { getStoredReviews, calculateRestaurantReviewStats } from './data/reviews';

const STORAGE_KEY = 'gusto_restaurants_catalog_v4';
const REGISTRATIONS_STORAGE_KEY = 'gusto_restaurant_registrations_v2';

function enrichWithReviews(list: Restaurant[]): Restaurant[] {
  const allReviews = getStoredReviews();
  return list.map((resto) => {
    let coords = resto.coords;
    // Fix any legacy cached coordinates for Aubagne location
    if (resto.id === 'la-cave-a-pizza-aubagne' && (!coords || coords.lat > 43.31)) {
      coords = { lat: 43.2941, lng: 5.5719 };
    }
    const restoReviews = allReviews[resto.id] || [];
    const stats = calculateRestaurantReviewStats(restoReviews);
    return {
      ...resto,
      coords,
      rating: resto.rating || stats.averageRating,
      reviewsCount: resto.reviewsCount || stats.reviewsCount,
      isGustoRecommended:
        resto.isGustoRecommended !== undefined
          ? resto.isGustoRecommended
          : stats.isGustoRecommended,
      reviews: restoReviews,
    };
  });
}

export default function App() {
  // Navigation & Data State
  const [currentView, setCurrentView] = useState<'portal' | 'restaurant' | 'creator-dashboard'>('portal');
  const [portalDisplayMode, setPortalDisplayMode] = useState<'grid' | 'map'>('grid');
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    let baseList = INITIAL_RESTAURANTS_DATA;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Verify if Cave a pizza exists and has the full menu loaded
          const caveAPizza = parsed.find((r: Restaurant) => r.id === 'la-cave-a-pizza-aubagne');
          if (caveAPizza && caveAPizza.dishes && caveAPizza.dishes.length >= 35) {
            baseList = parsed.map((r: Restaurant) => ({
              ...r,
              dishOfTheMomentEnabled:
                r.dishOfTheMomentEnabled !== undefined ? r.dishOfTheMomentEnabled : true,
              dishOfTheMomentId:
                r.dishOfTheMomentId || r.dishes?.[0]?.id,
            }));
          }
        }
      }
    } catch (e) {
      console.warn('Could not read saved restaurants', e);
    }
    return enrichWithReviews(baseList);
  });
  const [activeRestaurantId, setActiveRestaurantId] = useState<string>('trattoria-bella-vista');

  // Track site visit on mount & listen to URL hash #creator or #dashboard
  useEffect(() => {
    trackSiteVisit();
    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h === '#creator' || h === '#superadmin' || h === '#dashboard') {
        setCurrentView('creator-dashboard');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Keep localStorage in sync whenever restaurants change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
    } catch (e) {
      console.warn('Could not save restaurants to localStorage', e);
    }
  }, [restaurants]);

  // Registrations (Candidatures des restaurants)
  const [registrations, setRegistrations] = useState<RestaurantRegistration[]>(() => {
    try {
      const saved = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved registrations', e);
    }
    return INITIAL_REGISTRATIONS_DATA;
  });

  // Keep registrations in sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(registrations));
    } catch (e) {
      console.warn('Could not save registrations to localStorage', e);
    }
  }, [registrations]);

  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  // Preferences & Filters (with saved dietary profile pre-application)
  const initialDietProfile = useMemo(() => getSavedDietaryProfile(), []);
  const [hasSavedProfile, setHasSavedProfile] = useState<boolean>(() => Boolean(initialDietProfile));
  const [isDietaryProfileModalOpen, setIsDietaryProfileModalOpen] = useState(false);
  const [sharingRestaurant, setSharingRestaurant] = useState<Restaurant | null>(null);

  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [searchHubQuery, setSearchHubQuery] = useState<string>('');
  const [activeMacroFilter, setActiveMacroFilter] = useState<MacroFilterType>('all');
  const [selectedAllergensFilter, setSelectedAllergensFilter] = useState<string[]>(
    () => initialDietProfile?.allergens || []
  );
  const [selectedDishRestaurant, setSelectedDishRestaurant] = useState<Restaurant | null>(null);
  const [selectedMapRestaurantId, setSelectedMapRestaurantId] = useState<string | null>(null);

  // Search options: Halal, Vegan and Open Now preferences
  const [isHalalOnly, setIsHalalOnly] = useState(() => Boolean(initialDietProfile?.isHalal));
  const [isVeganOnly, setIsVeganOnly] = useState(() => Boolean(initialDietProfile?.isVegan));
  const [isOpenOnly, setIsOpenOnly] = useState(false);

  // Gentle notification if saved dietary profile pre-applied on load
  useEffect(() => {
    if (
      initialDietProfile &&
      ((initialDietProfile.allergens && initialDietProfile.allergens.length > 0) ||
        initialDietProfile.isHalal ||
        initialDietProfile.isVegan)
    ) {
      const details: string[] = [];
      if (initialDietProfile.allergens?.length) {
        details.push(`${initialDietProfile.allergens.length} allergie(s)`);
      }
      if (initialDietProfile.isHalal) details.push('Halal');
      if (initialDietProfile.isVegan) details.push('Vegan');
      showToast(`Profil diététique sauvegardé appliqué : ${details.join(', ')} 🛡️`);
    }
  }, []);

  const handleProfileUpdated = (profile: DietaryProfile) => {
    setSelectedAllergensFilter(profile.allergens || []);
    setIsHalalOnly(Boolean(profile.isHalal));
    setIsVeganOnly(Boolean(profile.isVegan));
    setHasSavedProfile(
      Boolean(
        (profile.allergens && profile.allergens.length > 0) ||
          profile.isHalal ||
          profile.isVegan ||
          (profile.amenities && profile.amenities.length > 0)
      )
    );
  };

  // Geolocation
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
    active: boolean;
    label: string;
  }>({
    lat: 43.2925,
    lng: 5.5708,
    active: false,
    label: 'Aubagne',
  });

  // Modals
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isAllergenModalOpen, setIsAllergenModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const handleToggleHalal = () => {
    setIsHalalOnly((prev) => {
      const next = !prev;
      showToast(next ? 'Option 100% Halal sélectionnée 🥩' : 'Option Halal désactivée');
      return next;
    });
  };

  const handleToggleVegan = () => {
    setIsVeganOnly((prev) => {
      const next = !prev;
      showToast(next ? 'Option 100% Végétalien sélectionnée 🥑' : 'Option Végétalien désactivée');
      return next;
    });
  };

  const handleToggleOpenOnly = () => {
    setIsOpenOnly((prev) => {
      const next = !prev;
      showToast(
        next
          ? 'Filtre : Restaurants ouverts actuellement 🟢'
          : 'Filtre restaurants ouverts désactivé'
      );
      return next;
    });
  };

  // Admin auth with persistent storage
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gusto_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  // Toast
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
  };

  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  // Active Restaurant
  const activeRestaurant = useMemo(() => {
    return (
      restaurants.find((r) => r.id === activeRestaurantId) || restaurants[0]
    );
  }, [restaurants, activeRestaurantId]);

  // Pending candidatures counter for navbar badge
  const pendingRegistrationsCount = useMemo(() => {
    return registrations.filter((r) => r.status === 'en_attente').length;
  }, [registrations]);

  // Request Geolocation
  const handleRequestGeolocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      showToast('Recherche de votre ville...');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          // Determine city name from coordinates
          const cityName = await getCityNameFromCoords(lat, lng);

          setUserCoords({
            lat,
            lng,
            active: true,
            label: cityName,
          });

          // Recalculate distances
          setRestaurants((prev) =>
            prev
              .map((r) => ({
                ...r,
                distance: calcDistanceKm(lat, lng, r.coords.lat, r.coords.lng),
              }))
              .sort((a, b) => (a.distance || 0) - (b.distance || 0))
          );
          showToast(`Ville détectée : ${cityName} 📍`);
        },
        () => {
          // Fallback
          setUserCoords({
            lat: 43.2925,
            lng: 5.5708,
            active: true,
            label: 'Aubagne',
          });
          setRestaurants((prev) =>
            prev
              .map((r) => ({
                ...r,
                distance: calcDistanceKm(43.2925, 5.5708, r.coords.lat, r.coords.lng),
              }))
              .sort((a, b) => (a.distance || 0) - (b.distance || 0))
          );
          showToast('Ville : Aubagne (par défaut)');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      showToast('Géolocalisation non supportée par votre navigateur');
    }
  };

  // Filtered Restaurants for Portal Hub
  const filteredRestaurants = useMemo(() => {
    let list = restaurants;
    const q = searchHubQuery.toLowerCase().trim();

    // Text search filter
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          (q === 'halal' && r.isHalalCertified) ||
          r.dishes.some(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              (d.name_fr && d.name_fr.toLowerCase().includes(q)) ||
              (d.name_it && d.name_it.toLowerCase().includes(q)) ||
              (d.name_en && d.name_en.toLowerCase().includes(q)) ||
              d.description.toLowerCase().includes(q) ||
              d.tags.some((t) => t.toLowerCase().includes(q)) ||
              (q === 'halal' && d.isHalal)
          )
      );
    }

    // Halal filter option
    if (isHalalOnly) {
      list = list.filter(
        (r) =>
          r.isHalalCertified ||
          r.dishes.some(
            (d) =>
              d.isHalal === true ||
              d.tags.some((t) => t.toLowerCase() === 'halal')
          )
      );
    }

    // Vegan filter option
    if (isVeganOnly) {
      list = list.filter((r) =>
        r.dishes.some(
          (d) =>
            d.isVegan === true ||
            d.tags.some((t) => {
              const lower = t.toLowerCase();
              return lower === 'végétalien' || lower === 'vegan';
            })
        )
      );
    }

    // Allergen filtering: restaurant must have dishes safe from all selected allergens
    if (selectedAllergensFilter.length > 0) {
      list = list.filter((r) =>
        r.dishes.some(
          (d) => !d.allergens.some((alg) => selectedAllergensFilter.includes(alg))
        )
      );
    }

    // Macro filter: restaurant must have dishes matching the macro criteria (and allergen-free if allergens are selected)
    if (activeMacroFilter !== 'all') {
      list = list.filter((r) =>
        r.dishes.some((d) => {
          if (
            selectedAllergensFilter.length > 0 &&
            d.allergens.some((alg) => selectedAllergensFilter.includes(alg))
          ) {
            return false;
          }

          if (
            isHalalOnly &&
            !(
              d.isHalal === true ||
              r.isHalalCertified === true ||
              d.tags.some((t) => t.toLowerCase() === 'halal')
            )
          ) {
            return false;
          }

          if (
            isVeganOnly &&
            !(
              d.isVegan === true ||
              d.tags.some((t) => {
                const lower = t.toLowerCase();
                return lower === 'végétalien' || lower === 'vegan';
              })
            )
          ) {
            return false;
          }

          if (activeMacroFilter === 'high-protein') return d.nutrition.protein >= 25;
          if (activeMacroFilter === 'low-cal') return d.nutrition.kcal <= 500;
          if (activeMacroFilter === 'low-carb') return d.nutrition.carbs <= 20;
          if (activeMacroFilter === 'low-fat') return d.nutrition.fat <= 12;
          if (activeMacroFilter === 'high-cal') return d.nutrition.kcal >= 700;
          if (activeMacroFilter === 'veg') {
            return d.tags.some((t) => t.toLowerCase().includes('végétarien'));
          }
          if (activeMacroFilter === 'halal') {
            return (
              d.isHalal === true ||
              r.isHalalCertified === true ||
              d.tags.some((t) => t.toLowerCase() === 'halal')
            );
          }
          return true;
        })
      );
    }

    // Open now filter option: only show restaurants open right now
    if (isOpenOnly) {
      list = list.filter((r) => r.openingHours?.isOpenNow === true);
    }

    return list;
  }, [restaurants, searchHubQuery, activeMacroFilter, selectedAllergensFilter, isHalalOnly, isVeganOnly, isOpenOnly]);

  // 3 Latest added restaurants for the 'Nouveaux restaurants' spotlight section
  const latestRestaurants = useMemo(() => {
    return restaurants.slice(0, 3);
  }, [restaurants]);

  // Filtered latest restaurants (if search/diet filters are active)
  const filteredLatestRestaurants = useMemo(() => {
    const isFiltering =
      searchHubQuery.trim() !== '' ||
      activeMacroFilter !== 'all' ||
      selectedAllergensFilter.length > 0 ||
      isHalalOnly ||
      isVeganOnly ||
      isOpenOnly;

    if (!isFiltering) {
      return latestRestaurants;
    }
    // In filtering mode, only show latest restaurants that also match current search/filters
    return latestRestaurants.filter((r) =>
      filteredRestaurants.some((fr) => fr.id === r.id)
    );
  }, [
    latestRestaurants,
    filteredRestaurants,
    searchHubQuery,
    activeMacroFilter,
    selectedAllergensFilter,
    isHalalOnly,
    isVeganOnly,
    isOpenOnly,
  ]);

  // Global matching dishes (triggered if text query, macro filter, allergens, halal, vegan, or open-only are selected)
  const globalMatchingDishes = useMemo(() => {
    const q = searchHubQuery.toLowerCase().trim();
    const isFiltering =
      q !== '' ||
      activeMacroFilter !== 'all' ||
      selectedAllergensFilter.length > 0 ||
      isHalalOnly ||
      isVeganOnly ||
      isOpenOnly;
    if (!isFiltering) return [];

    const matches: { restaurantId: string; restaurantName: string; dish: Dish }[] = [];

    restaurants.forEach((resto) => {
      // Exclude closed restaurants if isOpenOnly is active
      if (isOpenOnly && resto.openingHours?.isOpenNow !== true) {
        return;
      }

      resto.dishes.forEach((dish) => {
        // Exclude if dish contains any selected allergen
        if (
          selectedAllergensFilter.length > 0 &&
          dish.allergens.some((alg) => selectedAllergensFilter.includes(alg))
        ) {
          return;
        }

        // Halal requirement
        if (isHalalOnly) {
          const isDishHalal =
            dish.isHalal === true ||
            resto.isHalalCertified === true ||
            dish.tags.some((t) => t.toLowerCase() === 'halal');
          if (!isDishHalal) return;
        }

        // Vegan requirement
        if (isVeganOnly) {
          const isDishVegan =
            dish.isVegan === true ||
            dish.tags.some((t) => {
              const lower = t.toLowerCase();
              return lower === 'végétalien' || lower === 'vegan';
            });
          if (!isDishVegan) return;
        }

        // Text query match
        if (q) {
          const matchText =
            dish.name.toLowerCase().includes(q) ||
            (dish.name_fr && dish.name_fr.toLowerCase().includes(q)) ||
            (dish.name_it && dish.name_it.toLowerCase().includes(q)) ||
            (dish.name_en && dish.name_en.toLowerCase().includes(q)) ||
            dish.description.toLowerCase().includes(q) ||
            dish.tags.some((t) => t.toLowerCase().includes(q)) ||
            (q === 'halal' && (dish.isHalal || resto.isHalalCertified)) ||
            resto.name.toLowerCase().includes(q);

          if (!matchText) return;
        }

        // Macro criteria match
        if (activeMacroFilter === 'high-protein' && dish.nutrition.protein < 25) return;
        if (activeMacroFilter === 'low-cal' && dish.nutrition.kcal > 500) return;
        if (activeMacroFilter === 'low-carb' && dish.nutrition.carbs > 20) return;
        if (activeMacroFilter === 'low-fat' && dish.nutrition.fat > 12) return;
        if (activeMacroFilter === 'high-cal' && dish.nutrition.kcal < 700) return;
        if (activeMacroFilter === 'veg' && !dish.tags.some((t) => t.toLowerCase().includes('végétarien'))) return;
        if (
          activeMacroFilter === 'halal' &&
          !(
            dish.isHalal === true ||
            resto.isHalalCertified === true ||
            dish.tags.some((t) => t.toLowerCase() === 'halal')
          )
        ) {
          return;
        }

        matches.push({
          restaurantId: resto.id,
          restaurantName: resto.name,
          dish,
        });
      });
    });

    // Smart sort based on user macro intent:
    if (activeMacroFilter === 'high-protein') {
      matches.sort((a, b) => b.dish.nutrition.protein - a.dish.nutrition.protein);
    } else if (activeMacroFilter === 'low-cal') {
      matches.sort((a, b) => a.dish.nutrition.kcal - b.dish.nutrition.kcal);
    } else if (activeMacroFilter === 'low-carb') {
      matches.sort((a, b) => a.dish.nutrition.carbs - b.dish.nutrition.carbs);
    } else if (activeMacroFilter === 'low-fat') {
      matches.sort((a, b) => a.dish.nutrition.fat - b.dish.nutrition.fat);
    } else if (activeMacroFilter === 'high-cal') {
      matches.sort((a, b) => b.dish.nutrition.kcal - a.dish.nutrition.kcal);
    }

    return matches;
  }, [restaurants, searchHubQuery, activeMacroFilter, selectedAllergensFilter, isHalalOnly, isVeganOnly, isOpenOnly]);

  // Open a restaurant menu
  const handleOpenRestaurant = (restoId: string, dishToOpen?: Dish) => {
    setActiveRestaurantId(restoId);
    setCurrentView('restaurant');
    setIsAllergenModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackRestaurantView(restoId);
    if (dishToOpen) {
      const r = restaurants.find((item) => item.id === restoId);
      setSelectedDish(dishToOpen);
      setSelectedDishRestaurant(r || null);
      setIsDishModalOpen(true);
      trackDishView(restoId, dishToOpen.id);
    }
  };

  // Back to portal hub
  const handleBackToPortal = () => {
    setCurrentView('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open and smoothly focus the interactive map
  const handleOpenMap = (restoId?: string) => {
    setPortalDisplayMode('map');
    if (currentView !== 'portal') {
      setCurrentView('portal');
    }
    if (restoId) {
      setSelectedMapRestaurantId(restoId);
    }
    setTimeout(() => {
      const el = document.getElementById('interactive-map-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Dish details
  const handleOpenDishDetail = (dish: Dish, resto?: Restaurant) => {
    setSelectedDish(dish);
    const targetResto = resto || activeRestaurant || null;
    setSelectedDishRestaurant(targetResto);
    setIsDishModalOpen(true);
    if (targetResto && dish) {
      trackDishView(targetResto.id, dish.id);
    }
  };

  // Creator Dashboard Handlers
  const handleAddRestaurant = (newRestaurant: Restaurant) => {
    setRestaurants((prev) => [newRestaurant, ...prev]);
    showToast(`Établissement « ${newRestaurant.name} » ajouté avec succès ! 🎉`);
  };

  const handleUpdateRestaurant = (updatedRestaurant: Restaurant) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === updatedRestaurant.id ? updatedRestaurant : r))
    );
    showToast(`Établissement « ${updatedRestaurant.name} » mis à jour avec succès ! ✨`);
  };

  const handleEditRestaurantMenu = (restaurantId: string) => {
    setActiveRestaurantId(restaurantId);
    setIsAdmin(true);
    setIsAdminModalOpen(true);
  };

  const handleDeleteRestaurant = (restaurantId: string) => {
    setRestaurants((prev) => {
      const remaining = prev.filter((r) => r.id !== restaurantId);
      return remaining.length > 0 ? remaining : INITIAL_RESTAURANTS_DATA;
    });
    if (activeRestaurantId === restaurantId) {
      const remaining = restaurants.find((r) => r.id !== restaurantId);
      if (remaining) setActiveRestaurantId(remaining.id);
    }
  };

  const handleResetRestaurantsToDefault = () => {
    setRestaurants(INITIAL_RESTAURANTS_DATA);
    showToast("Le catalogue a été réinitialisé aux données d'origine.");
  };

  // Registrations Handlers (Validation & Rejet)
  const handleValidateRegistration = (registrationId: string) => {
    let activatedRestoName = '';
    let activatedResto: Restaurant | null = null;

    setRegistrations((prev) =>
      prev.map((reg) => {
        if (reg.id === registrationId) {
          activatedRestoName = reg.restaurantName;
          if (reg.draftRestaurant) {
            activatedResto = reg.draftRestaurant;
          }
          return { ...reg, status: 'valide' as const };
        }
        return reg;
      })
    );

    if (activatedResto) {
      const restoToAdd: Restaurant = activatedResto;
      setRestaurants((prev) => {
        if (prev.some((r) => r.id === restoToAdd.id)) {
          return prev;
        }
        return [restoToAdd, ...prev];
      });
    }

    showToast(`Candidature validée ! « ${activatedRestoName || 'Le restaurant'} » est désormais en ligne sur Gusto 🎉`);
  };

  const handleRejectRegistration = (registrationId: string) => {
    setRegistrations((prev) =>
      prev.map((reg) => (reg.id === registrationId ? { ...reg, status: 'refuse' as const } : reg))
    );
    showToast('Candidature marquée comme refusée.');
  };

  const handleAddRegistration = (newRegistration: RestaurantRegistration) => {
    setRegistrations((prev) => [newRegistration, ...prev]);
    showToast(`Nouvelle inscription enregistrée pour « ${newRegistration.restaurantName} » 📋`);
  };

  const handleOpenCreatorDashboard = () => {
    setCurrentView('creator-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Allergen filters
  const handleToggleAllergen = (id: string) => {
    setSelectedAllergensFilter((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleResetAllergens = () => {
    setSelectedAllergensFilter([]);
    showToast('Filtres allergènes réinitialisés.');
  };

  // Admin actions (PIN = 1504)
  const [editingDishForAdmin, setEditingDishForAdmin] = useState<Dish | null>(null);

  const handleOpenAdminForEdit = (dish: Dish) => {
    setEditingDishForAdmin(dish);
    setIsAdminModalOpen(true);
  };

  const handleAdminLogin = (pin: string) => {
    const cleanPin = pin.trim().toLowerCase();
    if (cleanPin === '1504' || cleanPin === 'admin' || cleanPin === '0000' || cleanPin === '1234') {
      setIsAdmin(true);
      try {
        localStorage.setItem('gusto_admin_authenticated', 'true');
      } catch (e) {
        console.error(e);
      }
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setEditingDishForAdmin(null);
    try {
      localStorage.removeItem('gusto_admin_authenticated');
    } catch (e) {
      console.error(e);
    }
    showToast('Déconnexion de l\'espace privé.');
  };

  const handleAddDish = (newDish: Dish) => {
    setRestaurants((prev) =>
      prev.map((resto) => {
        if (resto.id === activeRestaurantId) {
          return {
            ...resto,
            dishes: [newDish, ...resto.dishes],
          };
        }
        return resto;
      })
    );
  };

  const handleUpdateDish = (updatedDish: Dish) => {
    setRestaurants((prev) =>
      prev.map((resto) => {
        if (resto.id === activeRestaurantId) {
          return {
            ...resto,
            dishes: resto.dishes.map((d) => (d.id === updatedDish.id ? updatedDish : d)),
          };
        }
        return resto;
      })
    );

    // Also update currently inspected dish if open
    if (selectedDish?.id === updatedDish.id) {
      setSelectedDish(updatedDish);
    }
  };

  const handleDeleteDish = (dishId: string) => {
    setRestaurants((prev) =>
      prev.map((resto) => {
        if (resto.id === activeRestaurantId) {
          return {
            ...resto,
            dishes: resto.dishes.filter((d) => d.id !== dishId),
          };
        }
        return resto;
      })
    );

    // If currently selected dish is deleted, close detail modal
    if (selectedDish?.id === dishId) {
      setIsDishModalOpen(false);
      setSelectedDish(null);
    }
  };

  const handleAddCategory = (newCategory: MenuCategory) => {
    setRestaurants((prev) =>
      prev.map((resto) => {
        if (resto.id === activeRestaurantId) {
          return {
            ...resto,
            categories: [...resto.categories, newCategory],
          };
        }
        return resto;
      })
    );
  };

  const handleDeleteCategory = (catId: string) => {
    setRestaurants((prev) =>
      prev.map((resto) => {
        if (resto.id === activeRestaurantId) {
          return {
            ...resto,
            categories: resto.categories.filter((c) => c.id !== catId),
          };
        }
        return resto;
      })
    );
    showToast('Catégorie supprimée.');
  };

  const handleToggleDishOfTheMoment = (dishId: string | null, enabled: boolean) => {
    setRestaurants((prev) =>
      prev.map((resto) => {
        if (resto.id === activeRestaurantId) {
          return {
            ...resto,
            dishOfTheMomentId: dishId || resto.dishOfTheMomentId || (resto.dishes[0]?.id ?? undefined),
            dishOfTheMomentEnabled: enabled,
          };
        }
        return resto;
      })
    );
  };

  return (
    <div className="min-h-full font-sans antialiased text-stone-900 paper-texture selection:bg-[#99281a] selection:text-white relative">
      {/* FLOATING TOP NAVBAR (GUSTO MODERN LUXURY) */}
      <PortalHeader
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        userCoords={userCoords}
        onRequestGeolocation={handleRequestGeolocation}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenCreatorDashboard={handleOpenCreatorDashboard}
        onOpenRegistrationModal={() => setIsRegistrationModalOpen(true)}
        onOpenMap={() => handleOpenMap()}
        isMapActive={portalDisplayMode === 'map' && currentView === 'portal'}
        currentView={currentView}
        onNavigatePortal={handleBackToPortal}
        onNavigateRestaurant={() => handleOpenRestaurant(activeRestaurantId)}
        onOpenAllergenModal={() => setIsAllergenModalOpen(true)}
        activeAllergensCount={selectedAllergensFilter.length}
        activeRestaurantName={activeRestaurant?.name}
        pendingRegistrationsCount={pendingRegistrationsCount}
        restaurantsCount={restaurants.length}
        onOpenDietaryProfile={() => setIsDietaryProfileModalOpen(true)}
        hasSavedDietaryProfile={hasSavedProfile}
        onScrollToNutrition={() => {
          if (currentView !== 'portal') {
            setCurrentView('portal');
          }
          setTimeout(() => {
            const el = document.getElementById('nutrition-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* VIEW 1: PORTAL HUB */}
      {currentView === 'portal' && (
        <div className="min-h-screen flex flex-col justify-between pt-16 sm:pt-20">
          <HeroSearch
            currentLang={currentLang}
            searchQuery={searchHubQuery}
            onSearchChange={setSearchHubQuery}
            activeMacroFilter={activeMacroFilter}
            onMacroFilterChange={setActiveMacroFilter}
            selectedAllergens={selectedAllergensFilter}
            onToggleAllergen={handleToggleAllergen}
            onResetAllergens={handleResetAllergens}
            onOpenAllergenModal={() => setIsAllergenModalOpen(true)}
            onRequestGeolocation={handleRequestGeolocation}
            isHalalOnly={isHalalOnly}
            onToggleHalal={handleToggleHalal}
            isVeganOnly={isVeganOnly}
            onToggleVegan={handleToggleVegan}
            isOpenOnly={isOpenOnly}
            onToggleOpenOnly={handleToggleOpenOnly}
            onOpenMap={() => handleOpenMap()}
            isMapActive={portalDisplayMode === 'map'}
          />

          {/* Directory section */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10 grow">
            {/* PWA 1-CLICK MOBILE INSTALL BANNER */}
            <PWAInstallButton variant="banner" onShowToast={showToast} />

            {/* SECTION 1: NOUVEAUX RESTAURANTS (3 DERNIERS AJOUTS) */}
            {filteredLatestRestaurants.length > 0 && (
              <section
                aria-label="Nouveaux restaurants"
                className="relative rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-amber-50/40 border border-amber-500/25 shadow-xs space-y-5 overflow-hidden"
              >
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-rose-400/10 rounded-full blur-3xl pointer-events-none" />

                {/* Section Header */}
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 text-white shadow-sm border border-white/40">
                        <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                        <span>Nouveautés Gusto</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/80 text-amber-900 border border-amber-300/60 shadow-2xs">
                        3 derniers ajouts
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 tracking-tight">
                      Nouveaux restaurants
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
                      Découvrez les derniers établissements arrivés sur la plateforme, avec leurs cartes interactives, valeurs nutritionnelles vérifiées et photos gourmandes.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <span className="text-xs font-semibold text-amber-900/80 bg-white/70 px-3 py-1.5 rounded-xl border border-amber-200/80 shadow-2xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Fraîchement référencés</span>
                    </span>
                  </div>
                </div>

                {/* Grid of the 3 latest restaurants */}
                <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLatestRestaurants.map((resto) => (
                    <RestaurantCard
                      key={`new-spotlight-${resto.id}`}
                      restaurant={resto}
                      currentLang={currentLang}
                      selectedAllergens={selectedAllergensFilter}
                      activeMacroFilter={activeMacroFilter}
                      isHalalOnly={isHalalOnly}
                      isVeganOnly={isVeganOnly}
                      onSelect={handleOpenRestaurant}
                      isNewBadge={true}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* INTERACTIVE MAP SHOWCASE BANNER (MAKES THE MAP HIGHLY VISIBLE & ATTRACTIVE) */}
            <div
              id="interactive-map-section"
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-950 via-[#781524] to-amber-950 text-white p-5 sm:p-7 shadow-2xl border border-amber-500/30"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2.5 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/40 text-[11px] font-bold text-amber-300">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                    </span>
                    <span>CARTE INTERACTIVE GÉOLOCALISÉE • AUBAGNE & ALENTOURS</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black tracking-tight text-white leading-tight">
                    {portalDisplayMode === 'map'
                      ? 'Exploration des restaurants sur la carte interactive'
                      : 'Explorez tous les restaurants sur notre carte interactive en direct'}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                    Visualisez les tables certifiées sur OpenStreetMap, filtrez par <strong className="text-amber-300">allergènes exclus</strong> et <strong className="text-amber-300">cuisine</strong> en temps réel, activez la localisation GPS et lancez votre itinéraire Google Maps en 1 clic.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-stone-300">
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      <span>✓</span>
                      <span>Filtres Allergènes & Cuisine intégrés</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <span>✓</span>
                      <span>Bouton Itinéraire Google Maps direct</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-sky-300">
                      <span>✓</span>
                      <span>Recentrage automatique GPS</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
                  {portalDisplayMode === 'grid' ? (
                    <button
                      type="button"
                      onClick={() => handleOpenMap()}
                      className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-xl hover:shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <Map className="w-4 h-4 text-stone-950" />
                      <span>Ouvrir la Carte Interactive</span>
                      <span className="w-2 h-2 rounded-full bg-stone-950 animate-ping"></span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPortalDisplayMode('grid')}
                      className="px-5 py-3 rounded-2xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98"
                    >
                      <LayoutGrid className="w-4 h-4 text-[#99281a]" />
                      <span>Revenir à la vue Grille ({filteredRestaurants.length})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: TOUS LES RESTAURANTS PARTENAIRES (GRILLE OU CARTE INTERACTIVE) */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    {t('partnersTitle')}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {t('partnersSubtitle')}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Mode Grille / Mode Carte Toggle */}
                  <div className="bg-stone-200/90 p-1 rounded-full flex items-center border border-stone-300 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setPortalDisplayMode('grid')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        portalDisplayMode === 'grid'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-[#99281a]" />
                      <span>Grille ({filteredRestaurants.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenMap()}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        portalDisplayMode === 'map'
                          ? 'bg-amber-400 text-stone-950 font-black shadow-xs ring-2 ring-amber-400/40'
                          : 'text-stone-700 hover:text-stone-950 font-semibold'
                      }`}
                    >
                      <Map className={`w-3.5 h-3.5 ${portalDisplayMode === 'map' ? 'text-stone-950' : 'text-[#99281a]'}`} />
                      <span>Carte interactive</span>
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                      </span>
                    </button>
                  </div>

                  <span className="text-xs font-mono bg-white px-3 py-1 rounded-full border border-stone-200 text-stone-700 shadow-2xs">
                    {filteredRestaurants.length} {t('establishments')}
                  </span>
                </div>
              </div>

              {/* View Rendering: Grid vs Interactive Map */}
              {portalDisplayMode === 'map' ? (
                <InteractiveRestaurantsMap
                  restaurants={filteredRestaurants}
                  currentLang={currentLang}
                  userCoords={userCoords}
                  onRequestGeolocation={handleRequestGeolocation}
                  onSelectRestaurant={handleOpenRestaurant}
                  selectedRestaurantId={selectedMapRestaurantId}
                  initialSelectedAllergens={selectedAllergensFilter}
                  onOpenDietaryProfile={() => setIsDietaryProfileModalOpen(true)}
                  onShowToast={showToast}
                  onSuggestRegistration={(prefill) => {
                    setIsRegistrationModalOpen(true);
                    showToast(`Formulaire d'inscription ouvert pour ${prefill.name}`);
                  }}
                />
              ) : (
                /* Restaurants Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRestaurants.map((resto) => (
                    <RestaurantCard
                      key={resto.id}
                      restaurant={resto}
                      currentLang={currentLang}
                      selectedAllergens={selectedAllergensFilter}
                      activeMacroFilter={activeMacroFilter}
                      isHalalOnly={isHalalOnly}
                      isVeganOnly={isVeganOnly}
                      onSelect={handleOpenRestaurant}
                      onViewOnMap={(id) => handleOpenMap(id)}
                      onShare={(r) => setSharingRestaurant(r)}
                      userCoords={userCoords}
                      isNewBadge={latestRestaurants.some((lr) => lr.id === resto.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* FLOATING ACTION BUTTON: JUMP TO MAP ANYTIME IN GRID VIEW */}
            {portalDisplayMode === 'grid' && (
              <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                  type="button"
                  onClick={() => handleOpenMap()}
                  className="px-4 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-black text-xs shadow-2xl border-2 border-amber-400 flex items-center gap-2.5 transition transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-black/20"
                  title="Voir tous les restaurants sur la carte interactive géolocalisée"
                >
                  <Map className="w-4 h-4 text-amber-400" />
                  <span>Carte Interactive ({filteredRestaurants.length})</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  </span>
                </button>
              </div>
            )}

            {/* Global dish search results */}
            <GlobalDishResults
              searchQuery={searchHubQuery}
              activeMacroFilter={activeMacroFilter}
              selectedAllergens={selectedAllergensFilter}
              isHalalOnly={isHalalOnly}
              isVeganOnly={isVeganOnly}
              matches={globalMatchingDishes}
              currentLang={currentLang}
              onSelectDish={(restoId, dish) => handleOpenRestaurant(restoId, dish)}
            />
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-stone-200 py-8 px-4 text-center text-xs text-stone-500 space-y-3">
            <p>
              © 2026 Gusto France • Recherche géolocalisée et transparence nutritionnelle des restaurateurs.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-stone-600 pt-2 border-t border-stone-100 max-w-lg mx-auto">
              <button
                type="button"
                onClick={() => setIsRegistrationModalOpen(true)}
                className="hover:text-stone-900 transition cursor-pointer flex items-center gap-1.5 opacity-80 hover:opacity-100 font-bold text-amber-700"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Inscrire mon restaurant</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="hover:text-stone-800 transition cursor-pointer flex items-center gap-1.5 opacity-60 hover:opacity-100"
              >
                <KeyRound className="w-3 h-3" />
                <span>{isAdmin ? 'Gérer le restaurant' : 'Espace privé'}</span>
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAdmin(false);
                    showToast('Déconnexion effectuée');
                  }}
                  className="hover:text-rose-600 transition cursor-pointer flex items-center gap-1.5 opacity-60 hover:opacity-100 text-rose-500"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Déconnexion</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenCreatorDashboard}
                className="hover:text-stone-800 transition cursor-pointer flex items-center gap-1.5 opacity-60 hover:opacity-100"
              >
                <Crown className="w-3 h-3" />
                <span>Dashboard</span>
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* VIEW 2: INDIVIDUAL RESTAURANT MENU */}
      {currentView === 'restaurant' && (
        <div className="pt-16 sm:pt-20">
          <RestaurantView
            restaurant={activeRestaurant}
            currentLang={currentLang}
            onLanguageChange={setCurrentLang}
            onBackToPortal={handleBackToPortal}
            onOpenDishDetail={(d) => handleOpenDishDetail(d, activeRestaurant)}
            onOpenAllergenModal={() => setIsAllergenModalOpen(true)}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onOpenCreatorDashboard={handleOpenCreatorDashboard}
            selectedAllergens={selectedAllergensFilter}
            onToggleAllergen={handleToggleAllergen}
            onResetAllergens={handleResetAllergens}
            activeMacroFilter={activeMacroFilter}
            onMacroFilterChange={setActiveMacroFilter}
            isHalalOnly={isHalalOnly}
            onToggleHalal={handleToggleHalal}
            isVeganOnly={isVeganOnly}
            onToggleVegan={handleToggleVegan}
            isAdmin={isAdmin}
            onLogoutAdmin={handleAdminLogout}
            onEditDish={handleOpenAdminForEdit}
            onToggleDishOfTheMoment={handleToggleDishOfTheMoment}
            onShowToast={showToast}
            onUpdateRestaurant={handleUpdateRestaurant}
          />
        </div>
      )}

      {/* VIEW 3: CREATOR DASHBOARD PAGE (NEW DEDICATED PAGE) */}
      {currentView === 'creator-dashboard' && (
        <div className="pt-16 sm:pt-20">
          <CreatorDashboardPage
            restaurants={restaurants}
            registrations={registrations}
            onAddRestaurant={handleAddRestaurant}
            onUpdateRestaurant={handleUpdateRestaurant}
            onDeleteRestaurant={handleDeleteRestaurant}
            onResetRestaurantsToDefault={handleResetRestaurantsToDefault}
            onOpenPublicRestaurant={(id) => handleOpenRestaurant(id)}
            onEditRestaurantMenu={handleEditRestaurantMenu}
            onValidateRegistration={handleValidateRegistration}
            onRejectRegistration={handleRejectRegistration}
            onAddRegistration={handleAddRegistration}
            onBackToPortal={handleBackToPortal}
            onShowToast={showToast}
          />
        </div>
      )}

      {/* MODALS */}
      <DishDetailModal
        isOpen={isDishModalOpen}
        dish={selectedDish}
        restaurant={selectedDishRestaurant || activeRestaurant}
        currentLang={currentLang}
        onClose={() => setIsDishModalOpen(false)}
        isAdmin={isAdmin}
        onEditDish={handleOpenAdminForEdit}
        onUpdateDish={handleUpdateDish}
        onShowToast={showToast}
        onToggleDishOfTheMoment={handleToggleDishOfTheMoment}
      />

      <AllergenFilterModal
        isOpen={isAllergenModalOpen}
        selectedAllergens={selectedAllergensFilter}
        currentLang={currentLang}
        onToggleAllergen={handleToggleAllergen}
        onResetAllergens={handleResetAllergens}
        onClose={() => setIsAllergenModalOpen(false)}
        isHalalOnly={isHalalOnly}
        onToggleHalal={handleToggleHalal}
        isVeganOnly={isVeganOnly}
        onToggleVegan={handleToggleVegan}
        isOpenOnly={isOpenOnly}
        onToggleOpenOnly={handleToggleOpenOnly}
        activeMacroFilter={activeMacroFilter}
        onMacroFilterChange={setActiveMacroFilter}
      />

      {/* DIETARY PROFILE PERSISTENT MODAL */}
      <DietaryProfileModal
        isOpen={isDietaryProfileModalOpen}
        onClose={() => setIsDietaryProfileModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
        onShowToast={showToast}
      />

      {/* SHARE & QUICK CONVERSION MODAL */}
      <ShareRestaurantModal
        isOpen={Boolean(sharingRestaurant)}
        restaurant={sharingRestaurant}
        onClose={() => setSharingRestaurant(null)}
        onShowToast={showToast}
      />

      <AdminPortalModal
        isOpen={isAdminModalOpen}
        isAdmin={isAdmin}
        activeRestaurant={activeRestaurant}
        currentLang={currentLang}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        onAddDish={handleAddDish}
        onUpdateDish={handleUpdateDish}
        onDeleteDish={handleDeleteDish}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onClose={() => {
          setIsAdminModalOpen(false);
          setEditingDishForAdmin(null);
        }}
        onShowToast={showToast}
        initialEditingDish={editingDishForAdmin}
        onClearInitialEditingDish={() => setEditingDishForAdmin(null)}
        onOpenCreatorDashboard={handleOpenCreatorDashboard}
        onToggleDishOfTheMoment={handleToggleDishOfTheMoment}
      />

      {/* RESTAURANT REGISTRATION MODAL */}
      <RestaurantRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onSubmitRegistration={handleAddRegistration}
        onShowToast={showToast}
      />

      {/* SCROLL TO TOP FLOATING BUTTON */}
      <ScrollToTopButton />

      {/* TOAST FEEDBACK */}
      <Toast visible={toast.visible} message={toast.message} />

      {/* PWA OFFLINE CONNECTIVITY INDICATOR */}
      <OfflineIndicator />
    </div>
  );
}
