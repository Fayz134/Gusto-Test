import React, { useState } from 'react';
import { X, Calculator, Users, DollarSign, Percent } from 'lucide-react';
import { Language } from '../types';
import { I18N_DICT } from '../data/i18n';

interface BillSplitterModalProps {
  isOpen: boolean;
  currentLang: Language;
  onClose: () => void;
  initialAmount?: number;
}

export const BillSplitterModal: React.FC<BillSplitterModalProps> = ({
  isOpen,
  currentLang,
  onClose,
  initialAmount,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  const [billAmount, setBillAmount] = useState<number>(initialAmount && initialAmount > 0 ? initialAmount : 68);
  const [guests, setGuests] = useState<number>(2);
  const [tipPercent, setTipPercent] = useState<number>(0);

  React.useEffect(() => {
    if (isOpen && initialAmount && initialAmount > 0) {
      setBillAmount(initialAmount);
    }
  }, [isOpen, initialAmount]);

  if (!isOpen) return null;

  const totalWithTip = billAmount * (1 + tipPercent / 100);
  const perPerson = guests > 0 ? totalWithTip / guests : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-stone-300 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#c58b2b]" />
            <span>{t('billModalTitle')}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Bill Input */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              {t('billTotalLabel')}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.5"
                value={billAmount}
                onChange={(e) => setBillAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-stone-50 border border-stone-300 rounded-2xl px-4 py-2.5 text-stone-900 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#99281a]"
              />
              <span className="absolute right-4 top-3 text-stone-400 font-bold">€</span>
            </div>
          </div>

          {/* Guests slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-stone-700 font-semibold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-stone-500" />
                <span>{t('billGuestsLabel')} :</span>
              </label>
              <strong className="text-[#99281a] text-sm font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {guests} {guests > 1 ? 'convives' : 'convive'}
              </strong>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full accent-[#99281a] cursor-pointer"
            />
          </div>

          {/* Tip Selector */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1.5">
              {t('billTipLabel')} :
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15].map((tip) => (
                <button
                  key={tip}
                  type="button"
                  onClick={() => setTipPercent(tip)}
                  className={`py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    tipPercent === tip
                      ? 'bg-[#99281a] text-white border-[#99281a] shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {tip === 0 ? '0%' : `+${tip}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          <div className="p-5 rounded-2xl bg-stone-100 border border-stone-200 text-center space-y-1">
            <span className="text-xs text-stone-500 font-medium">
              {t('billPerPerson')}
            </span>
            <div className="text-3xl font-serif font-black text-[#99281a]">
              {perPerson.toFixed(2)} €
            </div>
            {tipPercent > 0 && (
              <p className="text-[10px] text-stone-400">
                Total incluant {tipPercent}% pourboire : {totalWithTip.toFixed(2)} €
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
