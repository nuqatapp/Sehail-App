import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Image } from "expo-image";
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";
import LogoHeader from "@/components/LogoHeader";

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
        <View style={styles.sectionCardInner}>
          <View style={styles.sectionTextContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionSubtitle}>{subtitle}</Text>
          </View>
          <View style={styles.sectionIconContainer}>
            <Ionicons name={icon as any} size={24} color={Colors.primary.green} />
          </View>
        </View>
        <Ionicons name="chevron-back" size={16} color={Colors.text.tertiary} style={styles.sectionChevron} />
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
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.push("/settings")}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.text.tertiary} />
          </Pressable>
          <LogoHeader />
        </View>

        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.adBanner}>
          <Pressable style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
            <Image
              source={require("@/assets/images/ad-banner.png")}
              style={styles.adImage}
              contentFit="cover"
            />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="sparkles" size={16} color={Colors.primary.gold} />
            <Text style={styles.tipLabel}>نصيحة سهيل اليوم</Text>
          </View>
          <Text style={styles.tipText}>{dailyTip}</Text>
        </Animated.View>

        <View style={styles.sectionGrid}>
          <SectionCard
            title="إحتياجات الرحلة"
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
          <SectionCard
            title="معلومات تهمك⚠️"
            subtitle="دليل ميداني"
            icon="eye-outline"
            onPress={() => router.push("/(tabs)/guide")}
            delay={400}
          />
          <SectionCard
            title="سوالف سهيل"
            subtitle="قصص وتكتيكات"
            icon="flame-outline"
            onPress={() => router.push("/(tabs)/stories")}
            delay={450}
          />
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
            <Ionicons name="shield-checkmark" size={20} color={Colors.status.danger} />
            <Text style={styles.emergencyBannerText}>فزعة - أرقام الطوارئ ومشاركة الموقع</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  scrollContent: {
    paddingHorizontal: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  adBanner: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  adImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card.background,
    borderWidth: 1,
    borderColor: Colors.card.border,
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "rgba(0, 108, 53, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  weatherLabel: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
    color: Colors.primary.green,
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
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.card.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.gold,
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
    gap: 10,
  },
  sectionCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.card.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  sectionCardInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 14,
  },
  sectionTextContainer: {
    alignItems: "flex-end",
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(0, 108, 53, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl" as const,
  },
  sectionSubtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: "right",
    writingDirection: "rtl" as const,
    marginTop: 2,
  },
  sectionChevron: {
    marginLeft: 4,
  },
  emergencyBanner: {
    backgroundColor: Colors.card.background,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(231, 76, 60, 0.15)",
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
