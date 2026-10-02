import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Restaurant, Language, AMENITIES_MASTER_LIST, AmenityType } from '../types';
import { I18N_DICT, ALLERGENS_MASTER_LIST } from '../data/i18n';
import {
  MapPin,
  Sparkles,
  Phone,
  ArrowRight,
  Clock,
  Star,
  Crown,
  Flame,
  ExternalLink,
  LocateFixed,
  Layers,
  Globe,
  Loader2,
  Utensils,
  PlusCircle,
  RefreshCw,
  Navigation,
  SlidersHorizontal,
  Filter,
  X,
  Check,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Share2,
  MessageCircle,
  Dumbbell,
  Compass,
  Footprints,
  Car,
  ChevronRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { trackPhoneCall } from '../utils/analytics';
import { calcDistanceKm, calcTravelTimes } from '../utils/geo';
import { ShareRestaurantModal } from './ShareRestaurantModal';
import { openWhatsAppReservation } from '../utils/sharing';

export interface OsmRestaurant {
  id: number;
  lat: number;
  lon: number;
  name: string;
  cuisine: string;
  address: string;
  phone?: string;
  website?: string;
  openingHours?: string;
}

export type MapStyleType = 'standard' | 'dark' | 'satellite';

const MAP_STYLES: Record<
  MapStyleType,
  { label: string; icon: string; url: string; attribution: string; maxZoom: number }
> = {
  standard: {
    label: 'Standard',
    icon: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 19,
  },
  dark: {
    label: 'Sombre Gastro',
    icon: '🌙',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  },
  satellite: {
    label: 'Satellite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri',
    maxZoom: 18,
  },
};

export interface CuisineFilterOption {
  id: string;
  label: string;
  emoji: string;
  match: (cuisine: string) => boolean;
}

export const CUISINE_FILTER_OPTIONS: CuisineFilterOption[] = [
  { id: 'all', label: 'Toutes les cuisines', emoji: '🍽️', match: () => true },
  {
    id: 'italien_pizza',
    label: 'Italien & Pizzas',
    emoji: '🍕',
    match: (c) => /ital|pizz/i.test(c),
  },
  {
    id: 'provencal',
    label: 'Provençal & Terroir',
    emoji: '🌿',
    match: (c) => /proven|terroir|méditer|french|franç/i.test(c),
  },
  {
    id: 'healthy_veg',
    label: 'Healthy & Végétarien',
    emoji: '🥑',
    match: (c) => /healthy|végét|vegan|bio|salade|bowl/i.test(c),
  },
  {
    id: 'grillades_halal',
    label: 'Grillades & Halal',
    emoji: '🥩',
    match: (c) => /grill|halal|liban|broch|chawarma|kebab|bbq/i.test(c),
  },
];

export const RATING_FILTER_OPTIONS = [
  { value: 0, label: 'Toutes les notes' },
  { value: 4.0, label: '4.0+ ★' },
  { value: 4.5, label: '4.5+ ★' },
  { value: 4.8, label: '4.8+ ★ (Gusto)' },
];

export const RADIUS_OPTIONS = [
  { value: 0, label: 'Tous', badge: 'Sans limite' },
  { value: 1, label: '1 km', badge: '🚶 ~12 min à pied' },
  { value: 3, label: '3 km', badge: '🚗 ~6 min' },
  { value: 5, label: '5 km', badge: '🚗 ~10 min' },
  { value: 10, label: '10 km', badge: 'Aubagne & Étoile' },
];

export type MapSortType = 'distance' | 'rating' | 'protein' | 'calories';

export const MAP_SORT_OPTIONS: { id: MapSortType; label: string; icon: string; description: string }[] = [
  { id: 'distance', label: 'Plus proche', icon: '📍', description: 'Distance exacte en mètres' },
  { id: 'rating', label: 'Mieux noté', icon: '⭐', description: '5 étoiles et excellence' },
  { id: 'protein', label: 'Riche en protéines', icon: '🥩', description: 'Objectif fitness' },
  { id: 'calories', label: 'Léger en kcal', icon: '🥗', description: 'Repas < 500 kcal' },
];

interface InteractiveRestaurantsMapProps {
  restaurants: Restaurant[];
  currentLang: Language;
  userCoords: { lat: number; lng: number } | null;
  onRequestGeolocation: () => void;
  onSelectRestaurant: (restaurantId: string) => void;
  selectedRestaurantId?: string | null;
  onSuggestRegistration?: (prefill: { name: string; address: string; cuisine: string }) => void;
  initialSelectedAllergens?: string[];
  onOpenDietaryProfile?: () => void;
  onShowToast?: (message: string) => void;
}

export const InteractiveRestaurantsMap: React.FC<InteractiveRestaurantsMapProps> = ({
  restaurants,
  currentLang,
  userCoords,
  onRequestGeolocation,
  onSelectRestaurant,
  selectedRestaurantId,
  onSuggestRegistration,
  initialSelectedAllergens = [],
  onOpenDietaryProfile,
  onShowToast,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const partnerMarkersRef = useRef<Record<string, L.Marker>>({});
  const osmMarkersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Selected state: Gusto Partner ID or OSM ID
  const [activePinId, setActivePinId] = useState<string | null>(
    selectedRestaurantId || restaurants[0]?.id || null
  );
  const [selectedOsmRestaurant, setSelectedOsmRestaurant] = useState<OsmRestaurant | null>(null);

  // Map Tile Style State
  const [currentMapStyle, setCurrentMapStyle] = useState<MapStyleType>('standard');
  const [isStylePickerOpen, setIsStylePickerOpen] = useState(false);

  // Filters State
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [selectedCuisineFilter, setSelectedCuisineFilter] = useState<string>('all');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(initialSelectedAllergens);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isOpenNowOnly, setIsOpenNowOnly] = useState<boolean>(false);
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(0);
  const [activeSort, setActiveSort] = useState<MapSortType>('distance');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

  // Share Modal State
  const [sharingRestaurant, setSharingRestaurant] = useState<Restaurant | null>(null);

  // Synchronize allergens if passed down
  useEffect(() => {
    if (initialSelectedAllergens && initialSelectedAllergens.length > 0) {
      setSelectedAllergens((prev) => {
        if (
          prev.length === initialSelectedAllergens.length &&
          prev.every((v) => initialSelectedAllergens.includes(v))
        ) {
          return prev;
        }
        return initialSelectedAllergens;
      });
    }
  }, [initialSelectedAllergens]);

  // Close filter drawer on Escape key and invalidate map size
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isFilterPanelOpen]);

  useEffect(() => {
    if (!isFilterPanelOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFilterPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFilterPanelOpen]);

  // Geolocation & Locate Me State
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'located' | 'error'>('idle');

  // Live OSM State
  const [enableOsmDiscovery, setEnableOsmDiscovery] = useState(true);
  const [isSearchingOsm, setIsSearchingOsm] = useState(false);
  const [osmRestaurants, setOsmRestaurants] = useState<OsmRestaurant[]>([]);
  const [osmSearchMessage, setOsmSearchMessage] = useState<string>('');

  // Reference coordinates: user GPS or Aubagne center (43.2929, 5.5714)
  const refLat = userCoords?.lat || 43.2929;
  const refLng = userCoords?.lng || 5.5714;

  // Filtered Partner Restaurants
  const filteredPartnerRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      // 1. "Ouvert maintenant" filter
      if (isOpenNowOnly && !r.openingHours.isOpenNow) {
        return false;
      }

      // 2. Dynamic Radius circle filter
      if (selectedRadiusKm > 0) {
        const dist = calcDistanceKm(refLat, refLng, r.coords.lat, r.coords.lng);
        if (dist > selectedRadiusKm) {
          return false;
        }
      }

      // 3. Rating filter
      const rating = r.rating || 4.8;
      if (minRatingFilter > 0 && rating < minRatingFilter) {
        return false;
      }

      // 4. Cuisine filter
      if (selectedCuisineFilter !== 'all') {
        const option = CUISINE_FILTER_OPTIONS.find((opt) => opt.id === selectedCuisineFilter);
        if (option && !option.match(r.cuisine || '')) {
          return false;
        }
      }

      // 5. Amenities / Ambiance filter (Terrasse, Parking, Clim, Chiens, PMR)
      if (selectedAmenities.length > 0) {
        const restoAmenities = r.amenities || [];
        const hasAllAmenities = selectedAmenities.every((a) => restoAmenities.includes(a));
        if (!hasAllAmenities) {
          return false;
        }
      }

      // 6. Allergen filter: restaurant must offer dishes free of ALL excluded allergens
      if (selectedAllergens.length > 0) {
        const hasSafeDishes = r.dishes.some(
          (d) => !d.allergens.some((alg) => selectedAllergens.includes(alg))
        );
        if (!hasSafeDishes) {
          return false;
        }
      }

      return true;
    });
  }, [
    restaurants,
    isOpenNowOnly,
    selectedRadiusKm,
    refLat,
    refLng,
    minRatingFilter,
    selectedCuisineFilter,
    selectedAmenities,
    selectedAllergens,
  ]);

  // Sorted Partner Restaurants for the carousel below the map
  const sortedPartnerRestaurants = useMemo(() => {
    const list = [...filteredPartnerRestaurants];
    switch (activeSort) {
      case 'distance':
        return list.sort((a, b) => {
          const distA = calcDistanceKm(refLat, refLng, a.coords.lat, a.coords.lng);
          const distB = calcDistanceKm(refLat, refLng, b.coords.lat, b.coords.lng);
          return distA - distB;
        });
      case 'rating':
        return list.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
      case 'protein':
        return list.sort((a, b) => {
          const maxProtA = Math.max(...a.dishes.map((d) => d.nutrition.protein || 0), 0);
          const maxProtB = Math.max(...b.dishes.map((d) => d.nutrition.protein || 0), 0);
          return maxProtB - maxProtA;
        });
      case 'calories':
        return list.sort((a, b) => a.avgKcal - b.avgKcal);
      default:
        return list;
    }
  }, [filteredPartnerRestaurants, activeSort, refLat, refLng]);

  // Filtered OSM Restaurants
  const filteredOsmRestaurants = useMemo(() => {
    return osmRestaurants.filter((o) => {
      // If allergens or amenities are selected, OSM nodes lack detailed proof, hide them
      if (selectedAllergens.length > 0 || selectedAmenities.length > 0) {
        return false;
      }
      // Radius filter
      if (selectedRadiusKm > 0) {
        const dist = calcDistanceKm(refLat, refLng, o.lat, o.lon);
        if (dist > selectedRadiusKm) {
          return false;
        }
      }
      // Rating filter: OSM nodes don't have rated reviews, hide if filtering >= 4.8
      if (minRatingFilter >= 4.8) {
        return false;
      }
      // Cuisine filter
      if (selectedCuisineFilter !== 'all') {
        const option = CUISINE_FILTER_OPTIONS.find((opt) => opt.id === selectedCuisineFilter);
        if (option && !option.match(o.cuisine || '')) {
          return false;
        }
      }
      return true;
    });
  }, [osmRestaurants, selectedAllergens, selectedAmenities, selectedRadiusKm, refLat, refLng, minRatingFilter, selectedCuisineFilter]);

  const activePartnerRestaurant =
    filteredPartnerRestaurants.find((r) => r.id === activePinId) ||
    filteredPartnerRestaurants[0] ||
    null;

  // Search OpenStreetMap live restaurants in current map bounding box
  const chercherRestaurantsOsm = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const limites = map.getBounds();
    const sudOuest = limites.getSouthWest();
    const nordEst = limites.getNorthEast();

    const currentZoom = map.getZoom();
    if (currentZoom < 12) {
      setOsmSearchMessage('Zoomez pour chercher les restaurants de la zone');
      return;
    }

    const zoneBbox = `${sudOuest.lat},${sudOuest.lng},${nordEst.lat},${nordEst.lng}`;
    const overpassQuery = `[out:json][timeout:15];node["amenity"="restaurant"](${zoneBbox});out 45;`;
    const urlAPI = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

    setIsSearchingOsm(true);
    setOsmSearchMessage('Recherche OSM en cours...');

    fetch(urlAPI, { signal: controller.signal })
      .then((reponse) => {
        if (!reponse.ok) throw new Error(`HTTP error ${reponse.status}`);
        return reponse.json();
      })
      .then((donnees) => {
        if (clusterGroupRef.current && osmMarkersRef.current.length > 0) {
          clusterGroupRef.current.removeLayers(osmMarkersRef.current);
        } else {
          osmMarkersRef.current.forEach((marker) => map.removeLayer(marker));
        }
        osmMarkersRef.current = [];

        if (!donnees.elements || donnees.elements.length === 0) {
          setOsmRestaurants([]);
          setOsmSearchMessage('Aucun autre restaurant OSM dans cette zone.');
          setIsSearchingOsm(false);
          return;
        }

        const parsedList: OsmRestaurant[] = donnees.elements.map((resto: any) => {
          const tags = resto.tags || {};
          const nom = tags.name || 'Restaurant sans nom';
          const typeCuisine = tags.cuisine || 'Non spécifiée';
          const street = tags['addr:street'] || tags['addr:place'] || '';
          const housenumber = tags['addr:housenumber'] || '';
          const city = tags['addr:city'] || '';
          const fullAddress = street
            ? `${housenumber} ${street}${city ? ', ' + city : ''}`.trim()
            : 'Adresse sur voirie OpenStreetMap';

          return {
            id: resto.id,
            lat: resto.lat,
            lon: resto.lon,
            name: nom,
            cuisine: typeCuisine,
            address: fullAddress,
            phone: tags.phone || tags['contact:phone'],
            website: tags.website || tags['contact:website'],
            openingHours: tags.opening_hours,
          };
        });

        setOsmRestaurants(parsedList);
        setOsmSearchMessage(`${parsedList.length} repérés OSM`);
        setIsSearchingOsm(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn('Erreur chargement Overpass OpenStreetMap :', err);
          setOsmSearchMessage('Recherche OSM ralentie');
        }
        setIsSearchingOsm(false);
      });
  }, []);

  // Sync OSM Markers with filteredOsmRestaurants
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (clusterGroupRef.current && osmMarkersRef.current.length > 0) {
      clusterGroupRef.current.removeLayers(osmMarkersRef.current);
    } else {
      osmMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    }
    osmMarkersRef.current = [];

    if (!enableOsmDiscovery) return;

    const newOsmMarkers: L.Marker[] = [];

    filteredOsmRestaurants.forEach((osmResto) => {
      const isAlreadyPartner = restaurants.some(
        (p) =>
          p.name.toLowerCase().includes(osmResto.name.toLowerCase()) ||
          (Math.abs(p.coords.lat - osmResto.lat) < 0.0008 &&
            Math.abs(p.coords.lng - osmResto.lon) < 0.0008)
      );
      if (isAlreadyPartner) return;

      const dist = calcDistanceKm(refLat, refLng, osmResto.lat, osmResto.lon);
      const travel = calcTravelTimes(dist);

      const osmMarkerHtml = `
        <div class="osm-pin-wrapper group cursor-pointer" style="display:flex; flex-direction:column; align-items:center; justify-content:flex-end; width:150px; height:46px; transform-origin:bottom center;">
          <div class="px-2 py-1 rounded-xl shadow-md flex items-center gap-1.5 border border-emerald-300 bg-white text-stone-800 hover:border-emerald-600 transition-all">
            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span class="text-[10px] font-bold font-sans whitespace-nowrap max-w-[105px] truncate">
              ${osmResto.name}
            </span>
            <span class="text-[9px] font-bold px-1 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              OSM
            </span>
          </div>
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white -mt-[1px] drop-shadow-xs"></div>
          <div class="w-1.5 h-1.5 rounded-full bg-emerald-600 border border-white -mt-[1px] shadow-xs"></div>
        </div>
      `;

      const osmIcon = L.divIcon({
        className: 'osm-marker-container',
        html: osmMarkerHtml,
        iconSize: [150, 46],
        iconAnchor: [75, 46],
        popupAnchor: [0, -46],
      });

      const marqueur = L.marker([osmResto.lat, osmResto.lon], {
        icon: osmIcon,
        isPartner: false,
      } as any);

      marqueur.bindPopup(`
        <div style="font-family:sans-serif; min-width:200px; padding:3px 2px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
            <span style="background:#ecfdf5; color:#065f46; font-size:10px; font-weight:800; padding:1px 6px; border-radius:999px; border:1px solid #a7f3d0;">
              OpenStreetMap
            </span>
            <span style="font-size:10px; font-weight:700; color:#059669;">
              ${travel.distanceFormatted}
            </span>
          </div>
          <strong style="font-size:13px; color:#1c1917; display:block; margin-bottom:3px; line-height:1.2;">
            ${osmResto.name}
          </strong>
          <div style="font-size:11px; color:#92400e; margin-bottom:3px; font-weight:600;">
            Cuisine : ${osmResto.cuisine}
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:3px 6px; font-size:10px; font-weight:600; color:#475569; margin-bottom:6px; display:flex; justify-content:space-between;">
            <span>${travel.walkLabel}</span>
            <span>•</span>
            <span>${travel.driveLabel}</span>
          </div>
          <small style="color:#57534e; font-size:11px; display:block; line-height:1.3; margin-bottom:8px;">
            📍 ${osmResto.address}
          </small>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=${osmResto.lat},${osmResto.lon}"
            target="_blank"
            rel="noopener noreferrer"
            style="display:flex; align-items:center; justify-content:center; gap:6px; width:100%; box-sizing:border-box; padding:7px 12px; background:#059669; color:#ffffff; border-radius:12px; text-decoration:none; font-size:11px; font-weight:700; box-shadow:0 2px 6px rgba(5,150,105,0.3);"
          >
            <span>Itinéraire Google Maps</span>
          </a>
        </div>
      `);

      marqueur.on('click', () => {
        setSelectedOsmRestaurant(osmResto);
        setActivePinId(`osm-${osmResto.id}`);
      });

      newOsmMarkers.push(marqueur);
    });

    osmMarkersRef.current = newOsmMarkers;

    if (clusterGroupRef.current) {
      clusterGroupRef.current.addLayers(newOsmMarkers);
    } else {
      newOsmMarkers.forEach((m) => m.addTo(map));
    }
  }, [filteredOsmRestaurants, enableOsmDiscovery, restaurants, refLat, refLng]);

  // Debounced search when map moves
  const handleMapMoveEnd = useCallback(() => {
    if (!enableOsmDiscovery) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      chercherRestaurantsOsm();
    }, 600);
  }, [enableOsmDiscovery, chercherRestaurantsOsm]);

  // Switch Map Tile Style dynamically
  const handleChangeMapStyle = (style: MapStyleType) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setCurrentMapStyle(style);
    setIsStylePickerOpen(false);

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const conf = MAP_STYLES[style];
    const newLayer = L.tileLayer(conf.url, {
      maxZoom: conf.maxZoom,
      attribution: conf.attribution,
    }).addTo(map);

    tileLayerRef.current = newLayer;

    if (onShowToast) {
      onShowToast(`Fond de carte : ${conf.label} ${conf.icon}`);
    }
  };

  // Draw or update dynamic Radius Circle on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
      radiusCircleRef.current = null;
    }

    if (selectedRadiusKm > 0) {
      const radiusMeters = selectedRadiusKm * 1000;
      const circle = L.circle([refLat, refLng], {
        radius: radiusMeters,
        color: '#f59e0b',
        fillColor: '#fbbf24',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '6, 6',
      }).addTo(map);

      circle.bindTooltip(`Rayon de recherche : ${selectedRadiusKm} km`, {
        permanent: false,
        direction: 'top',
        className: 'font-bold text-xs bg-stone-900 text-amber-300 border border-amber-400 px-2 py-1 rounded-lg',
      });

      radiusCircleRef.current = circle;

      // Fit map view to radius circle with nice padding
      map.fitBounds(circle.getBounds(), { padding: [30, 30], maxZoom: 16 });
    }
  }, [selectedRadiusKm, refLat, refLng]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Prevent Leaflet error 'Map container is already initialized'
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const defaultLat = userCoords ? userCoords.lat : 43.2929;
    const defaultLng = userCoords ? userCoords.lng : 5.5714;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 14,
      zoomControl: false,
    } as any);

    const standardConf = MAP_STYLES.standard;
    const initialTile = L.tileLayer(standardConf.url, {
      maxZoom: standardConf.maxZoom,
      attribution: standardConf.attribution,
    }).addTo(map);
    tileLayerRef.current = initialTile;

    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    mapInstanceRef.current = map;

    // Cluster group
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      animate: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const markers = cluster.getAllChildMarkers();
        const hasPartner = markers.some((m: any) => m.options?.isPartner);

        if (hasPartner) {
          return L.divIcon({
            html: `
              <div class="gusto-cluster-badge w-10 h-10 rounded-full bg-[#99281a] border-2 border-amber-400 text-white font-extrabold text-xs flex items-center justify-center cursor-pointer select-none shadow-md">
                <span>${count}</span>
              </div>
            `,
            className: 'gusto-cluster-container',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });
        }

        return L.divIcon({
          html: `
            <div class="osm-cluster-badge w-9 h-9 rounded-full bg-emerald-600 border-2 border-white text-white font-extrabold text-xs flex items-center justify-center cursor-pointer select-none shadow-md">
              <span>${count}</span>
            </div>
          `,
          className: 'osm-cluster-container',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
      },
    });

    clusterGroup.addTo(map);
    clusterGroupRef.current = clusterGroup;

    map.invalidateSize();
    const t0 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 50);
    const t1 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);
    const t2 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 600);

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    map.whenReady(() => {
      map.invalidateSize();
      chercherRestaurantsOsm();
    });

    map.on('moveend', handleMapMoveEnd);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers();
        try {
          map.removeLayer(clusterGroupRef.current);
        } catch (_) {}
        clusterGroupRef.current = null;
      }
      try {
        map.remove();
      } catch (err) {
        console.warn('Map cleanup error:', err);
      }
      if (mapContainerRef.current) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Gusto Partner Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const oldPartnerMarkers: L.Marker[] = Object.values(partnerMarkersRef.current);
    if (clusterGroupRef.current && oldPartnerMarkers.length > 0) {
      clusterGroupRef.current.removeLayers(oldPartnerMarkers);
    } else {
      oldPartnerMarkers.forEach((m) => m.remove());
    }
    partnerMarkersRef.current = {};

    const newPartnerMarkers: L.Marker[] = [];

    filteredPartnerRestaurants.forEach((r) => {
      const isSelected = r.id === activePinId;
      const isOpen = r.openingHours.isOpenNow;
      const rating = r.rating || 4.8;
      const isRecommended = r.isGustoRecommended || rating >= 4.5;

      const dist = calcDistanceKm(refLat, refLng, r.coords.lat, r.coords.lng);
      const travel = calcTravelTimes(dist);

      const priceSymbol = r.priceRange.includes('€€€')
        ? '€€€'
        : r.priceRange.includes('€€')
        ? '€€'
        : '€';

      // Pastille clignotante verte pour les restaurants ouverts en direct
      const openStatusDotHtml = isOpen
        ? `
          <span style="position:relative; display:flex; height:10px; width:10px; margin-right:2px; flex-shrink:0;">
            <span style="animation:ping 1.4s cubic-bezier(0,0,0.2,1) infinite; position:absolute; display:inline-flex; height:100%; width:100%; border-radius:9999px; background-color:#34d399; opacity:0.75;"></span>
            <span style="position:relative; display:inline-flex; border-radius:9999px; height:10px; width:10px; background-color:#10b981;"></span>
          </span>
        `
        : `
          <span style="height:8px; width:8px; border-radius:9999px; background-color:#f43f5e; flex-shrink:0; margin-right:2px;"></span>
        `;

      const markerHtml = `
        <div class="gusto-pin-wrapper group cursor-pointer" style="display:flex; flex-direction:column; align-items:center; justify-content:flex-end; width:174px; height:56px; transform-origin:bottom center;">
          <div class="px-2.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 border-2 transition-all ${
            isSelected
              ? 'bg-stone-900 text-white border-amber-400 ring-4 ring-amber-400/30 shadow-stone-900/40'
              : 'bg-white text-stone-900 border-[#99281a] shadow-stone-300/60'
          }">
            ${openStatusDotHtml}

            <!-- Name -->
            <span class="text-[11px] font-black tracking-tight font-serif whitespace-nowrap max-w-[105px] truncate">
              ${r.name}
            </span>

            <!-- Macaron de prix -->
            <span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ${
              isSelected
                ? 'bg-amber-400 text-stone-950'
                : 'bg-stone-100 text-stone-700'
            }">
              ${priceSymbol}
            </span>

            ${
              isRecommended
                ? `<span class="text-[10px] text-amber-500 font-bold shrink-0" title="Recommandé par Gusto">★</span>`
                : ''
            }
          </div>

          <!-- Pin Pointer Triangle pointing down -->
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${
            isSelected ? 'border-t-stone-900' : 'border-t-[#99281a]'
          } -mt-[1px] drop-shadow-sm"></div>

          <!-- Exact Needle Anchor Base Dot -->
          <div class="w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400 ring-2 ring-stone-900' : 'bg-[#99281a] ring-2 ring-white'} -mt-[1px] shadow-xs"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'gusto-marker-container',
        html: markerHtml,
        iconSize: [174, 56],
        iconAnchor: [87, 56],
        popupAnchor: [0, -56],
      });

      const marker = L.marker([r.coords.lat, r.coords.lng], {
        icon: customIcon,
        zIndexOffset: 500,
        isPartner: true,
      } as any);

      // Allergen notice
      const safeDishesCount =
        selectedAllergens.length > 0
          ? r.dishes.filter(
              (d) => !d.allergens.some((alg) => selectedAllergens.includes(alg))
            ).length
          : 0;

      const allergenNoticeHtml =
        selectedAllergens.length > 0
          ? `<div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:3px 6px; font-size:10px; font-weight:700; color:#065f46; margin-bottom:6px; display:flex; align-items:center; gap:4px;">
              <span>🛡️ ${safeDishesCount} plat(s) sans allergènes sélectionnés</span>
            </div>`
          : '';

      // Amenities pill row in popup
      const amenitiesBadgesHtml =
        r.amenities && r.amenities.length > 0
          ? `<div style="display:flex; flex-wrap:wrap; gap:3px; margin-bottom:6px;">
              ${r.amenities
                .map((a) => {
                  const def = AMENITIES_MASTER_LIST.find((x) => x.id === a);
                  return `<span style="background:#f5f5f4; border:1px solid #e7e5e4; border-radius:6px; font-size:9px; font-weight:700; padding:1px 5px; color:#44403c;">${def?.emoji || '✨'} ${def?.shortLabel || a}</span>`;
                })
                .join('')}
            </div>`
          : '';

      marker.bindPopup(`
        <div style="font-family:sans-serif; min-width:215px; padding:3px 2px;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom:4px;">
            <span style="background:${isOpen ? '#ecfdf5' : '#fff1f2'}; color:${isOpen ? '#065f46' : '#9f1239'}; font-size:10px; font-weight:800; padding:1px 7px; border-radius:999px; display:flex; align-items:center; gap:4px;">
              <span style="width:6px; height:6px; border-radius:999px; background:${isOpen ? '#10b981' : '#f43f5e'};"></span>
              <span>${isOpen ? 'Ouvert' : 'Fermé'}</span>
            </span>
            <span style="font-size:11px; font-weight:800; color:#b45309;">
              ★ ${rating} / 5
            </span>
          </div>

          <strong style="font-size:14px; color:#1c1917; display:block; margin-bottom:2px; line-height:1.2;">
            ${r.name}
          </strong>

          <div style="font-size:11px; color:#99281a; margin-bottom:3px; font-weight:600;">
            ${r.cuisine} • ${r.priceRange}
          </div>

          <!-- Live Travel Time Badge in Popup -->
          <div style="background:#fef3c7; border:1px solid #fde68a; border-radius:8px; padding:4px 6px; font-size:10px; font-weight:700; color:#92400e; margin-bottom:6px; display:flex; align-items:center; justify-content:space-between;">
            <span>${travel.walkLabel}</span>
            <span>•</span>
            <span>${travel.driveLabel}</span>
            <span style="font-size:9px; opacity:0.8;">(${travel.distanceFormatted})</span>
          </div>

          <small style="color:#57534e; font-size:11px; display:block; line-height:1.3; margin-bottom:6px;">
            📍 ${r.address}
          </small>

          ${amenitiesBadgesHtml}
          ${allergenNoticeHtml}

          <div style="display:flex; gap:4px; margin-top:6px;">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=${r.coords.lat},${r.coords.lng}"
              target="_blank"
              rel="noopener noreferrer"
              style="flex:1; display:flex; align-items:center; justify-content:center; gap:4px; box-sizing:border-box; padding:6px 8px; background:#99281a; color:#ffffff; border-radius:10px; text-decoration:none; font-size:11px; font-weight:700; box-shadow:0 2px 4px rgba(153,40,26,0.25);"
            >
              <span>Itinéraire</span>
            </a>
            <a
              href="tel:${r.phone}"
              style="display:flex; align-items:center; justify-content:center; padding:6px 10px; background:#1c1917; color:#ffffff; border-radius:10px; text-decoration:none; font-size:11px; font-weight:700;"
              title="Appeler"
            >
              <span>📞</span>
            </a>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setActivePinId(r.id);
        setSelectedOsmRestaurant(null);
        map.panTo([r.coords.lat, r.coords.lng], { animate: true, duration: 0.5 });
      });

      partnerMarkersRef.current[r.id] = marker;
      newPartnerMarkers.push(marker);
    });

    if (clusterGroupRef.current) {
      clusterGroupRef.current.addLayers(newPartnerMarkers);
    } else {
      newPartnerMarkers.forEach((m) => m.addTo(map));
    }
  }, [
    filteredPartnerRestaurants,
    activePinId,
    selectedAllergens,
    refLat,
    refLng,
  ]);

  // Keep active pin valid
  useEffect(() => {
    if (activePinId && !activePinId.startsWith('osm-')) {
      const stillPresent = filteredPartnerRestaurants.some((r) => r.id === activePinId);
      if (!stillPresent) {
        setActivePinId(filteredPartnerRestaurants[0]?.id || null);
      }
    }
  }, [filteredPartnerRestaurants, activePinId]);

  // Render User Marker
  const renderUserMarker = useCallback(
    (lat: number, lng: number, accuracy?: number, openPopupNow = false) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (userCircleRef.current) {
        userCircleRef.current.remove();
        userCircleRef.current = null;
      }

      const userHtml = `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-9 h-9 rounded-full bg-blue-500/35 animate-ping"></span>
          <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
            <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
          </div>
        </div>
      `;
      const userIcon = L.divIcon({
        className: 'user-geo-marker',
        html: userHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 2000 }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif; min-width:160px; padding:3px 2px;">
          <div style="font-size:10px; font-weight:800; color:#2563eb; margin-bottom:2px;">📍 VOTRE POSITION EN DIRECT</div>
          <strong style="font-size:13px; color:#1e293b; display:block;">Vous êtes ici</strong>
          ${
            accuracy
              ? `<small style="color:#64748b; font-size:10px; display:block; margin-top:2px;">Précision : ~${Math.round(
                  accuracy
                )}m</small>`
              : ''
          }
        </div>
      `);

      if (openPopupNow) {
        marker.openPopup();
      }

      userMarkerRef.current = marker;

      if (accuracy && accuracy < 600) {
        const circle = L.circle([lat, lng], {
          radius: Math.max(accuracy, 30),
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.12,
          weight: 1,
        }).addTo(map);
        userCircleRef.current = circle;
      }
    },
    []
  );

  // Sync user marker when userCoords updates
  const prevCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!userCoords || !mapInstanceRef.current) return;
    const prev = prevCoordsRef.current;
    if (
      !prev ||
      Math.abs(prev.lat - userCoords.lat) > 0.0001 ||
      Math.abs(prev.lng - userCoords.lng) > 0.0001
    ) {
      prevCoordsRef.current = { lat: userCoords.lat, lng: userCoords.lng };
      renderUserMarker(userCoords.lat, userCoords.lng);
    }
  }, [userCoords, renderUserMarker]);

  // Locate Me Handler
  const handleLocateMe = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setIsLocating(true);
    setLocationStatus('locating');

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setIsLocating(false);
      setLocationStatus('error');
      if (userCoords) {
        map.flyTo([userCoords.lat, userCoords.lng], 16, { duration: 1.2 });
        renderUserMarker(userCoords.lat, userCoords.lng, 50, true);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setIsLocating(false);
        setLocationStatus('located');

        renderUserMarker(latitude, longitude, accuracy, true);

        map.flyTo([latitude, longitude], 16, {
          duration: 1.2,
        });

        onRequestGeolocation();

        if (onShowToast) {
          onShowToast('Position GPS actualisée avec succès ! 📍');
        }

        setTimeout(() => {
          if (enableOsmDiscovery) {
            chercherRestaurantsOsm();
          }
        }, 800);
      },
      (error) => {
        console.warn('Geolocation failed:', error);
        setIsLocating(false);
        setLocationStatus('error');

        if (userCoords && map) {
          map.flyTo([userCoords.lat, userCoords.lng], 15, { duration: 1.2 });
          renderUserMarker(userCoords.lat, userCoords.lng, undefined, true);
        }
        onRequestGeolocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, [userCoords, onRequestGeolocation, enableOsmDiscovery, chercherRestaurantsOsm, renderUserMarker, onShowToast]);

  const handleFitAllRestaurants = () => {
    if (!mapInstanceRef.current || restaurants.length === 0) return;
    const group = L.featureGroup(Object.values(partnerMarkersRef.current) as L.Layer[]);
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2));
  };

  const handleCall = (e: React.MouseEvent, phone: string, restoId: string) => {
    e.stopPropagation();
    trackPhoneCall(restoId);
    window.location.href = `tel:${phone}`;
  };

  // Active restaurant travel time
  const activeTravelTime = activePartnerRestaurant
    ? calcTravelTimes(
        calcDistanceKm(
          refLat,
          refLng,
          activePartnerRestaurant.coords.lat,
          activePartnerRestaurant.coords.lng
        )
      )
    : null;

  const totalActiveFiltersCount =
    (isOpenNowOnly ? 1 : 0) +
    (selectedRadiusKm > 0 ? 1 : 0) +
    (minRatingFilter > 0 ? 1 : 0) +
    (selectedCuisineFilter !== 'all' ? 1 : 0) +
    selectedAllergens.length +
    selectedAmenities.length;

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
    if (onShowToast) {
      const item = AMENITIES_MASTER_LIST.find((a) => a.id === amenityId);
      const isAdding = !selectedAmenities.includes(amenityId);
      onShowToast(
        isAdding
          ? `Filtre activé : ${item?.label || amenityId}`
          : `Filtre retiré : ${item?.label || amenityId}`
      );
    }
  };

  const cycleRadius = () => {
    const steps = [0, 1, 3, 5, 10];
    const currentIndex = steps.indexOf(selectedRadiusKm);
    const next = steps[(currentIndex + 1) % steps.length];
    setSelectedRadiusKm(next);
    if (onShowToast) {
      onShowToast(next === 0 ? 'Rayon : Sans restriction' : `Rayon sélectionné : ${next} km`);
    }
  };

  const resetAllFilters = () => {
    setSelectedRadiusKm(0);
    setIsOpenNowOnly(false);
    setMinRatingFilter(0);
    setSelectedCuisineFilter('all');
    setSelectedAmenities([]);
    setSelectedAllergens([]);
    if (onShowToast) {
      onShowToast('Tous les filtres de la carte ont été réinitialisés');
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-stone-200/90 shadow-xl bg-stone-100 flex flex-col md:flex-row h-auto md:h-[680px] lg:h-[700px]">
      {/* MAP CANVAS CONTAINER */}
      <div className="relative w-full h-[460px] sm:h-[500px] md:h-full md:w-7/12 lg:w-2/3 shrink-0 flex flex-col">
        {/* Leaflet map container */}
        <div ref={mapContainerRef} className="w-full h-full min-h-[460px] sm:min-h-[500px] md:min-h-full z-0" />

        {/* TOP CONTROLS & FILTER OVERLAY ON MAP */}
        <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none flex flex-col gap-2">
          {/* ROW 1: PRIMARY CONTROLS BAR */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Left: City / Count & Open Now direct */}
            <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap">
              <div className="bg-stone-900/95 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg border border-white/20">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold">Aubagne</span>
                <span className="text-stone-400">•</span>
                <span className="text-amber-300 font-mono text-[11px] font-bold">
                  {filteredPartnerRestaurants.length}
                  {filteredPartnerRestaurants.length !== restaurants.length && ` / ${restaurants.length}`}
                </span>
              </div>

              {/* Quick Toggle: Ouvert maintenant 🟢 */}
              <button
                type="button"
                onClick={() => {
                  setIsOpenNowOnly((prev) => !prev);
                  if (onShowToast) {
                    onShowToast(!isOpenNowOnly ? 'Filtre : Ouverts maintenant 🟢' : 'Tous les horaires affichés');
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
                  isOpenNowOnly
                    ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400/40'
                    : 'bg-white/95 hover:bg-white text-stone-800 border-stone-200'
                }`}
                title="Afficher uniquement les restaurants ouverts actuellement"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Ouvert direct</span>
              </button>
            </div>

            {/* Right: Full Filters Drawer Toggle & Map Utilities */}
            <div className="pointer-events-auto flex items-center gap-1.5">
              {/* Full Filter Drawer Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFilterPanelOpen((prev) => !prev)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
                  totalActiveFiltersCount > 0
                    ? 'bg-amber-400 text-stone-950 border-amber-300 font-extrabold ring-2 ring-amber-400/40 shadow-amber-400/30'
                    : isFilterPanelOpen
                    ? 'bg-stone-900 text-white border-stone-800'
                    : 'bg-white/95 hover:bg-white text-stone-800 border-stone-200'
                }`}
                title="Ouvrir le panneau complet des filtres (Rayon, terrasse, parking, allergènes, cuisines, notes)"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#99281a]" />
                <span>Tous les filtres</span>
                {totalActiveFiltersCount > 0 && (
                  <span className="w-4.5 h-4.5 rounded-full bg-stone-900 text-amber-300 text-[10px] font-black flex items-center justify-center shrink-0">
                    {totalActiveFiltersCount}
                  </span>
                )}
              </button>

              {/* Map Style Selector Switcher (Standard, Dark, Satellite) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStylePickerOpen((prev) => !prev)}
                  className="px-2.5 py-1.5 bg-white/95 hover:bg-white text-stone-800 rounded-full shadow-md transition border border-stone-200 cursor-pointer active:scale-95 text-xs font-bold flex items-center gap-1"
                  title="Changer le fond de carte (Standard, Sombre, Satellite)"
                >
                  <span>{MAP_STYLES[currentMapStyle].icon}</span>
                  <span className="hidden sm:inline">{MAP_STYLES[currentMapStyle].label}</span>
                </button>

                {isStylePickerOpen && (
                  <div className="absolute right-0 top-10 z-30 bg-white/98 backdrop-blur-md rounded-2xl border border-stone-200 shadow-xl p-1.5 w-44 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Fond de carte
                    </div>
                    {(['standard', 'dark', 'satellite'] as MapStyleType[]).map((styleKey) => {
                      const st = MAP_STYLES[styleKey];
                      const isSelected = currentMapStyle === styleKey;
                      return (
                        <button
                          key={styleKey}
                          type="button"
                          onClick={() => handleChangeMapStyle(styleKey)}
                          className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? 'bg-[#99281a] text-white shadow-xs font-bold'
                              : 'hover:bg-stone-100 text-stone-700'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{st.icon}</span>
                            <span>{st.label}</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Locate Me */}
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className={`px-2.5 py-1.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
                  locationStatus === 'located'
                    ? 'bg-blue-50 text-blue-900 border-blue-300 ring-2 ring-blue-400/20'
                    : 'bg-white/95 hover:bg-white text-stone-800 border-stone-200'
                }`}
                title="Centrer la carte sur ma position actuelle (GPS en direct)"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                ) : (
                  <LocateFixed
                    className={`w-3.5 h-3.5 ${
                      locationStatus === 'located' ? 'text-blue-600' : 'text-[#99281a]'
                    }`}
                  />
                )}
                <span className="hidden sm:inline">GPS</span>
              </button>

              {/* Fit All */}
              <button
                type="button"
                onClick={handleFitAllRestaurants}
                className="p-1.5 bg-white/95 hover:bg-white text-stone-800 rounded-full shadow-md hover:shadow-lg transition border border-stone-200 cursor-pointer active:scale-95"
                title="Voir tous les partenaires d'un coup"
              >
                <Layers className="w-4 h-4 text-stone-700" />
              </button>
            </div>
          </div>

          {/* ROW 2: QUICK-FILTER HORIZONTAL STRIP (INTEGRATED DIRECTLY ON MAP) */}
          <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            {/* Quick Radius cycle pill */}
            <button
              type="button"
              onClick={cycleRadius}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md transition flex items-center gap-1 border shrink-0 cursor-pointer active:scale-95 ${
                selectedRadiusKm > 0
                  ? 'bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-white/95 hover:bg-white text-stone-700 border-stone-200'
              }`}
              title="Cliquer pour changer le rayon de distance (1km, 3km, 5km, 10km, Tous)"
            >
              <Compass className={`w-3 h-3 ${selectedRadiusKm > 0 ? 'text-stone-950' : 'text-amber-600'}`} />
              <span>Rayon : {selectedRadiusKm === 0 ? 'Tous' : `${selectedRadiusKm} km`}</span>
            </button>

            {/* Quick Amenities direct toggles */}
            {AMENITIES_MASTER_LIST.map((amenity) => {
              const isActive = selectedAmenities.includes(amenity.id);
              return (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md transition flex items-center gap-1 border shrink-0 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-stone-900 text-white border-stone-800 ring-2 ring-stone-900/30'
                      : 'bg-white/95 hover:bg-white text-stone-700 border-stone-200'
                  }`}
                  title={`Filtrer par ${amenity.label}`}
                >
                  <span>{amenity.emoji}</span>
                  <span>{amenity.shortLabel}</span>
                  {isActive && <Check className="w-2.5 h-2.5 text-amber-400 ml-0.5" />}
                </button>
              );
            })}

            {/* Quick Rating 4.5+ ★ toggle */}
            <button
              type="button"
              onClick={() => setMinRatingFilter((prev) => (prev >= 4.5 ? 0 : 4.5))}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md transition flex items-center gap-1 border shrink-0 cursor-pointer active:scale-95 ${
                minRatingFilter >= 4.5
                  ? 'bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-white/95 hover:bg-white text-stone-700 border-stone-200'
              }`}
              title="Filtrer les restaurants notés 4.5+ étoiles"
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>4.5+ ★</span>
            </button>

            {/* Allergens active indicator chip if present */}
            {selectedAllergens.length > 0 && (
              <span className="bg-rose-600 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-md border border-rose-500 flex items-center gap-1 shrink-0">
                <ShieldAlert className="w-3 h-3 text-white" />
                <span>{selectedAllergens.length} allergène(s) exclu(s)</span>
                <button
                  type="button"
                  onClick={() => setSelectedAllergens([])}
                  className="hover:bg-rose-700 rounded-full p-0.5 cursor-pointer ml-0.5"
                  title="Effacer le filtre allergènes"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </span>
            )}

            {/* Reset All pill when at least 1 filter is active */}
            {totalActiveFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="bg-white/95 hover:bg-white text-rose-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md border border-rose-200 flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition"
                title="Effacer tous les filtres d'un coup"
              >
                <RotateCcw className="w-2.5 h-2.5 text-rose-600" />
                <span>Effacer tout</span>
              </button>
            )}
          </div>
        </div>

        {/* FULL SLIDE-OVER FILTER DRAWER (ANCHORED & NEVER CLIPPED) */}
        {isFilterPanelOpen && (
          <>
            {/* Backdrop over map canvas */}
            <div
              className="absolute inset-0 bg-stone-950/40 backdrop-blur-xs z-30 transition-opacity"
              onClick={() => setIsFilterPanelOpen(false)}
            />

            {/* Slide-over Drawer Panel */}
            <div className="absolute left-0 top-0 bottom-0 w-full sm:w-[380px] md:w-[410px] z-40 bg-white/98 backdrop-blur-md shadow-2xl border-r border-stone-200/90 flex flex-col animate-in slide-in-from-left duration-200">
              {/* STICKY DRAWER HEADER */}
              <div className="p-4 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-xs">
                    <Filter className="w-4.5 h-4.5 text-stone-950" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Filtres Provence & Carte</span>
                      {totalActiveFiltersCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black">
                          {totalActiveFiltersCount} actif{totalActiveFiltersCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-stone-500 font-medium">
                      <strong className="text-stone-800 font-bold">{filteredPartnerRestaurants.length}</strong> restaurant{filteredPartnerRestaurants.length > 1 ? 's' : ''} correspondant{filteredPartnerRestaurants.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 flex items-center justify-center cursor-pointer transition active:scale-95"
                  title="Fermer le panneau des filtres"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* SCROLLABLE FILTER BODY (100% VISIBLE & EASY TO USE) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-stone-100 scrollbar-thin">
                {/* SECTION 1: RAYON DYNAMIQUE DE DISTANCE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-amber-600" />
                      <span>Rayon dynamique de distance</span>
                    </label>
                    {selectedRadiusKm > 0 && (
                      <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {selectedRadiusKm} km
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    Trace un cercle autour de votre position (Aubagne) et filtre instantanément les adresses accessibles.
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {RADIUS_OPTIONS.map((opt) => {
                      const isSelected = selectedRadiusKm === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSelectedRadiusKm(opt.value)}
                          className={`py-2 px-1.5 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-xs ring-2 ring-amber-400/30'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                          title={opt.badge}
                        >
                          <div>{opt.label}</div>
                          <div className="text-[9px] opacity-75 font-normal truncate mt-0.5">{opt.badge.split('~')[1] || opt.badge}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 2: COMMODITÉS & ÉQUIPEMENTS PROVENCE */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Ambiance & Équipements Provence</span>
                    </label>
                    {selectedAmenities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedAmenities([])}
                        className="text-[10px] font-bold text-stone-500 hover:text-stone-800 underline cursor-pointer"
                      >
                        Effacer ({selectedAmenities.length})
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    Critères essentiels pour profiter des beaux jours et de la chaleur d'Aubagne.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {AMENITIES_MASTER_LIST.map((amenity) => {
                      const isSelected = selectedAmenities.includes(amenity.id);
                      return (
                        <button
                          key={amenity.id}
                          type="button"
                          onClick={() => toggleAmenity(amenity.id)}
                          className={`px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer border ${
                            isSelected
                              ? 'bg-stone-900 text-white border-stone-900 shadow-xs font-bold ring-2 ring-amber-400/40'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className="text-base">{amenity.emoji}</span>
                            <span className="truncate">{amenity.label}</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: SÉCURITÉ & ALLERGÈNES À EXCLURE */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span>Sécurité & Allergènes à exclure</span>
                    </label>
                    {selectedAllergens.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setSelectedAllergens([])}
                        className="text-[10px] text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                      >
                        Effacer ({selectedAllergens.length})
                      </button>
                    ) : onOpenDietaryProfile ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsFilterPanelOpen(false);
                          onOpenDietaryProfile();
                        }}
                        className="text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-0.5 cursor-pointer underline"
                      >
                        <span>Mon profil</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : null}
                  </div>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    Masque automatiquement les restaurants n'ayant pas de plat garanti sans ces allergènes.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                    {ALLERGENS_MASTER_LIST.map((alg) => {
                      const isSelected = selectedAllergens.includes(alg.id);
                      return (
                        <button
                          key={alg.id}
                          type="button"
                          onClick={() => {
                            setSelectedAllergens((prev) =>
                              prev.includes(alg.id)
                                ? prev.filter((id) => id !== alg.id)
                                : [...prev, alg.id]
                            );
                          }}
                          className={`px-2 py-1.5 rounded-xl text-left text-[11px] font-semibold flex items-center justify-between transition cursor-pointer border ${
                            isSelected
                              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs font-bold'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                          title={alg.name}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{alg.icon}</span>
                            <span className="truncate">{alg.name.split('/')[0].trim()}</span>
                          </span>
                          {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {onOpenDietaryProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsFilterPanelOpen(false);
                        onOpenDietaryProfile();
                      }}
                      className="w-full mt-1 py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center justify-between cursor-pointer transition"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>🛡️</span>
                        <span>Enregistrer mes allergies dans « Mon Profil »</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-amber-800" />
                    </button>
                  )}
                </div>

                {/* SECTION 4: TYPE DE CUISINE & TERROIR */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-[#99281a]" />
                      <span>Cuisine & Terroir</span>
                    </label>
                    {selectedCuisineFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedCuisineFilter('all')}
                        className="text-[10px] text-stone-500 hover:text-stone-800 underline cursor-pointer"
                      >
                        Toutes
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {CUISINE_FILTER_OPTIONS.map((opt) => {
                      const isSelected = selectedCuisineFilter === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedCuisineFilter(opt.id)}
                          className={`px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer border ${
                            isSelected
                              ? 'bg-[#99281a] text-white border-[#99281a] shadow-xs font-bold'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{opt.emoji}</span>
                            <span className="truncate">{opt.label}</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 5: NOTE MINIMALE */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>Note minimale</span>
                    </label>
                    {minRatingFilter > 0 && (
                      <button
                        type="button"
                        onClick={() => setMinRatingFilter(0)}
                        className="text-[10px] text-stone-500 hover:text-stone-800 underline cursor-pointer"
                      >
                        Toutes
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {RATING_FILTER_OPTIONS.map((opt) => {
                      const isSelected = minRatingFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setMinRatingFilter(opt.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold shadow-xs'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-stone-950" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 6: HORAIRES EN DIRECT */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <div>
                        <div className="text-xs font-bold text-emerald-950">Ouvert actuellement</div>
                        <div className="text-[10px] text-emerald-800">Masquer les établissements fermés</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpenNowOnly((prev) => !prev)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${
                        isOpenNowOnly ? 'bg-emerald-600 justify-end' : 'bg-stone-300 justify-start'
                      }`}
                    >
                      <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition" />
                    </button>
                  </div>
                </div>
              </div>

              {/* STICKY DRAWER FOOTER (ALWAYS VISIBLE & NEVER HIDDEN) */}
              <div className="p-3.5 bg-stone-50/95 backdrop-blur-md border-t border-stone-200 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  disabled={totalActiveFiltersCount === 0}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer transition hover:bg-stone-200/50"
                  title="Réinitialiser tous les filtres"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Réinitialiser</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsFilterPanelOpen(false);
                    if (onShowToast) {
                      onShowToast(`Carte filtrée : ${filteredPartnerRestaurants.length} restaurant(s) affiché(s)`);
                    }
                  }}
                  className="px-4 py-2.5 bg-[#99281a] hover:bg-[#781524] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition active:scale-95 flex items-center gap-2"
                >
                  <span>Afficher ({filteredPartnerRestaurants.length})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Floating Quick Locate GPS Button (Above Leaflet Zoom) */}
        <div className="absolute bottom-24 right-3 z-10 pointer-events-auto">
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className={`w-10 h-10 rounded-2xl shadow-xl border flex items-center justify-center transition active:scale-90 cursor-pointer group ${
              locationStatus === 'located'
                ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-400/30'
                : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200/90'
            }`}
            title="Me localiser (Recentrer et zoomer automatiquement sur ma position)"
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <LocateFixed
                className={`w-5 h-5 transition-colors ${
                  locationStatus === 'located'
                    ? 'text-blue-600'
                    : 'text-stone-700 group-hover:text-blue-600'
                }`}
              />
            )}
          </button>
        </div>

        {/* Map Legend at bottom left */}
        <div className="absolute bottom-4 left-3 z-10 pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-stone-200 shadow-md text-[11px] space-y-1 hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#99281a] border border-amber-300"></span>
            <span className="text-stone-800 font-bold">Partenaire Gusto (Carte & Nutri)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-stone-700">Découverte OpenStreetMap en direct</span>
          </div>
        </div>
      </div>

      {/* SIDE PREVIEW DRAWER (DESKTOP) & SLIDE CARD (MOBILE) */}
      <div className="w-full md:w-5/12 lg:w-1/3 bg-white border-t md:border-t-0 md:border-l border-stone-200/90 flex flex-col justify-between overflow-y-auto p-4 sm:p-4.5 z-10 shadow-lg min-h-[300px] md:min-h-0">
        {/* CASE 1: SELECTED GUSTO PARTNER RESTAURANT */}
        {activePartnerRestaurant && !selectedOsmRestaurant ? (
          <div className="space-y-3.5">
            {/* Header info with photo banner */}
            <div className="relative h-36 rounded-2xl overflow-hidden shadow-sm group">
              <img
                src={activePartnerRestaurant.banner}
                alt={activePartnerRestaurant.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Status & Price tags on image */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-900/80 backdrop-blur-md text-amber-300 border border-amber-300/30">
                  {activePartnerRestaurant.cuisine}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/90 text-stone-900 border border-white/60">
                  {activePartnerRestaurant.priceRange.split(' ')[0]}
                </span>
              </div>

              {/* Live Status indicator */}
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-[11px] font-bold">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activePartnerRestaurant.openingHours.isOpenNow
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-rose-400'
                  }`}
                />
                <span>
                  {activePartnerRestaurant.openingHours.isOpenNow ? t('open') : t('closed')}
                </span>
              </div>

              {/* Gusto Recommended Badge */}
              {(activePartnerRestaurant.isGustoRecommended || (activePartnerRestaurant.rating || 4.8) >= 4.5) && (
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow-md border border-amber-200">
                  <Crown className="w-3 h-3 fill-stone-950" />
                  <span>Gusto Recommandé</span>
                </div>
              )}
            </div>

            {/* Restaurant Titles & Ratings */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-serif font-black text-stone-900 leading-tight">
                  {activePartnerRestaurant.name}
                </h3>
                {/* 5-Star Rating */}
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-amber-900 font-black text-xs shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{activePartnerRestaurant.rating || 4.8}</span>
                  <span className="text-stone-400 text-[10px] font-normal">
                    ({activePartnerRestaurant.reviewsCount || 34})
                  </span>
                </div>
              </div>
              <p className="text-xs text-stone-500 font-serif italic line-clamp-1">
                « {activePartnerRestaurant.tagline} »
              </p>
            </div>

            {/* TEMPS DE TRAJET ESTIMÉ EN DIRECT (WALKING & DRIVING) */}
            {activeTravelTime && (
              <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-2.5 flex items-center justify-between text-xs text-amber-950 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-amber-700" />
                  <span className="font-bold">{activeTravelTime.walkLabel}</span>
                </div>
                <span className="text-amber-400 font-bold">•</span>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-amber-700" />
                  <span className="font-bold">{activeTravelTime.driveLabel}</span>
                </div>
                <span className="text-[11px] font-mono text-amber-800 font-semibold">
                  ({activeTravelTime.distanceFormatted})
                </span>
              </div>
            )}

            {/* Address & Hours */}
            <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-2xl border border-stone-200/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#99281a] shrink-0 mt-0.5" />
                <span className="leading-tight">{activePartnerRestaurant.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>
                  {activePartnerRestaurant.openingHours.days} • {activePartnerRestaurant.openingHours.lunch} &{' '}
                  {activePartnerRestaurant.openingHours.dinner}
                </span>
              </div>
            </div>

            {/* Commodités & Équipements badges */}
            {activePartnerRestaurant.amenities && activePartnerRestaurant.amenities.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Commodités vérifiées à Aubagne :
                </span>
                <div className="flex flex-wrap gap-1">
                  {activePartnerRestaurant.amenities.map((amenityId) => {
                    const item = AMENITIES_MASTER_LIST.find((a) => a.id === amenityId);
                    return (
                      <span
                        key={amenityId}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 font-semibold flex items-center gap-1"
                      >
                        <span>{item?.emoji || '✨'}</span>
                        <span>{item?.shortLabel || amenityId}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Allergen Protection Banner */}
            {selectedAllergens.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-2.5 flex items-start gap-2 text-xs text-emerald-900 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-[11px] text-emerald-800">
                    Sécurité Allergènes garantie
                  </div>
                  <p className="text-[10px] text-emerald-700 leading-tight">
                    Plats certifiés sans{' '}
                    <strong className="font-bold">
                      {selectedAllergens
                        .map((a) => ALLERGENS_MASTER_LIST.find((x) => x.id === a)?.name.split('/')[0].trim() || a)
                        .join(', ')}
                    </strong>.
                  </p>
                </div>
              </div>
            )}

            {/* CONVERSION & PARTAGE ACTIONS */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={() => onSelectRestaurant(activePartnerRestaurant.id)}
                className="w-full py-2.5 bg-[#99281a] hover:bg-[#781524] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Consulter la carte & le menu complet</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-3 gap-1.5">
                {/* 1. Partager & inviter (WhatsApp/SMS ready) */}
                <button
                  type="button"
                  onClick={() => setSharingRestaurant(activePartnerRestaurant)}
                  className="py-2 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-stone-300 transition cursor-pointer"
                  title="Partager le restaurant et l'itinéraire par WhatsApp ou SMS"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate">Partager</span>
                </button>

                {/* 2. Réservation rapide WhatsApp */}
                <button
                  type="button"
                  onClick={() => {
                    openWhatsAppReservation(activePartnerRestaurant);
                    if (onShowToast) {
                      onShowToast(`Réservation WhatsApp pour ${activePartnerRestaurant.name} !`);
                    }
                  }}
                  className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-emerald-300 transition cursor-pointer"
                  title="Réserver une table en 1 clic via WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">Réserver</span>
                </button>

                {/* 3. Appeler */}
                <button
                  type="button"
                  onClick={(e) => handleCall(e, activePartnerRestaurant.phone, activePartnerRestaurant.id)}
                  className="py-2 px-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
                  title="Appel téléphonique direct"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate">Appel</span>
                </button>
              </div>
            </div>
          </div>
        ) : selectedOsmRestaurant ? (
          /* CASE 2: SELECTED OPENSTREETMAP RESTAURANT */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                  <Globe className="w-3 h-3" />
                  <span>OpenStreetMap Live</span>
                </span>
                <span className="text-[10px] text-emerald-800 font-mono font-bold">
                  #{selectedOsmRestaurant.id}
                </span>
              </div>
              <h3 className="text-xl font-serif font-black text-stone-900 leading-tight">
                {selectedOsmRestaurant.name}
              </h3>
              <p className="text-xs text-emerald-900 font-semibold">
                Cuisine : <span className="text-stone-800">{selectedOsmRestaurant.cuisine}</span>
              </p>
            </div>

            <div className="space-y-2 text-xs text-stone-600 bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span className="leading-tight">{selectedOsmRestaurant.address}</span>
              </div>
              {selectedOsmRestaurant.openingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span>{selectedOsmRestaurant.openingHours}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Non encore certifié Gusto</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Cet établissement est issu d'OpenStreetMap. Proposez son inscription officielle pour afficher son menu complet et ses valeurs nutritionnelles.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOsmRestaurant.lat},${selectedOsmRestaurant.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Itinéraire Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              {onSuggestRegistration && (
                <button
                  type="button"
                  onClick={() =>
                    onSuggestRegistration({
                      name: selectedOsmRestaurant.name,
                      address: selectedOsmRestaurant.address,
                      cuisine: selectedOsmRestaurant.cuisine,
                    })
                  }
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Inscrire ce restaurant sur Gusto</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-2">
            <MapPin className="w-8 h-8 text-stone-300" />
            <p className="text-xs">Sélectionnez une épingle sur la carte pour afficher les détails du restaurant.</p>
          </div>
        )}

        {/* CAROUSEL & ONE-CLICK SORT BAR UNDER MAP */}
        <div className="pt-3 border-t border-stone-200 mt-2">
          {/* Quick Sort Options Bar */}
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Trier le carrousel :
            </span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {MAP_SORT_OPTIONS.map((sortOpt) => {
                const isSelected = activeSort === sortOpt.id;
                return (
                  <button
                    key={sortOpt.id}
                    type="button"
                    onClick={() => setActiveSort(sortOpt.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-amber-300 shadow-2xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                    }`}
                    title={sortOpt.description}
                  >
                    <span>{sortOpt.icon}</span>
                    <span>{sortOpt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Carousel items */}
          {sortedPartnerRestaurants.length === 0 ? (
            <div className="py-2.5 px-3 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              <p className="text-xs text-stone-500 mb-1">Aucun restaurant ne correspond aux filtres.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedRadiusKm(0);
                  setIsOpenNowOnly(false);
                  setMinRatingFilter(0);
                  setSelectedCuisineFilter('all');
                  setSelectedAmenities([]);
                  setSelectedAllergens([]);
                }}
                className="text-xs bg-[#99281a] text-white font-bold px-3 py-1 rounded-xl shadow-xs hover:bg-[#781524] cursor-pointer transition"
              >
                Effacer les filtres
              </button>
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {sortedPartnerRestaurants.map((resto) => {
                const dist = calcDistanceKm(refLat, refLng, resto.coords.lat, resto.coords.lng);
                const travel = calcTravelTimes(dist);
                const isCurrent = resto.id === activePinId && !selectedOsmRestaurant;

                return (
                  <button
                    key={resto.id}
                    type="button"
                    onClick={() => {
                      setActivePinId(resto.id);
                      setSelectedOsmRestaurant(null);
                      const targetMarker = partnerMarkersRef.current[resto.id];
                      if (clusterGroupRef.current && targetMarker) {
                        clusterGroupRef.current.zoomToShowLayer(targetMarker, () => {
                          targetMarker.openPopup();
                        });
                      } else if (mapInstanceRef.current) {
                        mapInstanceRef.current.panTo([resto.coords.lat, resto.coords.lng], {
                          animate: true,
                        });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                      isCurrent
                        ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        resto.openingHours.isOpenNow ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    <span className="font-bold">{resto.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">
                      {activeSort === 'rating'
                        ? `★${resto.rating || 4.8}`
                        : activeSort === 'calories'
                        ? `${resto.avgKcal}kcal`
                        : travel.distanceFormatted}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SHARING & RESERVATION MODAL */}
      <ShareRestaurantModal
        isOpen={Boolean(sharingRestaurant)}
        restaurant={sharingRestaurant}
        onClose={() => setSharingRestaurant(null)}
        onShowToast={onShowToast || (() => {})}
      />
    </div>
  );
};
