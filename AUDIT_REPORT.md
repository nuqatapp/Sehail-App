# Sehail App — Architecture Audit Report

**Date:** June 2026
**Branch:** design-system-improvements
**Auditor:** Claude Code

---

## Executive Summary

Sehail is a **well-structured, data-driven outdoor companion app** with a strong component foundation and offline-first architecture. The major risks are loose TypeScript typing in screens (heavy `as any` usage), an incomplete design token migration, and a placeholder backend with no live API routes.

**No files need to be deleted immediately.** The priority is additive: create missing type definitions, complete token migration, and build remaining UI primitives.

---

## Overall Health Score by Layer

| Layer | Health | Notes |
|-------|--------|-------|
| Component library | ✅ Strong | 13 components, accessibility-first, RTL-aware |
| Design tokens | ✅ Strong | Comprehensive `designTokens.ts` |
| Navigation | ✅ Strong | Expo Router, typed routes, correct structure |
| Content data | ✅ Solid | wisdom.json single source of truth |
| Persistence (AsyncStorage) | ✅ Solid | lib/ helpers, 11 keys documented |
| Screens | ⚠️ Needs Work | Large files, loose typing, inline styles |
| TypeScript coverage | ⚠️ Needs Work | `as any` in 6+ screens, no wisdom.json types |
| Design token adoption | ⚠️ Incomplete | colors.ts still imported, raw hex in screens |
| Backend / API | ⚠️ Stub | routes.ts placeholder, no live endpoints |
| Test coverage | ❌ Missing | No test files found |
| Database | ❌ Unused | Schema defined, no DB calls |

---

## P0 — Critical (Fix First)

These block future development and increase runtime fragility.

### P0-1: No TypeScript Types for `wisdom.json`

**Problem:** Every screen that reads content casts the entire data object with `as any`, giving zero type safety and IDE support.

**Affected files:**
- `app/(tabs)/index.tsx`
- `app/(tabs)/guide.tsx`
- `app/(tabs)/stories.tsx`
- `app/quiz.tsx`
- `app/badges.tsx`
- `app/favorites.tsx`

**Evidence:**
```typescript
// Current pattern across screens
const quizData = (wisdomData as any).quizzes;
const stories = (wisdomData as any).stories;
```

**Fix:** Create `types/wisdom.ts` with interfaces matching the wisdom.json structure:
```typescript
export interface Story { id: string; title: string; category: '...'; env: EnvTag[]; ... }
export interface WisdomData { stories: Story[]; fieldGuide: FieldGuide; ... }
```
Then replace `as any` with the proper type in each screen.

**Effort:** Medium (2–4 hours)

---

### P0-2: Dual Token Files Causing Inconsistency

**Problem:** `constants/colors.ts` (legacy) and `constants/designTokens.ts` (new) both exist. Multiple screens import from the legacy file. Raw hex values appear inline in several screens.

**Affected files:** `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, and most screen files.

**Evidence:**
```typescript
// Legacy imports still in screens
import { colors } from '@/constants/colors';
backgroundColor: colors.background

