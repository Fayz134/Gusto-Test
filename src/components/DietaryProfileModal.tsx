import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Check,
  RotateCcw,
  Sparkles,
  Save,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { DietaryProfile, AMENITIES_MASTER_LIST } from '../types';
import { ALLERGENS_MASTER_LIST } from '../data/i18n';
import {
  getSavedDietaryProfile,
  saveDietaryProfile,
  clearSavedDietaryProfile,
} from '../utils/dietaryProfile';

interface DietaryProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (profile: DietaryProfile) => void;
  onShowToast: (message: string) => void;
}

export const DietaryProfileModal: React.FC<DietaryProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
  onShowToast,
}) => {
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [isHalal, setIsHalal] = useState<boolean>(false);
  const [isVegan, setIsVegan] = useState<boolean>(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [maxKcal, setMaxKcal] = useState<number | undefined>(undefined);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Load saved profile on open
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedDietaryProfile();
      if (saved) {
        setSelectedAllergens(saved.allergens || []);
        setIsHalal(saved.isHalal || false);
        setIsVegan(saved.isVegan || false);
        setSelectedAmenities(saved.amenities || []);
        setMaxKcal(saved.maxKcal);
        setIsSaved(true);
        setSavedAt(saved.savedAt || null);
      } else {
        setSelectedAllergens([]);
        setIsHalal(false);
        setIsVegan(false);
        setSelectedAmenities([]);
        setMaxKcal(undefined);
        setIsSaved(false);
        setSavedAt(null);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const profile: DietaryProfile = {
      allergens: selectedAllergens,
      isHalal,
      isVegan,
      amenities: selectedAmenities,
      maxKcal,
      savedAt: new Date().toISOString(),
    };

    saveDietaryProfile(profile);
    setIsSaved(true);
    setSavedAt(profile.savedAt || null);
    onProfileUpdated(profile);
    onShowToast('Profil diététique sauvegardé dans votre navigateur ! 🛡️');
    onClose();
  };

  const handleClear = () => {
    clearSavedDietaryProfile();
    setSelectedAllergens([]);
    setIsHalal(false);
    setIsVegan(false);
    setSelectedAmenities([]);
    setMaxKcal(undefined);
    setIsSaved(false);
    setSavedAt(null);

    const emptyProfile: DietaryProfile = {
      allergens: [],
      isHalal: false,
      isVegan: false,
      amenities: [],
    };
    onProfileUpdated(emptyProfile);
    onShowToast('Profil diététique réinitialisé.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-stone-300 w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-black text-stone-900 leading-tight">
                  Mon Profil Diététique
                </h3>
                {isSaved && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Sauvegardé
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500">
                Vos allergies et préférences sont conservées automatiquement dans ce navigateur.
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

        {/* SECTION 1: ALLERGÈNES À EXCLURE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Mes Allergies & Intolérances ({selectedAllergens.length})</span>
            </label>
            {selectedAllergens.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedAllergens([])}
                className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                Tout désélectionner
              </button>
            )}
          </div>
          <p className="text-[10px] text-stone-500 leading-tight">
            Chaque restaurant ou carte filtrera automatiquement les plats contenant ces ingrédients.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
            {ALLERGENS_MASTER_LIST.map((alg) => {
              const isChecked = selectedAllergens.includes(alg.id);
              return (
                <button
                  key={alg.id}
                  type="button"
                  onClick={() =>
                    setSelectedAllergens((prev) =>
                      prev.includes(alg.id)
                        ? prev.filter((id) => id !== alg.id)
                        : [...prev, alg.id]
                    )
                  }
                  className={`px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer border ${
                    isChecked
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>{alg.icon}</span>
                    <span className="truncate">{alg.name.split('/')[0].trim()}</span>
                  </span>
                  {isChecked && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: RÉGIMES ALIMENTAIRES */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <label className="text-xs font-bold text-stone-800 block">
            Régime alimentaire
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsHalal((prev) => !prev)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                isHalal
                  ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🥩</span>
                <span>100% Halal Certifié</span>
              </div>
              {isHalal && <Check className="w-4 h-4 text-amber-800" />}
            </button>

            <button
              type="button"
              onClick={() => setIsVegan((prev) => !prev)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                isVegan
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🥑</span>
                <span>100% Végétalien</span>
              </div>
              {isVegan && <Check className="w-4 h-4 text-emerald-800" />}
            </button>
          </div>
        </div>

        {/* SECTION 3: COMMODITÉS & AMBIANCE EN PROVENCE */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 block">
              Équipements & Ambiance préférés ({selectedAmenities.length})
            </label>
            {selectedAmenities.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedAmenities([])}
                className="text-[10px] text-stone-500 hover:underline cursor-pointer"
              >
                Effacer
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {AMENITIES_MASTER_LIST.map((amenity) => {
              const isChecked = selectedAmenities.includes(amenity.id);
              return (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() =>
                    setSelectedAmenities((prev) =>
                      prev.includes(amenity.id)
                        ? prev.filter((id) => id !== amenity.id)
                        : [...prev, amenity.id]
                    )
                  }
                  className={`p-2 rounded-xl border text-[11px] font-semibold flex items-center justify-between transition cursor-pointer ${
                    isChecked
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                  title={amenity.description}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>{amenity.emoji}</span>
                    <span className="truncate">{amenity.shortLabel}</span>
                  </span>
                  {isChecked && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: LIMITE CALORIQUE */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <label className="text-xs font-bold text-stone-800 block">
            Objectif Calorique par plat
          </label>
          <div className="flex items-center gap-2">
            {[
              { val: undefined, label: 'Sans limite' },
              { val: 500, label: '< 500 kcal' },
              { val: 650, label: '< 650 kcal' },
              { val: 800, label: '< 800 kcal' },
            ].map((item) => (
              <button
                key={String(item.val)}
                type="button"
                onClick={() => setMaxKcal(item.val)}
                className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                  maxKcal === item.val
                    ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 flex items-center justify-between gap-2 border-t border-stone-200">
          {isSaved ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Effacer mon profil</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSelectedAllergens([]);
                setIsHalal(false);
                setIsVegan(false);
                setSelectedAmenities([]);
                setMaxKcal(undefined);
              }}
              className="text-stone-500 hover:text-stone-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Réinitialiser</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer mon profil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
