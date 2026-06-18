/**
 * Sehail Design Tokens
 *
 * Single source of truth for visual primitives. Import from this file
 * instead of writing raw values inline.
 *
 * Usage:
 *   import { ColorTokens, Space, FontFamily, FontSize, Radius } from '@/constants/designTokens';
 */

// ─── COLOR TOKENS ──────────────────────────────────────────────────────────────

export const ColorTokens = {
  /**
   * Brand palette – the Sehail visual identity.
   *
   * green       – primary brand action color
   * greenMedium – secondary brand tint used in headers and icons
   * greenLight  – hover / lighter variant
   * greenSurface – low-opacity tint for backgrounds
   * gold        – accent / highlight color
   * goldLight   – lighter gold for hover states
   * goldDim     – very low-opacity gold for surface tints
   */
  brand: {
    green: '#1B5E20',
    greenMedium: '#2E7D32',
    greenLight: '#388E3C',
    greenMuted: '#006C35',
    greenDeep: '#004D26',
    greenSurface: 'rgba(27, 94, 32, 0.08)',
    gold: '#FFC107',
    goldLight: '#FFD54F',
    goldDark: '#FF8F00',
    goldDim: 'rgba(255, 193, 7, 0.12)',
  },

  /**
   * Neutral scale (0 = white, 900 = near-black).
   * Use these for borders, backgrounds, and dividers.
   */
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAF8',
    100: '#F5F5F0',
    150: '#EFEFEA',
    200: '#E8E8E3',
    300: '#D4D4CE',
    400: '#AFAFAA',
    500: '#8C8C88',
    600: '#6B6B67',
    700: '#525250',
    800: '#3A3A38',
    900: '#1A1A18',
  },

  /**
   * Semantic text colors.
   */
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    tertiary: '#999999',
    disabled: '#BBBBBB',
    inverse: '#FFFFFF',
    brand: '#1B5E20',
    gold: '#FFC107',
    onGreen: '#FFFFFF',
  },

  /**
   * Surface / background colors.
   */
  surface: {
    default: '#FFFFFF',
    muted: '#F5F5F0',
    subtle: '#FAFAF8',
    elevated: '#FFFFFF',
    brand: '#1B5E20',
    brandMuted: 'rgba(27, 94, 32, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.15)',
  },

  /**
   * Border colors.
   */
  border: {
    subtle: 'rgba(0, 0, 0, 0.06)',
    default: 'rgba(0, 0, 0, 0.10)',
    strong: 'rgba(0, 0, 0, 0.20)',
    brand: '#1B5E20',
    gold: '#FFC107',
    focus: '#1B5E20',
  },

  /**
   * Semantic status colors for feedback states.
   */
  status: {
    success: '#2E7D32',
    successLight: '#4CAF50',
    successSurface: 'rgba(46, 125, 50, 0.10)',
    warning: '#F57C00',
    warningLight: '#FFA726',
    warningSurface: 'rgba(245, 124, 0, 0.10)',
    danger: '#C62828',
    dangerLight: '#E53935',
    dangerSurface: 'rgba(198, 40, 40, 0.10)',
    info: '#1565C0',
    infoLight: '#1E88E5',
    infoSurface: 'rgba(21, 101, 192, 0.10)',
  },
} as const;

// ─── SPACING SCALE ─────────────────────────────────────────────────────────────

/**
 * 4-point base-unit spacing scale.
 *
 * Every value is a multiple of 4. Use named aliases (Space) in components
 * for readability; use numeric keys (Spacing) for systematic layouts.
 */
export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 40,
  10: 48,
  11: 56,
  12: 64,
  13: 80,
  14: 96,
} as const;

/** Named aliases for the spacing scale. */
export const Space = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

/** Touch target minimum (WCAG 2.5.5 AAA = 44px). */
export const MinTouchTarget = 44;

// ─── TYPOGRAPHY ────────────────────────────────────────────────────────────────

/**
 * Cairo font family — the Sehail brand typeface.
 *
 * Cairo supports Arabic and Latin scripts and is the only typeface
 * used in this app. Always use these constants instead of string literals
 * so font names stay refactorable.
 */
export const FontFamily = {
  regular: 'Cairo_400Regular',
  medium: 'Cairo_500Medium',
  semiBold: 'Cairo_600SemiBold',
  bold: 'Cairo_700Bold',
} as const;

/**
 * Modular type scale (minor-third, base 16px).
 */
export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 22,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36,
  '7xl': 42,
} as const;

/**
 * Line-height multipliers.
 * Multiply by FontSize to get the pixel value: `fontSize * LineHeightRatio.normal`
 */
export const LineHeightRatio = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2.0,
} as const;

/**
 * Absolute line heights for Arabic text.
 *
 * Arabic script requires extra vertical space due to diacritics and
 * connecting letterforms. These values are tuned for Cairo at each size.
 */
