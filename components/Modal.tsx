import React, { useEffect } from "react";
import {
  I18nManager,
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
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

export type ModalSize = "sm" | "md" | "lg";

/** Props for the Modal overlay component. */
export interface ModalProps {
  /** Controls whether the modal is displayed. */
  isVisible: boolean;
  /** Called when the user dismisses the modal (overlay tap or Escape key). */
  onClose: () => void;
  /** Optional heading rendered in the modal header. */
  title?: string;
  /** Content rendered inside the modal body. */
  children: React.ReactNode;
  /** Constrains the maximum width of the modal panel. Defaults to `md`. */
  size?: ModalSize;
  /** Bidi direction for web rendering. Defaults to the device locale. */
  dir?: "ltr" | "rtl";
  /** Optional test identifier for automation. */
  testID?: string;
}

const SIZE_MAX_WIDTH: Record<ModalSize, number> = {
  sm: 320,
  md: 480,
  lg: 640,
};

/**
 * Accessible modal overlay with animated entrance, keyboard dismiss (web),
 * and RTL support.
 */
export default function Modal({
  isVisible,
  onClose,
  title,
  children,
  size = "md",
  dir = I18nManager.isRTL ? "rtl" : "ltr",
  testID,
}: ModalProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.94);
  const isRtl = dir === "rtl";

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      scale.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.back(1.1)),
      });
    } else {
      opacity.value = withTiming(0, { duration: 160 });
      scale.value = withTiming(0.94, { duration: 160 });
    }
  }, [isVisible]);

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const panelAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const webProps =
    Platform.OS === "web"
      ? {
          dir,
          onKeyDown: (e: any) => {
            if (e.key === "Escape") onClose();
          },
        }
      : {};

  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      testID={testID}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        {...webProps}
      >
        {/* Dimmed backdrop — tap to close */}
        <Animated.View style={[styles.overlay, overlayAnimStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel="إغلاق"
          />
        </Animated.View>

        {/* Dialog panel */}
        <Animated.View
          style={[
            styles.panel,
            { maxWidth: SIZE_MAX_WIDTH[size] },
            panelAnimStyle,
          ]}
          accessibilityViewIsModal
          importantForAccessibility="yes"
          {...(Platform.OS === "web"
            ? {
                role: "dialog",
                "aria-modal": true,
                "aria-label": title,
              }
            : {})}
        >
          {title != null && (
            <View
              style={[
                styles.header,
                isRtl ? styles.headerRtl : styles.headerLtr,
              ]}
            >
              <Text
                style={[
                  styles.title,
                  isRtl ? styles.textRtl : styles.textLtr,
                ]}
              >
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="إغلاق النافذة"
                hitSlop={8}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>
          )}

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Space.md,
    paddingVertical: Space.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ColorTokens.surface.overlay,
    zIndex: ZIndex.overlay,
  },
  panel: {
    width: "100%",
    backgroundColor: ColorTokens.surface.default,
    borderRadius: Radius.xl,
    ...Elevation.lg,
    zIndex: ZIndex.modal,
    maxHeight: "85%",
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: Space.lg,
    paddingTop: Space.lg,
    paddingBottom: Space.md,
    borderBottomWidth: 1,
    borderBottomColor: ColorTokens.border.subtle,
  },
  headerLtr: { flexDirection: "row" },
  headerRtl: { flexDirection: "row-reverse" },
  title: {
    flex: 1,
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize["2xl"],
    color: ColorTokens.text.primary,
  },
  textLtr: { textAlign: "left" },
  textRtl: { textAlign: "right", writingDirection: "rtl" },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    fontSize: FontSize.md,
    color: ColorTokens.text.secondary,
    lineHeight: 20,
  },
  body: { flexShrink: 1 },
  bodyContent: { padding: Space.lg },
});
