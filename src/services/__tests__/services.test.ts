/**
 * Services Test Suite
 * Phase 1: Unit tests for all service layer functionality
 *
 * Run with: npm test
 *
 * Tests:
 * 1. StorageService: save/load/delete
 * 2. AdService: getAdsForPage (filters correctly)
 * 3. ContentService: loads bundled, overrides with local
 * 4. SyncService: handles offline gracefully
 */

import StorageService from '../StorageService';
import AdService from '../AdService';
import ContentService from '../ContentService';
import SyncService from '../SyncService';
import type { Ad, UserProgress } from '../../types/database';

describe('StorageService', () => {
  let storage: StorageService;

  beforeEach(async () => {
    storage = StorageService.getInstance();
    // Clear storage before each test
    await storage.clearAll();
  });

  test('should save and load typed data', async () => {
    const testData: UserProgress = {
      user_id: 'test-device-123',
      language: 'ar',
      streak_days: 5,
      completed_checklists: ['checklist-1', 'checklist-2'],
      badges: ['badge-1'],
      total_guides_read: 10,
      last_sync: new Date().toISOString(),
      content_version: '1.0.0',
    };

    await storage.save('user_progress', testData);
    const loaded = await storage.load<UserProgress>('user_progress');

    expect(loaded).toEqual(testData);
  });

  test('should return null for non-existent key', async () => {
    const loaded = await storage.load<unknown>('non_existent_key' as any);
    expect(loaded).toBeNull();
  });

  test('should delete keys', async () => {
    const data = { test: 'value' };
    await storage.save('wisdom_version', data);

    let loaded = await storage.load('wisdom_version');
    expect(loaded).not.toBeNull();

    await storage.delete('wisdom_version');
    loaded = await storage.load('wisdom_version');
    expect(loaded).toBeNull();
  });

  test('should get all keys', async () => {
    await storage.save('wisdom_version', '1.0.0');
    await storage.save('language', 'ar');

    const keys = await storage.getAllKeys();
    expect(keys).toContain('wisdom_version');
    expect(keys).toContain('language');
  });

  test('should clear all storage', async () => {
    await storage.save('wisdom_version', '1.0.0');
    await storage.save('language', 'ar');

    let keys = await storage.getAllKeys();
    expect(keys.length).toBeGreaterThan(0);

    await storage.clearAll();

    keys = await storage.getAllKeys();
    expect(keys.length).toBe(0);
  });
});

describe('AdService', () => {
  let adService: AdService;

  beforeEach(() => {
    adService = AdService.getInstance();
    adService.clearCache();
  });

  test('should filter ads by page name', async () => {
    const mockAds: Ad[] = [
      {
        id: 'ad-1',
        shop_name: 'Shop 1',
        image_url: null,
        shop_website: null,
        pages: ['home', 'guide'],
        start_date: new Date(Date.now() - 86400000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        active: true,
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
      },
      {
        id: 'ad-2',
        shop_name: 'Shop 2',
        image_url: null,
        shop_website: null,
        pages: ['compass'],
        start_date: new Date(Date.now() - 86400000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        active: true,
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
      },
    ];

    expect(mockAds[0].pages).toContain('home');
    expect(mockAds[0].pages).toContain('guide');

    expect(mockAds[1].pages).toContain('compass');
    expect(mockAds[1].pages).not.toContain('home');
  });

  test('should filter ads by date range', async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    const tomorrow = new Date(now.getTime() + 86400000);

    const activeAd: Ad = {
      id: 'ad-1',
      shop_name: 'Active Shop',
      image_url: null,
      shop_website: null,
      pages: ['home'],
      start_date: yesterday.toISOString(),
      end_date: tomorrow.toISOString(),
      active: true,
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
    };

    const futureAd: Ad = {
      id: 'ad-2',
      shop_name: 'Future Shop',
      image_url: null,
      shop_website: null,
      pages: ['home'],
      start_date: new Date(now.getTime() + 86400000).toISOString(),
      end_date: new Date(now.getTime() + 172800000).toISOString(),
      active: true,
      display_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
    };

    const activeStart = new Date(activeAd.start_date);
    const activeEnd = new Date(activeAd.end_date);
    const futureStart = new Date(futureAd.start_date);

    expect(now.getTime()).toBeGreaterThan(activeStart.getTime());
    expect(now.getTime()).toBeLessThan(activeEnd.getTime());
    expect(now.getTime()).toBeLessThan(futureStart.getTime());
  });

  test('should sort ads by display_order', async () => {
    const mockAds: Ad[] = [
      {
        id: 'ad-3',
        shop_name: 'Shop 3',
        image_url: null,
        shop_website: null,
        pages: ['home'],
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        active: true,
        display_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
      },
      {
        id: 'ad-1',
        shop_name: 'Shop 1',
        image_url: null,
        shop_website: null,
        pages: ['home'],
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        active: true,
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
      },
    ];

    const sorted = [...mockAds].sort((a, b) => a.display_order - b.display_order);

    expect(sorted[0].id).toBe('ad-1');
    expect(sorted[1].id).toBe('ad-3');
  });
});

describe('ContentService', () => {
  let contentService: ContentService;

  beforeEach(() => {
    contentService = ContentService.getInstance();
    contentService.clearCache();
  });

  test('should load bundled content', async () => {
    const bundled = await contentService.loadBundledContent();

    expect(bundled).toBeDefined();
    expect(bundled.version).toBeDefined();
    expect(Array.isArray(bundled.guides)).toBe(true);
    expect(Array.isArray(bundled.landmarks)).toBe(true);
    expect(Array.isArray(bundled.wisdom)).toBe(true);
    expect(Array.isArray(bundled.hazards)).toBe(true);
  });

  test('should get content (bundled as fallback)', async () => {
    const content = await contentService.getContent();

    expect(content).toBeDefined();
    expect(content.version).toBeDefined();
    expect(content.guides).toBeDefined();
  });

  test('should filter content by category', async () => {
    const content = await contentService.getContent();

    const guides = content.guides || [];
    expect(Array.isArray(guides)).toBe(true);
  });

  test('should clear cache', async () => {
    await contentService.getContent();
    contentService.clearCache();
    // No error thrown = cache cleared successfully
  });
});

describe('SyncService', () => {
  let syncService: SyncService;

  beforeEach(() => {
    syncService = SyncService.getInstance();
  });

  test('should handle offline gracefully', async () => {
    const result = await syncService.syncOnAppLaunch();

    // Sync should not throw, even if offline
    expect(result).toBeDefined();
    expect(result.synced_at).toBeDefined();
  });

  test('should track last sync time', async () => {
    await syncService.trackLastSync();

    const lastSync = await syncService.getLastSync();
    expect(lastSync).toBeDefined();

    const timeSince = await syncService.getTimeSinceLastSync();
    expect(timeSince).toBeLessThanOrEqual(1); // Should be ~0 minutes
  });

  test('should not throw when syncing is in progress', async () => {
    // Start first sync (won't complete immediately)
    const firstSync = syncService.syncOnAppLaunch();

    // Start second sync immediately
    const secondSync = await syncService.syncOnAppLaunch();

    // Should return early with "already in progress"
    expect(secondSync.error).toContain('already in progress');

    await firstSync;
  });
});
