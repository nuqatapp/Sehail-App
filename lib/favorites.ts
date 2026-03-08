import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "sehail_favorites";

export async function toggleFavorite(itemId: string): Promise<string[]> {
  const favorites = await getFavorites();
  const index = favorites.indexOf(itemId);
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(itemId);
  }
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return favorites;
}

export async function getFavorites(): Promise<string[]> {
  const val = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavorite(itemId: string, favorites: string[]): boolean {
  return favorites.includes(itemId);
}
