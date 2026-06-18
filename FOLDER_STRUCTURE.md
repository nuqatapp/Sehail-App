# Sehail App — Folder Structure Reference

## Complete File Tree

```
Sehail-App/
│
├── app/                                  # Expo Router screens
│   ├── _layout.tsx                       # Root: fonts, providers, error boundary
│   ├── +native-intent.tsx                # Deep linking handler
│   ├── +not-found.tsx                    # 404 fallback
│   │
│   ├── (tabs)/                           # Bottom tab navigation group
│   │   ├── _layout.tsx                   # Tab bar config (4 tabs + BlurView)
│   │   ├── index.tsx          [729 LOC]  # Home — المجلس (streak, tips, discovery)
│   │   ├── guide.tsx          [363 LOC]  # Field guide — معلومات
│   │   ├── stories.tsx        [434 LOC]  # Stories — سوالف
│   │   └── emergency.tsx      [655 LOC]  # Emergency — فزعة
│   │
│   ├── prep-gear.tsx          [510 LOC]  # Prep checklists (5 trip types)
│   ├── star-guide.tsx         [363 LOC]  # Navigation guide — دليل الملاحة
│   ├── guide-detail.tsx       [288 LOC]  # Item detail view
│   ├── first-five.tsx         [375 LOC]  # First 5 minutes emergency steps
│   ├── quick-id.tsx           [200 LOC]  # Quick ID grid
│   ├── favorites.tsx          [292 LOC]  # Saved favorites — المفضلة
│   ├── quiz.tsx               [712 LOC]  # Quiz system — الكويز
│   ├── badges.tsx             [~180 LOC] # Achievement badges — الإنجازات
│   ├── compass.tsx            [629 LOC]  # Compass + GPS waypoints
│   └── settings.tsx           [236 LOC]  # App settings
│
├── components/                           # Reusable UI components
│   ├── PressableSurface.tsx             # Base interactive primitive
│   ├── Modal.tsx                         # Dialog overlay
│   ├── Drawer.tsx                        # Slide-in side panel (RTL: from right)
│   ├── Dropdown.tsx                      # Select / combobox control
│   ├── Toast.tsx                         # Temporary notification
│   ├── Tooltip.tsx                       # Hover/long-press label
│   ├── TextInput.tsx                     # Form text field with label + error
│   ├── AppSplash.tsx                     # Animated launch screen
│   ├── ErrorBoundary.tsx                 # Class-based crash boundary
│   ├── ErrorFallback.tsx                 # Recovery UI + dev diagnostics
│   ├── LogoHeader.tsx                    # Branded page header
│   ├── KeyboardAwareScrollViewCompat.tsx # Cross-platform keyboard scroll
│   └── COMPONENTS.md                     # API reference for all components
│
├── constants/
│   ├── designTokens.ts                   # ✅ ACTIVE — all design tokens
│   └── colors.ts                         # ⚠️ LEGACY — migrate away, then delete
│
├── lib/
│   ├── read-tracker.ts                   # AsyncStorage: read item tracking
│   ├── favorites.ts                      # AsyncStorage: favorites persistence
│   └── query-client.ts                   # React Query config + API helpers
│
├── data/
│   └── wisdom.json                       # All app content (master data file)
│
├── shared/
│   └── schema.ts                         # Drizzle ORM schema (users table)
│
├── server/
│   ├── index.ts                          # Express entry (CORS, manifest, landing)
│   ├── routes.ts                         # ⚠️ STUB — no routes yet
│   ├── storage.ts                        # Storage utilities
│   └── templates/
│       └── landing-page.html             # Landing page
│
├── assets/
│   └── images/                           # Icons, splash, app branding
│
├── patches/                              # patch-package patches
│
├── scripts/
│   └── build.js                          # Expo static build script
│
├── attached_assets/                      # Scratch folder (not part of app)
│
├── app.json                              # Expo configuration
├── package.json                          # Dependencies
├── tsconfig.json                         # TypeScript configuration
├── babel.config.js                       # Babel configuration
├── metro.config.js                       # Metro bundler configuration
├── eslint.config.js                      # ESLint rules
├── drizzle.config.ts                     # Drizzle ORM configuration
│
├── ARCHITECTURE.md                       # This app's architecture blueprint
├── DEVELOPMENT_GUIDE.md                  # How to add features
├── FOLDER_STRUCTURE.md                   # This file
├── AUDIT_REPORT.md                       # Current problems + fix priorities
├── DESIGN_SYSTEM_ANALYSIS.md            # Design system audit (living doc)
├── components/COMPONENTS.md             # Component API reference
└── replit.md                             # Replit deployment overview
```

---

## Folders Not Yet Created (Planned)

These folders do not exist yet. Create them as part of the architectural roadmap:

```
types/               # TypeScript type definitions
│   ├── wisdom.ts    # Types for wisdom.json structure
│   ├── models.ts    # Domain models (Story, Badge, Quiz, etc.)
│   └── api.ts       # API request/response shapes

services/            # Business logic + data access layer
│   ├── ContentService.ts  # Abstracted access to wisdom.json
│   ├── StorageService.ts  # Typed AsyncStorage wrapper
│   └── SyncService.ts     # Cloud sync (future)

context/             # React Context (if global state needed)
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
```

---

## What Goes Where — Decision Guide

| You are creating... | Put it in |
|---------------------|-----------|
| A full-page screen navigated with Expo Router | `app/` |
| A tab screen (one of the 4 main tabs) | `app/(tabs)/` |
| A reusable UI component (can be used in multiple screens) | `components/` |
| A screen-specific sub-UI (used only once, in one screen) | Inside that screen file |
| A design token (color, spacing, font, radius) | `constants/designTokens.ts` |
| A utility function (pure logic, no UI) | `lib/` |
| A TypeScript type or interface | `types/` |
| A service class (data fetching, caching, sync) | `services/` |
| App content (guides, stories, questions) | `data/wisdom.json` |
| A database schema | `shared/schema.ts` |
| An API route (Express) | `server/routes.ts` |
| A React Context provider | `context/` |

---

## Dependency Rules

Components may import from:
- `react`, `react-native`, `expo-*` packages
- `constants/designTokens.ts`
- Other `components/`

Components must NOT import from:
- `app/` (screens)
- `lib/` (business logic)
- `data/wisdom.json`
- `server/`

Screens (`app/`) may import from:
- Everything: `components/`, `constants/`, `lib/`, `data/`, `types/`, `services/`

`lib/` utilities may import from:
- `types/`
- npm packages
- Must NOT import from `components/` or `app/`

---

## File Count Summary

| Folder | Files | Status |
|--------|-------|--------|
| `app/` | 16 | Active |
| `components/` | 13 | Active |
| `constants/` | 2 | 1 active, 1 legacy |
| `lib/` | 3 | Active |
| `data/` | 1 | Active |
| `shared/` | 1 | Defined but unused |
| `server/` | 4 | Partial (routes stub) |
| `types/` | — | Not yet created |
| `services/` | — | Not yet created |
| `context/` | — | Not yet created |
