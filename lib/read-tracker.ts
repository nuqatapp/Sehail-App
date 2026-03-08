import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "sehail_read_items";

export async function markAsRead(itemId: string): Promise<void> {
  const items = await getReadItems();
  if (!items.includes(itemId)) {
    items.push(itemId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

export async function getReadItems(): Promise<string[]> {
  const val = await AsyncStorage.getItem(STORAGE_KEY);
  if (val) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

export function isRead(itemId: string, readItems: string[]): boolean {
  return readItems.includes(itemId);
}
