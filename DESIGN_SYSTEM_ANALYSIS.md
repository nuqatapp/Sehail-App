# Sehail Design System Analysis

Date: 2026-06-18

## Scope

This review covers the reusable UI layer in the repository, which is centered on the top-level `components/` folder, the shared color definitions in `constants/colors.ts`, and the app-level UI patterns in `app/`.

Important note: there is no dedicated `design-system/` folder in this repo. The design system is currently implicit, not formalized.

## Current Component Inventory

### `components/`

- `AppSplash.tsx` - animated full-screen splash with entrance/exit animations. Props fully typed via `AppSplashProps`.
- `ErrorBoundary.tsx` - class-based React error boundary. Props typed via `ErrorBoundaryProps`.
- `ErrorFallback.tsx` - fallback error screen with recovery action and a dev-only diagnostics modal. Props typed via `ErrorFallbackProps`.
- `KeyboardAwareScrollViewCompat.tsx` - cross-platform keyboard-aware scroll container. Props typed via `KeyboardAwareScrollViewCompatProps`.
- `LogoHeader.tsx` - branded header lockup with logo, title, and optional subtitle. Props typed via `LogoHeaderProps`.
- `PressableSurface.tsx` - accessible pressable primitive for cards, chips, and button-like surfaces. Exposes `hover`, `focus`, and `pressed` style slots. Props typed via `PressableSurfaceProps`.

### Design-system-like behavior elsewhere in the app

The rest of the UI is built directly inside screen files under `app/`, especially:

- `app/_layout.tsx` for global RTL, fonts, and navigation headers.
- `app/(tabs)/*` for the main tab screens and tab bar presentation.
- `app/*.tsx` for feature screens such as `prep-gear`, `star-guide`, `guide-detail`, `quiz`, `quick-id`, `favorites`, `settings`, and `compass`.

This means the project does not yet have a reusable component library for common interaction patterns such as buttons, cards, chips, dialogs, alerts, sheets, menus, or form controls.

## Tokens and Color Definitions

### Current token files

| File | Contents |
|---|---|
| `constants/colors.ts` | Legacy color object (primary, text, card, bg, status, light). |
| `constants/designTokens.ts` | **New comprehensive token system** — see detail below. |

#### `constants/designTokens.ts` — full inventory

