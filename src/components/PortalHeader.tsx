import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Building2,
  Sparkles,
  Menu,
  X,
  ArrowLeft,
  ChevronRight,
  Map,
} from 'lucide-react';
import { Language } from '../types';
import { I18N_DICT } from '../data/i18n';

export interface PortalHeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  userCoords: {
    lat: number;
    lng: number;
    active: boolean;
    label: string;
  };
  onRequestGeolocation: () => void;
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
  onOpenCreatorDashboard?: () => void;
  onOpenRegistrationModal?: () => void;
  onOpenMap?: () => void;
  isMapActive?: boolean;
  currentView?: 'portal' | 'restaurant' | 'creator-dashboard';
  onNavigatePortal?: () => void;
  onNavigateRestaurant?: () => void;
  onOpenAllergenModal?: () => void;
  activeAllergensCount?: number;
  onScrollToNutrition?: () => void;
  onLogoutAdmin?: () => void;
  activeRestaurantName?: string;
  pendingRegistrationsCount?: number;
  restaurantsCount?: number;
  onOpenDietaryProfile?: () => void;
  hasSavedDietaryProfile?: boolean;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  currentLang,
  onLanguageChange,
  userCoords,
  onRequestGeolocation,
  onOpenRegistrationModal,
  onOpenMap,
  isMapActive = false,
  currentView = 'portal',
  onNavigatePortal,
  onOpenAllergenModal,
  activeAllergensCount = 0,
  activeRestaurantName,
  restaurantsCount,
  onOpenDietaryProfile,
  hasSavedDietaryProfile = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [mobileMenuOpen]);

  const handlePortalClick = () => {
    setMobileMenuOpen(false);
    if (onNavigatePortal) {
      onNavigatePortal();
    }
  };

  const handleAllergensClick = () => {
    setMobileMenuOpen(false);
    if (onOpenAllergenModal) {
      onOpenAllergenModal();
    }
  };

  const handleRegistrationClick = () => {
    setMobileMenuOpen(false);
    if (onOpenRegistrationModal) {
      onOpenRegistrationModal();
    }
  };

  return (
    <header className="fixed top-0 sm:top-3 inset-x-0 z-50 px-2 sm:px-4 md:px-6 pointer-events-none flex flex-col items-center pt-[env(safe-area-inset-top,0px)]">
      {/* MASTER LUXURY NAVIGATION BAR CONTAINER */}
      <nav
        aria-label="Navigation principale Gusto"
        className="pointer-events-auto relative w-full max-w-6xl bg-[#0e1116]/95 backdrop-blur-2xl border border-white/10 sm:border-white/15 rounded-2xl sm:rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.08)_inset] px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-4 transition-all duration-300 ring-1 ring-black/40 min-h-[48px] sm:min-h-[54px]"
      >
        {/* LEFT SECTION: BRANDING & CONTEXTUAL BREADCRUMB */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePortalClick}
            className="flex items-center gap-2 cursor-pointer group transition-all text-left touch-manipulation min-h-[38px]"
            title="Gusto - Accueil & Guide des restaurants"
          >
            {/* Elegant gastronomic jewel logo icon */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#99281a] via-[#b83322] to-amber-600 flex items-center justify-center shadow-[0_4px_12px_rgba(153,40,26,0.5)] border border-amber-400/30 group-hover:scale-105 active:scale-95 transition-transform duration-200">
              <UtensilsCrossed className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-200" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-xl sm:text-2xl tracking-tight text-white group-hover:text-amber-200 transition-colors leading-none">
                  Gusto
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
              </div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-stone-400 uppercase hidden sm:block leading-none mt-0.5">
                Aubagne & Provence
              </span>
            </div>
          </button>

          {/* Contextual Sub-Badge: Active Restaurant name */}
          {currentView === 'restaurant' && activeRestaurantName && (
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-white/15 text-xs text-stone-300">
              <button
                type="button"
                onClick={handlePortalClick}
                className="hover:text-amber-300 transition flex items-center gap-1 font-semibold text-stone-400 text-[11px]"
                title="Revenir à l'accueil"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Accueil</span>
              </button>
              <span className="text-stone-600">/</span>
              <span className="font-bold text-white truncate max-w-[140px] bg-white/5 px-2 py-0.5 rounded-full border border-white/10 text-[11px]">
                {activeRestaurantName}
              </span>
            </div>
          )}
        </div>

        {/* CENTER SECTION: DESKTOP NAVIGATION PILLS */}
        <div className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs font-semibold text-stone-300 bg-white/5 p-1 rounded-full border border-white/10">
          {/* 1. Carte Interactive (Live GPS) */}
          {onOpenMap && (
            <button
              type="button"
              onClick={onOpenMap}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                isMapActive
                  ? 'bg-amber-400 text-stone-950 font-black shadow-xs border border-amber-300 ring-2 ring-amber-400/30'
                  : 'hover:text-amber-300 hover:bg-white/10 text-stone-200'
              }`}
              title="Ouvrir la carte interactive géolocalisée des restaurants d'Aubagne"
            >
              <Map className={`w-3.5 h-3.5 ${isMapActive ? 'text-stone-950' : 'text-amber-400'}`} />
              <span>Carte Interactive</span>
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </button>
          )}

          {/* 2. Allergènes with dynamic count badge */}
          <button
            type="button"
            onClick={handleAllergensClick}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAllergensCount > 0
                ? 'bg-rose-500/25 text-rose-200 border border-rose-500/40 font-bold'
                : 'hover:text-white hover:bg-white/10 text-stone-300'
            }`}
            title="Filtrer les restaurants par allergènes à exclure"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('allergens') || 'Allergènes'}</span>
            {activeAllergensCount > 0 && (
              <span className="bg-rose-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full leading-none">
                {activeAllergensCount}
              </span>
            )}
          </button>

          {/* 3. Mon Profil Diététique Sauvegardé */}
          {onOpenDietaryProfile && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDietaryProfile();
              }}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                hasSavedDietaryProfile
                  ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 font-bold'
                  : 'hover:text-emerald-300 hover:bg-white/10 text-stone-300'
              }`}
              title="Mon Profil Diététique (Allergies et régimes enregistrés dans le navigateur)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Profil</span>
              {hasSavedDietaryProfile && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
              )}
            </button>
          )}
        </div>

        {/* RIGHT SECTION: CTA INSCRIRE UN RESTAURANT, GEOLOCATION, LANGUAGE */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Location button with live GPS detection */}
          <button
            type="button"
            onClick={onRequestGeolocation}
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition cursor-pointer text-xs font-medium border ${
              userCoords.active
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-white/5 border-white/10 text-stone-300 hover:text-white hover:bg-white/10'
            }`}
            title={userCoords.active ? `Position active : ${userCoords.label} (cliquez pour actualiser)` : 'Localiser ma ville'}
          >
            <span className="relative flex h-2 w-2">
              {userCoords.active && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${userCoords.active ? 'bg-emerald-400' : 'bg-stone-500'}`}></span>
            </span>
            <span className="truncate max-w-[90px]">{userCoords.label || 'Aubagne'}</span>
          </button>

          {/* Quick Mobile Carte Interactive button */}
          {onOpenMap && (
            <button
              type="button"
              onClick={onOpenMap}
              className={`md:hidden px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer active:scale-95 shrink-0 touch-manipulation min-h-[36px] ${
                isMapActive
                  ? 'bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/15'
              }`}
              title="Afficher la Carte Interactive"
            >
              <Map className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">Carte</span>
              <span className="flex h-1.5 w-1.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
              </span>
            </button>
          )}

          {/* CTA: Inscrire mon restaurant (Sole professional action in navbar on tablet & desktop) */}
          {onOpenRegistrationModal && (
            <button
              type="button"
              onClick={handleRegistrationClick}
              className="hidden sm:flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#99281a] via-[#b92c1d] to-amber-600 hover:from-[#b02e1e] hover:to-amber-500 text-white text-xs font-bold shadow-[0_4px_14px_rgba(153,40,26,0.45)] hover:shadow-[0_6px_18px_rgba(153,40,26,0.6)] border border-amber-400/30 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] shrink-0 touch-manipulation"
              title="Inscrire un restaurant ou créer une page sur Gusto"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              <span>Inscrire</span>
            </button>
          )}

          {/* Modern Language Pill Selector */}
          <div className="relative shrink-0">
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-full px-2 sm:px-2.5 py-1 text-xs font-bold focus:outline-none cursor-pointer transition shadow-xs appearance-none pr-4.5 sm:pr-5 text-center min-h-[36px] touch-manipulation"
              aria-label="Sélectionner la langue"
            >
              <option value="fr" className="bg-[#14171a] text-white">FR</option>
              <option value="it" className="bg-[#14171a] text-white">IT</option>
              <option value="en" className="bg-[#14171a] text-white">EN</option>
              <option value="es" className="bg-[#14171a] text-white">ES</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-stone-400">
              <ChevronRight className="w-2.5 h-2.5 rotate-90" />
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-full transition cursor-pointer shrink-0 border min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation active:scale-95 ${
              mobileMenuOpen
                ? 'bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-400/40 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            }`}
            aria-label="Ouvrir le menu de navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </nav>

      {/* MOBILE EXPANDED MENU DRAWER WITH BACKDROP SCRIM */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop scrim to dismiss on tap outside */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 pointer-events-auto md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer menu content card */}
          <div className="pointer-events-auto relative z-50 mt-2 w-full max-w-md max-h-[82vh] overflow-y-auto no-scrollbar rounded-3xl bg-[#0f1217]/98 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl space-y-3 ring-1 ring-white/10 animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Top Quick Status */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-white text-base">Gusto</span>
              <span className="text-[10px] bg-white/10 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                {userCoords.label || 'Aubagne'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-full text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Navigation Grid */}
          <div className="space-y-1.5">
            {/* Carte Interactive Mobile Hero Button */}
            {onOpenMap && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenMap();
                }}
                className={`w-full p-3 rounded-2xl flex items-center justify-between transition cursor-pointer text-left ${
                  isMapActive
                    ? 'bg-amber-400 text-stone-950 border border-amber-300 font-bold shadow-md'
                    : 'bg-gradient-to-r from-amber-500/20 via-[#99281a]/25 to-stone-800 text-white border border-amber-400/40 hover:border-amber-400/70 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isMapActive ? 'bg-stone-950 text-amber-400' : 'bg-amber-400/25 text-amber-300'
                  }`}>
                    <Map className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs flex items-center gap-1.5">
                      <span>Carte Interactive</span>
                      <span className={`px-1.5 py-0.2 text-[9px] font-black rounded-md ${
                        isMapActive ? 'bg-stone-950 text-amber-300' : 'bg-amber-400 text-stone-950'
                      }`}>
                        LIVE GPS
                      </span>
                    </div>
                    <div className={`text-[10px] ${isMapActive ? 'text-stone-800' : 'text-stone-300'}`}>
                      Géolocalisation & filtres Provence
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isMapActive ? 'text-stone-950' : 'text-amber-300'}`} />
              </button>
            )}

            {/* Allergènes */}
            <button
              type="button"
              onClick={handleAllergensClick}
              className={`w-full p-3 rounded-2xl flex items-center justify-between transition cursor-pointer text-left ${
                activeAllergensCount > 0
                  ? 'bg-rose-500/25 border border-rose-500/40 text-rose-200 font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <span>Filtre Allergènes</span>
                    {activeAllergensCount > 0 && (
                      <span className="bg-rose-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full">
                        {activeAllergensCount} actif{activeAllergensCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400 font-normal">
                    Exclure gluten, lactose, fruits à coque, etc.
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Mon Profil Diététique Sauvegardé */}
            {onOpenDietaryProfile && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDietaryProfile();
                }}
                className={`w-full p-3 rounded-2xl flex items-center justify-between transition cursor-pointer text-left ${
                  hasSavedDietaryProfile
                    ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <span>Mon Profil Diététique</span>
                      {hasSavedDietaryProfile && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-stone-950 font-black">
                          Enregistré
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400 font-normal">
                      Allergies & préférences sauvegardées dans le navigateur
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            )}
          </div>

          {/* Section: Inscrire mon restaurant (Sole Professional Action) */}
          {onOpenRegistrationModal && (
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleRegistrationClick}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#99281a] via-[#b92c1d] to-amber-600 hover:from-[#b02e1e] hover:to-amber-500 text-white flex items-center justify-between transition cursor-pointer text-xs font-bold shadow-lg border border-amber-400/30 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-amber-200" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white text-xs">Inscrire mon restaurant</div>
                    <div className="text-[10px] text-amber-200/90 font-normal">
                      Rejoindre le guide officiel Gusto Aubagne
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-200 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* Bottom Settings: Location & Languages */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestGeolocation();
              }}
              className="flex items-center gap-1.5 text-stone-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[120px]">{userCoords.label || 'Aubagne'}</span>
            </button>

            {/* Segmented language buttons */}
            <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/10">
              {(['fr', 'it', 'en', 'es'] as Language[]).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => onLanguageChange(lng)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                    currentLang === lng
                      ? 'bg-amber-500 text-stone-950'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {lng}
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    )}
    </header>
  );
};
