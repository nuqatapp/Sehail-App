/**
 * SyncService
 * Phase 1: Orchestrate content and ads syncing
 *
 * Logic:
 * 1. Check internet connection
 * 2. If online:
 *    - ContentService.syncContent()
 *    - AdService.syncAds()
 *    - Track timestamp
 * 3. If offline:
 *    - Use local/bundled data
 *    - Don't throw error
 * 4. Return sync result
 */

import NetInfo from '@react-native-community/netinfo';
import DatabaseService from './DatabaseService';
import ContentService from './ContentService';
import AdService from './AdService';
import StorageService from './StorageService';
import type { SyncResult, SyncConfig } from '../types/database';

class SyncService {
  private static instance: SyncService;
  private lastSyncTime: Date | null = null;
  private isSyncing = false;
  public syncTimeout = 30000; // 30 seconds

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Check internet connectivity
   */
  public async checkInternetConnection(): Promise<boolean> {
    try {
      const netInfoState = await NetInfo.fetch();
      return netInfoState.isConnected ?? false;
    } catch (error) {
      console.error('[SyncService] Error checking connection:', error);
      return false;
    }
  }

  /**
   * Main sync function - called on app launch
   * Syncs content and ads if online, gracefully falls back if offline
   */
  public async syncOnAppLaunch(config?: SyncConfig): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress');
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

    this.isSyncing = true;

    try {
      // Initialize database service if not already done
      const db = DatabaseService.getInstance();
      if (!db.getClient()) {
        await db.initialize();
      }

      // Check internet connection
      const isOnline = await this.checkInternetConnection();

      if (!isOnline) {
        console.log('[SyncService] Offline - using cached data');
        return {
          success: true,
          content_updated: false,
          ads_updated: false,
          content_version: null,
          ads_count: 0,
          synced_at: new Date().toISOString(),
          error: 'Device offline',
        };
      }

      // Online: attempt to sync
      console.log('[SyncService] Online - syncing content and ads');

      const contentService = ContentService.getInstance();
      const adService = AdService.getInstance();

      // Run syncs in parallel with timeout
      const results = await Promise.allSettled([
        this.withTimeout(contentService.syncContent(), this.syncTimeout),
        this.withTimeout(adService.syncAds(), this.syncTimeout),
      ]);

      let contentResult: SyncResult | null = null;
      let adsResult: SyncResult | null = null;

      if (results[0].status === 'fulfilled') {
        contentResult = results[0].value;
      } else {
        console.error('[SyncService] Content sync failed:', results[0].reason);
      }

      if (results[1].status === 'fulfilled') {
        adsResult = results[1].value;
      } else {
        console.error('[SyncService] Ads sync failed:', results[1].reason);
      }

      // Merge results
      const success = (contentResult?.success || false) || (adsResult?.success || false);
      const content_updated = contentResult?.content_updated || false;
      const ads_updated = adsResult?.ads_updated || false;

      // Track sync timestamp
      await this.trackLastSync();

      return {
        success,
        content_updated,
        ads_updated,
        content_version: contentResult?.content_version || null,
        ads_count: adsResult?.ads_count || 0,
        synced_at: new Date().toISOString(),
        error: null,
      };
    } catch (error) {
      console.error('[SyncService] Sync failed:', error);
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
      this.isSyncing = false;
    }
  }

  /**
   * Track last sync timestamp in storage
   */
  public async trackLastSync(): Promise<void> {
    try {
      const now = new Date().toISOString();
      await StorageService.getInstance().save('last_sync', now);
      this.lastSyncTime = new Date();
      console.log('[SyncService] Last sync tracked:', now);
    } catch (error) {
      console.error('[SyncService] Error tracking sync:', error);
    }
  }

  /**
   * Get last sync timestamp
   */
  public async getLastSync(): Promise<string | null> {
    try {
      return await StorageService.getInstance().load<string>('last_sync');
    } catch (error) {
      console.error('[SyncService] Error getting last sync:', error);
      return null;
    }
  }

  /**
   * Get time since last sync in minutes
   */
  public async getTimeSinceLastSync(): Promise<number | null> {
    try {
      const lastSync = await this.getLastSync();
      if (!lastSync) return null;

      const lastSyncDate = new Date(lastSync);
      const now = new Date();
      const diffMs = now.getTime() - lastSyncDate.getTime();
      return Math.floor(diffMs / 1000 / 60);
    } catch (error) {
      console.error('[SyncService] Error calculating sync time:', error);
      return null;
    }
  }

  /**
   * Handle sync errors gracefully
   * Logs context and error details
   */
  public handleSyncError(error: Error, context: string): void {
    console.error(`[SyncService] Error in ${context}:`, error);
  }

  /**
   * Wrap a promise with a timeout
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }
}

export default SyncService;
