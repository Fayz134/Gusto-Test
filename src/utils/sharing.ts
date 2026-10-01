import { Restaurant } from '../types';

export function buildShareMessage(restaurant: Restaurant, appUrl?: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gusto.fr';
  const restaurantUrl = `${origin}?restaurant=${restaurant.id}`;
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.coords.lat},${restaurant.coords.lng}`;

  return `🍽️ On mange ici ce soir ?\n\n✨ *${restaurant.name}*\n🏷️ ${restaurant.cuisine} • ${restaurant.priceRange}\n📍 ${restaurant.address}\n\n📖 Découvre le menu complet et les valeurs nutritionnelles :\n${restaurantUrl}\n\n🗺️ Itinéraire Google Maps direct :\n${gmapsUrl}`;
}

export function openWhatsAppShare(restaurant: Restaurant): void {
  const text = encodeURIComponent(buildShareMessage(restaurant));
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

export function openSmsShare(restaurant: Restaurant): void {
  const text = encodeURIComponent(buildShareMessage(restaurant));
  window.location.href = `sms:?&body=${text}`;
}

export function openWhatsAppReservation(restaurant: Restaurant): void {
  const cleanPhone = restaurant.phone.replace(/[^0-9]/g, '');
  const internationalPhone = cleanPhone.startsWith('0') ? `33${cleanPhone.slice(1)}` : cleanPhone;
  const message = encodeURIComponent(
    `Bonjour ${restaurant.name}, je souhaiterais réserver une table chez vous via Gusto. Pouvez-vous me confirmer vos disponibilités s'il vous plaît ? Merci !`
  );
  window.open(`https://wa.me/${internationalPhone}?text=${message}`, '_blank');
}

export async function copyShareText(restaurant: Restaurant): Promise<boolean> {
  const text = buildShareMessage(restaurant);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback
  }
  return false;
}
