# Sehail App — Ideal Architecture

> Source of truth for architecture decisions, data flow, and development roadmap.
> Last updated: 2026-06-18

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema](#4-database-schema)
5. [Data Flow & Sync Strategy](#5-data-flow--sync-strategy)
6. [Ads Component & Logic](#6-ads-component--logic)
7. [Multi-Language Strategy](#7-multi-language-strategy)
8. [Offline Strategy](#8-offline-strategy)
9. [Content Updates Without App Store Republish](#9-content-updates-without-app-store-republish)
10. [Services Layer](#10-services-layer)
11. [Component Architecture](#11-component-architecture)
12. [Navigation Structure](#12-navigation-structure)
13. [Best Practices](#13-best-practices)
14. [Migration Roadmap](#14-migration-roadmap)
15. [Security & Privacy](#15-security--privacy)
16. [Monitoring & Analytics](#16-monitoring--analytics)

---

## 1. Project Vision

**Sehail** is an offline-first outdoor guide and information app for hikers, campers, and nature explorers in Saudi Arabia.

### Core Principles

| Principle | Rationale |
|-----------|-----------|
| **Offline-first** | Users in remote areas have no internet. Content must always be available. |
| **Content sync without app store** | Guides, tips, and outdoor preparation information must be updatable without requiring users to update the app. |
| **Ad revenue system** | Ads are managed externally by admins, displayed based on schedule and page placement. |
| **Arabic-first, bilingual** | Primary audience is Arabic-speaking. RTL layout is the default, not an afterthought. |
| **Minimal data footprint** | Only essential data is stored (users, ads). No unnecessary tracking or data collection. |

### What Sehail Does

- Provides outdoor information guides, creature identification, checklists, and preparation tips
- Works fully offline — including guides, quizzes, compass, and emergency content
- Receives content updates silently when online (no app store submission)
- Displays relevant ads on specified pages during scheduled date ranges
- Supports Arabic and English with system-level RTL control

---

## 2. Tech Stack

### Runtime & Framework

| Layer | Technology | Version | Reason |
|-------|-----------|---------|--------|
| Framework | React Native + Expo | ~0.81 / ~54 | Cross-platform, Expo managed workflow |
| Language | TypeScript (strict mode) | Latest | Type safety, maintainability |
| Navigation | Expo Router (file-based) | ~4.x | Native navigation, deep links |
| Styling | StyleSheet + design tokens | — | No CSS-in-JS overhead, full RN control |

### Data & Storage

| Layer | Technology | Reason |
|-------|-----------|--------|
| Device storage | AsyncStorage (primary) | Simpler than SQLite for key-value content |
| Structured data | expo-sqlite (optional) | For user progress if relational queries needed |
| Remote database | Supabase | Ads table, content versioning, admin access |
| Image caching | expo-file-system | Cache ad images locally for offline use |

### Content & Localization

| Layer | Technology | Reason |
|-------|-----------|--------|
| i18n | i18n-js | Lightweight, works with JSON locale files |
| Bundled content | wisdom.json | JSON in app binary, always available |
| Content sync | Supabase Storage + REST | Fetch new wisdom.json when version changes |
| RTL support | I18nManager (React Native built-in) | System-level RTL without extra dependencies |

### Fonts & Assets

- **Primary font:** Cairo (Arabic + Latin, bundled via expo-font)
- **Icons:** Custom SVG icons via @expo/vector-icons or react-native-svg
- **Brand colors:** Green `#1B5E20`, Gold `#FFC107` (from `constants/designTokens.ts`)

---

## 3. Folder Structure

```
Sehail-App/
│
├── app/                            # Expo Router — screens only
│   ├── (tabs)/                     # Bottom tab navigator
│   │   ├── _layout.tsx             # Tab navigator config
│   │   ├── index.tsx               # Home tab
│   │   ├── guide.tsx               # Guide tab
│   │   ├── stories.tsx             # Stories tab
│   │   └── emergency.tsx           # Emergency tab
│   ├── _layout.tsx                 # Root layout (providers, fonts, sync)
│   ├── quiz.tsx                    # Quiz stack screen
│   ├── compass.tsx                 # Compass stack screen
│   ├── settings.tsx                # Settings stack screen
│   └── [creature].tsx              # Dynamic creature detail screen
│
├── src/
│   ├── components/
│   │   ├── core/                   # Primitive UI building blocks
│   │   │   ├── PressableSurface.tsx
│   │   │   ├── TextInput.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── ads/                    # Ad system components
│   │   │   ├── AdBanner.tsx        # Banner shown at top of screens
│   │   │   └── AdImage.tsx         # Cached image with fallback
│   │   └── layout/                 # Screen shell components
│   │       ├── ScreenContainer.tsx
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── TabBar.tsx
│   │
│   ├── screens/                    # Sub-components per screen
│   │   ├── home/
│   │   │   ├── HomeStreak.tsx
│   │   │   ├── HomeDailyTip.tsx
│   │   │   └── HomeDiscovery.tsx
│   │   ├── guide/
│   │   │   ├── GuideCategoryGrid.tsx
│   │   │   └── GuideItemDetail.tsx
│   │   ├── quiz/
│   │   │   ├── QuizQuestionCard.tsx
│   │   │   └── QuizResults.tsx
│   │   ├── compass/
│   │   │   ├── CompassRose.tsx
│   │   │   └── CompassWaypoints.tsx
│   │   └── emergency/
│   │       └── EmergencyGuideCard.tsx
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAds.ts               # Fetch + filter ads for a page
│   │   ├── useContent.ts           # Load content with sync awareness
│   │   ├── useLanguage.ts          # Language preference + RTL
│   │   ├── useUserProgress.ts      # Streak, badges, completions
│   │   └── useSync.ts              # Sync state (loading, lastSync)
│   │
│   ├── services/                   # Business logic — no UI dependencies
│   │   ├── ContentService.ts       # Load + sync wisdom.json
│   │   ├── AdService.ts            # Load + filter + sync ads
│   │   ├── SyncService.ts          # Orchestrate all sync on app launch
│   │   ├── StorageService.ts       # AsyncStorage abstraction
│   │   └── DatabaseService.ts      # SQLite wrapper (user progress)
│   │
│   ├── utils/                      # Pure functions, no side effects
│   │   ├── dateUtils.ts            # Date comparisons, formatting
│   │   ├── contentUtils.ts         # Filter, sort, transform content
│   │   ├── networkUtils.ts         # Connection checks
│   │   └── validationUtils.ts      # Input + schema validation
│   │
│   ├── types/                      # TypeScript definitions
│   │   ├── wisdom.ts               # Content types (Guide, Creature, Tip...)
│   │   ├── ads.ts                  # Ad types
│   │   ├── user.ts                 # User progress types
│   │   └── sync.ts                 # Sync state types
│   │
│   ├── constants/                  # Static config, never changes at runtime
│   │   ├── designTokens.ts         # Colors, spacing, typography, shadows
│   │   ├── appConfig.ts            # App-wide constants (version, URLs, keys)
│   │   └── pages.ts                # Page name enum for ad targeting
│   │
│   ├── context/                    # React Context providers
│   │   ├── ThemeContext.tsx         # Light/dark mode (future)
│   │   ├── LanguageContext.tsx      # Active language + RTL state
│   │   └── SyncContext.tsx         # Sync status available app-wide
│   │
│   ├── i18n/                       # Multi-language strings
│   │   ├── index.ts                # i18n-js setup, t() export
│   │   ├── ar.json                 # Arabic strings (default)
│   │   └── en.json                 # English strings
│   │
│   └── db/
│       ├── schema.ts               # Table definitions (users, ads schema)
│       └── migrations/             # Schema version migrations
│           ├── v1_initial.ts
│           └── v2_add_badges.ts
│
├── data/                           # Bundled static data (in app binary)
│   ├── wisdom.json                 # All guides, tips, creatures, stories
│   ├── ads.json                    # Fallback ads (shown when offline)
│   └── strings/                   # Bundled locale strings (backup)
│       ├── ar.json
│       └── en.json
│
├── assets/
│   ├── images/                     # Static app images
│   ├── fonts/                      # Cairo font files
│   └── icons/                      # App icon, splash
│
└── tests/
    ├── unit/                       # Service + utility unit tests
    │   ├── ContentService.test.ts
    │   ├── AdService.test.ts
    │   └── dateUtils.test.ts
    └── e2e/                        # Critical flow end-to-end tests
        ├── offline.test.ts
        └── adFiltering.test.ts
```

---

## 4. Database Schema

> Supabase hosts the remote database. Device storage (AsyncStorage/SQLite) holds local copies.

### `users` table

```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT UNIQUE NOT NULL,       -- Device-generated identifier
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  last_sync         TIMESTAMPTZ,                -- When content was last synced
  content_version   TEXT DEFAULT '1.0.0',       -- wisdom.json version on device
  language          TEXT DEFAULT 'ar',          -- 'ar' | 'en'
  streak_days       INTEGER DEFAULT 0,
  completed_checklists JSONB DEFAULT '[]',      -- Array of checklist IDs
  badges            JSONB DEFAULT '[]',         -- Array of badge IDs earned
  total_guides_read INTEGER DEFAULT 0
);
```

### `ads` table

```sql
CREATE TABLE ads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name      TEXT NOT NULL,
  image_url      TEXT NOT NULL,                 -- URL or base64
  shop_website   TEXT NOT NULL,                 -- Opens in external browser
  pages          JSONB NOT NULL,                -- ["home", "guide", "quiz", ...]
  start_date     TIMESTAMPTZ NOT NULL,
  end_date       TIMESTAMPTZ NOT NULL,
  active         BOOLEAN DEFAULT true,
  display_order  INTEGER DEFAULT 0,             -- Lower = shown first
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  created_by     TEXT                           -- Admin identifier
);

-- Index for fast page + date filtering
CREATE INDEX idx_ads_active ON ads (active, start_date, end_date);
```

### `content_versions` table

```sql
CREATE TABLE content_versions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version      TEXT NOT NULL UNIQUE,            -- Semver: "1.0.0", "1.1.0"
  content_hash TEXT NOT NULL,                   -- MD5 of wisdom.json
  released_at  TIMESTAMPTZ DEFAULT now(),
  changelog    TEXT                             -- Human-readable summary
);

-- Latest version query: SELECT * FROM content_versions ORDER BY released_at DESC LIMIT 1
```

### TypeScript Types (mirrors schema)

```typescript
// src/types/ads.ts
export interface Ad {
  id: string;
  shop_name: string;
  image_url: string;
  shop_website: string;
  pages: PageName[];
  start_date: string;        // ISO 8601
  end_date: string;          // ISO 8601
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// src/types/user.ts
export interface UserProgress {
  id: string;
  user_id: string;
  last_sync: string | null;
  content_version: string;
  language: 'ar' | 'en';
  streak_days: number;
  completed_checklists: string[];
  badges: string[];
  total_guides_read: number;
}

// src/types/sync.ts
export interface ContentVersion {
  id: string;
  version: string;
  content_hash: string;
  released_at: string;
  changelog?: string;
}
```

---

## 5. Data Flow & Sync Strategy

### App Launch Sequence

```
App opens
│
├─ 1. Load bundled wisdom.json → memory (always succeeds)
├─ 2. Load bundled ads.json → memory (always succeeds)
│
├─ 3. Check device storage (AsyncStorage)
│   ├─ If local content exists → override bundled (user has newer)
│   └─ If local ads exist → override bundled ads
│
└─ 4. Check internet connection
    │
    ├─ ONLINE:
    │   ├─ a. Query Supabase: content_versions (latest)
    │   ├─ b. If remote version > device version:
    │   │       Fetch new wisdom.json → save to AsyncStorage → update version ref
    │   ├─ c. Query Supabase: ads WHERE active=true AND start_date<=now<=end_date
    │   ├─ d. Download ad images → save to device cache (expo-file-system)
    │   └─ e. Save ads to AsyncStorage
    │
    └─ OFFLINE:
        └─ Use device storage version (always available — never block the user)
```

### Screen Render Flow

```
User navigates to Home screen
│
├─ ContentService.getContent('home') → returns wisdom.json (bundled or synced)
├─ AdService.getAdsForPage('home')
│   ├─ Filter: "home" IN ad.pages
│   ├─ Filter: ad.start_date <= today <= ad.end_date
│   ├─ Filter: ad.active === true
│   └─ Sort: by ad.display_order ASC
│
├─ Render AdBanner (top of screen)
│   ├─ Show shop image (from local cache → fallback to URL)
│   ├─ Show shop name + website link
│   └─ On press → Linking.openURL(shop_website)
│
└─ Render screen content (guides, tips, streak, etc.)
```

### Admin Updates Ads

```
Admin opens Supabase dashboard
├─ Add/edit row in ads table
├─ Set: pages, start_date, end_date, image_url, active
└─ Save

Next time user opens app:
└─ AdService.syncAds() fetches new ads → saves to device → displayed immediately
```

### Admin Updates Content

```
Admin uploads new wisdom.json to Supabase Storage
├─ Inserts row in content_versions: version "1.1.0", hash, changelog
└─ No app store submission required

Next time user opens app:
├─ ContentService.syncContent() queries latest content_version
├─ Detects "1.1.0" > device "1.0.0"
├─ Downloads new wisdom.json → saves to AsyncStorage
└─ User sees updated guides immediately
```

---

## 6. Ads Component & Logic

### AdBanner Component

```typescript
// src/components/ads/AdBanner.tsx

interface AdBannerProps {
  pageName: PageName;       // "home" | "guide" | "quiz" | "compass" | "emergency"
  dir?: 'rtl' | 'ltr';
}
```

**Behavior:**
- Calls `AdService.getAdsForPage(pageName)` on mount
- If no ads match → renders nothing (zero height, no layout shift)
- If one ad → displays it
- If multiple ads → auto-rotates on a timer (configurable interval)
- Image loaded from local cache first, URL fallback
- Tap opens `shop_website` via `Linking.openURL()` in external browser
- Fully offline-capable when images are cached

### Ad Filtering Rules

| Rule | Implementation |
|------|---------------|
| Page match | `ad.pages.includes(pageName)` |
| Date range | `new Date(ad.start_date) <= now <= new Date(ad.end_date)` |
| Active flag | `ad.active === true` |
| Order | Sort ascending by `ad.display_order` |

### Page Name Enum

```typescript
// src/constants/pages.ts
export const PAGE_NAMES = {
  HOME: 'home',
  GUIDE: 'guide',
  STORIES: 'stories',
  EMERGENCY: 'emergency',
  QUIZ: 'quiz',
  COMPASS: 'compass',
  SETTINGS: 'settings',
} as const;

export type PageName = typeof PAGE_NAMES[keyof typeof PAGE_NAMES];
```

### AdService Implementation

```typescript
// src/services/AdService.ts

class AdService {
  async loadBundledAds(): Promise<Ad[]>
  async loadLocalAds(): Promise<Ad[]>
  async syncAds(): Promise<void>               // Fetch from Supabase, save locally
  getAdsForPage(pageName: PageName): Ad[]      // Filter by page + date + active
  async cacheAdImages(ads: Ad[]): Promise<void> // expo-file-system download
  getCachedImagePath(imageUrl: string): string  // Local path or original URL
}
```

---

## 7. Multi-Language Strategy

### Bundled Strings Structure

```
src/i18n/
├── index.ts         # i18n-js setup, exports t() function
├── ar.json          # Arabic strings (default language)
└── en.json          # English strings
```

### Usage in Components

```typescript
import { t } from '@/i18n';

// In component:
<Text>{t('home.daily_tip.title')}</Text>
<Text>{t('guide.creature.tips', { name: creature.name })}</Text>
```

### JSON Structure (ar.json example)

```json
{
  "common": {
    "loading": "جارٍ التحميل...",
    "error": "حدث خطأ",
    "retry": "إعادة المحاولة"
  },
  "home": {
    "title": "سهيل",
    "daily_tip": {
      "title": "نصيحة اليوم"
    },
    "streak": {
      "days": "{{count}} يوم متواصل"
    }
  },
  "guide": {
    "title": "الدليل",
    "categories": {
      "creatures": "الكائنات",
      "plants": "النباتات",
      "survival": "البقاء"
    }
  }
}
```

### RTL Management

```typescript
// src/context/LanguageContext.tsx
import { I18nManager } from 'react-native';

// On language change:
const setLanguage = async (lang: 'ar' | 'en') => {
  await AsyncStorage.setItem('language', lang);
  I18nManager.forceRTL(lang === 'ar');
  // Requires app restart to take full effect (prompt user)
};
```

### Future: Synced Strings

If string updates are needed without app store:
1. Admin uploads updated `ar.json` / `en.json` to Supabase Storage
2. On app launch, SyncService checks string hash
3. Downloads new strings → saves to AsyncStorage
4. i18n loads from AsyncStorage override if present

---

## 8. Offline Strategy

### Tiered Availability Model

| Content | Availability | Storage | Notes |
|---------|-------------|---------|-------|
| All guides, tips, stories | Always | Bundled in binary | Core informational content |
| Emergency guides | Always | Bundled in binary | Highest priority |
| Quizzes | Always | Bundled in binary | |
| Compass | Always | Native device sensor | No data needed |
| Ad fallbacks | Always | Bundled `ads.json` | Basic ads |
| User progress | Always | AsyncStorage (device) | Streak, badges |
| Updated content | When synced | AsyncStorage (device) | Overrides bundled |
| Live ads | When synced | AsyncStorage + file cache | Overrides fallback |

### Never Requires Internet

- Reading any guide
- Identifying creatures, plants, or hazards
- Taking quizzes
- Saving progress (streak, completions, badges)
- Using the compass
- Viewing preparation guides
- Changing language

### Offline-First Code Pattern

```typescript
// Services always try local first, never throw on offline

async getContent(category: string): Promise<WisdomContent> {
  const local = await StorageService.load('wisdom_content');
  if (local) return parseContent(local, category);

  // Fallback to bundled
  const bundled = require('@/data/wisdom.json');
  return parseContent(bundled, category);
  // Never returns null — always has data
}
```

---

## 9. Content Updates Without App Store Republish

### Current Model (App v1.0 in App Store)

```
App binary (submitted once):
├── wisdom.json v1.0          ← bundled, always available
├── ads.json (fallback)       ← bundled
├── i18n/ar.json + en.json    ← bundled
└── All code + UI             ← stays current until code change needed
```

### Dynamic Layer (updated anytime via Supabase)

```
Supabase:
├── content_versions table    ← tracks what version is latest
├── wisdom.json (Storage)     ← the actual content file
├── ads table                 ← current ads with schedules
└── strings (Storage)         ← updated translations (future)
```

### Update Lifecycle

```
Admin action → Supabase update
     ↓
User opens app
     ↓
SyncService.syncOnAppLaunch()
     ↓
ContentService: remote v1.1 > device v1.0?
     ↓ YES
Download new wisdom.json → AsyncStorage → update version
     ↓
User sees new content immediately (no app store wait)
```

### When App Store Republish IS Required

- Code logic changes
- New screens or navigation changes
- New native dependencies (camera, sensors, etc.)
- Bug fixes in service or component code
- Design or UX changes
- Expo SDK upgrades

---

## 10. Services Layer

> All business logic lives in services. Screens and hooks call services — never fetch data directly.

### ContentService

```typescript
// src/services/ContentService.ts

class ContentService {
  // Load wisdom.json bundled in the app binary
  async loadBundledContent(): Promise<WisdomData>

  // Load from AsyncStorage (synced version, if available)
  async loadLocalContent(): Promise<WisdomData | null>

  // Check remote version, download if newer, save to device
  async syncContent(): Promise<{ updated: boolean; version: string }>

  // Returns local if available, falls back to bundled — never null
  async getContent(): Promise<WisdomData>

  // Filter items by category, environment tags, etc.
  getCategoryItems(
    data: WisdomData,
    category: string,
    filters?: ContentFilters
  ): ContentItem[]
}
```

### AdService

```typescript
// src/services/AdService.ts

class AdService {
  // Load fallback ads bundled in app
  async loadBundledAds(): Promise<Ad[]>

  // Load from AsyncStorage (synced ads, if available)
  async loadLocalAds(): Promise<Ad[]>

  // Fetch active ads from Supabase, save to device
  async syncAds(): Promise<void>

  // Filter ads for a page by page name + date range + active flag
  getAdsForPage(pageName: PageName): Ad[]

  // Download ad images to expo-file-system cache
  async cacheAdImages(ads: Ad[]): Promise<void>

  // Return local cache path if cached, else original URL
  getCachedImagePath(imageUrl: string): string
}
```

### SyncService

```typescript
// src/services/SyncService.ts

class SyncService {
  // Check device internet connectivity
  async checkInternetConnection(): Promise<boolean>

  // Run on every app launch — orchestrates all sync operations
  async syncOnAppLaunch(): Promise<SyncResult>

  // Store timestamp of last successful sync
  async trackLastSync(): Promise<void>

  // Return ISO timestamp of last sync (or null if never)
  async getLastSync(): Promise<string | null>

  // Fail gracefully — log error, continue with cached data
  handleSyncError(error: Error, context: string): void
}

interface SyncResult {
  contentUpdated: boolean;
  adsUpdated: boolean;
  errors: string[];
}
```

### StorageService

```typescript
// src/services/StorageService.ts

class StorageService {
  // Serialize and save to AsyncStorage
  async save<T>(key: StorageKey, data: T): Promise<void>

  // Parse and load from AsyncStorage
  async load<T>(key: StorageKey): Promise<T | null>

  // Remove a key
  async delete(key: StorageKey): Promise<void>

  // List all stored keys (debugging)
  async getAllKeys(): Promise<StorageKey[]>

  // Wipe all app data (settings reset)
  async clearAll(): Promise<void>
}

// Typed keys prevent typos
type StorageKey =
  | 'wisdom_content'
  | 'wisdom_version'
  | 'ads_cache'
  | 'user_progress'
  | 'language'
  | 'last_sync';
```

### DatabaseService

```typescript
// src/services/DatabaseService.ts
// Only needed if SQLite is chosen over AsyncStorage for user progress

class DatabaseService {
  // Initialize DB, run migrations
  async initialize(): Promise<void>

  // Read user record (creates one if not exists)
  async getUserProgress(): Promise<UserProgress>

  // Write user record
  async saveUserProgress(data: Partial<UserProgress>): Promise<void>

  // Cleanup
  async close(): Promise<void>
}
```

---

## 11. Component Architecture

### Hierarchy

```
Screen (app/)
└── ScreenContainer (layout)
    ├── Header (layout)
    ├── AdBanner (ads)            ← top of every screen with ads
    ├── [Screen sub-components]   ← from src/screens/
    │   └── [Core primitives]     ← from src/components/core/
    └── Footer / TabBar (layout)
```

### Core Primitives (`src/components/core/`)

| Component | Purpose |
|-----------|---------|
| `PressableSurface` | Base touchable with haptics, accessibility, pressed state |
| `TextInput` | RTL-aware input with Arabic font support |
| `Modal` | Accessible modal with backdrop, close on outside tap |
| `Drawer` | Bottom sheet drawer |
| `Dropdown` | Select menu, RTL-aware |
| `Toast` | Non-blocking notification (success, error, info) |
| `Tooltip` | Contextual help overlay |

### Ad Components (`src/components/ads/`)

| Component | Purpose |
|-----------|---------|
| `AdBanner` | Full ad display: image + name + link, handles filtering |
| `AdImage` | Cached image with loading state and fallback |

### Layout Components (`src/components/layout/`)

| Component | Purpose |
|-----------|---------|
| `ScreenContainer` | Consistent padding, SafeAreaView, scroll behavior |
| `Header` | App header with back button, title, RTL-aware |
| `Footer` | Bottom content area |
| `TabBar` | Custom tab bar with Arabic labels |

### Screen Sub-components (`src/screens/`)

| Screen | Sub-components |
|--------|---------------|
| Home | `HomeStreak`, `HomeDailyTip`, `HomeDiscovery` |
| Guide | `GuideCategoryGrid`, `GuideItemDetail` |
| Quiz | `QuizQuestionCard`, `QuizResults` |
| Compass | `CompassRose`, `CompassWaypoints` |
| Emergency | `EmergencyGuideCard` |

---

## 12. Navigation Structure

```
RootLayout (app/_layout.tsx)
├── Providers
│   ├── LanguageContext.Provider      ← language + RTL
│   ├── SyncContext.Provider          ← sync status
│   └── QueryClientProvider           ← react-query (if used)
│
├── Font loading (Cairo via expo-font)
├── SyncService.syncOnAppLaunch()     ← runs in background on mount
│
└── Tabs (app/(tabs)/_layout.tsx)
    ├── Home        → app/(tabs)/index.tsx
    ├── Guide       → app/(tabs)/guide.tsx
    ├── Stories     → app/(tabs)/stories.tsx
    └── Emergency   → app/(tabs)/emergency.tsx

Stack screens (modal/overlay, no tab bar):
├── Quiz            → app/quiz.tsx
├── Compass         → app/compass.tsx
├── Settings        → app/settings.tsx
└── Creature Detail → app/[creature].tsx
```

---

## 13. Best Practices

### Code Organization

- **Types first:** Create `types/wisdom.ts` before implementing content features
- **Services are pure:** No `useState`, no JSX in service files
- **Hooks bridge services and UI:** `useAds()` calls `AdService`, returns state
- **No direct Supabase calls in components:** Always go through a service

### Styling

- **Design tokens only:** All colors, spacing, font sizes from `constants/designTokens.ts`
- **No inline magic numbers:** `padding: 16` becomes `spacing.md`
- **RTL-aware layouts:** Use `flexDirection: 'row'` with `writing-direction` awareness

### Offline & Error Handling

- **Never crash:** All data-loading paths have a bundled fallback
- **Graceful degradation:** No internet = full app still works
- **Errors are logged, not thrown to UI:** Services catch and log, return fallback data
- **Sync is background:** Never block UI on sync operations

### Performance

- **Images cached locally:** Ad images downloaded once, served from device
- **Content sync only on version change:** Not every app launch
- **AsyncStorage for reads:** Fast synchronous-like reads with proper async handling

### Accessibility

- Every interactive element has `accessibilityLabel`
- Every image has `accessibilityHint` or `accessible={false}` if decorative
- Minimum tap target: 44x44pt (Apple HIG)
- Color contrast ratio: minimum 4.5:1

### Arabic / RTL

- Default to RTL layout
- Use `Cairo` font for all text (Arabic + Latin)
- Test every screen in both RTL and LTR
- Arabic strings are the primary (any missing key falls back gracefully)

### Testing Strategy

- **Unit tests:** All services and utility functions
- **Integration tests:** Service + StorageService together
- **E2E tests:** Offline scenario, ad filtering, language switch
- **No mocking device storage in critical tests** — use real AsyncStorage behavior

---

## 14. Migration Roadmap

### Phase 1 — Database Setup (Week 1)

- [ ] Create Supabase project, configure environment keys
- [ ] Create `ads` table with index
- [ ] Create `users` table
- [ ] Create `content_versions` table
- [ ] Upload initial `wisdom.json` to Supabase Storage
- [ ] Insert initial `content_versions` row (v1.0.0)
- [ ] Test Supabase queries manually

### Phase 2 — Services Layer (Week 2)

- [ ] Implement `StorageService` with typed keys
- [ ] Implement `ContentService` (bundled load, local load, sync)
- [ ] Implement `AdService` (bundled load, local load, sync, filter)
- [ ] Implement `SyncService` (orchestration, connection check)
- [ ] Implement `DatabaseService` (if SQLite needed for user progress)
- [ ] Unit test all services

### Phase 3 — Sync Logic (Week 2–3)

- [ ] Wire `SyncService.syncOnAppLaunch()` into root `_layout.tsx`
- [ ] Version comparison logic (semver)
- [ ] Content download + AsyncStorage save
- [ ] Offline fallback verification (airplane mode test)
- [ ] Image caching via `expo-file-system`

### Phase 4 — Ad System (Week 3)

- [ ] Build `AdBanner` component
- [ ] Build `AdImage` with cache-aware loading
- [ ] Integrate `AdBanner` into Home, Guide, Quiz, Compass, Emergency screens
- [ ] Test date filtering (past, future, current ads)
- [ ] Test page filtering (ad on home only, guide only, all pages)
- [ ] Test offline (cached images still show)
- [ ] Verify tap → browser open

### Phase 5 — Multi-Language (Week 4)

- [ ] Install and configure `i18n-js`
- [ ] Create `ar.json` and `en.json` with all screen strings
- [ ] Replace all hardcoded Arabic strings with `t()` calls
- [ ] Build `LanguageContext` with RTL toggle
- [ ] Add language toggle to settings screen
- [ ] Test full app in English (LTR) and Arabic (RTL)

### Phase 6 — Component Refactoring (Week 4–5)

- [ ] Break large screen components into sub-components in `src/screens/`
- [ ] Ensure all components use design tokens (audit `colors.ts` usage)
- [ ] Add `accessibilityLabel` to all interactive elements
- [ ] Add `accessibilityHint` to all images
- [ ] Full RTL/LTR layout review

### Phase 7 — Launch Preparation (Week 5–6)

- [ ] Full offline scenario testing (guides, quiz, compass, emergency)
- [ ] Full online scenario testing (sync, ads, content update)
- [ ] Performance profiling (bundle size, startup time)
- [ ] E2E tests passing
- [ ] App Store metadata updated
- [ ] App Store submission

---

## 15. Security & Privacy

### Data Principles

| Concern | Approach |
|---------|---------|
| User data | No PII collected. Device ID is random UUID generated on first launch. |
| Transmission | Data only transmitted if sync is triggered (user-initiated or on launch). |
| Ad tracking | No click tracking by default. Tap opens browser — tracking is the advertiser's responsibility. |
| Device storage | AsyncStorage on device. SQLite encrypted by default on iOS (Data Protection). |

### Supabase Security

- Row Level Security (RLS) enabled on all tables
- `ads` table: read-only for app clients (SELECT only via anon key)
- `users` table: row-level access only (each user can only read/write their own row)
- `content_versions` table: read-only for app clients
- Admin access only via Supabase dashboard or service role key (never in app)
- Environment keys stored in `.env` (not committed to git)

### Content Validation

- Downloaded `wisdom.json` is validated against MD5 hash before use
- If hash mismatch: discard download, keep current version, log error
- Malformed JSON: catch parse error, keep current version

### Secrets Management

```
.env (never committed):
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 16. Monitoring & Analytics (Future)

> Implement only after core features are stable and generating ad revenue.

### Ad Performance

- Track: ad impressions per session (local counter, batch-sync)
- Track: ad tap-through rate per ad ID
- Track: which pages generate most ad interactions
- Dashboard: Supabase + simple admin view

### Content Adoption

- Track: content version adoption rate (how many users have synced v1.1+)
- Track: sync success vs. failure ratio
- Track: time from content publish to user adoption

### App Health

- Track: sync errors by type (network, parse, hash mismatch)
- Track: crash-free sessions (via Expo / Sentry)
- Alert: if sync failure rate > 10% in 24h

### Privacy-Safe Analytics Approach

- No third-party analytics SDK in v1
- All tracking is aggregate and anonymized
- Counts are stored locally, batch-synced when online
- No user behavior tracking beyond what is stated in privacy policy

---

*This document is the source of truth. Update it when architecture decisions change.*
