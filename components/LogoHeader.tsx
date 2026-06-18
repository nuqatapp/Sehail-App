import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

const logo = require("@/assets/images/sehail-logo.png");

/**
 * Props for the branded logo header.
 */
export interface LogoHeaderProps {
  /** Main title rendered beside the logo. */
  title?: string;
  /** Optional supporting text rendered below the title. */
  subtitle?: string;
  /** Bidi direction forwarded to web rendering. */
  dir?: "ltr" | "rtl";
  /** Accessibility label for the wrapper. */
  accessibilityLabel?: string;
  /** Accessibility label for the logo image. */
  logoAccessibilityLabel?: string;
  /** Optional test id for automation. */
  testID?: string;
}

/**
 * Compact brand lockup used in screen headers and empty states.
 */
export default function LogoHeader({
  title = "سهيل",
  subtitle,
  dir = "rtl",
  accessibilityLabel = "هوية تطبيق سهيل",
  logoAccessibilityLabel = "شعار تطبيق سهيل",
  testID,
}: LogoHeaderProps) {
  const isRtl = dir === "rtl";

  return (
    <Animated.View
      {...(dir ? { dir } : {})}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="header"
      entering={FadeInDown.duration(400)}
      style={styles.container}
      testID={testID}
    >
      <View style={[styles.row, isRtl ? styles.rowRtl : styles.rowLtr]}>
        <View style={[styles.textGroup, isRtl ? styles.textGroupRtl : styles.textGroupLtr]}>
          <Text accessibilityRole="header" style={styles.appName}>
            {title}
          </Text>
          <View style={styles.accentLine} />
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Image
          accessibilityLabel={logoAccessibilityLabel}
          source={logo}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  row: {
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  rowRtl: {
    flexDirection: "row",
  },
  rowLtr: {
    flexDirection: "row-reverse",
  },
  logo: {
    width: 50,
    height: 66,
    borderRadius: 10,
  },
  textGroup: {
    maxWidth: "75%",
  },
  textGroupRtl: {
    alignItems: "flex-end",
    writingDirection: "rtl",
  },
  textGroupLtr: {
    alignItems: "flex-start",
    writingDirection: "ltr",
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
    alignSelf: "flex-end",
  },
  subtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: "right",
  },
});
