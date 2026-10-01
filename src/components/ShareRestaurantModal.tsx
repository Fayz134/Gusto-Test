import React, { useState } from 'react';
import {
  X,
  Share2,
  MessageCircle,
  Phone,
  Copy,
  Check,
  Navigation,
  ExternalLink,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Restaurant } from '../types';
import {
  buildShareMessage,
  openWhatsAppShare,
  openSmsShare,
  openWhatsAppReservation,
  copyShareText,
} from '../utils/sharing';
import { trackPhoneCall } from '../utils/analytics';

interface ShareRestaurantModalProps {
  isOpen: boolean;
  restaurant: Restaurant | null;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export const ShareRestaurantModal: React.FC<ShareRestaurantModalProps> = ({
  isOpen,
  restaurant,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !restaurant) return null;

  const previewMessage = buildShareMessage(restaurant);

  const handleCopy = async () => {
    const success = await copyShareText(restaurant);
    if (success) {
      setCopied(true);
      onShowToast('Texte et itinéraire copiés dans le presse-papier ! 📋');
      setTimeout(() => setCopied(false), 2500);
    } else {
      onShowToast('Impossible de copier automatiquement.');
    }
  };

  const handleWhatsAppShare = () => {
    openWhatsAppShare(restaurant);
    onShowToast('WhatsApp ouvert pour partager le restaurant ! 💬');
  };

  const handleSmsShare = () => {
    openSmsShare(restaurant);
    onShowToast('Application SMS ouverte ! 📱');
  };

  const handleReserveWhatsApp = () => {
    openWhatsAppReservation(restaurant);
    onShowToast(`Demande de réservation WhatsApp pour ${restaurant.name} ! 📅`);
  };

  const handleDirectCall = () => {
    trackPhoneCall(restaurant.id);
    window.location.href = `tel:${restaurant.phone}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-stone-300 w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#99281a] flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5 text-[#99281a]" />
            </div>
            <div>
              <h3 className="text-base font-serif font-black text-stone-900 leading-tight">
                Partager & Réserver
              </h3>
              <p className="text-[11px] text-stone-500">
                {restaurant.name} • Aubagne
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Restaurant Mini Preview Card */}
        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
          <img
            src={restaurant.banner}
            alt={restaurant.name}
            className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-xs"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-stone-900 truncate">
              {restaurant.name}
            </h4>
            <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-[#99281a] shrink-0" />
              <span className="truncate">{restaurant.address}</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700">
                {restaurant.cuisine}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">
                {restaurant.openingHours.isOpenNow ? '● Ouvert' : '● Fermé'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1: CONVERSION & RESERVATION DIRECTE */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Réservation & Contact direct
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleReserveWhatsApp}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex flex-col items-center justify-center gap-1 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp</span>
              </div>
              <span className="text-[10px] font-normal text-emerald-100">
                Réservation 1-clic
              </span>
            </button>

            <button
              type="button"
              onClick={handleDirectCall}
              className="p-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl flex flex-col items-center justify-center gap-1 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Appeler</span>
              </div>
              <span className="text-[10px] font-normal text-stone-300">
                {restaurant.phone}
              </span>
            </button>
          </div>
        </div>

        {/* SECTION 2: PARTAGER L'ITINERAIRE ET LE RESTO */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Inviter des amis ou des proches
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* WhatsApp Share */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            {/* SMS Share */}
            <button
              type="button"
              onClick={handleSmsShare}
              className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 rounded-2xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition active:scale-95 cursor-pointer"
            >
              <Share2 className="w-5 h-5 text-blue-600" />
              <span>SMS</span>
            </button>

            {/* Copy Clipboard */}
            <button
              type="button"
              onClick={handleCopy}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition active:scale-95 cursor-pointer border ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-white" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-stone-700" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            Aperçu du message envoyé :
          </span>
          <div className="bg-stone-100/90 rounded-2xl p-3 border border-stone-200 text-xs text-stone-700 font-mono whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
            {previewMessage}
          </div>
        </div>

        {/* GPS direct button */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.coords.lat},${restaurant.coords.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 bg-[#99281a] hover:bg-[#781524] text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-xs shadow-md transition active:scale-98 cursor-pointer"
        >
          <Navigation className="w-4 h-4 text-amber-300" />
          <span>Ouvrir l'itinéraire Google Maps en direct</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      </div>
    </div>
  );
};
