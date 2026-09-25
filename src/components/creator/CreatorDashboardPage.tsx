import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  Lock,
  LogOut,
  ArrowLeft,
  KeyRound,
  Sparkles,
  Crown,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  UtensilsCrossed,
  Activity,
  Layers,
} from 'lucide-react';
import { Restaurant } from '../../types';
import {
  isCreatorAuthenticated,
  loginCreator,
  logoutCreator,
  updateCreatorPasscode,
} from '../../utils/creatorAuth';
import { TrafficCharts } from './TrafficCharts';
import { RestaurantManager } from './RestaurantManager';
import { RestaurantFormModal } from './RestaurantFormModal';

interface CreatorDashboardPageProps {
  restaurants: Restaurant[];
  onAddRestaurant: (newRestaurant: Restaurant) => void;
  onUpdateRestaurant: (updatedRestaurant: Restaurant) => void;
  onDeleteRestaurant: (restaurantId: string) => void;
  onResetRestaurantsToDefault: () => void;
  onOpenPublicRestaurant: (restaurantId: string) => void;
  onEditRestaurantMenu: (restaurantId: string) => void;
  onBackToPortal: () => void;
  onShowToast: (message: string) => void;
}

export const CreatorDashboardPage: React.FC<CreatorDashboardPageProps> = ({
  restaurants,
  onAddRestaurant,
  onUpdateRestaurant,
  onDeleteRestaurant,
  onResetRestaurantsToDefault,
  onOpenPublicRestaurant,
  onEditRestaurantMenu,
  onBackToPortal,
  onShowToast,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    isCreatorAuthenticated()
  );
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'affluence' | 'restaurants' | 'security'>('affluence');

  // Chart selection state
  const [selectedRestaurantIdForChart, setSelectedRestaurantIdForChart] = useState<string>('all');

  // Restaurant Form Modal (Dual Mode: Add or Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRestaurantToEdit, setSelectedRestaurantToEdit] = useState<Restaurant | null>(null);

  // Security tab state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [securityMsg, setSecurityMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const result = loginCreator(passcodeAttempt);
    if (result.success) {
      setIsAuthenticated(true);
      onShowToast('Bienvenue sur votre Dashboard Créateur Gusto 👑');
    } else {
      setAuthError(result.error || 'Code invalide.');
    }
  };

  const handleLogout = () => {
    logoutCreator();
    setIsAuthenticated(false);
    onShowToast('Session créateur verrouillée.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg(null);
    if (newPass !== confirmPass) {
      setSecurityMsg({ text: 'Les deux mots de passe ne correspondent pas.', type: 'error' });
      return;
    }
    const res = updateCreatorPasscode(currentPass, newPass);
    if (res.success) {
      setSecurityMsg({ text: 'Code maître créateur mis à jour avec succès !', type: 'success' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      onShowToast('Code créateur modifié.');
    } else {
      setSecurityMsg({ text: res.error || 'Erreur lors du changement.', type: 'error' });
    }
  };

  const handleOpenAddModal = () => {
    setSelectedRestaurantToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (restaurant: Restaurant) => {
    setSelectedRestaurantToEdit(restaurant);
    setIsFormModalOpen(true);
  };

  const handleSaveRestaurant = (restaurant: Restaurant, isEdit: boolean) => {
    if (isEdit) {
      onUpdateRestaurant(restaurant);
    } else {
      onAddRestaurant(restaurant);
    }
  };

  // If not authenticated, show high-security executive lock screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col justify-between text-stone-100 p-4 sm:p-6 selection:bg-[#99281a] selection:text-white">
        {/* Top return link */}
        <div className="max-w-4xl mx-auto w-full pt-4 flex items-center justify-between">
          <button
            onClick={onBackToPortal}
            className="flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Revenir au site public Gusto</span>
          </button>

          <span className="text-[11px] font-mono text-amber-500/80 border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Accès Réservé au Fondateur</span>
          </span>
        </div>

        {/* Lock Screen Card */}
        <div className="max-w-md w-full mx-auto my-12 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#99281a] via-[#781524] to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-rose-900/40 border border-amber-400/30">
              <Crown className="w-7 h-7 text-[#dfab43]" />
            </div>
            <h2 className="font-serif font-black text-2xl text-white tracking-tight">
              Dashboard Créateur
            </h2>
            <p className="text-xs text-stone-400">
              Supervision de la plateforme Gusto, affluences et gestion du parc de restaurants.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
                Code Maître / Mot de Passe Créateur
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passcodeAttempt}
                  onChange={(e) => setPasscodeAttempt(e.target.value)}
                  placeholder="Entrez votre code créateur..."
                  className="w-full bg-stone-800/90 border border-stone-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#99281a] focus:border-transparent font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#99281a] to-[#781524] hover:from-[#b03020] hover:to-[#8c182a] text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-rose-950 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>Déverrouiller le Dashboard Créateur</span>
            </button>
          </form>

          <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 text-[11px] text-stone-400 text-center space-y-1">
            <p>
              🔒 <strong>Code créateur par défaut :</strong>{' '}
              <code className="text-amber-300 font-mono font-bold bg-stone-800 px-1.5 py-0.5 rounded">
                gusto-creator-2026
              </code>
            </p>
            <p className="text-[10px] text-stone-500">
              Vous pourrez personnaliser ce code dans l'onglet Sécurité du Dashboard.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-stone-600 pb-2">
          © 2026 Gusto France • Master Console Privée v3.2
        </div>
      </div>
    );
  }

  // Authenticated Executive View
  const totalDishesCount = restaurants.reduce((acc, r) => acc + (r.dishes?.length || 0), 0);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col justify-between selection:bg-[#99281a] selection:text-white w-full max-w-full overflow-x-hidden">
      {/* TOP EXECUTIVE NAVBAR */}
      <header className="sticky top-0 z-40 bg-stone-900 text-white border-b border-stone-800 shadow-md w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#99281a] to-amber-600 flex items-center justify-center shadow-md border border-amber-400/30 shrink-0">
              <Crown className="w-5 h-5 text-[#dfab43]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-serif font-black text-base sm:text-lg tracking-tight text-white truncate">
                  Gusto Console
                </h1>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  Fondateur
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 hidden sm:block truncate">
                Pilotage centralisé, affluences & catalogue de restaurants
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onBackToPortal}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-stone-700 active:scale-95"
              title="Retourner à la vue publique du portail"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Voir site public</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              title="Verrouiller la session"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Verrouiller</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 flex-1">
        {/* HERO BANNER & STATS BANNER */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 rounded-3xl p-4 sm:p-7 text-white shadow-lg border border-stone-800 relative overflow-hidden w-full">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl min-w-0">
              <span className="text-[10px] sm:text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                Tableau de Bord Créateur • Gusto Master v3.2
              </span>
              <h2 className="font-serif font-black text-xl sm:text-2xl lg:text-3xl text-white">
                Supervision de l'Affluence & des Établissements
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Visualisez l'affluence du site en temps réel sous forme de graphiques interactifs, suivez les scans QR code en salle et gérez ou modifiez les pages des restaurants sans saisie manuelle de coordonnées GPS.
              </p>
            </div>

            {/* Quick Summary Badges (3 items harmonious on mobile & desktop) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto shrink-0">
              <div className="bg-stone-800/80 p-2.5 sm:p-4 rounded-2xl border border-stone-700/80 text-center sm:text-left min-w-0">
                <span className="text-[9px] sm:text-[10px] text-stone-400 font-bold uppercase tracking-wider block truncate">
                  Établissements
                </span>
                <span className="text-lg sm:text-2xl font-black text-amber-300 font-mono">
                  {restaurants.length}
                </span>
                <span className="text-[9px] sm:text-[10px] text-stone-400 block truncate">en ligne</span>
              </div>

              <div className="bg-stone-800/80 p-2.5 sm:p-4 rounded-2xl border border-stone-700/80 text-center sm:text-left min-w-0">
                <span className="text-[9px] sm:text-[10px] text-stone-400 font-bold uppercase tracking-wider block truncate">
                  Plats Totaux
                </span>
                <span className="text-lg sm:text-2xl font-black text-emerald-300 font-mono">
                  {totalDishesCount}
                </span>
                <span className="text-[9px] sm:text-[10px] text-stone-400 block truncate">recettes & cartes</span>
              </div>

              <div className="bg-stone-800/80 p-2.5 sm:p-4 rounded-2xl border border-stone-700/80 text-center sm:text-left min-w-0">
                <span className="text-[9px] sm:text-[10px] text-stone-400 font-bold uppercase tracking-wider block truncate">
                  Santé
                </span>
                <span className="text-lg sm:text-2xl font-black text-rose-300 font-mono">
                  100%
                </span>
                <span className="text-[9px] sm:text-[10px] text-emerald-400 block truncate">Opérationnel</span>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('affluence')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'affluence'
                ? 'bg-[#99281a] text-white shadow-xs'
                : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Affluence & Graphiques Statistiques</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('restaurants')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'restaurants'
                ? 'bg-[#99281a] text-white shadow-xs'
                : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Gestion des Restaurants (Modifier / Ajouter / Retirer)</span>
            <span className="ml-1 text-[10px] bg-black/20 px-2 py-0.2 rounded-full">
              {restaurants.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'security'
                ? 'bg-[#99281a] text-white shadow-xs'
                : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Sécurité & Code Fondateur</span>
          </button>
        </div>

        {/* TAB 1: AFFLUENCE & GRAPHIQUES */}
        {activeTab === 'affluence' && (
          <TrafficCharts
            restaurants={restaurants}
            selectedRestaurantId={selectedRestaurantIdForChart}
            onSelectRestaurantId={setSelectedRestaurantIdForChart}
          />
        )}

        {/* TAB 2: GESTION & MODIFICATION DES RESTAURANTS */}
        {activeTab === 'restaurants' && (
          <RestaurantManager
            restaurants={restaurants}
            onOpenAddModal={handleOpenAddModal}
            onEditRestaurant={handleOpenEditModal}
            onEditMenu={onEditRestaurantMenu}
            onDeleteRestaurant={onDeleteRestaurant}
            onSelectForAffluence={(id) => {
              setSelectedRestaurantIdForChart(id);
              setActiveTab('affluence');
            }}
            onOpenPublicRestaurant={onOpenPublicRestaurant}
            onResetToDefaults={onResetRestaurantsToDefault}
            onShowToast={onShowToast}
          />
        )}

        {/* TAB 3: SÉCURITÉ & PARAMÈTRES FONDATEUR */}
        {activeTab === 'security' && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-black text-lg text-stone-900">
                  Modifier le Code Créateur Maître
                </h3>
                <p className="text-xs text-stone-500">
                  Sécurisez l'accès à votre console d'administration centrale.
                </p>
              </div>
            </div>

            {securityMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                  securityMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {securityMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{securityMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Code actuel *
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Code actuel..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nouveau code créateur *
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Nouveau code..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Confirmer le nouveau code *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Confirmer le nouveau code..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#99281a] hover:bg-[#781524] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
              >
                Mettre à jour le Code Maître
              </button>
            </form>
          </div>
        )}
      </main>

      {/* RESTAURANT FORM MODAL (ADD & EDIT) */}
      <RestaurantFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialRestaurant={selectedRestaurantToEdit}
        onSaveRestaurant={handleSaveRestaurant}
        onEditMenu={onEditRestaurantMenu}
        onShowToast={onShowToast}
      />

      {/* FOOTER */}
      <footer className="bg-white border-t border-stone-200 py-4 px-6 text-center text-xs text-stone-500 mt-8">
        Gusto Platform • Console Fondateur Privée • Métriques d'affluence et supervision.
      </footer>
    </div>
  );
};
