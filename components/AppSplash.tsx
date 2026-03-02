import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
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

interface AppSplashProps {
  onFinish: () => void;
}

export default function AppSplash({ onFinish }: AppSplashProps) {
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
    <Animated.View style={[styles.container, screenStyle]}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image source={logo} style={styles.logo} contentFit="contain" />
        </Animated.View>
        <Animated.Text style={[styles.appName, nameStyle]}>سهيل</Animated.Text>
        <View style={styles.taglineContainer}>
          <Animated.Text style={[styles.tagline, line1Style]}>
            دليلك في البر
          </Animated.Text>
          <Animated.Text style={[styles.taglineSub, line2Style]}>
            جاهزة للرحلة؟
          </Animated.Text>
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
  },
  content: {
    alignItems: "center",
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
  },
  tagline: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 18,
    color: Colors.text.secondary,
  },
  taglineSub: {
    fontFamily: "Cairo_400Regular",
    fontSize: 16,
    color: Colors.text.tertiary,
  },
});
