import React, { useState } from 'react';
import {
  X,
  Palette,
  Image as ImageIcon,
  FileText,
  Megaphone,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
  MapPin,
  Phone,
  Clock,
  Eye,
  Sliders,
  Store,
  Share2,
  Globe,
  Instagram,
  Facebook,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import { Restaurant, RestaurantCustomization, RestaurantSocialLinks } from '../types';
import { processImageFile } from '../utils/imageUpload';

interface RestaurantCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onSave: (updatedRestaurant: Restaurant) => void;
  onShowToast: (message: string) => void;
}

export const THEME_PRESETS = [
  {
    id: 'rubis',
    name: 'Rubis Toscan & Or',
    primary: '#781524',
    accent: '#c58b2b',
    badge: '#99281a',
    emoji: '🍷',
    description: 'Chaleur italienne classique, bordeaux velouté et dorures nobles',
  },
  {
    id: 'olive',
    name: 'Vert Olive & Sauge',
    primary: '#244f26',
    accent: '#10b981',
    badge: '#15803d',
    emoji: '🫒',
    description: 'Fraîcheur méditerranéenne, jardin d’aromates et cuisine bio',
  },
  {
    id: 'slate',
    name: 'Noir Ardoise & Or Impérial',
    primary: '#18181b',
    accent: '#eab308',
    badge: '#27272a',
    emoji: '👑',
    description: 'Élégance gastronomique, noir profond et reflets champagne',
  },
  {
    id: 'terracotta',
    name: 'Terracotta & Ambre du Sud',
    primary: '#9a3412',
    accent: '#f97316',
    badge: '#c2410c',
    emoji: '🏺',
    description: 'Teintes chaudes de Provence, poterie toscane et coucher de soleil',
  },
  {
    id: 'riviera',
    name: 'Bleu Nuit Riviera & Azur',
    primary: '#1e3a8a',
    accent: '#38bdf8',
    badge: '#2563eb',
    emoji: '🌊',
    description: 'Côte d’Azur, brise marine et ambiance raffinée bord de mer',
  },
  {
    id: 'cuivre',
    name: 'Espresso & Caramel Cuivré',
    primary: '#451a03',
    accent: '#d97706',
    badge: '#78350f',
    emoji: '☕',
    description: 'Ambiance bistrot feutré, boiseries sombres et café ristretto',
  },
];

export const PRESET_HERO_BANNERS = [
  {
    title: 'Four à bois traditionnel',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Trattoria chic & lumineuse',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Terrasse estivale sous les lampions',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Cave voûtée & dégustation de vins',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Bistrot gourmand & table dressée',
    url: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Plats gourmets & ambiance tamisée',
    url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
  },
];

const ANNOUNCEMENT_EMOJIS = ['🎉', '☀️', '👨‍🍳', '🍷', '🍕', '🌿', '⭐', '🥩', '🔔', '✨'];

