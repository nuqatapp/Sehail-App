# Sehail App — Architecture Blueprint

## 1. Project Overview

**Sehail (سهيل)** is an Arabic-language outdoor and nature companion app for Saudi Arabia and the Gulf. It helps users prepare for camping, hiking, desert, and sea trips through offline guides, emergency tools, navigation aids, and learning features.

### Target Users
Arabic-speaking outdoor enthusiasts in Saudi Arabia and the Gulf region.

### Key Features
- Field guide (creatures, plants, hazards with environment tags)
- Preparation checklists (5 trip types)
- Emergency contacts and tools (SOS, location templates)
- Star & navigation guide
- Stories and tactics (سوالف)
- Achievement badges and learning streak
- Quiz system
- Compass + GPS waypoints
- Daily wisdom tips

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo ~54 (React Native 0.81) |
| Router | Expo Router ~6 (file-based) |
| Language | TypeScript (strict) |
| UI | React Native StyleSheet, Reanimated ~4 |
| Fonts | Cairo (Google Fonts — Arabic + Latin) |
| Data | Local JSON (`data/wisdom.json`) |
| Persistence | AsyncStorage |
| Server state | React Query ^5 |
| Backend | Express 5 (Replit) |
| Database | Drizzle ORM + PostgreSQL (schema defined, not yet wired) |
| Validation | Zod ^3 |

---

## 2. Folder Structure

```
Sehail-App/
│
├── app/                        # Expo Router screens (file-based routing)
│   ├── _layout.tsx             # Root layout — fonts, providers, splash
│   ├── +native-intent.tsx      # Deep linking handler
│   ├── +not-found.tsx          # 404 fallback
│   ├── (tabs)/                 # Bottom tab group (4 tabs)
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── index.tsx           # Home (المجلس) — dashboard
│   │   ├── guide.tsx           # Field guide (معلومات)
│   │   ├── stories.tsx         # Stories (سوالف)
│   │   └── emergency.tsx       # Emergency tools (فزعة)
│   ├── prep-gear.tsx           # Prep checklists
│   ├── star-guide.tsx          # Navigation guide (دليل الملاحة)
│   ├── guide-detail.tsx        # Item detail view
│   ├── first-five.tsx          # Emergency first steps
│   ├── quick-id.tsx            # Quick identification grid
│   ├── favorites.tsx           # Saved favorites
│   ├── quiz.tsx                # Quiz system
│   ├── badges.tsx              # Achievement badges
│   ├── compass.tsx             # Compass + GPS waypoints
│   └── settings.tsx            # App settings
│
├── components/                 # Reusable UI components
│   ├── PressableSurface.tsx    # Base interactive primitive
│   ├── Modal.tsx               # Dialog overlay
│   ├── Drawer.tsx              # Slide-in panel
│   ├── Dropdown.tsx            # Select control
│   ├── Toast.tsx               # Toast notifications
│   ├── Tooltip.tsx             # Hover/long-press labels
│   ├── TextInput.tsx           # Form text field
│   ├── AppSplash.tsx           # Animated splash screen
│   ├── ErrorBoundary.tsx       # Error boundary wrapper
│   ├── ErrorFallback.tsx       # Error recovery UI
│   ├── LogoHeader.tsx          # Branded header
│   ├── KeyboardAwareScrollViewCompat.tsx
│   └── COMPONENTS.md           # Component API reference
│
├── constants/
│   ├── designTokens.ts         # Design system tokens (use this)
│   └── colors.ts               # Legacy colors (being migrated out)
│
├── lib/
│   ├── read-tracker.ts         # AsyncStorage: read item tracking
│   ├── favorites.ts            # AsyncStorage: favorites
│   └── query-client.ts         # React Query config + API helpers
│
├── data/
│   └── wisdom.json             # All app content (master data file)
│
├── shared/
│   └── schema.ts               # Drizzle ORM schema (users table)
│
├── server/
│   ├── index.ts                # Express app entry
│   ├── routes.ts               # API routes (placeholder)
│   └── storage.ts              # Storage utilities
│
├── assets/
│   └── images/                 # App icons, splash, branding
│
├── patches/                    # patch-package patches
└── scripts/
    └── build.js                # Expo static build
```

### What Goes Where

| Type of file | Where it lives |
|-------------|---------------|
| Screen (full page) | `app/` or `app/(tabs)/` |
| Reusable UI component | `components/` |
| Design tokens / colors | `constants/designTokens.ts` |
| Utility function | `lib/` |
| Content data | `data/wisdom.json` |
| TypeScript types for data | `types/` (to be created — see Roadmap) |
| Services / abstraction | `services/` (to be created — see Roadmap) |
| Backend routes | `server/routes.ts` |

