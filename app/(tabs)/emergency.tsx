import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  Platform,
  Share,
  I18nManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import * as Clipboard from "expo-clipboard";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";
import PressableSurface from "@/components/PressableSurface";
import PressableSurface from "@/components/PressableSurface";
import LogoHeader from "@/components/LogoHeader";

const emergency = wisdomData.categories.emergency;

async function shareLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("تنبيه", "يجب السماح بالوصول للموقع لمشاركته");
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = location.coords;
    const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    const message = `موقعي الحالي:\n${mapsUrl}\n\nالإحداثيات: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    if (Platform.OS === "web") {
      await Share.share({ message });
    } else {
      const smsUrl = Platform.OS === "ios"
        ? `sms:&body=${encodeURIComponent(message)}`
        : `sms:?body=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        await Share.share({ message });
      }
    }
  } catch (error) {
    Alert.alert("خطأ", "تعذر الحصول على الموقع. تأكد من تفعيل GPS");
  }
}

export default function EmergencyScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const copyTemplate = async () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(emergency.messageTemplate.template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (id: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSection(expandedSection === id ? null : id);
  };

  let animDelay = 100;

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

        <Animated.View entering={FadeInDown.delay(animDelay).duration(400)}>
          <Text style={styles.screenTitle}>{emergency.title}</Text>
          <Text style={styles.screenSubtitle}>{emergency.subtitle}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay((animDelay += 50)).duration(500)}>
          <Text style={styles.disclaimer}>
            هذه الأرقام رسمية من الجهات الحكومية السعودية. التطبيق يسهّل الوصول
            لها فقط ولا يقدم خدمة إنقاذ مباشرة.
          </Text>
        </Animated.View>

        {emergency.contacts.map((contact, index) => (
          <Animated.View
            key={contact.id}
            entering={FadeInDown.delay((animDelay += 60)).duration(400)}
          >
            <PressableSurface
              accessibilityRole="button"
              accessibilityLabel={`اتصل على ${contact.name}، ${contact.number}`}
              hitSlop={10}
              baseStyle={styles.contactCard}
              pressedStyle={{ opacity: 0.8, transform: [{ scale: 0.98 }] }}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Linking.openURL(`tel:${contact.number}`);
                } else {
                  Alert.alert(contact.name, `اتصل على: ${contact.number}`);
                }
              }}
            >
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactDesc}>{contact.description}</Text>
              </View>
              <View style={styles.contactNumberContainer}>
                <Ionicons name="call" size={18} color={Colors.status.success} />
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
            </PressableSurface>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay((animDelay += 80)).duration(500)}>
          <PressableSurface
            accessibilityRole="button"
            accessibilityLabel="شارك موقعي الحالي"
            hitSlop={10}
            baseStyle={styles.shareLocationBtn}
            pressedStyle={{ opacity: 0.85, transform: [{ scale: 0.98 }] }}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              shareLocation();
            }}
          >
            <Ionicons name="location" size={24} color="#FFFFFF" />
            <View style={styles.shareLocationTextContainer}>
              <Text style={styles.shareLocationTitle}>شارك موقعي</Text>
              <Text style={styles.shareLocationDesc}>
                يرسل رابط خرائط بإحداثياتك عبر رسالة SMS
              </Text>
            </View>
          </PressableSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay((animDelay += 80)).duration(500)}>
          <View style={styles.templateCard}>
            <View style={styles.templateHeader}>
              <PressableSurface onPress={copyTemplate} accessibilityRole="button" accessibilityLabel={copied ? "تم نسخ رسالة الطوارئ" : "انسخ رسالة الطوارئ"} hitSlop={10} baseStyle={styles.copyButton}>
                <Ionicons name={copied ? "checkmark-circle" : "copy-outline"} size={20} color={copied ? Colors.status.success : Colors.primary.green} />
                <Text style={[styles.copyText, copied && { color: Colors.status.success }]}>{copied ? "تم النسخ" : "انسخ"}</Text>
              </PressableSurface>
              <View style={styles.templateTitleRow}>
                <Ionicons name="document-text-outline" size={18} color={Colors.primary.green} />
                <Text style={styles.templateTitle}>{emergency.messageTemplate.title}</Text>
              </View>
            </View>
            <Text style={styles.templateSubtitle}>{emergency.messageTemplate.subtitle}</Text>
            <View style={styles.templateBody}>
              <Text style={styles.templateText}>{emergency.messageTemplate.template}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay((animDelay += 80)).duration(500)}>
          <PressableSurface
            baseStyle={styles.expandableCard}
            onPress={() => toggleSection("locationGuide")}
            accessibilityRole="button"
            accessibilityLabel="عرض أو إخفاء دليل تحديد الموقع"
            accessibilityState={{ expanded: expandedSection === "locationGuide" }}
          >
            <View style={styles.expandableHeader}>
              <Ionicons name={expandedSection === "locationGuide" ? "chevron-up" : "chevron-down"} size={18} color={Colors.text.tertiary} />
              <View style={styles.expandableTitleRow}>
                <Ionicons name="navigate-outline" size={18} color={Colors.primary.green} />
                <Text style={styles.expandableTitle}>{emergency.locationGuide.title}</Text>
              </View>
            </View>
            <Text style={styles.expandableSubtitle}>{emergency.locationGuide.subtitle}</Text>

            {expandedSection === "locationGuide" && (
              <View style={styles.expandableContent}>
                {emergency.locationGuide.steps.map((step) => (
                  <View key={step.id} style={styles.stepCard}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepText}>{step.steps}</Text>
                  </View>
                ))}
                <View style={styles.tipBox}>
                  <Ionicons name="alert-circle" size={16} color={Colors.status.warning} />
                  <Text style={styles.tipText}>{emergency.locationGuide.tip}</Text>
                </View>
              </View>
            )}
          </PressableSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay((animDelay += 80)).duration(500)}>
          <PressableSurface
            baseStyle={styles.expandableCard}
            onPress={() => toggleSection("reporting")}
            accessibilityRole="button"
            accessibilityLabel="عرض أو إخفاء دليل الإبلاغ"
            accessibilityState={{ expanded: expandedSection === "reporting" }}
          >
            <View style={styles.expandableHeader}>
              <Ionicons name={expandedSection === "reporting" ? "chevron-up" : "chevron-down"} size={18} color={Colors.text.tertiary} />
              <View style={styles.expandableTitleRow}>
                <Ionicons name="megaphone-outline" size={18} color={Colors.primary.green} />
                <Text style={styles.expandableTitle}>{emergency.reportingGuide.title}</Text>
              </View>
            </View>
            <Text style={styles.expandableSubtitle}>{emergency.reportingGuide.subtitle}</Text>

            {expandedSection === "reporting" && (
              <View style={styles.expandableContent}>
                {emergency.reportingGuide.items.map((item, idx) => (
                  <View key={idx} style={styles.reportItem}>
                    <Text style={styles.reportNumber}>{idx + 1}</Text>
                    <Text style={styles.reportText}>{item}</Text>
                  </View>
                ))}
                <View style={styles.tipBox}>
                  <Ionicons name="bulb-outline" size={16} color={Colors.primary.gold} />
                  <Text style={styles.tipText}>{emergency.reportingGuide.tip}</Text>
                </View>
              </View>
            )}
          </PressableSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay((animDelay += 80)).duration(500)}>
          <PressableSurface
            baseStyle={styles.expandableCard}
            onPress={() => toggleSection("battery")}
            accessibilityRole="button"
            accessibilityLabel="عرض أو إخفاء إدارة البطارية"
            accessibilityState={{ expanded: expandedSection === "battery" }}
          >
            <View style={styles.expandableHeader}>
              <Ionicons name={expandedSection === "battery" ? "chevron-up" : "chevron-down"} size={18} color={Colors.text.tertiary} />
              <View style={styles.expandableTitleRow}>
                <Ionicons name="battery-half-outline" size={18} color={Colors.primary.green} />
                <Text style={styles.expandableTitle}>{emergency.batteryManagement.title}</Text>
              </View>
            </View>
            <Text style={styles.expandableSubtitle}>{emergency.batteryManagement.subtitle}</Text>

            {expandedSection === "battery" && (
              <View style={styles.expandableContent}>
                <Text style={styles.contentText}>{emergency.batteryManagement.content}</Text>
              </View>
            )}
          </PressableSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay((animDelay += 80)).duration(500)}>
          <PressableSurface
            baseStyle={[styles.expandableCard, styles.seaCard]}
            onPress={() => toggleSection("seaEmergency")}
            accessibilityRole="button"
            accessibilityLabel="عرض أو إخفاء الطوارئ البحرية"
            accessibilityState={{ expanded: expandedSection === "seaEmergency" }}
          >
            <View style={styles.expandableHeader}>
              <Ionicons name={expandedSection === "seaEmergency" ? "chevron-up" : "chevron-down"} size={18} color={Colors.text.tertiary} />
              <View style={styles.expandableTitleRow}>
                <Ionicons name="water-outline" size={16} color={Colors.text.tertiary} />
                <Ionicons name="boat-outline" size={18} color={Colors.primary.green} />
                <Text style={styles.expandableTitle}>{emergency.seaEmergency.title}</Text>
              </View>
            </View>
            <Text style={styles.expandableSubtitle}>{emergency.seaEmergency.subtitle}</Text>

            {expandedSection === "seaEmergency" && (
              <View style={styles.expandableContent}>
                <Text style={styles.contentText}>{emergency.seaEmergency.content}</Text>
                <View style={styles.vhfBox}>
                  <Ionicons name="radio-outline" size={16} color={Colors.primary.green} />
                  <Text style={styles.vhfText}>{emergency.seaEmergency.vhfGuide}</Text>
                </View>
                <View style={styles.tipBox}>
                  <Ionicons name="alert-circle" size={16} color={Colors.status.warning} />
                  <Text style={styles.tipText}>{emergency.seaEmergency.tip}</Text>
                </View>
              </View>
            )}
          </PressableSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay((animDelay += 80)).duration(500)}>
          <View style={styles.disclaimerBox}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={Colors.text.tertiary}
            />
            <Text style={styles.disclaimerBoxText}>
              سهيل تطبيق تعليمي واستعدادي. في حالة الطوارئ الحقيقية اتصل
              بالجهات الرسمية مباشرة.
            </Text>
          </View>
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
    marginBottom: 12,
  },
  disclaimer: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    color: Colors.text.tertiary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 20,
    marginBottom: 20,
  },
  contactCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.card.border,
    minHeight: 44,
  },
  contactInfo: {
    flex: 1,
    alignItems: "flex-end",
    marginStart: 16,
  },
  contactName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },
  contactDesc: {
    fontFamily: "Cairo_400Regular",
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "right",
    writingDirection: "rtl",
    marginTop: 2,
  },
  contactNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(39, 174, 96, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minHeight: 44,
  },
  contactNumber: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
    color: Colors.status.success,
  },
  shareLocationBtn: {
    backgroundColor: Colors.status.danger,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 14,
    marginTop: 10,
    marginBottom: 16,
    minHeight: 44,
  },
  shareLocationTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  shareLocationTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 17,
    color: "#FFFFFF",
    textAlign: "right",
    writingDirection: "rtl",
  },
  shareLocationDesc: {
    fontFamily: "Cairo_400Regular",
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "right",
    writingDirection: "rtl",
    marginTop: 2,
  },
  templateCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  templateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  templateTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  templateTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    color: Colors.text.primary,
  },
  templateSubtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 108, 53, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    minHeight: 44,
    minWidth: 44,
  },
  copyText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 12,
    color: Colors.primary.green,
  },
  templateBody: {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 12,
    padding: 14,
  },
  templateText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 24,
  },
  expandableCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.card.border,
    minHeight: 44,
  },
  seaCard: {
    borderColor: "rgba(52, 152, 219, 0.2)",
  },
  expandableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandableTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  expandableTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    color: Colors.text.primary,
  },
  expandableSubtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "right",
    writingDirection: "rtl",
    marginTop: 4,
  },
  expandableContent: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.card.border,
  },
  stepCard: {
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  stepTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 6,
  },
  stepText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 22,
  },
  reportItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 10,
  },
  reportNumber: {
    fontFamily: "Cairo_700Bold",
    fontSize: 14,
    color: Colors.primary.green,
    width: 22,
    height: 22,
    textAlign: "center",
    lineHeight: 22,
    backgroundColor: "rgba(0, 108, 53, 0.08)",
    borderRadius: 11,
    overflow: "hidden",
  },
  reportText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    flex: 1,
    lineHeight: 22,
  },
  contentText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 24,
  },
  vhfBox: {
    backgroundColor: "rgba(0, 108, 53, 0.05)",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 108, 53, 0.1)",
  },
  vhfText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    flex: 1,
    lineHeight: 22,
  },
  tipBox: {
    backgroundColor: "rgba(243, 156, 18, 0.06)",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(243, 156, 18, 0.12)",
  },
  tipText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
    flex: 1,
    lineHeight: 22,
  },
  disclaimerBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    justifyContent: "flex-end",
    paddingVertical: 12,
  },
  disclaimerBoxText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: "right",
    writingDirection: "rtl",
    flex: 1,
    lineHeight: 20,
  },
});
