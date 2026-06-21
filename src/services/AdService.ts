/**
 * AdService
 * Phase 1: Manage promotional content with scheduling
 *
 * Features:
 * - Load bundled ads (fallback)
 * - Load and cache ads from Supabase
 * - Filter by page, active status, and date range
 * - Cache ad images locally for offline viewing
 */

import StorageService from './StorageService';
import DatabaseService from './DatabaseService';
import type { Ad, SyncResult } from '../types/database';

class AdService {
  private static instance: AdService;
  private loadedAds: Ad[] = [];
  private isLoading = false;

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  /**
   * Load bundled ads (shipped with app)
   * Returns empty array if no bundled ads
   */
  public async loadBundledAds(): Promise<Ad[]> {
    try {
      // In production: import BUNDLED_ADS from '../../data/bundled-ads.json'
      // Ads are primarily managed via Supabase
      return [];
    } catch (error) {
      console.error('[AdService] Error loading bundled ads:', error);
      return [];
    }
  }

  /**
   * Load ads from AsyncStorage cache
   */
  public async loadLocalAds(): Promise<Ad[]> {
    try {
      const cached = await StorageService.getInstance().load<Ad[]>('ads_cache');
      return cached || [];
    } catch (error) {
      console.error('[AdService] Error loading cached ads:', error);
      return [];
    }
  }

  /**
   * Sync ads from Supabase
   * Caches result locally
   */
  public async syncAds(): Promise<SyncResult> {
    if (this.isLoading) {
      return {
        success: false,
        content_updated: false,
        ads_updated: false,
        content_version: null,
        ads_count: this.loadedAds.length,
        synced_at: new Date().toISOString(),
        error: 'Sync already in progress',
      };
    }

    this.isLoading = true;

    try {
      const db = DatabaseService.getInstance();
      const supabase = db.getClient();

      if (!supabase) {
        console.log('[AdService] Not online - using cached ads');
        return {
          success: false,
          content_updated: false,
          ads_updated: false,
          content_version: null,
          ads_count: this.loadedAds.length,
          synced_at: new Date().toISOString(),
          error: 'Not connected',
        };
      }

      // Fetch all active ads
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('[AdService] Error fetching ads:', error);
        return {
          success: false,
          content_updated: false,
          ads_updated: false,
          content_version: null,
          ads_count: this.loadedAds.length,
          synced_at: new Date().toISOString(),
          error: error.message,
        };
      }

      const ads = (data || []) as Ad[];

      // Cache to storage
      await StorageService.getInstance().save('ads_cache', ads);

      // Update in-memory cache
      this.loadedAds = ads;

      console.log('[AdService] Synced', ads.length, 'ads');

      return {
        success: true,
        content_updated: false,
        ads_updated: true,
        content_version: null,
        ads_count: ads.length,
        synced_at: new Date().toISOString(),
        error: null,
      };
    } catch (error) {
      console.error('[AdService] Sync failed:', error);
      return {
        success: false,
        content_updated: false,
        ads_updated: false,
        content_version: null,
        ads_count: this.loadedAds.length,
        synced_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get ads for a specific page
   * Filters by: page name, active status, date range
   * Sorted by display_order
   */
  public async getAdsForPage(pageName: string): Promise<Ad[]> {
    try {
      // Load from cache or storage
      let ads = this.loadedAds;
      if (ads.length === 0) {
        ads = await this.loadLocalAds();
      }

      if (ads.length === 0) {
        ads = await this.loadBundledAds();
      }

      const now = new Date();

      // Filter by: page, active, date range
      const filtered = ads.filter((ad) => {
        // Check if page is in ad's pages array
        const hasPage = ad.pages.includes(pageName);
        if (!hasPage) return false;

        // Check if active
        if (!ad.active) return false;

        // Check if within date range
        const startDate = new Date(ad.start_date);
        const endDate = new Date(ad.end_date);
        if (now < startDate || now > endDate) {
          return false;
        }

        return true;
      });

      // Sort by display_order
      return filtered.sort((a, b) => a.display_order - b.display_order);
    } catch (error) {
      console.error('[AdService] Error getting ads for page:', error);
      return [];
    }
  }

  /**
   * Get single ad by ID
   */
  public async getAdById(adId: string): Promise<Ad | null> {
    try {
      let ads = this.loadedAds;
      if (ads.length === 0) {
        ads = await this.loadLocalAds();
      }

      const ad = ads.find((a) => a.id === adId);
      return ad || null;
    } catch (error) {
      console.error('[AdService] Error getting ad by ID:', error);
      return null;
    }
  }

  /**
   * Cache all ad images locally for offline viewing
   * TODO: Implement using expo-file-system
   */
  public async cacheAdImages(ads: Ad[]): Promise<void> {
    try {
      console.log('[AdService] Would cache', ads.length, 'ad images');
    } catch (error) {
      console.error('[AdService] Error caching images:', error);
    }
  }

  /**
   * Get cached image path for an ad image
   * TODO: Implement using expo-file-system
   */
  public getCachedImagePath(imageUrl: string): string {
    return imageUrl; // Fallback to remote URL
  }

  /**
   * Get all available pages mentioned in ads
   */
  public async getAllPages(): Promise<string[]> {
    try {
      const ads = this.loadedAds.length > 0 ? this.loadedAds : await this.loadLocalAds();
      const pages = new Set<string>();

      ads.forEach((ad) => {
        ad.pages.forEach((page) => pages.add(page));
      });

      return Array.from(pages).sort();
    } catch (error) {
      console.error('[AdService] Error getting pages:', error);
      return [];
    }
  }

  /**
   * Clear in-memory cache
   */
  public clearCache(): void {
    this.loadedAds = [];
  }
}

export default AdService;
