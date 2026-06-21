/**
 * Sehail Database Types
 * Phase 1: Matches database schema exactly
 *
 * All types are readonly to enforce immutability in the offline-first layer.
 * Mutations go through service methods, not direct object modifications.
 */

/**
 * Ad - Promotional content with scheduling and page-based targeting
 * Synced from Supabase, cached locally, filtered by date + page
 */
export interface Ad {
  readonly id: string;
  readonly shop_name: string;
  readonly image_url: string | null;
  readonly shop_website: string | null;
  readonly pages: readonly string[];  // ["home", "guide", "quiz", "compass"]
  readonly start_date: string;  // ISO timestamp
  readonly end_date: string;  // ISO timestamp
  readonly active: boolean;
  readonly display_order: number;
  readonly created_at: string;
  readonly updated_at: string;
  readonly created_by: string | null;
}

/**
 * UserProgress - Local user data, synced to Supabase
 * No authentication; device_id is the unique identifier
 * All progress data is persisted locally and synced when online
 */
export interface UserProgress {
  readonly id?: string;  // UUID from Supabase (optional on local create)
  readonly user_id: string;  // Device identifier (generated once, persisted)
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly last_sync: string | null;  // ISO timestamp of last sync
  readonly content_version: string | null;  // e.g., "1.0.0"
  readonly language: 'ar' | 'en';
  readonly streak_days: number;
  readonly completed_checklists: readonly string[];  // Checklist IDs
  readonly badges: readonly string[];  // Badge IDs earned
  readonly total_guides_read: number;
}

/**
 * ContentVersion - Wisdom.json metadata for smart syncing
 * App checks remote versions; if newer, downloads updated content
 */
export interface ContentVersion {
  readonly id: string;
  readonly version: string;  // semver: "1.0.0"
  readonly content_hash: string;  // MD5 of wisdom.json
  readonly released_at: string;  // ISO timestamp
  readonly changelog: string | null;
}

/**
 * WisdomData - The core content structure (from wisdom.json)
 * Bundled with app at build time, synced from Supabase when online
 */
export interface WisdomItem {
  readonly id: string;
  readonly title_ar: string;
  readonly title_en: string;
  readonly category: string;  // "guides", "landmarks", "wisdom", "hazards"
  readonly description_ar: string;
  readonly description_en: string;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly region?: string;  // Saudi region
  readonly difficulty?: 'easy' | 'moderate' | 'hard';
  readonly tags: readonly string[];
  readonly featured?: boolean;
}

export interface WisdomData {
  readonly version: string;  // semver
  readonly lastUpdated: string;  // ISO timestamp
  readonly guides: readonly WisdomItem[];
  readonly landmarks: readonly WisdomItem[];
  readonly wisdom: readonly WisdomItem[];
  readonly hazards: readonly WisdomItem[];
}

/**
 * SyncResult - Returned from sync operations
 * Indicates what was synced and any errors
 */
export interface SyncResult {
  readonly success: boolean;
  readonly content_updated: boolean;
  readonly ads_updated: boolean;
  readonly content_version: string | null;
  readonly ads_count: number;
  readonly synced_at: string;  // ISO timestamp
  readonly error: string | null;
}

/**
 * Storage keys for AsyncStorage
 * All app data lives in AsyncStorage, synced to Supabase when online
 */
export type StorageKey =
  | 'wisdom_content'
  | 'wisdom_version'
  | 'ads_cache'
  | 'user_progress'
  | 'language'
  | 'last_sync'
  | 'device_id';

/**
 * Device ID - Generated once per install, never changes
 * Used as user_id in database (anonymous identification)
 */
export interface DeviceInfo {
  readonly device_id: string;  // UUID, persisted in AsyncStorage
  readonly created_at: string;  // ISO timestamp
}

/**
 * Content filter options for queries
 */
export interface ContentFilter {
  readonly category?: string;
  readonly region?: string;
  readonly difficulty?: 'easy' | 'moderate' | 'hard';
  readonly tags?: readonly string[];
  readonly search?: string;
}

/**
 * ContentItem alias for WisdomItem (used in service return types)
 */
export type ContentItem = WisdomItem;

/**
 * Sync configuration (passed to SyncService)
 */
export interface SyncConfig {
  readonly forceRefresh?: boolean;  // Skip cache, always fetch remote
  readonly timeout?: number;  // Timeout in ms
  readonly offline_okay?: boolean;  // Don't throw if offline (default: true)
}
