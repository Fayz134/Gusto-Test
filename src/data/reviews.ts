import { RestaurantReview } from '../types';

export const INITIAL_REVIEWS_DATA: Record<string, RestaurantReview[]> = {
  'la-cave-a-pizza-aubagne': [
    {
      id: 'rev_cp_1',
      restaurantId: 'la-cave-a-pizza-aubagne',
      authorName: 'Alexandre M.',
      authorTag: 'Gourmet vérifié',
      rating: 4.9,
      criteria: { foodQuality: 5, ambiance: 4.8, dietaryCompliance: 4.9 },
      comment: 'Pâte au feu de bois sensationnelle, croustillante et légère. La pizza Burrata est un chef-d’œuvre absolu. Transparence totale sur les ingrédients et allergènes, bravo !',
      date: '15/09/2026',
      isGustoRecommended: true,
    },
    {
      id: 'rev_cp_2',
      restaurantId: 'la-cave-a-pizza-aubagne',
      authorName: 'Clara D.',
      authorTag: 'Sans Lactose',
      rating: 4.8,
      criteria: { foodQuality: 4.8, ambiance: 4.7, dietaryCompliance: 4.9 },
      comment: 'Très attentive aux intolérances, l’équipe m’a parfaitement conseillée pour adapter la garniture. Cuisson au bois inégalable à Aubagne.',
      date: '02/09/2026',
      isGustoRecommended: true,
    },
  ],
  'pizzeria-le-fetou-la-tourtelle': [
    {
      id: 'rev_fetou_1',
      restaurantId: 'pizzeria-le-fetou-la-tourtelle',
      authorName: 'Mickaël P.',
      authorTag: 'Habitué de La Tourtelle',
      rating: 4.9,
      criteria: { foodQuality: 5, ambiance: 4.8, dietaryCompliance: 4.9 },
      comment: 'La meilleure pizza de La Tourtelle depuis des années ! La pizza Chèvre Miel et les panuozzos cuits au feu de bois sont juste incroyables.',
      date: '28/09/2026',
      isGustoRecommended: true,
    },
    {
      id: 'rev_fetou_2',
      restaurantId: 'pizzeria-le-fetou-la-tourtelle',
      authorName: 'Sébastien B.',
      authorTag: 'Gourmet Aubagne',
      rating: 4.8,
      criteria: { foodQuality: 4.9, ambiance: 4.7, dietaryCompliance: 4.8 },
      comment: 'Pâte napolitaine parfaite, bien alvéolée avec une cuisson au feu de bois authentique. Le tiramisu Nutella maison est une tuerie !',
      date: '14/09/2026',
      isGustoRecommended: true,
    },
  ],
  'thai-one-aubagne': [
    {
      id: 'rev_thai_1',
      restaurantId: 'thai-one-aubagne',
      authorName: 'Nadia K.',
      authorTag: 'Street Food Lover',
      rating: 4.9,
      criteria: { foodQuality: 5, ambiance: 4.7, dietaryCompliance: 5 },
      comment: 'Le meilleur Pad Thaï d\'Aubagne sans hésiter ! Viande 100% Halal certifiée, légumes ultra frais et croquants. Les nems maison sont délicieux.',
      date: '26/09/2026',
      isGustoRecommended: true,
    },
    {
      id: 'rev_thai_2',
      restaurantId: 'thai-one-aubagne',
      authorName: 'Yassine M.',
      authorTag: '100% Halal Certifié',
      rating: 4.8,
      criteria: { foodQuality: 4.8, ambiance: 4.7, dietaryCompliance: 5 },
      comment: 'Bœuf Loc Lac excellent avec un riz tomaté très savoureux. Service rapide, équipe souriante et portions généreuses.',
      date: '19/09/2026',
      isGustoRecommended: true,
    },
  ],
  'restaurant-suzanne-aubagne': [
    {
      id: 'rev_suz_1',
      restaurantId: 'restaurant-suzanne-aubagne',
      authorName: 'Béatrice L.',
      authorTag: 'Terroir & Tradition',
      rating: 4.8,
      criteria: { foodQuality: 4.9, ambiance: 4.8, dietaryCompliance: 4.8 },
      comment: 'Une daube provençale comme on n\'en fait plus, fondante et parfumée à souhait. Le carpaccio de poulpe est une merveille de fraîcheur.',
      date: '20/09/2026',
      isGustoRecommended: true,
    },
  ],
  'piu-aubagne-alta-rocca': [
    {
      id: 'rev_piu_1',
      restaurantId: 'piu-aubagne-alta-rocca',
      authorName: 'Laurent D.',
      authorTag: 'Repas d\'affaires',
      rating: 4.7,
      criteria: { foodQuality: 4.8, ambiance: 4.9, dietaryCompliance: 4.6 },
      comment: 'Superbe terrasse ombragée à Alta Rocca. Les tagliolini à la truffe sont parfaites et le service est impeccable.',
      date: '18/09/2026',
      isGustoRecommended: true,
    },
  ],
  'les-enfants-gates-aubagne': [
    {
      id: 'rev_eg_1',
      restaurantId: 'les-enfants-gates-aubagne',
      authorName: 'Camille R.',
      authorTag: 'Bistronomie',
      rating: 4.8,
      criteria: { foodQuality: 4.9, ambiance: 4.7, dietaryCompliance: 4.8 },
      comment: 'Souris d\'agneau confite au thym exceptionnelle. Cadre agréable et cuisine soignée du début à la fin.',
      date: '22/09/2026',
      isGustoRecommended: true,
    },
  ],
  'la-cave-et-le-bistrot-aubagne': [
    {
      id: 'rev_cb_1',
      restaurantId: 'la-cave-et-le-bistrot-aubagne',
      authorName: 'Thomas V.',
      authorTag: 'Amateur de Vin',
      rating: 4.8,
      criteria: { foodQuality: 4.8, ambiance: 4.9, dietaryCompliance: 4.7 },
      comment: 'Belle sélection de vins de vignerons indépendants et magret de canard au miel succulent. Ambiance très conviviale en centre-ville.',
      date: '24/09/2026',
      isGustoRecommended: true,
    },
  ],
  'zia-concetta-aubagne': [
    {
      id: 'rev_zc_1',
      restaurantId: 'zia-concetta-aubagne',
      authorName: 'Giulia F.',
      authorTag: 'Cucina Italiana',
      rating: 4.9,
      criteria: { foodQuality: 5, ambiance: 4.8, dietaryCompliance: 4.8 },
      comment: 'Les vraies lasagnes de Bologne et des cannoli siciliens croustillants à tomber par terre. On se croirait en Italie au cœur d\'Aubagne !',
      date: '16/09/2026',
      isGustoRecommended: true,
    },
  ],
  'villa-estello-aubagne': [
    {
      id: 'rev_ve_1',
      restaurantId: 'villa-estello-aubagne',
      authorName: 'Valérie M.',
      authorTag: 'Ambiance Provençale',
      rating: 4.7,
      criteria: { foodQuality: 4.7, ambiance: 4.8, dietaryCompliance: 4.7 },
      comment: 'Un régal de déjeuner dans cette bastide au calme. Le pavé de loup à l\'émulsion fenouil est délicat et très bien exécuté.',
      date: '10/09/2026',
      isGustoRecommended: true,
    },
  ],
  'luzumaki-aubagne': [
    {
      id: 'rev_luzu_1',
      restaurantId: 'luzumaki-aubagne',
      authorName: 'Julien T.',
      authorTag: 'Amateur de Ramen',
      rating: 4.8,
      criteria: { foodQuality: 4.9, ambiance: 4.7, dietaryCompliance: 4.8 },
      comment: 'Ramen Tonkotsu avec un bouillon riche et savoureux, porc chashu fondant. Sushis ultra frais préparés minute.',
      date: '27/09/2026',
      isGustoRecommended: true,
    },
  ],
};

const REVIEWS_STORAGE_KEY = 'gusto_restaurant_reviews_v3';

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
