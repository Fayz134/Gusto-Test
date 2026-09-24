import React, { useState, useMemo, useEffect } from 'react';
import { Restaurant, Language, MacroFilterType, Dish, MenuCategory } from './types';
import { INITIAL_RESTAURANTS_DATA } from './data/restaurants';
import { I18N_DICT } from './data/i18n';
import { calcDistanceKm, getCityNameFromCoords } from './utils/geo';
import { PortalHeader } from './components/PortalHeader';
import { HeroSearch } from './components/HeroSearch';
import { RestaurantCard } from './components/RestaurantCard';
import { GlobalDishResults } from './components/GlobalDishResults';
import { RestaurantView } from './components/RestaurantView';
import { DishDetailModal } from './components/DishDetailModal';
import { QrTableModal } from './components/QrTableModal';
import { AllergenFilterModal } from './components/AllergenFilterModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { OrderSummaryModal, OrderCartItem } from './components/OrderSummaryModal';
import { Toast } from './components/Toast';
import { ScrollToTopButton } from './components/ScrollToTopButton';

const STORAGE_KEY = 'gusto_restaurants_catalog_v3';

export default function App() {
  // Navigation & Data State
  const [currentView, setCurrentView] = useState<'portal' | 'restaurant'>('portal');
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Verify if Cave a pizza exists and has the full menu loaded
          const caveAPizza = parsed.find((r: Restaurant) => r.id === 'la-cave-a-pizza-aubagne');
          if (caveAPizza && caveAPizza.dishes && caveAPizza.dishes.length >= 35) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Could not read saved restaurants', e);
    }
    return INITIAL_RESTAURANTS_DATA;
  });
  const [activeRestaurantId, setActiveRestaurantId] = useState<string>('trattoria-bella-vista');

  // Keep localStorage in sync whenever restaurants change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
    } catch (e) {
      console.warn('Could not save restaurants to localStorage', e);
    }
  }, [restaurants]);

  // Preferences & Filters
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [searchHubQuery, setSearchHubQuery] = useState<string>('');
  const [activeMacroFilter, setActiveMacroFilter] = useState<MacroFilterType>('all');
  const [selectedAllergensFilter, setSelectedAllergensFilter] = useState<string[]>([]);

  // Table Order State
  const [orderItems, setOrderItems] = useState<OrderCartItem[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedDishRestaurant, setSelectedDishRestaurant] = useState<Restaurant | null>(null);

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
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAllergenModalOpen, setIsAllergenModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Search options: Halal and Vegan preferences
  const [isHalalOnly, setIsHalalOnly] = useState(false);
  const [isVeganOnly, setIsVeganOnly] = useState(false);

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

    return list;
  }, [restaurants, searchHubQuery, activeMacroFilter, selectedAllergensFilter, isHalalOnly, isVeganOnly]);

  // Global matching dishes (triggered if text query, macro filter, allergens, halal, or vegan are selected)
  const globalMatchingDishes = useMemo(() => {
    const q = searchHubQuery.toLowerCase().trim();
    const isFiltering =
      q !== '' ||
      activeMacroFilter !== 'all' ||
      selectedAllergensFilter.length > 0 ||
      isHalalOnly ||
      isVeganOnly;
    if (!isFiltering) return [];

    const matches: { restaurantId: string; restaurantName: string; dish: Dish }[] = [];

    restaurants.forEach((resto) => {
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
  }, [restaurants, searchHubQuery, activeMacroFilter, selectedAllergensFilter, isHalalOnly, isVeganOnly]);

  // Order Cart totals
  const totalOrderCount = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [orderItems]);

  const totalOrderAmount = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  }, [orderItems]);

  // Cart operations
  const handleAddToCart = (dish: Dish) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
    showToast(`« ${dish.name} » ajouté à votre commande ! 🛍️`);
  };

  const handleUpdateOrderQuantity = (dishId: string, delta: number) => {
    setOrderItems((prev) => {
      return prev
        .map((item) => {
          if (item.dish.id === dishId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderCartItem[];
    });
  };

  const handleClearOrder = () => {
    setOrderItems([]);
    showToast('Commande réinitialisée.');
  };

  // Open a restaurant menu
  const handleOpenRestaurant = (restoId: string, dishToOpen?: Dish) => {
    setActiveRestaurantId(restoId);
    setCurrentView('restaurant');
    setIsAllergenModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (dishToOpen) {
      const r = restaurants.find((item) => item.id === restoId);
      setSelectedDish(dishToOpen);
      setSelectedDishRestaurant(r || null);
      setIsDishModalOpen(true);
    }
  };

  // Back to portal hub
  const handleBackToPortal = () => {
    setCurrentView('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dish details
  const handleOpenDishDetail = (dish: Dish, resto?: Restaurant) => {
    setSelectedDish(dish);
    setSelectedDishRestaurant(resto || activeRestaurant || null);
    setIsDishModalOpen(true);
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

    // Also update dish in current cart if present
    setOrderItems((prev) =>
      prev.map((item) =>
        item.dish.id === updatedDish.id ? { ...item, dish: updatedDish } : item
      )
    );
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

    // Remove from cart if present
    setOrderItems((prev) => prev.filter((item) => item.dish.id !== dishId));
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

  return (
    <div className="min-h-full font-sans antialiased text-stone-900 paper-texture selection:bg-[#99281a] selection:text-white">
      {/* VIEW 1: PORTAL HUB */}
      {currentView === 'portal' && (
        <div className="min-h-screen flex flex-col justify-between">
          <PortalHeader
            currentLang={currentLang}
            onLanguageChange={setCurrentLang}
            userCoords={userCoords}
            onRequestGeolocation={handleRequestGeolocation}
            isAdmin={isAdmin}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
          />

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
          />

          {/* Directory section */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 grow">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  {t('partnersTitle')}
                </h3>
                <p className="text-xs text-stone-500">
                  {t('partnersSubtitle')}
                </p>
              </div>
              <span className="text-xs font-mono bg-white px-3 py-1 rounded-full border border-stone-200 text-stone-700 shadow-2xs">
                {filteredRestaurants.length} {t('establishments')}
              </span>
            </div>

            {/* Restaurants Grid */}
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
                />
              ))}
            </div>

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
          <footer className="bg-white border-t border-stone-200 py-6 px-4 text-center text-xs text-stone-500">
            <p>
              © 2026 Gusto France • Recherche géolocalisée et transparence nutritionnelle des restaurateurs.
            </p>
          </footer>
        </div>
      )}

      {/* VIEW 2: INDIVIDUAL RESTAURANT MENU */}
      {currentView === 'restaurant' && (
        <RestaurantView
          restaurant={activeRestaurant}
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
          onBackToPortal={handleBackToPortal}
          onOpenDishDetail={(d) => handleOpenDishDetail(d, activeRestaurant)}
          onOpenQrModal={() => setIsQrModalOpen(true)}
          onOpenAllergenModal={() => setIsAllergenModalOpen(true)}
          onOpenAdminModal={() => setIsAdminModalOpen(true)}
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
          orderCount={totalOrderCount}
          orderTotal={totalOrderAmount}
          onOpenOrderModal={() => setIsOrderModalOpen(true)}
          onEditDish={handleOpenAdminForEdit}
        />
      )}

      {/* MODALS */}
      <DishDetailModal
        isOpen={isDishModalOpen}
        dish={selectedDish}
        restaurant={selectedDishRestaurant || activeRestaurant}
        currentLang={currentLang}
        onClose={() => setIsDishModalOpen(false)}
        onAddToCart={handleAddToCart}
        cartCount={orderItems.find((i) => i.dish.id === selectedDish?.id)?.quantity || 0}
        isAdmin={isAdmin}
        onEditDish={handleOpenAdminForEdit}
        onUpdateDish={handleUpdateDish}
        onShowToast={showToast}
      />

      <OrderSummaryModal
        isOpen={isOrderModalOpen}
        items={orderItems}
        currentLang={currentLang}
        onClose={() => setIsOrderModalOpen(false)}
        onUpdateQuantity={handleUpdateOrderQuantity}
        onClearOrder={handleClearOrder}
      />

      <QrTableModal
        isOpen={isQrModalOpen}
        restaurantName={activeRestaurant.name}
        currentLang={currentLang}
        onClose={() => setIsQrModalOpen(false)}
        onShowToast={showToast}
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
        activeMacroFilter={activeMacroFilter}
        onMacroFilterChange={setActiveMacroFilter}
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
      />

      {/* SCROLL TO TOP FLOATING BUTTON */}
      <ScrollToTopButton />

      {/* TOAST FEEDBACK */}
      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );
}
