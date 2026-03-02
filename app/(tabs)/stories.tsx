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

const stories = wisdomData.categories.stories;

function getCategoryColor(category: string): string {
  switch (category) {
    case "سلامة":
      return Colors.status.danger;
    case "مهارة":
      return Colors.primary.gold;
    case "معرفة":
      return Colors.status.info;
    default:
      return Colors.text.secondary;
  }
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case "سلامة":
      return "shield-checkmark-outline";
    case "مهارة":
      return "construct-outline";
    case "معرفة":
      return "book-outline";
    default:
      return "information-circle-outline";
  }
}

export default function StoriesScreen() {
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const categories = ["all", "سلامة", "مهارة", "معرفة"];
  const filteredStories =
    activeFilter === "all"
      ? stories.items
      : stories.items.filter((s) => s.category === activeFilter);

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
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.screenTitle}>{stories.title}</Text>
          <Text style={styles.screenSubtitle}>{stories.subtitle}</Text>
        </Animated.View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterContainer}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.filterChip,
                activeFilter === cat && styles.filterChipActive,
              ]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                setActiveFilter(cat);
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === cat && styles.filterTextActive,
                ]}
              >
                {cat === "all" ? "الكل" : cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filteredStories.map((story, index) => (
          <Animated.View
            key={story.id}
            entering={FadeInDown.delay(index * 80).duration(400)}
          >
            <Pressable
              style={({ pressed }) => [
                styles.storyCard,
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedId(expandedId === story.id ? null : story.id);
              }}
            >
              <View style={styles.storyHeader}>
                <View style={styles.storyTitleRow}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(story.category) + "20" },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(story.category) as any}
                      size={12}
                      color={getCategoryColor(story.category)}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        { color: getCategoryColor(story.category) },
                      ]}
                    >
                      {story.category}
                    </Text>
                  </View>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                </View>
                <Ionicons
                  name={expandedId === story.id ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Colors.text.tertiary}
                />
              </View>

              {expandedId === story.id && (
                <View style={styles.storyContent}>
                  <Text style={styles.storyText}>{story.story}</Text>
                  <View style={styles.takeawayContainer}>
                    <View style={styles.takeawayHeader}>
                      <Ionicons
                        name="bulb-outline"
                        size={16}
                        color={Colors.primary.gold}
                      />
                      <Text style={styles.takeawayLabel}>الخلاصة</Text>
                    </View>
                    <Text style={styles.takeawayText}>{story.takeaway}</Text>
                  </View>
                </View>
              )}
            </Pressable>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary.goldDim,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary.gold,
    borderColor: Colors.primary.gold,
  },
  filterText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13,
    color: Colors.primary.gold,
  },
  filterTextActive: {
    color: Colors.primary.greenDark,
  },
  storyCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  storyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  storyTitleRow: {
    flex: 1,
    alignItems: "flex-end",
    marginLeft: 12,
  },
  storyTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    marginTop: 6,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 11,
  },
  storyContent: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.card.border,
  },
  storyText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 15,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 26,
    marginBottom: 14,
  },
  takeawayContainer: {
    backgroundColor: Colors.primary.goldDim,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
  },
  takeawayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginBottom: 6,
  },
  takeawayLabel: {
    fontFamily: "Cairo_700Bold",
    fontSize: 13,
    color: Colors.primary.gold,
  },
  takeawayText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 22,
  },
});
