import React, { useEffect } from "react";
import { I18nManager, Platform, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import Colors from "@/constants/colors";

const logo = require("@/assets/images/sehail-logo.png");

/**
 * Props for the Sehail splash experience.
 */
export interface AppSplashProps {
  /** Callback fired after the exit animation completes. */
  onFinish: () => void;
  /** Main brand title shown below the logo. */
  title?: string;
  /** Short supporting line shown after the title. */
  tagline?: string;
  /** Secondary supporting line shown beneath the tagline. */
  subtitle?: string;
  /** Bidi direction used by web rendering and logical layout. */
  dir?: "ltr" | "rtl";
  /** Accessibility label for the splash as a single announcement. */
  accessibilityLabel?: string;
  /** Accessibility label for the logo image. */
  logoAccessibilityLabel?: string;
  /** Optional test id for automation. */
  testID?: string;
}

/**
 * Animated full-screen splash view used during app bootstrap.
 */
export default function AppSplash({
  onFinish,
  title = "سهيل",
  tagline = "دليلك في البر",
  subtitle = "جاهزة للرحلة؟",
  dir = I18nManager.isRTL ? "rtl" : "ltr",
  accessibilityLabel = "شاشة بدء تطبيق سهيل",
  logoAccessibilityLabel = "شعار تطبيق سهيل",
  testID,
}: AppSplashProps) {
  const isRtl = dir === "rtl";
  const logoScale = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);
  const nameOpacity = useSharedValue(0);
  const nameTranslateY = useSharedValue(12);
  const line1Opacity = useSharedValue(0);
  const line1TranslateY = useSharedValue(10);
  const line2Opacity = useSharedValue(0);
  const line2TranslateY = useSharedValue(10);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.2)) });

    nameOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    nameTranslateY.value = withDelay(400, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    line1Opacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    line1TranslateY.value = withDelay(800, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    line2Opacity.value = withDelay(1100, withTiming(1, { duration: 500 }));
    line2TranslateY.value = withDelay(1100, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    screenOpacity.value = withDelay(2800, withTiming(0, { duration: 400 }, () => {
      runOnJS(onFinish)();
    }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const nameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value,
    transform: [{ translateY: nameTranslateY.value }],
  }));

  const line1Style = useAnimatedStyle(() => ({
    opacity: line1Opacity.value,
    transform: [{ translateY: line1TranslateY.value }],
  }));

  const line2Style = useAnimatedStyle(() => ({
    opacity: line2Opacity.value,
    transform: [{ translateY: line2TranslateY.value }],
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View
      {...(Platform.OS === "web" ? { dir } : {})}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      importantForAccessibility="yes"
      testID={testID}
      style={[styles.container, screenStyle]}
    >
      <View style={[styles.content, isRtl ? styles.contentRtl : styles.contentLtr]}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image
            accessibilityLabel={logoAccessibilityLabel}
            source={logo}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>
        <Animated.Text style={[styles.appName, nameStyle]}>{title}</Animated.Text>
        <View style={styles.taglineContainer}>
          <Animated.Text style={[styles.tagline, line1Style]}>
            {tagline}
          </Animated.Text>
          <Animated.Text style={[styles.taglineSub, line2Style]}>{subtitle}</Animated.Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
  },
  contentRtl: {
    writingDirection: "rtl",
  },
  contentLtr: {
    writingDirection: "ltr",
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 106,
    borderRadius: 18,
  },
  appName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 32,
    color: Colors.primary.green,
    marginBottom: 16,
  },
  taglineContainer: {
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  tagline: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 18,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  taglineSub: {
    fontFamily: "Cairo_400Regular",
    fontSize: 16,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
});
