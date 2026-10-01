/**
 * Gusto Platform Traffic & Affluence Analytics Engine
 * Tracks visits, QR code scans, dish interactions, and computes peak hours & trends.
 */

export interface DailyTrafficPoint {
  date: string;
  dayLabel: string;
  visits: number;
  qrScans: number;
  dishViews: number;
}

export interface HourlyTrafficPoint {
  hour: number;
  hourLabel: string;
  visits: number;
  isPeak: boolean;
}

export interface WeekdayAffluencePoint {
  dayName: string;
  dayShort: string;
  dayIndex: number;
  percentage: number;
  peakHours: string;
  status: 'calm' | 'moderate' | 'busy' | 'very_busy';
  isToday: boolean;
}

export interface RestaurantTrafficSummary {
  restaurantId: string;
  restaurantName: string;
  totalVisits: number;
  totalQrScans: number;
  totalDishViews: number;
  totalPhoneCalls: number;
  currentLiveCapacity: number; // percentage 0-100
  status: 'calm' | 'moderate' | 'busy' | 'full';
  topDishes: { id: string; name: string; views: number; percentage: number }[];
  weeklyAffluence: WeekdayAffluencePoint[];
}

const STORAGE_ANALYTICS_KEY = 'gusto_platform_analytics_v1';

interface StoredAnalytics {
  globalVisitsCount: number;
  globalQrScansCount: number;
  globalDishViewsCount: number;
  globalPhoneClicksCount: number;
  restaurantVisits: Record<string, number>;
  restaurantQrScans: Record<string, number>;
  restaurantPhoneClicks: Record<string, number>;
  restaurantDishViews: Record<string, Record<string, number>>;
  lastUpdated: string;
}

function getStoredData(): StoredAnalytics {
  try {
    const raw = localStorage.getItem(STORAGE_ANALYTICS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (!parsed.restaurantPhoneClicks) parsed.restaurantPhoneClicks = {};
        if (parsed.globalPhoneClicksCount === undefined) parsed.globalPhoneClicksCount = 840;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read stored analytics', e);
  }

  // Initial base seed data
  const initial: StoredAnalytics = {
    globalVisitsCount: 14820,
    globalQrScansCount: 4210,
    globalDishViewsCount: 38940,
    globalPhoneClicksCount: 920,
    restaurantVisits: {
      'la-cave-a-pizza-aubagne': 8920,
      'trattoria-bella-vista': 5900,
      'bistrot-provencal': 3420,
      'jardin-vegetal-bio': 2890,
      'le-cedre-grillades-halal': 3150,
    },
    restaurantQrScans: {
      'la-cave-a-pizza-aubagne': 2740,
      'trattoria-bella-vista': 1470,
      'bistrot-provencal': 890,
      'jardin-vegetal-bio': 640,
      'le-cedre-grillades-halal': 780,
    },
    restaurantPhoneClicks: {
      'la-cave-a-pizza-aubagne': 430,
      'trattoria-bella-vista': 285,
      'bistrot-provencal': 165,
      'jardin-vegetal-bio': 120,
      'le-cedre-grillades-halal': 190,
    },
    restaurantDishViews: {
      'la-cave-a-pizza-aubagne': {
        'cave_pizza_royale': 3420,
        'cave_pizza_margherita': 2980,
        'cave_pizza_4fromages': 2450,
        'cave_pizza_burrata': 2110,
        'cave_pizza_diavola': 1870,
      },
      'trattoria-bella-vista': {
        'it_1': 2340,
        'it_4': 1980,
        'it_2': 1650,
        'it_6': 1430,
      },
    },
    lastUpdated: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_ANALYTICS_KEY, JSON.stringify(initial));
  } catch {
    // Ignore storage issues
  }

  return initial;
}

