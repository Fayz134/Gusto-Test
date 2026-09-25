import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  ExternalLink,
  MapPin,
  UtensilsCrossed,
  Search,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  BarChart3,
  Edit3,
  Phone,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Restaurant } from '../../types';

interface RestaurantManagerProps {
  restaurants: Restaurant[];
  onOpenAddModal: () => void;
  onEditRestaurant: (restaurant: Restaurant) => void;
  onEditMenu: (restaurantId: string) => void;
  onDeleteRestaurant: (restaurantId: string) => void;
  onSelectForAffluence: (restaurantId: string) => void;
  onOpenPublicRestaurant: (restaurantId: string) => void;
  onResetToDefaults: () => void;
  onShowToast: (msg: string) => void;
}

export const RestaurantManager: React.FC<RestaurantManagerProps> = ({
  restaurants,
  onOpenAddModal,
  onEditRestaurant,
  onEditMenu,
  onDeleteRestaurant,
  onSelectForAffluence,
  onOpenPublicRestaurant,
  onResetToDefaults,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);

  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmDelete = () => {
    if (!restaurantToDelete) return;
    onDeleteRestaurant(restaurantToDelete.id);
    onShowToast(`L'établissement « ${restaurantToDelete.name} » a été retiré.`);
    setRestaurantToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#99281a]">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-black text-lg sm:text-xl text-stone-900">
              Parc des Établissements Partenaires
            </h3>
            <span className="text-xs font-mono font-bold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full border border-stone-300">
              {restaurants.length} en ligne
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            Modifiez les informations d'un restaurant (nom, adresse, horaires, bannière), gérez sa carte de plats ou ajoutez un nouvel établissement sans saisie de coordonnées GPS.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-2xl bg-[#99281a] hover:bg-[#781524] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Restaurant</span>
          </button>
        </div>
      </div>

      {/* FILTER SEARCH & CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, cuisine, ville..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#99281a] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-stone-500">
          <button
            type="button"
            onClick={onResetToDefaults}
            className="text-stone-500 hover:text-stone-800 text-[11px] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            title="Restaurer le catalogue original"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurer catalogue initial</span>
          </button>
        </div>
      </div>

      {/* RESTAURANTS LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((resto) => {
          const totalDishes = resto.dishes?.length || 0;
          const totalCats = resto.categories?.length || 0;

          return (
            <div
              key={resto.id}
              className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between group hover:border-stone-300 transition duration-200"
            >
              <div>
                {/* Banner Photo */}
                <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                  <img
                    src={resto.banner}
                    alt={resto.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/95 text-stone-900 shadow-xs backdrop-blur-xs truncate max-w-[180px]">
                      {resto.cuisine}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black/60 text-white font-mono backdrop-blur-xs shrink-0">
                      {resto.priceRange}
                    </span>
                  </div>

                  {/* Bottom Banner Title */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-serif font-black text-lg text-white drop-shadow-sm flex items-center gap-1.5 truncate">
                      <span>{resto.name}</span>
                      {resto.isHalalCertified && (
                        <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">
                          Halal
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-stone-300 truncate">
                      {resto.tagline}
                    </p>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-1.5 text-xs text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-[#99281a] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{resto.address}</span>
                    </div>

                    {resto.phone && (
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                        <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                        <span>{resto.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats pills */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                    <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200/60 text-center">
                      <span className="block text-sm font-black text-stone-900 font-mono">
                        {totalDishes}
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">Plats au menu</span>
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200/60 text-center">
                      <span className="block text-sm font-black text-stone-900 font-mono">
                        {totalCats}
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">Catégories</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 bg-stone-50 border-t border-stone-100 flex flex-col gap-2">
                {/* Primary Edit Row */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEditRestaurant(resto)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-white hover:bg-stone-100 text-[#99281a] border border-[#99281a]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-98"
                    title={`Modifier les informations et la page de ${resto.name}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifier la page</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditMenu(resto.id)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-98"
                    title={`Gérer les plats et catégories de ${resto.name}`}
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />
                    <span>Gérer les plats</span>
                  </button>
                </div>

                {/* Secondary Row: Affluence, Open Site, Delete */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-200/50">
                  <button
                    type="button"
                    onClick={() => onSelectForAffluence(resto.id)}
                    className="px-2 py-1 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    title="Voir l'affluence de ce restaurant"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Affluence</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenPublicRestaurant(resto.id)}
                      className="px-2 py-1 rounded-lg text-stone-700 hover:text-black hover:bg-stone-200/60 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Voir la carte publique sur le site"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                      <span>Voir sur le site</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRestaurantToDelete(resto)}
                      className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-100/70 transition cursor-pointer active:scale-95"
                      title={`Supprimer ${resto.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs space-y-3">
          <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto" />
          <h4 className="font-serif font-black text-lg text-stone-800">
            Aucun établissement trouvé
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Aucun restaurant ne correspond à votre recherche. Vous pouvez créer un nouvel établissement dès maintenant.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-[#99281a] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Restaurant</span>
          </button>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {restaurantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-stone-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-black text-lg text-stone-900">
                Retirer cet établissement ?
              </h3>
              <p className="text-xs text-stone-600">
                Êtes-vous certain de vouloir retirer définitivement{' '}
                <strong className="text-stone-900 font-bold">{restaurantToDelete.name}</strong>{' '}
                de la plateforme Gusto ?
              </p>
              <p className="text-[11px] text-rose-600 font-semibold pt-1">
                ⚠️ Cette action supprimera sa carte ({restaurantToDelete.dishes.length} plats) et ses menus.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setRestaurantToDelete(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirmer la Suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
