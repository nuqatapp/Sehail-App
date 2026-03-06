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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";

const navGuide = wisdomData.categories.navigationGuide;

function getDirectionIcon(direction: string): string {
  if (direction.includes("جنوب") || direction.includes("الجنوب")) return "arrow-down";
  if (direction.includes("شمال") || direction.includes("الشمال")) return "arrow-up";
  if (direction.includes("شرق")) return "arrow-back";
  if (direction.includes("غرب")) return "arrow-forward";
  return "compass-outline";
}

function getEnvBadge(env?: string) {
  if (env === "land") return "🏜️";
  if (env === "sea") return "🌊";
  return null;
}

export default function StarGuideScreen() {
  const insets = useSafeAreaInsets();
  const [activeSection, setActiveSection] = useState(navGuide.sections[0].id);

  const currentSection = navGuide.sections.find((s) => s.id === activeSection);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.introCard}>
          <Ionicons name="compass-outline" size={24} color={Colors.primary.green} />
          <Text style={styles.introText}>
            معرفة النجوم مهارة ثقافية تساعدك في تحديد الاتجاهات. هذا دليل تعليمي
            وليس نظام ملاحة دقيق.
          </Text>
        </Animated.View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterContainer}
        >
          {navGuide.sections.map((section) => (
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
                size={14}
                color={activeSection === section.id ? "#FFFFFF" : Colors.primary.green}
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

        {currentSection && "subtitle" in currentSection && currentSection.id !== "stars" && (
          <Animated.View entering={FadeInDown.delay(50).duration(400)}>
            <Text style={styles.sectionSubtitle}>{(currentSection as any).subtitle}</Text>
          </Animated.View>
        )}

        {currentSection && "disclaimer" in currentSection && (
          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.disclaimerCard}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.status.warning} />
            <Text style={styles.disclaimerText}>{(currentSection as any).disclaimer}</Text>
          </Animated.View>
        )}

        {currentSection?.items.map((item, index) => {
          const envBadge = getEnvBadge(currentSection.environment);
          return (
            <Animated.View
              key={item.id || index}
              entering={FadeInDown.delay(100 + index * 100).duration(500)}
            >
              <View style={styles.starCard}>
                {envBadge && (
                  <Text style={styles.envBadge}>{envBadge}</Text>
                )}
                <View style={styles.starHeader}>
                  <View style={styles.directionBadge}>
                    <Ionicons
                      name={getDirectionIcon(item.direction) as any}
                      size={14}
                      color={Colors.primary.green}
                    />
                    <Text style={styles.directionText}>{item.direction}</Text>
                  </View>
                  <View style={styles.starNameContainer}>
                    <Text style={styles.starName}>{item.name}</Text>
                    {"arabicName" in item && (
                      <Text style={styles.starArabicName}>{(item as any).arabicName}</Text>
                    )}
                  </View>
                </View>

                <Text style={styles.starDescription}>{item.description}</Text>

                {item.tip ? (
                  <View style={styles.starInfoRow}>
                    <View style={styles.starInfoItem}>
                      <Ionicons name="bulb-outline" size={14} color={Colors.primary.gold} />
                      <Text style={styles.starInfoText}>{item.tip}</Text>
                    </View>
                  </View>
                ) : null}

                {"season" in item && (
                  <View style={styles.seasonContainer}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.text.tertiary} />
                    <Text style={styles.seasonText}>{(item as any).season}</Text>
                  </View>
                )}
              </View>
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
    paddingTop: 16,
  },
  introCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.card.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.green,
  },
  introText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    flex: 1,
    lineHeight: 22,
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
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
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
    fontSize: 12,
    color: Colors.primary.green,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  sectionSubtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 12,
  },
  disclaimerCard: {
    backgroundColor: "rgba(243, 156, 18, 0.06)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(243, 156, 18, 0.15)",
  },
  disclaimerText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    flex: 1,
    lineHeight: 20,
  },
  starCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
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
  starHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  starNameContainer: {
    alignItems: "flex-end",
  },
  starName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
    color: Colors.text.primary,
  },
  starArabicName: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  directionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 108, 53, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  directionText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 12,
    color: Colors.primary.green,
  },
  starDescription: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 24,
    marginBottom: 14,
  },
  starInfoRow: {
    marginBottom: 12,
  },
  starInfoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    gap: 8,
    backgroundColor: "rgba(212, 175, 55, 0.06)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.1)",
  },
  starInfoText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    flex: 1,
    lineHeight: 20,
  },
  seasonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  seasonText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },
});
