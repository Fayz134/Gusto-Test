import React, { useEffect } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Compass,
  Clock,
  Phone,
  ExternalLink,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';
import { Restaurant } from '../types';

interface RestaurantMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
}

export const RestaurantMapModal: React.FC<RestaurantMapModalProps> = ({
  isOpen,
  onClose,
  restaurant,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const lat = restaurant.coords?.lat ?? 43.2925;
  const lng = restaurant.coords?.lng ?? 5.5708;

  // External directions URL
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${restaurant.name} ${restaurant.address}`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#f8f5f0] paper-texture rounded-3xl border border-stone-300 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-stone-200/80 bg-white/60 flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60 px-2 py-0.5 rounded-full">
                {restaurant.cuisine}
              </span>
              <span className="text-[10px] font-mono font-bold bg-[#99281a]/10 text-[#99281a] px-2 py-0.5 rounded-full">
                {restaurant.priceRange}
              </span>
            </div>
            <h3
              id="map-modal-title"
              className="text-lg sm:text-xl font-serif font-black text-stone-900 tracking-tight"
            >
              {restaurant.name}
            </h3>
            <p className="text-xs text-stone-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#99281a] shrink-0" />
              <span>{restaurant.address}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-700 transition cursor-pointer shrink-0"
            aria-label="Fermer le plan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* VISUAL PLACEHOLDER MAP (STYLED IN APP'S PAPER THEME COLORS) */}
        <div className="relative w-full h-72 sm:h-80 bg-[#f4eee4] overflow-hidden select-none border-y border-stone-300/70">
          {/* Vector Cartographic Illustration with Paper Texture */}
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 350"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Paper Hatch Pattern */}
              <pattern id="paper-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e6dcce" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="1" fill="#cbbeab" />
              </pattern>

              {/* Park Hatch Pattern */}
              <pattern id="park-dots" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#b9cca9" opacity="0.6" />
              </pattern>
            </defs>

            {/* Base Background */}
            <rect width="100%" height="100%" fill="#f7f3ec" />
            <rect width="100%" height="100%" fill="url(#paper-grid)" />

            {/* Natural Elements / Park blocks */}
            <path
              d="M 20 20 Q 80 15 110 50 L 95 120 Q 40 110 20 80 Z"
              fill="#e7efdf"
              stroke="#d0dfc2"
              strokeWidth="1.2"
            />
            <path
              d="M 20 20 Q 80 15 110 50 L 95 120 Q 40 110 20 80 Z"
              fill="url(#park-dots)"
            />

            <path
              d="M 380 190 Q 460 200 480 260 L 410 320 Q 360 280 370 230 Z"
              fill="#e7efdf"
              stroke="#d0dfc2"
              strokeWidth="1.2"
            />

            {/* Waterway / Canal Curve in soft aqua paper tone */}
            <path
              d="M -20 280 C 120 260, 220 330, 360 310 C 420 300, 480 340, 520 330"
              fill="none"
              stroke="#d4e6eb"
              strokeWidth="24"
              strokeLinecap="round"
            />
            <path
              d="M -20 280 C 120 260, 220 330, 360 310 C 420 300, 480 340, 520 330"
              fill="none"
              stroke="#bdd8e0"
              strokeWidth="1.5"
            />

            {/* City Urban Blocks in subtle warm paper tones */}
            <rect x="135" y="30" width="90" height="75" rx="8" fill="#efe7db" stroke="#decaba" strokeWidth="1.2" />
            <rect x="250" y="25" width="110" height="85" rx="8" fill="#efe7db" stroke="#decaba" strokeWidth="1.2" />
            <rect x="385" y="35" width="95" height="110" rx="8" fill="#efe7db" stroke="#decaba" strokeWidth="1.2" />

            <rect x="35" y="150" width="85" height="90" rx="8" fill="#efe7db" stroke="#decaba" strokeWidth="1.2" />
            <rect x="145" y="225" width="115" height="65" rx="8" fill="#efe7db" stroke="#decaba" strokeWidth="1.2" />
            <rect x="285" y="235" width="70" height="60" rx="8" fill="#efe7db" stroke="#decaba" strokeWidth="1.2" />

            {/* Secondary Street Network */}
            <path d="M 0 130 L 500 130" stroke="#fcfaf7" strokeWidth="16" />
            <path d="M 0 130 L 500 130" stroke="#dfd2c0" strokeWidth="1.5" strokeDasharray="6 4" />

            <path d="M 130 0 L 130 350" stroke="#fcfaf7" strokeWidth="14" />
            <path d="M 130 0 L 130 350" stroke="#dfd2c0" strokeWidth="1.5" strokeDasharray="6 4" />

            <path d="M 370 0 L 370 350" stroke="#fcfaf7" strokeWidth="14" />
            <path d="M 370 0 L 370 350" stroke="#dfd2c0" strokeWidth="1.5" strokeDasharray="6 4" />

            <path d="M 0 215 L 500 215" stroke="#fcfaf7" strokeWidth="16" />
            <path d="M 0 215 L 500 215" stroke="#dfd2c0" strokeWidth="1.5" strokeDasharray="6 4" />

            {/* Main Avenue crossing near center (Avenue Gourmande) */}
            <path
              d="M 50 350 L 250 175 L 450 0"
              stroke="#ffffff"
              strokeWidth="22"
              strokeLinecap="round"
            />
            <path
              d="M 50 350 L 250 175 L 450 0"
              stroke="#99281a"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              opacity="0.35"
            />

            {/* Approach Route dashed line to restaurant pin */}
            <path
              d="M 130 215 Q 190 205 250 175"
              fill="none"
              stroke="#99281a"
              strokeWidth="3"
              strokeDasharray="5 5"
              strokeLinecap="round"
            />

            {/* User Location Departure Dot */}
            <circle cx="130" cy="215" r="5" fill="#1e4e2b" stroke="#ffffff" strokeWidth="2" />
          </svg>

          {/* COMPASS ROSE IN TOP RIGHT */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-2xl border border-stone-300 shadow-xs flex items-center gap-1.5 text-stone-700">
            <Compass className="w-4 h-4 text-[#99281a] animate-spin-slow" />
            <div className="flex flex-col leading-none">
              <span className="font-mono font-black text-[10px] text-stone-900">N 0°</span>
              <span className="text-[8px] font-mono text-stone-500 uppercase">Cap</span>
            </div>
          </div>

          {/* VISUAL WATERMARK / BADGE */}
          <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1.5 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Repère Cartographique</span>
          </div>

          {/* RESTAURANT LOCATION PIN AT CENTER */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
            {/* Animated Pin Tooltip */}
            <div className="bg-[#14171a] text-white px-3 py-1.5 rounded-2xl shadow-xl border border-amber-400/40 text-center whitespace-nowrap mb-1 flex items-center gap-1.5 transform hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-3 h-3 text-amber-300 shrink-0" />
              <div className="text-left leading-tight">
                <div className="text-[11px] font-bold text-white max-w-[170px] truncate">
                  {restaurant.name}
                </div>
                <div className="text-[9px] text-amber-300/90 font-mono">
                  {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                </div>
              </div>
            </div>

            {/* Marker Pin Pinhead */}
            <div className="relative flex items-center justify-center">
              {/* Radar Pulsing Wave */}
              <div className="absolute w-12 h-12 rounded-full bg-[#99281a]/30 animate-ping" />
              <div className="absolute w-8 h-8 rounded-full bg-[#99281a]/40" />

              {/* Physical Map Pin Jewel */}
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#99281a] via-[#b83322] to-amber-600 border-2 border-white shadow-xl flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white fill-white" />
              </div>
            </div>

            {/* Pin shadow on the map paper */}
            <div className="w-6 h-2 rounded-full bg-stone-900/25 blur-[1px] mt-0.5" />
          </div>

          {/* MAP FOOTER OVERLAYS: COORDINATES & SCALE */}
          <div className="absolute bottom-2.5 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-stone-300 text-[10px] font-mono text-stone-700 shadow-2xs">
            <span className="text-stone-400">GPS: </span>
            <strong className="text-stone-900">{lat.toFixed(4)}° N</strong>,{' '}
            <strong className="text-stone-900">{lng.toFixed(4)}° E</strong>
          </div>

          <div className="absolute bottom-2.5 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-stone-300 text-[9px] font-mono text-stone-600 shadow-2xs flex items-center gap-1.5">
            <div className="w-8 h-0.5 bg-stone-800 relative">
              <div className="absolute -top-1 left-0 w-0.5 h-2.5 bg-stone-800" />
              <div className="absolute -top-1 right-0 w-0.5 h-2.5 bg-stone-800" />
            </div>
            <span>200 m</span>
          </div>
        </div>

        {/* MODAL FOOTER & DETAILS */}
        <div className="p-4 sm:p-5 bg-white/80 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Distance */}
            <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-stone-500 font-medium">Distance</div>
                <div className="font-bold text-stone-900 truncate">
                  {restaurant.distance !== undefined
                    ? `${restaurant.distance} km du centre`
                    : 'Aubagne Centre'}
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-stone-500 font-medium">État du service</div>
                <div className="font-bold text-stone-900 truncate flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      restaurant.openingHours.isOpenNow ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span>
                    {restaurant.openingHours.isOpenNow ? 'Ouvert maintenant' : 'Fermé'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer text-center"
            >
              <span>Itinéraire Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-300" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-2xl transition cursor-pointer border border-stone-200"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