### File Naming Conventions

- Screens: `kebab-case.tsx` (e.g., `prep-gear.tsx`, `star-guide.tsx`)
- Components: `PascalCase.tsx` (e.g., `PressableSurface.tsx`, `Modal.tsx`)
- Utilities: `camelCase.ts` (e.g., `read-tracker.ts`, `query-client.ts`)
- Constants: `camelCase.ts` (e.g., `designTokens.ts`)
- Types: `camelCase.ts` inside `types/` folder

---

## 3. Data Flow

```
App Starts
  │
  ├── Load fonts (Cairo family via @expo-google-fonts/cairo)
  ├── Load AppSplash animation
  ├── React Query client initialized
  └── Tab navigator mounted

User Interaction
  │
  ├── Screen reads content from data/wisdom.json (bundled)
  ├── Screen reads persisted state from AsyncStorage
  │   (checklist completion, read items, favorites, streak, etc.)
  ├── [Future] Screens call server API via React Query
  └── UI renders RTL-first with Cairo typography

State Changes
  │
  ├── UI state (modals, dropdowns, forms) → useState (component-local)
  ├── Persistent user data → AsyncStorage (via lib/read-tracker, lib/favorites)
  ├── Server state → React Query cache (not yet active — routes are stubs)
  └── Navigation → Expo Router (file-based)
```

### AsyncStorage Keys

| Key | Contents |
|-----|---------|
| `sehail_checklist` | Checklist item completion (`{ [id]: boolean }`) |
| `sehail_streak` | Learning streak (`{ count, lastDate, history }`) |
| `sehail_settings` | User preferences (`{ weatherAlerts, dailyTips }`) |
| `sehail_trips_completed` | Trip counter (number) |
| `sehail_new_tips_count` | Tips learned (number) |
| `sehail_read_items` | Array of read item IDs |
| `sehail_favorites` | Array of favorited item IDs |
| `sehail_quiz_scores` | Quiz scores (`{ quizId: { best, total } }`) |
| `sehail_badges` | Array of unlocked badge IDs |
| `sehail_saved_points` | GPS waypoints (`{ name, lat, lng, time }[]`) |
| `sehail_completed_envs` | Environment types completed (for badge unlock) |

---

## 4. Component Architecture

### Layer Model

```
Screens (app/)
  └── use Reusable Components (components/)
        └── built on PressableSurface (base interactive primitive)
              └── powered by designTokens (constants/designTokens.ts)
```

### Primitive Components (building blocks)

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `PressableSurface` | Interactive base | `accessibilityLabel` (required), style slots, `onPress` |
| `TextInput` | Form text field | `value`, `onChange`, `label`, `error`, `dir` |

### Overlay Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Modal` | Dialog overlay | `isVisible`, `onClose`, `title`, `size` |
| `Drawer` | Slide-in panel | `isOpen`, `onClose`, `title`, `dir` |
| `Toast` | Temporary notification | `message`, `type` (`success`/`warning`/`danger`/`info`) |
| `Tooltip` | Contextual label | `label`, `position`, `children` |
| `Dropdown` | Select control | `options`, `selectedValue`, `onSelect` |

### Infrastructure Components

| Component | Purpose |
|-----------|---------|
| `AppSplash` | Animated launch screen |
| `ErrorBoundary` | Class-based crash handler |
| `ErrorFallback` | Recovery UI with dev diagnostics |
| `LogoHeader` | Branded page header |
| `KeyboardAwareScrollViewCompat` | Cross-platform keyboard scroll |

### Container vs Presentational Pattern

- **Presentational** (dumb): Components in `components/` — accept props, render UI, no side effects
- **Container** (smart): Screens in `app/` — hold state, fetch data, coordinate behavior

Screens orchestrate; components display. Do not add API calls or AsyncStorage access inside `components/`.

---

## 5. State Management

### Three Tiers

```
1. UI State (ephemeral)
   → useState in the component that owns it
   → Never lifted higher than needed
   Examples: modal open/closed, active tab, form field value

2. User Data (persisted locally)
   → AsyncStorage via lib/read-tracker.ts and lib/favorites.ts
   → Read on screen mount, written on user action
   Examples: favorites, read items, checklist state, streak

3. Server State (future)
   → React Query (lib/query-client.ts)
   → Currently placeholder — no API routes implemented
   Examples: remote content sync, user account, cloud backup
```

