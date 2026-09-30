import React, { useState } from 'react';
import {
  X,
  Building2,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  UtensilsCrossed,
  ShieldCheck,
} from 'lucide-react';
import { RestaurantRegistration } from '../types';

interface RestaurantRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRegistration: (newRegistration: RestaurantRegistration) => void;
  onShowToast: (message: string) => void;
}

export const RestaurantRegistrationModal: React.FC<RestaurantRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmitRegistration,
  onShowToast,
}) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [cuisine, setCuisine] = useState('Bistronomique Provençale');
  const [priceRange, setPriceRange] = useState('€€ (20-35€)');
  const [description, setDescription] = useState('');
  const [openingHoursPreview, setOpeningHoursPreview] = useState('Mardi - Samedi (12h-14h30 / 19h30-22h30)');
  const [sampleDishes, setSampleDishes] = useState('');
  const [isHalalCertified, setIsHalalCertified] = useState(false);
  const [website, setWebsite] = useState('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setRestaurantName('La Table d\'Aubagne & Bastide');
    setContactName('Mathieu & Claire Boyer');
    setEmail('contact@bastide-aubagne.fr');
    setPhone('04 42 70 81 22');
    setAddress('8 Chemin des Restanques, 13400 Aubagne');
    setCity('Aubagne');
    setCuisine('Cuisine Méditerranéenne & Grillades');
    setPriceRange('€€ (25-40€)');
    setDescription('Bastide provençale ombragée par des platanes centenaires. Grillades au feu de sarments de vigne, poissons sauvages et légumes gorgés de soleil.');
    setOpeningHoursPreview('Mardi - Dimanche (12h00-14h30 / 19h30-23h00)');
    setSampleDishes('Souris d\'agneau confite 7 heures, Loup grillé au fenouil, Clafoutis aux cerises burlat.');
    setIsHalalCertified(false);
    setWebsite('https://bastide-aubagne.fr');
    onShowToast('Exemple de candidature complété !');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantName.trim() || !contactName.trim() || !phone.trim() || !address.trim()) {
      onShowToast('Veuillez renseigner tous les champs obligatoires (*).');
      return;
    }

    const safeId =
      restaurantName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `resto-${Date.now()}`;

    const newReg: RestaurantRegistration = {
      id: `reg_${safeId}_${Date.now()}`,
      restaurantName: restaurantName.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim() || 'Aubagne',
      cuisine: cuisine.trim(),
      priceRange: priceRange.trim(),
      description: description.trim() || 'Établissement culinaire convivial et authentique.',
      submittedAt: new Date().toISOString(),
      status: 'en_attente',
      openingHoursPreview: openingHoursPreview.trim(),
      sampleDishes: sampleDishes.trim(),
      isHalalCertified,
      website: website.trim(),
      draftRestaurant: {
        id: safeId,
        name: restaurantName.trim(),
        tagline: 'Cuisine Passionnée & Produits Frais',
        cuisine: cuisine.trim(),
        priceRange: priceRange.trim(),
        address: address.trim(),
        phone: phone.trim(),
        banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        coords: { lat: 43.2925, lng: 5.5708 },
        distance: 0.8,
        avgKcal: 550,
        isHalalCertified,
        dishOfTheMomentEnabled: true,
        dishOfTheMomentId: `${safeId}_dish_1`,
        openingHours: {
          isOpenNow: true,
          days: 'Mardi - Dimanche',
          lunch: '12h00 - 14h30',
          dinner: '19h30 - 23h00',
        },
        categories: [
          { id: 'all', name: 'Toute la carte', name_fr: 'Toute la carte', iconName: 'utensils' },
          { id: 'entrees', name: 'Entrées Fraîches', name_fr: 'Entrées Fraîches', iconName: 'sparkles' },
          { id: 'plats', name: 'Plats Spécialités', name_fr: 'Plats Spécialités', iconName: 'flame' },
          { id: 'desserts', name: 'Desserts Maison', name_fr: 'Desserts Maison', iconName: 'cake' },
        ],
        dishes: [
          {
            id: `${safeId}_dish_1`,
            categoryId: 'plats',
            name: sampleDishes ? sampleDishes.split(',')[0].trim() : 'Plat Signature du Chef',
            name_fr: sampleDishes ? sampleDishes.split(',')[0].trim() : 'Plat Signature du Chef',
            price: 22.0,
            portion: '340g',
            description: 'Recette emblématique préparée avec des ingrédients soigneusement sélectionnés.',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            tags: ['Signature', 'Fait Maison'],
            nutrition: { kcal: 580, protein: 38, carbs: 24, fat: 28, fiber: 3 },
            allergens: [],
          },
        ],
        customization: {
          themePreset: 'terracotta',
          primaryColor: '#c2410c',
          accentColor: '#ea580c',
          fontStyle: 'serif',
          showAddressBadge: true,
          showPhoneBadge: true,
          showHoursBadge: true,
          showAnnouncement: true,
          announcement: `Bienvenue chez ${restaurantName.trim()} !`,
          announcementEmoji: '🍽️',
        },
      },
    };

    onSubmitRegistration(newReg);
    setIsSubmittedSuccess(true);
    onShowToast(`Votre candidature pour « ${newReg.restaurantName} » a été transmise ! 🎉`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-stone-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#99281a] text-white flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg sm:text-xl text-stone-900">
                Inscrire mon Restaurant sur Gusto
              </h3>
              <p className="text-xs text-stone-500">
                Rejoignez le portail gourmand Gusto et offrez une visibilité premium à votre carte.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {isSubmittedSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-black text-2xl text-stone-900">
                  Candidature transmise avec succès !
                </h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                  Votre demande d'inscription pour <strong className="text-stone-900">{restaurantName}</strong> a été transmise aux administrateurs de la plateforme Gusto.
                  Elle est désormais visible dans le dashboard fondateur pour vérification et validation.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#99281a] hover:bg-[#781524] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Terminer & Fermer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200 p-3 rounded-2xl">
                <div className="flex items-center gap-2 text-xs text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Besoin d'un test rapide ? Pré-remplissez le formulaire en un clic.</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-3 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold transition shrink-0 cursor-pointer"
                >
                  Remplir exemple
                </button>
              </div>

              {/* IDENTIFICATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nom du Restaurant *
                  </label>
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Ex: La Trattoria du Port"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nom du Gérant / Contact *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Ex: Marc Rossi"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Téléphone de contact *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 04 42 01 23 45"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@restaurant.fr"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                  />
                </div>
              </div>

              {/* LOCATION & CUISINE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Adresse postale complète *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: 14 Place Richelme, 13100 Aix-en-Provence"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Aix-en-Provence, Aubagne..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                  />
                </div>
              </div>

              {/* CUISINE & PRICING */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Type de Cuisine
                  </label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="Ex: Italienne, Bistronomique, Fruits de Mer..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Gamme de prix
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                  >
                    <option value="€ (10-20€)">€ (10-20€) - Accessible & Street food</option>
                    <option value="€€ (20-35€)">€€ (20-35€) - Brasserie & Bistrot</option>
                    <option value="€€€ (35-65€)">€€€ (35-65€) - Gastronomique & Prestige</option>
                    <option value="€€€€ (> 65€)">€€€€ (&gt; 65€) - Haute Gastronomie Étoilée</option>
                  </select>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Présentation du restaurant
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Racontez votre histoire, votre philosophie culinaire et vos produits..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                />
              </div>

              {/* DISHES & HOURS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Plats emblématiques / Spécialités
                  </label>
                  <input
                    type="text"
                    value={sampleDishes}
                    onChange={(e) => setSampleDishes(e.target.value)}
                    placeholder="Ex: Risotto aux truffes, Tiramisu grand-mère..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Horaires d'ouverture
                  </label>
                  <input
                    type="text"
                    value={openingHoursPreview}
                    onChange={(e) => setOpeningHoursPreview(e.target.value)}
                    placeholder="Ex: Mardi - Dimanche (12h-14h30 / 19h-23h)"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#99281a]"
                  />
                </div>
              </div>

              {/* CERTIFICATION HALAL */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="halalCheckbox"
                  checked={isHalalCertified}
                  onChange={(e) => setIsHalalCertified(e.target.checked)}
                  className="rounded text-[#99281a] focus:ring-[#99281a] h-4 w-4 cursor-pointer"
                />
                <label htmlFor="halalCheckbox" className="text-xs text-stone-700 font-medium cursor-pointer">
                  Établissement certifié ou proposant des viandes 100% Halal
                </label>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#99281a] hover:bg-[#781524] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer ma Demande d'Inscription</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
