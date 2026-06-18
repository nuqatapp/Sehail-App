import React, { useRef, useState } from "react";
import {
  I18nManager,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PressableSurface from "@/components/PressableSurface";
import {
  ColorTokens,
  Elevation,
  FontFamily,
  FontSize,
  MinTouchTarget,
  Radius,
  Space,
  ZIndex,
} from "@/constants/designTokens";

/** A single selectable item in the dropdown. */
export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/** Props for the Dropdown (Select) component. */
export interface DropdownProps {
  /** The list of options to display. */
  options: DropdownOption[];
  /** The currently selected value, or undefined for no selection. */
  selectedValue?: string;
  /** Called when the user picks an option. */
  onSelect: (value: string) => void;
  /** Placeholder shown when no value is selected. */
  placeholder?: string;
  /** When true, the trigger is non-interactive and visually muted. */
  disabled?: boolean;
  /** Bidi direction for web rendering. Defaults to the device locale. */
  dir?: "ltr" | "rtl";
  /** Accessible label for the trigger button. */
  accessibilityLabel?: string;
  /** Optional test identifier for automation. */
  testID?: string;
}

interface TriggerLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Pressable trigger that reveals a scrollable options list in an overlay.
 * Supports keyboard navigation (arrow keys) on web, ARIA listbox semantics,
 * and RTL layout.
 */
export default function Dropdown({
  options,
  selectedValue,
  onSelect,
  placeholder = "اختر...",
  disabled = false,
  dir = I18nManager.isRTL ? "rtl" : "ltr",
  accessibilityLabel,
  testID,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<TriggerLayout>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<View>(null);
  const isRtl = dir === "rtl";

  const selectedOption = options.find((o) => o.value === selectedValue);
  const displayLabel = selectedOption?.label ?? placeholder;
  const hasValue = Boolean(selectedOption);

  const openDropdown = () => {
    if (disabled) return;
    triggerRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      setTriggerLayout({ x: pageX, y: pageY + height + 4, width, height });
      setFocusedIndex(
        selectedValue != null
          ? options.findIndex((o) => o.value === selectedValue)
          : -1
      );
      setIsOpen(true);
    });
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    closeDropdown();
  };

  const handleKeyDown = (e: any) => {
    if (!isOpen) return;
    const enabledOptions = options.filter((o) => !o.disabled);
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const nextIdx = Math.min(focusedIndex + 1, enabledOptions.length - 1);
        setFocusedIndex(nextIdx);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        setFocusedIndex(Math.max(focusedIndex - 1, 0));
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        const focused = enabledOptions[focusedIndex];
        if (focused) handleSelect(focused.value);
        break;
      }
      case "Escape":
        closeDropdown();
        break;
    }
  };

  return (
    <View ref={triggerRef} testID={testID}>
      <PressableSurface
        accessibilityLabel={accessibilityLabel ?? displayLabel}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen, disabled }}
        baseStyle={[
          styles.trigger,
          isRtl ? styles.triggerRtl : styles.triggerLtr,
          disabled && styles.triggerDisabled,
        ]}
        hoverStyle={disabled ? undefined : styles.triggerHover}
        focusStyle={styles.triggerFocus}
        pressedStyle={disabled ? undefined : styles.triggerPressed}
        onPress={openDropdown}
        disabled={disabled}
        {...(Platform.OS === "web"
          ? {
              dir,
              role: "combobox",
              "aria-expanded": isOpen,
              "aria-haspopup": "listbox",
              onKeyDown: handleKeyDown,
            }
          : {})}
      >
        <Text
          style={[
            styles.triggerText,
            !hasValue && styles.placeholderText,
            isRtl ? styles.textRtl : styles.textLtr,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={
            disabled ? ColorTokens.text.disabled : ColorTokens.text.secondary
          }
        />
      </PressableSurface>

      {/* Options overlay rendered in a Modal so it sits above all siblings */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDropdown}
        statusBarTranslucent
      >
        {/* Invisible full-screen tap target to close on outside press */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeDropdown}
          accessibilityLabel="إغلاق"
        />

        <View
          style={[
            styles.listBox,
            {
              top: triggerLayout.y,
              left: triggerLayout.x,
              width: triggerLayout.width,
            },
          ]}
          {...(Platform.OS === "web" ? { dir, role: "listbox" } : {})}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {options.map((option, idx) => {
              const isSelected = option.value === selectedValue;
              const isFocusedItem = idx === focusedIndex;
              return (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.option,
                    isRtl ? styles.optionRtl : styles.optionLtr,
                    isSelected && styles.optionSelected,
                    isFocusedItem && styles.optionFocused,
                    pressed && !option.disabled && styles.optionPressed,
                    option.disabled && styles.optionDisabled,
                  ]}
                  onPress={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  accessibilityRole="menuitem"
                  accessibilityState={{
                    selected: isSelected,
                    disabled: option.disabled,
                  }}
                  {...(Platform.OS === "web"
                    ? {
                        role: "option",
                        "aria-selected": isSelected,
                      }
                    : {})}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isRtl ? styles.textRtl : styles.textLtr,
                      isSelected && styles.optionTextSelected,
                      option.disabled && styles.optionTextDisabled,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={ColorTokens.brand.green}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: "center",
    minHeight: MinTouchTarget,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    backgroundColor: ColorTokens.surface.default,
    borderWidth: 1.5,
    borderColor: ColorTokens.border.default,
    borderRadius: Radius.md,
    gap: Space.sm,
  },
  triggerLtr: { flexDirection: "row" },
  triggerRtl: { flexDirection: "row-reverse" },
  triggerHover: { borderColor: ColorTokens.border.strong },
  triggerFocus: {
    borderColor: ColorTokens.border.focus,
    borderWidth: 2,
  },
  triggerPressed: { backgroundColor: ColorTokens.surface.muted },
  triggerDisabled: {
    backgroundColor: ColorTokens.surface.muted,
    borderColor: ColorTokens.border.subtle,
  },
  triggerText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: ColorTokens.text.primary,
  },
  placeholderText: { color: ColorTokens.text.tertiary },
  disabledText: { color: ColorTokens.text.disabled },
  textLtr: { textAlign: "left" },
  textRtl: { textAlign: "right", writingDirection: "rtl" },
  listBox: {
    position: "absolute",
    backgroundColor: ColorTokens.surface.default,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: ColorTokens.border.default,
    maxHeight: 248,
    zIndex: ZIndex.dropdown,
    overflow: "hidden",
    ...Elevation.md,
  },
  option: {
    alignItems: "center",
    paddingHorizontal: Space.md,
    minHeight: MinTouchTarget,
    gap: Space.sm,
  },
  optionLtr: { flexDirection: "row" },
  optionRtl: { flexDirection: "row-reverse" },
  optionSelected: { backgroundColor: ColorTokens.brand.greenSurface },
  optionFocused: { backgroundColor: ColorTokens.surface.muted },
  optionPressed: { backgroundColor: ColorTokens.surface.muted },
  optionDisabled: { opacity: 0.4 },
  optionText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: ColorTokens.text.primary,
    paddingVertical: Space.sm + 2,
  },
  optionTextSelected: {
    fontFamily: FontFamily.medium,
    color: ColorTokens.brand.green,
  },
  optionTextDisabled: { color: ColorTokens.text.disabled },
});
