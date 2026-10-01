import { RestaurantReview } from '../types';

export const INITIAL_REVIEWS_DATA: Record<string, RestaurantReview[]> = {
  'la-cave-a-pizza-aubagne': [
    {
      id: 'rev_cp_1',
      restaurantId: 'la-cave-a-pizza-aubagne',
      authorName: 'Alexandre M.',
      authorTag: 'Gourmet vérifié',
      rating: 4.9,
      criteria: {
        foodQuality: 5,
        ambiance: 4.8,
        dietaryCompliance: 4.9,
      },
      comment:
        'Pâte au feu de bois sensationnelle, croustillante et légère. La pizza Burrata est un chef-d’œuvre absolu. Transparence totale sur les ingrédients et allergènes, bravo !',
      date: '15/09/2026',
      isGustoRecommended: true,
    },
    {
      id: 'rev_cp_2',
      restaurantId: 'la-cave-a-pizza-aubagne',
      authorName: 'Clara D.',
      authorTag: 'Sans Lactose',
      rating: 4.8,
      criteria: {
        foodQuality: 4.8,
        ambiance: 4.7,
        dietaryCompliance: 4.9,
      },
      comment:
        'Très attentive aux intolérances, l’équipe m’a parfaitement conseillée pour adapter la garniture. Cuisson au bois inégalable à Aubagne.',
      date: '02/09/2026',
      isGustoRecommended: true,
    },
    {
      id: 'rev_cp_3',
      restaurantId: 'la-cave-a-pizza-aubagne',
      authorName: 'Mathieu B.',
      authorTag: 'Habitué',
      rating: 4.7,
      criteria: {
        foodQuality: 4.9,
        ambiance: 4.5,
        dietaryCompliance: 4.7,
      },
      comment:
        'Un rapport qualité-prix imbattable. Les formules du midi sont ultra copieuses et le pain maison au feu de bois est un régal.',
      date: '24/08/2026',
      isGustoRecommended: true,
    },
  ],
  'trattoria-bella-vista': [
    {
      id: 'rev_tbv_1',
      restaurantId: 'trattoria-bella-vista',
      authorName: 'Sophie L.',
      authorTag: 'Amateur de cuisine italienne',
      rating: 4.9,
      criteria: {
        foodQuality: 5,
        ambiance: 5,
        dietaryCompliance: 4.7,
      },
      comment:
        'La Burrata des Pouilles et les Tagliatelles à la truffe sont divines. Cadre chaleureux et service aux petits soins.',
      date: '18/09/2026',
      isGustoRecommended: true,
    },
    {
      id: 'rev_tbv_2',
      restaurantId: 'trattoria-bella-vista',
      authorName: 'Enzo R.',
      authorTag: 'Gourmet vérifié',
      rating: 4.7,
      criteria: {
        foodQuality: 4.8,
        ambiance: 4.6,
        dietaryCompliance: 4.7,
      },
      comment:
        'Véritable pizza napolitaine avec pâte maturée 48h. Tiramisù maison authentique comme en Italie !',
      date: '08/09/2026',
      isGustoRecommended: true,
    },
  ],
  'bistrot-provencal': [
    {
      id: 'rev_bp_1',
      restaurantId: 'bistrot-provencal',
      authorName: 'Jean-Pierre V.',
      authorTag: 'Terroir & Vins',
      rating: 4.8,
      criteria: {
        foodQuality: 4.9,
        ambiance: 4.8,
        dietaryCompliance: 4.7,
      },
      comment:
        'Le loup de mer au thym sauvage est cuit à la perfection. Accord mets-vins avec le Cassis blanc mémorable.',
      date: '20/09/2026',
      isGustoRecommended: true,
    },
  ],
  'jardin-vegetal-bio': [
    {
      id: 'rev_jv_1',
      restaurantId: 'jardin-vegetal-bio',
      authorName: 'Élodie G.',
      authorTag: 'Végétarienne & Santé',
      rating: 4.9,
      criteria: {
        foodQuality: 4.9,
        ambiance: 4.8,
        dietaryCompliance: 5,
      },
      comment:
        'Enfin un restaurant où les régimes végétariens et vegans sont respectés à 100% avec des macros ultra saines et équilibrées.',
      date: '22/09/2026',
      isGustoRecommended: true,
    },
  ],
  'le-cedre-grillades-halal': [
    {
      id: 'rev_lc_1',
      restaurantId: 'le-cedre-grillades-halal',
      authorName: 'Karim T.',
      authorTag: '100% Halal Certifié',
      rating: 4.8,
      criteria: {
        foodQuality: 4.9,
        ambiance: 4.6,
        dietaryCompliance: 5,
      },
      comment:
        'Kefta et Shish Taouk d’une tendreté rare avec ce bon goût de fumé au charbon de bois. Certification claire et respectée.',
      date: '25/09/2026',
      isGustoRecommended: true,
    },
  ],
};

const REVIEWS_STORAGE_KEY = 'gusto_restaurant_reviews_v2';

export function getStoredReviews(): Record<string, RestaurantReview[]> {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...INITIAL_REVIEWS_DATA, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Could not read stored reviews', e);
  }
  return INITIAL_REVIEWS_DATA;
}

export function saveStoredReviews(reviews: Record<string, RestaurantReview[]>) {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.warn('Could not save reviews to localStorage', e);
  }
}

export function calculateRestaurantReviewStats(reviews: RestaurantReview[]) {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 4.8,
      reviewsCount: 1,
      avgFoodQuality: 4.8,
      avgAmbiance: 4.7,
      avgDietaryCompliance: 4.8,
      isGustoRecommended: true,
    };
  }

  const count = reviews.length;
  let totalRating = 0;
  let totalFood = 0;
  let totalAmbiance = 0;
  let totalDiet = 0;

  reviews.forEach((r) => {
    totalRating += r.rating;
    totalFood += r.criteria.foodQuality;
    totalAmbiance += r.criteria.ambiance;
    totalDiet += r.criteria.dietaryCompliance;
  });

  const averageRating = Math.round((totalRating / count) * 10) / 10;
  const avgFoodQuality = Math.round((totalFood / count) * 10) / 10;
  const avgAmbiance = Math.round((totalAmbiance / count) * 10) / 10;
  const avgDietaryCompliance = Math.round((totalDiet / count) * 10) / 10;
  const isGustoRecommended = averageRating >= 4.5;

  return {
    averageRating,
    reviewsCount: count,
    avgFoodQuality,
    avgAmbiance,
    avgDietaryCompliance,
    isGustoRecommended,
  };
}
