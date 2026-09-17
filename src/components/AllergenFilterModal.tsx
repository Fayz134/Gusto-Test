import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  RotateCcw,
  SlidersHorizontal,
  Check,
  Sparkles,
  Leaf,
  Dumbbell,
  Flame
} from 'lucide-react';
import { Language, MacroFilterType } from '../types';
import { I18N_DICT, ALLERGENS_MASTER_LIST } from '../data/i18n';

interface AllergenFilterModalProps {
  isOpen: boolean;
  selectedAllergens: string[];
  currentLang: Language;
  onToggleAllergen: (id: string) => void;
  onResetAllergens: () => void;
  onClose: () => void;
  isHalalOnly?: boolean;
  onToggleHalal?: () => void;
  isVeganOnly?: boolean;
  onToggleVegan?: () => void;
  activeMacroFilter?: MacroFilterType;
  onMacroFilterChange?: (macro: MacroFilterType) => void;
}

export const AllergenFilterModal: React.FC<AllergenFilterModalProps> = ({
  isOpen,
  selectedAllergens,
  currentLang,
  onToggleAllergen,
  onResetAllergens,
  onClose,
  isHalalOnly = false,
  onToggleHalal,
  isVeganOnly = false,
  onToggleVegan,
  activeMacroFilter = 'all',
  onMacroFilterChange,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;
  const [activeTab, setActiveTab] = useState<'all' | 'diet' | 'macros' | 'allergens'>('all');

  if (!isOpen) return null;

  const handleResetAll = () => {
    onResetAllergens();
    if (isHalalOnly && onToggleHalal) {
      onToggleHalal();
    }
    if (isVeganOnly && onToggleVegan) {
      onToggleVegan();
    }
    if (onMacroFilterChange) {
      onMacroFilterChange('all');
    }
  };

  const macroOptions: { id: MacroFilterType; label: string; icon: string }[] = [
    { id: 'all', label: t('allDishes'), icon: '✨' },
    { id: 'high-protein', label: t('highProtein'), icon: '💪' },
    { id: 'low-cal', label: t('lowCal'), icon: '🥗' },
    { id: 'low-carb', label: t('lowCarb'), icon: '🥑' },
    { id: 'low-fat', label: t('lowFat'), icon: '💧' },
    { id: 'high-cal', label: t('highCal'), icon: '⚡' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-stone-300 w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-[#99281a]" />
              <span>{t('searchOptionsModalTitle')}</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {t('searchOptionsModalDesc')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Filter Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl text-xs shrink-0 overflow-x-auto no-scrollbar font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Toutes les options
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('diet')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0 ${
              activeTab === 'diet' || isHalalOnly || isVeganOnly
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🥩</span>
            <span>Régimes {(isHalalOnly || isVeganOnly) && '• Actif'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('macros')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0 ${
              activeTab === 'macros' || activeMacroFilter !== 'all'
                ? 'bg-white text-amber-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>💪</span>
            <span>Macros</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('allergens')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0 ${
              activeTab === 'allergens' || selectedAllergens.length > 0
                ? 'bg-white text-red-700 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🚫</span>
            <span>Allergènes {selectedAllergens.length > 0 && `(${selectedAllergens.length})`}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto space-y-5 pr-1 grow py-1">
          {/* SECTION 1: DIETARY & ETHICAL (HALAL, VEGAN & VEGETARIAN) */}
          {(activeTab === 'all' || activeTab === 'diet') && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🥑</span>
                  <span>{t('dietSectionTitle')}</span>
                </span>
                {(isHalalOnly || isVeganOnly) && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Actif
                  </span>
                )}
              </div>

              {/* HALAL OPTION CARD */}
              <div
                onClick={() => onToggleHalal && onToggleHalal()}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isHalalOnly
                    ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-sm'
                    : 'bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      isHalalOnly ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    🥩
                  </div>
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-1.5">
                      <span>{t('halalOptionTitle')}</span>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-600 text-white rounded">
                        Certifié
                      </span>
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 leading-snug">
                      {t('halalOptionSubtitle')}
                    </p>
                  </div>
                </div>

                {/* Switch indicator */}
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isHalalOnly
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {isHalalOnly && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              {/* VEGAN (VÉGÉTALIEN) OPTION CARD */}
              <div
                onClick={() => onToggleVegan && onToggleVegan()}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isVeganOnly
                    ? 'bg-teal-50/90 border-teal-500 text-teal-950 shadow-sm'
                    : 'bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      isVeganOnly ? 'bg-teal-600 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    🥑
                  </div>
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-1.5">
                      <span>{t('veganOptionTitle')}</span>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-teal-600 text-white rounded">
                        100% Végétal
                      </span>
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 leading-snug">
                      {t('veganOptionSubtitle')}
                    </p>
                  </div>
                </div>

                {/* Switch indicator */}
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isVeganOnly
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {isVeganOnly && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              {/* VEGETARIAN OPTION CARD */}
              <div
                onClick={() => {
                  if (onMacroFilterChange) {
                    onMacroFilterChange(activeMacroFilter === 'veg' ? 'all' : 'veg');
                  }
                }}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  activeMacroFilter === 'veg'
                    ? 'bg-lime-50/90 border-lime-500 text-lime-950 shadow-sm'
                    : 'bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      activeMacroFilter === 'veg' ? 'bg-lime-500 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    🌱
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{t('vegOptionTitle')}</h4>
                    <p className="text-xs text-stone-600 mt-0.5 leading-snug">
                      {t('vegOptionSubtitle')}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    activeMacroFilter === 'veg'
                      ? 'bg-lime-600 border-lime-600 text-white'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {activeMacroFilter === 'veg' && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: NUTRITIONAL OBJECTIVES & MACROS */}
          {(activeTab === 'all' || activeTab === 'macros') && (
            <div className="space-y-2.5 pt-2 border-t border-stone-100">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>💪</span>
                <span>{t('macroSectionTitle')}</span>
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {macroOptions.map((opt) => {
                  const isSelected = activeMacroFilter === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => onMacroFilterChange && onMacroFilterChange(opt.id)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-2xs'
                          : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{opt.icon}</span>
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: ALLERGENS EXCLUSION */}
          {(activeTab === 'all' || activeTab === 'allergens') && (
            <div className="space-y-2.5 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                  <span>{t('allergensSectionTitle')}</span>
                </span>
                {selectedAllergens.length > 0 && (
                  <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                    {selectedAllergens.length} exclu(s)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {ALLERGENS_MASTER_LIST.map((alg) => {
                  const isChecked = selectedAllergens.includes(alg.id);
                  const name =
                    currentLang === 'it'
                      ? alg.name_it
                      : currentLang === 'en'
                      ? alg.name_en
                      : alg.name;

                  return (
                    <label
                      key={alg.id}
                      className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl border transition cursor-pointer select-none ${
                        isChecked
                          ? 'bg-red-50 border-[#99281a] text-[#781524] font-bold shadow-2xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleAllergen(alg.id)}
                        className="accent-[#99281a] w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-base">{alg.icon}</span>
                      <span className="truncate">{name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 flex justify-between items-center text-xs border-t border-stone-200 shrink-0">
          <button
            type="button"
            onClick={handleResetAll}
            className="text-stone-500 hover:text-stone-800 underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetFilters')}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#99281a] hover:bg-[#781524] text-white font-bold rounded-2xl transition cursor-pointer shadow-md active:scale-98"
          >
            {t('applyFilter')}
          </button>
        </div>
      </div>
    </div>
  );
};

