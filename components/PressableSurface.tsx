import React, { ReactNode } from "react";
import {
  AccessibilityRole,
  I18nManager,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

/**
 * Shared pressable wrapper for card and button-like surfaces.
 */
export interface PressableSurfaceProps extends PressableProps {
  /** Accessible name announced by screen readers. */
  accessibilityLabel: string;
  /** Semantics of the pressable surface. Defaults to `button`. */
  accessibilityRole?: AccessibilityRole;
  /** Child content rendered inside the surface. */
  children: ReactNode;
  /** Base style for the surface. */
  baseStyle?: StyleProp<ViewStyle>;
  /** Style merged on hover. */
  hoverStyle?: StyleProp<ViewStyle>;
  /** Style merged on keyboard focus. */
  focusStyle?: StyleProp<ViewStyle>;
  /** Style merged while pressed. */
  pressedStyle?: StyleProp<ViewStyle>;
  /** Optional web direction override. */
  dir?: "ltr" | "rtl";
  /** Optional wrapper style applied to the pressable content. */
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * A reusable interactive surface for cards, chips, and buttons.
 */
export default function PressableSurface({
  accessibilityLabel,
  accessibilityRole = "button",
  children,
  baseStyle,
  hoverStyle,
  focusStyle,
  pressedStyle,
  dir = I18nManager.isRTL ? "rtl" : "ltr",
  contentStyle,
  style,
  ...pressableProps
}: PressableSurfaceProps) {
  return (
    <Pressable
      {...(Platform.OS === "web" ? { dir } : {})}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      {...pressableProps}
      style={({ pressed, hovered, focused }) => [
        style,
        baseStyle,
        hovered && hoverStyle,
        focused && focusStyle,
        pressed && pressedStyle,
      ]}
    >
      {children}
    </Pressable>
  );
}