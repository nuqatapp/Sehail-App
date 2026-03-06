import React, { useState } from "react";
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
import LogoHeader from "@/components/LogoHeader";

const fieldGuide = wisdomData.categories.fieldGuide;

function getDangerColor(level: string): string {
  switch (level) {
    case "high":
      return Colors.status.danger;
    case "medium":
      return Colors.status.warning;
    case "low":
      return Colors.status.info;
    case "safe":
      return Colors.status.success;
    default:
      return Colors.text.secondary;
  }
}

function getDangerLabel(level: string): string {
  switch (level) {
    case "high":
      return "خطر عالي";
    case "medium":
      return "خطر متوسط";
    case "low":
      return "خطر منخفض";
    case "safe":
      return "آمن";
    default:
      return "";
  }
}

export default function GuideScreen() {
  const insets = useSafeAreaInsets();
  const [activeSection, setActiveSection] = useState(fieldGuide.sections[0].id);
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const currentSection = fieldGuide.sections.find((s) => s.id === activeSection);

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
        <LogoHeader />

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.screenTitle}>{fieldGuide.title}</Text>
          <Text style={styles.screenSubtitle}>{fieldGuide.subtitle}</Text>
        </Animated.View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterContainer}
        >
          {fieldGuide.sections.map((section) => (
            <Pressable
              key={section.id}
              style={[
                styles.filterChip,
                activeSection === section.id && styles.filterChipActive,
              ]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                setActiveSection(section.id);
              }}
            >
              <Ionicons
                name={section.icon as any}
                size={16}
                color={
                  activeSection === section.id
                    ? "#FFFFFF"
                    : Colors.primary.green
                }
              />
              <Text
                style={[
                  styles.filterText,
                  activeSection === section.id && styles.filterTextActive,
                ]}
              >
                {section.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {currentSection?.items.map((item: any, index: number) => {
          const envBadge = item.environment === "land" ? "🏜️" : item.environment === "sea" ? "🌊" : null;
          return (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(index * 80).duration(400)}
          >
            <Pressable
              style={({ pressed }) => [
                styles.guideCard,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: "/guide-detail",
                  params: {
                    name: item.name,
                    description: item.description,
                    action: item.action,
                    source: item.source,
                    dangerLevel: item.dangerLevel,
                  },
                });
              }}
            >
              {envBadge && <Text style={styles.envBadge}>{envBadge}</Text>}
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.dangerBadge,
                    { backgroundColor: getDangerColor(item.dangerLevel) + "15" },
                  ]}
                >
                  <View
                    style={[
                      styles.dangerDot,
                      { backgroundColor: getDangerColor(item.dangerLevel) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.dangerText,
                      { color: getDangerColor(item.dangerLevel) },
                    ]}
                  >
                    {getDangerLabel(item.dangerLevel)}
                  </Text>
                </View>
                <Text style={styles.cardName}>{item.name}</Text>
              </View>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.cardFooter}>
                <Ionicons
                  name="chevron-back"
                  size={16}
                  color={Colors.text.tertiary}
                />
                <Text style={styles.cardSource}>{item.source}</Text>
              </View>
            </Pressable>
          </Animated.View>
          );
        })}
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
  screenTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 28,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },
  screenSubtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary.green,
    borderColor: Colors.primary.green,
  },
  filterText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13,
    color: Colors.primary.green,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  guideCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.card.border,
    position: "relative" as const,
  },
  envBadge: {
    position: "absolute" as const,
    top: 8,
    left: 8,
    fontSize: 14,
    opacity: 0.6,
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 17,
    color: Colors.text.primary,
  },
  dangerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dangerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dangerText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 11,
  },
  cardDescription: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 22,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  cardSource: {
    fontFamily: "Cairo_400Regular",
    fontSize: 11,
    color: Colors.text.tertiary,
  },
});
