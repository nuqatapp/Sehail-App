import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

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

function getDangerIcon(level: string): string {
  switch (level) {
    case "high":
      return "alert-circle";
    case "medium":
      return "warning";
    case "low":
      return "information-circle";
    case "safe":
      return "checkmark-circle";
    default:
      return "help-circle";
  }
}

export default function GuideDetailScreen() {
  const insets = useSafeAreaInsets();
  const { name, description, action, source, dangerLevel } = useLocalSearchParams<{
    name: string;
    description: string;
    action: string;
    source: string;
    dangerLevel: string;
  }>();

  const dangerColor = getDangerColor(dangerLevel || "");

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.headerSection}>
          <View
            style={[
              styles.dangerBanner,
              { backgroundColor: dangerColor + "10", borderColor: dangerColor + "25" },
            ]}
          >
            <Ionicons
              name={getDangerIcon(dangerLevel || "") as any}
              size={22}
              color={dangerColor}
            />
            <Text style={[styles.dangerLabel, { color: dangerColor }]}>
              {getDangerLabel(dangerLevel || "")}
            </Text>
          </View>

          <Text style={styles.itemName}>{name}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary.green} />
            <Text style={styles.sectionTitle}>وش هي</Text>
          </View>
          <Text style={styles.sectionText}>{description}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.actionSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="hand-right-outline" size={18} color={Colors.primary.gold} />
            <Text style={styles.sectionTitleGold}>وش تسوي</Text>
          </View>
          <Text style={styles.sectionText}>{action}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.sourceSection}>
          <Ionicons name="document-text-outline" size={16} color={Colors.text.tertiary} />
          <Text style={styles.sourceText}>المصدر: {source}</Text>
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
  headerSection: {
    marginBottom: 24,
    alignItems: "flex-end",
  },
  dangerBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    alignSelf: "flex-end",
  },
  dangerLabel: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15,
  },
  itemName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 28,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },
  section: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  actionSection: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.card.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.gold,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    color: Colors.primary.green,
  },
  sectionTitleGold: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    color: Colors.primary.gold,
  },
  sectionText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 15,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 26,
  },
  sourceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    paddingVertical: 12,
  },
  sourceText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    color: Colors.text.tertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },
});
