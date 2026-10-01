import React, { useMemo } from 'react';
import {
  X,
  TrendingUp,
  PhoneCall,
  Flame,
  Clock,
  Calendar,
  Users,
  Eye,
  Award,
  Sparkles,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { Restaurant, Dish } from '../types';
import {
  getRestaurantTrafficSummary,
  trackPhoneCall,
} from '../utils/analytics';

interface RestaurantAnalyticsModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onSelectDish?: (dish: Dish) => void;
}

export const RestaurantAnalyticsModal: React.FC<RestaurantAnalyticsModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  onSelectDish,
}) => {
  if (!isOpen) return null;

  const dishesList = useMemo(() => {
    return restaurant.dishes.map((d) => ({ id: d.id, name: d.name }));
  }, [restaurant.dishes]);

  const summary = useMemo(() => {
    return getRestaurantTrafficSummary(restaurant.id, restaurant.name, dishesList);
  }, [restaurant.id, restaurant.name, dishesList]);

  const handlePhoneClick = () => {
    trackPhoneCall(restaurant.id);
    window.location.href = `tel:${restaurant.phone}`;
  };

  const getCapacityBadge = (status: string) => {
    switch (status) {
      case 'calm':
        return { label: 'Calme (Moins de 30%)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'moderate':
        return { label: 'Affluence modérée (30-65%)', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'busy':
        return { label: 'Forte affluence (65-90%)', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'full':
        return { label: 'Complet / Service Rush (>90%)', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      default:
        return { label: 'Modéré', bg: 'bg-stone-100 text-stone-800 border-stone-300' };
    }
  };

  const capBadge = getCapacityBadge(summary.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-5 sm:p-6 flex items-start justify-between relative">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30">
                <BarChart3 className="w-3 h-3 text-rose-300" />
                <span>Analytics Gusto</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-stone-300 border border-white/10">
                Données certifiées en direct
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white">
              Statistiques & Affluence • {restaurant.name}
            </h2>
            <p className="text-xs text-stone-300">
              Consultation des plats les plus prisés, volume d'appels téléphoniques et prévisions d'affluence journalière.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto grow">
          {/* TOP METRICS SUMMARY TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Metric 1: Total Visits */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/90 space-y-1">
              <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                <span>Vues de la carte</span>
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-serif font-black text-stone-900">
                {summary.totalVisits.toLocaleString('fr-FR')}
              </div>
              <p className="text-[10px] text-stone-500">Clients ayant consulté l'établissement</p>
            </div>

            {/* Metric 2: Phone Calls */}
            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80 space-y-1">
              <div className="flex items-center justify-between text-amber-900 text-xs font-bold">
                <span>Appels déclenchés</span>
                <PhoneCall className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-serif font-black text-amber-950">
                {summary.totalPhoneCalls.toLocaleString('fr-FR')}
              </div>
              <p className="text-[10px] text-amber-800/80">Clics sur le bouton d'appel direct</p>
            </div>

            {/* Metric 3: Live Capacity */}
            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/80 space-y-1">
              <div className="flex items-center justify-between text-emerald-900 text-xs font-bold">
                <span>Affluence en direct</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-serif font-black text-emerald-950 flex items-center gap-1.5">
                <span>{summary.currentLiveCapacity}%</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${capBadge.bg}`}>
                {capBadge.label}
              </span>
            </div>
          </div>

          {/* SECTION 1: PLATS LES PLUS CONSULTÉS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Plats les plus consultés (Top 5)</span>
              </h3>
              <span className="text-[11px] text-stone-500 font-medium">
                {summary.totalDishViews.toLocaleString('fr-FR')} consultations au total
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200/90 divide-y divide-stone-100 overflow-hidden shadow-2xs">
              {summary.topDishes.map((dishItem, index) => {
                const fullDish = restaurant.dishes.find((d) => d.id === dishItem.id);
                const medals = ['🥇', '🥈', '🥉', '4ème', '5ème'];

                return (
                  <div
                    key={dishItem.id}
                    onClick={() => fullDish && onSelectDish && onSelectDish(fullDish)}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/80 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 grow">
                      <span className="text-base font-bold w-6 text-center shrink-0">
                        {medals[index]}
                      </span>
                      <div className="min-w-0 grow space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-stone-900 truncate group-hover:text-[#99281a] transition">
                            {dishItem.name}
                          </span>
                          <span className="text-xs font-mono font-bold text-stone-600 shrink-0">
                            {dishItem.views.toLocaleString('fr-FR')} vues
                          </span>
                        </div>
                        {/* Popularity bar */}
                        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              index === 0
                                ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                                : index === 1
                                ? 'bg-amber-500'
                                : 'bg-stone-400'
                            }`}
                            style={{ width: `${dishItem.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: AFFLUENCE ESTIMÉE PAR JOUR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#99281a]" />
                <span>Affluence estimée par jour de la semaine</span>
              </h3>
              <span className="text-[11px] text-stone-500 font-medium">
                Prévisions basées sur l'historique
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
              {summary.weeklyAffluence.map((day) => (
                <div
                  key={day.dayName}
                  className={`rounded-2xl p-3 border text-center transition flex flex-col justify-between space-y-2 ${
                    day.isToday
                      ? 'bg-amber-50/80 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                      : 'bg-stone-50/70 border-stone-200/80 hover:bg-stone-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs font-bold text-stone-900">{day.dayShort}</span>
                      {day.isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                      )}
                    </div>
                    {day.isToday && (
                      <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-200/60 px-1.5 py-0.2 rounded-full inline-block mt-0.5">
                        Aujourd'hui
                      </span>
                    )}
                  </div>

                  {/* Vertical bar */}
                  <div className="h-16 w-3 mx-auto bg-stone-200 rounded-full flex flex-col justify-end overflow-hidden p-0.5">
                    <div
                      className={`w-full rounded-full transition-all duration-700 ${
                        day.percentage >= 90
                          ? 'bg-rose-600'
                          : day.percentage >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ height: `${day.percentage}%` }}
                    />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold text-stone-800">
                      {day.percentage}%
                    </span>
                    <p className="text-[9px] text-stone-500 leading-tight">
                      {day.peakHours}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Conseil Gusto : </strong>
                Pour profiter du meilleur service sans attente, privilégiez les créneaux avant 12h15 ou après 13h45 au déjeuner, et avant 19h45 en semaine.
              </div>
            </div>
          </div>

          {/* SECTION 3: BOUTON D'APPEL DIRECT AVEC SUIVI */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-stone-900">
                Besoin de réserver ou de poser une question ?
              </h4>
              <p className="text-[11px] text-stone-500">
                Numéro direct du restaurant : <strong className="text-stone-800">{restaurant.phone}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={handlePhoneClick}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Appeler l'établissement</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 px-6 flex items-center justify-between text-xs text-stone-500">
          <span>Actualisé en temps réel avec les interactions des utilisateurs</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
