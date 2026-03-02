import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  I18nManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";

const logo = require("@/assets/images/sehail-logo.png");

function getWeatherAlert(): { message: string; icon: string } {
  const hour = new Date().getHours();
  if (hour >= 10 && hour <= 15) {
    return {
      message: wisdomData.categories.weather.rules[1].message,
      icon: "sunny-outline",
    };
  }
  if (hour >= 20 || hour <= 5) {
    return {
      message: wisdomData.categories.weather.rules[2].message,
      icon: "moon-outline",
    };
  }
  return {
    message: wisdomData.categories.weather.rules[6].message,
    icon: "partly-sunny-outline",
  };
}

function getDailyTip(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return wisdomData.categories.dailyTips[dayOfYear % wisdomData.categories.dailyTips.length];
}

interface SectionCardProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  delay: number;
}

function SectionCard({ title, subtitle, icon, onPress, delay }: SectionCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)}>
      <Pressable
        style={({ pressed }) => [
          styles.sectionCard,
          pressed && styles.sectionCardPressed,
        ]}
        onPress={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
      >
        <View style={styles.sectionIconContainer}>
          <Ionicons name={icon as any} size={28} color={Colors.primary.gold} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const weatherAlert = getWeatherAlert();
  const dailyTip = getDailyTip();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16 + webTopInset,
            paddingBottom: 100 + webBottomInset,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} contentFit="contain" />
            </View>
            <Pressable
              onPress={() => router.push("/settings")}
              style={styles.settingsButton}
            >
              <Ionicons name="settings-outline" size={22} color={Colors.text.secondary} />
            </Pressable>
          </View>
          <Text style={styles.welcomeText}>
            هلا، معك سِهيل، دليلك في البر
          </Text>
          <Text style={styles.welcomeSubtext}>جاهزة للرحلة؟</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            <View style={styles.weatherIconContainer}>
              <Ionicons name={weatherAlert.icon as any} size={20} color={Colors.primary.gold} />
            </View>
            <Text style={styles.weatherLabel}>النباهة</Text>
          </View>
          <Text style={styles.weatherMessage}>{weatherAlert.message}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="sparkles" size={18} color={Colors.primary.gold} />
            <Text style={styles.tipLabel}>نصيحة سِهيل اليوم</Text>
          </View>
          <Text style={styles.tipText}>{dailyTip}</Text>
        </Animated.View>

        <View style={styles.sectionGrid}>
          <View style={styles.sectionRow}>
            <SectionCard
              title="زهبة الركيب"
              subtitle="قوائم التجهيز"
              icon="briefcase-outline"
              onPress={() => router.push("/prep-gear")}
              delay={300}
            />
            <SectionCard
              title="دليل النجوم"
              subtitle="ملاحة بالنجوم"
              icon="star-outline"
              onPress={() => router.push("/star-guide")}
              delay={350}
            />
          </View>
          <View style={styles.sectionRow}>
            <SectionCard
              title="بصيرة البر"
              subtitle="دليل ميداني"
              icon="eye-outline"
              onPress={() => router.push("/(tabs)/guide")}
              delay={400}
            />
            <SectionCard
              title="سوالف سِهيل"
              subtitle="قصص وتكتيكات"
              icon="flame-outline"
              onPress={() => router.push("/(tabs)/stories")}
              delay={450}
            />
          </View>
        </View>

        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Pressable
            style={({ pressed }) => [
              styles.emergencyBanner,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(tabs)/emergency");
            }}
          >
            <Ionicons name="shield-checkmark" size={22} color={Colors.status.danger} />
            <Text style={styles.emergencyBannerText}>فزعة - أرقام الطوارئ ومشاركة الموقع</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.navy,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
  },
  logo: {
    width: 48,
    height: 48,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 22,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },
  welcomeSubtext: {
    fontFamily: "Cairo_400Regular",
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "right",
    writingDirection: "rtl",
    marginTop: 2,
  },
  weatherCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  weatherHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "flex-end",
  },
  weatherIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary.goldDim,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  weatherLabel: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
    color: Colors.primary.gold,
  },
  weatherMessage: {
    fontFamily: "Cairo_400Regular",
    fontSize: 15,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 24,
  },
  tipCard: {
    backgroundColor: Colors.primary.goldDim,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "flex-end",
    gap: 6,
  },
  tipLabel: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13,
    color: Colors.primary.gold,
  },
  tipText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 15,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 24,
  },
  sectionGrid: {
    marginBottom: 16,
    gap: 12,
  },
  sectionRow: {
    flexDirection: "row",
    gap: 12,
  },
  sectionCard: {
    flex: 1,
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.card.border,
    minHeight: 120,
    justifyContent: "center",
  },
  sectionCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary.goldDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15,
    color: Colors.text.primary,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: 2,
  },
  emergencyBanner: {
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(231, 76, 60, 0.2)",
  },
  emergencyBannerText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13,
    color: Colors.text.primary,
    flex: 1,
    textAlign: "right",
    writingDirection: "rtl",
  },
});
