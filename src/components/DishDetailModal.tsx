import React, { useState, useMemo, useEffect } from 'react';
import { X, Zap, Maximize2, Pencil, Camera } from 'lucide-react';
import { Dish, Restaurant, Language } from '../types';
import { I18N_DICT, ALLERGENS_MASTER_LIST } from '../data/i18n';
import { formatPrice } from '../utils/geo';
import { processImageFile } from '../utils/imageUpload';

interface DishDetailModalProps {
  isOpen: boolean;
  dish: Dish | null;
  restaurant?: Restaurant | null;
  currentLang: Language;
  onClose: () => void;
  onAddToCart?: (dish: Dish) => void;
  cartCount?: number;
  isAdmin?: boolean;
  onEditDish?: (dish: Dish) => void;
  onUpdateDish?: (dish: Dish) => void;
  onShowToast?: (msg: string) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  isOpen,
  dish,
  restaurant,
  currentLang,
  onClose,
  onAddToCart,
  cartCount = 0,
  isAdmin = false,
  onEditDish,
  onUpdateDish,
  onShowToast,
}) => {
  const [showWineDetails, setShowWineDetails] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isFullscreenPhoto, setIsFullscreenPhoto] = useState(false);

  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !dish || !onUpdateDish) return;
    try {
      const compressedDataUrl = await processImageFile(file);
      const updatedDish: Dish = { ...dish, image: compressedDataUrl };
      onUpdateDish(updatedDish);
      if (onShowToast) onShowToast(`Photo de « ${dish.name_fr || dish.name} » mise à jour avec succès ! 📸`);
    } catch (err: any) {
      if (onShowToast) onShowToast(err?.message || 'Erreur lors de l\'import de l\'image.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Escape key support to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullscreenPhoto) {
          setIsFullscreenPhoto(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isFullscreenPhoto]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setShowWineDetails(false);
      setIsAdded(false);
      setIsFullscreenPhoto(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Category display label (e.g. PIZZAS BASE TOMATE)
  const categoryLabel = useMemo(() => {
    if (!dish) return 'SPÉCIALITÉ MAISON';
    if (dish.categoryId === 'pizze') {
      const desc = (dish.description + ' ' + (dish.longDescription || '')).toLowerCase();
      if (
        desc.includes('tomate') ||
        dish.id.includes('pizza_royale') ||
        dish.name.toLowerCase().includes('margherita') ||
        dish.name.toLowerCase().includes('royale')
      ) {
        return 'PIZZAS BASE TOMATE';
      }
      return 'PIZZAS AU FOUR À BOIS';
    }
    const foundCat = restaurant?.categories?.find((c) => c.id === dish.categoryId);
    if (foundCat) {
      const catName =
        currentLang === 'it' && foundCat.name_it
          ? foundCat.name_it
          : currentLang === 'en' && foundCat.name_en
          ? foundCat.name_en
          : foundCat.name_fr || foundCat.name;
      return catName.toUpperCase();
    }
    return (dish.tags[0] || 'SPÉCIALITÉ').toUpperCase();
  }, [dish, restaurant, currentLang]);

  // Provenance / City badge top-left (e.g. AUBAGNE)
  const provenanceLabel = useMemo(() => {
    if (!dish) return 'AUBAGNE';
    if (dish.region) return dish.region.toUpperCase();
    if (restaurant?.address) {
      const parts = restaurant.address.split(',');
      if (parts.length > 1) {
        return parts[1].trim().toUpperCase();
      }
    }
    return 'AUBAGNE';
  }, [dish, restaurant]);

  if (!isOpen || !dish) return null;

  const dishName =
    currentLang === 'it' && dish.name_it
      ? dish.name_it
      : currentLang === 'en' && dish.name_en
      ? dish.name_en
      : dish.name_fr || dish.name;

  const allergensList = ALLERGENS_MASTER_LIST.filter((a) =>
    dish.allergens.includes(a.id)
  );

  const handleAddToCartClick = () => {
    setIsAdded(true);
    if (onAddToCart) {
      onAddToCart(dish);
    }
    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-stone-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      >
        <div
          className="relative bg-white rounded-3xl sm:rounded-[32px] overflow-hidden shadow-2xl w-full max-w-lg md:max-w-4xl lg:max-w-5xl border border-stone-200/80 flex flex-col md:flex-row my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[96vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ========================================================================= */}
          {/* DESKTOP LEFT COLUMN: Full Food Photo (Hidden on Mobile)                   */}
          {/* ========================================================================= */}
          <div className="hidden md:block relative md:w-1/2 bg-stone-100 shrink-0 overflow-hidden group min-h-[460px]">
            <img
              src={dish.image}
              alt={dishName}
              className="w-full h-full object-cover object-center select-none transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80';
              }}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 pointer-events-none" />

            {/* TOP-LEFT PILL: Provenance / Region & Admin Change Photo */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold tracking-wider text-stone-900 uppercase shadow-md inline-flex items-center gap-1">
                <span>📍</span>
                <span>{provenanceLabel}</span>
              </span>

              {isAdmin && onUpdateDish && (
                <label
                  className="bg-stone-900/85 hover:bg-stone-900 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md inline-flex items-center gap-1.5 transition cursor-pointer border border-white/20 active:scale-95 backdrop-blur-xs"
                  title="Changer la photo manuellement"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-300" />
                  <span>Changer photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>

            {/* TOP-RIGHT BUTTON: Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreenPhoto(true)}
              title="Voir la photo en entier (plein écran)"
              className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Plein écran</span>
            </button>

            {/* Wine Pairing Tooltip */}
            {showWineDetails && dish.winePairing && (
              <div className="absolute bottom-16 left-4 right-4 max-w-xs bg-stone-950/95 backdrop-blur-md text-stone-100 p-3 rounded-2xl border border-amber-400/40 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <span className="text-amber-400 font-bold block mb-0.5 uppercase tracking-wider text-[10px]">
                  Accord conseillé :
                </span>
                <span className="font-serif italic font-medium text-amber-100 text-xs leading-relaxed">
                  {dish.winePairing}
                </span>
              </div>
            )}

            {/* BOTTOM OVERLAY: Suggestion Boisson */}
            <div className="absolute bottom-4 left-4 z-20">
              <button
                type="button"
                onClick={() => setShowWineDetails((prev) => !prev)}
                className="bg-stone-900/90 hover:bg-black text-amber-300 px-3 py-1.5 rounded-full border border-white/15 font-bold uppercase text-[11px] tracking-wider flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer active:scale-95"
              >
                <span className="text-xs">🍷</span>
                <span>SUGGESTION BOISSON</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MAIN CONTENT AREA: Fits 100% on Mobile WITHOUT ANY SCROLLING NEEDED       */}
          {/* ========================================================================= */}
          <div className="flex-1 flex flex-col justify-between bg-white text-stone-900 p-3.5 sm:p-5 md:p-6 lg:p-7">
            {/* --------------------------------------------------------------------- */}
            {/* MOBILE-ONLY HEADER: Integrated photo thumbnail + title + price + close */}
            {/* --------------------------------------------------------------------- */}
            <div className="md:hidden flex items-start gap-3 pb-2.5 border-b border-stone-100">
              {/* Tap-to-expand Food Thumbnail */}
              <button
                type="button"
                onClick={() => setIsFullscreenPhoto(true)}
                title="Agrandir la photo"
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-stone-100 shadow-xs border border-stone-200/80 group cursor-pointer touch-manipulation"
              >
                <img
                  src={dish.image}
                  alt={dishName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80';
                  }}
                />
                <div className="absolute bottom-1 right-1 bg-black/65 backdrop-blur-xs text-white p-1 rounded-md">
                  <Maximize2 className="w-2.5 h-2.5" />
                </div>
              </button>

              {/* Title, Category, Price & Tags */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#fff8ee] border border-[#fde68a] text-[#9a3412] text-[9px] font-extrabold tracking-wider uppercase truncate">
                    {categoryLabel}
                  </span>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition cursor-pointer touch-manipulation shrink-0"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                <h2 className="font-serif font-bold text-base sm:text-lg text-stone-950 mt-0.5 leading-snug line-clamp-1">
                  {dishName}
                </h2>

                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-lg font-serif font-extrabold text-[#8a3311]">
                    {formatPrice(dish.price)}
                  </span>
                  {dish.portion && (
                    <span className="text-[10px] text-stone-400">
                      • {dish.portion}
                    </span>
                  )}
                </div>

                {/* Tags row */}
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {dish.isHalal && (
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                      🥩 Halal
                    </span>
                  )}
                  {dish.isVegan && (
                    <span className="text-[9px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-md">
                      🥑 Végétalien
                    </span>
                  )}
                  <span className="text-[9px] text-stone-600 bg-stone-100 border border-stone-200 px-1.5 py-0.2 rounded-md">
                    📍 {provenanceLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* DESKTOP-ONLY HEADER: Category & Diets + Price & Close                 */}
            {/* --------------------------------------------------------------------- */}
            <div className="hidden md:block mb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#fff8ee] border border-[#fde68a] text-[#9a3412] text-[11px] font-extrabold tracking-wider uppercase">
                    {categoryLabel}
                  </span>

                  {dish.isHalal && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold">
                      🥩 Halal
                    </span>
                  )}

                  {dish.isVegan && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-teal-100 border border-teal-300 text-teal-800 text-[10px] font-bold">
                      🥑 Végétalien
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl font-serif font-bold text-[#8a3311] tracking-tight">
                    {formatPrice(dish.price)}
                  </span>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              <div className="mt-1.5">
                <h2 className="font-serif font-bold text-2xl text-stone-950 leading-tight tracking-tight">
                  {dishName}
                </h2>
                {dish.portion && (
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Portion : {dish.portion}
                  </p>
                )}
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* MIDDLE BODY: Compact layout directly visible without scrolling        */}
            {/* --------------------------------------------------------------------- */}
            <div className="space-y-2.5 sm:space-y-3 my-2 sm:my-2.5">
              {/* Highlighted Commentary / Description */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#fffbf5] border-l-[3px] border-[#ea580c] shadow-2xs">
                <p className="text-[11px] sm:text-xs italic font-serif text-[#78350f] leading-relaxed line-clamp-2 sm:line-clamp-3">
                  « {dish.longDescription || dish.description} »
                </p>
              </div>

              {/* SECTION: Profil Nutritionnel (4-col macro grid) */}
              <div>
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  <Zap className="w-3 h-3 text-[#ea580c] fill-[#ea580c]" />
                  <span>PROFIL NUTRITIONNEL</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="bg-[#f8fafc] border border-stone-200/80 rounded-xl p-1 sm:p-1.5">
                    <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-stone-400 block truncate">
                      CALORIES
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                      {dish.nutrition.kcal} <span className="text-[8px] sm:text-[9px] font-normal text-stone-500">kcal</span>
                    </span>
                  </div>

                  <div className="bg-[#f8fafc] border border-stone-200/80 rounded-xl p-1 sm:p-1.5">
                    <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-stone-400 block truncate">
                      PROTÉINES
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                      {dish.nutrition.protein}g
                    </span>
                  </div>

                  <div className="bg-[#f8fafc] border border-stone-200/80 rounded-xl p-1 sm:p-1.5">
                    <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-stone-400 block truncate">
                      GLUCIDES
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                      {dish.nutrition.carbs}g
                    </span>
                  </div>

                  <div className="bg-[#f8fafc] border border-stone-200/80 rounded-xl p-1 sm:p-1.5">
                    <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-stone-400 block truncate">
                      LIPIDES
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                      {dish.nutrition.fat}g
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: Allergènes Présents */}
              <div>
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  <span className="text-sky-500 text-xs">⚠️</span>
                  <span>ALLERGÈNES PRÉSENTS</span>
                </div>

                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {allergensList.length > 0 ? (
                    allergensList.map((alg) => (
                      <span
                        key={alg.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] text-[10px] sm:text-xs font-medium"
                      >
                        <span>{alg.icon}</span>
                        <span>
                          {currentLang === 'it'
                            ? alg.name_it
                            : currentLang === 'en'
                            ? alg.name_en
                            : alg.name}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] sm:text-xs font-medium">
                      <span>🌿</span>
                      <span>{t('noAllergens')}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* SECTION: Accord Boisson / Sommelier */}
              {dish.winePairing && (
                <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2">
                  <span className="text-sm shrink-0">🍷</span>
                  <div className="text-[11px] sm:text-xs min-w-0 truncate">
                    <span className="font-bold text-amber-950 uppercase tracking-wider text-[9px] mr-1">
                      Accord conseillé :
                    </span>
                    <span className="text-amber-900 font-serif italic">
                      {dish.winePairing}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* BOTTOM ACTIONS ROW: Compact, direct & touch-friendly                   */}
            {/* --------------------------------------------------------------------- */}
            <div className="pt-2.5 sm:pt-3 border-t border-stone-100 flex items-center justify-between gap-2.5">
              {/* Price display */}
              <div className="flex flex-col shrink-0">
                <span className="text-lg sm:text-2xl font-serif font-extrabold text-[#8a3311] leading-none">
                  {formatPrice(dish.price)}
                </span>
                <span className="text-[9px] sm:text-[10px] text-stone-400 font-sans mt-0.5">
                  {dish.portion || 'Portion standard'}
                </span>
              </div>

              {/* Add & Close buttons */}
              <div className="flex items-center gap-2 flex-1 justify-end max-w-sm">
                {isAdmin && onEditDish && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditDish(dish);
                    }}
                    className="px-3 py-2.5 sm:py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    title="Modifier dans l'espace privé"
                  >
                    <Pencil className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden sm:inline">Modifier</span>
                  </button>
                )}

                {isAdmin && onUpdateDish && dish && (
                  <label
                    className="px-3 py-2.5 sm:py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    title="Changer la photo manuellement"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden sm:inline">Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}

                <button
                  type="button"
                  onClick={handleAddToCartClick}
                  className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-[#8a3311] hover:bg-[#71290d] active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-all cursor-pointer touch-manipulation"
                >
                  <span>🛍️</span>
                  <span className="truncate">
                    {isAdded
                      ? '✓ Ajouté !'
                      : cartCount > 0
                      ? `Ajouter (${cartCount})`
                      : 'Ajouter à la commande'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 font-bold text-xs sm:text-sm tracking-wider uppercase transition-colors cursor-pointer touch-manipulation shrink-0"
                >
                  FERMER
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    {/* FULLSCREEN LIGHTBOX FOR 100% COMPLETE UNCONSTRAINED PHOTO VIEW */}
    {isFullscreenPhoto && (
      <div
        className="fixed inset-0 z-60 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out select-none"
        onClick={() => setIsFullscreenPhoto(false)}
      >
        <button
          type="button"
          onClick={() => setIsFullscreenPhoto(false)}
          aria-label="Fermer le plein écran"
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer z-70"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div
          className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={dish.image}
            alt={dishName}
            className="max-w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl"
          />
          <div className="mt-3 text-center">
            <p className="text-white font-serif font-bold text-lg">
              {dishName}
            </p>
            <p className="text-stone-300 text-xs mt-0.5">
              {provenanceLabel} • {formatPrice(dish.price)}
            </p>
          </div>
        </div>
      </div>
    )}
  </>
  );
};
