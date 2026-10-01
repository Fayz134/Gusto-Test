import { DietaryProfile } from '../types';

export const DIETARY_PROFILE_STORAGE_KEY = 'gusto_dietary_profile_v1';

export function getSavedDietaryProfile(): DietaryProfile | null {
  try {
    const raw = localStorage.getItem(DIETARY_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        allergens: Array.isArray(parsed.allergens) ? parsed.allergens : [],
        isHalal: Boolean(parsed.isHalal),
        isVegan: Boolean(parsed.isVegan),
        amenities: Array.isArray(parsed.amenities) ? parsed.amenities : [],
        maxKcal: typeof parsed.maxKcal === 'number' ? parsed.maxKcal : undefined,
        savedAt: parsed.savedAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn('Failed to load dietary profile from localStorage:', err);
  }
  return null;
}

export function saveDietaryProfile(profile: Partial<DietaryProfile>): DietaryProfile {
  const current = getSavedDietaryProfile() || {
    allergens: [],
    isHalal: false,
    isVegan: false,
    amenities: [],
  };

  const updated: DietaryProfile = {
    allergens: profile.allergens ?? current.allergens,
    isHalal: profile.isHalal ?? current.isHalal,
    isVegan: profile.isVegan ?? current.isVegan,
    amenities: profile.amenities ?? current.amenities,
    maxKcal: profile.maxKcal ?? current.maxKcal,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(DIETARY_PROFILE_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save dietary profile to localStorage:', err);
  }
  return updated;
}

export function clearSavedDietaryProfile(): void {
  try {
    localStorage.removeItem(DIETARY_PROFILE_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear dietary profile from localStorage:', err);
  }
}