### No Global State Library

The app does not use Redux, Zustand, or Context for global state. All state is either:
- Local component state (`useState`)
- AsyncStorage (persisted user data)
- Derived from `wisdom.json` (read-only content)

If global state becomes needed (e.g., auth, theme), add a React Context in `context/` (not yet created).

---

## 6. Navigation

### Structure

```
RootLayout (_layout.tsx)
  │
  └── Tabs (_layout.tsx — 4 bottom tabs)
        ├── Tab 1: Home (index.tsx) — المجلس
        ├── Tab 2: Field Guide (guide.tsx) — معلومات
        ├── Tab 3: Stories (stories.tsx) — سوالف
        └── Tab 4: Emergency (emergency.tsx) — فزعة

  Stack Screens (overlay on tabs)
        ├── prep-gear.tsx
        ├── star-guide.tsx
        ├── guide-detail.tsx
        ├── first-five.tsx
        ├── quick-id.tsx
        ├── favorites.tsx
        ├── quiz.tsx
        ├── badges.tsx
        ├── compass.tsx
        └── settings.tsx
```

### Expo Router Conventions

- File = Route. `app/quiz.tsx` → `/quiz`.
- `(tabs)/` is a route group (shared layout, no URL segment).
- `_layout.tsx` wraps all siblings with navigation shell.
- `+not-found.tsx` is the global 404.
- `+native-intent.tsx` handles deep link intent routing.

### Typed Routes

TypeScript typed routes are enabled (`"typedRoutes": true` in app.json). Use `router.push('/quiz')` not `router.push('quiz')`.

---

## 7. Design System

### Token File: `constants/designTokens.ts`

Always import from `designTokens.ts`. Never use raw hex values or import from `colors.ts`.

```typescript
import { ColorTokens, Space, FontFamily, FontSize, Radius } from '@/constants/designTokens';
```

### Token Categories

