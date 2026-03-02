import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

const logo = require("@/assets/images/sehail-logo.png");

export default function LogoHeader() {
  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textGroup}>
          <Text style={styles.appName}>سِهيل</Text>
          <View style={styles.accentLine} />
        </View>
        <Image source={logo} style={styles.logo} contentFit="contain" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  logo: {
    width: 50,
    height: 66,
    borderRadius: 10,
  },
  textGroup: {
    alignItems: "flex-end",
  },
  appName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 22,
    color: Colors.primary.green,
    lineHeight: 30,
  },
  accentLine: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary.gold,
    marginTop: 2,
  },
});
