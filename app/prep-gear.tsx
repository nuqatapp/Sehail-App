import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";

const prepGear = wisdomData.categories.prepGear;

export default function PrepGearScreen() {
  const insets = useSafeAreaInsets();
  const [activeTripType, setActiveTripType] = useState(prepGear.tripTypes[0].id);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [tripsCompleted, setTripsCompleted] = useState(0);

  const currentTrip = prepGear.tripTypes.find((t) => t.id === activeTripType);

  useEffect(() => {
    loadCheckedItems();
    loadTripsCompleted();
  }, []);

  const loadCheckedItems = async () => {
    try {
      const stored = await AsyncStorage.getItem("sehail_checklist");
      if (stored) {
        setCheckedItems(JSON.parse(stored));
      }
    } catch {}
  };

  const loadTripsCompleted = async () => {
    try {
      const stored = await AsyncStorage.getItem("sehail_trips_completed");
      if (stored) {
        setTripsCompleted(parseInt(stored, 10) || 0);
      }
    } catch {}
  };

  const toggleItem = useCallback(
    async (itemId: string) => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newChecked = { ...checkedItems, [itemId]: !checkedItems[itemId] };
      setCheckedItems(newChecked);
      try {
        await AsyncStorage.setItem("sehail_checklist", JSON.stringify(newChecked));
      } catch {}
    },
    [checkedItems]
  );

  const checkedCount = currentTrip?.items.filter((i) => checkedItems[i.id]).length || 0;
  const totalCount = currentTrip?.items.length || 0;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  const resetChecklist = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (progress === 1) {
      const newCount = tripsCompleted + 1;
      setTripsCompleted(newCount);
      try {
        await AsyncStorage.setItem("sehail_trips_completed", String(newCount));
        const envRaw = await AsyncStorage.getItem("sehail_completed_envs");
        const envSet: string[] = envRaw ? JSON.parse(envRaw) : [];
        const tripEnv = currentTrip?.environment;
        if (tripEnv && !envSet.includes(tripEnv)) {
          envSet.push(tripEnv);
          await AsyncStorage.setItem("sehail_completed_envs", JSON.stringify(envSet));
        }
      } catch {}
    }
    const newChecked = { ...checkedItems };
    currentTrip?.items.forEach((item) => {
      delete newChecked[item.id];
    });
    setCheckedItems(newChecked);
    try {
      await AsyncStorage.setItem("sehail_checklist", JSON.stringify(newChecked));
    } catch {}
  }, [checkedItems, currentTrip, progress, tripsCompleted]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tripTypeRow}
          style={styles.tripTypeContainer}
        >
          {prepGear.tripTypes.map((tripType: any) => (
            <Pressable
              key={tripType.id}
              style={[
                styles.tripTypeChip,
                activeTripType === tripType.id && styles.tripTypeChipActive,
              ]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                setActiveTripType(tripType.id);
              }}
            >
              <Ionicons
                name={tripType.icon as any}
                size={16}
                color={
                  activeTripType === tripType.id
                    ? "#FFFFFF"
                    : Colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.tripTypeText,
                  activeTripType === tripType.id && styles.tripTypeTextActive,
                ]}
              >
                {tripType.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Pressable onPress={resetChecklist} style={styles.resetButton}>
              <Ionicons name="refresh-outline" size={18} color={Colors.text.tertiary} />
            </Pressable>
            <Text style={styles.progressLabel}>
              {checkedCount} من {totalCount}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: `${progress * 100}%` },
              ]}
            />
          </View>
          {progress === 1 && (
            <Text style={styles.readyText}>جاهز للطلعة!</Text>
          )}
          {tripsCompleted > 0 && (
            <View style={styles.tripCountRow}>
              <Ionicons name="ribbon-outline" size={16} color={Colors.primary.gold} />
              <Text style={styles.tripCountText}>
                أكملت {tripsCompleted} رحلات بتجهيز كامل
              </Text>
            </View>
          )}
        </View>

        {currentTrip?.items.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(index * 50).duration(300)}
          >
            <Pressable
              style={({ pressed }) => [
                styles.checkItem,
                checkedItems[item.id] && styles.checkItemChecked,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => toggleItem(item.id)}
            >
              <View style={styles.checkItemContent}>
                {item.critical && (
                  <View style={styles.criticalBadge}>
                    <Text style={styles.criticalText}>ضروري</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.checkItemText,
                    checkedItems[item.id] && styles.checkItemTextChecked,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  checkedItems[item.id] && styles.checkboxChecked,
                ]}
              >
                {checkedItems[item.id] && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
            </Pressable>
          </Animated.View>
        ))}

        {progress === 1 && currentTrip && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.shareCard}>
              <View style={styles.shareStarCircle}>
                <Text style={styles.shareStarIcon}>✦</Text>
              </View>
              <Text style={styles.shareTitle}>جاهز للرحلة</Text>
              <Text style={styles.shareSubtitle}>
                كمّلت {totalCount} من {totalCount} عنصر تجهيز
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.shareButton,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={async () => {
                  if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  const tripName = currentTrip.name;
                  const message = `أنا جاهز لرحلة ${tripName} — جهّزت كل شيء عبر تطبيق سهيل ✦\n\n${checkedCount} عنصر تجهيز مكتمل\n\nحمّل سهيل وجهّز رحلتك!`;
                  try {
                    await Share.share({ message });
                  } catch {}
                }}
              >
                <Ionicons name="share-outline" size={18} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>شارك في الواتساب</Text>
              </Pressable>
            </View>
          </Animated.View>
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
  tripTypeContainer: {
    marginBottom: 16,
  },
  tripTypeRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  tripTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  tripTypeChipActive: {
    backgroundColor: Colors.primary.green,
    borderColor: Colors.primary.green,
  },
  tripTypeText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
    color: Colors.primary.green,
  },
  tripTypeTextActive: {
    color: "#FFFFFF",
  },
  progressCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressLabel: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 15,
    color: Colors.text.primary,
  },
  resetButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primary.green,
    borderRadius: 3,
  },
  readyText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 14,
    color: Colors.status.success,
    textAlign: "center",
    marginTop: 10,
  },
  tripCountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 10,
  },
  tripCountText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13,
    color: Colors.primary.gold,
    textAlign: "right",
    writingDirection: "rtl" as const,
  },
  checkItem: {
    backgroundColor: Colors.card.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  checkItemChecked: {
    backgroundColor: "rgba(39, 174, 96, 0.04)",
    borderColor: "rgba(39, 174, 96, 0.15)",
  },
  checkItemContent: {
    flex: 1,
    alignItems: "flex-end",
    marginLeft: 12,
  },
  checkItemText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },
  checkItemTextChecked: {
    color: Colors.text.tertiary,
    textDecorationLine: "line-through",
  },
  criticalBadge: {
    backgroundColor: "rgba(231, 76, 60, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  criticalText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 10,
    color: Colors.status.danger,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.text.tertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.green,
    borderColor: Colors.primary.green,
  },
  shareCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 108, 53, 0.15)",
    alignItems: "center",
  },
  shareStarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  shareStarIcon: {
    fontSize: 28,
    color: "#FFFFFF",
  },
  shareTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 20,
    color: Colors.primary.green,
    marginBottom: 4,
  },
  shareSubtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 18,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary.green,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  shareButtonText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
