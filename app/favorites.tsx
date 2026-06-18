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
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import PressableSurface from "@/components/PressableSurface";

interface FavItem {
  id: string;
  title: string;
  subtitle: string;
  type: "guide" | "story";
  params?: any;
  storyText?: string;
  storyCategory?: string;
}

function getAllItems(): FavItem[] {
  const items: FavItem[] = [];

  for (const section of wisdomData.categories.fieldGuide.sections) {
    for (const item of section.items) {
      items.push({
        id: item.id,
        title: item.name,
        subtitle: (item as any).description?.substring(0, 60) + "...",
        type: "guide",
        params: {
          id: item.id,
          name: item.name,
          description: item.description,
          action: (item as any).action,
          source: (item as any).source,
          dangerLevel: (item as any).dangerLevel,
        },
      });
    }
  }

  for (const story of wisdomData.categories.stories.items) {
    items.push({
      id: story.id,
      title: story.title,
      subtitle: story.story.substring(0, 60) + "...",
      type: "story",
      storyText: story.story,
      storyCategory: story.category,
    });
  }

  return items;
}

const allItems = getAllItems();

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getFavorites().then(setFavorites);
    }, [])
  );

  const favItems = allItems.filter((item) => favorites.includes(item.id));

  const handleRemove = async (itemId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = await toggleFavorite(itemId);
    setFavorites(updated);
  };

  return (
    <View {...(Platform.OS === "web" ? { dir: I18nManager.isRTL ? "rtl" : "ltr" } : {})} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {favItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={48} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>ما فيه مفضلات بعد</Text>
          </View>
        ) : (
          favItems.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(index * 60).duration(400)}
            >
              <PressableSurface
                  accessibilityRole="button"
                  accessibilityLabel={item.type === "guide" ? `فتح ${item.title}` : `${expandedStory === item.id ? "إخفاء" : "عرض"} ${item.title}`}
                  accessibilityState={{ expanded: item.type === "story" ? expandedStory === item.id : false }}
                  hitSlop={10}
                  baseStyle={styles.favCard}
                  hoverStyle={styles.favCardHover}
                  focusStyle={styles.favCardFocus}
                  pressedStyle={{ opacity: 0.8 }}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (item.type === "guide" && item.params) {
                    router.push({
                      pathname: "/guide-detail",
                      params: item.params,
                    });
                  } else if (item.type === "story") {
                    setExpandedStory(expandedStory === item.id ? null : item.id);
                  }
                }}
              >
                <View style={styles.favCardInner}>
                  <PressableSurface
                    onPress={() => handleRemove(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`إزالة ${item.title} من المفضلة`}
                    hitSlop={10}
                    baseStyle={styles.removeButton}
                    hoverStyle={styles.removeButtonHover}
                    focusStyle={styles.removeButtonFocus}
                    pressedStyle={{ opacity: 0.8 }}
                  >
                    <Ionicons name="star" size={20} color={Colors.primary.gold} />
                  </PressableSurface>
                  <View style={styles.favTextContainer}>
                    <Text style={styles.favTitle}>{item.title}</Text>
                    {expandedStory !== item.id && (
                      <Text style={styles.favSubtitle} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                  <View style={styles.typeBadge}>
                    <Ionicons
                      name={item.type === "guide" ? "eye-outline" : "flame-outline"}
                      size={14}
                      color={Colors.primary.green}
                    />
                  </View>
                </View>
                {item.type === "guide" && (
                  <Ionicons name="chevron-back" size={14} color={Colors.text.tertiary} />
                )}
                {item.type === "story" && (
                  <Ionicons
                    name={expandedStory === item.id ? "chevron-up" : "chevron-down"}
                    size={14}
                    color={Colors.text.tertiary}
                  />
                )}
              </PressableSurface>
              {item.type === "story" && expandedStory === item.id && item.storyText && (
                <View style={styles.storyExpanded}>
                  <Text style={styles.storyText}>{item.storyText}</Text>
                </View>
              )}
            </Animated.View>
          ))
        )}
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 16,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
  favCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.card.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  favCardHover: {
    borderColor: Colors.primary.greenLight,
  },
  favCardFocus: {
    borderColor: Colors.primary.green,
    shadowColor: Colors.primary.green,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  favCardInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  favTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  favTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },
  favSubtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "right",
    writingDirection: "rtl",
    marginTop: 2,
  },
  storyExpanded: {
    backgroundColor: Colors.card.background,
    borderRadius: 12,
    padding: 14,
    marginTop: -6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.card.border,
    borderTopStartRadius: 0,
    borderTopEndRadius: 0,
  },
  removeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  removeButtonHover: {
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  removeButtonFocus: {
    borderWidth: 1,
    borderColor: Colors.primary.gold,
  },
  storyText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 24,
  },
  typeBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0, 108, 53, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
});
