# Sehail Design System Analysis

Date: 2026-06-18

## Scope

This review covers the reusable UI layer in the repository, which is centered on the top-level `components/` folder, the shared color definitions in `constants/colors.ts`, and the app-level UI patterns in `app/`.

Important note: there is no dedicated `design-system/` folder in this repo. The design system is currently implicit, not formalized.

## Current Component Inventory

### `components/`

- `AppSplash.tsx` - animated splash screen wrapper with logo, title, and tagline.
- `ErrorBoundary.tsx` - class-based React error boundary.
- `ErrorFallback.tsx` - fallback error screen with a development-only details modal.
- `KeyboardAwareScrollViewCompat.tsx` - web/native compatibility wrapper for keyboard-aware scrolling.
- `LogoHeader.tsx` - branded header block with logo and app name.

### Design-system-like behavior elsewhere in the app

The rest of the UI is built directly inside screen files under `app/`, especially:

- `app/_layout.tsx` for global RTL, fonts, and navigation headers.
- `app/(tabs)/*` for the main tab screens and tab bar presentation.
- `app/*.tsx` for feature screens such as `prep-gear`, `star-guide`, `guide-detail`, `quiz`, `quick-id`, `favorites`, `settings`, and `compass`.

This means the project does not yet have a reusable component library for common interaction patterns such as buttons, cards, chips, dialogs, alerts, sheets, menus, or form controls.

## Tokens and Color Definitions

### Current token surface

The only explicit token file is `constants/colors.ts`.

It provides:

- `primary` colors: green, greenLight, greenDark, greenDeep, gold, goldLight, goldDim.
- `text` colors: primary, secondary, tertiary, gold, dark, white, onGreen.
- `card` colors: background, border, highlight.
- `bg` colors: primary, secondary, greenHeader.
- `status` colors: danger, warning, success, info.
- `light` theme values: text, background, tint, tabIconDefault, tabIconSelected.

### Token gaps

- There is no spacing scale, typography scale, radius scale, elevation scale, shadow system, or motion/token abstraction.
- Colors are defined as raw hex/RGBA values with no semantic aliasing beyond the current object shape.
- There is no dark theme token set, no high-contrast mode set, and no platform-specific token layer.
- Several screens still use raw hex values inline, such as `#FFFFFF`, `#DDD`, and `rgba(...)`, which bypass the shared token file.

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

- `Modal`
- `Tooltip`
- `Dropdown` or `Select`
- `Toast`
- `Drawer` or bottom sheet

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

- Create a formal `design-system/` directory.
- Add a token file for spacing, typography, radius, shadow, motion, and semantic colors.
- Replace raw color usage with named semantic tokens.
- Document the visual language, RTL rules, and component conventions.

### Reusable components

- Add base primitives for `Button`, `Card`, `Badge`, `Input`, `Switch`, `Modal`, `Toast`, `Dropdown`, and `Drawer`.
- Standardize size variants, tone variants, and state variants.
- Add keyboard/focus behavior for web and accessibility metadata for all interactive components.

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

1. Create a reusable token system beyond colors.
2. Add base interactive primitives with accessibility built in.
3. Remove the most dangerous `any` usage in shared content models.
4. Document RTL and text-direction rules.

### P1 - High value next

1. Add `Modal`, `Toast`, `Drawer`, `Dropdown`, and `Tooltip` primitives.
2. Standardize hover/focus/disabled/loading states.
3. Replace raw hex values with semantic tokens.
4. Add prop documentation and usage examples.

### P2 - Structural cleanup

1. Move reusable UI into a real `design-system/` folder.
2. Normalize naming conventions across files, components, and tokens.
3. Add a bilingual content and localization guide.
4. Split large screen files into typed subcomponents where appropriate.

## Summary

Sehail currently has a strong visual identity and a usable shared color palette, but it does not yet have a formal design system. The project relies on screen-local styling, partial RTL handling, and a small utility component layer. The biggest gaps are missing reusable primitives, incomplete accessibility coverage, weak TypeScript boundaries in screen data, and the absence of documented design-system rules.