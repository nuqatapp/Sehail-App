import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Linking,
  I18nManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import PressableSurface from "@/components/PressableSurface";

const SAVED_POINTS_KEY = "sehail_saved_points";

interface SavedPoint {
  name: string;
  lat: number;
  lng: number;
  time: string;
}

function toArabicNum(n: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).replace(/\d/g, (d) => arabicDigits[parseInt(d)]);
}

function getCardinalDirection(degree: number): string {
  if (degree >= 337.5 || degree < 22.5) return "شمال";
  if (degree >= 22.5 && degree < 67.5) return "شمال شرق";
  if (degree >= 67.5 && degree < 112.5) return "شرق";
  if (degree >= 112.5 && degree < 157.5) return "جنوب شرق";
  if (degree >= 157.5 && degree < 202.5) return "جنوب";
  if (degree >= 202.5 && degree < 247.5) return "جنوب غرب";
  if (degree >= 247.5 && degree < 292.5) return "غرب";
  if (degree >= 292.5 && degree < 337.5) return "شمال غرب";
  return "شمال";
}

function CompassRose({ heading }: { heading: number }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(-heading, { damping: 20, stiffness: 90 });
  }, [heading]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={compassStyles.compassContainer}>
      <View style={compassStyles.compassOuter}>
        <Animated.View style={[compassStyles.compassInner, animatedStyle]}>
          <View style={compassStyles.northMarker}>
            <Text style={compassStyles.northText}>N</Text>
          </View>
          <View style={compassStyles.southMarker}>
            <Text style={compassStyles.cardinalText}>S</Text>
          </View>
          <View style={compassStyles.eastMarker}>
            <Text style={compassStyles.cardinalText}>E</Text>
          </View>
          <View style={compassStyles.westMarker}>
            <Text style={compassStyles.cardinalText}>W</Text>
          </View>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
            (deg) => (
              <View
                key={deg}
                style={[
                  compassStyles.tick,
                  {
                    transform: [
                      { rotate: `${deg}deg` },
                      { translateY: -95 },
                    ],
                  },
                  deg % 90 === 0 && compassStyles.tickMajor,
                ]}
              />
            )
          )}
        </Animated.View>
        <View style={compassStyles.centerDot} />
        <View style={compassStyles.needleContainer}>
          <View style={compassStyles.needleNorth} />
          <View style={compassStyles.needleSouth} />
        </View>
      </View>
    </View>
  );
}

const compassStyles = StyleSheet.create({
  compassContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  compassOuter: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.card.background,
    borderWidth: 3,
    borderColor: Colors.primary.green,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  compassInner: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  northMarker: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
  },
  northText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
    color: Colors.status.danger,
  },
  southMarker: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
  },
  eastMarker: {
    position: "absolute",
    end: 8,
    alignSelf: "center",
  },
  westMarker: {
    position: "absolute",
    start: 8,
    alignSelf: "center",
  },
  cardinalText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
    color: Colors.text.secondary,
  },
  tick: {
    position: "absolute",
    width: 2,
    height: 8,
    backgroundColor: Colors.text.tertiary,
    borderRadius: 1,
  },
  tickMajor: {
    height: 12,
    width: 3,
    backgroundColor: Colors.primary.green,
  },
  centerDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary.green,
    zIndex: 2,
  },
  needleContainer: {
    position: "absolute",
    width: 4,
    height: 120,
    alignItems: "center",
    zIndex: 1,
  },
  needleNorth: {
    width: 4,
    height: 60,
    backgroundColor: Colors.status.danger,
    borderTopStartRadius: 4,
    borderTopEndRadius: 4,
  },
  needleSouth: {
    width: 4,
    height: 60,
    backgroundColor: Colors.text.tertiary,
    borderBottomStartRadius: 4,
    borderBottomEndRadius: 4,
  },
});

