import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";
import { getReadItems } from "@/lib/read-tracker";

interface BadgeDef {
  id: string;
  name: string;
  condition: string;
  icon: string;
  color: string;
}

const BADGES: BadgeDef[] = [
  { id: "desert_ready", name: "جاهز للبر", condition: "كمّل تشيك ليست بر كاملة", icon: "sunny-outline", color: Colors.primary.gold },
  { id: "sea_ready", name: "جاهز للبحر", condition: "كمّل تشيك ليست بحر كاملة", icon: "water-outline", color: Colors.status.info },
  { id: "navigator", name: "ملاّح", condition: "قرأ كل محتوى دليل الملاحة", icon: "compass-outline", color: Colors.primary.green },
  { id: "first_aid", name: "مسعف أولي", condition: "نجح في كويز السلامة ١٠٠٪", icon: "medkit-outline", color: Colors.status.danger },
  { id: "wildlife_expert", name: "عارف البر", condition: "قرأ كل بطاقات الكائنات", icon: "eye-outline", color: Colors.status.warning },
  { id: "storyteller", name: "صاحب سوالف", condition: "قرأ ١٠ سوالف أو أكثر", icon: "chatbubbles-outline", color: Colors.status.info },
  { id: "daily_learner", name: "متعلّم يومي", condition: "سلسلة ٧ أيام نصيحة", icon: "flame-outline", color: Colors.primary.gold },
  { id: "pro", name: "محترف", condition: "سلسلة ٣٠ يوم نصيحة", icon: "flame", color: Colors.status.danger },
  { id: "explorer", name: "مستكشف", condition: "فتح كل الشارات الثانية", icon: "star", color: Colors.primary.gold },
];

async function checkBadgeConditions(): Promise<string[]> {
  const unlocked: string[] = [];

  try {
    const envRaw = await AsyncStorage.getItem("sehail_completed_envs");
    const completedEnvs: string[] = envRaw ? JSON.parse(envRaw) : [];
    if (completedEnvs.includes("land")) unlocked.push("desert_ready");
    if (completedEnvs.includes("sea")) unlocked.push("sea_ready");

    const readItems = await getReadItems();
    const readSet = new Set(readItems);

    const navItems = wisdomData.categories.navigationGuide.sections.flatMap((s: any) => s.items.map((i: any) => i.id));
    if (navItems.length > 0 && navItems.every((id: string) => readSet.has(id))) {
      unlocked.push("navigator");
    }

    const creatureItems = wisdomData.categories.fieldGuide.sections
      .find((s: any) => s.id === "creatures")?.items.map((i: any) => i.id) || [];
    if (creatureItems.length > 0 && creatureItems.every((id: string) => readSet.has(id))) {
      unlocked.push("wildlife_expert");
    }

    const storyIds = wisdomData.categories.stories.items.map((s: any) => s.id);
    const readStories = storyIds.filter((id: string) => readSet.has(id));
    if (readStories.length >= 10) {
      unlocked.push("storyteller");
    }

    const quizRaw = await AsyncStorage.getItem("sehail_quiz_scores");
    const quizScores = quizRaw ? JSON.parse(quizRaw) : {};
    if (quizScores.quiz_safety && quizScores.quiz_safety.best === quizScores.quiz_safety.total && quizScores.quiz_safety.total > 0) {
      unlocked.push("first_aid");
    }

    const streakRaw = await AsyncStorage.getItem("sehail_streak");
    if (streakRaw) {
      const streak = JSON.parse(streakRaw);
      if (streak.count >= 7) unlocked.push("daily_learner");
      if (streak.count >= 30) unlocked.push("pro");
    }

    const otherBadges = BADGES.filter(b => b.id !== "explorer").map(b => b.id);
    if (otherBadges.every(id => unlocked.includes(id))) {
      unlocked.push("explorer");
    }
  } catch {}

  return unlocked;
}

export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      checkBadgeConditions().then(setUnlockedBadges);
    }, [])
  );

  const unlockedCount = unlockedBadges.length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={28} color={Colors.primary.gold} />
          </View>
          <Text style={styles.title}>إنجازاتي</Text>
          <Text style={styles.subtitle}>{unlockedCount} من {BADGES.length} شارة</Text>
        </Animated.View>

        <View style={styles.grid}>
          {BADGES.map((badge, index) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <Animated.View
                key={badge.id}
                entering={FadeInDown.delay(100 + index * 60).duration(400)}
                style={styles.gridItem}
              >
                <View style={[styles.badgeCard, !isUnlocked && styles.badgeCardLocked]}>
                  <View
                    style={[
                      styles.badgeIconCircle,
                      isUnlocked
                        ? { backgroundColor: badge.color + "18", borderColor: badge.color + "30" }
                        : styles.badgeIconLocked,
                    ]}
                  >
                    <Ionicons
                      name={badge.icon as any}
                      size={28}
                      color={isUnlocked ? badge.color : Colors.text.tertiary}
                    />
                  </View>
                  <Text style={[styles.badgeName, !isUnlocked && styles.badgeNameLocked]}>
                    {badge.name}
                  </Text>
                  <Text style={styles.badgeCondition}>{badge.condition}</Text>
                  {isUnlocked && (
                    <View style={styles.unlockedTag}>
                      <Ionicons name="checkmark-circle" size={12} color={Colors.status.success} />
                      <Text style={styles.unlockedText}>مفتوحة</Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </View>
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
    paddingTop: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  trophyCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: "Cairo_700Bold",
    fontSize: 26,
    color: Colors.text.primary,
  },
  subtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  gridItem: {
    width: "48%" as any,
  },
  badgeCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.card.border,
    minHeight: 160,
    justifyContent: "center",
  },
  badgeCardLocked: {
    opacity: 0.55,
  },
  badgeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1.5,
  },
  badgeIconLocked: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  badgeName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: Colors.text.secondary,
  },
  badgeCondition: {
    fontFamily: "Cairo_400Regular",
    fontSize: 11,
    color: Colors.text.tertiary,
    textAlign: "center",
    lineHeight: 16,
  },
  unlockedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  unlockedText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 11,
    color: Colors.status.success,
  },
});
