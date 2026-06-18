import React from "react";
import { Platform, ScrollView, ScrollViewProps } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";

/**
 * Props for the keyboard-aware scroll view compatibility wrapper.
 */
export interface KeyboardAwareScrollViewCompatProps
  extends KeyboardAwareScrollViewProps,
    ScrollViewProps {
  /** Bidi direction forwarded to web rendering. */
  dir?: "ltr" | "rtl";
}

/**
 * Cross-platform scroll container with consistent keyboard handling.
 */
export function KeyboardAwareScrollViewCompat({
  children,
  keyboardShouldPersistTaps = "handled",
  dir,
  ...props
}: KeyboardAwareScrollViewCompatProps) {
  if (Platform.OS === "web") {
    return (
      <ScrollView
        {...(dir ? { dir } : {})}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <KeyboardAwareScrollView
      {...(dir ? { dir } : {})}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
