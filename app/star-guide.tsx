import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";

const starGuide = wisdomData.categories.starGuide;

function getDirectionIcon(direction: string): string {
  if (direction.includes("جنوب") || direction.includes("الجنوب")) return "arrow-down";
  if (direction.includes("شمال") || direction.includes("الشمال")) return "arrow-up";
  if (direction.includes("شرق")) return "arrow-back";
  if (direction.includes("غرب")) return "arrow-forward";
  return "compass-outline";
}

export default function StarGuideScreen() {
  const insets = useSafeAreaInsets();

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
          <Ionicons name="compass-outline" size={28} color={Colors.primary.gold} />
          <Text style={styles.introText}>
            معرفة النجوم مهارة ثقافية تساعدك في تحديد الاتجاهات. هذا دليل تعليمي
            وليس نظام ملاحة دقيق.
          </Text>
        </Animated.View>

        {starGuide.items.map((star, index) => (
          <Animated.View
            key={star.id}
            entering={FadeInDown.delay(100 + index * 100).duration(500)}
          >
            <View style={styles.starCard}>
              <View style={styles.starHeader}>
                <View style={styles.directionBadge}>
                  <Ionicons
                    name={getDirectionIcon(star.direction) as any}
                    size={14}
                    color={Colors.primary.gold}
                  />
                  <Text style={styles.directionText}>{star.direction}</Text>
                </View>
                <View style={styles.starNameContainer}>
                  <Text style={styles.starName}>{star.name}</Text>
                  <Text style={styles.starArabicName}>{star.arabicName}</Text>
                </View>
              </View>

              <Text style={styles.starDescription}>{star.description}</Text>

              <View style={styles.starInfoRow}>
                <View style={styles.starInfoItem}>
                  <Ionicons name="bulb-outline" size={14} color={Colors.primary.gold} />
                  <Text style={styles.starInfoText}>{star.tip}</Text>
                </View>
              </View>

              <View style={styles.seasonContainer}>
                <Ionicons name="calendar-outline" size={14} color={Colors.text.tertiary} />
                <Text style={styles.seasonText}>{star.season}</Text>
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.green,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  introCard: {
    backgroundColor: Colors.primary.goldDim,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
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
  starCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.card.border,
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
    backgroundColor: Colors.primary.goldDim,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  directionText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 12,
    color: Colors.primary.gold,
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
    backgroundColor: Colors.primary.goldDim,
    padding: 12,
    borderRadius: 12,
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
