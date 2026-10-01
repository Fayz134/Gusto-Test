import React from 'react';
import {
  X,
  Smartphone,
  Download,
  WifiOff,
  Zap,
  ShieldCheck,
  Share2,
  PlusSquare,
  Check,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok && onShowToast) {
        onShowToast('Installation de Gusto lancée sur votre appareil ! 📲');
      }
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-stone-200 w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with App Icon */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#99281a] to-amber-600 p-0.5 shadow-md flex items-center justify-center text-white shrink-0">
              <img
                src="/icon.svg"
                alt="Gusto Logo"
                className="w-full h-full rounded-[14px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/pwa-192x192.png';
                }}
              />
            </div>
            <div>
              <h3 className="text-base font-serif font-black text-stone-900 leading-tight">
                Installer Gusto
              </h3>
              <p className="text-xs text-amber-800 font-semibold">
                Application Web Progressive (PWA)
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

        {/* Benefits Cards */}
        <div className="space-y-2.5">
          <p className="text-xs text-stone-600 leading-relaxed">
            Installez Gusto directement sur votre écran d'accueil sans passer par l'App Store ni Google Play Store :
          </p>

          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <strong className="text-stone-900 block font-bold">Accès direct en 1 clic</strong>
                <span className="text-stone-500 text-[11px]">
                  Icône dédiée sur votre écran d'accueil avec ouverture plein écran instantanée.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <WifiOff className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <strong className="text-stone-900 block font-bold">Mode Hors-Ligne & Réseau faible</strong>
                <span className="text-stone-500 text-[11px]">
                  Consultez les menus, la carte et les numéros de réservation même en zone blanche.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs">
              <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <strong className="text-stone-900 block font-bold">Léger & Sécurisé</strong>
                <span className="text-stone-500 text-[11px]">
                  Prend moins de 2 Mo d'espace, mises à jour automatiques transparentes.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SPECIFIC PLATFORM INSTRUCTIONS */}
        {isInstalled ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2.5">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Gusto est déjà installé et actif en mode autonome sur cet appareil !</span>
          </div>
        ) : isIOS ? (
          /* iOS Safari Step-by-step instructions */
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300/80 space-y-2">
            <div className="flex items-center gap-1.5 font-black text-xs text-amber-950">
              <Smartphone className="w-4 h-4 text-amber-700" />
              <span>Installation sur iPhone / iPad (Safari) :</span>
            </div>
            <ol className="text-xs text-stone-700 space-y-1.5 list-decimal pl-4 leading-relaxed font-medium">
              <li>
                Appuyez sur le bouton de <strong className="text-stone-900 font-bold">Partage</strong>{' '}
                <Share2 className="w-3.5 h-3.5 inline text-blue-600 -mt-0.5" /> dans la barre Safari (en bas ou en haut).
              </li>
              <li>
                Faites défiler vers le bas et touchez <strong className="text-stone-900 font-bold">« Sur l'écran d'accueil »</strong>{' '}
                <PlusSquare className="w-3.5 h-3.5 inline text-stone-700 -mt-0.5" />.
              </li>
              <li>
                Validez en appuyant sur <strong className="text-[#99281a] font-bold">« Ajouter »</strong> en haut à droite.
              </li>
            </ol>
          </div>
        ) : isInstallable ? (
          /* Android / Chrome 1-Click Install Button */
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-3 bg-[#99281a] hover:bg-[#781524] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Installer Gusto sur cet appareil (1 Clic)</span>
          </button>
        ) : (
          /* Standard Desktop Browser instructions */
          <div className="p-3 rounded-2xl bg-stone-100 text-stone-700 text-xs space-y-1.5 border border-stone-200">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#99281a]" />
              <span>Sur votre navigateur Chrome / Edge :</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Cliquez sur l'icône d'installation dans la barre d'adresse de votre navigateur ou dans le menu (<strong>⋮</strong>) &gt; <strong>« Installer Gusto »</strong>.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
