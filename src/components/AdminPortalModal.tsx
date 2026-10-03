import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Lock,
  PlusCircle,
  LogOut,
  CheckCircle2,
  Sparkles,
  Utensils,
  Wheat,
  Flame,
  Cake,
  Wine,
  Coffee,
  FolderPlus,
  Tag,
  Layers,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  Unlock,
  Plus,
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  Camera,
  Link as LinkIcon,
  Languages,
  Crown,
  Star,
  Share2,
  Globe,
  Instagram,
  Facebook,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { Dish, Language, MenuCategory, Restaurant, RestaurantSocialLinks, RestaurantExternalLinks } from '../types';
import { I18N_DICT, ALLERGENS_MASTER_LIST } from '../data/i18n';
import { formatPrice } from '../utils/geo';
import { processImageFile } from '../utils/imageUpload';
import { calculateDishMacrosAuto, MacroCalculationResult } from '../utils/macroCalculator';
import { autoTranslateCulinary, translateCulinaryLocally } from '../utils/translator';

interface AdminPortalModalProps {
  isOpen: boolean;
  isAdmin: boolean;
  activeRestaurant: Restaurant;
  currentLang: Language;
  onLogin: (pin: string) => boolean;
  onLogout: () => void;
  onAddDish: (dish: Dish) => void;
  onUpdateDish: (dish: Dish) => void;
  onDeleteDish: (dishId: string) => void;
  onAddCategory: (category: MenuCategory) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  initialEditingDish?: Dish | null;
  onClearInitialEditingDish?: () => void;
  onOpenCreatorDashboard?: () => void;
  onToggleDishOfTheMoment?: (dishId: string | null, enabled: boolean) => void;
  onUpdateRestaurant?: (updatedRestaurant: Restaurant) => void;
  onUpdateLinks?: (socialLinks: RestaurantSocialLinks, externalLinks: RestaurantExternalLinks) => void;
}

const AVAILABLE_CATEGORY_ICONS = [
  { id: 'utensils', label: 'Couverts', icon: Utensils },
  { id: 'wheat', label: 'Céréales / Pâtes / Pizza', icon: Wheat },
  { id: 'flame', label: 'Grill / Chaud', icon: Flame },
  { id: 'wine', label: 'Boissons / Vins', icon: Wine },
  { id: 'cake', label: 'Desserts / Douceurs', icon: Cake },
  { id: 'coffee', label: 'Café & Thés', icon: Coffee },
  { id: 'sparkles', label: 'Spécialités / Chef', icon: Sparkles },
];

