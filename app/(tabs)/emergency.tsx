import React from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";

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
          <Text style={styles.screenTitle}>{emergency.title}</Text>
          <Text style={styles.screenSubtitle}>{emergency.subtitle}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.disclaimer}>
            هذه الأرقام رسمية من الجهات الحكومية السعودية. التطبيق يسهّل الوصول
            لها فقط ولا يقدم خدمة إنقاذ مباشرة.
          </Text>
        </Animated.View>

        {emergency.contacts.map((contact, index) => (
          <Animated.View
            key={contact.id}
            entering={FadeInDown.delay(150 + index * 80).duration(400)}
          >
            <Pressable
              style={({ pressed }) => [
                styles.contactCard,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
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
            </Pressable>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <Pressable
            style={({ pressed }) => [
              styles.shareLocationBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              shareLocation();
            }}
          >
            <Ionicons name="location" size={24} color={Colors.text.primary} />
            <View style={styles.shareLocationTextContainer}>
              <Text style={styles.shareLocationTitle}>شارك موقعي</Text>
              <Text style={styles.shareLocationDesc}>
                يرسل رابط خرائط بإحداثياتك عبر رسالة SMS
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).duration(500)}>
          <View style={styles.disclaimerBox}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={Colors.text.tertiary}
            />
            <Text style={styles.disclaimerBoxText}>
              سِهيل تطبيق تعليمي واستعدادي. في حالة الطوارئ الحقيقية اتصل
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
  },
  contactInfo: {
    flex: 1,
    alignItems: "flex-end",
    marginLeft: 16,
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
    backgroundColor: "rgba(39, 174, 96, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
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
  },
  shareLocationTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  shareLocationTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 17,
    color: Colors.text.primary,
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
