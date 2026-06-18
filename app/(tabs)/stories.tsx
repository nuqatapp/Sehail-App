import React, { useState, useCallback } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";
import LogoHeader from "@/components/LogoHeader";
import PressableSurface from "@/components/PressableSurface";
import { markAsRead, getReadItems, isRead } from "@/lib/read-tracker";
import { getFavorites, toggleFavorite, isFavorite } from "@/lib/favorites";

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
  const [readItems, setReadItems] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  useFocusEffect(
    useCallback(() => {
      getReadItems().then(setReadItems);
      getFavorites().then(setFavorites);
    }, [])
  );

  const handleToggleFavorite = async (storyId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = await toggleFavorite(storyId);
    setFavorites(updated);
  };

  const categories = ["all", "سلامة", "مهارة", "معرفة"];
  const filteredStories =
    activeFilter === "all"
      ? stories.items
      : stories.items.filter((s) => s.category === activeFilter);

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
        <LogoHeader />

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
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
            <PressableSurface
              key={cat}
              accessibilityRole="button"
              accessibilityLabel={cat === "all" ? "عرض كل القصص" : `تصفية القصص حسب ${cat}`}
              accessibilityState={{ selected: activeFilter === cat }}
              hitSlop={10}
              baseStyle={[
                styles.filterChip,
                activeFilter === cat && styles.filterChipActive,
              ]}
              hoverStyle={styles.filterChipHover}
              focusStyle={styles.filterChipFocus}
              pressedStyle={styles.filterChipPressed}
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
            </PressableSurface>
          ))}
        </ScrollView>

        {filteredStories.map((story, index) => (
          <Animated.View
            key={story.id}
            entering={FadeInDown.delay(index * 80).duration(400)}
          >
            <PressableSurface
              accessibilityRole="button"
              accessibilityLabel={`${story.title}${expandedId === story.id ? "، مطوّلة" : "، اضغط لعرض التفاصيل"}`}
              accessibilityState={{ expanded: expandedId === story.id }}
              hitSlop={10}
              baseStyle={styles.storyCard}
              hoverStyle={styles.storyCardHover}
              focusStyle={styles.storyCardFocus}
              pressedStyle={{ opacity: 0.9 }}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const isExpanding = expandedId !== story.id;
                setExpandedId(isExpanding ? story.id : null);
                if (isExpanding) {
                  markAsRead(story.id).then(() => {
                    getReadItems().then(setReadItems);
                  });
                }
              }}
            >
              {isRead(story.id, readItems) && (
                <View style={styles.readBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.text.tertiary} />
                </View>
              )}
              {(story as any).environment === "land" && <View style={styles.envBadge}><Ionicons name="sunny-outline" size={14} color={Colors.text.tertiary} /></View>}
              {(story as any).environment === "sea" && <View style={styles.envBadge}><Ionicons name="water-outline" size={14} color={Colors.text.tertiary} /></View>}
              <View style={styles.storyHeader}>
                <View style={styles.storyTitleRow}>
                  <View style={styles.storyBadgeRow}>
                    <PressableSurface
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(story.id);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={isFavorite(story.id, favorites) ? `إزالة ${story.title} من المفضلة` : `إضافة ${story.title} إلى المفضلة`}
                      accessibilityState={{ selected: isFavorite(story.id, favorites) }}
                      hitSlop={10}
                      baseStyle={styles.favoriteButton}
                      hoverStyle={styles.favoriteButtonHover}
                      focusStyle={styles.favoriteButtonFocus}
                      pressedStyle={styles.favoriteButtonPressed}
                    >
                      <Ionicons
                        name={isFavorite(story.id, favorites) ? "star" : "star-outline"}
                        size={18}
                        color={Colors.primary.gold}
                      />
                    </PressableSurface>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: getCategoryColor(story.category) + "15" },
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
            </PressableSurface>
          </Animated.View>
        ))}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.card.border,
    minHeight: 44,
  },
  filterChipHover: {
    borderColor: Colors.primary.greenLight,
  },
  filterChipFocus: {
    borderColor: Colors.primary.green,
    shadowColor: Colors.primary.green,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  filterChipPressed: {
    opacity: 0.9,
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
  storyCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.card.border,
    position: "relative" as const,
  },
  storyCardHover: {
    borderColor: Colors.primary.greenLight,
  },
  storyCardFocus: {
    borderColor: Colors.primary.green,
    shadowColor: Colors.primary.green,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  readBadge: {
    position: "absolute" as const,
    top: 8,
    end: 8,
    zIndex: 1,
  },
  envBadge: {
    position: "absolute" as const,
    top: 8,
    start: 8,
    zIndex: 1,
  },
  storyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  storyBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  storyTitleRow: {
    flex: 1,
    alignItems: "flex-end",
    marginStart: 12,
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
  favoriteButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  favoriteButtonHover: {
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  favoriteButtonFocus: {
    borderWidth: 1,
    borderColor: Colors.primary.gold,
  },
  favoriteButtonPressed: {
    transform: [{ scale: 0.96 }],
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
    backgroundColor: "rgba(212, 175, 55, 0.06)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.12)",
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
