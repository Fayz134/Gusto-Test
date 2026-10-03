import { Restaurant } from '../types';
import { LA_CAVE_A_PIZZA_AUBAGNE } from './laCaveAPizza';
import { LE_FETOU_AUBAGNE } from './leFetou';
import { THAI_ONE_AUBAGNE } from './thaiOne';
import { AUBAGNE_REAL_RESTAURANTS } from './aubagneRestaurants';

/**
 * Catalogue officiel des 10 restaurants réels d'Aubagne (13400) :
 * 1. La Cave à Pizza (124 Avenue des Sœurs Gastine)
 * 2. Pizzeria Le Fé-Tou (755 Route Nationale 8, La Tourtelle)
 * 3. Thaï One (40 Avenue des Goums)
 * 4. Restaurant Suzanne (2410 Route Nationale 8)
 * 5. Più Aubagne - Alta Rocca (1120 Route de Gémenos)
 * 6. Les Enfants Gâtés (Route de la Légion, Camp Major)
 * 7. La Cave et le Bistrot (18 Boulevard Jean Jaurès)
 * 8. Zia Concetta Aubagne (1 Rue de Guin)
 * 9. Villa Estello (635 D8N, Pont de l'Étoile)
 * 10. Luzumaki Aubagne (17 Rue Rastègue)
 */
export const INITIAL_RESTAURANTS_DATA: Restaurant[] = [
  LA_CAVE_A_PIZZA_AUBAGNE,
  LE_FETOU_AUBAGNE,
  THAI_ONE_AUBAGNE,
  ...AUBAGNE_REAL_RESTAURANTS,
];
