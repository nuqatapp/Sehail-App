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
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";
import LogoHeader from "@/components/LogoHeader";
import PressableSurface from "@/components/PressableSurface";

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
  const tips = wisdomData.categories.dailyTips;
  const tip = tips[dayOfYear % tips.length];
  return typeof tip === "string" ? tip : tip.text;
}

interface SectionCardProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  delay: number;
  accessibilityLabel?: string;
}

function SectionCard({ title, subtitle, icon, onPress, delay, accessibilityLabel = title }: SectionCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)}>
      <PressableSurface
        accessibilityLabel={accessibilityLabel}
        baseStyle={styles.sectionCard}
        hoverStyle={styles.sectionCardHover}
        focusStyle={styles.sectionCardFocus}
        pressedStyle={styles.sectionCardPressed}
        hitSlop={10}
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
      </PressableSurface>
    </Animated.View>
  );
}

const STREAK_KEY = "sehail_streak";
const DAY_ABBRS = ["س", "ح", "ن", "ث", "ر", "ج", "س"];

interface StreakData {
  count: number;
  lastDate: string;
  history: string[];
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toArabicNum(n: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).replace(/\d/g, (d) => arabicDigits[parseInt(d)]);
}

function dayDiff(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((da.getTime() - db.getTime()) / 86400000);
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return days;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const weatherAlert = getWeatherAlert();
  const dailyTip = getDailyTip();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [respondedToday, setRespondedToday] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newTipsCount, setNewTipsCount] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(STREAK_KEY).then((val) => {
      if (val) {
        try {
          const data = JSON.parse(val);
          if (data && typeof data.count === "number" && typeof data.lastDate === "string" && Array.isArray(data.history)) {
            setStreakData(data as StreakData);
            if (data.lastDate === getTodayStr()) {
              setRespondedToday(true);
            }
          }
        } catch {}
      }
    });
    AsyncStorage.getItem("sehail_new_tips_count").then((val) => {
      if (val) setNewTipsCount(parseInt(val, 10) || 0);
    });
  }, []);

  const handleTipResponse = useCallback(async (response: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const today = getTodayStr();
    let newData: StreakData;

    if (streakData && streakData.lastDate) {
      const diff = dayDiff(today, streakData.lastDate);
      if (diff === 1) {
        newData = {
          count: streakData.count + 1,
          lastDate: today,
          history: [...streakData.history, today],
        };
      } else if (diff === 0) {
        newData = { ...streakData };
      } else {
        newData = { count: 1, lastDate: today, history: [today] };
      }
    } else {
      newData = { count: 1, lastDate: today, history: [today] };
    }

    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newData));
    setStreakData(newData);
    setRespondedToday(true);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 1500);

    if (response === "new") {
      const updatedCount = newTipsCount + 1;
      setNewTipsCount(updatedCount);
      try {
        await AsyncStorage.setItem("sehail_new_tips_count", String(updatedCount));
      } catch {}
    }
  }, [streakData, newTipsCount]);

  const last7 = getLast7Days();
  const historySet = new Set(streakData?.history ?? []);

  return (
    <View {...(Platform.OS === "web" ? { dir: I18nManager.isRTL ? "rtl" : "ltr" } : {})} style={styles.container}>
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
          <PressableSurface
            onPress={() => router.push("/settings")}
            accessibilityLabel="فتح الإعدادات"
            accessibilityRole="button"
            hitSlop={10}
            baseStyle={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.text.tertiary} />
          </PressableSurface>
          <LogoHeader />
        </View>

        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.adBanner}>
          <View accessibilityRole="image" accessibilityLabel="إعلان سهيل">
            <Image
              source={require("@/assets/images/ad-banner.png")}
              style={styles.adImage}
              contentFit="cover"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="sparkles" size={16} color={Colors.primary.gold} />
            <Text style={styles.tipLabel}>نصيحة سهيل اليوم</Text>
          </View>
          <Text style={styles.tipText}>{dailyTip}</Text>

          {showConfirmation ? (
            <Animated.View entering={FadeIn.duration(300)} style={styles.confirmationRow}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.status.success} />
              <Text style={styles.confirmationText}>تم</Text>
            </Animated.View>
          ) : !respondedToday ? (
            <View style={styles.tipButtonsRow}>
              <PressableSurface
                accessibilityLabel="هذه المعلومة جديدة"
                baseStyle={[styles.tipButton, styles.tipButtonGold]}
                hoverStyle={styles.tipButtonHover}
                focusStyle={styles.tipButtonFocus}
                pressedStyle={styles.tipButtonPressed}
                hitSlop={10}
                onPress={() => handleTipResponse("new")}
              >
                <Ionicons name="bulb-outline" size={16} color={Colors.primary.gold} />
                <Text style={styles.tipButtonTextGold}>معلومة جديدة!</Text>
              </PressableSurface>
              <PressableSurface
                accessibilityLabel="أنا أعرف هذه المعلومة"
                baseStyle={[styles.tipButton, styles.tipButtonGreen]}
                hoverStyle={styles.tipButtonHover}
                focusStyle={styles.tipButtonFocus}
                pressedStyle={styles.tipButtonPressed}
                hitSlop={10}
                onPress={() => handleTipResponse("known")}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={Colors.primary.green} />
                <Text style={styles.tipButtonTextGreen}>أيوا عارفها</Text>
              </PressableSurface>
            </View>
          ) : null}
        </Animated.View>

        {respondedToday && streakData && (
          <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <Ionicons name="flame" size={20} color={Colors.primary.gold} />
              <Text style={styles.streakTitle}>سلسلة التعلّم</Text>
            </View>
            <Text style={styles.streakCount}>{toArabicNum(streakData.count)} يوم</Text>
            {newTipsCount > 0 && (
              <View style={styles.knowledgeRow}>
                <Ionicons name="bulb-outline" size={16} color={Colors.primary.gold} />
                <Text style={styles.knowledgeText}>تعلمت {newTipsCount} معلومة جديدة</Text>
              </View>
            )}
            <View style={styles.streakDaysRow}>
              {last7.map((day, i) => {
                const active = historySet.has(day);
                return (
                  <View key={day} style={styles.streakDayCol}>
                    <View style={[styles.streakDot, active && styles.streakDotActive]} />
                    <Text style={[styles.streakDayLabel, active && styles.streakDayLabelActive]}>
                      {DAY_ABBRS[new Date(day + "T00:00:00").getDay()]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        <View style={styles.sectionGrid}>
          <SectionCard
            title="إحتياجات الرحلة"
            subtitle="قوائم التجهيز"
            icon="briefcase-outline"
            onPress={() => router.push("/prep-gear")}
            delay={300}
            accessibilityLabel="فتح إحتياجات الرحلة"
          />
          <SectionCard
            title="دليل الملاحة"
            subtitle="النجوم والاتجاهات"
            icon="compass-outline"
            onPress={() => router.push("/star-guide")}
            delay={350}
            accessibilityLabel="فتح دليل الملاحة"
          />
          <SectionCard
            title="معلومات تهمك"
            subtitle="دليل ميداني"
            icon="warning-outline"
            onPress={() => router.push("/(tabs)/guide")}
            delay={400}
            accessibilityLabel="فتح معلومات تهمك"
          />
          <SectionCard
            title="سوالف سهيل"
            subtitle="قصص وتكتيكات"
            icon="flame-outline"
            onPress={() => router.push("/(tabs)/stories")}
            delay={450}
            accessibilityLabel="فتح سوالف سهيل"
          />
          <SectionCard
            title="البوصلة"
            subtitle="البوصلة وحفظ المواقع"
            icon="compass-outline"
            onPress={() => router.push("/compass")}
            delay={475}
            accessibilityLabel="فتح البوصلة"
          />
          <SectionCard
            title="المفضلة"
            subtitle="العناصر المحفوظة"
            icon="star-outline"
            onPress={() => router.push("/favorites")}
            delay={500}
            accessibilityLabel="فتح المفضلة"
          />
          <SectionCard
            title="اختبر معلوماتك"
            subtitle="كويزات تفاعلية"
            icon="help-circle-outline"
            onPress={() => router.push("/quiz")}
            delay={525}
            accessibilityLabel="فتح اختبر معلوماتك"
          />
          <SectionCard
            title="إنجازاتي"
            subtitle="شارات وتحديات"
            icon="trophy-outline"
            onPress={() => router.push("/badges")}
            delay={540}
            accessibilityLabel="فتح إنجازاتي"
          />
          <SectionCard
            title="أول ٥ دقائق"
            subtitle="بطاقات الطوارئ"
            icon="flash-outline"
            onPress={() => router.push("/first-five")}
            delay={550}
            accessibilityLabel="فتح أول ٥ دقائق"
          />
          <SectionCard
            title="تعرّف بسرعة"
            subtitle="وش شفت للتو؟"
            icon="search-outline"
            onPress={() => router.push("/quick-id")}
            delay={600}
            accessibilityLabel="فتح تعرّف بسرعة"
          />
        </View>

        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <PressableSurface
            accessibilityLabel="فتح فزعة وأرقام الطوارئ"
            baseStyle={styles.emergencyBanner}
            hoverStyle={styles.emergencyBannerHover}
            focusStyle={styles.emergencyBannerFocus}
            pressedStyle={{ opacity: 0.8 }}
            hitSlop={10}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(tabs)/emergency");
            }}
          >
            <Ionicons name="shield-checkmark" size={20} color={Colors.status.danger} />
            <Text style={styles.emergencyBannerText}>فزعة - أرقام الطوارئ ومشاركة الموقع</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
          </PressableSurface>
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
  sectionCardHover: {
    borderColor: Colors.primary.greenLight,
  },
  sectionCardFocus: {
    borderColor: Colors.primary.green,
    shadowColor: Colors.primary.green,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
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
    minWidth: 48,
    minHeight: 48,
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
    marginStart: 4,
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
  emergencyBannerHover: {
    borderColor: "rgba(231, 76, 60, 0.28)",
  },
  emergencyBannerFocus: {
    shadowColor: Colors.status.danger,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  emergencyBannerText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13,
    color: Colors.text.primary,
    flex: 1,
    textAlign: "right",
    writingDirection: "rtl",
  },
  tipButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    justifyContent: "flex-end",
  },
  tipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 44,
  },
  tipButtonHover: {
    opacity: 0.96,
  },
  tipButtonFocus: {
    shadowColor: Colors.primary.green,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  tipButtonPressed: {
    opacity: 0.84,
  },
  tipButtonGreen: {
    backgroundColor: "rgba(0, 108, 53, 0.08)",
  },
  tipButtonGold: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  tipButtonTextGreen: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13,
    color: Colors.primary.green,
  },
  tipButtonTextGold: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13,
    color: Colors.primary.gold,
  },
  confirmationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 12,
  },
  confirmationText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
    color: Colors.status.success,
  },
  streakCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.card.border,
    alignItems: "center",
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  streakTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15,
    color: Colors.text.primary,
  },
  streakCount: {
    fontFamily: "Cairo_700Bold",
    fontSize: 28,
    color: Colors.primary.green,
    marginBottom: 12,
  },
  knowledgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  knowledgeText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13,
    color: Colors.primary.gold,
    textAlign: "right",
    writingDirection: "rtl" as const,
  },
  streakDaysRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  streakDayCol: {
    alignItems: "center",
    gap: 4,
  },
  streakDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  streakDotActive: {
    backgroundColor: Colors.primary.green,
    borderColor: Colors.primary.green,
  },
  streakDayLabel: {
    fontFamily: "Cairo_400Regular",
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  streakDayLabelActive: {
    color: Colors.primary.green,
    fontFamily: "Cairo_600SemiBold",
  },
});
