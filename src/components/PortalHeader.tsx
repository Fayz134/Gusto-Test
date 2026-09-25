import React from 'react';
import { MapPin, Sparkles, UtensilsCrossed, KeyRound, SlidersHorizontal, Crown } from 'lucide-react';
import { Language } from '../types';
import { I18N_DICT } from '../data/i18n';

interface PortalHeaderProps {
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
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  currentLang,
  onLanguageChange,
  userCoords,
  onRequestGeolocation,
  isAdmin = false,
  onOpenAdminModal,
  onOpenCreatorDashboard,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#99281a] to-[#781524] text-[#dfab43] border border-[#c58b2b]/40 flex items-center justify-center font-cinzel font-black text-lg sm:text-xl shadow-md shrink-0">
            G
          </div>
          <div>
            <h1 className="font-serif font-black text-lg sm:text-2xl tracking-tight text-stone-900 flex items-center gap-1">
              Gusto
              <span className="w-1.5 h-1.5 rounded-full bg-[#99281a] inline-block"></span>
            </h1>
            <p className="text-[10px] text-stone-500 font-mono hidden sm:block">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Controls: Location + Lang */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* City Location Pill */}
          <button
            onClick={onRequestGeolocation}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer max-w-[150px] sm:max-w-none truncate ${
              userCoords.active
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
            }`}
            title={userCoords.active ? `Ville : ${userCoords.label}` : t('locateMe')}
          >
            <MapPin
              className={`w-3.5 h-3.5 shrink-0 ${
                userCoords.active
                  ? 'text-emerald-600 animate-bounce'
                  : 'text-stone-500'
              }`}
            />
            <span className="truncate font-medium">
              {userCoords.active ? (
                <span className="truncate font-bold">{userCoords.label}</span>
              ) : (
                <>
                  <span className="hidden sm:inline">{t('locateMe')}</span>
                  <span className="sm:hidden">{userCoords.label || 'Aubagne'}</span>
                </>
              )}
            </span>
            {userCoords.active && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            )}
          </button>

          {/* Language Selector */}
          <select
            value={currentLang}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="bg-white hover:bg-stone-50 border border-stone-300 rounded-full px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold text-stone-800 focus:outline-none cursor-pointer shadow-xs"
            aria-label="Sélectionner la langue"
          >
            <option value="fr">🇫🇷 FR</option>
            <option value="it">🇮🇹 IT</option>
            <option value="en">🇬🇧 EN</option>
          </select>

          {/* Espace Privé Button */}
          {onOpenAdminModal && (
            <button
              onClick={onOpenAdminModal}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 shrink-0 ${
                isAdmin
                  ? 'bg-[#99281a] text-white hover:bg-[#781524]'
                  : 'bg-[#781524] text-white hover:bg-[#99281a] border border-amber-400/40'
              }`}
              title={isAdmin ? 'Gérer la carte' : "Accéder à l'Espace Privé"}
              aria-label={isAdmin ? 'Gérer la carte' : 'Espace Privé'}
            >
              {isAdmin ? (
                <SlidersHorizontal className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              ) : (
                <KeyRound className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-300" />
              )}
              <span className="hidden sm:inline font-bold">
                {isAdmin ? 'Gérer carte' : 'Espace Privé'}
              </span>
            </button>
          )}

          {/* Master Creator Dashboard Button */}
          {onOpenCreatorDashboard && (
            <button
              onClick={onOpenCreatorDashboard}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 shrink-0 bg-stone-900 hover:bg-black text-amber-300 border border-amber-500/40 hover:border-amber-400"
              title="Accès Dashboard Créateur / Super-Admin (Affluences & Gestion)"
              aria-label="Dashboard Créateur"
            >
              <Crown className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span className="hidden md:inline font-black tracking-tight">
                Dashboard Créateur
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