const QUICK_IMAGE_PRESETS = [
  {
    label: '🍕 Pizza Royale',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '🧀 4 Fromages',
    url: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '🍝 Pâtes Fraîches',
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '🥩 Grillade / Burger',
    url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '🥗 Salade Fraîche',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '🍰 Tiramisu / Dessert',
    url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '🥤 Boisson Fraîche',
    url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80',
  },
];

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  isAdmin,
  activeRestaurant,
  currentLang,
  onLogin,
  onLogout,
  onAddDish,
  onUpdateDish,
  onDeleteDish,
  onAddCategory,
  onDeleteCategory,
  onClose,
  onShowToast,
  initialEditingDish,
  onClearInitialEditingDish,
  onOpenCreatorDashboard,
  onToggleDishOfTheMoment,
  onUpdateRestaurant,
  onUpdateLinks,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  // Tabs: 'list' (view all dishes, search, edit, delete), 'moment' (manage plat du moment), 'form' (add or edit dish), 'categories', 'links'
  const [activeTab, setActiveTab] = useState<'list' | 'moment' | 'form' | 'categories' | 'links'>('list');

  // Social and external links management state
  const [linksForm, setLinksForm] = useState({
    website: activeRestaurant.externalLinks?.website || activeRestaurant.socialLinks?.website || '',
    uberEats: activeRestaurant.externalLinks?.uberEats || activeRestaurant.socialLinks?.uberEats || '',
    deliveroo: activeRestaurant.externalLinks?.deliveroo || activeRestaurant.socialLinks?.deliveroo || '',
    instagram: activeRestaurant.socialLinks?.instagram || '',
    facebook: activeRestaurant.socialLinks?.facebook || '',
    tiktok: activeRestaurant.socialLinks?.tiktok || '',
    googleMaps: activeRestaurant.externalLinks?.googleMaps || activeRestaurant.socialLinks?.googleMaps || '',
    customLabel: activeRestaurant.externalLinks?.customLabel || activeRestaurant.socialLinks?.customLabel || '',
    customUrl: activeRestaurant.externalLinks?.customUrl || activeRestaurant.socialLinks?.customUrl || '',
  });

  const [isSavingLinks, setIsSavingLinks] = useState(false);

  // Sync state whenever modal opens or activeRestaurant changes
  useEffect(() => {
    if (isOpen) {
      setLinksForm({
        website: activeRestaurant.externalLinks?.website || activeRestaurant.socialLinks?.website || '',
        uberEats: activeRestaurant.externalLinks?.uberEats || activeRestaurant.socialLinks?.uberEats || '',
        deliveroo: activeRestaurant.externalLinks?.deliveroo || activeRestaurant.socialLinks?.deliveroo || '',
        instagram: activeRestaurant.socialLinks?.instagram || '',
        facebook: activeRestaurant.socialLinks?.facebook || '',
        tiktok: activeRestaurant.socialLinks?.tiktok || '',
        googleMaps: activeRestaurant.externalLinks?.googleMaps || activeRestaurant.socialLinks?.googleMaps || '',
        customLabel: activeRestaurant.externalLinks?.customLabel || activeRestaurant.socialLinks?.customLabel || '',
        customUrl: activeRestaurant.externalLinks?.customUrl || activeRestaurant.socialLinks?.customUrl || '',
      });
    }
  }, [isOpen, activeRestaurant]);

  // Helper to format/normalize URLs
  const normalizeUrl = (key: string, val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) return '';
    if (key === 'instagram') {
      if (trimmed.startsWith('@')) {
        return `https://www.instagram.com/${trimmed.slice(1)}/`;
      }
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return `https://www.instagram.com/${trimmed}/`;
      }
    }
    if (key === 'tiktok') {
      if (trimmed.startsWith('@')) {
        return `https://www.tiktok.com/@${trimmed.slice(1)}`;
      }
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return `https://www.tiktok.com/@${trimmed}`;
      }
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && key !== 'customLabel') {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleTestLink = (key: string, url: string) => {
    if (!url) return;
    const finalUrl = normalizeUrl(key, url);
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSaveLinks = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingLinks(true);

    const cleanedWebsite = normalizeUrl('website', linksForm.website);
    const cleanedUberEats = normalizeUrl('uberEats', linksForm.uberEats);
    const cleanedDeliveroo = normalizeUrl('deliveroo', linksForm.deliveroo);
    const cleanedInstagram = normalizeUrl('instagram', linksForm.instagram);
    const cleanedFacebook = normalizeUrl('facebook', linksForm.facebook);
    const cleanedTiktok = normalizeUrl('tiktok', linksForm.tiktok);
    const cleanedGoogleMaps = normalizeUrl('googleMaps', linksForm.googleMaps);
    const cleanedCustomLabel = linksForm.customLabel.trim();
    const cleanedCustomUrl = linksForm.customUrl ? normalizeUrl('customUrl', linksForm.customUrl) : '';

    const newSocialLinks: RestaurantSocialLinks = {
      instagram: cleanedInstagram || undefined,
      facebook: cleanedFacebook || undefined,
      tiktok: cleanedTiktok || undefined,
      // Compatibility fields
      website: cleanedWebsite || undefined,
      uberEats: cleanedUberEats || undefined,
      deliveroo: cleanedDeliveroo || undefined,
      googleMaps: cleanedGoogleMaps || undefined,
      customLabel: cleanedCustomLabel || undefined,
      customUrl: cleanedCustomUrl || undefined,
    };

    const newExternalLinks: RestaurantExternalLinks = {
      website: cleanedWebsite || undefined,
      uberEats: cleanedUberEats || undefined,
      deliveroo: cleanedDeliveroo || undefined,
      googleMaps: cleanedGoogleMaps || undefined,
      customLabel: cleanedCustomLabel || undefined,
      customUrl: cleanedCustomUrl || undefined,
    };

    const updatedRestaurant: Restaurant = {
      ...activeRestaurant,
      socialLinks: newSocialLinks,
      externalLinks: newExternalLinks,
      customization: {
        ...(activeRestaurant.customization || {}),
        socialLinks: newSocialLinks,
        externalLinks: newExternalLinks,
      },
    };

    if (onUpdateLinks) {
      onUpdateLinks(newSocialLinks, newExternalLinks);
    }
    if (onUpdateRestaurant) {
      onUpdateRestaurant(updatedRestaurant);
    }
    onShowToast(`Présence en ligne et liens de commande de « ${activeRestaurant.name} » enregistrés ! 🌐`);
    setIsSavingLinks(false);
  };

  const hasAnyConfiguredLinks = Boolean(
    linksForm.website ||
    linksForm.uberEats ||
    linksForm.deliveroo ||
    linksForm.instagram ||
    linksForm.facebook ||
    linksForm.tiktok ||
    linksForm.googleMaps ||
    linksForm.customUrl
  );

  const activeLinksCount = useMemo(() => {
    let count = 0;
    if (linksForm.uberEats) count++;
    if (linksForm.deliveroo) count++;
    if (linksForm.website) count++;
    if (linksForm.instagram) count++;
    if (linksForm.facebook) count++;
    if (linksForm.tiktok) count++;
    if (linksForm.googleMaps) count++;
    if (linksForm.customUrl) count++;
    return count;
  }, [linksForm]);

  const isLinksDirty = useMemo(() => {
    const currentWeb = activeRestaurant.externalLinks?.website || activeRestaurant.socialLinks?.website || '';
    const currentUber = activeRestaurant.externalLinks?.uberEats || activeRestaurant.socialLinks?.uberEats || '';
    const currentDeli = activeRestaurant.externalLinks?.deliveroo || activeRestaurant.socialLinks?.deliveroo || '';
    const currentInsta = activeRestaurant.socialLinks?.instagram || '';
    const currentFb = activeRestaurant.socialLinks?.facebook || '';
    const currentTiktok = activeRestaurant.socialLinks?.tiktok || '';
    const currentMaps = activeRestaurant.externalLinks?.googleMaps || activeRestaurant.socialLinks?.googleMaps || '';
    const currentCustomLbl = activeRestaurant.externalLinks?.customLabel || activeRestaurant.socialLinks?.customLabel || '';
    const currentCustomUrl = activeRestaurant.externalLinks?.customUrl || activeRestaurant.socialLinks?.customUrl || '';

    return (
      linksForm.website !== currentWeb ||
      linksForm.uberEats !== currentUber ||
      linksForm.deliveroo !== currentDeli ||
      linksForm.instagram !== currentInsta ||
      linksForm.facebook !== currentFb ||
      linksForm.tiktok !== currentTiktok ||
      linksForm.googleMaps !== currentMaps ||
      linksForm.customLabel !== currentCustomLbl ||
      linksForm.customUrl !== currentCustomUrl
    );
  }, [linksForm, activeRestaurant]);

  // Login state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Dish list filtering inside admin space
  const [dishSearch, setDishSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [dishPendingDeleteId, setDishPendingDeleteId] = useState<string | null>(null);

  // Dish of the moment helpers & dedicated tab filters
  const [momentSearchQuery, setMomentSearchQuery] = useState('');
  const [momentCategoryFilter, setMomentCategoryFilter] = useState('all');

  const isMomentActive = activeRestaurant.dishOfTheMomentEnabled ?? false;
  const currentMomentDish = useMemo(() => {
    if (!activeRestaurant.dishOfTheMomentId) return null;
    return activeRestaurant.dishes.find((d) => d.id === activeRestaurant.dishOfTheMomentId) || null;
  }, [activeRestaurant.dishOfTheMomentId, activeRestaurant.dishes]);

  const handleToggleMoment = (enabled: boolean) => {
    const targetDishId = activeRestaurant.dishOfTheMomentId || activeRestaurant.dishes[0]?.id || null;
    if (onToggleDishOfTheMoment) {
      onToggleDishOfTheMoment(targetDishId, enabled);
    }
    if (enabled) {
      const found = activeRestaurant.dishes.find((d) => d.id === targetDishId);
      onShowToast(`Option Plat du Moment activée avec « ${found?.name_fr || found?.name || 'votre plat'} » ! ⭐`);
    } else {
      onShowToast('Option Plat du Moment désactivée sur la carte.');
    }
  };

  const handleSelectMomentDish = (dishId: string) => {
    if (!dishId) return;
    if (onToggleDishOfTheMoment) {
      onToggleDishOfTheMoment(dishId, true);
    }
    const found = activeRestaurant.dishes.find((d) => d.id === dishId);
    if (found) {
      onShowToast(`« ${found.name_fr || found.name} » sélectionné comme Plat du Moment (activé sur la carte) ! ⭐`);
    }
  };

  const momentFilteredDishes = useMemo(() => {
    return activeRestaurant.dishes.filter((dish) => {
      const matchesCat =
        momentCategoryFilter === 'all' || dish.categoryId === momentCategoryFilter;
      const q = momentSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        dish.name.toLowerCase().includes(q) ||
        (dish.name_fr && dish.name_fr.toLowerCase().includes(q)) ||
        (dish.description && dish.description.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [activeRestaurant.dishes, momentCategoryFilter, momentSearchQuery]);

  // Dish form state (used for both Add and Edit)
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [nameFr, setNameFr] = useState('');
  const [nameIt, setNameIt] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameEs, setNameEs] = useState('');
  const [categoryId, setCategoryId] = useState(
    activeRestaurant.categories.find((c) => c.id !== 'all')?.id || 'pizzas-tomate'
  );
  const [price, setPrice] = useState('16.00');
  const [portion, setPortion] = useState('380g');
  const [region, setRegion] = useState('Aubagne');
  const [winePairing, setWinePairing] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [image, setImage] = useState(QUICK_IMAGE_PRESETS[0].url);
  const [kcal, setKcal] = useState('720');
  const [protein, setProtein] = useState('32');
  const [carbs, setCarbs] = useState('78');
  const [fat, setFat] = useState('26');
  const [fiber, setFiber] = useState('3');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(['gluten', 'lactose']);
  const [tagsInput, setTagsInput] = useState('Artisanal, Fait Maison');
  const [isHalal, setIsHalal] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isDishOfTheMomentForm, setIsDishOfTheMomentForm] = useState(false);

  // Manual Photo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoSourceMode, setPhotoSourceMode] = useState<'file' | 'url' | 'presets'>('file');

  // Auto Macro Calculation State
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [isCalculatingMacros, setIsCalculatingMacros] = useState(false);
  const [macroCalcSummary, setMacroCalcSummary] = useState<MacroCalculationResult | null>(null);

  const handleAutoCalculateMacros = async () => {
    const textToAnalyze =
      ingredientsInput.trim() ||
      longDescription.trim() ||
      description.trim() ||
      nameFr;

    if (!textToAnalyze && !image) {
      onShowToast('Veuillez renseigner des aliments ou fournir une photo du plat.');
      return;
    }

    try {
      setIsCalculatingMacros(true);
      const res = await calculateDishMacrosAuto({
        dishName: nameFr,
        ingredients: textToAnalyze,
        image,
        portion,
      });

      setKcal(res.kcal.toString());
      setProtein(res.protein.toString());
      setCarbs(res.carbs.toString());
      setFat(res.fat.toString());
      setFiber(res.fiber.toString());
      if (res.estimatedPortion && (!portion || portion === '380g' || portion === '350g')) {
        setPortion(res.estimatedPortion);
      }
      if (res.detectedAllergens && res.detectedAllergens.length > 0) {
        setSelectedAllergens((prev) =>
          Array.from(new Set([...prev, ...res.detectedAllergens]))
        );
      }
      setMacroCalcSummary(res);
      onShowToast(
        `Macronutriments calculés avec succès : ${res.kcal} kcal (P: ${res.protein}g, G: ${res.carbs}g, L: ${res.fat}g) ! ✨`
      );
    } catch (err: any) {
      onShowToast('Erreur lors du calcul automatique des macros.');
    } finally {
      setIsCalculatingMacros(false);
    }
  };

  // Auto-Translation States
  const [isTranslatingDish, setIsTranslatingDish] = useState(false);
  const [isTranslatingCat, setIsTranslatingCat] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  const handleAutoTranslateDish = async (customName?: string) => {
    const targetName = (customName || nameFr).trim();
    if (!targetName) return;

    try {
      setIsTranslatingDish(true);
      const res = await autoTranslateCulinary({
        name: targetName,
        description: description || longDescription,
        categoryName: activeRestaurant.categories.find((c) => c.id === categoryId)?.name_fr || '',
        type: 'dish',
      });

      if (res.name_it) setNameIt(res.name_it);
      if (res.name_en) setNameEn(res.name_en);
      if (res.name_es) setNameEs(res.name_es);
      onShowToast(`Traductions générées : 🇮🇹 ${res.name_it} | 🇬🇧 ${res.name_en} | 🇪🇸 ${res.name_es || ''}`);
    } catch (err) {
      console.warn('Auto translation error', err);
    } finally {
      setIsTranslatingDish(false);
    }
  };

  const handleAutoTranslateCategory = async (customCatName?: string) => {
    const targetName = (customCatName || catNameFr).trim();
    if (!targetName) return;

    try {
      setIsTranslatingCat(true);
      const res = await autoTranslateCulinary({
        name: targetName,
        type: 'category',
      });

      if (res.name_it) setCatNameIt(res.name_it);
      if (res.name_en) setCatNameEn(res.name_en);
      if (res.name_es) setCatNameEs(res.name_es);
      onShowToast(`Catégorie traduite : 🇮🇹 ${res.name_it} | 🇬🇧 ${res.name_en} | 🇪🇸 ${res.name_es || ''}`);
    } catch (err) {
      console.warn('Auto category translation error', err);
    } finally {
      setIsTranslatingCat(false);
    }
  };

  const handleTranslateAllMenu = async () => {
    try {
      setIsTranslatingAll(true);
      let count = 0;
      for (const dish of activeRestaurant.dishes) {
        if (!dish.name_it || !dish.name_en || !dish.name_es) {
          const autoRes = translateCulinaryLocally(dish.name_fr || dish.name, dish.description, 'dish');
          const updatedDish: Dish = {
            ...dish,
            name_it: dish.name_it || autoRes.name_it,
            name_en: dish.name_en || autoRes.name_en,
            name_es: dish.name_es || autoRes.name_es,
          };
          onUpdateDish(updatedDish);
          count++;
        }
      }
      onShowToast(`Traduction automatique terminée : ${count} plat(s) mis à jour en italien et anglais ! 🌐`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslatingAll(false);
    }
  };

  const handleFormImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      const compressedDataUrl = await processImageFile(file);
      setImage(compressedDataUrl);
      onShowToast('Photo importée avec succès depuis votre appareil ! 📸');
    } catch (err: any) {
      onShowToast(err?.message || 'Erreur lors de l\'import de la photo.');
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleQuickChangeDishPhoto = async (dish: Dish, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await processImageFile(file);
      const updatedDish: Dish = { ...dish, image: compressedDataUrl };
      onUpdateDish(updatedDish);
      onShowToast(`Photo de « ${dish.name_fr || dish.name} » mise à jour avec succès ! 📸`);
    } catch (err: any) {
      onShowToast(err?.message || 'Erreur lors du traitement de l\'image.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // New Category Form State
  const [catNameFr, setCatNameFr] = useState('');
  const [catNameIt, setCatNameIt] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catNameEs, setCatNameEs] = useState('');
  const [catIcon, setCatIcon] = useState('utensils');

  // Handle external edit trigger (e.g. clicking edit from dish card)
  useEffect(() => {
    if (initialEditingDish && isOpen && isAdmin) {
      loadDishIntoForm(initialEditingDish);
      setActiveTab('form');
    }
  }, [initialEditingDish, isOpen, isAdmin]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(pinInput);
    if (success) {
      setPinError(false);
      setPinInput('');
      onShowToast('Connexion réussie à l\'espace privé restaurateur !');
    } else {
      setPinError(true);
    }
  };

  const resetDishForm = () => {
    setEditingDishId(null);
    setNameFr('');
    setNameIt('');
    setNameEn('');
    setNameEs('');
    setCategoryId(activeRestaurant.categories.find((c) => c.id !== 'all')?.id || 'pizzas-tomate');
    setPrice('16.00');
    setPortion('380g');
    setRegion('Aubagne');
    setWinePairing('');
    setDescription('');
    setLongDescription('');
    setImage(QUICK_IMAGE_PRESETS[0].url);
    setKcal('720');
    setProtein('32');
    setCarbs('78');
    setFat('26');
    setFiber('3');
    setSelectedAllergens(['gluten', 'lactose']);
    setTagsInput('Artisanal, Fait Maison');
    setIsHalal(false);
    setIsVegan(false);
    setIsDishOfTheMomentForm(false);
    setIngredientsInput('');
    setMacroCalcSummary(null);
    if (onClearInitialEditingDish) onClearInitialEditingDish();
  };

  const loadDishIntoForm = (dish: Dish) => {
    setEditingDishId(dish.id);
    setNameFr(dish.name_fr || dish.name || '');
    setNameIt(dish.name_it || '');
    setNameEn(dish.name_en || '');
    setNameEs(dish.name_es || '');
    setCategoryId(dish.categoryId || activeRestaurant.categories[0]?.id || 'all');
    setPrice(dish.price.toString());
    setPortion(dish.portion || '350g');
    setRegion(dish.region || '');
    setWinePairing(dish.winePairing || '');
    setDescription(dish.description || '');
    setLongDescription(dish.longDescription || '');
    setIngredientsInput(dish.longDescription || dish.description || '');
    setMacroCalcSummary(null);
    setImage(dish.image || QUICK_IMAGE_PRESETS[0].url);
    setKcal(dish.nutrition?.kcal ? dish.nutrition.kcal.toString() : '500');
    setProtein(dish.nutrition?.protein ? dish.nutrition.protein.toString() : '20');
    setCarbs(dish.nutrition?.carbs ? dish.nutrition.carbs.toString() : '40');
    setFat(dish.nutrition?.fat ? dish.nutrition.fat.toString() : '15');
    setFiber(dish.nutrition?.fiber ? dish.nutrition.fiber.toString() : '2');
    setSelectedAllergens(dish.allergens || []);
    setTagsInput((dish.tags || []).join(', '));
    setIsHalal(dish.isHalal === true);
    setIsVegan(dish.isVegan === true);
    setIsDishOfTheMomentForm(
      activeRestaurant.dishOfTheMomentId === dish.id &&
      (activeRestaurant.dishOfTheMomentEnabled ?? false)
    );
  };

  const handleStartAddDish = () => {
    resetDishForm();
    setActiveTab('form');
  };

  const handleStartEditDish = (dish: Dish) => {
    loadDishIntoForm(dish);
    setActiveTab('form');
  };

  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFr.trim()) {
      onShowToast('Veuillez renseigner au moins le nom du plat.');
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // Auto append halal/vegan tag if checked and not already present
    if (isHalal && !tagsArray.some((t) => t.toLowerCase() === 'halal')) {
      tagsArray.push('Halal');
    }
    if (isVegan && !tagsArray.some((t) => t.toLowerCase() === 'végétalien' || t.toLowerCase() === 'vegan')) {
      tagsArray.push('Végétalien');
    }

    // Auto-fill Italian, English, and Spanish translations if empty
    let finalNameIt = nameIt.trim();
    let finalNameEn = nameEn.trim();
    let finalNameEs = nameEs.trim();
    if (!finalNameIt || !finalNameEn || !finalNameEs) {
      const autoRes = translateCulinaryLocally(nameFr, description, 'dish');
      if (!finalNameIt) finalNameIt = autoRes.name_it;
      if (!finalNameEn) finalNameEn = autoRes.name_en;
      if (!finalNameEs) finalNameEs = autoRes.name_es || '';
    }

    const dishPayload: Dish = {
      id: editingDishId || `custom_${Date.now()}`,
      categoryId,
      name: nameFr,
      name_fr: nameFr,
      name_it: finalNameIt,
      name_en: finalNameEn,
      name_es: finalNameEs,
      price: Math.max(0.5, parseFloat(price) || 12.0),
      portion: portion.trim() || '300g',
      region: region.trim() || undefined,
      winePairing: winePairing.trim() || undefined,
      description: description.trim() || nameFr,
      longDescription: longDescription.trim() || description.trim() || undefined,
      image: image.trim() || QUICK_IMAGE_PRESETS[0].url,
      tags: tagsArray,
      nutrition: {
        kcal: parseInt(kcal, 10) || 500,
        protein: parseInt(protein, 10) || 20,
        carbs: parseInt(carbs, 10) || 40,
        fat: parseInt(fat, 10) || 15,
        fiber: parseInt(fiber, 10) || 2,
      },
      allergens: selectedAllergens,
      isHalal,
      isVegan,
    };

    if (editingDishId) {
      onUpdateDish(dishPayload);
      onShowToast(`Plat « ${nameFr} » mis à jour avec succès ! ✨`);
      if (isDishOfTheMomentForm) {
        onToggleDishOfTheMoment?.(dishPayload.id, true);
      } else if (activeRestaurant.dishOfTheMomentId === dishPayload.id && activeRestaurant.dishOfTheMomentEnabled) {
        onToggleDishOfTheMoment?.(dishPayload.id, false);
      }
    } else {
      onAddDish(dishPayload);
      onShowToast(`Nouveau plat « ${nameFr} » ajouté à la carte ! 🎉`);
      if (isDishOfTheMomentForm) {
        onToggleDishOfTheMoment?.(dishPayload.id, true);
      }
    }

    resetDishForm();
    setActiveTab('list');
  };

  const handleConfirmDeleteDish = (dish: Dish) => {
    onDeleteDish(dish.id);
    setDishPendingDeleteId(null);
    onShowToast(`Plat « ${dish.name_fr || dish.name} » supprimé de la carte.`);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameFr.trim()) return;

    const slug = catNameFr
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Auto-fill Italian, English, and Spanish translations if empty
    let finalCatIt = catNameIt.trim();
    let finalCatEn = catNameEn.trim();
    let finalCatEs = catNameEs.trim();
    if (!finalCatIt || !finalCatEn || !finalCatEs) {
      const autoRes = translateCulinaryLocally(catNameFr, '', 'category');
      if (!finalCatIt) finalCatIt = autoRes.name_it;
      if (!finalCatEn) finalCatEn = autoRes.name_en;
      if (!finalCatEs) finalCatEs = autoRes.name_es || '';
    }

    const newCategory: MenuCategory = {
      id: `${slug || 'cat'}_${Date.now()}`,
      name: catNameFr,
      name_fr: catNameFr,
      name_it: finalCatIt,
      name_en: finalCatEn,
      name_es: finalCatEs,
      iconName: catIcon,
    };

    onAddCategory(newCategory);
    onShowToast(`Catégorie « ${catNameFr} » créée avec succès !`);
    setCatNameFr('');
    setCatNameIt('');
    setCatNameEn('');
    setCatNameEs('');
    setCategoryId(newCategory.id);
  };

  const toggleAllergen = (id: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Filtered dishes for list tab
  const filteredDishes = useMemo(() => {
    let list = activeRestaurant.dishes;
    if (selectedCategoryFilter !== 'all') {
      list = list.filter((d) => d.categoryId === selectedCategoryFilter);
    }
    if (dishSearch.trim()) {
      const q = dishSearch.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.name_fr && d.name_fr.toLowerCase().includes(q)) ||
          (d.description && d.description.toLowerCase().includes(q)) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeRestaurant.dishes, selectedCategoryFilter, dishSearch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-stone-300 w-full max-w-4xl rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[94vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition cursor-pointer z-10"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isAdmin ? (
          /* =========================================================================
             LOGIN FORM - SIMPLE, SECURE PASSWORD / PIN SYSTEM
             ========================================================================= */
          <div className="space-y-5 text-center py-6 max-w-sm mx-auto w-full my-auto overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#99281a] flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                {t('adminModalTitle')}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Espace restaurateur •{' '}
                <strong className="text-stone-800 font-semibold">
                  {activeRestaurant.name}
                </strong>
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  autoFocus
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-300 rounded-2xl pl-11 pr-11 py-3 text-center text-stone-900 text-lg font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#99281a] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/60 transition cursor-pointer"
                  title={showPin ? 'Masquer' : 'Afficher'}
                  aria-label={showPin ? 'Masquer' : 'Afficher'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {pinError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center justify-center gap-1.5 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{t('adminError')}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-2xl text-xs transition cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#99281a] hover:bg-[#781524] text-white font-bold rounded-2xl text-xs transition cursor-pointer shadow-md hover:shadow-lg"
                >
                  {t('login')}
                </button>
              </div>
            </form>

            {onOpenCreatorDashboard && (
              <div className="pt-3 border-t border-stone-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCreatorDashboard();
                  }}
                  className="text-stone-500 hover:text-stone-900 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer hover:underline"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Vous êtes le créateur du site ? Ouvrir le Dashboard Fondateur</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
             LOGGED IN - FULL MANAGEMENT INTERFACE
             ========================================================================= */
          <div className="flex flex-col h-full overflow-hidden space-y-3">
            {/* Header with restaurant info & logout */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0 pr-8 sm:pr-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 leading-tight">
                      Espace Privé • {activeRestaurant.name}
                    </h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Connecté
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Modifier, ajouter ou supprimer les plats de la carte en temps réel
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onShowToast('Déconnexion effectuée.');
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                title={t('logout')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>

            {/* NAVIGATION TABS */}
            <div className="flex rounded-2xl bg-stone-100 p-1 border border-stone-200 gap-1 shrink-0 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'list'
                    ? 'bg-white text-[#99281a] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Carte des plats ({activeRestaurant.dishes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('moment')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'moment'
                    ? 'bg-amber-400 text-stone-950 shadow-xs ring-1 ring-amber-500 font-extrabold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-amber-50'
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    activeTab === 'moment'
                      ? 'fill-stone-950 text-stone-950'
                      : isMomentActive
                      ? 'fill-amber-500 text-amber-600'
                      : 'text-stone-400'
                  }`}
                />
                <span>Plat du Moment</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${
                    isMomentActive
                      ? 'bg-stone-950 text-amber-300'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {isMomentActive ? 'Actif' : 'Off'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleStartAddDish}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'form'
                    ? 'bg-white text-[#99281a] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {editingDishId ? (
                  <>
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Modifier un plat</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Ajouter un plat</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'bg-white text-[#99281a] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Catégories ({activeRestaurant.categories.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('links')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap relative ${
                  activeTab === 'links'
                    ? 'bg-white text-[#99281a] shadow-xs ring-1 ring-[#99281a]/20'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Réseaux & Liens</span>
                {activeLinksCount > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                    {activeLinksCount}
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                )}
                {isLinksDirty && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Modifications non enregistrées"></span>
                )}
              </button>
            </div>

            {/* TAB CONTENT (SCROLLABLE) */}
            <div className="grow overflow-y-auto no-scrollbar pr-0.5 space-y-4">
              {/* =========================================================================
                 TAB 1: DISH LIST WITH SEARCH, EDIT & DELETE CONTROLS
                 ========================================================================= */}
              {activeTab === 'list' && (
                <div className="space-y-3.5">
                  {/* SHORTCUT BANNER: RÉSEAUX SOCIAUX & COMMANDES EN LIGNE */}
                  <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                          <span>Présence en Ligne & Liens de Commande</span>
                          {hasAnyConfiguredLinks ? (
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              {activeLinksCount} lien{activeLinksCount > 1 ? 's' : ''} actif{activeLinksCount > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              À configurer
                            </span>
                          )}
                          {isLinksDirty && (
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-400 text-stone-950 font-bold border border-amber-300 animate-pulse">
                              Modifications en attente
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-stone-300 mt-0.5 truncate">
                          Gérez vos boutons Uber Eats, Deliveroo, Instagram, TikTok, Facebook et site web.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('links')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Gérer les liens</span>
                    </button>
                  </div>
                  <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-orange-500/10 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-lg shadow-xs shrink-0 ring-2 ring-amber-300">
                          ⭐
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-stone-950">
                              Option « Plat du Moment » (Recommandation du Chef)
                            </h4>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isMomentActive
                                  ? 'bg-amber-400 text-stone-950 ring-1 ring-amber-400'
                                  : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {isMomentActive ? 'Actif sur la carte' : 'Désactivé'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 mt-0.5">
                            Activez ou désactivez cette option quand vous voulez et choisissez le plat à mettre à l'honneur.
                          </p>
                        </div>
                      </div>

                      {/* TOGGLE SWITCH: ACTIVER / DÉSACTIVER */}
                      <div className="flex items-center gap-2.5 self-start sm:self-auto bg-white/90 border border-amber-200 px-3 py-1.5 rounded-xl shadow-2xs">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isMomentActive}
                            onChange={(e) => handleToggleMoment(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                        <span className="text-xs font-bold text-stone-900">
                          {isMomentActive ? 'Activé' : 'Désactivé'}
                        </span>
                      </div>
                    </div>

                    {/* SELECTOR & PREVIEW */}
                    <div className="pt-2.5 border-t border-amber-200/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs font-bold text-stone-800 whitespace-nowrap">
                          Plat sélectionné :
                        </span>
                        <select
                          value={activeRestaurant.dishOfTheMomentId || ''}
                          onChange={(e) => handleSelectMomentDish(e.target.value)}
                          className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs grow max-w-md cursor-pointer"
                        >
                          <option value="">-- Choisir un plat de la carte --</option>
                          {activeRestaurant.dishes.map((dish) => (
                            <option key={dish.id} value={dish.id}>
                              {dish.name_fr || dish.name} ({formatPrice(dish.price)})
                            </option>
                          ))}
                        </select>
                      </div>

                      {currentMomentDish && (
                        <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-2.5 py-1.5 shadow-2xs shrink-0">
                          <img
                            src={currentMomentDish.image}
                            alt={currentMomentDish.name_fr || currentMomentDish.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div className="text-[11px] leading-tight">
                            <span className="font-bold text-stone-900 block truncate max-w-[150px]">
                              {currentMomentDish.name_fr || currentMomentDish.name}
                            </span>
                            <span className="text-stone-500 font-mono text-[10px]">
                              {formatPrice(currentMomentDish.price)} • {currentMomentDish.nutrition?.kcal} kcal
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top bar: Quick search + Add button */}
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                    <div className="relative grow max-w-md">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={dishSearch}
                        onChange={(e) => setDishSearch(e.target.value)}
                        placeholder="Rechercher un plat à modifier ou supprimer..."
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                      />
                      {dishSearch && (
                        <button
                          onClick={() => setDishSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleTranslateAllMenu}
                        disabled={isTranslatingAll}
                        className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#8a3311] border border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-60"
                        title="Traduire automatiquement tous les plats et menus de la carte en italien et anglais"
                      >
                        <Languages className="w-3.5 h-3.5 text-amber-700" />
                        <span>{isTranslatingAll ? 'Traduction...' : '✨ Traduire la carte (IT/EN)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStartAddDish}
                        className="px-3.5 py-2 rounded-xl bg-[#99281a] hover:bg-[#781524] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nouveau plat</span>
                      </button>
                    </div>
                  </div>

                  {/* Category Pills Filter */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryFilter('all')}
                      className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap transition cursor-pointer ${
                        selectedCategoryFilter === 'all'
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                      }`}
                    >
                      Toutes ({activeRestaurant.dishes.length})
                    </button>
                    {activeRestaurant.categories
                      .filter((c) => c.id !== 'all')
                      .map((cat) => {
                        const count = activeRestaurant.dishes.filter(
                          (d) => d.categoryId === cat.id
                        ).length;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategoryFilter(cat.id)}
                            className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                              selectedCategoryFilter === cat.id
                                ? 'bg-[#99281a] text-white'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                            }`}
                          >
                            <span>{cat.name_fr || cat.name}</span>
                            <span className="opacity-75">({count})</span>
                          </button>
                        );
                      })}
                  </div>

                  {/* Dishes Table / Cards */}
                  {filteredDishes.length === 0 ? (
                    <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200 p-6 space-y-2">
                      <Utensils className="w-8 h-8 text-stone-300 mx-auto" />
                      <p className="text-sm font-semibold text-stone-700">
                        Aucun plat ne correspond à votre recherche.
                      </p>
                      <p className="text-xs text-stone-500">
                        Vous pouvez ajouter un nouveau plat via le bouton ci-dessus.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredDishes.map((dish) => {
                        const cat = activeRestaurant.categories.find(
                          (c) => c.id === dish.categoryId
                        );
                        const isPendingDelete = dishPendingDeleteId === dish.id;

                        return (
                          <div
                            key={dish.id}
                            className={`p-3 rounded-2xl border transition-all ${
                              isPendingDelete
                                ? 'bg-rose-50/80 border-rose-300'
                                : 'bg-stone-50/70 hover:bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Left: Thumbnail & Details */}
                              <div className="flex items-start sm:items-center gap-3 min-w-0">
                                <div className="relative group/thumb shrink-0">
                                  <img
                                    src={dish.image}
                                    alt={dish.name}
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-stone-200 bg-stone-200"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        QUICK_IMAGE_PRESETS[0].url;
                                    }}
                                  />
                                  <label
                                    className="absolute inset-0 bg-stone-900/70 rounded-xl opacity-0 group-hover/thumb:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold transition-opacity cursor-pointer"
                                    title="Changer la photo manuellement"
                                  >
                                    <Camera className="w-4 h-4 text-white drop-shadow mb-0.5" />
                                    <span>Changer</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleQuickChangeDishPhoto(dish, e)}
                                    />
                                  </label>
                                </div>

                                <div className="min-w-0 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                                      {dish.name_fr || dish.name}
                                    </h4>
                                    {cat && (
                                      <span className="bg-stone-200/80 text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                        {cat.name_fr || cat.name}
                                      </span>
                                    )}
                                    {dish.isHalal && (
                                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                        Halal 🥩
                                      </span>
                                    )}
                                    {dish.isVegan && (
                                      <span className="bg-lime-100 text-lime-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                        Vegan 🥑
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[11px] text-stone-500 line-clamp-1">
                                    {dish.description}
                                  </p>

                                  <div className="flex items-center gap-3 text-[11px] text-stone-600 font-mono flex-wrap">
                                    <span className="font-bold text-stone-900">
                                      {formatPrice(dish.price)}
                                    </span>
                                    <span>• {dish.portion}</span>
                                    <span className="bg-amber-50 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
                                      {dish.nutrition?.kcal || 0} kcal
                                    </span>
                                    <span className="text-[10px] text-stone-400">
                                      P: {dish.nutrition?.protein}g | G: {dish.nutrition?.carbs}g | L:{' '}
                                      {dish.nutrition?.fat}g
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Actions */}
                              {!isPendingDelete ? (
                                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                  {/* Quick Plat du Moment Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const isThisDishTheMoment = activeRestaurant.dishOfTheMomentId === dish.id;
                                      if (isThisDishTheMoment && isMomentActive) {
                                        onToggleDishOfTheMoment?.(dish.id, false);
                                        onShowToast('Option Plat du Moment désactivée.');
                                      } else {
                                        onToggleDishOfTheMoment?.(dish.id, true);
                                        onShowToast(`« ${dish.name_fr || dish.name} » activé en Plat du Moment ! ⭐`);
                                      }
                                    }}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition shadow-2xs cursor-pointer ${
                                      activeRestaurant.dishOfTheMomentId === dish.id && isMomentActive
                                        ? 'bg-amber-400 text-stone-950 border border-amber-500 font-bold ring-2 ring-amber-300'
                                        : activeRestaurant.dishOfTheMomentId === dish.id
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                        : 'bg-white hover:bg-amber-50 text-stone-600 hover:text-amber-900 border border-stone-200'
                                    }`}
                                    title={
                                      activeRestaurant.dishOfTheMomentId === dish.id && isMomentActive
                                        ? 'Plat du moment actuellement actif. Cliquez pour le désactiver.'
                                        : 'Choisir ce plat comme Plat du Moment et l\'activer sur la carte'
                                    }
                                  >
                                    <Star
                                      className={`w-3.5 h-3.5 ${
                                        activeRestaurant.dishOfTheMomentId === dish.id && isMomentActive
                                          ? 'fill-stone-950 text-stone-950'
                                          : activeRestaurant.dishOfTheMomentId === dish.id
                                          ? 'fill-amber-500 text-amber-600'
                                          : 'text-stone-400'
                                      }`}
                                    />
                                    <span className="hidden lg:inline">
                                      {activeRestaurant.dishOfTheMomentId === dish.id && isMomentActive
                                        ? 'Plat du moment (Actif)'
                                        : activeRestaurant.dishOfTheMomentId === dish.id
                                        ? 'Plat du moment (Inactif)'
                                        : 'Plat du moment'}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleStartEditDish(dish)}
                                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-semibold flex items-center gap-1 transition shadow-2xs hover:border-[#99281a] hover:text-[#99281a] cursor-pointer"
                                    title="Modifier ce plat"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>Modifier</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setDishPendingDeleteId(dish.id)}
                                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 text-xs font-semibold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                                    title="Supprimer ce plat"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Supprimer</span>
                                  </button>
                                </div>
                              ) : (
                                /* Delete confirmation */
                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 bg-white p-2 rounded-xl border border-rose-300 shadow-sm shrink-0">
                                  <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                    Confirmer la suppression ?
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setDishPendingDeleteId(null)}
                                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium cursor-pointer"
                                    >
                                      Annuler
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmDeleteDish(dish)}
                                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                                    >
                                      Oui, supprimer
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                 TAB: PLAT DU MOMENT (RECOMMANDATION DU CHEF) DEDICATED PRIVATE SPACE
                 ========================================================================= */}
              {activeTab === 'moment' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Master Activation Banner */}
                  <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-orange-500/15 border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-2xl shadow-md shrink-0 ring-4 ring-amber-300/60">
                          ⭐
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-serif font-bold text-stone-950">
                              Option « Plat du Moment » (Recommandation du Chef)
                            </h3>
                            <span
                              className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isMomentActive
                                  ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-400'
                                  : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {isMomentActive ? '🟢 Activé sur la carte' : '⚪ Désactivé'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-1 max-w-xl leading-relaxed">
                            Cette option est <strong>exclusivement gérée ici dans votre espace privé</strong>. Quand elle est activée, vos clients découvrent votre plat à l'honneur avec un grand bandeau prestigieux Recommandation du Chef. Quand elle est désactivée, vos clients voient la carte normale sans aucun bandeau ni bouton.
                          </p>
                        </div>
                      </div>

                      {/* Master Switch */}
                      <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-amber-300 shadow-sm self-start sm:self-auto shrink-0">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isMomentActive}
                            onChange={(e) => handleToggleMoment(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-stone-900">
                            {isMomentActive ? 'Option Activée' : 'Option Désactivée'}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {isMomentActive ? 'Visible par les clients' : 'Invisible pour les clients'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Currently selected dish showcase */}
                    {currentMomentDish ? (
                      <div className="bg-white rounded-2xl p-4 border border-amber-300/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={currentMomentDish.image}
                            alt={currentMomentDish.name_fr || currentMomentDish.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-stone-200 shadow-xs shrink-0"
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                                Plat actuellement sélectionné
                              </span>
                              {activeRestaurant.categories.find((c) => c.id === currentMomentDish.categoryId) && (
                                <span className="bg-stone-100 text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                  {activeRestaurant.categories.find((c) => c.id === currentMomentDish.categoryId)?.name_fr ||
                                   activeRestaurant.categories.find((c) => c.id === currentMomentDish.categoryId)?.name}
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif font-bold text-sm sm:text-base text-stone-900 truncate">
                              {currentMomentDish.name_fr || currentMomentDish.name}
                            </h4>
                            <p className="text-xs text-stone-500 line-clamp-1">
                              {currentMomentDish.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs font-mono text-stone-700">
                              <span className="font-bold text-[#8a3311]">
                                {formatPrice(currentMomentDish.price)}
                              </span>
                              <span>• {currentMomentDish.portion || '350g'}</span>
                              <span>• {currentMomentDish.nutrition?.kcal || 0} kcal</span>
                              {currentMomentDish.winePairing && (
                                <span className="text-amber-800 font-sans italic flex items-center gap-1">
                                  <Wine className="w-3 h-3 text-amber-700" />
                                  {currentMomentDish.winePairing}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          {isMomentActive ? (
                            <button
                              type="button"
                              onClick={() => handleToggleMoment(false)}
                              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200 hover:border-rose-200 text-xs font-bold transition cursor-pointer"
                            >
                              Désactiver l'option
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleMoment(true)}
                              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition cursor-pointer shadow-xs"
                            >
                              Activer maintenant ⭐
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/80 rounded-2xl p-4 border border-dashed border-amber-300 text-center text-xs text-stone-600">
                        Aucun plat n'est encore sélectionné. Choisissez un plat ci-dessous pour le mettre à l'honneur.
                      </div>
                    )}
                  </div>

                  {/* Choose another dish from the restaurant catalog */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-[#99281a]" />
                          <span>Choisir le plat à mettre à l'honneur</span>
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Cliquez sur « Choisir ce plat » pour le définir instantanément comme Plat du Moment.
                        </p>
                      </div>

                      {/* Quick Search */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={momentSearchQuery}
                          onChange={(e) => setMomentSearchQuery(e.target.value)}
                          placeholder="Rechercher parmi les plats..."
                          className="w-full bg-white border border-stone-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                        {momentSearchQuery && (
                          <button
                            onClick={() => setMomentSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                      <button
                        type="button"
                        onClick={() => setMomentCategoryFilter('all')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                          momentCategoryFilter === 'all'
                            ? 'bg-stone-900 text-white'
                            : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                        }`}
                      >
                        Tous les plats ({activeRestaurant.dishes.length})
                      </button>
                      {activeRestaurant.categories.map((cat) => {
                        const count = activeRestaurant.dishes.filter((d) => d.categoryId === cat.id).length;
                        if (count === 0) return null;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setMomentCategoryFilter(cat.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                              momentCategoryFilter === cat.id
                                ? 'bg-[#99281a] text-white'
                                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                            }`}
                          >
                            {cat.name_fr || cat.name} ({count})
                          </button>
                        );
                      })}
                    </div>

                    {/* Dishes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto no-scrollbar pr-1">
                      {momentFilteredDishes.map((dish) => {
                        const isThisSelected = activeRestaurant.dishOfTheMomentId === dish.id;
                        const isThisActiveAndSelected = isThisSelected && isMomentActive;

                        return (
                          <div
                            key={dish.id}
                            className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                              isThisActiveAndSelected
                                ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300 shadow-sm'
                                : isThisSelected
                                ? 'bg-amber-50/40 border-amber-300'
                                : 'bg-white hover:bg-stone-50 border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <img
                                src={dish.image}
                                alt={dish.name_fr || dish.name}
                                className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                              />
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h5 className="font-bold text-stone-900 text-xs truncate">
                                    {dish.name_fr || dish.name}
                                  </h5>
                                  {isThisActiveAndSelected && (
                                    <span className="bg-amber-400 text-stone-950 font-black text-[9px] px-2 py-0.2 rounded-full uppercase">
                                      ⭐ En vedette
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-stone-500 line-clamp-1">
                                  {dish.description}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] font-mono text-stone-600">
                                  <span className="font-bold text-[#8a3311]">
                                    {formatPrice(dish.price)}
                                  </span>
                                  <span>• {dish.nutrition?.kcal || 0} kcal</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                              <span className="text-[10px] text-stone-400">
                                {isThisActiveAndSelected
                                  ? 'Actuellement affiché aux clients'
                                  : 'Prêt à être mis à l\'honneur'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isThisActiveAndSelected) {
                                    handleToggleMoment(false);
                                  } else {
                                    handleSelectMomentDish(dish.id);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                                  isThisActiveAndSelected
                                    ? 'bg-amber-400 hover:bg-rose-100 text-stone-950 hover:text-rose-900 border border-amber-500'
                                    : 'bg-white hover:bg-amber-50 text-stone-800 hover:text-amber-950 border border-stone-300 hover:border-amber-300'
                                }`}
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    isThisActiveAndSelected
                                      ? 'fill-stone-950 text-stone-950'
                                      : 'text-amber-500'
                                  }`}
                                />
                                <span>
                                  {isThisActiveAndSelected
                                    ? 'Désactiver'
                                    : 'Choisir ce plat ⭐'}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                 TAB 2: ADD OR EDIT DISH FORM
                 ========================================================================= */}
              {activeTab === 'form' && (
                <form onSubmit={handleSaveDish} className="space-y-4 text-xs">
                  {/* Mode Banner */}
                  <div
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                      editingDishId
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {editingDishId ? (
                        <Pencil className="w-4 h-4 text-amber-700 shrink-0" />
                      ) : (
                        <PlusCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-xs sm:text-sm block">
                          {editingDishId
                            ? `Modification du plat : ${nameFr || 'Sans titre'}`
                            : 'Création d\'un nouveau plat'}
                        </span>
                        <span className="text-[10px] opacity-80">
                          {editingDishId
                            ? 'Les changements seront répercutés instantanément sur la carte'
                            : 'Remplissez les informations ci-dessous puis enregistrez'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {editingDishId && (
                        <button
                          type="button"
                          onClick={resetDishForm}
                          className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-amber-800 text-[11px] font-semibold hover:bg-amber-100 transition cursor-pointer"
                        >
                          Passer en mode ajout
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveTab('list')}
                        className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-stone-700 text-[11px] font-semibold hover:bg-stone-100 transition cursor-pointer flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Retour liste</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 1: Names with Automatic Multilingual Translation */}
                  <div className="bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200 space-y-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/80">
                      <div className="flex items-center gap-1.5">
                        <Languages className="w-3.5 h-3.5 text-[#99281a]" />
                        <span className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                          Dénominations & Traductions automatiques
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslateDish()}
                        disabled={isTranslatingDish || !nameFr.trim()}
                        className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#8a3311] border border-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                        title="Traduire automatiquement le nom en italien et anglais avec l'IA"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isTranslatingDish ? 'Traduction en cours...' : '✨ Traduire automatiquement (IT / EN / ES)'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-stone-800 font-semibold mb-1">
                          Nom du plat (Français) *
                        </label>
                        <input
                          type="text"
                          required
                          value={nameFr}
                          onChange={(e) => setNameFr(e.target.value)}
                          onBlur={() => {
                            if (nameFr.trim() && (!nameIt.trim() || !nameEn.trim() || !nameEs.trim())) {
                              handleAutoTranslateDish();
                            }
                          }}
                          placeholder="ex: Pizza Napolitaine Cantadora"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a] font-medium"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-stone-800 font-semibold">
                            Nom (Italien / VO)
                          </label>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono font-medium">
                            Auto 🇮🇹
                          </span>
                        </div>
                        <input
                          type="text"
                          value={nameIt}
                          onChange={(e) => setNameIt(e.target.value)}
                          placeholder="ex: Pizza Napoletana"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-stone-800 font-semibold">
                            Nom (Anglais)
                          </label>
                          <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-mono font-medium">
                            Auto 🇬🇧
                          </span>
                        </div>
                        <input
                          type="text"
                          value={nameEn}
                          onChange={(e) => setNameEn(e.target.value)}
                          placeholder="ex: Neapolitan Cantadora Pizza"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-stone-800 font-semibold">
                            Nom (Espagnol)
                          </label>
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-mono font-medium">
                            Auto 🇪🇸
                          </span>
                        </div>
                        <input
                          type="text"
                          value={nameEs}
                          onChange={(e) => setNameEs(e.target.value)}
                          placeholder="ex: Pizza Napolitana Cantadora"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Category, Price, Portion */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-stone-800 font-semibold mb-1">
                        Catégorie *
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-medium focus:outline-none text-xs"
                      >
                        {activeRestaurant.categories
                          .filter((c) => c.id !== 'all')
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name_fr || c.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-800 font-semibold mb-1">
                        Prix (€) *
                      </label>
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-800 font-semibold mb-1">
                        Portion (g ou cl)
                      </label>
                      <input
                        type="text"
                        value={portion}
                        onChange={(e) => setPortion(e.target.value)}
                        placeholder="ex: 380g ou 33cl"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 3: Descriptions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-800 font-semibold mb-1">
                        Description courte (Ingrédients) *
                      </label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Sauce tomate mijotée, mozzarella cantadora, basilic frais..."
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-800 font-semibold mb-1">
                        Histoire & Description détaillée (Optionnel)
                      </label>
                      <textarea
                        rows={2}
                        value={longDescription}
                        onChange={(e) => setLongDescription(e.target.value)}
                        placeholder="Recette traditionnelle au four à bois transmise depuis des générations..."
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 4: Photo du plat - Manuel (Fichier / Galerie / Caméra), URL ou Modèles */}
                  <div className="space-y-3 bg-stone-50/90 p-4 rounded-3xl border border-stone-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
                      <div className="flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#99281a]" />
                        <span className="text-stone-900 font-bold text-xs">
                          Photo du plat
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] bg-stone-200/70 p-0.5 rounded-xl border border-stone-300/60">
                        <button
                          type="button"
                          onClick={() => setPhotoSourceMode('file')}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                            photoSourceMode === 'file'
                              ? 'bg-white text-[#99281a] shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <Upload className="w-3 h-3" />
                          <span>Mon Appareil / Fichier</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoSourceMode('url')}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                            photoSourceMode === 'url'
                              ? 'bg-white text-[#99281a] shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>Lien URL</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoSourceMode('presets')}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                            photoSourceMode === 'presets'
                              ? 'bg-white text-[#99281a] shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Modèles</span>
                        </button>
                      </div>
                    </div>

                    {/* Mode 1: File / Camera upload */}
                    {photoSourceMode === 'file' && (
                      <div className="space-y-3">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-stone-300 hover:border-[#99281a] bg-white rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition hover:bg-amber-50/20 group"
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFormImageUpload}
                            className="hidden"
                          />
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 group-hover:bg-[#99281a]/10 text-[#99281a] flex items-center justify-center mx-auto mb-2 transition">
                            <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          </div>
                          <p className="text-xs font-bold text-stone-800">
                            Cliquez pour importer une photo manuellement
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Depuis votre galerie, vos dossiers ou appareil photo (JPG, PNG, WebP)
                          </p>
                          <span className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 bg-stone-100 group-hover:bg-[#99281a] text-stone-700 group-hover:text-white rounded-xl text-[11px] font-bold transition shadow-2xs">
                            <Camera className="w-3.5 h-3.5" />
                            <span>{isUploadingPhoto ? 'Importation en cours...' : 'Choisir une photo sur cet appareil'}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Mode 2: Manual URL */}
                    {photoSourceMode === 'url' && (
                      <div className="space-y-2">
                        <label className="text-[11px] text-stone-600 font-medium block">
                          Saisissez l'adresse URL directe de la photo (ex: Unsplash, Pexels, etc.) :
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="https://images.unsplash.com/... ou https://..."
                            className="grow bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a] text-xs font-mono"
                          />
                          {image && (
                            <button
                              type="button"
                              onClick={() => setImage('')}
                              className="px-3 py-2 bg-stone-200 hover:bg-stone-300 rounded-xl text-stone-700 text-xs font-semibold cursor-pointer shrink-0"
                            >
                              Effacer
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mode 3: Presets */}
                    {photoSourceMode === 'presets' && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-stone-500 block">
                          Sélectionnez une photo de notre collection gastronomique :
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {QUICK_IMAGE_PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setImage(preset.url)}
                              className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                                image === preset.url
                                  ? 'bg-[#99281a] text-white border-[#99281a] shadow-xs'
                                  : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-200'
                              }`}
                            >
                              <img
                                src={preset.url}
                                alt={preset.label}
                                className="w-8 h-8 rounded-lg object-cover shrink-0"
                              />
                              <span className="text-[11px] font-bold truncate">
                                {preset.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image Preview Card */}
                    {image && (
                      <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={image}
                            alt="Aperçu sélectionné"
                            className="w-14 h-14 rounded-xl object-cover border border-stone-300 bg-stone-100 shrink-0 shadow-2xs"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = QUICK_IMAGE_PRESETS[0].url;
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-stone-800 block truncate">
                              Photo active du plat
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                {image.startsWith('data:') ? 'Photo manuelle importée (stockée localement)' : 'Lien URL valide'}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5 text-[#99281a]" />
                            <span>Remplacer</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 5: Region & Wine pairing & Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-stone-800 font-semibold mb-1">
                        Origine / Terroir
                      </label>
                      <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        placeholder="ex: Aubagne / Provence"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-800 font-semibold mb-1">
                        Accord Mets & Vins
                      </label>
                      <input
                        type="text"
                        value={winePairing}
                        onChange={(e) => setWinePairing(e.target.value)}
                        placeholder="ex: Bandol Rosé ou Chianti Classico"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-800 font-semibold mb-1">
                        Badges / Tags (séparés par virgule)
                      </label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="Bestseller, Four à bois, Fait Maison"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 6: Dietary & Highlight options (Halal, Vegan, Plat du Moment) */}
                  <div className="flex flex-wrap gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isHalal}
                        onChange={(e) => setIsHalal(e.target.checked)}
                        className="w-4 h-4 rounded text-[#99281a] focus:ring-[#99281a]"
                      />
                      <span className="font-semibold text-stone-800">
                        🥩 Certifié / Conforme Halal
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isVegan}
                        onChange={(e) => setIsVegan(e.target.checked)}
                        className="w-4 h-4 rounded text-[#99281a] focus:ring-[#99281a]"
                      />
                      <span className="font-semibold text-stone-800">
                        🥑 100% Végétalien (Vegan)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                      <input
                        type="checkbox"
                        checked={isDishOfTheMomentForm}
                        onChange={(e) => setIsDishOfTheMomentForm(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="font-bold text-amber-950 flex items-center gap-1 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                        <span>Mettre en Plat du Moment (Recommandation du Chef)</span>
                      </span>
                    </label>
                  </div>

                  {/* Row 7: Automatic Macro Calculation (Photo + Aliments) */}
                  <div className="p-3.5 bg-gradient-to-br from-amber-50/70 via-stone-50 to-amber-50/40 rounded-2xl border border-amber-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                          Calcul automatique des macros (Photo + Aliments)
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full font-bold">
                        IA Vision & Nutrition
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 leading-snug">
                      Saisissez les aliments du plat ci-dessous. Le système s'appuie sur <strong>la photo du plat</strong> et vos aliments pour calculer automatiquement les calories, protéines, glucides, lipides et fibres.
                    </p>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Aliments & Ingrédients du plat :
                      </label>
                      <textarea
                        rows={2}
                        value={ingredientsInput}
                        onChange={(e) => setIngredientsInput(e.target.value)}
                        placeholder="Ex : 180g steak de bœuf grillé, 150g frites maison, 40g sauce béarnaise, salade verte..."
                        className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                      <button
                        type="button"
                        onClick={handleAutoCalculateMacros}
                        disabled={isCalculatingMacros}
                        className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#8a3311] to-[#781524] hover:brightness-110 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
                      >
                        {isCalculatingMacros ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Calcul des macros en cours...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Calculer automatiquement les macros</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1 flex-wrap text-[10px]">
                        <span className="text-stone-400 font-medium">Suggestions :</span>
                        {['180g steak', '150g frites', '200g riz', '150g saumon', 'pain burger'].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() =>
                              setIngredientsInput((prev) =>
                                prev.trim() ? `${prev.trim()}, ${chip}` : chip
                              )
                            }
                            className="px-1.5 py-0.5 rounded bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 transition cursor-pointer"
                          >
                            +{chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Summary of calculation if available */}
                    {macroCalcSummary && (
                      <div className="mt-2 p-2.5 bg-white rounded-xl border border-emerald-200 text-xs space-y-1.5 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Macronutriments calculés et pré-remplis !
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            Portion estimée : {macroCalcSummary.estimatedPortion}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600">
                          {macroCalcSummary.explanation}
                        </p>
                        {macroCalcSummary.items && macroCalcSummary.items.length > 0 && (
                          <div className="text-[10px] text-stone-500 flex flex-wrap gap-x-2.5 gap-y-0.5 pt-1 border-t border-stone-100 font-mono">
                            {macroCalcSummary.items.map((item, idx) => (
                              <span key={idx}>
                                • <strong>{item.name}</strong> ({item.estimatedWeight || ''}): {item.kcal} kcal (P:{item.protein}g, G:{item.carbs}g, L:{item.fat}g)
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Row 8: Nutritional Macros Inputs (Values filled or adjusted) */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <span className="font-bold text-stone-800 block text-[11px] uppercase tracking-wider">
                      Macronutriments & Calories (Par portion)
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                      <div>
                        <span className="text-[10px] text-stone-500 block">Kcal</span>
                        <input
                          type="number"
                          value={kcal}
                          onChange={(e) => setKcal(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-center font-bold text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">Prot. (g)</span>
                        <input
                          type="number"
                          value={protein}
                          onChange={(e) => setProtein(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-center font-bold text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">Gluc. (g)</span>
                        <input
                          type="number"
                          value={carbs}
                          onChange={(e) => setCarbs(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-center font-bold text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">Lip. (g)</span>
                        <input
                          type="number"
                          value={fat}
                          onChange={(e) => setFat(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-center font-bold text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">Fibres (g)</span>
                        <input
                          type="number"
                          value={fiber}
                          onChange={(e) => setFiber(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-center font-bold text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 8: Allergens selection */}
                  <div>
                    <label className="block text-stone-800 font-semibold mb-1.5">
                      Allergènes présents dans la recette :
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {ALLERGENS_MASTER_LIST.map((alg) => (
                        <button
                          type="button"
                          key={alg.id}
                          onClick={() => toggleAllergen(alg.id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition cursor-pointer flex items-center gap-1 ${
                            selectedAllergens.includes(alg.id)
                              ? 'bg-[#99281a] text-white border-[#99281a]'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <span>{alg.icon}</span>
                          <span>{alg.name}</span>
                          {selectedAllergens.includes(alg.id) && (
                            <Check className="w-3 h-3 ml-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit / Action buttons */}
                  <div className="pt-2 flex justify-between items-center gap-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="px-4 py-2.5 rounded-2xl bg-stone-100 text-stone-700 font-semibold hover:bg-stone-200 transition cursor-pointer text-xs"
                    >
                      Annuler et revenir à la liste
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-2xl bg-[#99281a] hover:bg-[#781524] text-white font-bold shadow-md transition cursor-pointer flex items-center gap-1.5 text-xs"
                    >
                      {editingDishId ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Mettre à jour le plat</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          <span>Ajouter le plat à la carte</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* =========================================================================
                 TAB 3: ADD & MANAGE CATEGORIES
                 ========================================================================= */}
              {activeTab === 'categories' && (
                <div className="space-y-4 text-xs">
                  {/* Add Category Form */}
                  <form
                    onSubmit={handleCreateCategory}
                    className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3"
                  >
                    <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      <FolderPlus className="w-4 h-4 text-[#99281a]" />
                      <span>Ajouter une nouvelle catégorie</span>
                    </h4>

                    {/* Category names with auto-translate */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-stone-700 font-semibold">
                          Nom de la catégorie (Français) *
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAutoTranslateCategory()}
                          disabled={isTranslatingCat || !catNameFr.trim()}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#8a3311] border border-amber-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs disabled:opacity-50 active:scale-95"
                          title="Traduire automatiquement la catégorie en italien et anglais"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>{isTranslatingCat ? 'Traduction...' : '✨ Traduire automatiquement'}</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        required
                        value={catNameFr}
                        onChange={(e) => setCatNameFr(e.target.value)}
                        onBlur={() => {
                          if (catNameFr.trim() && (!catNameIt.trim() || !catNameEn.trim())) {
                            handleAutoTranslateCategory();
                          }
                        }}
                        placeholder="ex: Pizzas Napolitaines, Vins & Apéritifs..."
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-stone-700 font-semibold">
                            Nom (Italien / VO)
                          </label>
                          <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono font-medium">
                            Auto 🇮🇹
                          </span>
                        </div>
                        <input
                          type="text"
                          value={catNameIt}
                          onChange={(e) => setCatNameIt(e.target.value)}
                          placeholder="ex: Pizze Napoletane"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-stone-700 font-semibold">
                            Nom (Anglais)
                          </label>
                          <span className="text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-mono font-medium">
                            Auto 🇬🇧
                          </span>
                        </div>
                        <input
                          type="text"
                          value={catNameEn}
                          onChange={(e) => setCatNameEn(e.target.value)}
                          placeholder="ex: Neapolitan Pizzas"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-stone-700 font-semibold">
                            Nom (Espagnol)
                          </label>
                          <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-mono font-medium">
                            Auto 🇪🇸
                          </span>
                        </div>
                        <input
                          type="text"
                          value={catNameEs}
                          onChange={(e) => setCatNameEs(e.target.value)}
                          placeholder="ex: Pizzas Napolitanas"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Icon Picker */}
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1.5">
                        Choisir l'icône représentative :
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {AVAILABLE_CATEGORY_ICONS.map((item) => {
                          const IconComponent = item.icon;
                          const isSelected = catIcon === item.id;
                          return (
                            <button
                              type="button"
                              key={item.id}
                              onClick={() => setCatIcon(item.id)}
                              className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                                isSelected
                                  ? 'bg-[#99281a] text-white border-[#99281a] shadow-xs'
                                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              <IconComponent className="w-4 h-4 shrink-0" />
                              <span className="text-[11px] truncate font-medium">
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-2xl bg-[#99281a] hover:bg-[#781524] text-white font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                      >
                        <FolderPlus className="w-4 h-4" />
                        <span>{t('saveCategoryBtn')}</span>
                      </button>
                    </div>
                  </form>

                  {/* Current Categories List */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                      <Layers className="w-4 h-4 text-stone-500" />
                      <span>Catégories actuelles ({activeRestaurant.categories.length})</span>
                    </h4>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar pr-1">
                      {activeRestaurant.categories.map((c) => {
                        const count =
                          c.id === 'all'
                            ? activeRestaurant.dishes.length
                            : activeRestaurant.dishes.filter((d) => d.categoryId === c.id).length;

                        return (
                          <div
                            key={c.id}
                            className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs">
                                <Tag className="w-3 h-3 text-[#99281a]" />
                              </span>
                              <div>
                                <span className="font-semibold text-stone-900 block">
                                  {c.name_fr || c.name}
                                </span>
                                {(c.name_it || c.name_en) && (
                                  <span className="text-[10px] text-stone-500 block">
                                    VO: {c.name_it || '-'} • EN: {c.name_en || '-'}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-stone-200 text-stone-700">
                                {count} plat(s)
                              </span>
                              {c.id !== 'all' && count === 0 && onDeleteCategory && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteCategory(c.id)}
                                  className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Supprimer la catégorie vide"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                 TAB 5: RÉSEAUX SOCIAUX & LIENS EXTERNES (PRÉSENCE EN LIGNE & LIVRAISON)
                 ========================================================================= */}
              {activeTab === 'links' && (
                <div className="space-y-4">
                    {/* Header Intro Banner */}
                  <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                            <span>Présence en Ligne & Liens de Commande</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                              {activeRestaurant.name}
                            </span>
                          </h3>
                          <p className="text-xs text-stone-300 mt-1 max-w-xl">
                            Configurez vos liens officiels de livraison (Uber Eats, Deliveroo), votre site web et vos réseaux sociaux. Ces boutons s'affichent avec élégance directement sous le nom de votre établissement.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveLinks}
                        disabled={isSavingLinks}
                        className={`px-4 py-2 rounded-xl text-stone-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0 ${
                          isLinksDirty
                            ? 'bg-amber-400 hover:bg-amber-300 ring-2 ring-amber-300 animate-pulse active:scale-95'
                            : 'bg-stone-200 hover:bg-stone-100 text-stone-800'
                        }`}
                      >
                        <Check className="w-4 h-4 text-stone-950" />
                        <span>{isSavingLinks ? 'Enregistrement...' : 'Enregistrer les liens'}</span>
                      </button>
                    </div>

                    {/* UNSAVED MODIFICATIONS ALERT */}
                    {isLinksDirty && (
                      <div className="mt-3.5 p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Modifications non enregistrées — pensez à enregistrer pour mettre à jour la page restaurant.</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveLinks}
                          disabled={isSavingLinks}
                          className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-lg transition shrink-0 cursor-pointer shadow-xs active:scale-95"
                        >
                          Enregistrer maintenant
                        </button>
                      </div>
                    )}

                    {/* LIVE PREVIEW OF BADGES */}
                    <div className="mt-4 pt-3.5 border-t border-stone-700/70">
                      <div className="text-[11px] font-mono text-stone-400 flex items-center gap-1.5 mb-2">
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Aperçu en temps réel (tel qu'affiché sous le nom du restaurant) :</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                        {linksForm.uberEats && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-700 text-white font-mono text-xs font-bold shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                            <span>Uber Eats</span>
                            <ExternalLink className="w-3 h-3 text-emerald-200" />
                          </span>
                        )}
                        {linksForm.deliveroo && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00cdbc] text-stone-950 font-mono text-xs font-black shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            <span>Deliveroo</span>
                            <ExternalLink className="w-3 h-3 text-stone-950" />
                          </span>
                        )}
                        {linksForm.website && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-stone-900 border border-stone-300 text-xs font-semibold shadow-xs">
                            <Globe className="w-3 h-3 text-stone-600" />
                            <span>Site web</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </span>
                        )}
                        {linksForm.instagram && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white text-xs font-bold shadow-xs">
                            <Instagram className="w-3 h-3 text-white" />
                            <span>Instagram</span>
                            <ExternalLink className="w-3 h-3 text-white/80" />
                          </span>
                        )}
                        {linksForm.facebook && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1877f2] text-white text-xs font-bold shadow-xs">
                            <Facebook className="w-3 h-3 text-white" />
                            <span>Facebook</span>
                            <ExternalLink className="w-3 h-3 text-white/80" />
                          </span>
                        )}
                        {linksForm.tiktok && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black text-white text-xs font-bold border border-stone-700 shadow-xs">
                            <span className="text-[10px]">🎵</span>
                            <span>TikTok</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </span>
                        )}
                        {linksForm.googleMaps && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-900 border border-red-200 text-xs font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-red-600" />
                            <span>Google Maps</span>
                            <ExternalLink className="w-3 h-3 text-red-400" />
                          </span>
                        )}
                        {linksForm.customUrl && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold">
                            <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
                            <span>{linksForm.customLabel || 'Lien personnalisé'}</span>
                            <ExternalLink className="w-3 h-3 text-amber-600" />
                          </span>
                        )}
                        {!hasAnyConfiguredLinks && (
                          <span className="text-xs text-stone-400 italic">
                            Aucun lien configuré pour le moment. Renseignez les champs ci-dessous pour activer les boutons.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveLinks} className="space-y-4">
                    {/* SECTION 1: EXTERNAL LINKS / LIVRAISON & COMMANDE */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5">
                        <span className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          🛵
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                            Liens de Commande en Ligne & Livraison (External Links)
                          </h4>
                          <p className="text-[11px] text-stone-500">
                            Permettez à vos clients de commander directement via vos plateformes partenaires (Uber Eats, Deliveroo, site officiel).
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Uber Eats */}
                        <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                              <span>Uber Eats</span>
                            </label>
                            {linksForm.uberEats && (
                              <button
                                type="button"
                                onClick={() => handleTestLink('uberEats', linksForm.uberEats)}
                                className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Tester</span>
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={linksForm.uberEats}
                              onChange={(e) => setLinksForm((prev) => ({ ...prev, uberEats: e.target.value }))}
                              placeholder="https://www.ubereats.com/fr/store/..."
                              className="w-full pl-3 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {linksForm.uberEats && (
                              <button
                                type="button"
                                onClick={() => setLinksForm((prev) => ({ ...prev, uberEats: '' }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                                title="Effacer le lien"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500">
                            URL de la page Uber Eats de votre établissement.
                          </p>
                        </div>

                        {/* Deliveroo */}
                        <div className="space-y-1.5 p-3 rounded-xl bg-teal-50/50 border border-teal-100">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#00cdbc]"></span>
                              <span>Deliveroo</span>
                            </label>
                            {linksForm.deliveroo && (
                              <button
                                type="button"
                                onClick={() => handleTestLink('deliveroo', linksForm.deliveroo)}
                                className="text-[11px] text-teal-800 hover:text-teal-950 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Tester</span>
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={linksForm.deliveroo}
                              onChange={(e) => setLinksForm((prev) => ({ ...prev, deliveroo: e.target.value }))}
                              placeholder="https://deliveroo.fr/fr/menu/..."
                              className="w-full pl-3 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#00cdbc] focus:border-[#00cdbc]"
                            />
                            {linksForm.deliveroo && (
                              <button
                                type="button"
                                onClick={() => setLinksForm((prev) => ({ ...prev, deliveroo: '' }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                                title="Effacer le lien"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500">
                            URL de la page Deliveroo de votre restaurant.
                          </p>
                        </div>

                        {/* Site Web Officiel */}
                        <div className="space-y-1.5 p-3 rounded-xl bg-stone-50 border border-stone-200 md:col-span-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-stone-700" />
                              <span>Site Web Officiel / Réservation directe</span>
                            </label>
                            {linksForm.website && (
                              <button
                                type="button"
                                onClick={() => handleTestLink('website', linksForm.website)}
                                className="text-[11px] text-stone-800 hover:text-stone-950 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Tester</span>
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={linksForm.website}
                              onChange={(e) => setLinksForm((prev) => ({ ...prev, website: e.target.value }))}
                              placeholder="https://mon-restaurant.fr"
                              className="w-full pl-3 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a] focus:border-[#99281a]"
                            />
                            {linksForm.website && (
                              <button
                                type="button"
                                onClick={() => setLinksForm((prev) => ({ ...prev, website: '' }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                                title="Effacer le lien"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500">
                            Site officiel, page d'accueil ou système de réservation direct de votre restaurant.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: SOCIAL LINKS / RÉSEAUX SOCIAUX */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5">
                        <span className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs">
                          📱
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                            Réseaux Sociaux Officiels (Social Links)
                          </h4>
                          <p className="text-[11px] text-stone-500">
                            Liez vos comptes Instagram, Facebook et TikTok pour fidéliser votre clientèle.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Instagram */}
                        <div className="space-y-1.5 p-3 rounded-xl bg-rose-50/40 border border-rose-100">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                              <Instagram className="w-3.5 h-3.5 text-rose-600" />
                              <span>Instagram</span>
                            </label>
                            {linksForm.instagram && (
                              <button
                                type="button"
                                onClick={() => handleTestLink('instagram', linksForm.instagram)}
                                className="text-[11px] text-rose-800 hover:text-rose-950 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Tester</span>
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={linksForm.instagram}
                              onChange={(e) => setLinksForm((prev) => ({ ...prev, instagram: e.target.value }))}
                              placeholder="@monrestaurant ou URL"
                              className="w-full pl-3 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                            />
                            {linksForm.instagram && (
                              <button
                                type="button"
                                onClick={() => setLinksForm((prev) => ({ ...prev, instagram: '' }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                                title="Effacer le lien"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500">
                            Nom d'utilisateur (@pseudo) ou lien complet.
                          </p>
                        </div>

                        {/* Facebook */}
                        <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/40 border border-blue-100">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                              <Facebook className="w-3.5 h-3.5 text-[#1877f2]" />
                              <span>Facebook</span>
                            </label>
                            {linksForm.facebook && (
                              <button
                                type="button"
                                onClick={() => handleTestLink('facebook', linksForm.facebook)}
                                className="text-[11px] text-blue-800 hover:text-blue-950 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Tester</span>
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={linksForm.facebook}
                              onChange={(e) => setLinksForm((prev) => ({ ...prev, facebook: e.target.value }))}
                              placeholder="https://facebook.com/..."
                              className="w-full pl-3 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {linksForm.facebook && (
                              <button
                                type="button"
                                onClick={() => setLinksForm((prev) => ({ ...prev, facebook: '' }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                                title="Effacer le lien"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500">
                            Lien de la page Facebook officielle.
                          </p>
                        </div>

                        {/* TikTok */}
                        <div className="space-y-1.5 p-3 rounded-xl bg-stone-100/70 border border-stone-200">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                              <span className="text-xs">🎵</span>
                              <span>TikTok</span>
                            </label>
                            {linksForm.tiktok && (
                              <button
                                type="button"
                                onClick={() => handleTestLink('tiktok', linksForm.tiktok)}
                                className="text-[11px] text-stone-800 hover:text-stone-950 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Tester</span>
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={linksForm.tiktok}
                              onChange={(e) => setLinksForm((prev) => ({ ...prev, tiktok: e.target.value }))}
                              placeholder="@monrestaurant ou URL"
                              className="w-full pl-3 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-stone-700"
                            />
                            {linksForm.tiktok && (
                              <button
                                type="button"
                                onClick={() => setLinksForm((prev) => ({ ...prev, tiktok: '' }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                                title="Effacer le lien"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500">
                            Pseudo TikTok (@compte) ou lien du profil.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: GOOGLE MAPS & LIEN PERSONNALISÉ */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5">
                        <span className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xs">
                          ⭐
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                            Google Maps & Lien Complémentaire Personnalisé
                          </h4>
                          <p className="text-[11px] text-stone-500">
                            Améliorez votre référencement local et proposez un lien additionnel (TheFork, Tripadvisor, Réservation, etc.).
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Google Maps */}
                        <div className="space-y-1.5 p-3 rounded-xl bg-red-50/40 border border-red-100">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-red-600" />
                              <span>Fiche Google Maps & Avis</span>
                            </label>
                            {linksForm.googleMaps && (
                              <button
                                type="button"
                                onClick={() => handleTestLink('googleMaps', linksForm.googleMaps)}
                                className="text-[11px] text-red-800 hover:text-red-950 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Tester</span>
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={linksForm.googleMaps}
                              onChange={(e) => setLinksForm((prev) => ({ ...prev, googleMaps: e.target.value }))}
                              placeholder="https://maps.google.com/..."
                              className="w-full pl-3 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                            {linksForm.googleMaps && (
                              <button
                                type="button"
                                onClick={() => setLinksForm((prev) => ({ ...prev, googleMaps: '' }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                                title="Effacer le lien"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500">
                            Lien vers votre fiche Google Business / Google Maps.
                          </p>
                        </div>

                        {/* Lien Personnalisé */}
                        <div className="space-y-1.5 p-3 rounded-xl bg-amber-50/40 border border-amber-100">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                              <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
                              <span>Lien Personnalisé (Optionnel)</span>
                            </label>
                            {linksForm.customUrl && (
                              <button
                                type="button"
                                onClick={() => handleTestLink('customUrl', linksForm.customUrl)}
                                className="text-[11px] text-amber-800 hover:text-amber-950 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Tester</span>
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={linksForm.customLabel}
                              onChange={(e) => setLinksForm((prev) => ({ ...prev, customLabel: e.target.value }))}
                              placeholder="Libellé (ex: TheFork)"
                              className="col-span-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                            <div className="col-span-2 relative">
                              <input
                                type="text"
                                value={linksForm.customUrl}
                                onChange={(e) => setLinksForm((prev) => ({ ...prev, customUrl: e.target.value }))}
                                placeholder="https://thefork.fr/..."
                                className="w-full pl-3 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                              />
                              {linksForm.customUrl && (
                                <button
                                  type="button"
                                  onClick={() => setLinksForm((prev) => ({ ...prev, customUrl: '' }))}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                                  title="Effacer le lien"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] text-stone-500">
                            Bouton d'action additionnel personnalisé (TheFork, Tripadvisor, Réservation table...).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLinksForm({
                            website: activeRestaurant.externalLinks?.website || activeRestaurant.socialLinks?.website || '',
                            uberEats: activeRestaurant.externalLinks?.uberEats || activeRestaurant.socialLinks?.uberEats || '',
                            deliveroo: activeRestaurant.externalLinks?.deliveroo || activeRestaurant.socialLinks?.deliveroo || '',
                            instagram: activeRestaurant.socialLinks?.instagram || '',
                            facebook: activeRestaurant.socialLinks?.facebook || '',
                            tiktok: activeRestaurant.socialLinks?.tiktok || '',
                            googleMaps: activeRestaurant.externalLinks?.googleMaps || activeRestaurant.socialLinks?.googleMaps || '',
                            customLabel: activeRestaurant.externalLinks?.customLabel || activeRestaurant.socialLinks?.customLabel || '',
                            customUrl: activeRestaurant.externalLinks?.customUrl || activeRestaurant.socialLinks?.customUrl || '',
                          });
                          onShowToast('Modifications réinitialisées aux valeurs enregistrées.');
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Réinitialiser</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('list')}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                        >
                          Retour à la carte
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingLinks}
                          className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
                            isLinksDirty
                              ? 'bg-[#99281a] hover:bg-[#802216] ring-2 ring-amber-400 active:scale-95'
                              : 'bg-stone-800 hover:bg-stone-900'
                          }`}
                        >
                          <Check className="w-4 h-4 text-white" />
                          <span>{isSavingLinks ? 'Enregistrement...' : 'Enregistrer la présence en ligne'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