- **ColorTokens** — brand (green `#1B5E20`, gold `#FFC107`), neutral 0–900 scale, text, surface, border, and semantic status colors with surface tints.
- **Spacing / Space** — 4-pt base-unit scale (0–96 px) plus named aliases (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`, `xxxl`). Also exports `MinTouchTarget = 44`.
- **FontFamily** — Cairo Regular, Medium, SemiBold, Bold constants.
- **FontSize** — modular scale from `xs` (11 px) to `7xl` (42 px).
- **LineHeightRatio** — multiplier scale (`tight` → `loose`).
- **ArabicLineHeight** — absolute line-height values tuned for Cairo Arabic at each font size.
- **TextStyle** — pre-composed text style objects (`displayLg` → `caption`) ready to spread into StyleSheet.
- **Radius** — corner radius scale `none` → `full`.
- **Elevation** — cross-platform shadow tokens (`none`, `xs`, `sm`, `md`, `lg`, `xl`).
- **Duration** — animation durations in ms (`instant` → `slowest`).
- **Opacity** — interactive opacity levels (hover, pressed, disabled, ghost).
- **ZIndex** — stacking context scale (`base` → `tooltip`).
- **IconSize** — standard icon sizes paired to the type scale.
- **ComponentSize** — height/padding/fontSize presets for `xs`–`xl` component size variants.
- **Type helpers** — exported union/key types for all token scales (`RadiusKey`, `SpaceKey`, `BidiDir`, etc.).

### Remaining token gaps

- `constants/colors.ts` is still referenced in existing components. Migrate call sites to `ColorTokens` from `designTokens.ts` as components are updated.
- No dark theme token set or high-contrast mode layer yet.
- Several screens still use raw hex values inline (`#FFFFFF`, `#DDD`, `rgba(...)`), which bypass both token files.

## Documentation Review

### Existing docs

- `replit.md` exists, but it is not a design-system document.
- No `design-system/` directory was found.
- No component usage guide, token reference, or contribution guide for UI consistency was found.

### Missing documentation

- No design principles or visual language guide.
- No component API docs.
- No prop tables or usage examples for reusable components.
- No accessibility guidance.
- No RTL/bilingual content rules.
- No token usage rules or naming conventions.

## Missing Components

These are the biggest missing primitives for a real design system:

- ✅ `Modal` — `components/Modal.tsx`
- ✅ `Tooltip` — `components/Tooltip.tsx`
- ✅ `Dropdown` / `Select` — `components/Dropdown.tsx`
- ✅ `Toast` — `components/Toast.tsx`
- ✅ `Drawer` — `components/Drawer.tsx`
- ✅ `TextInput` — `components/TextInput.tsx`

Additional common primitives that are also absent:

- `Button`
- `IconButton`
- `TextInput`
- `Checkbox`
- `Switch`
- `Radio`
- `Tabs` as a reusable component primitive
- `Badge`
- `Chip` / `Tag`
- `Card`
- `Divider`
- `EmptyState`
- `LoadingSpinner` / `Skeleton`
- `Alert` / `Banner`

## Naming Convention Gaps

- File naming is inconsistent between pure components and feature screens.
- The codebase mixes reusable component names with utility wrappers and screen-specific components without a documented convention.
- The token object in `constants/colors.ts` uses mixed semantic levels such as `primary`, `text`, `card`, `bg`, `status`, and `light`, but the hierarchy is not documented and is only partially semantic.
- Component and type names are mostly PascalCase, but many screen-local data structures use ad hoc names and `any`-driven access patterns, which weakens consistency.

## Accessibility Gaps

### What is present

- A few buttons expose accessibility metadata in `ErrorFallback.tsx`.
- Some modal behavior exists in the error fallback development modal.

### Gaps found

- Most `Pressable` controls across screens do not declare `accessibilityRole`.
- Many icon-only actions do not declare `accessibilityLabel` or `accessibilityHint`.
- Selected states are often visual only; they are not announced through `accessibilityState`.
- Modals do not consistently declare modal semantics such as `accessibilityViewIsModal`.
- There is no documented focus ring or keyboard focus treatment for web.
- Hover, focus, and pressed states are not standardized across reusable controls.
- There is no systematic contrast audit for text on colored surfaces.
- Some interactive areas rely on icon-only visuals, which makes them fragile for screen readers.

## Component State Gaps

The UI currently relies on local inline styles instead of a shared state model.

Missing standardized states include:

- Hover state for web.
- Focus state for keyboard navigation.
- Active and selected state tokens.
- Disabled state tokens and clear disabled styling.
- Loading state for async actions.
- Error and success states for forms and user feedback.

Observed patterns in the repo:

- Some controls use `pressed` opacity only.
- Some controls use `disabled`, but there is no shared visual treatment.
- Chips and tab-like selectors show active styling, but the active state is not normalized into a reusable component API.
- No reusable loading indicator pattern is exposed by the design layer.

## RTL and Arabic Support Gaps

### What is present

- RTL is enabled globally in `app/_layout.tsx` with `I18nManager.allowRTL(true)` and `I18nManager.forceRTL(true)`.
- Cairo fonts are loaded globally.
- Many screens explicitly use `writingDirection: "rtl"` and Arabic numerals.
- Content is already heavily localized into Arabic.

### Gaps found

- RTL support is forced globally rather than driven by a locale-aware abstraction.
- There is no documented bilingual strategy for Arabic/English switching.
- Directional icons and layout mirroring are handled ad hoc in several screens.
- There is no shared typography scale for Arabic display sizes and line-height rules.
- Some visual patterns still use left/right-specific styling rather than logical direction-aware tokens or abstractions.
- The design system does not define how mixed Arabic and Latin content should be rendered.

## TypeScript Gaps

The repo has a noticeable amount of loosened typing in UI code. The largest issues are repeated `any` usage and screen-local shape casting.

Examples of weakly typed areas:

- `app/badges.tsx`
- `app/favorites.tsx`
- `app/(tabs)/guide.tsx`
- `app/guide-detail.tsx`
- `app/first-five.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/stories.tsx`
- `app/prep-gear.tsx`
- `app/quiz.tsx`
- `app/quick-id.tsx`
- `app/star-guide.tsx`

Typical problems:

- `as any` cast usage for icon names and data access.
- `any`-typed collection items pulled from JSON data.
- `params?: any` in route-driven code.
- Inline object shape assumptions instead of shared interfaces.
- Type safety is weaker in screen data than in the reusable component layer.

## Recommended Improvements

### Foundation

- ✅ Token file created at `constants/designTokens.ts` (spacing, typography, radius, shadow, motion, semantic colors).
- ✅ `PressableSurface` primitive added with hover/focus/pressed style slots and accessibility defaults.
- Migrate existing components from `constants/colors.ts` to `ColorTokens` from `designTokens.ts`.
- Create a formal `design-system/` directory if the component library grows beyond ~10 primitives.
- Document visual language, RTL rules, and component conventions in a living guide.

### Reusable components

- ✅ Added `Modal`, `Toast`, `Dropdown`, `Drawer`, `Tooltip`, and `TextInput` — all with token-driven styles, RTL support, full accessibility metadata, and animated transitions.
- Still needed: `Button`, `Card`, `Badge`, `Switch`, `Checkbox`, `Radio`, `Chip`, `Divider`, `EmptyState`, `LoadingSpinner`.
- Standardize size variants, tone variants, and state variants across remaining primitives.
- Add keyboard/focus behavior for web on remaining interactive components.

### Accessibility

- Require `accessibilityRole`, `accessibilityLabel`, and `accessibilityState` on all interactive primitives.
- Standardize visible focus states.
- Add modal semantics and dismissal behavior.
- Audit color contrast and touch target size.

### RTL and bilingual support

- Introduce direction-aware spacing/alignment helpers.
- Define a locale strategy instead of forcing RTL globally.
- Normalize mixed Arabic/Latin text handling.
- Ensure directional icons and chevrons are mirrored where needed.

### TypeScript

- Replace `any` with shared data interfaces for content-driven screens.
- Create typed content models for guides, stories, quizzes, badges, and prep items.
- Use union types for icon names and state variants.
- Add prop interfaces for all reusable components.

## Priority Order For Fixes

### P0 - Must fix first

1. ✅ Created `constants/designTokens.ts` — comprehensive token system beyond colors.
2. ✅ Added `PressableSurface` — base interactive primitive with accessibility built in.
3. Migrate screen-local raw hex values to `ColorTokens` from `designTokens.ts`.
4. Remove the most dangerous `any` usage in shared content models.
5. Document RTL and text-direction rules.

### P1 - High value next

1. ✅ Added `Modal`, `Toast`, `Drawer`, `Dropdown`, `Tooltip`, and `TextInput` primitives.
2. ✅ Standardized hover/focus/disabled/loading states (PressableSurface slots; component-level variants).
3. Replace raw hex values with semantic tokens across screen files.
4. ✅ Added prop documentation and usage examples (COMPONENTS.md).

### P2 - Structural cleanup

1. Move reusable UI into a real `design-system/` folder.
2. Normalize naming conventions across files, components, and tokens.
3. Add a bilingual content and localization guide.
4. Split large screen files into typed subcomponents where appropriate.

## Summary

Sehail currently has a strong visual identity and a usable shared color palette, but it does not yet have a formal design system. The project relies on screen-local styling, partial RTL handling, and a small utility component layer. The biggest gaps are missing reusable primitives, incomplete accessibility coverage, weak TypeScript boundaries in screen data, and the absence of documented design-system rules.