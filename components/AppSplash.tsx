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
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.2)) });

    nameOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    nameTranslateY.value = withDelay(400, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    screenOpacity.value = withDelay(1800, withTiming(0, { duration: 400 }, () => {
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
  },
});
