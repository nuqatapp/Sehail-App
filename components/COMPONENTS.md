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

## Modal

Accessible overlay dialog with animated entrance, backdrop tap-to-close, and
keyboard Escape dismiss on web.

### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `isVisible` | `boolean` | Yes | Controls whether the modal is shown. |
| `onClose` | `() => void` | Yes | Called when the user dismisses the modal. |
| `title` | `string` | No | Heading rendered in the modal header with a close button. |
| `children` | `React.ReactNode` | Yes | Body content rendered inside the modal. |
| `size` | `'sm' \| 'md' \| 'lg'` | No | Maximum width of the panel (320 / 480 / 640 px). Defaults to `md`. |
| `dir` | `'ltr' \| 'rtl'` | No | Web direction override. |
| `testID` | `string` | No | Test identifier for automation. |

### Usage

```tsx
<Modal
  isVisible={showModal}
  onClose={() => setShowModal(false)}
  title="إعدادات الحساب"
  size="md"
  dir="rtl"
>
  <Text>محتوى النافذة</Text>
</Modal>
```

### Accessibility notes

- `accessibilityViewIsModal` traps VoiceOver/TalkBack focus inside the panel.
- On web: `role="dialog"`, `aria-modal`, `aria-label` are applied.
- Escape key dismisses the modal on web.
- The backdrop tap target has an `accessibilityLabel`.

### Bilingual support

- Header text aligns according to `dir`.
- Body content inherits RTL/LTR from the parent context.

---

## Toast

Temporary notification that slides in from the bottom, auto-dismisses, and
announces itself to assistive technology.

### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `message` | `string` | Yes | The notification text. |
| `type` | `'success' \| 'warning' \| 'danger' \| 'info'` | No | Visual variant. Defaults to `info`. |
| `onDismiss` | `() => void` | No | Called after the toast has fully faded out. |
| `duration` | `number` | No | Visible duration in ms before auto-dismiss. Defaults to `3500`. |
| `dir` | `'ltr' \| 'rtl'` | No | Web direction override. |

### Usage

```tsx
<Toast
  message="تم حفظ التغييرات بنجاح"
  type="success"
  onDismiss={() => setToast(null)}
  dir="rtl"
/>
```

### Accessibility notes

- `accessibilityLiveRegion="polite"` announces the message to screen readers.
- On web: `role="status"`, `aria-live="polite"` are applied.
- The component is non-interactive (`pointerEvents: "none"`).

### Bilingual support

- Accent border switches side based on `dir`.
- Message text aligns according to `dir`.

---

## Dropdown

Pressable select control that reveals a scrollable option list in an overlay.
Supports keyboard arrow-key navigation and ARIA listbox semantics on web.

### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | `DropdownOption[]` | Yes | Array of `{ label, value, disabled? }` items. |
| `selectedValue` | `string` | No | The currently selected value. |
| `onSelect` | `(value: string) => void` | Yes | Called when an option is picked. |
| `placeholder` | `string` | No | Text shown when no value is selected. Defaults to `اختر...`. |
| `disabled` | `boolean` | No | Disables the trigger. Defaults to `false`. |
| `dir` | `'ltr' \| 'rtl'` | No | Web direction override. |
| `accessibilityLabel` | `string` | No | Accessible name for the trigger. |
| `testID` | `string` | No | Test identifier for automation. |

### Usage

```tsx
<Dropdown
  options={[
    { label: 'الرياض', value: 'riyadh' },
    { label: 'جدة', value: 'jeddah' },
    { label: 'أبها', value: 'abha' },
  ]}
  selectedValue={city}
  onSelect={setCity}
  placeholder="اختر المدينة"
  dir="rtl"
/>
```

### Accessibility notes

- Trigger: `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"` on web.
- Options list: `role="listbox"` on web.
- Individual options: `role="option"`, `aria-selected` on web.
- Arrow keys navigate options; Enter / Space selects; Escape closes.

### Bilingual support

- Trigger and option rows flip direction with `dir`.
- Checkmark icon appears on the trailing edge (leading for RTL).

---

## Drawer

Slide-in side panel that animates from the trailing edge (right for RTL,
left for LTR). Closes on backdrop tap or the close button.

### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | Yes | Controls whether the drawer is visible. |
| `onClose` | `() => void` | Yes | Called when the user dismisses the drawer. |
| `title` | `string` | No | Heading displayed in the drawer header. |
| `children` | `React.ReactNode` | Yes | Content rendered inside the drawer body. |
| `dir` | `'ltr' \| 'rtl'` | No | Determines which side the drawer slides from. Defaults to the device locale. |
| `testID` | `string` | No | Test identifier for automation. |

### Usage

```tsx
<Drawer
  isOpen={menuOpen}
  onClose={() => setMenuOpen(false)}
  title="القائمة الرئيسية"
  dir="rtl"
>
  <Text>محتوى الدرج</Text>
</Drawer>
```

### Accessibility notes

- `accessibilityViewIsModal` traps screen-reader focus inside the panel.
- On web: `role="dialog"`, `aria-modal`, `aria-label` are applied.
- The panel unmounts from the DOM after its exit animation completes.

### Bilingual support

- Slides from the right in RTL mode, from the left in LTR mode.
- Corner rounding adapts to match the open edge.

---

## Tooltip

Small overlay label shown on long-press (mobile) or mouse hover (web).
Positions itself relative to its trigger and auto-fades after the pointer
leaves.

### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | Yes | Text displayed inside the tooltip bubble. |
| `children` | `React.ReactNode` | Yes | The trigger element. |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | No | Preferred position. Defaults to `top`. |
| `dir` | `'ltr' \| 'rtl'` | No | Web direction override. |
| `testID` | `string` | No | Test identifier for automation. |

### Usage

```tsx
<Tooltip label="حذف العنصر" position="top" dir="rtl">
  <Pressable onPress={handleDelete}>
    <Ionicons name="trash" size={20} />
  </Pressable>
</Tooltip>
```

### Accessibility notes

- On web: the bubble gets `role="tooltip"` and a stable `id`; the trigger
  gets `aria-describedby` pointing to that `id`.
- On mobile: long-press (400 ms) shows the tooltip; releasing hides it.
- The bubble has `pointerEvents="none"` so it does not block interactions.

### Bilingual support

- `dir` is forwarded to the bubble element on web.
- Label text is centered regardless of direction.

---

## TextInput

Accessible form text field with label, clear button, error state, focus ring,
and a minimum 44 px touch target.

### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `string` | Yes | Controlled input value. |
| `onChange` | `(value: string) => void` | Yes | Called on every keystroke. |
| `label` | `string` | No | Visible label rendered above the field. Clicking it focuses the input. |
| `placeholder` | `string` | No | Hint text shown when the field is empty. |
| `disabled` | `boolean` | No | Disables the field and applies muted styling. Defaults to `false`. |
| `error` | `string` | No | Validation error string. When present, switches to error styling. |
| `required` | `boolean` | No | Appends a `*` marker to the label. Defaults to `false`. |
| `dir` | `'ltr' \| 'rtl'` | No | Web direction override. |
| `testID` | `string` | No | Test identifier for automation. |

All other `TextInput` props (e.g. `keyboardType`, `secureTextEntry`, `maxLength`) are forwarded to the native input.

### Usage

```tsx
<TextInput
  label="البريد الإلكتروني"
  value={email}
  onChange={setEmail}
  placeholder="example@sehail.app"
  error={emailError}
  required
  dir="rtl"
  keyboardType="email-address"
  autoCapitalize="none"
/>
```

### Accessibility notes

- The label is linked to the input via `nativeID` / `aria-labelledby`.
- Error messages use `accessibilityRole="alert"` and `accessibilityLiveRegion="polite"`.
- On web: `aria-required`, `aria-invalid`, and `aria-describedby` are applied.
- The clear button has `accessibilityRole="button"` and a descriptive label.
- Tapping the label focuses the input.

### Bilingual support

- `textAlign` and `writingDirection` adapt based on `dir`.
- Clear button appears on the trailing edge of the field.

---

## General guidance

- Keep touch targets at least 44px.
- Prefer logical spacing and start/end alignment when adding new styles.
- Use Cairo for Arabic content and maintain consistent line heights.
- Add `accessibilityLabel`, `accessibilityRole`, and `accessibilityState` to new interactive components by default.
- Import all visual values from `@/constants/designTokens` — never use raw hex or magic numbers.