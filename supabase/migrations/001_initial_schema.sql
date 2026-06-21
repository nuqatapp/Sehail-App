-- Sehail Phase 1: Initial Database Schema
-- Offline-first outdoor guide app for Saudi Arabia
-- No user auth, device-based identification only

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: users
-- Stores local user progress, preferences, and offline-first data
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,  -- Device identifier (generated offline)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_sync TIMESTAMPTZ,  -- When content was last synced
  content_version TEXT,  -- e.g., "1.0.0"
  language TEXT DEFAULT 'ar',  -- ar or en
  streak_days INTEGER DEFAULT 0,
  completed_checklists JSONB DEFAULT '[]'::jsonb,  -- Array of checklist IDs
  badges JSONB DEFAULT '[]'::jsonb,  -- Array of badge IDs earned
  total_guides_read INTEGER DEFAULT 0,
  CONSTRAINT language_check CHECK (language IN ('ar', 'en')),
  CONSTRAINT streak_check CHECK (streak_days >= 0)
);

-- Index for device lookups
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at DESC);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Each device can only read/write their own row
CREATE POLICY "Users can read own row" ON users
  FOR SELECT
  USING (user_id = current_user_id());

CREATE POLICY "Users can update own row" ON users
  FOR UPDATE
  USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());

CREATE POLICY "Users can insert own row" ON users
  FOR INSERT
  WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- TABLE 2: ads
-- Manages promotional content with scheduling and page-based targeting
-- ============================================================================
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_name TEXT NOT NULL,
  image_url TEXT,  -- S3 URL or external CDN
  shop_website TEXT,
  pages JSONB DEFAULT '[]'::jsonb,  -- ["home", "guide", "quiz", "compass", ...]
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT,  -- Email or username of admin
  CONSTRAINT dates_valid CHECK (start_date <= end_date),
  CONSTRAINT order_check CHECK (display_order >= 0)
);

-- Index for active ads queries (used during sync)
CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(active);
CREATE INDEX IF NOT EXISTS idx_ads_schedule ON ads(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ads_order ON ads(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_ads_pages ON ads USING GIN (pages);

-- Enable RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Ads are public read-only (no auth required)
CREATE POLICY "Ads are public read" ON ads
  FOR SELECT
  USING (true);

-- ============================================================================
-- TABLE 3: content_versions
-- Tracks wisdom.json releases for smart syncing
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT UNIQUE NOT NULL,  -- semver: "1.0.0", "1.0.1", etc.
  content_hash TEXT NOT NULL,  -- MD5 hash of wisdom.json file
  released_at TIMESTAMPTZ DEFAULT now(),
  changelog TEXT,  -- Release notes
  CONSTRAINT version_format CHECK (version ~ '^\d+\.\d+\.\d+$')
);

-- Index for version lookups
CREATE INDEX IF NOT EXISTS idx_content_versions_version ON content_versions(version);
CREATE INDEX IF NOT EXISTS idx_content_versions_released ON content_versions(released_at DESC);

-- Enable RLS
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Content versions are public read-only
CREATE POLICY "Content versions are public read" ON content_versions
  FOR SELECT
  USING (true);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert initial content version (app ships with wisdom.json 1.0.0)
INSERT INTO content_versions (version, content_hash, changelog)
VALUES (
  '1.0.0',
  'initial-wisdom-hash-1',
  'Initial release with Saudi guides, landmarks, and wisdom'
)
ON CONFLICT (version) DO NOTHING;

-- Example ad (inactive until scheduled)
INSERT INTO ads (shop_name, image_url, shop_website, pages, start_date, end_date, active, display_order, created_by)
VALUES (
  'Example Shop',
  'https://example.com/ad.jpg',
  'https://example.com',
  '["home", "guide"]'::jsonb,
  now() + interval '7 days',
  now() + interval '14 days',
  false,
  0,
  'admin@sehail.local'
)
ON CONFLICT DO NOTHING;
