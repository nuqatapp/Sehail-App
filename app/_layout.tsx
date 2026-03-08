import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback } from "react";
import { I18nManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { useFonts, Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold } from "@expo-google-fonts/cairo";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import AppSplash from "@/components/AppSplash";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "رجوع", headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="prep-gear"
        options={{
          headerShown: true,
          headerTitle: "إحتياجات الرحلة",
          headerStyle: { backgroundColor: Colors.primary.green },
          headerTintColor: Colors.primary.gold,
          headerTitleStyle: { fontFamily: "Cairo_700Bold" },
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="star-guide"
        options={{
          headerShown: true,
          headerTitle: "دليل الملاحة",
          headerStyle: { backgroundColor: Colors.primary.green },
          headerTintColor: Colors.primary.gold,
          headerTitleStyle: { fontFamily: "Cairo_700Bold" },
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="guide-detail"
        options={{
          headerShown: true,
          headerTitle: "التفاصيل",
          headerStyle: { backgroundColor: Colors.primary.green },
          headerTintColor: Colors.primary.gold,
          headerTitleStyle: { fontFamily: "Cairo_700Bold" },
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="first-five"
        options={{
          headerShown: true,
          headerTitle: "أول ٥ دقائق",
          headerStyle: { backgroundColor: Colors.primary.green },
          headerTintColor: Colors.primary.gold,
          headerTitleStyle: { fontFamily: "Cairo_700Bold" },
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="quick-id"
        options={{
          headerShown: true,
          headerTitle: "تعرّف بسرعة",
          headerStyle: { backgroundColor: Colors.primary.green },
          headerTintColor: Colors.primary.gold,
          headerTitleStyle: { fontFamily: "Cairo_700Bold" },
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          headerTitle: "الإعدادات",
          headerStyle: { backgroundColor: Colors.primary.green },
          headerTintColor: Colors.primary.gold,
          headerTitleStyle: { fontFamily: "Cairo_700Bold" },
          presentation: "card",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <StatusBar style="dark" />
            <RootLayoutNav />
            {showSplash && <AppSplash onFinish={handleSplashFinish} />}
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
