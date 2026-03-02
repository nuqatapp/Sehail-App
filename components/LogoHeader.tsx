import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

const logo = require("@/assets/images/sehail-logo.png");

export default function LogoHeader() {
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>
      <View style={styles.logoCircle}>
        <Image source={logo} style={styles.logo} contentFit="contain" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: Colors.primary.green,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
    marginTop: -16,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 56,
    height: 56,
  },
});
