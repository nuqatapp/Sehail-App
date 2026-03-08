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
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";

const fieldGuide = wisdomData.categories.fieldGuide;

function findItem(id: string) {
  for (const section of fieldGuide.sections) {
    const item = section.items.find((i: any) => i.id === id);
    if (item) return item;
  }
  return null;
}

interface QuickCategory {
  label: string;
  emoji: string;
  itemId: string;
  bgColor: string;
  borderColor: string;
}

const categories: QuickCategory[] = [
  { label: "عقرب", emoji: "\u{1F982}", itemId: "fg1", bgColor: "rgba(231, 76, 60, 0.1)", borderColor: "rgba(231, 76, 60, 0.3)" },
  { label: "ثعبان", emoji: "\u{1F40D}", itemId: "fg2", bgColor: "rgba(243, 156, 18, 0.1)", borderColor: "rgba(243, 156, 18, 0.3)" },
  { label: "قنديل بحر", emoji: "\u{1FABC}", itemId: "fg13", bgColor: "rgba(52, 152, 219, 0.1)", borderColor: "rgba(52, 152, 219, 0.3)" },
  { label: "نبتة سامة", emoji: "\u{1F335}", itemId: "fg6", bgColor: "rgba(39, 174, 96, 0.1)", borderColor: "rgba(39, 174, 96, 0.3)" },
  { label: "سمكة حجر", emoji: "\u{1F41F}", itemId: "fg14", bgColor: "rgba(155, 89, 182, 0.1)", borderColor: "rgba(155, 89, 182, 0.3)" },
  { label: "قنفذ بحر", emoji: "\u{1F994}", itemId: "fg16", bgColor: "rgba(22, 160, 133, 0.1)", borderColor: "rgba(22, 160, 133, 0.3)" },
];

function navigateToDetail(itemId: string) {
  const item = findItem(itemId);
  if (!item) return;
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  router.push({
    pathname: "/guide-detail",
    params: {
      name: (item as any).name,
      description: (item as any).description,
      action: (item as any).action,
      source: (item as any).source,
      dangerLevel: (item as any).dangerLevel,
    },
  });
}

export default function QuickIdScreen() {
  const insets = useSafeAreaInsets();
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (insets.bottom || 0) + 30 + webBottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.title}>تعرّف بسرعة</Text>
          <Text style={styles.subtitle}>وش شفت للتو؟</Text>
        </Animated.View>

        <View style={styles.grid}>
          {categories.map((cat, index) => (
            <Animated.View
              key={cat.itemId}
              entering={FadeInDown.delay(100 + index * 80).duration(400)}
              style={styles.gridItem}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.categoryButton,
                  { backgroundColor: cat.bgColor, borderColor: cat.borderColor },
                  pressed && styles.categoryButtonPressed,
                ]}
                onPress={() => navigateToDetail(cat.itemId)}
              >
                <Text style={styles.emoji}>{cat.emoji}</Text>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.noteContainer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.text.tertiary} />
          <Text style={styles.noteText}>اضغط وبيوصلك: وش هو + خطره + وش تسوي</Text>
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
    paddingTop: 16,
  },
  header: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  title: {
    fontFamily: "Cairo_700Bold",
    fontSize: 28,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl" as const,
  },
  subtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "right",
    writingDirection: "rtl" as const,
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
  categoryButton: {
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  categoryButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  emoji: {
    fontSize: 40,
  },
  categoryLabel: {
    fontFamily: "Cairo_700Bold",
    fontSize: 17,
    color: Colors.text.primary,
    textAlign: "center",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 28,
    paddingHorizontal: 8,
  },
  noteText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    color: Colors.text.tertiary,
    textAlign: "right",
    writingDirection: "rtl" as const,
  },
});
