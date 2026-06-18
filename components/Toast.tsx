import React, { useEffect } from "react";
import { I18nManager, Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  ColorTokens,
  Elevation,
  FontFamily,
  FontSize,
  Radius,
  Space,
  ZIndex,
} from "@/constants/designTokens";

export type ToastType = "success" | "warning" | "danger" | "info";

/** Props for the Toast notification component. */
export interface ToastProps {
  /** The message text displayed in the toast. */
  message: string;
  /** Visual style variant. Defaults to `info`. */
  type?: ToastType;
  /** Called after the toast fully fades out. */
  onDismiss?: () => void;
  /** How long the toast stays visible in ms before auto-dismissing. Defaults to 3500. */
  duration?: number;
  /** Bidi direction for web rendering. Defaults to the device locale. */
  dir?: "ltr" | "rtl";
}

type ToastConfig = {
  background: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  accentColor: string;
};

const TOAST_CONFIG: Record<ToastType, ToastConfig> = {
  success: {
    background: ColorTokens.status.successSurface,
    iconName: "checkmark-circle",
    iconColor: ColorTokens.status.success,
    accentColor: ColorTokens.status.success,
  },
  warning: {
    background: ColorTokens.status.warningSurface,
    iconName: "warning",
    iconColor: ColorTokens.status.warning,
    accentColor: ColorTokens.status.warning,
  },
  danger: {
    background: ColorTokens.status.dangerSurface,
    iconName: "close-circle",
    iconColor: ColorTokens.status.danger,
    accentColor: ColorTokens.status.danger,
  },
  info: {
    background: ColorTokens.status.infoSurface,
    iconName: "information-circle",
    iconColor: ColorTokens.status.info,
    accentColor: ColorTokens.status.info,
  },
};

/**
 * Temporary notification that slides up from the bottom of the screen,
 * auto-dismisses after `duration` ms, and announces itself to screen readers.
 */
export default function Toast({
  message,
  type = "info",
  onDismiss,
  duration = 3500,
  dir = I18nManager.isRTL ? "rtl" : "ltr",
}: ToastProps) {
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);
  const config = TOAST_CONFIG[type];
  const isRtl = dir === "rtl";

  const dismiss = () => {
    translateY.value = withTiming(80, { duration: 260 });
    opacity.value = withTiming(0, { duration: 240 }, () => {
      if (onDismiss) runOnJS(onDismiss)();
    });
  };

  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 320,
      easing: Easing.out(Easing.back(1.05)),
    });
    opacity.value = withTiming(1, { duration: 260 });

    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      accessibilityLiveRegion="polite"
      {...(Platform.OS === "web"
        ? { dir, role: "status", "aria-live": "polite" }
        : {})}
    >
      <View
        style={[
          styles.pill,
          { backgroundColor: config.background },
          isRtl
            ? {
                flexDirection: "row-reverse",
                borderRightWidth: 3,
                borderRightColor: config.accentColor,
              }
            : {
                flexDirection: "row",
                borderLeftWidth: 3,
                borderLeftColor: config.accentColor,
              },
        ]}
      >
        <Ionicons name={config.iconName} size={20} color={config.iconColor} />
        <Text
          style={[
            styles.message,
            isRtl ? styles.messageRtl : styles.messageLtr,
          ]}
          numberOfLines={3}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Space.xxl,
    left: Space.md,
    right: Space.md,
    zIndex: ZIndex.toast,
    alignItems: "center",
    pointerEvents: "none",
  },
  pill: {
    alignItems: "center",
    gap: Space.sm,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm + 2,
    borderRadius: Radius.lg,
    width: "100%",
    maxWidth: 480,
    ...Elevation.md,
  },
  message: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: ColorTokens.text.primary,
  },
  messageLtr: { textAlign: "left" },
  messageRtl: { textAlign: "right", writingDirection: "rtl" },
});
