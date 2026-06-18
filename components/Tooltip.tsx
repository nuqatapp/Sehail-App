import React, { useRef, useState } from "react";
import {
  I18nManager,
  LayoutRectangle,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  ColorTokens,
  Elevation,
  FontFamily,
  FontSize,
  Radius,
  Space,
  ZIndex,
} from "@/constants/designTokens";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

/** Props for the Tooltip component. */
export interface TooltipProps {
  /** The text label shown inside the tooltip bubble. */
  label: string;
  /** The element that triggers the tooltip. */
  children: React.ReactNode;
  /**
   * Preferred position relative to the trigger.
   * The tooltip will attempt to auto-reposition if the preferred side is clipped.
   * Defaults to `top`.
   */
  position?: TooltipPosition;
  /** Bidi direction for web rendering. Defaults to the device locale. */
  dir?: "ltr" | "rtl";
  /** Optional test identifier for automation. */
  testID?: string;
}

const TOOLTIP_OFFSET = 6;

function getPositionStyle(
  position: TooltipPosition,
  layout: LayoutRectangle
): object {
  switch (position) {
    case "top":
      return { bottom: layout.height + TOOLTIP_OFFSET, alignSelf: "center" };
    case "bottom":
      return { top: layout.height + TOOLTIP_OFFSET, alignSelf: "center" };
    case "left":
      return {
        right: layout.width + TOOLTIP_OFFSET,
        top: layout.height / 2 - 14,
      };
    case "right":
      return {
        left: layout.width + TOOLTIP_OFFSET,
        top: layout.height / 2 - 14,
      };
  }
}

/**
 * Lightweight overlay label shown on long-press (mobile) or hover (web).
 * Uses ARIA tooltip semantics on web and positions itself relative to its
 * trigger using layout measurements.
 */
export default function Tooltip({
  label,
  children,
  position = "top",
  dir = I18nManager.isRTL ? "rtl" : "ltr",
  testID,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [layout, setLayout] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const tooltipId = useRef(
    `tooltip-${Math.random().toString(36).slice(2, 8)}`
  ).current;

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.86);

  const show = () => {
    setVisible(true);
    opacity.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(1, {
      duration: 160,
      easing: Easing.out(Easing.back(1.15)),
    });
  };

  const hide = () => {
    opacity.value = withTiming(0, { duration: 120 });
    scale.value = withTiming(0.86, { duration: 120 });
    // Delay unmount until after fade
    setTimeout(() => setVisible(false), 130);
  };

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const positionStyle = getPositionStyle(position, layout);

  return (
    <View
      style={styles.wrapper}
      onLayout={(e) => setLayout(e.nativeEvent.layout)}
      testID={testID}
      {...(Platform.OS === "web"
        ? ({
            onMouseEnter: show,
            onMouseLeave: hide,
          } as any)
        : {})}
    >
      <Pressable
        onLongPress={show}
        onPressOut={visible ? hide : undefined}
        delayLongPress={400}
        {...(Platform.OS === "web"
          ? { "aria-describedby": tooltipId }
          : {})}
      >
        {children}
      </Pressable>

      {visible && (
        <Animated.View
          style={[styles.bubble, positionStyle, animStyle]}
          nativeID={tooltipId}
          pointerEvents="none"
          {...(Platform.OS === "web"
            ? { role: "tooltip", id: tooltipId, dir }
            : {})}
        >
          <Text style={styles.label} numberOfLines={4}>
            {label}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  bubble: {
    position: "absolute",
    backgroundColor: ColorTokens.neutral[900],
    borderRadius: Radius.sm,
    paddingHorizontal: Space.sm,
    paddingVertical: Space.xs,
    zIndex: ZIndex.tooltip,
    maxWidth: 220,
    ...Elevation.md,
  },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: ColorTokens.text.inverse,
    textAlign: "center",
    lineHeight: 16,
  },
});
