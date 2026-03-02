import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import Colors from "@/constants/colors";

const logo = require("@/assets/images/sehail-logo.png");

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [dailyTips, setDailyTips] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem("sehail_settings");
      if (stored) {
        const settings = JSON.parse(stored);
        setWeatherAlerts(settings.weatherAlerts ?? true);
        setDailyTips(settings.dailyTips ?? true);
      }
    } catch {}
  };

  const saveSettings = async (key: string, value: boolean) => {
    try {
      const stored = await AsyncStorage.getItem("sehail_settings");
      const settings = stored ? JSON.parse(stored) : {};
      settings[key] = value;
      await AsyncStorage.setItem("sehail_settings", JSON.stringify(settings));
    } catch {}
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Image source={logo} style={styles.logo} contentFit="contain" />
          </View>
          <Text style={styles.appName}>سِهيل</Text>
          <Text style={styles.tagline}>إذا طلع سِهيل لا تأمن السيل</Text>
          <Text style={styles.version}>النسخة 1.0.0</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>التنبيهات</Text>
          <View style={styles.settingRow}>
            <Switch
              value={weatherAlerts}
              onValueChange={(val) => {
                setWeatherAlerts(val);
                saveSettings("weatherAlerts", val);
              }}
              trackColor={{ false: "#DDD", true: Colors.primary.green }}
              thumbColor="#fff"
            />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>تنبيهات الطقس</Text>
              <Text style={styles.settingDesc}>عرض تنبيهات النباهة في الرئيسية</Text>
            </View>
            <Ionicons name="cloudy-outline" size={22} color={Colors.primary.green} />
          </View>

          <View style={styles.settingRow}>
            <Switch
              value={dailyTips}
              onValueChange={(val) => {
                setDailyTips(val);
                saveSettings("dailyTips", val);
              }}
              trackColor={{ false: "#DDD", true: Colors.primary.green }}
              thumbColor="#fff"
            />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>نصيحة اليوم</Text>
              <Text style={styles.settingDesc}>عرض نصيحة سِهيل اليومية</Text>
            </View>
            <Ionicons name="sparkles-outline" size={22} color={Colors.primary.gold} />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>عن التطبيق</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              سِهيل تطبيق سعودي للمهتمين بالطلعات البرية والهايكنج والكشتات.
              يقدم معرفة وتجهيز وليس إنقاذ مباشر. محتواه مبني على مصادر رسمية
              سعودية.
            </Text>
            <View style={styles.aboutDivider} />
            <Text style={styles.aboutNote}>
              جميع المعلومات استرشادية. في حالة الطوارئ اتصل بالجهات الرسمية.
            </Text>
          </View>
        </View>
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
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logo: {
    width: 56,
    height: 56,
  },
  appName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 28,
    color: Colors.primary.green,
  },
  tagline: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  version: {
    fontFamily: "Cairo_400Regular",
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 8,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 12,
  },
  settingRow: {
    backgroundColor: Colors.card.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  settingTextContainer: {
    flex: 1,
    alignItems: "flex-end",
    marginHorizontal: 12,
  },
  settingTitle: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 15,
    color: Colors.text.primary,
  },
  settingDesc: {
    fontFamily: "Cairo_400Regular",
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  aboutCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  aboutText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 24,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: Colors.card.border,
    marginVertical: 14,
  },
  aboutNote: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    color: Colors.text.tertiary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 20,
  },
});
