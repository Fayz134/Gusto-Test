import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Instagram,
  Facebook,
  MapPin,
  ExternalLink,
  Plus,
  Check,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  Trash2,
  Share2,
} from 'lucide-react';
import { Restaurant, RestaurantSocialLinks } from '../types';

interface RestaurantSocialLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onSave: (updatedRestaurant: Restaurant) => void;
  onShowToast: (message: string) => void;
}

export const RestaurantSocialLinksModal: React.FC<RestaurantSocialLinksModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  onSave,
  onShowToast,
}) => {
  const [links, setLinks] = useState<RestaurantSocialLinks>(() => ({
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

  // Re-sync when modal opens or restaurant changes
  useEffect(() => {
    if (isOpen) {
      setLinks({
        website: restaurant.externalLinks?.website || restaurant.socialLinks?.website || '',
        uberEats: restaurant.externalLinks?.uberEats || restaurant.socialLinks?.uberEats || '',
        deliveroo: restaurant.externalLinks?.deliveroo || restaurant.socialLinks?.deliveroo || '',
        instagram: restaurant.socialLinks?.instagram || '',
        facebook: restaurant.socialLinks?.facebook || '',
        tiktok: restaurant.socialLinks?.tiktok || '',
        googleMaps: restaurant.externalLinks?.googleMaps || restaurant.socialLinks?.googleMaps || '',
        customLabel: restaurant.externalLinks?.customLabel || restaurant.socialLinks?.customLabel || '',
        customUrl: restaurant.externalLinks?.customUrl || restaurant.socialLinks?.customUrl || '',
      });
    }
  }, [isOpen, restaurant]);

  if (!isOpen) return null;

  // Helper to format Instagram handle into full URL if needed
  const normalizeUrl = (key: keyof RestaurantSocialLinks, val: string): string => {
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
        return `https://www.tiktok.com/${trimmed}`;
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

  const handleChange = (key: keyof RestaurantSocialLinks, value: string) => {
    setLinks((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = (key: keyof RestaurantSocialLinks) => {
    setLinks((prev) => ({ ...prev, [key]: '' }));
  };

  const handleTestLink = (key: keyof RestaurantSocialLinks) => {
    const raw = links[key];
    if (!raw) return;
    const url = normalizeUrl(key, raw);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedSocialLinks: RestaurantSocialLinks = {
      website: normalizeUrl('website', links.website || ''),
      uberEats: normalizeUrl('uberEats', links.uberEats || ''),
      deliveroo: normalizeUrl('deliveroo', links.deliveroo || ''),
      instagram: normalizeUrl('instagram', links.instagram || ''),
      facebook: normalizeUrl('facebook', links.facebook || ''),
      tiktok: normalizeUrl('tiktok', links.tiktok || ''),
      googleMaps: normalizeUrl('googleMaps', links.googleMaps || ''),
      customLabel: links.customLabel?.trim() || '',
      customUrl: links.customUrl ? normalizeUrl('customUrl', links.customUrl) : '',
    };

    // Build clean objects for socialLinks and externalLinks
    const finalSocialLinks = {
      instagram: cleanedSocialLinks.instagram || undefined,
      facebook: cleanedSocialLinks.facebook || undefined,
      tiktok: cleanedSocialLinks.tiktok || undefined,
      // For compatibility
      website: cleanedSocialLinks.website || undefined,
      uberEats: cleanedSocialLinks.uberEats || undefined,
      deliveroo: cleanedSocialLinks.deliveroo || undefined,
      googleMaps: cleanedSocialLinks.googleMaps || undefined,
      customLabel: cleanedSocialLinks.customLabel || undefined,
      customUrl: cleanedSocialLinks.customUrl || undefined,
    };

    const finalExternalLinks = {
      website: cleanedSocialLinks.website || undefined,
      uberEats: cleanedSocialLinks.uberEats || undefined,
      deliveroo: cleanedSocialLinks.deliveroo || undefined,
      googleMaps: cleanedSocialLinks.googleMaps || undefined,
      customLabel: cleanedSocialLinks.customLabel || undefined,
      customUrl: cleanedSocialLinks.customUrl || undefined,
    };

    const updatedRestaurant: Restaurant = {
      ...restaurant,
      socialLinks: finalSocialLinks,
      externalLinks: finalExternalLinks,
    };

    onSave(updatedRestaurant);
    onShowToast(`Réseaux sociaux et liens de « ${restaurant.name} » enregistrés ! 🌐`);
    onClose();
  };

  const hasAnyLink = Boolean(
    links.website ||
    links.uberEats ||
    links.deliveroo ||
    links.instagram ||
    links.facebook ||
    links.tiktok ||
    links.googleMaps ||
    links.customUrl
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 id="social-modal-title" className="text-base sm:text-lg font-serif font-bold text-white truncate flex items-center gap-2">
                <span>Réseaux sociaux & Liens web</span>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {restaurant.name}
                </span>
              </h2>
              <p className="text-xs text-stone-300 truncate">
                Ajoutez votre site, vos profils sociaux et vos plateformes de commande en ligne.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer shrink-0"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-stone-800">
          {/* Quick preset banner */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Astuce visibilité :</span> Vos clients pourront directement cliquer sur ces badges pour commander en livraison (Uber Eats / Deliveroo), visiter votre site officiel ou s'abonner à vos réseaux sociaux.
            </div>
          </div>

          {/* Section 1: Commandes & Livraison */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <span>🛵 Commandes & Livraison en Ligne</span>
              <span className="h-px bg-stone-200 flex-1"></span>
            </h3>

            {/* Uber Eats */}
            <div className="p-3 rounded-xl border border-stone-200 hover:border-emerald-300 bg-stone-50/50 transition">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-black tracking-wide">
                    UBER EATS
                  </span>
                  <span>Lien de commande Uber Eats</span>
                </label>
                {links.uberEats && (
                  <button
                    type="button"
                    onClick={() => handleTestLink('uberEats')}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Tester le lien</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={links.uberEats || ''}
                  onChange={(e) => handleChange('uberEats', e.target.value)}
                  placeholder="https://www.ubereats.com/fr/store/..."
                  className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                {links.uberEats && (
                  <button
                    type="button"
                    onClick={() => handleClear('uberEats')}
                    className="absolute right-2 top-2 text-stone-400 hover:text-stone-700 p-0.5"
                    title="Effacer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Deliveroo */}
            <div className="p-3 rounded-xl border border-stone-200 hover:border-cyan-300 bg-stone-50/50 transition">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#00cdbc] text-stone-950 font-mono text-[10px] font-black tracking-wide">
                    DELIVEROO
                  </span>
                  <span>Lien de commande Deliveroo</span>
                </label>
                {links.deliveroo && (
                  <button
                    type="button"
                    onClick={() => handleTestLink('deliveroo')}
                    className="text-[11px] text-cyan-700 hover:text-cyan-900 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Tester le lien</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={links.deliveroo || ''}
                  onChange={(e) => handleChange('deliveroo', e.target.value)}
                  placeholder="https://deliveroo.fr/fr/menu/..."
                  className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                />
                {links.deliveroo && (
                  <button
                    type="button"
                    onClick={() => handleClear('deliveroo')}
                    className="absolute right-2 top-2 text-stone-400 hover:text-stone-700 p-0.5"
                    title="Effacer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Réseaux Sociaux & Site Web */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <span>🌐 Présence en Ligne & Réseaux Sociaux</span>
              <span className="h-px bg-stone-200 flex-1"></span>
            </h3>

            {/* Site Web */}
            <div className="p-3 rounded-xl border border-stone-200 hover:border-amber-300 bg-stone-50/50 transition">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-stone-900 text-amber-400 flex items-center justify-center">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <span>Site Web officiel</span>
                </label>
                {links.website && (
                  <button
                    type="button"
                    onClick={() => handleTestLink('website')}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Tester le lien</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={links.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://mon-restaurant.fr"
                  className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
                {links.website && (
                  <button
                    type="button"
                    onClick={() => handleClear('website')}
                    className="absolute right-2 top-2 text-stone-400 hover:text-stone-700 p-0.5"
                    title="Effacer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Instagram */}
            <div className="p-3 rounded-xl border border-stone-200 hover:border-pink-300 bg-stone-50/50 transition">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center">
                    <Instagram className="w-3.5 h-3.5" />
                  </div>
                  <span>Instagram (profil ou @pseudo)</span>
                </label>
                {links.instagram && (
                  <button
                    type="button"
                    onClick={() => handleTestLink('instagram')}
                    className="text-[11px] text-pink-700 hover:text-pink-900 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Tester le lien</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={links.instagram || ''}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  placeholder="@monrestaurant ou https://www.instagram.com/..."
                  className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600"
                />
                {links.instagram && (
                  <button
                    type="button"
                    onClick={() => handleClear('instagram')}
                    className="absolute right-2 top-2 text-stone-400 hover:text-stone-700 p-0.5"
                    title="Effacer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Facebook */}
            <div className="p-3 rounded-xl border border-stone-200 hover:border-blue-300 bg-stone-50/50 transition">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#1877f2] text-white flex items-center justify-center">
                    <Facebook className="w-3.5 h-3.5" />
                  </div>
                  <span>Page Facebook</span>
                </label>
                {links.facebook && (
                  <button
                    type="button"
                    onClick={() => handleTestLink('facebook')}
                    className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Tester le lien</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={links.facebook || ''}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  placeholder="https://www.facebook.com/..."
                  className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                {links.facebook && (
                  <button
                    type="button"
                    onClick={() => handleClear('facebook')}
                    className="absolute right-2 top-2 text-stone-400 hover:text-stone-700 p-0.5"
                    title="Effacer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* TikTok */}
            <div className="p-3 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50/50 transition">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center font-bold text-[10px]">
                    🎵
                  </div>
                  <span>TikTok (compte ou @pseudo)</span>
                </label>
                {links.tiktok && (
                  <button
                    type="button"
                    onClick={() => handleTestLink('tiktok')}
                    className="text-[11px] text-stone-700 hover:text-stone-900 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Tester le lien</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={links.tiktok || ''}
                  onChange={(e) => handleChange('tiktok', e.target.value)}
                  placeholder="@monrestaurant ou https://www.tiktok.com/@..."
                  className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-600"
                />
                {links.tiktok && (
                  <button
                    type="button"
                    onClick={() => handleClear('tiktok')}
                    className="absolute right-2 top-2 text-stone-400 hover:text-stone-700 p-0.5"
                    title="Effacer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Google Maps / Fiche Avis */}
            <div className="p-3 rounded-xl border border-stone-200 hover:border-red-300 bg-stone-50/50 transition">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span>Fiche Google Maps & Avis</span>
                </label>
                {links.googleMaps && (
                  <button
                    type="button"
                    onClick={() => handleTestLink('googleMaps')}
                    className="text-[11px] text-red-700 hover:text-red-900 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Tester le lien</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={links.googleMaps || ''}
                  onChange={(e) => handleChange('googleMaps', e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                />
                {links.googleMaps && (
                  <button
                    type="button"
                    onClick={() => handleClear('googleMaps')}
                    className="absolute right-2 top-2 text-stone-400 hover:text-stone-700 p-0.5"
                    title="Effacer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Lien Personnalisé (TheFork, Réservation, etc.) */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <span>🔗 Autre Lien Personnalisé (Optionnel)</span>
              <span className="h-px bg-stone-200 flex-1"></span>
            </h3>

            <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Texte du badge (ex: TheFork, Réserver, Tripadvisor)
                  </label>
                  <input
                    type="text"
                    value={links.customLabel || ''}
                    onChange={(e) => handleChange('customLabel', e.target.value)}
                    placeholder="Ex: Réserver sur TheFork"
                    className="w-full text-xs bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800 focus:outline-none focus:border-stone-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    URL du lien
                  </label>
                  <input
                    type="text"
                    value={links.customUrl || ''}
                    onChange={(e) => handleChange('customUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800 focus:outline-none focus:border-stone-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setLinks({
                website: '',
                uberEats: '',
                deliveroo: '',
                instagram: '',
                facebook: '',
                tiktok: '',
                googleMaps: '',
                customLabel: '',
                customUrl: '',
              });
            }}
            className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer font-semibold py-1.5 px-2 rounded-lg hover:bg-stone-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tout effacer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-200 transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer les liens</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
