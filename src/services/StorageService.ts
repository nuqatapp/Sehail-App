/**
 * StorageService
 * Phase 1: AsyncStorage wrapper for offline-first data
 *
 * All app data lives in AsyncStorage by default. When online, synced to Supabase.
 * This service provides typed, Promise-based access to local storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageKey } from '../types/database';

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  /**
   * Singleton pattern - ensures one storage instance
   */
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Save typed data to storage
   * Automatically serializes to JSON
   */
  public async save<T>(key: StorageKey, data: T): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      await AsyncStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`[StorageService] Error saving ${key}:`, error);
      throw error;
    }
  }

  /**
   * Load typed data from storage
   * Returns null if key doesn't exist
   */
  public async load<T>(key: StorageKey): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[StorageService] Error loading ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a single key
   */
  public async delete(key: StorageKey): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`[StorageService] Error deleting ${key}:`, error);
    }
  }

  /**
   * Get all storage keys
   */
  public async getAllKeys(): Promise<StorageKey[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys as StorageKey[];
    } catch (error) {
      console.error('[StorageService] Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Clear all data from storage
   * WARNING: This is destructive. Use only for logout/reset scenarios.
   */
  public async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('[StorageService] All storage cleared');
    } catch (error) {
      console.error('[StorageService] Error clearing storage:', error);
    }
  }

  /**
   * Check if a key exists
   */
  public async hasKey(key: StorageKey): Promise<boolean> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item !== null;
    } catch (error) {
      console.error(`[StorageService] Error checking ${key}:`, error);
      return false;
    }
  }

  /**
   * Get storage size in bytes (approximate)
   * Useful for debugging storage usage
   */
  public async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('[StorageService] Error calculating storage size:', error);
      return 0;
    }
  }

  /**
   * Bulk save multiple items
   * More efficient than individual saves
   */
  public async saveMultiple(
    items: Array<{ key: StorageKey; data: unknown }>
  ): Promise<void> {
    try {
      const pairs: [string, string][] = items.map(({ key, data }) => [
        key,
        JSON.stringify(data),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('[StorageService] Error in multiSet:', error);
    }
  }

  /**
   * Bulk load multiple items
   * More efficient than individual loads
   */
  public async loadMultiple(
    keys: StorageKey[]
  ): Promise<Record<StorageKey, unknown>> {
    try {
      const items = await AsyncStorage.multiGet(keys);
      const result: Record<StorageKey, unknown> = {};

      for (const [key, value] of items) {
        if (value !== null) {
          result[key as StorageKey] = JSON.parse(value);
        }
      }

      return result;
    } catch (error) {
      console.error('[StorageService] Error in multiGet:', error);
      return {};
    }
  }
}

export default StorageService;
