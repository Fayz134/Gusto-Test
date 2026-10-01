import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);
  const [justRestored, setJustRestored] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
      setJustRestored(false);
    } else {
      // Just came back online
      setJustRestored(true);
      const timer = setTimeout(() => setJustRestored(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (isOnline && !justRestored) {
    return null;
  }

  if (dismissed && !justRestored) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
      {justRestored ? (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-emerald-700 text-white shadow-xl border border-emerald-500 text-xs font-bold">
          <Wifi className="w-4 h-4 text-emerald-200" />
          <span>Connexion rétablie — Données en direct synchronisées !</span>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-900/95 backdrop-blur-md text-white shadow-2xl border border-amber-400/40 text-xs">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <WifiOff className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0 pr-1 space-y-0.5">
            <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
              <span>Mode Hors-Ligne (PWA)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            </div>
            <p className="text-[11px] text-stone-300 leading-tight">
              Réseau indisponible. Les restaurants, menus, numéros de téléphone et carte en cache restent 100% consultables.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
            title="Masquer l'alerte"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
