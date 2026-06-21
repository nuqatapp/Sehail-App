/**
 * ContentService
 * Phase 1: Manage bundled and synced content (wisdom.json)
 *
 * Offline-first: App ships with wisdom.json bundled.
 * When online, checks for newer versions and syncs automatically.
 *
 * Logic:
 * 1. Try load from AsyncStorage (synced version)
 * 2. If not available, load bundled data/wisdom.json
 * 3. On sync: Check remote content_versions, if newer download and save
 */

import StorageService from './StorageService';
import DatabaseService from './DatabaseService';
import type { WisdomData, ContentVersion, SyncResult, ContentFilter, ContentItem } from '../types/database';

// Bundled wisdom.json - shipped with app at build time
// In production, import from: import BUNDLED_WISDOM from '../../data/wisdom.json'
// For now, providing minimal example structure
const BUNDLED_WISDOM: WisdomData = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  guides: [],
  landmarks: [],
  wisdom: [],
  hazards: [],
};

class ContentService {
  private static instance: ContentService;
  private loadedContent: WisdomData | null = null;
  private isLoading = false;

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): ContentService {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService();
    }
    return ContentService.instance;
  }

  /**
   * Load bundled content (shipped with app)
   */
  public async loadBundledContent(): Promise<WisdomData> {
    try {
      // In production, this imports from file:
      // import BUNDLED_WISDOM from '../../data/wisdom.json'
      return BUNDLED_WISDOM;
    } catch (error) {
      console.error('[ContentService] Error loading bundled content:', error);
      return this.getEmptyContent();
    }
  }

  /**
   * Load synced content from AsyncStorage
   * Returns null if not synced yet
   */
  public async loadLocalContent(): Promise<WisdomData | null> {
    try {
      const content = await StorageService.getInstance().load<WisdomData>('wisdom_content');
      return content;
    } catch (error) {
      console.error('[ContentService] Error loading local content:', error);
      return null;
    }
  }

  /**
   * Get content from cache, load from storage, or use bundled
   * This is the main entry point for reading content
   */
  public async getContent(): Promise<WisdomData> {
    // Return cached if available
    if (this.loadedContent) {
      return this.loadedContent;
    }

    // Try storage first (synced version)
    let content = await this.loadLocalContent();
    if (content) {
      this.loadedContent = content;
      return content;
    }

    // Fall back to bundled
    content = await this.loadBundledContent();
    this.loadedContent = content;
    return content;
  }

  /**
   * Sync content from Supabase
   * Checks remote content_versions table, downloads if newer
   * Returns success indicator and new version
   */
  public async syncContent(): Promise<SyncResult> {
    if (this.isLoading) {
      return {
        success: false,
        content_updated: false,
        ads_updated: false,
        content_version: null,
        ads_count: 0,
        synced_at: new Date().toISOString(),
        error: 'Sync already in progress',
      };
    }

    this.isLoading = true;

    try {
      const db = DatabaseService.getInstance();
      const supabase = db.getClient();

      if (!supabase) {
        return {
          success: false,
          content_updated: false,
          ads_updated: false,
          content_version: null,
          ads_count: 0,
          synced_at: new Date().toISOString(),
          error: 'Not connected to Supabase',
        };
      }

      // Get current local version
      const storage = StorageService.getInstance();
      const currentVersion = await storage.load<string>('wisdom_version');

      // Fetch latest version from database
      const { data: versions, error } = await supabase
        .from('content_versions')
        .select('*')
        .order('released_at', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('[ContentService] Error fetching versions:', error);
        return {
          success: false,
          content_updated: false,
          ads_updated: false,
          content_version: currentVersion || null,
          ads_count: 0,
          synced_at: new Date().toISOString(),
          error: error.message,
        };
      }

      if (!versions || versions.length === 0) {
        console.log('[ContentService] No versions available');
        return {
          success: true,
          content_updated: false,
          ads_updated: false,
          content_version: currentVersion || null,
          ads_count: 0,
          synced_at: new Date().toISOString(),
          error: null,
        };
      }

      const latestVersion = versions[0] as ContentVersion;

      // Check if we need to update
      if (currentVersion === latestVersion.version) {
        console.log('[ContentService] Already on latest version:', currentVersion);
        return {
          success: true,
          content_updated: false,
          ads_updated: false,
          content_version: currentVersion,
          ads_count: 0,
          synced_at: new Date().toISOString(),
          error: null,
        };
      }

      // TODO: In production, download actual wisdom.json from storage bucket
      const newContent = await this.loadBundledContent();

      // Save to storage
      await storage.saveMultiple([
        { key: 'wisdom_content', data: newContent },
        { key: 'wisdom_version', data: latestVersion.version },
      ]);

      // Update local cache
      this.loadedContent = newContent;

      console.log('[ContentService] Content synced to version:', latestVersion.version);

      return {
        success: true,
        content_updated: true,
        ads_updated: false,
        content_version: latestVersion.version,
        ads_count: 0,
        synced_at: new Date().toISOString(),
        error: null,
      };
    } catch (error) {
      console.error('[ContentService] Sync failed:', error);
      return {
        success: false,
        content_updated: false,
        ads_updated: false,
        content_version: null,
        ads_count: 0,
        synced_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Filter content by category
   * Returns array of items matching criteria
   */
  public async getCategoryItems(
    category: 'guides' | 'landmarks' | 'wisdom' | 'hazards',
    filters?: ContentFilter
  ): Promise<ContentItem[]> {
    try {
      const content = await this.getContent();
      let items = [...(content[category] || [])] as ContentItem[];

      // Apply filters
      if (filters?.region) {
        items = items.filter((item) => item.region === filters.region);
      }

      if (filters?.difficulty) {
        items = items.filter((item) => item.difficulty === filters.difficulty);
      }

      if (filters?.tags && filters.tags.length > 0) {
        items = items.filter((item) =>
          filters.tags!.some((tag) => item.tags.includes(tag))
        );
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        items = items.filter(
          (item) =>
            item.title_ar.toLowerCase().includes(searchLower) ||
            item.title_en.toLowerCase().includes(searchLower) ||
            item.description_ar.toLowerCase().includes(searchLower) ||
            item.description_en.toLowerCase().includes(searchLower)
        );
      }

      return items;
    } catch (error) {
      console.error('[ContentService] Error filtering content:', error);
      return [];
    }
  }

  /**
   * Get all unique tags across content
   */
  public async getAllTags(): Promise<string[]> {
    try {
      const content = await this.getContent();
      const allItems = [
        ...content.guides,
        ...content.landmarks,
        ...content.wisdom,
        ...content.hazards,
      ];

      const tags = new Set<string>();
      allItems.forEach((item) => {
        item.tags.forEach((tag) => tags.add(tag));
      });

      return Array.from(tags).sort();
    } catch (error) {
      console.error('[ContentService] Error getting tags:', error);
      return [];
    }
  }

  /**
   * Get all regions mentioned in content
   */
  public async getAllRegions(): Promise<string[]> {
    try {
      const content = await this.getContent();
      const allItems = [
        ...content.guides,
        ...content.landmarks,
        ...content.wisdom,
        ...content.hazards,
      ];

      const regions = new Set<string>();
      allItems.forEach((item) => {
        if (item.region) {
          regions.add(item.region);
        }
      });

      return Array.from(regions).sort();
    } catch (error) {
      console.error('[ContentService] Error getting regions:', error);
      return [];
    }
  }

  /**
   * Clear cached content (useful for testing or reset)
   */
  public clearCache(): void {
    this.loadedContent = null;
  }

  /**
   * Return empty content structure
   */
  private getEmptyContent(): WisdomData {
    return {
      version: '0.0.0',
      lastUpdated: new Date().toISOString(),
      guides: [],
      landmarks: [],
      wisdom: [],
      hazards: [],
    };
  }
}

export default ContentService;
