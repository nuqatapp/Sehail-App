# Reusable Components

This folder contains the app's reusable UI and infrastructure components.

## AppSplash

### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `onFinish` | `() => void` | Yes | Called after the splash exit animation completes. |
| `title` | `string` | No | Main brand title. Defaults to `سهيل`. |
| `tagline` | `string` | No | First supporting line. |
| `subtitle` | `string` | No | Second supporting line. |
| `dir` | `'ltr' \| 'rtl'` | No | Web direction override. |
| `accessibilityLabel` | `string` | No | Label for the splash container. |
| `logoAccessibilityLabel` | `string` | No | Label for the logo image. |
| `testID` | `string` | No | Test identifier for automation. |

### Usage

```tsx
<AppSplash
  onFinish={() => setShowSplash(false)}
  dir="rtl"
  title="سهيل"
  tagline="دليلك في البر"
  subtitle="جاهزة للرحلة؟"
/>
```

### Accessibility notes

- The splash container is announced as a single image-like brand surface.
- The logo can be labeled separately for screen readers.
- Content is centered and touch-safe by design, but it is not interactive.

### Bilingual support

- Supports `dir="rtl"` and `dir="ltr"` on web.
- Titles and taglines can be supplied in Arabic or English.

## ErrorBoundary

### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `FallbackComponent` | `React.ComponentType<ErrorFallbackProps>` | No | Custom fallback UI renderer. |
| `onError` | `(error: Error, stackTrace: string) => void` | No | Optional error logger. |
| `children` | `React.ReactNode` | Yes | Wrapped application content. |

### Usage

```tsx
<ErrorBoundary onError={(error, stack) => report(error, stack)}>
  <App />
</ErrorBoundary>
```

### Accessibility notes

- Error presentation should be handled by the fallback component.
- Keep fallback actions keyboard accessible and readable by assistive technology.

### Bilingual support

- The boundary itself is language-neutral.
- The fallback can receive localized strings through the fallback component props.

## ErrorFallback

### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `error` | `Error` | Yes | Error object displayed in the diagnostics modal. |
| `resetError` | `() => void` | Yes | Clears the error boundary state. |
| `dir` | `'ltr' \| 'rtl'` | No | Web direction override. |
| `title` | `string` | No | Main error title. |
| `message` | `string` | No | Short recovery message. |
| `primaryActionLabel` | `string` | No | Main action label. |
| `detailsButtonLabel` | `string` | No | Development details button label. |

### Usage

```tsx
<ErrorFallback
  error={error}
  resetError={resetError}
  dir="rtl"
  title="حدث خطأ"
  message="أعد فتح التطبيق للمتابعة"
  primaryActionLabel="أعد المحاولة"
/>
```

### Accessibility notes

- The fallback uses alert semantics for screen readers.
- The main action is announced as a button and exposes disabled/busy state when reloading.
- The diagnostics modal is treated as a modal dialog.
- Touch targets are at least 44px.

### Bilingual support

- All user-facing strings can be overridden.
- Web rendering supports `dir="rtl"` and `dir="ltr"`.
- The error copy can be localized to Arabic or English.

## KeyboardAwareScrollViewCompat

### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | No | Web direction override. |
| `keyboardShouldPersistTaps` | `KeyboardAwareScrollViewProps['keyboardShouldPersistTaps']` | No | Tap handling behavior around inputs. |
| `children` | `React.ReactNode` | Yes | Scroll content. |

### Usage

```tsx
<KeyboardAwareScrollViewCompat dir="rtl" contentContainerStyle={styles.content}>
  <Form />
</KeyboardAwareScrollViewCompat>
```

### Accessibility notes

- This wrapper keeps form content reachable when the keyboard is open.
- Use it with labeled inputs and visible focus states.

### Bilingual support

- Forward `dir` on web when rendering Arabic or mixed-direction content.

## LogoHeader

### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | `string` | No | Main title beside the logo. Defaults to `سهيل`. |
| `subtitle` | `string` | No | Optional supporting text. |
| `dir` | `'ltr' \| 'rtl'` | No | Web direction override. |
| `accessibilityLabel` | `string` | No | Label for the brand lockup. |
| `logoAccessibilityLabel` | `string` | No | Label for the logo image. |
| `testID` | `string` | No | Test identifier for automation. |

### Usage

```tsx
<LogoHeader
  dir="rtl"
  title="سهيل"
  subtitle="دليلك في البر"
/>
```

### Accessibility notes

- The header is exposed as a semantic header region.
- The image gets its own accessible label.
- Keep text short so the lockup remains readable on small screens.

### Bilingual support

- Supports Arabic and English titles.
- Direction can be flipped with `dir` on web.

## PressableSurface

### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `accessibilityLabel` | `string` | Yes | Accessible name announced by screen readers. |
| `accessibilityRole` | `AccessibilityRole` | No | Semantics for the surface. Defaults to `button`. |
| `children` | `React.ReactNode` | Yes | Content rendered inside the surface. |
| `baseStyle` | `StyleProp<ViewStyle>` | No | Base surface style. |
| `hoverStyle` | `StyleProp<ViewStyle>` | No | Style applied on hover. |
| `focusStyle` | `StyleProp<ViewStyle>` | No | Style applied on keyboard focus. |
| `pressedStyle` | `StyleProp<ViewStyle>` | No | Style applied while pressed. |
| `dir` | `'ltr' \| 'rtl'` | No | Web direction override. |
| `onPress` | `PressableProps['onPress']` | No | Press handler forwarded to the underlying pressable. |

### Usage

```tsx
<PressableSurface
  accessibilityLabel="فتح الإعدادات"
  baseStyle={styles.card}
  hoverStyle={styles.cardHover}
  focusStyle={styles.cardFocus}
  pressedStyle={styles.cardPressed}
  onPress={() => router.push("/settings")}
>
  <Text>الإعدادات</Text>
</PressableSurface>
```

### Accessibility notes

- Use this for interactive cards, chips, and button-like rows.
- Supply a descriptive `accessibilityLabel` for icon-only surfaces.
- Pair it with `accessibilityState` when the surface represents a selected, expanded, checked, or busy state.

### Bilingual support

- Supports `dir="rtl"` and `dir="ltr"` on web.
- Works with Arabic or English content inside the surface.

## General guidance

- Keep touch targets at least 44px.
- Prefer logical spacing and start/end alignment when adding new styles.
- Use Cairo for Arabic content and maintain consistent line heights.
- Add `accessibilityLabel`, `accessibilityRole`, and `accessibilityState` to new interactive components by default.