| Export | Contents |
|--------|---------|
| `ColorTokens` | Brand green (#1B5E20), gold (#FFC107), neutral scale, semantic states |
| `Space` | 4pt grid: `Space[1]=4`, `Space[2]=8`, ... `Space[16]=64` |
| `FontFamily` | Cairo weights: `regular`, `medium`, `semiBold`, `bold` |
| `FontSize` | Modular scale 11px–42px |
| `ArabicLineHeight` | Line height ratios tuned for Arabic diacritics |
| `TextStyle` | Precomposed text styles (e.g., `TextStyle.heading`, `TextStyle.body`) |
| `Radius` | `sm` (4), `md` (8), `lg` (16), `full` (9999) |
| `Elevation` | Platform-specific shadow presets (1–5) |
| `Duration` | Animation durations in ms |
| `Opacity` | Disabled (0.4), placeholder (0.6), overlay (0.5) |
| `ZIndex` | `overlay`, `modal`, `toast`, `tooltip` |
| `IconSize` | `sm` (16), `md` (24), `lg` (32) |
| `ComponentSize` | Min touch target sizes (44px) |

### Missing Primitives (to build)

- `Button` — primary, secondary, ghost, danger variants
- `Card` — container with radius, elevation, padding
- `Badge` / `Chip` — status labels, tags
- `Switch` / `Checkbox` / `Radio` — form controls
- `Divider` — horizontal separator
- `EmptyState` — zero-data placeholder
- `LoadingSpinner` — activity indicator wrapper

---

## 8. Content Architecture

### `data/wisdom.json` — Master Content File

All app content lives here. It is bundled into the app binary (no network required).

```
wisdom.json
├── prepGear          # 5 trip type checklists
├── fieldGuide        # Creatures, plants, hazards
├── navigationGuide   # 6 navigation sections
├── stories           # 18 stories with tags
├── emergency         # Contacts, guides, tools
├── dailyTips         # 25 rotating tips
├── firstFiveMinutes  # 6 emergency step cards
└── quizzes           # 3 quiz sections, 20 questions
```

### Adding Content

1. Edit `data/wisdom.json` — add your item in the correct category array.
2. Match the shape of existing items (same fields).
3. No code changes needed for most content additions.

---

## 9. RTL & Arabic Support

### Global RTL

`I18nManager.forceRTL(true)` is called in `app/_layout.tsx`. This makes React Native mirror all layout directions globally.

### Component-Level RTL

All `components/` accept a `dir` prop (`'rtl' | 'ltr'`). Default is `'rtl'`.

### Rules

- `textAlign: 'right'` for all Arabic text
- `flexDirection: 'row-reverse'` not needed — `I18nManager.forceRTL` handles it
- Use `dir` prop when a component needs to be explicitly LTR (e.g., phone numbers, URLs)
- Use Cairo font from `FontFamily` constants for all text

---

## 10. Backend & Server

### Current State

The Express server (`server/`) handles:
- CORS headers for Expo Dev Client
- Expo manifest routing (development only)
- Landing page (`server/templates/landing-page.html`)

`server/routes.ts` is a **placeholder** — no API routes are registered yet.

### Database

`shared/schema.ts` defines a `users` table via Drizzle ORM + PostgreSQL. The schema exists but the database is not yet connected in any screen or service.

### Future API Pattern

When adding server routes:

```typescript
// server/routes.ts
app.get('/api/content', async (req, res) => {
  // fetch from DB or return static data
  res.json({ data });
});

// lib/query-client.ts — already configured
const data = useQuery({ queryKey: ['content'], queryFn: getQueryFn({ on401: 'throw' }) });
```

---

## 11. ASCII Architecture Diagrams

### Component Hierarchy

```
App (_layout.tsx)
├── GestureHandlerRootView
├── KeyboardProvider
├── QueryClientProvider
├── ErrorBoundary
│   └── AppSplash (on launch)
│       └── Tabs (_layout.tsx)
│           ├── Tab: Home (index.tsx)
│           │   └── uses: LogoHeader, Modal, Tooltip
│           ├── Tab: Guide (guide.tsx)
│           ├── Tab: Stories (stories.tsx)
│           └── Tab: Emergency (emergency.tsx)
│               └── uses: Modal, Drawer
│
└── Stack screens (overlay)
    ├── quiz.tsx     → uses Modal, Toast
    ├── compass.tsx  → uses Drawer
    └── settings.tsx
```

### Data Flow

```
App Launch
    │
    ▼
Load Cairo fonts (expo-font)
    │
    ▼
Play AppSplash animation
    │
    ▼
Tab Navigator mounted
    │
    ▼
Screen reads wisdom.json ─────────────► Render content UI
    │
    ▼
Screen reads AsyncStorage ────────────► Render persisted state
    │                                   (favorites, streak, etc.)
    ▼
User action (tap, swipe, complete)
    │
    ├── If UI only  ──────────────────► useState update → re-render
    └── If persistent ────────────────► Write AsyncStorage → re-render
```

### Dependency Graph

```
Screens (app/)
    │
    ├── constants/designTokens.ts   ← all styling
    ├── constants/colors.ts         ← legacy (migrate away)
    ├── data/wisdom.json            ← all content
    ├── lib/read-tracker.ts         ← read persistence
    ├── lib/favorites.ts            ← favorite persistence
    ├── lib/query-client.ts         ← server state
    └── components/
            │
            ├── PressableSurface.tsx ← base for all interactive
            ├── Modal.tsx
            ├── Drawer.tsx
            ├── Toast.tsx
            ├── Tooltip.tsx
            ├── Dropdown.tsx
            └── TextInput.tsx

components/  ← depend only on:
    ├── constants/designTokens.ts
    └── react-native / expo-* packages
    (NO imports from app/, lib/, data/, or server/)
```

---

## 12. Best Practices

### TypeScript

- Never use `as any` — define types in `types/` and import them
- Enable `strict: true` (already set in tsconfig.json)
- Zod schemas for all external data (API responses, AsyncStorage reads)

### Error Handling

- Wrap root in `ErrorBoundary` (already done in `_layout.tsx`)
- Show `ErrorFallback` with a recovery action, not a blank screen
- Use try/catch in all AsyncStorage reads with a safe default

### Loading States

- Show a spinner or skeleton while reading AsyncStorage on mount
- Use React Query's `isLoading` state for API calls

### Offline Support

- Content: always available (bundled in wisdom.json)
- User data: always available (AsyncStorage)
- Server sync: gracefully degrade when offline (React Query `staleTime`)

### RTL/Arabic

- Always use `dir` prop on components that support it
- Always use `FontFamily.cairo.*` — never system font
- Always use `textAlign: 'right'` for Arabic text
- Test with actual Arabic content, not placeholder text

### Accessibility

- Every interactive element needs `accessibilityLabel` and `accessibilityRole`
- Minimum touch target: 44×44px (enforced by `PressableSurface`)
- Dynamic content changes use `accessibilityLiveRegion`
- Modal content uses `accessibilityViewIsModal`
