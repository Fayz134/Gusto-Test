import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  QrCode,
  Utensils,
  Clock,
  Sparkles,
  Flame,
  ArrowUpRight,
  Building2,
  Globe,
  ChevronDown,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  DailyTrafficPoint,
  HourlyTrafficPoint,
  getDailyTraffic,
  getHourlyTrafficCurve,
  getGlobalPlatformStats,
  getRestaurantTrafficSummary,
} from '../../utils/analytics';
import { Restaurant } from '../../types';

interface TrafficChartsProps {
  restaurants: Restaurant[];
  selectedRestaurantId: string; // 'all' or specific id
  onSelectRestaurantId: (id: string) => void;
}

export const TrafficCharts: React.FC<TrafficChartsProps> = ({
  restaurants,
  selectedRestaurantId,
  onSelectRestaurantId,
}) => {
  const [periodDays, setPeriodDays] = useState<7 | 30>(7);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [hoveredHourIndex, setHoveredHourIndex] = useState<number | null>(null);

  const isGlobal = selectedRestaurantId === 'all';
  const targetRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);

  // Compute stats
  const globalStats = getGlobalPlatformStats(restaurants.length);
  const dailyData: DailyTrafficPoint[] = getDailyTraffic(
    periodDays,
    isGlobal ? undefined : selectedRestaurantId
  );
  const hourlyData: HourlyTrafficPoint[] = getHourlyTrafficCurve(
    isGlobal ? undefined : selectedRestaurantId
  );

  const restaurantSummary = !isGlobal && targetRestaurant
    ? getRestaurantTrafficSummary(
        targetRestaurant.id,
        targetRestaurant.name,
        targetRestaurant.dishes.map((d) => ({ id: d.id, name: d.name_fr || d.name }))
      )
    : null;

  // Max values for chart scaling
  const maxVisits = Math.max(...dailyData.map((d) => d.visits), 10);
  const maxHourly = Math.max(...hourlyData.map((h) => h.visits), 10);

  // SVG dimensions for the daily curve
  const svgWidth = 720;
  const svgHeight = 220;
  const paddingX = 35;
  const paddingY = 25;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Points coordinates
  const points = dailyData.map((item, idx) => {
    const x = paddingX + (idx / (dailyData.length - 1)) * chartW;
    const y = svgHeight - paddingY - (item.visits / maxVisits) * chartH;
    return { x, y, item, idx };
  });

  // Generate SVG path with smooth cubic beziers
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  // Secondary curve for QR Scans
  const maxScans = Math.max(...dailyData.map((d) => d.qrScans), 10);
  const qrPoints = dailyData.map((item, idx) => {
    const x = paddingX + (idx / (dailyData.length - 1)) * chartW;
    const y = svgHeight - paddingY - (item.qrScans / maxScans) * (chartH * 0.7);
    return { x, y, item };
  });
  const qrLinePath = generateSmoothPath(qrPoints);

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* =========================================================================
          VOLET VUE GLOBALE & PÉRIMÈTRE D'ANALYSE (COMPACT, INTÉGRÉ & 100% RESPONSIVE)
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4 w-full max-w-full overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isGlobal
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-[#99281a] text-white'
              }`}
            >
              {isGlobal ? <Globe className="w-5 h-5 animate-spin-slow" /> : <Building2 className="w-5 h-5" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
                  {isGlobal ? 'Consolidation Globale' : 'Focus Établissement'}
                </span>
                <span className="text-xs font-mono text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  En direct
                </span>
              </div>
              <h3 className="font-serif font-black text-sm sm:text-base text-stone-900 truncate">
                {isGlobal
                  ? `Vue Globale Gusto (${restaurants.length} restaurants)`
                  : targetRestaurant?.name}
              </h3>
            </div>
          </div>

          {/* Right Action: Period Switcher & Return to Global */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            {!isGlobal && (
              <button
                type="button"
                onClick={() => onSelectRestaurantId('all')}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                title="Revenir à la vue globale de la plateforme"
              >
                <Globe className="w-3.5 h-3.5 text-amber-700" />
                <span>Voir Vue Globale</span>
              </button>
            )}

            {/* Time range toggle */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setPeriodDays(7)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  periodDays === 7
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                7 jours
              </button>
              <button
                type="button"
                onClick={() => setPeriodDays(30)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  periodDays === 30
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                30 jours
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills Carousel: Quick Switch Between Vue Globale and Establishments */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-bold">
            <span className="uppercase tracking-wider">Sélectionner un périmètre :</span>
            <span className="text-stone-400 font-mono hidden sm:inline">
              Cliquez pour basculer les métriques
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full max-w-full">
            {/* Global View Button */}
            <button
              type="button"
              onClick={() => onSelectRestaurantId('all')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
                isGlobal
                  ? 'bg-stone-900 text-amber-300 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>🌐 Vue Globale (Tous)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isGlobal ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 text-stone-700'
                }`}
              >
                {restaurants.length}
              </span>
            </button>

            {/* Individual Restaurant Pills */}
            {restaurants.map((resto) => {
              const isSelected = selectedRestaurantId === resto.id;
              return (
                <button
                  key={resto.id}
                  type="button"
                  onClick={() => onSelectRestaurantId(resto.id)}
                  className={`px-3 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 max-w-[220px] truncate ${
                    isSelected
                      ? 'bg-[#99281a] text-white shadow-md ring-2 ring-[#99281a]/30'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                  title={`${resto.name} (${resto.cuisine})`}
                >
                  <span className="truncate">{resto.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Overview Info Banner when in Global Mode */}
        {isGlobal && (
          <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>
                <strong>Portée plateforme :</strong> Analyse consolidée de{' '}
                <strong className="text-stone-900">{restaurants.length} établissements partenaires</strong>.
              </span>
            </div>
            <span className="text-[11px] font-mono text-stone-500">
              Mise à jour : {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          KPI METRIC CARDS (RESPONSIVE & COMPACT)
         ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1: Total Visits */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden group hover:border-[#99281a]/40 transition min-w-0">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              Visites Totales
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 text-[#99281a] flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 font-mono tracking-tight">
              {(isGlobal ? globalStats.totalVisits : restaurantSummary?.totalVisits || 0).toLocaleString('fr-FR')}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +14.8%
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 truncate">
            {isGlobal ? 'Sessions sur tout le portail' : 'Consultations restaurant'}
          </p>
        </div>

        {/* Metric 2: Scans QR Code */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden group hover:border-amber-300 transition min-w-0">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              Scans QR Tables
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 font-mono tracking-tight">
              {(isGlobal ? globalStats.totalScans : restaurantSummary?.totalQrScans || 0).toLocaleString('fr-FR')}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +22.4%
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 truncate">Accès direct carte à table</p>
        </div>

        {/* Metric 3: Plats & Menus Consultés */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition min-w-0">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              Fiches Plats Vues
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 font-mono tracking-tight">
              {(isGlobal ? globalStats.totalDishViews : restaurantSummary?.totalDishViews || 0).toLocaleString('fr-FR')}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +31.2%
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 truncate">Recettes & macros consultées</p>
        </div>

        {/* Metric 4: Taux d'engagement ou Capacité */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition min-w-0">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {isGlobal ? 'Engagement' : 'Affluence en Direct'}
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 font-mono tracking-tight">
              {isGlobal ? globalStats.engagementRate : `${restaurantSummary?.currentLiveCapacity || 65}%`}
            </span>
            <span
              className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                !isGlobal && restaurantSummary?.status === 'busy'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isGlobal ? '3m 42s' : restaurantSummary?.status?.toUpperCase()}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 truncate">
            {isGlobal ? 'Temps moyen sur les menus' : 'Estimation du service en direct'}
          </p>
        </div>
      </div>

      {/* =========================================================================
          GRAPH 1: INTERACTIVE DAILY AFFLUENCE CURVE
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4 w-full max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-black text-base sm:text-lg text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#99281a]" />
              <span>Affluence Quotidienne & Évolution du Trafic</span>
            </h3>
            <p className="text-xs text-stone-500">
              Volume des visites et consultations sur {periodDays} jours{' '}
              {isGlobal ? '(Plateforme globale)' : `(${targetRestaurant?.name})`}.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-bold flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#99281a]"></span>
              <span className="text-stone-700">Visites</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-stone-700">Scans QR</span>
            </div>
          </div>
        </div>

        {/* SVG Curve Chart */}
        <div className="relative w-full overflow-hidden pt-2 pb-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-48 sm:h-64 overflow-visible"
          >
            <defs>
              {/* Main curve gradient */}
              <linearGradient id="gradient-visits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#99281a" stopOpacity="0.25" />
                <stop offset="80%" stopColor="#99281a" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#99281a" stopOpacity="0.0" />
              </linearGradient>

              {/* QR curve gradient */}
              <linearGradient id="gradient-scans" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingY + ratio * chartH;
              const val = Math.round(maxVisits * (1 - ratio));
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#e7e5e4"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 6}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="#a8a29e"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#gradient-visits)" />

            {/* QR Scan Line */}
            <path
              d={qrLinePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="5 3"
            />

            {/* Primary Visits Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#99281a"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Active guideline if hovered */}
            {hoveredDayIndex !== null && points[hoveredDayIndex] && (
              <line
                x1={points[hoveredDayIndex].x}
                y1={paddingY}
                x2={points[hoveredDayIndex].x}
                y2={svgHeight - paddingY}
                stroke="#99281a"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            )}

            {/* Points & Interactive Tooltip triggers */}
            {points.map((pt, idx) => {
              const isHovered = hoveredDayIndex === idx;
              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredDayIndex(idx)}
                  onMouseLeave={() => setHoveredDayIndex(null)}
                >
                  {/* Invisible hit target for smooth hovering */}
                  <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" />

                  {/* Visible dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? '#99281a' : '#ffffff'}
                    stroke="#99281a"
                    strokeWidth={isHovered ? 3 : 2.5}
                    className="transition-all duration-150"
                  />

                  {/* QR Scan dot */}
                  <circle
                    cx={qrPoints[idx].x}
                    cy={qrPoints[idx].y}
                    r={3}
                    fill="#f59e0b"
                  />

                  {/* X Axis labels */}
                  <text
                    x={pt.x}
                    y={svgHeight - paddingY + 16}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    fill={isHovered ? '#1c1917' : '#78716c'}
                  >
                    {pt.item.date}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating Tooltip */}
          {hoveredDayIndex !== null && points[hoveredDayIndex] && (
            <div
              className="absolute z-20 top-2 pointer-events-none bg-stone-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-xl text-xs space-y-0.5 border border-stone-700 transition-all max-w-[200px]"
              style={{
                left: `${Math.min(80, Math.max(20, (points[hoveredDayIndex].x / svgWidth) * 100))}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="font-bold text-amber-300 border-b border-stone-800 pb-1 flex items-center justify-between gap-2">
                <span>{points[hoveredDayIndex].item.dayLabel}</span>
                <span className="text-[9px] text-stone-400 font-mono">Affluence</span>
              </div>
              <div className="flex items-center justify-between gap-3 font-mono text-[11px]">
                <span className="text-stone-300">Visites :</span>
                <span className="font-bold text-white">
                  {points[hoveredDayIndex].item.visits}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 font-mono text-[11px]">
                <span className="text-amber-400">Scans QR :</span>
                <span className="font-bold text-amber-300">
                  {points[hoveredDayIndex].item.qrScans}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 font-mono text-[11px]">
                <span className="text-emerald-400">Plats vus :</span>
                <span className="font-bold text-emerald-300">
                  {points[hoveredDayIndex].item.dishViews}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          DUAL SECTION: HOURLY PEAK GRAPH & LIVE RESTAURANT METRICS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-full">
        {/* Hourly Peak Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4 w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-serif font-black text-sm sm:text-base text-stone-900 flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                <span>Heures de Pointe & Services (Midi & Soir)</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500">
                Répartition horaire de l'affluence en salle et consultations (08h à 23h).
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[#99281a] border border-rose-200">
                🔥 Coup de feu
              </span>
            </div>
          </div>

          {/* Bar chart (100% fluid, no horizontal scroll) */}
          <div className="pt-4 pb-2 w-full">
            <div className="flex items-end justify-between gap-1 sm:gap-1.5 w-full h-40 sm:h-44">
              {hourlyData.map((h, idx) => {
                const heightPct = Math.max(6, (h.visits / maxHourly) * 100);
                const isHovered = hoveredHourIndex === idx;

                return (
                  <div
                    key={h.hour}
                    className="flex-1 min-w-0 max-w-[28px] flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() => setHoveredHourIndex(idx)}
                    onMouseLeave={() => setHoveredHourIndex(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-9 z-30 bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap font-mono pointer-events-none">
                        {h.hour}h : <span className="text-amber-400 font-bold">{h.visits}</span>
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md sm:rounded-t-lg transition-all duration-200 ${
                        h.isPeak
                          ? isHovered
                            ? 'bg-[#781524] scale-y-105'
                            : 'bg-gradient-to-t from-[#99281a] to-rose-500'
                          : isHovered
                          ? 'bg-amber-600'
                          : 'bg-stone-200 hover:bg-stone-300'
                      }`}
                    ></div>

                    {/* Hour label */}
                    <span
                      className={`text-[8px] sm:text-[10px] mt-1 font-mono truncate w-full text-center ${
                        h.isPeak ? 'font-bold text-[#99281a]' : 'text-stone-500'
                      }`}
                    >
                      {h.hour}h
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Service legend */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500 pt-3 border-t border-stone-100 mt-2 flex-wrap gap-2">
              <span className="flex items-center gap-1">
                ☀️ <strong>Service Midi :</strong> 12h00 - 14h00
              </span>
              <span className="flex items-center gap-1">
                🌙 <strong>Service Soir :</strong> 19h00 - 22h30
              </span>
            </div>
          </div>
        </div>

        {/* Live Capacity Gauge & Top Dishes for the Selected Restaurant (1 Col) */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between w-full max-w-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-serif font-black text-stone-900 text-sm sm:text-base flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#99281a]" />
                <span>Affluence & Plats Stars</span>
              </h4>
              <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-bold animate-pulse">
                EN DIRECT
              </span>
            </div>

            {/* Live Capacity Meter */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span>Remplissage estimé</span>
                <span className="font-mono text-sm text-[#99281a]">
                  {restaurantSummary ? restaurantSummary.currentLiveCapacity : 82}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden p-0.5">
                <div
                  style={{
                    width: `${restaurantSummary ? restaurantSummary.currentLiveCapacity : 82}%`,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-[#99281a] transition-all duration-500"
                ></div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-500">
                <span>Calme</span>
                <span>Modéré</span>
                <span className="font-bold text-[#99281a]">Forte affluence</span>
              </div>
            </div>

            {/* Top 4 Dishes */}
            <div className="mt-4 space-y-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Plats les plus consultés {isGlobal ? '(Plateforme)' : ''}
              </span>
              <div className="space-y-1.5">
                {(restaurantSummary?.topDishes || [
                  { id: '1', name: 'Pizza Napolitaine Royale', views: 3420 },
                  { id: '2', name: 'Burrata Crémeuse des Pouilles', views: 2890 },
                  { id: '3', name: 'Tagliatelles à la Carbonara', views: 2450 },
                  { id: '4', name: 'Tiramisù Traditionnel au Mascarpone', views: 2110 },
                ]).map((dish, i) => (
                  <div
                    key={dish.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-50/70 border border-stone-200/60 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-stone-800 truncate">
                        {dish.name}
                      </span>
                    </div>
                    <span className="font-mono text-stone-500 text-[11px] shrink-0 font-bold ml-2">
                      {dish.views.toLocaleString('fr-FR')} vues
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900">
            💡 <strong>Astuce Fondateur :</strong> Les scans QR code augmentent de 34% le vendredi soir et le samedi soir.
          </div>
        </div>
      </div>
    </div>
  );
};
