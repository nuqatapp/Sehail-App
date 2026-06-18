import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Linking,
  Platform,
  I18nManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";
import PressableSurface from "@/components/PressableSurface";

const firstFive = wisdomData.categories.firstFiveMinutes;

function getEnvIcon(env?: string): string | null {
  if (env === "land") return "sunny-outline";
  if (env === "sea") return "water-outline";
  return null;
}

export default function FirstFiveScreen() {
  const insets = useSafeAreaInsets();
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const activeEntry = firstFive.entries.find((e) => e.id === selectedEntry);

  return (
    <View {...(Platform.OS === "web" ? { dir: I18nManager.isRTL ? "rtl" : "ltr" } : {})} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Ionicons name="flash" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>{firstFive.title}</Text>
          <Text style={styles.subtitle}>{firstFive.subtitle}</Text>
        </Animated.View>

        {!selectedEntry ? (
          <View style={styles.grid}>
            {firstFive.entries.map((entry, index) => {
              const envIcon = getEnvIcon(entry.environment);
              return (
                <Animated.View
                  key={entry.id}
                  entering={FadeInDown.delay(100 + index * 80).duration(400)}
                  style={styles.gridItem}
                >
                  <PressableSurface
                    accessibilityRole="button"
                    accessibilityLabel={`فتح ${entry.title}`}
                    hitSlop={10}
                    baseStyle={styles.entryButton}
                    hoverStyle={styles.entryButtonHover}
                    focusStyle={styles.entryButtonFocus}
                    pressedStyle={styles.entryButtonPressed}
                    onPress={() => {
                      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedEntry(entry.id);
                    }}
                  >
                    {envIcon && (
                      <View style={styles.envIcon}>
                        <Ionicons name={envIcon as any} size={12} color={Colors.text.tertiary} />
                      </View>
                    )}
                    <Text style={styles.entryEmoji}>{entry.icon}</Text>
                    <Text style={styles.entryLabel}>{entry.title}</Text>
                  </PressableSurface>
                </Animated.View>
              );
            })}
          </View>
        ) : activeEntry ? (
          <View>
            <Animated.View entering={FadeInDown.duration(300)}>
              <PressableSurface
                accessibilityRole="button"
                accessibilityLabel="رجوع إلى القائمة"
                hitSlop={10}
                baseStyle={styles.backButton}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  setSelectedEntry(null);
                }}
              >
                <Text style={styles.backText}>رجوع</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.primary.green} />
              </PressableSurface>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.emergencyHeader}>
              <Text style={styles.emergencyEmoji}>{activeEntry.icon}</Text>
              <Text style={styles.emergencyTitle}>{activeEntry.title}</Text>
              <Text style={styles.emergencySubtitle}>اتبع الخطوات بالترتيب</Text>
            </Animated.View>

            {activeEntry.steps.map((step, index) => (
              <Animated.View
                key={step.step}
                entering={FadeInDown.delay(100 + index * 80).duration(400)}
              >
                <View
                  style={[
                    styles.stepCard,
                    index === 0 && styles.stepCardFirst,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      index === 0 && styles.stepNumberFirst,
                    ]}
                  >
                    {step.step}
                  </Text>
                  <Text
                    style={[
                      styles.stepText,
                      index === 0 && styles.stepTextFirst,
                    ]}
                  >
                    {step.text}
                  </Text>
                </View>
              </Animated.View>
            ))}

            <Animated.View
              entering={FadeInDown.delay(100 + activeEntry.steps.length * 80).duration(400)}
            >
              <PressableSurface
                accessibilityRole="button"
                accessibilityLabel={`اتصل على ${activeEntry.callNumber}`}
                hitSlop={10}
                baseStyle={styles.callButton}
                hoverStyle={styles.callButtonHover}
                focusStyle={styles.callButtonFocus}
                pressedStyle={{ opacity: 0.85 }}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  const num = activeEntry.callNumber;
                  if (Platform.OS !== "web") {
                    Linking.openURL(`tel:${num}`);
                  } else {
                    alert(`اتصل ${num}`);
                  }
                }}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
                <Text style={styles.callButtonText}>اتصل {activeEntry.callNumber}</Text>
              </PressableSurface>
            </Animated.View>
          </View>
        ) : null}

        {!selectedEntry && (
          <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.text.tertiary} />
            <Text style={styles.noteText}>اختر الحالة وبيوصلك خطوات واضحة تتبعها فوراً</Text>
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
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.status.danger,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: "Cairo_700Bold",
    fontSize: 26,
    color: Colors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
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
  entryButton: {
    backgroundColor: Colors.card.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.card.border,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    position: "relative" as const,
    minHeight: 44,
  },
  entryButtonHover: {
    borderColor: Colors.primary.greenLight,
  },
  entryButtonFocus: {
    borderColor: Colors.primary.green,
    shadowColor: Colors.primary.green,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  entryButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  envIcon: {
    position: "absolute" as const,
    top: 8,
    start: 8,
  },
  entryEmoji: {
    fontSize: 36,
  },
  entryLabel: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15,
    color: Colors.text.primary,
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginBottom: 16,
    paddingVertical: 4,
    minHeight: 44,
  },
  backText: {
    minHeight: 44,
    fontFamily: "Cairo_600SemiBold",
  callButtonHover: {
    opacity: 0.96,
  },
  callButtonFocus: {
    shadowColor: Colors.status.danger,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
    fontSize: 14,
    color: Colors.primary.green,
  },
  emergencyHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  emergencyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emergencyTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 24,
    color: Colors.text.primary,
  },
  emergencySubtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  stepCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  stepCardFirst: {
    backgroundColor: Colors.primary.green,
    borderColor: Colors.primary.green,
  },
  stepNumber: {
    fontFamily: "Cairo_700Bold",
    fontSize: 22,
    color: Colors.text.tertiary,
    width: 32,
    textAlign: "center",
  },
  stepNumberFirst: {
    color: "#FFFFFF",
  },
  stepText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
    textAlign: "right",
    writingDirection: "rtl" as const,
    lineHeight: 22,
  },
  stepTextFirst: {
    color: "#FFFFFF",
    fontFamily: "Cairo_600SemiBold",
  },
  callButton: {
    backgroundColor: Colors.status.danger,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },
  callButtonText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
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
