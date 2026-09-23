import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ChevronRight } from 'lucide-react';
import { Dish, Language } from '../types';
import { I18N_DICT } from '../data/i18n';
import { formatPrice } from '../utils/geo';

export interface OrderCartItem {
  dish: Dish;
  quantity: number;
}

interface OrderSummaryModalProps {
  isOpen: boolean;
  items: OrderCartItem[];
  currentLang: Language;
  onClose: () => void;
  onUpdateQuantity: (dishId: string, delta: number) => void;
  onClearOrder: () => void;
  onOpenBillSplitter?: () => void;
}

export const OrderSummaryModal: React.FC<OrderSummaryModalProps> = ({
  isOpen,
  items,
  currentLang,
  onClose,
  onUpdateQuantity,
  onClearOrder,
  onOpenBillSplitter,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;

  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );
  const totalKcal = items.reduce(
    (sum, item) => sum + item.dish.nutrition.kcal * item.quantity,
    0
  );
  const totalProtein = items.reduce(
    (sum, item) => sum + item.dish.nutrition.protein * item.quantity,
    0
  );
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-2xl w-full max-w-lg border border-stone-200 p-6 sm:p-7 my-auto transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#fff7ed] border border-[#ffedd5] flex items-center justify-center text-[#9a3412]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Commande de votre Table
              </h3>
              <p className="text-xs text-stone-500">
                {totalItemsCount} {totalItemsCount > 1 ? 'plats sélectionnés' : 'plat sélectionné'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f1f5f9] hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <span className="text-4xl">🍽️</span>
            <p className="text-sm font-semibold text-stone-700">
              Votre commande est vide pour l'instant
            </p>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Cliquez sur un plat pour consulter sa fiche détaillée et l'ajouter à votre commande.
            </p>
          </div>
        ) : (
          <div className="space-y-4 my-4 max-h-[50vh] overflow-y-auto pr-1">
            {items.map(({ dish, quantity }) => (
              <div
                key={dish.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-stone-300 transition"
              >
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                    {dish.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                    <span className="font-serif font-bold text-[#8a3311]">
                      {formatPrice(dish.price)}
                    </span>
                    <span>•</span>
                    <span>{dish.nutrition.kcal * quantity} kcal</span>
                  </div>
                </div>

                {/* Quantity stepper */}
                <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(dish.id, -1)}
                    className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(dish.id, 1)}
                    className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nutritional recap of table order */}
        {items.length > 0 && (
          <div className="p-3 bg-[#fffbf5] border border-[#fed7aa]/50 rounded-2xl mb-4 text-xs text-stone-700 flex items-center justify-between">
            <span className="font-semibold text-stone-800">
              ⚡ Total nutritionnel table :
            </span>
            <span className="font-mono text-[11px] text-[#78350f]">
              <strong>{totalKcal}</strong> kcal • <strong>{totalProtein}g</strong> prot.
            </span>
          </div>
        )}

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="pt-3 border-t border-stone-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
                Total Commande
              </span>
              <span className="text-2xl font-serif font-bold text-[#8a3311]">
                {formatPrice(totalAmount)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#8a3311] hover:bg-[#71290d] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <span>Continuer la sélection</span>
              </button>

              <button
                type="button"
                onClick={onClearOrder}
                title="Vider la commande"
                className="p-3 rounded-2xl bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