export const RestaurantCustomizerModal: React.FC<RestaurantCustomizerModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  onSave,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const initialCustomization: RestaurantCustomization = restaurant.customization || {
    themePreset: 'rubis',
    primaryColor: '#781524',
    accentColor: '#c58b2b',
    bannerUrl: restaurant.banner || PRESET_HERO_BANNERS[0].url,
    bannerHeight: 'medium',
    showBannerHero: true,
    announcement: 'Bienvenue sur notre carte en ligne ! Tous nos plats sont préparés à la commande.',
    showAnnouncement: true,
    announcementEmoji: '🎉',
    logoType: 'monogram',
    logoUrl: '',
    logoBgColor: '#781524',
    logoTextColor: '#dfab43',
    fontStyle: 'serif',
    showHalalBadge: restaurant.isHalalCertified ?? false,
    showPhoneBadge: true,
    showAddressBadge: true,
    showHoursBadge: true,
  };

  const [activeTab, setActiveTab] = useState<'theme' | 'banner' | 'info' | 'announcement' | 'social'>('theme');

  // Social & ordering links state
  const [socialLinks, setSocialLinks] = useState<RestaurantSocialLinks>(() => ({
    website: restaurant.externalLinks?.website || restaurant.socialLinks?.website || '',
    uberEats: restaurant.externalLinks?.uberEats || restaurant.socialLinks?.uberEats || '',
    deliveroo: restaurant.externalLinks?.deliveroo || restaurant.socialLinks?.deliveroo || '',
    instagram: restaurant.socialLinks?.instagram || '',
    facebook: restaurant.socialLinks?.facebook || '',
    tiktok: restaurant.socialLinks?.tiktok || '',
    googleMaps: restaurant.externalLinks?.googleMaps || restaurant.socialLinks?.googleMaps || '',
    customLabel: restaurant.externalLinks?.customLabel || restaurant.socialLinks?.customLabel || '',
    customUrl: restaurant.externalLinks?.customUrl || restaurant.socialLinks?.customUrl || '',
  }));

  // Basic restaurant fields
  const [name, setName] = useState(restaurant.name);
  const [tagline, setTagline] = useState(restaurant.tagline || '');
  const [cuisine, setCuisine] = useState(restaurant.cuisine || '');
  const [priceRange, setPriceRange] = useState(restaurant.priceRange || '€€ (15-30€)');
  const [address, setAddress] = useState(restaurant.address || '');
  const [phone, setPhone] = useState(restaurant.phone || '');
  const [isHalalCertified, setIsHalalCertified] = useState(restaurant.isHalalCertified ?? false);

  // Opening hours
  const [days, setDays] = useState(restaurant.openingHours?.days || 'Mardi - Dimanche');
  const [lunch, setLunch] = useState(restaurant.openingHours?.lunch || '12h00 - 14h30');
  const [dinner, setDinner] = useState(restaurant.openingHours?.dinner || '19h00 - 23h00');
  const [isOpenNow, setIsOpenNow] = useState(restaurant.openingHours?.isOpenNow ?? true);

  // Customization styling state
  const [themePreset, setThemePreset] = useState<string>(initialCustomization.themePreset || 'rubis');
  const [primaryColor, setPrimaryColor] = useState<string>(initialCustomization.primaryColor || '#781524');
  const [accentColor, setAccentColor] = useState<string>(initialCustomization.accentColor || '#c58b2b');
  const [bannerUrl, setBannerUrl] = useState<string>(initialCustomization.bannerUrl || restaurant.banner || PRESET_HERO_BANNERS[0].url);
  const [bannerHeight, setBannerHeight] = useState<'compact' | 'medium' | 'tall'>(initialCustomization.bannerHeight || 'medium');
  const [showBannerHero, setShowBannerHero] = useState<boolean>(initialCustomization.showBannerHero ?? true);

  // Announcement
  const [announcement, setAnnouncement] = useState<string>(initialCustomization.announcement || '');
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(initialCustomization.showAnnouncement ?? true);
  const [announcementEmoji, setAnnouncementEmoji] = useState<string>(initialCustomization.announcementEmoji || '🎉');

  // Logo / Monogram
  const [logoType, setLogoType] = useState<'monogram' | 'image'>(initialCustomization.logoType || 'monogram');
  const [logoUrl, setLogoUrl] = useState<string>(initialCustomization.logoUrl || '');
  const [logoBgColor, setLogoBgColor] = useState<string>(initialCustomization.logoBgColor || '#781524');
  const [logoTextColor, setLogoTextColor] = useState<string>(initialCustomization.logoTextColor || '#dfab43');
  const [fontStyle, setFontStyle] = useState<'serif' | 'sans' | 'playfair'>(initialCustomization.fontStyle || 'serif');

  // Visibility toggles
  const [showPhoneBadge, setShowPhoneBadge] = useState<boolean>(initialCustomization.showPhoneBadge ?? true);
  const [showAddressBadge, setShowAddressBadge] = useState<boolean>(initialCustomization.showAddressBadge ?? true);
  const [showHoursBadge, setShowHoursBadge] = useState<boolean>(initialCustomization.showHoursBadge ?? true);

  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Handle Preset selection
  const handleSelectPreset = (preset: typeof THEME_PRESETS[0]) => {
    setThemePreset(preset.id);
    setPrimaryColor(preset.primary);
    setAccentColor(preset.accent);
    setLogoBgColor(preset.primary);
    setLogoTextColor(preset.accent);
    onShowToast(`Thème appliqué : ${preset.name} ${preset.emoji}`);
  };

  // Image Upload Handlers
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingBanner(true);
      const compressed = await processImageFile(file, 1600, 0.85);
      setBannerUrl(compressed);
      setShowBannerHero(true);
      onShowToast('Photo de couverture importée avec succès ! 📸');
    } catch {
      onShowToast("Erreur lors de l'import de l'image.");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingLogo(true);
      const compressed = await processImageFile(file, 400, 0.9);
      setLogoUrl(compressed);
      setLogoType('image');
      onShowToast('Logo personnalisé importé avec succès ! 🎨');
    } catch {
      onShowToast("Erreur lors de l'import du logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Save handler
  const handleSave = () => {
    const updatedCustomization: RestaurantCustomization = {
      themePreset: themePreset as any,
      primaryColor,
      accentColor,
      bannerUrl,
      bannerHeight,
      showBannerHero,
      announcement,
      showAnnouncement,
      announcementEmoji,
      logoType,
      logoUrl,
      logoBgColor,
      logoTextColor,
      fontStyle,
      showHalalBadge: isHalalCertified,
      showPhoneBadge,
      showAddressBadge,
      showHoursBadge,
    };

    const updatedRestaurant: Restaurant = {
      ...restaurant,
      name: name.trim() || restaurant.name,
      tagline: tagline.trim(),
      cuisine: cuisine.trim() || restaurant.cuisine,
      priceRange: priceRange.trim() || restaurant.priceRange,
      address: address.trim() || restaurant.address,
      phone: phone.trim() || restaurant.phone,
      banner: bannerUrl || restaurant.banner,
      isHalalCertified,
      openingHours: {
        ...restaurant.openingHours,
        days: days.trim() || restaurant.openingHours.days,
        lunch: lunch.trim() || restaurant.openingHours.lunch,
        dinner: dinner.trim() || restaurant.openingHours.dinner,
        isOpenNow,
      },
      socialLinks: {
        instagram: socialLinks.instagram?.trim() || undefined,
        facebook: socialLinks.facebook?.trim() || undefined,
        tiktok: socialLinks.tiktok?.trim() || undefined,
        // Compatibility
        website: socialLinks.website?.trim() || undefined,
        uberEats: socialLinks.uberEats?.trim() || undefined,
        deliveroo: socialLinks.deliveroo?.trim() || undefined,
        googleMaps: socialLinks.googleMaps?.trim() || undefined,
        customLabel: socialLinks.customLabel?.trim() || undefined,
        customUrl: socialLinks.customUrl?.trim() || undefined,
      },
      externalLinks: {
        website: socialLinks.website?.trim() || undefined,
        uberEats: socialLinks.uberEats?.trim() || undefined,
        deliveroo: socialLinks.deliveroo?.trim() || undefined,
        googleMaps: socialLinks.googleMaps?.trim() || undefined,
        customLabel: socialLinks.customLabel?.trim() || undefined,
        customUrl: socialLinks.customUrl?.trim() || undefined,
      },
      customization: updatedCustomization,
    };

    onSave(updatedRestaurant);
    onShowToast(`Page de « ${updatedRestaurant.name} » personnalisée avec succès ! ✨`);
    onClose();
  };

  // Reset to default
  const handleResetToDefault = () => {
    setThemePreset('rubis');
    setPrimaryColor('#781524');
    setAccentColor('#c58b2b');
    setLogoBgColor('#781524');
    setLogoTextColor('#dfab43');
    setFontStyle('serif');
    setShowBannerHero(true);
    setBannerHeight('medium');
    setShowAnnouncement(true);
    setShowAddressBadge(true);
    setShowPhoneBadge(true);
    setShowHoursBadge(true);
    setLogoType('monogram');
    onShowToast('Styles réinitialisés aux valeurs par défaut.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#fcfaf7] border border-stone-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-stone-900">
        
        {/* Header Modal Bar */}
        <div
          className="p-5 text-white flex items-center justify-between border-b border-stone-700/30 transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: `1px solid ${accentColor}` }}
            >
              <Sliders className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold tracking-tight">
                  Personnaliser la page du restaurant
                </h2>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: accentColor, color: primaryColor }}
                >
                  Direct Live
                </span>
              </div>
              <p className="text-xs text-white/80">
                Ajustez le thème, la bannière, vos informations et l'ambiance visuelle selon vos envies.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Mini Preview Bar */}
        <div className="bg-stone-100/90 border-b border-stone-200 px-5 py-3 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] font-mono uppercase font-bold text-stone-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-stone-600" />
              Aperçu en direct :
            </span>
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs"
                style={{ backgroundColor: logoBgColor, color: logoTextColor, border: `1px solid ${accentColor}` }}
              >
                {logoType === 'image' && logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  (name || 'RE').substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="leading-tight">
                <span className="text-xs font-bold text-stone-900 block truncate max-w-[150px]">
                  {name || 'Nom du Restaurant'}
                </span>
                <span className="text-[10px] text-stone-500 truncate block max-w-[180px]">
                  {tagline || cuisine || 'Cuisine raffinée'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow-2xs"
              style={{ backgroundColor: primaryColor }}
            >
              Couleur Principale
            </span>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs"
              style={{ backgroundColor: accentColor, color: '#1c1917' }}
            >
              Dorure / Accent
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-stone-200 bg-white">
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'theme'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Thème & Couleurs</span>
          </button>
          <button
            onClick={() => setActiveTab('banner')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'banner'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Bannière & Logo</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'info'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Coordonnées & Infos</span>
          </button>
          <button
            onClick={() => setActiveTab('announcement')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'announcement'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Annonce & Visibilité</span>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'social'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Réseaux & Commandes</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: THEME & COULEURS */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Palettes de couleurs & Ambiances prêtes à l'emploi</span>
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Choisissez une ambiance visuelle en 1 clic pour transformer instantanément les boutons, les badges et l'identité de votre établissement.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = themePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'border-stone-900 bg-white shadow-md'
                            : 'border-stone-200 bg-white/70 hover:border-stone-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{preset.emoji}</span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: preset.accent }}
                            />
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center ml-1">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>
                        <h4 className="text-xs font-bold text-stone-900">{preset.name}</h4>
                        <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Fine-Tuning Colors */}
              <div className="p-4 bg-stone-100/80 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
                    🎨 Ajustement précis des couleurs sur mesure
                  </h4>
                  <span className="text-[11px] text-stone-500">Code hexadécimal libre</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Couleur Principale (En-têtes, boutons, accents forts)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value);
                          setThemePreset('custom');
                        }}
                        className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value);
                          setThemePreset('custom');
                        }}
                        className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-stone-300 rounded-xl"
                        placeholder="#781524"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Couleur d'Accentuation (Dorures, liserés, surlignages)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => {
                          setAccentColor(e.target.value);
                          setThemePreset('custom');
                        }}
                        className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => {
                          setAccentColor(e.target.value);
                          setThemePreset('custom');
                        }}
                        className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-stone-300 rounded-xl"
                        placeholder="#c58b2b"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typographic choice */}
              <div>
                <label className="text-xs font-bold text-stone-900 block mb-2">
                  Style Typographique du titre & de l'ambiance
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFontStyle('serif')}
                    className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition ${
                      fontStyle === 'serif'
                        ? 'border-stone-900 bg-white shadow-xs'
                        : 'border-stone-200 bg-white/70 hover:border-stone-300'
                    }`}
                  >
                    <span className="font-serif text-lg font-bold block text-stone-900">
                      Gourmet Serif
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Élégant, noble et intemporel
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFontStyle('playfair')}
                    className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition ${
                      fontStyle === 'playfair'
                        ? 'border-stone-900 bg-white shadow-xs'
                        : 'border-stone-200 bg-white/70 hover:border-stone-300'
                    }`}
                  >
                    <span className="font-cinzel text-lg font-bold block text-stone-900">
                      Cinzel Impérial
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Prestige toscan & lettres romaines
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFontStyle('sans')}
                    className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition ${
                      fontStyle === 'sans'
                        ? 'border-stone-900 bg-white shadow-xs'
                        : 'border-stone-200 bg-white/70 hover:border-stone-300'
                    }`}
                  >
                    <span className="font-sans text-lg font-bold block text-stone-900">
                      Moderne Sans
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Épuré, contemporain et direct
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BANNIÈRE & LOGO */}
          {activeTab === 'banner' && (
            <div className="space-y-6">
              {/* Hero Banner Toggle & Height */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-stone-100/90 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 shadow-2xs">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      Bannière d'ambiance en tête de page
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Affiche une grande photo photographique immersive au sommet du restaurant.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBannerHero}
                      onChange={(e) => setShowBannerHero(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {showBannerHero && (
                <>
                  {/* Banner Height */}
                  <div>
                    <label className="text-xs font-bold text-stone-900 block mb-2">
                      Hauteur de la bannière
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setBannerHeight('compact')}
                        className={`p-2.5 rounded-xl border-2 text-center cursor-pointer text-xs font-bold transition ${
                          bannerHeight === 'compact'
                            ? 'border-stone-900 bg-white text-stone-900 shadow-xs'
                            : 'border-stone-200 bg-white/70 text-stone-500'
                        }`}
                      >
                        Compacte (140px)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerHeight('medium')}
                        className={`p-2.5 rounded-xl border-2 text-center cursor-pointer text-xs font-bold transition ${
                          bannerHeight === 'medium'
                            ? 'border-stone-900 bg-white text-stone-900 shadow-xs'
                            : 'border-stone-200 bg-white/70 text-stone-500'
                        }`}
                      >
                        Équilibrée (220px)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerHeight('tall')}
                        className={`p-2.5 rounded-xl border-2 text-center cursor-pointer text-xs font-bold transition ${
                          bannerHeight === 'tall'
                            ? 'border-stone-900 bg-white text-stone-900 shadow-xs'
                            : 'border-stone-200 bg-white/70 text-stone-500'
                        }`}
                      >
                        Immersive (320px)
                      </button>
                    </div>
                  </div>

                  {/* Preset Banners Gallery */}
                  <div>
                    <label className="text-xs font-bold text-stone-900 block mb-2">
                      Sélectionnez une photo de couverture HD ou importez la vôtre
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {PRESET_HERO_BANNERS.map((b, idx) => {
                        const isCurrent = bannerUrl === b.url;
                        return (
                          <div
                            key={idx}
                            onClick={() => setBannerUrl(b.url)}
                            className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all aspect-video ${
                              isCurrent
                                ? 'border-emerald-600 ring-2 ring-emerald-600/30 shadow-md scale-[1.02]'
                                : 'border-stone-200 hover:border-stone-400'
                            }`}
                          >
                            <img
                              src={b.url}
                              alt={b.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                              <span className="text-[11px] font-semibold text-white leading-tight">
                                {b.title}
                              </span>
                            </div>
                            {isCurrent && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Banner URL & Upload */}
                  <div className="p-4 bg-stone-100/90 rounded-2xl border border-stone-200 space-y-3">
                    <label className="text-xs font-bold text-stone-900 block">
                      Téléversez votre propre photo ou saisissez son lien URL
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <label className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-xs font-bold text-stone-800 shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition shrink-0">
                        <Upload className="w-3.5 h-3.5 text-stone-600" />
                        <span>{isUploadingBanner ? 'Compression...' : 'Importer une photo...'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBannerUpload}
                          disabled={isUploadingBanner}
                        />
                      </label>
                      <input
                        type="url"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Logo / Monogram Settings */}
              <div className="border-t border-stone-200 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900 uppercase font-mono tracking-wider">
                    Emblème ou Logo du Restaurant
                  </h4>
                  <div className="flex items-center gap-2 bg-stone-200/80 p-0.5 rounded-full text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setLogoType('monogram')}
                      className={`px-3 py-1 rounded-full transition cursor-pointer ${
                        logoType === 'monogram'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Monogramme
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoType('image')}
                      className={`px-3 py-1 rounded-full transition cursor-pointer ${
                        logoType === 'image'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Image Logo
                    </button>
                  </div>
                </div>

                {logoType === 'monogram' ? (
                  <div className="p-4 bg-stone-100/80 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center font-cinzel font-bold text-2xl shadow-md shrink-0"
                      style={{
                        backgroundColor: logoBgColor,
                        color: logoTextColor,
                        border: `1.5px solid ${accentColor}`,
                      }}
                    >
                      {(name || 'RE').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                          Couleur du fond du monogramme
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={logoBgColor}
                            onChange={(e) => setLogoBgColor(e.target.value)}
                            className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer bg-white"
                          />
                          <input
                            type="text"
                            value={logoBgColor}
                            onChange={(e) => setLogoBgColor(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                          Couleur du lettrage & dorure
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={logoTextColor}
                            onChange={(e) => setLogoTextColor(e.target.value)}
                            className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer bg-white"
                          />
                          <input
                            type="text"
                            value={logoTextColor}
                            onChange={(e) => setLogoTextColor(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-stone-100/80 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-xs font-bold text-stone-800 shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition shrink-0">
                        <Upload className="w-3.5 h-3.5 text-stone-600" />
                        <span>{isUploadingLogo ? 'Importation...' : 'Téléverser le logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={isUploadingLogo}
                        />
                      </label>
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://... (URL de votre logo)"
                        className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl text-stone-900"
                      />
                    </div>
                    {logoUrl && (
                      <div className="flex items-center gap-3 pt-2">
                        <img
                          src={logoUrl}
                          alt="Logo Preview"
                          className="w-12 h-12 rounded-xl object-contain bg-white border border-stone-200 p-1 shadow-2xs"
                        />
                        <span className="text-xs text-stone-500">
                          Aperçu du logo qui s'affichera à côté du titre.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COORDONNÉES & INFOS */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Nom de l'établissement *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:border-stone-900 focus:outline-none shadow-2xs font-semibold text-stone-900"
                    placeholder="Ex: Trattoria Bella Vista"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Slogan ou Devise
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:border-stone-900 focus:outline-none shadow-2xs text-stone-900 italic font-serif"
                    placeholder="Ex: Autentica Cucina Tradizionale Italiana"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Type de cuisine
                  </label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:border-stone-900 focus:outline-none shadow-2xs text-stone-900"
                    placeholder="Ex: Pizzeria & Spécialités Napolitaines"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Gamme de prix
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:border-stone-900 focus:outline-none shadow-2xs text-stone-900 font-medium"
                  >
                    <option value="€ (Moins de 15€)">€ (Moins de 15€)</option>
                    <option value="€€ (15-30€)">€€ (15-30€)</option>
                    <option value="€€€ (30-50€)">€€€ (30-50€)</option>
                    <option value="€€€€ (Gastronomique +50€)">€€€€ (Gastronomique +50€)</option>
                  </select>
                </div>
              </div>

              {/* Coordonnées affichées sur la page */}
              <div className="p-4 bg-stone-100/80 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-900 uppercase font-mono tracking-wider">
                  📍 Adresse & 📞 Téléphone (Directement visibles sur la page)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>Adresse postale</span>
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:border-stone-900 focus:outline-none shadow-2xs text-stone-900"
                      placeholder="Ex: 24 Via Della Spiga, 13400 Aubagne"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Génère un bouton cliquable qui ouvre automatiquement l'itinéraire Google Maps.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Numéro de téléphone</span>
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:border-stone-900 focus:outline-none shadow-2xs text-stone-900 font-mono font-medium"
                      placeholder="Ex: 04 42 01 99 88"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Permet aux clients d'appeler directement votre restaurant d'un simple clic.
                    </span>
                  </div>
                </div>
              </div>

              {/* Halal Badge Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🥩</span>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      Certification 100% Halal
                    </span>
                    <span className="text-[11px] text-emerald-800/80">
                      Affiche le badge vert distinctif certifié Halal aux côtés du nom du restaurant.
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHalalCertified}
                    onChange={(e) => setIsHalalCertified(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Opening Hours Details */}
              <div className="p-4 bg-stone-100/80 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-stone-700" />
                    <span>Horaires et statut d'ouverture</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-600 font-medium">Statut :</span>
                    <button
                      type="button"
                      onClick={() => setIsOpenNow(!isOpenNow)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        isOpenNow
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-rose-600 text-white shadow-2xs'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span>{isOpenNow ? 'Ouvert maintenant' : 'Fermé actuellement'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      Jours d'ouverture
                    </label>
                    <input
                      type="text"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl"
                      placeholder="Mardi - Dimanche"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      Service Midi
                    </label>
                    <input
                      type="text"
                      value={lunch}
                      onChange={(e) => setLunch(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl"
                      placeholder="12h00 - 14h30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      Service Soir
                    </label>
                    <input
                      type="text"
                      value={dinner}
                      onChange={(e) => setDinner(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl"
                      placeholder="19h00 - 23h00"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ANNONCE & VISIBILITÉ */}
          {activeTab === 'announcement' && (
            <div className="space-y-6">
              {/* Custom Announcement Banner */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📢</span>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">
                        Bandeau d'annonce / Message du chef
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        Affichez un message personnalisé en haut de la carte (terrasse ouverte, arrivage frais, événements).
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAnnouncement}
                      onChange={(e) => setShowAnnouncement(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {showAnnouncement && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-[11px] font-semibold text-amber-950 block mb-1">
                        Émoji de l'annonce :
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {ANNOUNCEMENT_EMOJIS.map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => setAnnouncementEmoji(em)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition cursor-pointer ${
                              announcementEmoji === em
                                ? 'bg-amber-600 text-white shadow-xs scale-110'
                                : 'bg-white hover:bg-amber-100 text-stone-800 border border-amber-200'
                            }`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-amber-950 block mb-1">
                        Texte de l'annonce :
                      </label>
                      <input
                        type="text"
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                        placeholder="Ex: Terrasse d'été ouverte tous les soirs ! Pensez à réserver votre table."
                        className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 shadow-2xs font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Header Visibility Preferences */}
              <div className="p-4 bg-stone-100/90 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-900 uppercase font-mono tracking-wider">
                  Visibilité des éléments dans l'en-tête
                </h4>
                <div className="space-y-3 divide-y divide-stone-200 text-xs">
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-stone-700">
                      <MapPin className="w-3.5 h-3.5 text-stone-500" />
                      <span>Afficher le badge adresse et le lien Google Maps</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showAddressBadge}
                      onChange={(e) => setShowAddressBadge(e.target.checked)}
                      className="w-4 h-4 rounded text-stone-900 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2 text-stone-700">
                      <Phone className="w-3.5 h-3.5 text-stone-500" />
                      <span>Afficher le numéro de téléphone et le bouton d'appel direct</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showPhoneBadge}
                      onChange={(e) => setShowPhoneBadge(e.target.checked)}
                      className="w-4 h-4 rounded text-stone-900 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2 text-stone-700">
                      <Clock className="w-3.5 h-3.5 text-stone-500" />
                      <span>Afficher les horaires d'ouverture et le statut Ouvert/Fermé</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showHoursBadge}
                      onChange={(e) => setShowHoursBadge(e.target.checked)}
                      className="w-4 h-4 rounded text-stone-900 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RESEAUX SOCIAUX & COMMANDES EN LIGNE */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-amber-600" />
                  <span>Plateformes de commande & Réseaux sociaux</span>
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Renseignez vos liens officiels pour permettre aux clients de commander en ligne ou de suivre vos actualités.
                </p>
              </div>

              <div className="space-y-4">
                {/* Uber Eats */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-black">
                        UBER EATS
                      </span>
                      <span>Lien Uber Eats</span>
                    </label>
                    {socialLinks.uberEats && (
                      <a
                        href={socialLinks.uberEats}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <span>Tester</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={socialLinks.uberEats || ''}
                    onChange={(e) => setSocialLinks((prev) => ({ ...prev, uberEats: e.target.value }))}
                    placeholder="https://www.ubereats.com/fr/store/..."
                    className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Deliveroo */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#00cdbc] text-stone-950 font-mono text-[10px] font-black">
                        DELIVEROO
                      </span>
                      <span>Lien Deliveroo</span>
                    </label>
                    {socialLinks.deliveroo && (
                      <a
                        href={socialLinks.deliveroo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-cyan-700 hover:underline flex items-center gap-1"
                      >
                        <span>Tester</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={socialLinks.deliveroo || ''}
                    onChange={(e) => setSocialLinks((prev) => ({ ...prev, deliveroo: e.target.value }))}
                    placeholder="https://deliveroo.fr/fr/menu/..."
                    className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-cyan-600"
                  />
                </div>

                {/* Site Web */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-stone-700" />
                      <span>Site Web officiel</span>
                    </label>
                    {socialLinks.website && (
                      <a
                        href={socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-amber-700 hover:underline flex items-center gap-1"
                      >
                        <span>Tester</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={socialLinks.website || ''}
                    onChange={(e) => setSocialLinks((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://mon-restaurant.fr"
                    className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-amber-600"
                  />
                </div>

                {/* Instagram */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-rose-600" />
                      <span>Instagram</span>
                    </label>
                    {socialLinks.instagram && (
                      <a
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-rose-700 hover:underline flex items-center gap-1"
                      >
                        <span>Tester</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={socialLinks.instagram || ''}
                    onChange={(e) => setSocialLinks((prev) => ({ ...prev, instagram: e.target.value }))}
                    placeholder="https://www.instagram.com/..."
                    className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Facebook */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span>Facebook</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={socialLinks.facebook || ''}
                    onChange={(e) => setSocialLinks((prev) => ({ ...prev, facebook: e.target.value }))}
                    placeholder="https://www.facebook.com/..."
                    className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Google Maps */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-2 mb-1.5">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>Lien Fiche Google Maps & Avis</span>
                  </label>
                  <input
                    type="text"
                    value={socialLinks.googleMaps || ''}
                    onChange={(e) => setSocialLinks((prev) => ({ ...prev, googleMaps: e.target.value }))}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-red-600"
                  />
                </div>

                {/* Lien personnalisé */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-stone-600" />
                    <span>Lien personnalisé supplémentaire (TheFork, Réservation...)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={socialLinks.customLabel || ''}
                      onChange={(e) => setSocialLinks((prev) => ({ ...prev, customLabel: e.target.value }))}
                      placeholder="Texte (ex: Réserver sur TheFork)"
                      className="w-full text-xs bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800 focus:outline-none focus:border-stone-500"
                    />
                    <input
                      type="text"
                      value={socialLinks.customUrl || ''}
                      onChange={(e) => setSocialLinks((prev) => ({ ...prev, customUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800 focus:outline-none focus:border-stone-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser par défaut</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-700 hover:bg-stone-100 text-xs font-bold transition cursor-pointer border border-stone-300"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer hover:opacity-95"
              style={{ backgroundColor: primaryColor }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span>Enregistrer la page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