export const ArabicLineHeight: Record<keyof typeof FontSize, number> = {
  xs: 18,
  sm: 20,
  base: 24,
  md: 26,
  lg: 28,
  xl: 30,
  '2xl': 34,
  '3xl': 36,
  '4xl': 42,
  '5xl': 48,
  '6xl': 54,
  '7xl': 64,
};

/**
 * Predefined text styles for common roles.
 * Each entry is safe to spread into a StyleSheet value.
 */
export const TextStyle = {
  displayLg: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['6xl'],
    lineHeight: ArabicLineHeight['6xl'],
  },
  displayMd: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['5xl'],
    lineHeight: ArabicLineHeight['5xl'],
  },
  headingLg: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['4xl'],
    lineHeight: ArabicLineHeight['4xl'],
  },
  headingMd: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    lineHeight: ArabicLineHeight['3xl'],
  },
  headingSm: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize['2xl'],
    lineHeight: ArabicLineHeight['2xl'],
  },
  titleLg: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xl,
    lineHeight: ArabicLineHeight.xl,
  },
  titleMd: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    lineHeight: ArabicLineHeight.lg,
  },
  titleSm: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    lineHeight: ArabicLineHeight.md,
  },
  bodyLg: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: ArabicLineHeight.md,
  },
  bodyMd: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: ArabicLineHeight.base,
  },
  bodySm: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: ArabicLineHeight.sm,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: ArabicLineHeight.sm,
  },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: ArabicLineHeight.xs,
  },
} as const;

// ─── BORDER RADIUS ─────────────────────────────────────────────────────────────

/**
 * Corner radius scale.
 *
 * - `none`  – flush corners (images inside a card)
 * - `xs`    – subtle rounding (input fields, small badges)
 * - `sm`    – standard rounding (chips, tags)
 * - `md`    – card corners
 * - `lg`    – modal / sheet corners
 * - `xl`    – large cards and feature tiles
 * - `2xl`   – bottom sheet drag handle area
 * - `full`  – pill / circle shapes
 */
export const Radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 28,
  full: 9999,
} as const;

// ─── ELEVATION / SHADOW ────────────────────────────────────────────────────────

/**
 * Cross-platform shadow tokens.
 * Spread directly into a StyleSheet value.
 *
 * Note: `elevation` is Android only; `shadow*` are iOS only.
 * Both are present here so you can spread without platform checks.
 */
export const Elevation = {
  none: {
    shadowColor: 'transparent' as const,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000000' as const,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000' as const,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000' as const,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000' as const,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000' as const,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 14,
  },
} as const;

// ─── ANIMATION / MOTION ────────────────────────────────────────────────────────

/** Duration values in milliseconds. */
export const Duration = {
  instant: 0,
  fast: 120,
  normal: 250,
  slow: 400,
  slower: 600,
  slowest: 900,
} as const;

/** Opacity values for interactive pressed / disabled states. */
export const Opacity = {
  full: 1,
  hover: 0.88,
  pressed: 0.72,
  disabled: 0.40,
  ghost: 0.12,
} as const;

// ─── Z-INDEX SCALE ─────────────────────────────────────────────────────────────

/** Stacking context values for overlapping surfaces. */
export const ZIndex = {
  base: 0,
  raised: 1,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
  tooltip: 600,
} as const;

// ─── ICON SIZES ────────────────────────────────────────────────────────────────

/** Standard icon sizes that pair with the type scale. */
export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
} as const;

// ─── COMPONENT SIZE TOKENS ─────────────────────────────────────────────────────

/**
 * Size variants for interactive components (Button, Input, Badge, Chip …).
 * Each entry provides height, horizontal padding, and font size.
 */
export const ComponentSize = {
  xs: { height: 28, paddingHorizontal: 10, fontSize: FontSize.xs },
  sm: { height: 36, paddingHorizontal: 14, fontSize: FontSize.sm },
  md: { height: 44, paddingHorizontal: 18, fontSize: FontSize.base },
  lg: { height: 52, paddingHorizontal: 22, fontSize: FontSize.md },
  xl: { height: 60, paddingHorizontal: 28, fontSize: FontSize.lg },
} as const;

// ─── TYPE HELPERS ──────────────────────────────────────────────────────────────

export type ColorToken = typeof ColorTokens;
export type SpacingKey = keyof typeof Spacing;
export type SpaceKey = keyof typeof Space;
export type FontSizeKey = keyof typeof FontSize;
export type RadiusKey = keyof typeof Radius;
export type ElevationKey = keyof typeof Elevation;
export type DurationKey = keyof typeof Duration;
export type ComponentSizeKey = keyof typeof ComponentSize;
export type IconSizeKey = keyof typeof IconSize;
export type ZIndexKey = keyof typeof ZIndex;

/** Union of all valid bidi directions. */
export type BidiDir = 'ltr' | 'rtl';