function saveStoredData(data: StoredAnalytics) {
  try {
    localStorage.setItem(STORAGE_ANALYTICS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save analytics', e);
  }
}

// Track a public site visit
export function trackSiteVisit(): void {
  const data = getStoredData();
  data.globalVisitsCount += 1;
  data.lastUpdated = new Date().toISOString();
  saveStoredData(data);
}

// Track restaurant pageview
export function trackRestaurantView(restaurantId: string): void {
  const data = getStoredData();
  data.globalVisitsCount += 1;
  data.restaurantVisits[restaurantId] = (data.restaurantVisits[restaurantId] || 0) + 1;
  data.lastUpdated = new Date().toISOString();
  saveStoredData(data);
}

// Track dish consultation
export function trackDishView(restaurantId: string, dishId: string): void {
  const data = getStoredData();
  data.globalDishViewsCount += 1;
  if (!data.restaurantDishViews[restaurantId]) {
    data.restaurantDishViews[restaurantId] = {};
  }
  data.restaurantDishViews[restaurantId][dishId] =
    (data.restaurantDishViews[restaurantId][dishId] || 0) + 1;
  data.lastUpdated = new Date().toISOString();
  saveStoredData(data);
}

// Track QR Code scan
export function trackQrScan(restaurantId: string): void {
  const data = getStoredData();
  data.globalQrScansCount += 1;
  data.restaurantQrScans[restaurantId] = (data.restaurantQrScans[restaurantId] || 0) + 1;
  data.lastUpdated = new Date().toISOString();
  saveStoredData(data);
}

// Track phone call button click
export function trackPhoneCall(restaurantId: string): void {
  const data = getStoredData();
  data.globalPhoneClicksCount = (data.globalPhoneClicksCount || 0) + 1;
  if (!data.restaurantPhoneClicks) data.restaurantPhoneClicks = {};
  data.restaurantPhoneClicks[restaurantId] = (data.restaurantPhoneClicks[restaurantId] || 0) + 1;
  data.lastUpdated = new Date().toISOString();
  saveStoredData(data);
}

export function getRestaurantPhoneClicks(restaurantId: string): number {
  const data = getStoredData();
  return data.restaurantPhoneClicks?.[restaurantId] || 120;
}

// Calculate realistic daily trends for last 7 or 30 days
export function getDailyTraffic(
  daysCount: number = 7,
  restaurantId?: string
): DailyTrafficPoint[] {
  const data = getStoredData();
  const result: DailyTrafficPoint[] = [];
  const now = new Date();

  // Factors
  const baseMultiplier = restaurantId
    ? (data.restaurantVisits[restaurantId] || 1200) / (data.globalVisitsCount || 10000)
    : 1;

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
    const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const dayLabel = `${dayNames[dayOfWeek]} ${dateStr}`;

    // Weekend and Friday have natural peak restaurant traffic
    let weekendBonus = 1.0;
    if (dayOfWeek === 5) weekendBonus = 1.55; // Friday
    else if (dayOfWeek === 6) weekendBonus = 1.85; // Saturday
    else if (dayOfWeek === 0) weekendBonus = 1.4; // Sunday

    // Deterministic pseudo-random variation based on date
    const dayHash = (d.getDate() * 17 + d.getMonth() * 31) % 25;
    const baseVisits = Math.round((280 + dayHash * 14) * weekendBonus * baseMultiplier);
    const baseScans = Math.round(baseVisits * 0.32);
    const baseDishViews = Math.round(baseVisits * 2.8);

    result.push({
      date: dateStr,
      dayLabel,
      visits: Math.max(12, baseVisits),
      qrScans: Math.max(4, baseScans),
      dishViews: Math.max(30, baseDishViews),
    });
  }

  return result;
}

// Compute hourly curve for lunch & dinner rush
export function getHourlyTrafficCurve(restaurantId?: string): HourlyTrafficPoint[] {
  const data = getStoredData();
  const points: HourlyTrafficPoint[] = [];
  const baseFactor = restaurantId
    ? Math.max(0.2, (data.restaurantVisits[restaurantId] || 800) / 10000)
    : 1.0;

  // Typical restaurant traffic distribution across 24h:
  // Peaks at 12h-14h and 19h-22h
  const hourlyCurveWeights: Record<number, number> = {
    8: 0.05,
    9: 0.12,
    10: 0.25,
    11: 0.65,
    12: 1.85, // Lunch peak
    13: 1.6, // Lunch peak
    14: 0.75,
    15: 0.3,
    16: 0.25,
    17: 0.45,
    18: 0.9,
    19: 2.1, // Dinner peak
    20: 2.5, // Dinner peak
    21: 2.2, // Dinner peak
    22: 1.2,
    23: 0.4,
  };

  for (let h = 8; h <= 23; h++) {
    const weight = hourlyCurveWeights[h] || 0.1;
    const visits = Math.round(weight * 140 * baseFactor);
    const isPeak = h === 12 || h === 13 || h === 19 || h === 20 || h === 21;

    points.push({
      hour: h,
      hourLabel: `${h}h00`,
      visits: Math.max(2, visits),
      isPeak,
    });
  }

  return points;
}

