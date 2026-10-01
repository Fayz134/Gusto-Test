import React, { useState } from 'react';
import {
  X,
  Star,
  Crown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  User,
  HeartHandshake,
  Award,
} from 'lucide-react';
import { Restaurant, RestaurantReview } from '../types';
import {
  calculateRestaurantReviewStats,
  getStoredReviews,
  saveStoredReviews,
} from '../data/reviews';

interface RestaurantReviewsModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onReviewAdded?: (updatedRestaurant: Restaurant) => void;
}

export const RestaurantReviewsModal: React.FC<RestaurantReviewsModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  onReviewAdded,
}) => {
  if (!isOpen) return null;

  // Stored reviews for this restaurant
  const allStored = getStoredReviews();
  const reviewsList: RestaurantReview[] =
    allStored[restaurant.id] || restaurant.reviews || [];

  const stats = calculateRestaurantReviewStats(reviewsList);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorTag, setAuthorTag] = useState('Gourmet vérifié');
  const [foodRating, setFoodRating] = useState(5);
  const [ambianceRating, setAmbianceRating] = useState(5);
  const [dietaryRating, setDietaryRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    const overallRating =
      Math.round(((foodRating + ambianceRating + dietaryRating) / 3) * 10) / 10;

    const newReview: RestaurantReview = {
      id: `rev_${Date.now()}`,
      restaurantId: restaurant.id,
      authorName: authorName.trim(),
      authorTag,
      rating: overallRating,
      criteria: {
        foodQuality: foodRating,
        ambiance: ambianceRating,
        dietaryCompliance: dietaryRating,
      },
      comment: comment.trim(),
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      isGustoRecommended: overallRating >= 4.5,
    };

    const updatedReviews = [newReview, ...reviewsList];
    const newStored = { ...allStored, [restaurant.id]: updatedReviews };
    saveStoredReviews(newStored);

    const newStats = calculateRestaurantReviewStats(updatedReviews);
    if (onReviewAdded) {
      onReviewAdded({
        ...restaurant,
        rating: newStats.averageRating,
        reviewsCount: newStats.reviewsCount,
        isGustoRecommended: newStats.isGustoRecommended,
        reviews: updatedReviews,
      });
    }

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setShowAddForm(false);
      setComment('');
      setAuthorName('');
    }, 1800);
  };

  const renderStarSelector = (
    value: number,
    onChange: (val: number) => void,
    label: string,
    description: string
  ) => {
    return (
      <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/90 space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-900">{label}</label>
          <span className="text-xs font-mono font-black text-amber-600">
            {value} / 5 ★
          </span>
        </div>
        <p className="text-[11px] text-stone-500 leading-tight">{description}</p>
        <div className="flex items-center gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 rounded-lg hover:bg-amber-100 transition cursor-pointer"
            >
              <Star
                className={`w-6 h-6 transition-all ${
                  star <= value
                    ? 'fill-amber-500 text-amber-500 scale-105'
                    : 'text-stone-300 hover:text-amber-400'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-5 sm:p-6 flex items-start justify-between relative">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Communauté Gusto</span>
              </span>
              {stats.isGustoRecommended && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-sm border border-amber-300">
                  <Crown className="w-3 h-3 fill-stone-950" />
                  <span>Recommandé par Gusto</span>
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white">
              Avis & Évaluations • {restaurant.name}
            </h2>
            <p className="text-xs text-stone-300">
              Retours authentiques, critères culinaires stricts et transparence sur les régimes & allergènes.
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto grow">
          {/* STATS BREAKDOWN CARD */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/90 grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
            {/* Overall Score */}
            <div className="flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r border-stone-200 pb-4 sm:pb-0 sm:pr-4">
              <div className="text-4xl sm:text-5xl font-serif font-black text-stone-900 tracking-tight">
                {stats.averageRating}
              </div>
              <div className="flex items-center gap-1 my-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(stats.averageRating)
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs font-semibold text-stone-600">
                sur {stats.reviewsCount} avis vérifié{stats.reviewsCount > 1 ? 's' : ''}
              </div>
              {stats.isGustoRecommended && (
                <div className="mt-2 text-[10px] font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300/80">
                  Label d’Excellence
                </div>
              )}
            </div>

            {/* Criteria Breakdown */}
            <div className="sm:col-span-2 space-y-3">
              {/* Criterion 1: Food Quality */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <span>🍽️</span>
                    <span>Qualité des plats</span>
                  </span>
                  <span className="font-mono font-bold text-stone-700">
                    {stats.avgFoodQuality} / 5
                  </span>
                </div>
                <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.avgFoodQuality / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Criterion 2: Ambiance */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Ambiance & Cadre</span>
                  </span>
                  <span className="font-mono font-bold text-stone-700">
                    {stats.avgAmbiance} / 5
                  </span>
                </div>
                <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.avgAmbiance / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Criterion 3: Dietary & Allergens */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>Respect des régimes & allergènes</span>
                  </span>
                  <span className="font-mono font-bold text-stone-700">
                    {stats.avgDietaryCompliance} / 5
                  </span>
                </div>
                <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.avgDietaryCompliance / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action to Toggle Form */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#99281a]" />
              <span>Avis des clients ({reviewsList.length})</span>
            </h3>

            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-[#99281a] hover:bg-[#781524] text-white text-xs font-bold rounded-xl transition shadow-md hover:scale-102 active:scale-98 cursor-pointer flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Donner mon avis</span>
              </button>
            )}
          </div>

          {/* ADD REVIEW INTERACTIVE FORM */}
          {showAddForm && (
            <form
              onSubmit={handleSubmitReview}
              className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200/80 space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                  <span>Votre évaluation sur 5 étoiles</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs font-semibold"
                >
                  Annuler
                </button>
              </div>

              {submittedSuccess ? (
                <div className="p-6 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">Merci pour votre avis !</p>
                  <p className="text-xs text-emerald-700">
                    Votre note a été enregistrée et contribue au score officiel de l’établissement.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Votre nom ou pseudo
                      </label>
                      <input
                        type="text"
                        required
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Ex : Maxime L."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Profil culinaire
                      </label>
                      <select
                        value={authorTag}
                        onChange={(e) => setAuthorTag(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium cursor-pointer"
                      >
                        <option value="Gourmet vérifié">Gourmet vérifié</option>
                        <option value="Habitué">Habitué du lieu</option>
                        <option value="Sans Gluten">Intolérant / Sans Gluten</option>
                        <option value="Sans Lactose">Sans Lactose</option>
                        <option value="Végétarien">Végétarien</option>
                        <option value="Végétalien / Vegan">Végétalien / Vegan</option>
                        <option value="100% Halal Certifié">Amateur Halal</option>
                        <option value="Famille">En Famille</option>
                      </select>
                    </div>
                  </div>

                  {/* 3 SPECIFIC 5-STAR CRITERIA */}
                  <div className="space-y-2.5">
                    {renderStarSelector(
                      foodRating,
                      setFoodRating,
                      'Qualité des plats & Saveurs',
                      'Fraîcheur des ingrédients, cuisson, assaisonnement et présentation.'
                    )}

                    {renderStarSelector(
                      ambianceRating,
                      setAmbianceRating,
                      'Ambiance & Cadre',
                      'Atmosphère générale, accueil du personnel, confort et propreté.'
                    )}

                    {renderStarSelector(
                      dietaryRating,
                      setDietaryRating,
                      'Respect des régimes & allergènes',
                      'Transparence des cartes, écoute des intolérances et adaptabilité des plats.'
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Votre commentaire détaillé
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Partagez votre expérience : plats recommandés, points forts..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-rose-600 to-[#99281a] hover:opacity-95 text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Publier mon évaluation</span>
                  </button>
                </>
              )}
            </form>
          )}

          {/* LIST OF REVIEWS */}
          <div className="space-y-3.5">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-2.5 hover:border-stone-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 font-bold text-xs">
                      {rev.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-stone-900 text-xs">
                          {rev.authorName}
                        </span>
                        {rev.authorTag && (
                          <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
                            {rev.authorTag}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400">{rev.date}</span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-black text-amber-900">{rev.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed font-sans">
                  « {rev.comment} »
                </p>

                {/* Specific criteria chips */}
                {rev.criteria && (
                  <div className="flex items-center gap-3 flex-wrap text-[11px] text-stone-600 pt-2 border-t border-stone-100">
                    <span className="flex items-center gap-1">
                      <span className="text-stone-400">Plats :</span>
                      <strong className="text-stone-800">{rev.criteria.foodQuality}★</strong>
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="flex items-center gap-1">
                      <span className="text-stone-400">Ambiance :</span>
                      <strong className="text-stone-800">{rev.criteria.ambiance}★</strong>
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="flex items-center gap-1">
                      <span className="text-stone-400">Régimes :</span>
                      <strong className="text-stone-800">{rev.criteria.dietaryCompliance}★</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 px-6 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Avis modérés et vérifiés par l'algorithme Gusto</span>
          </span>
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
