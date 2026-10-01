import React, { useState } from 'react';
import { Download, Smartphone, Check, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'nav' | 'hero' | 'floating' | 'banner';
  onShowToast?: (message: string) => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'nav',
  onShowToast,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running inside installed standalone app, suppress the button
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    // If browser supports native beforeinstallprompt, trigger it directly!
    if (isInstallable) {
      const ok = await install();
      if (ok && onShowToast) {
        onShowToast('Installation de Gusto réussie ! Retrouvez l\'icône sur votre écran d\'accueil. 📲');
      } else if (!ok) {
        // Open modal if user dismissed or cancelled
        setIsModalOpen(true);
      }
    } else {
      // Open guided modal (essential for iOS Safari and other browsers)
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {variant === 'nav' && (
        <button
          type="button"
          onClick={handleClick}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-sm border border-amber-300 active:scale-95 ${className}`}
          title="Installer Gusto sur votre smartphone ou ordinateur (Mode Hors-Ligne & 1-Clic)"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Installer l'App</span>
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-950 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-stone-950"></span>
          </span>
        </button>
      )}

      {variant === 'hero' && (
        <button
          type="button"
          onClick={handleClick}
          className={`px-4 py-2.5 rounded-2xl bg-white/95 hover:bg-white text-stone-900 font-bold text-xs flex items-center gap-2 shadow-lg border border-amber-300/80 transition-all active:scale-95 cursor-pointer ${className}`}
        >
          <Smartphone className="w-4 h-4 text-[#99281a]" />
          <span>Installer l'App mobile (1 clic)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold">
            PWA
          </span>
        </button>
      )}

      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-stone-900 via-[#1c1917] to-[#292524] text-white p-3.5 rounded-3xl border border-amber-400/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Smartphone className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-white flex items-center gap-1.5">
                <span>Installez Gusto sur votre écran d'accueil</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded-md border border-amber-400/30">
                  Sans App Store
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                Accès instantané aux menus, carte interactive et appels rapides même avec un réseau faible.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClick}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installer en 1 clic</span>
          </button>
        </div>
      )}

      {/* Guided Modal */}
      <PWAInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onShowToast={onShowToast}
      />
    </>
  );
};
