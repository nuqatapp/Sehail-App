/**
 * DatabaseService
 * Phase 1: Supabase client initialization and user progress management
 *
 * Handles device identification, user progress syncing, and safe error handling.
 * Never throws errors - all failures log and return safe defaults.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import StorageService from './StorageService';
import type { UserProgress, DeviceInfo } from '../types/database';

class DatabaseService {
  private static instance: DatabaseService;
  private supabase: SupabaseClient | null = null;
  private deviceId: string | null = null;
  private initialized = false;

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize Supabase client and generate device ID
   * Must be called once at app startup
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Get credentials from environment
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials in .env.local');
      }

      // Initialize Supabase client
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      });

      // Generate or load device ID
      await this.initializeDeviceId();

      this.initialized = true;
      console.log('[DatabaseService] Initialized with device:', this.deviceId);
    } catch (error) {
      console.error('[DatabaseService] Initialization failed:', error);
      // Don't throw - allow app to continue in offline mode
    }
  }

  /**
   * Generate unique device ID if not exists
   * Persisted in storage, never changes
   */
  private async initializeDeviceId(): Promise<void> {
    const storage = StorageService.getInstance();

    // Try to load existing device ID
    const existing = await storage.load<DeviceInfo>('device_id');
    if (existing) {
      this.deviceId = existing.device_id;
      return;
    }

    // Generate new device ID (UUID v4)
    const newDeviceId = await Crypto.randomUUID();
    const deviceInfo: DeviceInfo = {
      device_id: newDeviceId,
      created_at: new Date().toISOString(),
    };

    await storage.save('device_id', deviceInfo);
    this.deviceId = newDeviceId;
  }

  /**
   * Get current device ID
   */
  public getDeviceId(): string | null {
    return this.deviceId;
  }

  /**
   * Get current Supabase client
   * Returns null if not initialized
   */
  public getClient(): SupabaseClient | null {
    return this.supabase;
  }

  /**
   * Load user progress from Supabase
   * Falls back to storage if offline
   */
  public async getUserProgress(): Promise<UserProgress | null> {
    if (!this.supabase || !this.deviceId) {
      return this.getUserProgressFromStorage();
    }

    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('user_id', this.deviceId)
        .single();

      if (error) {
        console.warn('[DatabaseService] Error fetching user progress:', error);
        return this.getUserProgressFromStorage();
      }

      if (data) {
        // Cache to storage
        await StorageService.getInstance().save('user_progress', data);
        return data as UserProgress;
      }

      return null;
    } catch (error) {
      console.error('[DatabaseService] Failed to get user progress:', error);
      return this.getUserProgressFromStorage();
    }
  }

  /**
   * Get user progress from local storage (offline fallback)
   */
  private async getUserProgressFromStorage(): Promise<UserProgress | null> {
    try {
      return await StorageService.getInstance().load<UserProgress>('user_progress');
    } catch (error) {
      console.error('[DatabaseService] Failed to load from storage:', error);
      return null;
    }
  }

  /**
   * Save user progress to Supabase
   * Updates or inserts based on device ID
   * Synced to storage regardless of success
   */
  public async saveUserProgress(data: Partial<UserProgress>): Promise<void> {
    if (!this.deviceId) {
      console.error('[DatabaseService] Cannot save without device ID');
      return;
    }

    const storage = StorageService.getInstance();

    // Always save to storage first
    try {
      const existing = await this.getUserProgressFromStorage();
      const merged: UserProgress = {
        user_id: this.deviceId,
        language: 'ar',
        streak_days: 0,
        completed_checklists: [],
        badges: [],
        total_guides_read: 0,
        last_sync: null,
        content_version: null,
        ...existing,
        ...data,
      };

      await storage.save('user_progress', merged);
    } catch (error) {
      console.error('[DatabaseService] Error saving to storage:', error);
    }

    // Try to sync to Supabase if online
    if (!this.supabase) {
      console.log('[DatabaseService] Not online - saved to storage only');
      return;
    }

    try {
      const payload = {
        user_id: this.deviceId,
        updated_at: new Date().toISOString(),
        ...data,
      };

      const { error } = await this.supabase
        .from('users')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) {
        console.warn('[DatabaseService] Failed to sync to Supabase:', error);
      } else {
        console.log('[DatabaseService] User progress synced');
      }
    } catch (error) {
      console.error('[DatabaseService] Error syncing to Supabase:', error);
    }
  }

  /**
   * Update last sync timestamp
   */
  public async updateLastSync(): Promise<void> {
    await this.saveUserProgress({
      last_sync: new Date().toISOString(),
    });
  }

  /**
   * Check if connected to Supabase
   */
  public async checkConnection(): Promise<boolean> {
    if (!this.supabase) return false;

    try {
      const { error } = await this.supabase.from('ads').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Close connection (cleanup)
   */
  public async close(): Promise<void> {
    this.initialized = false;
    console.log('[DatabaseService] Connection closed');
  }
}

export default DatabaseService;