export default function CompassScreen() {
  const insets = useSafeAreaInsets();
  const [heading, setHeading] = useState(0);
  const [compassAvailable, setCompassAvailable] = useState(false);
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();
  const [savedPoints, setSavedPoints] = useState<SavedPoint[]>([]);
  const [savingLocation, setSavingLocation] = useState(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    loadSavedPoints();

    if (Platform.OS !== "web") {
      startCompass();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  const startCompass = async () => {
    try {
      const { Magnetometer } = await import("expo-sensors");
      const isAvailable = await Magnetometer.isAvailableAsync();
      if (!isAvailable) {
        setCompassAvailable(false);
        return;
      }
      setCompassAvailable(true);
      Magnetometer.setUpdateInterval(100);
      subscriptionRef.current = Magnetometer.addListener((data) => {
        const { x, y } = data;
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle = angle >= 0 ? angle : angle + 360;
        angle = (360 - angle + 90) % 360;
        setHeading(Math.round(angle));
      });
    } catch {
      setCompassAvailable(false);
    }
  };

  const loadSavedPoints = async () => {
    try {
      const val = await AsyncStorage.getItem(SAVED_POINTS_KEY);
      if (val) {
        setSavedPoints(JSON.parse(val));
      }
    } catch {}
  };

  const saveCurrentLocation = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (!locationPermission?.granted) {
      const result = await requestLocationPermission();
      if (!result.granted) {
        if (!result.canAskAgain && Platform.OS !== "web") {
          Alert.alert(
            "صلاحية الموقع مطلوبة",
            "فعّل صلاحية الموقع من إعدادات الجهاز",
            [
              { text: "إلغاء", style: "cancel" },
              { text: "فتح الإعدادات", onPress: () => Linking.openSettings() },
            ]
          );
        }
        return;
      }
    }

    setSavingLocation(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const newPoint: SavedPoint = {
        name: `نقطة ${savedPoints.length + 1}`,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        time: new Date().toLocaleString("ar-SA"),
      };
      const updated = [newPoint, ...savedPoints];
      setSavedPoints(updated);
      await AsyncStorage.setItem(SAVED_POINTS_KEY, JSON.stringify(updated));
    } catch {
      Alert.alert("خطأ", "ما قدرنا نحدد موقعك. تأكد من تشغيل GPS");
    } finally {
      setSavingLocation(false);
    }
  };

  const deletePoint = async (index: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const updated = savedPoints.filter((_, i) => i !== index);
    setSavedPoints(updated);
    await AsyncStorage.setItem(SAVED_POINTS_KEY, JSON.stringify(updated));
  };

  const openInMaps = (point: SavedPoint) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const url =
      Platform.OS === "ios"
        ? `maps:?daddr=${point.lat},${point.lng}`
        : `geo:${point.lat},${point.lng}?q=${point.lat},${point.lng}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`
      );
    });
  };

  const isWeb = Platform.OS === "web";

  return (
    <View {...(Platform.OS === "web" ? { dir: I18nManager.isRTL ? "rtl" : "ltr" } : {})} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="compass-outline"
              size={22}
              color={Colors.primary.green}
            />
            <Text style={styles.cardTitle}>البوصلة</Text>
          </View>

          {isWeb ? (
            <View style={styles.webFallback}>
              <Ionicons
                name="phone-portrait-outline"
                size={48}
                color={Colors.text.tertiary}
              />
              <Text style={styles.webFallbackText}>
                البوصلة تعمل على الجوال فقط
              </Text>
            </View>
          ) : compassAvailable ? (
            <View style={styles.compassSection}>
              <CompassRose heading={heading} />
              <Text style={styles.headingDegree}>
                {toArabicNum(heading)}°
              </Text>
              <Text style={styles.headingDirection}>
                {getCardinalDirection(heading)}
              </Text>
            </View>
          ) : (
            <View style={styles.webFallback}>
              <Ionicons
                name="compass-outline"
                size={48}
                color={Colors.text.tertiary}
              />
              <Text style={styles.webFallbackText}>
                البوصلة غير متوفرة على هذا الجهاز
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="location-outline"
              size={22}
              color={Colors.primary.green}
            />
            <Text style={styles.cardTitle}>نقاط الانطلاق</Text>
          </View>

          <PressableSurface
            accessibilityRole="button"
            accessibilityLabel="حفظ الموقع الحالي"
            accessibilityState={{ busy: savingLocation, disabled: savingLocation }}
            hitSlop={10}
            baseStyle={[styles.saveButton, savingLocation && { opacity: 0.5 }]}
            pressedStyle={{ opacity: 0.7 }}
            onPress={saveCurrentLocation}
            disabled={savingLocation}
          >
            <Text style={styles.saveButtonText}>
              {savingLocation ? "جاري التحديد..." : "سجّل مكاني"}
            </Text>
            <Ionicons
              name="location-outline"
              size={18}
              color={Colors.text.white}
            />
          </Pressable>

          {!locationPermission?.granted && (
            <Text style={styles.permissionHint}>
              سيُطلب منك إذن الوصول للموقع عند الضغط
            </Text>
          )}

          {savedPoints.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="flag-outline"
                size={32}
                color={Colors.text.tertiary}
              />
              <Text style={styles.emptyText}>ما فيه نقاط محفوظة</Text>
            </View>
          ) : (
            <View style={styles.pointsList}>
              {savedPoints.map((point, index) => (
                <Animated.View
                  key={`${point.lat}-${point.lng}-${point.time}`}
                  entering={FadeInDown.delay(index * 80).duration(400)}
                  style={styles.pointCard}
                >
                  <View style={styles.pointInfo}>
                    <Text style={styles.pointName}>{point.name}</Text>
                    <Text style={styles.pointCoords}>
                      {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                    </Text>
                    <Text style={styles.pointTime}>{point.time}</Text>
                  </View>
                  <View style={styles.pointActions}>
                    <PressableSurface
                      onPress={() => openInMaps(point)}
                      baseStyle={styles.pointActionBtn}
                      pressedStyle={{ opacity: 0.6 }}
                    >
                      <Ionicons
                        name="navigate-outline"
                        size={20}
                        color={Colors.primary.green}
                      />
                    </PressableSurface>
                    <PressableSurface
                      onPress={() => deletePoint(index)}
                      accessibilityRole="button"
                      accessibilityLabel={`حذف ${point.name}`}
                      hitSlop={10}
                      baseStyle={styles.pointActionBtn}
                      pressedStyle={{ opacity: 0.6 }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={Colors.status.danger}
                      />
                    </PressableSurface>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
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
  card: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
    color: Colors.text.primary,
  },
  compassSection: {
    alignItems: "center",
  },
  headingDegree: {
    fontFamily: "Cairo_700Bold",
    fontSize: 36,
    color: Colors.primary.green,
    marginTop: 8,
  },
  headingDirection: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 18,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  webFallback: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  webFallbackText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 15,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: Colors.primary.green,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    minHeight: 44,
  },
  saveButtonText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    color: Colors.text.white,
  },
  permissionHint: {
    fontFamily: "Cairo_400Regular",
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 8,
  },
  emptyText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.tertiary,
  },
  pointsList: {
    gap: 10,
  },
  pointCard: {
    backgroundColor: Colors.bg.primary,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pointInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  pointName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl" as const,
  },
  pointCoords: {
    fontFamily: "Cairo_400Regular",
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  pointTime: {
    fontFamily: "Cairo_400Regular",
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  pointActions: {
    flexDirection: "row",
    gap: 8,
    marginStart: 12,
  },
  pointActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.card.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
});