// Raw hex values in screens
backgroundColor: '#FFFFFF'
color: '#DDD'
```

**Fix:** Migrate all screens from `colors.ts` to `designTokens.ts` using the mapping table in `DEVELOPMENT_GUIDE.md`. Delete `colors.ts` when all callsites are migrated.

**Effort:** Medium (3–6 hours across all screens)

---

## P1 — High Value

These significantly improve code quality and developer experience.

### P1-1: Missing UI Primitives

**Problem:** Screens implement their own buttons, cards, and badges with inconsistent styling instead of reusing shared components.

**Missing components:**

| Component | Used as | Impact |
|-----------|---------|--------|
| `Button` | Only `PressableSurface` exists as generic | Inconsistent button appearance across screens |
| `Card` | Per-screen `StyleSheet` with different radius/elevation | Not reusable, inconsistent visual |
| `Badge` / `Chip` | Inline `View`+`Text` combos | Scattered, not token-driven |
| `Switch` | React Native `Switch` raw | No label, no RTL alignment |
| `Divider` | Inline `View` with hardcoded height+color | Raw values, non-token |
| `EmptyState` | Repeated per-screen pattern | Cannot update globally |
| `LoadingSpinner` | Repeated `ActivityIndicator` inline | Inconsistent sizing |

**Fix:** Build each in `components/` following the pattern in `DEVELOPMENT_GUIDE.md`. Document in `COMPONENTS.md`.

**Effort:** High (1–2 days for all 7 components)

---

### P1-2: Large Screen Files

**Problem:** Three screens exceed 600 LOC without subcomponent extraction, making them hard to read and maintain.

| Screen | LOC | Large Sections |
|--------|-----|---------------|
| `(tabs)/index.tsx` | 729 | Streak grid, daily tip, discovery section, weather alert |
| `quiz.tsx` | 712 | Quiz logic, question rendering, scoring, results |
| `(tabs)/emergency.tsx` | 655 | Contacts, message template, SOS modal, sea emergency |
| `compass.tsx` | 629 | Compass rose, heading display, waypoint list |

**Fix:** Extract inline JSX sections into screen-local sub-components (same file or a `_components/` folder next to the screen). Start with quiz.tsx — its scoring logic should be a custom hook.

**Effort:** Medium per screen (1–2 hours each)

---

### P1-3: Accessibility Gaps in Screens

**Problem:** The `components/` layer has strong accessibility support. Screen-level cards and buttons do not.

**Missing in screens:**
- `accessibilityLabel` on tappable cards
- `accessibilityRole` on buttons, links, checkboxes
- `accessibilityState={{ checked, disabled, selected }}` on interactive controls

**Most affected:** `app/(tabs)/index.tsx`, `app/prep-gear.tsx`, `app/quiz.tsx`, `app/badges.tsx`

**Fix:** Add a11y props to every Pressable/TouchableOpacity/tappable View in screens. Use VoiceOver (iOS) or TalkBack (Android) to verify.

**Effort:** Medium (2–4 hours across all screens)

---

### P1-4: No Backend API Routes

**Problem:** `server/routes.ts` registers no routes. The React Query client in `lib/query-client.ts` is configured but has nothing to call. The Drizzle schema in `shared/schema.ts` is unused.

**Consequence:** No user account, no cloud sync, no remote content updates.

**Fix:** Implement at minimum:
```typescript
GET  /api/health      → { ok: true }
GET  /api/content     → return wisdom.json categories
POST /api/user        → create/update user record (Drizzle)
```

**Effort:** Medium (3–5 hours to get basic routes working)

---

## P2 — Structural Improvements

These improve long-term maintainability but are not urgent.

### P2-1: No Test Suite

**Problem:** Zero test files in the project. No unit tests for `lib/` utilities, no component tests, no E2E tests.

**Risk:** Any refactoring of `lib/read-tracker.ts`, `lib/favorites.ts`, or `lib/query-client.ts` can break screens without detection.

**Recommended:** Start with unit tests for `lib/` (pure functions, easy to test):
```
lib/read-tracker.test.ts
lib/favorites.test.ts
```

**Tool:** Jest (already in Expo's dev dependency tree via `expo-jest`).

---

### P2-2: Drizzle + PostgreSQL Not Connected

**Problem:** `shared/schema.ts` defines a `users` table. `drizzle.config.ts` references a database. But no screen or service makes a database query.

**Fix:** Either wire it up in Phase 4 or remove the schema files to avoid confusion. Document the decision.

---

### P2-3: Underutilized Dependencies

| Package | Status | Recommendation |
|---------|--------|----------------|
| `drizzle-orm`, `pg` | Unused in app code | Wire up or remove |
| `ws` | Imported, no WebSocket usage | Remove |
| `http-proxy-middleware` | No proxy routes | Remove |
| `expo-glass-effect` | Used only in tab layout | Keep (used for tab bar effect) |
| `@stardazed/streams-text-encoding` | Polyfill | Verify if still needed |
| `@ungap/structured-clone` | Polyfill | Verify if still needed |

Removing unused dependencies reduces bundle size and install time.

---

### P2-4: wisdom.json Has No TypeScript Contract

**Problem:** `data/wisdom.json` is a large file (~500+ entries) with no enforced schema. A typo in the JSON (wrong field name, missing required property) will only surface at runtime when the screen crashes.

**Fix:** 
1. Create `types/wisdom.ts` (fixes P0-1)
2. Add a Zod schema that validates `wisdom.json` at app startup in `_layout.tsx`

```typescript
import { WisdomSchema } from '@/types/wisdom';
const validated = WisdomSchema.parse(wisdomData); // throws on invalid shape
```

---

## Files Recommended for Deletion

| File | Reason | When to Delete |
|------|--------|----------------|
| `constants/colors.ts` | Replaced by `designTokens.ts` | After all import callsites are migrated (P0-2) |
| `attached_assets/` | Scratch folder, not part of app | Can delete now |

**Do not delete:**
- `server/routes.ts` — placeholder, will be filled in Phase 4
- `shared/schema.ts` — will be used when DB is wired up
- `lib/query-client.ts` — will be used when API routes exist

---

## Unused Dependencies to Remove (after verification)

Before removing, run `grep -r "package-name" --include="*.ts" --include="*.tsx"` to confirm no imports exist.

```bash
# Candidates to verify and potentially remove:
ws
http-proxy-middleware
@stardazed/streams-text-encoding
@ungap/structured-clone
```

---

## Migration Checklist

### Phase 1 — Type Safety
- [ ] Create `types/wisdom.ts` with all wisdom.json interfaces
- [ ] Create `types/models.ts` with domain types (Badge, Quiz, etc.)
- [ ] Update `app/(tabs)/index.tsx` — remove `as any`
- [ ] Update `app/(tabs)/guide.tsx` — remove `as any`
- [ ] Update `app/(tabs)/stories.tsx` — remove `as any`
- [ ] Update `app/quiz.tsx` — remove `as any`
- [ ] Update `app/badges.tsx` — remove `as any`
- [ ] Update `app/favorites.tsx` — remove `as any`

### Phase 2 — Design Token Migration
- [ ] `app/_layout.tsx` — replace colors.ts imports
- [ ] `app/(tabs)/_layout.tsx` — replace raw hex values
- [ ] `app/(tabs)/index.tsx` — replace colors.ts + raw hex
- [ ] `app/(tabs)/guide.tsx` — replace colors.ts + raw hex
- [ ] `app/(tabs)/stories.tsx` — replace colors.ts + raw hex
- [ ] `app/(tabs)/emergency.tsx` — replace colors.ts + raw hex
- [ ] `app/prep-gear.tsx` — replace colors.ts + raw hex
- [ ] `app/quiz.tsx` — replace colors.ts + raw hex
- [ ] `app/compass.tsx` — replace colors.ts + raw hex
- [ ] All remaining screens
- [ ] Delete `constants/colors.ts`

### Phase 3 — Missing Components
- [ ] `components/Button.tsx`
- [ ] `components/Card.tsx`
- [ ] `components/Badge.tsx`
- [ ] `components/Chip.tsx`
- [ ] `components/Switch.tsx`
- [ ] `components/Checkbox.tsx`
- [ ] `components/Divider.tsx`
- [ ] `components/EmptyState.tsx`
- [ ] `components/LoadingSpinner.tsx`
- [ ] Update `COMPONENTS.md` for each

### Phase 4 — Accessibility
- [ ] `app/(tabs)/index.tsx` — a11y sweep
- [ ] `app/(tabs)/emergency.tsx` — a11y sweep
- [ ] `app/prep-gear.tsx` — a11y sweep
- [ ] `app/quiz.tsx` — a11y sweep
- [ ] `app/badges.tsx` — a11y sweep
- [ ] `app/compass.tsx` — a11y sweep
- [ ] Test with VoiceOver (iOS)
- [ ] Test with TalkBack (Android)

### Phase 5 — Backend
- [ ] Implement `GET /api/health`
- [ ] Implement `GET /api/content`
- [ ] Wire Drizzle to PostgreSQL
- [ ] Implement `POST /api/user`
- [ ] Test with React Query client

### Phase 6 — Tests
- [ ] `lib/read-tracker.test.ts`
- [ ] `lib/favorites.test.ts`
- [ ] `lib/query-client.test.ts`
- [ ] Component tests (Modal, Toast, Dropdown)
- [ ] E2E: home → guide → detail flow
- [ ] E2E: quiz flow
- [ ] E2E: checklist flow

---

## Architecture Strengths (Do Not Break)

These are working well and should be preserved in all refactoring:

✅ **Offline-first**: wisdom.json bundled, AsyncStorage for all user data — works without internet  
✅ **RTL-global**: `I18nManager.forceRTL(true)` in root layout — correct, do not remove  
✅ **File-based routing**: Expo Router ~6 — clean, typed, convention-over-configuration  
✅ **Component accessibility**: All 13 components have full a11y props — preserve in any changes  
✅ **Error boundary**: `ErrorBoundary` wraps root — do not remove  
✅ **Cairo font**: Loaded globally in `_layout.tsx` — all text uses this family  
✅ **designTokens.ts**: Comprehensive, covers all visual dimensions — extend, don't replace  
✅ **wisdom.json structure**: Clean categories, IDs, env tags — easy to add content without code changes
