import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Globe,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  UtensilsCrossed,
  Plus,
  AlertTriangle,
  FileText,
  Search,
} from 'lucide-react';
import { Restaurant, RestaurantRegistration, RegistrationStatus } from '../../types';

interface RestaurantRegistrationsTabProps {
  registrations: RestaurantRegistration[];
  onValidateRegistration: (registrationId: string) => void;
  onRejectRegistration: (registrationId: string) => void;
  onOpenWebDiscovery: () => void;
  onOpenManualAddRegistration: () => void;
  onOpenPublicRestaurant?: (restaurantId: string) => void;
  onShowToast: (message: string) => void;
}

export const RestaurantRegistrationsTab: React.FC<RestaurantRegistrationsTabProps> = ({
  registrations,
  onValidateRegistration,
  onRejectRegistration,
  onOpenWebDiscovery,
  onOpenManualAddRegistration,
  onOpenPublicRestaurant,
  onShowToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | RegistrationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegDetails, setSelectedRegDetails] = useState<RestaurantRegistration | null>(null);

  // Counters
  const pendingCount = registrations.filter((r) => r.status === 'en_attente').length;
  const validatedCount = registrations.filter((r) => r.status === 'valide').length;
  const rejectedCount = registrations.filter((r) => r.status === 'refuse').length;

  const filteredRegistrations = registrations.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.restaurantName.toLowerCase().includes(q) ||
        r.contactName.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HERO BANNER FOR REGISTRATIONS */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 rounded-3xl p-5 sm:p-7 text-white shadow-lg border border-stone-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Espace Candidatures & Partenariats
            </span>
            {pendingCount > 0 && (
              <span className="text-[10px] font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full animate-pulse">
                {pendingCount} en attente
              </span>
            )}
          </div>
          <h3 className="font-serif font-black text-xl sm:text-2xl text-white">
            Inscriptions & Validation des Nouveaux Restaurants
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Consultez les demandes d'inscription soumises par les restaurateurs, validez leur dossier pour les ajouter immédiatement au site Gusto, ou générez une page restaurant complète depuis le web par intelligence artificielle.
          </p>
        </div>

        {/* FAST ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenWebDiscovery}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#99281a] via-[#781524] to-amber-700 hover:from-[#b03020] hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Créer une Page via le Web (IA)</span>
          </button>

          <button
            type="button"
            onClick={onOpenManualAddRegistration}
            className="px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Nouvelle Candidature Restaurateur</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
              : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            Total Inscriptions
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono">
            {registrations.length}
          </span>
          <span className="text-[10px] block opacity-70 mt-0.5">dossiers reçus</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('en_attente')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            filterStatus === 'en_attente'
              ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm font-bold'
              : 'bg-white hover:bg-amber-50/50 text-stone-800 border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider block">
              En Attente
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-mono text-amber-600">
            {pendingCount}
          </span>
          <span className="text-[10px] text-amber-700 font-medium block mt-0.5">à vérifier</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('valide')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            filterStatus === 'valide'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
              : 'bg-white hover:bg-emerald-50/50 text-stone-800 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider block">
              Validés & En Ligne
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600">
            {validatedCount}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">au catalogue</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('refuse')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            filterStatus === 'refuse'
              ? 'bg-stone-700 text-white border-stone-800 shadow-sm'
              : 'bg-white hover:bg-rose-50/50 text-stone-800 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider block">
              Refusés
            </span>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-mono text-stone-600">
            {rejectedCount}
          </span>
          <span className="text-[10px] text-stone-500 font-medium block mt-0.5">non retenus</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom de restaurant, contact, ville..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#99281a] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
          <span className="text-stone-500 text-[11px] font-semibold">Afficher :</span>
          {(['all', 'en_attente', 'valide', 'refuse'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#99281a] text-white shadow-2xs'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              {st === 'all' && 'Tous'}
              {st === 'en_attente' && `En attente (${pendingCount})`}
              {st === 'valide' && `Validés (${validatedCount})`}
              {st === 'refuse' && `Refusés (${rejectedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* REGISTRATIONS LIST */}
      <div className="space-y-4">
        {filteredRegistrations.map((reg) => {
          const isPending = reg.status === 'en_attente';
          const isValidated = reg.status === 'valide';
          const isRejected = reg.status === 'refuse';
          const dateFormatted = new Date(reg.submittedAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={reg.id}
              className={`bg-white rounded-3xl border transition duration-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                isPending
                  ? 'border-amber-300 hover:border-amber-400 bg-gradient-to-r from-amber-50/20 via-white to-white'
                  : isValidated
                  ? 'border-emerald-200 hover:border-emerald-300'
                  : 'border-stone-200 opacity-80'
              }`}
            >
              {/* LEFT: RESTAURANT INFO */}
              <div className="space-y-3 max-w-2xl min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-serif font-black text-lg sm:text-xl text-stone-900">
                    {reg.restaurantName}
                  </h4>

                  {/* Status badge */}
                  {isPending && (
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>En attente de validation</span>
                    </span>
                  )}
                  {isValidated && (
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Validé & Publié sur le site</span>
                    </span>
                  )}
                  {isRejected && (
                    <span className="text-[11px] font-bold bg-stone-100 text-stone-600 border border-stone-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-stone-500" />
                      <span>Candidature refusée</span>
                    </span>
                  )}

                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    {reg.cuisine}
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    {reg.priceRange}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {reg.description}
                </p>

                {/* Details chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-stone-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{reg.contactName}</span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#99281a] shrink-0" />
                    <span className="truncate">{reg.address}</span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{reg.phone}</span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{reg.email}</span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>Reçu le {dateFormatted}</span>
                  </div>

                  {reg.sampleDishes && (
                    <div className="flex items-center gap-1.5 truncate">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{reg.sampleDishes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                {isPending && (
                  <>
                    <button
                      type="button"
                      onClick={() => onValidateRegistration(reg.id)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                      title="Valider cette inscription et l'ajouter immédiatement au site Gusto"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valider & Ajouter au Site</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRejectRegistration(reg.id)}
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Refuser</span>
                    </button>
                  </>
                )}

                {isValidated && reg.draftRestaurant && onOpenPublicRestaurant && (
                  <button
                    type="button"
                    onClick={() => onOpenPublicRestaurant(reg.draftRestaurant!.id)}
                    className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                    <span>Voir la Page Restaurant</span>
                  </button>
                )}

                {isRejected && (
                  <button
                    type="button"
                    onClick={() => onValidateRegistration(reg.id)}
                    className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Réexaminer & Valider</span>
                  </button>
                )}

                {/* Inspect Details Button */}
                <button
                  type="button"
                  onClick={() => setSelectedRegDetails(reg)}
                  className="px-3 py-1.5 rounded-xl text-stone-500 hover:text-stone-800 text-[11px] font-semibold flex items-center justify-center gap-1 hover:underline cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Détails complets du dossier</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredRegistrations.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs space-y-3">
            <Building2 className="w-10 h-10 text-stone-300 mx-auto" />
            <h4 className="font-serif font-black text-lg text-stone-800">
              Aucune candidature trouvée
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Aucune demande d'inscription ne correspond aux critères sélectionnés.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={onOpenWebDiscovery}
                className="px-4 py-2 rounded-xl bg-[#99281a] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Créer via le Web (IA)</span>
              </button>
              <button
                type="button"
                onClick={onOpenManualAddRegistration}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-800 hover:bg-stone-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une candidature</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REGISTRATION DETAILS MODAL */}
      {selectedRegDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full border border-stone-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-black text-lg text-stone-900">
                    {selectedRegDetails.restaurantName}
                  </h4>
                  <p className="text-xs text-stone-500">
                    Dossier d'inscription • {selectedRegDetails.cuisine}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRegDetails(null)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="p-3 bg-stone-50 rounded-2xl space-y-1">
                <span className="font-bold text-[10px] uppercase text-stone-500 tracking-wider block">
                  Description de l'établissement
                </span>
                <p className="leading-relaxed">{selectedRegDetails.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-2xl">
                  <span className="font-bold text-[10px] uppercase text-stone-500 tracking-wider block">
                    Contact Responsable
                  </span>
                  <p className="font-bold text-stone-900">{selectedRegDetails.contactName}</p>
                  <p className="text-stone-500">{selectedRegDetails.phone}</p>
                  <p className="text-stone-500 truncate">{selectedRegDetails.email}</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl">
                  <span className="font-bold text-[10px] uppercase text-stone-500 tracking-wider block">
                    Localisation & Tarifs
                  </span>
                  <p className="font-bold text-stone-900">{selectedRegDetails.city}</p>
                  <p className="text-stone-500">{selectedRegDetails.address}</p>
                  <p className="text-amber-800 font-mono font-bold">{selectedRegDetails.priceRange}</p>
                </div>
              </div>

              {selectedRegDetails.openingHoursPreview && (
                <div className="p-3 bg-stone-50 rounded-2xl">
                  <span className="font-bold text-[10px] uppercase text-stone-500 tracking-wider block">
                    Horaires d'ouverture
                  </span>
                  <p>{selectedRegDetails.openingHoursPreview}</p>
                </div>
              )}

              {selectedRegDetails.sampleDishes && (
                <div className="p-3 bg-stone-50 rounded-2xl">
                  <span className="font-bold text-[10px] uppercase text-stone-500 tracking-wider block">
                    Exemples de plats / Spécialités
                  </span>
                  <p>{selectedRegDetails.sampleDishes}</p>
                </div>
              )}

              {selectedRegDetails.notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl">
                  <span className="font-bold text-[10px] uppercase text-amber-800 tracking-wider block">
                    Notes complémentaires
                  </span>
                  <p className="text-amber-900">{selectedRegDetails.notes}</p>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedRegDetails(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer"
              >
                Fermer
              </button>

              {selectedRegDetails.status === 'en_attente' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onRejectRegistration(selectedRegDetails.id);
                      setSelectedRegDetails(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                  >
                    Refuser
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onValidateRegistration(selectedRegDetails.id);
                      setSelectedRegDetails(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valider & Ajouter au Site</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