// Get global totals
export function getGlobalPlatformStats(restaurantsCount: number) {
  const data = getStoredData();
  const totalVisits = data.globalVisitsCount;
  const totalScans = data.globalQrScansCount;
  const totalDishViews = data.globalDishViewsCount;

  // Calculated estimates
  const uniqueVisitors = Math.round(totalVisits * 0.73);
  const avgTimeOnSite = '3m 42s';
  const engagementRate = '68.4%';

  return {
    totalVisits,
    uniqueVisitors,
    totalScans,
    totalDishViews,
    avgTimeOnSite,
    engagementRate,
    activeRestaurantsCount: restaurantsCount,
    lastUpdated: data.lastUpdated,
  };
}

// Compute per-restaurant traffic summary
export function getRestaurantTrafficSummary(
  restaurantId: string,
  restaurantName: string,
  dishesList: { id: string; name: string }[]
): RestaurantTrafficSummary {
  const data = getStoredData();
  const visits = data.restaurantVisits[restaurantId] || Math.round(data.globalVisitsCount * 0.45);
  const qrScans = data.restaurantQrScans[restaurantId] || Math.round(visits * 0.3);
  const phoneCalls = data.restaurantPhoneClicks?.[restaurantId] || Math.round(visits * 0.05) || 120;
  const dishViewsMap = data.restaurantDishViews[restaurantId] || {};

  // Compute live capacity estimate based on current hour in France
  const currentHour = new Date().getHours();
  let capacity = 35;
  if (currentHour >= 12 && currentHour <= 14) capacity = 88;
  else if (currentHour >= 19 && currentHour <= 22) capacity = 94;
  else if (currentHour === 11 || currentHour === 18) capacity = 55;
  else if (currentHour < 11 || currentHour > 23) capacity = 10;

  let status: 'calm' | 'moderate' | 'busy' | 'full' = 'moderate';
  if (capacity < 30) status = 'calm';
  else if (capacity < 65) status = 'moderate';
  else if (capacity < 90) status = 'busy';
  else status = 'full';

  // Seed default views for top dishes if empty
  const rawTop = dishesList
    .map((d, index) => {
      let views = dishViewsMap[d.id];
      if (views === undefined) {
        // Realistic distribution based on index
        views = Math.round((visits * 0.4) / (index * 0.6 + 1) + (index === 0 ? 120 : 30));
      }
      return {
        id: d.id,
        name: d.name,
        views,
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const maxViews = rawTop[0]?.views || 1;
  const topDishes = rawTop.map((item) => ({
    ...item,
    percentage: Math.round((item.views / maxViews) * 100),
  }));

  const totalDishViews = Object.values(dishViewsMap).reduce((a, b) => a + b, 0) || visits * 3;

  // Day of week in France (0: Dimanche, 1: Lundi, ...)
  const todayIndex = new Date().getDay();

  // Weekly affluence model
  const weekdayConfig = [
    { dayName: 'Lundi', dayShort: 'Lun', dayIndex: 1, basePct: 45, peakHours: '12h30 - 13h45', status: 'calm' as const },
    { dayName: 'Mardi', dayShort: 'Mar', dayIndex: 2, basePct: 58, peakHours: '12h15 - 14h00', status: 'moderate' as const },
    { dayName: 'Mercredi', dayShort: 'Mer', dayIndex: 3, basePct: 65, peakHours: '12h00 - 14h15', status: 'moderate' as const },
    { dayName: 'Jeudi', dayShort: 'Jeu', dayIndex: 4, basePct: 75, peakHours: '19h30 - 21h30', status: 'busy' as const },
    { dayName: 'Vendredi', dayShort: 'Ven', dayIndex: 5, basePct: 94, peakHours: '19h00 - 22h30', status: 'very_busy' as const },
    { dayName: 'Samedi', dayShort: 'Sam', dayIndex: 6, basePct: 98, peakHours: '12h30 - 14h30 & 19h30 - 23h00', status: 'very_busy' as const },
    { dayName: 'Dimanche', dayShort: 'Dim', dayIndex: 0, basePct: 82, peakHours: '12h00 - 15h00', status: 'busy' as const },
  ];

  const weeklyAffluence: WeekdayAffluencePoint[] = weekdayConfig.map((item) => ({
    ...item,
    percentage: item.basePct,
    isToday: item.dayIndex === todayIndex,
  }));

  return {
    restaurantId,
    restaurantName,
    totalVisits: visits,
    totalQrScans: qrScans,
    totalDishViews,
    totalPhoneCalls: phoneCalls,
    currentLiveCapacity: capacity,
    status,
    topDishes,
    weeklyAffluence,
  };
}
