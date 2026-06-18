import React, { useRef, useState } from "react";
import {
  I18nManager,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ArabicLineHeight,
  ColorTokens,
  FontFamily,
  FontSize,
  MinTouchTarget,
  Radius,
  Space,
} from "@/constants/designTokens";

/** Props for the TextInput form field. */
export interface TextInputProps
  extends Omit<RNTextInputProps, "onChange" | "onChangeText" | "style"> {
  /** Visible field label rendered above the input. */
  label?: string;
  /** The controlled input value. */
  value: string;
  /** Called every time the text changes. */
  onChange: (value: string) => void;
  /** Hint text shown when the field is empty. */
  placeholder?: string;
  /** When true, the field is non-interactive and visually muted. */
  disabled?: boolean;
  /** Validation error string. When present the field shows error styling. */
  error?: string;
  /** Appends a required-field marker (*) to the label. */
  required?: boolean;
  /** Bidi direction for web rendering. Defaults to the device locale. */
  dir?: "ltr" | "rtl";
  /** Optional test identifier for automation. */
  testID?: string;
}

/**
 * Accessible form text field with label, clear button, error state,
 * focus ring, and RTL support. Touch target is at least 44px.
 */
export default function TextInput({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  required = false,
  dir = I18nManager.isRTL ? "rtl" : "ltr",
  testID,
  ...nativeProps
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<RNTextInput>(null);
  const isRtl = dir === "rtl";
  const hasError = Boolean(error);

  // Unique IDs for associating label → input and error → input on web
  const inputId = useRef(
    `input-${Math.random().toString(36).slice(2, 8)}`
  ).current;
  const errorId = hasError ? `${inputId}-error` : undefined;

  const borderColor = hasError
    ? ColorTokens.status.danger
    : isFocused
    ? ColorTokens.border.focus
    : ColorTokens.border.default;

  const containerBackground = hasError
    ? ColorTokens.status.dangerSurface
    : isFocused
    ? ColorTokens.surface.subtle
    : disabled
    ? ColorTokens.surface.muted
    : ColorTokens.surface.default;

  return (
    <View
      style={styles.wrapper}
      testID={testID}
      {...(Platform.OS === "web" ? { dir } : {})}
    >
      {/* Label row */}
      {label != null && (
        <Pressable
          style={[styles.labelRow, isRtl ? styles.rowRtl : styles.rowLtr]}
          onPress={() => inputRef.current?.focus()}
          accessibilityRole="none"
        >
          <Text
            style={[styles.label, isRtl ? styles.textRtl : styles.textLtr]}
            nativeID={inputId}
          >
            {label}
            {required && <Text style={styles.requiredMark}> *</Text>}
          </Text>
        </Pressable>
      )}

      {/* Input row */}
      <View
        style={[
          styles.inputContainer,
          isRtl ? styles.rowRtl : styles.rowLtr,
          { borderColor, backgroundColor: containerBackground },
          isFocused && styles.inputContainerFocused,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        <RNTextInput
          ref={inputRef}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={ColorTokens.text.tertiary}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            isRtl ? styles.inputRtl : styles.inputLtr,
            disabled && styles.inputDisabledText,
          ]}
          textAlign={isRtl ? "right" : "left"}
          accessibilityLabel={label}
          accessibilityState={{ disabled }}
          {...(Platform.OS === "web"
            ? {
                id: inputId,
                "aria-labelledby": inputId,
                "aria-required": required,
                "aria-invalid": hasError,
                "aria-describedby": errorId,
              }
            : {})}
          {...nativeProps}
        />

        {/* Clear button — shown when field has content and is not disabled */}
        {value.length > 0 && !disabled && (
          <Pressable
            onPress={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            style={styles.clearBtn}
            accessibilityRole="button"
            accessibilityLabel="مسح النص"
            hitSlop={8}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={ColorTokens.text.tertiary}
            />
          </Pressable>
        )}
      </View>

      {/* Error message */}
      {hasError && (
        <View style={[styles.errorRow, isRtl ? styles.rowRtl : styles.rowLtr]}>
          <Ionicons
            name="alert-circle-outline"
            size={14}
            color={ColorTokens.status.danger}
          />
          <Text
            style={[styles.errorText, isRtl ? styles.textRtl : styles.textLtr]}
            nativeID={errorId}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Space.xs,
  },
  labelRow: {
    alignItems: "center",
  },
  rowLtr: { flexDirection: "row" },
  rowRtl: { flexDirection: "row-reverse" },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: ColorTokens.text.secondary,
    lineHeight: ArabicLineHeight.sm,
  },
  requiredMark: {
    color: ColorTokens.status.danger,
    fontFamily: FontFamily.bold,
  },
  textLtr: { textAlign: "left" },
  textRtl: { textAlign: "right", writingDirection: "rtl" },
  inputContainer: {
    alignItems: "center",
    minHeight: MinTouchTarget,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Space.md,
    gap: Space.xs,
    transition: "border-color 0.15s ease",
  } as any,
  inputContainerFocused: {
    // Shadow tint on focus for extra visibility
    shadowColor: ColorTokens.brand.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 0,
  },
  inputContainerDisabled: {
    borderColor: ColorTokens.border.subtle,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: ColorTokens.text.primary,
    lineHeight: ArabicLineHeight.base,
    paddingVertical: Space.sm,
    minHeight: MinTouchTarget - 4,
  },
  inputLtr: { textAlign: "left" },
  inputRtl: { textAlign: "right" },
  inputDisabledText: {
    color: ColorTokens.text.disabled,
  },
  clearBtn: {
    justifyContent: "center",
    alignItems: "center",
    padding: Space.xs,
  },
  errorRow: {
    alignItems: "center",
    gap: Space.xs,
  },
  errorText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: ColorTokens.status.danger,
    lineHeight: ArabicLineHeight.xs,
  },
});
