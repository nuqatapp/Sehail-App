import React, { useEffect, useState } from "react";
import {
  Dimensions,
  I18nManager,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(Math.round(SCREEN_WIDTH * 0.82), 360);

/** Props for the Drawer slide-in panel. */
export interface DrawerProps {
  /** Controls whether the drawer is shown. */
  isOpen: boolean;
  /** Called when the user dismisses the drawer (overlay tap or close button). */
  onClose: () => void;
  /** Heading displayed in the drawer header. */
  title?: string;
  /** Content rendered inside the drawer body. */
  children: React.ReactNode;
  /** Bidi direction. RTL draws from the right side; LTR from the left. Defaults to the device locale. */
  dir?: "ltr" | "rtl";
  /** Optional test identifier for automation. */
  testID?: string;
}

/**
 * Slide-in side panel that animates from the trailing edge (right for RTL,
 * left for LTR). Closes on overlay tap, close button, or Back gesture (Android).
 */
export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  dir = I18nManager.isRTL ? "rtl" : "ltr",
  testID,
}: DrawerProps) {
  const isRtl = dir === "rtl";

  // `mounted` gates whether the component tree is in the render output.
  // We mount on open and unmount only after the exit animation finishes.
  const [mounted, setMounted] = useState(isOpen);

  const hiddenX = isRtl ? DRAWER_WIDTH : -DRAWER_WIDTH;
  const translateX = useSharedValue(hiddenX);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      translateX.value = withTiming(
        hiddenX,
        { duration: 260, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        }
      );
      overlayOpacity.value = withTiming(0, { duration: 220 });
    }
  }, [isOpen]);

  // Animate in only after `mounted` has been set to true
  useEffect(() => {
    if (mounted && isOpen) {
      translateX.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      overlayOpacity.value = withTiming(1, { duration: 280 });
    }
  }, [mounted, isOpen]);

  const drawerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!mounted) return null;

  return (
    <View
      style={styles.root}
      testID={testID}
      {...(Platform.OS === "web" ? { dir } : {})}
    >
      {/* Dimmed backdrop */}
      <Animated.View style={[styles.overlay, overlayAnimStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="إغلاق الدرج"
        />
      </Animated.View>

      {/* Sliding panel */}
      <Animated.View
        style={[
          styles.panel,
          isRtl ? styles.panelRtl : styles.panelLtr,
          drawerAnimStyle,
        ]}
        accessibilityViewIsModal
        importantForAccessibility={isOpen ? "yes" : "no-hide-descendants"}
        {...(Platform.OS === "web"
          ? {
              role: "dialog",
              "aria-modal": true,
              "aria-label": title,
            }
          : {})}
      >
        <View
          style={[
            styles.header,
            isRtl ? styles.rowRtl : styles.rowLtr,
          ]}
        >
          {title != null && (
            <Text
              style={[
                styles.title,
                isRtl ? styles.textRtl : styles.textLtr,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="إغلاق"
            hitSlop={8}
          >
            <Ionicons
              name="close"
              size={22}
              color={ColorTokens.text.secondary}
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: ZIndex.modal,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ColorTokens.surface.overlay,
  },
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: ColorTokens.surface.default,
    ...Elevation.lg,
  },
  panelLtr: {
    left: 0,
    borderTopRightRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  panelRtl: {
    right: 0,
    borderTopLeftRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: Space.lg,
    paddingTop: Space.xl,
    paddingBottom: Space.md,
    borderBottomWidth: 1,
    borderBottomColor: ColorTokens.border.subtle,
    gap: Space.sm,
  },
  rowLtr: { flexDirection: "row" },
  rowRtl: { flexDirection: "row-reverse" },
  title: {
    flex: 1,
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize["2xl"],
    color: ColorTokens.text.primary,
  },
  textLtr: { textAlign: "left" },
  textRtl: { textAlign: "right", writingDirection: "rtl" },
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  body: { flex: 1 },
  bodyContent: { padding: Space.lg },
});
