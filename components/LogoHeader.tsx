import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";

const logo = require("@/assets/images/sehail-logo.png");

export default function LogoHeader() {
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>
      <Image source={logo} style={styles.logo} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
});
