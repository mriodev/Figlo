import Slider from "@react-native-community/slider";
import { useColorScheme } from "nativewind";
import type { ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { THEME } from "../constants/app";
import { formatInputDisplay, sanitizeNumberInput } from "../utils/format";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  labelRight?: ReactNode;
  slider?: { min: number; max: number; step: number };
  allowNegative?: boolean;
};

export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  labelRight,
  slider,
  allowNegative = false,
}: Props) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const num = Number(value) || 0;

  const toggleSign = () =>
    onChange(value.startsWith("-") ? value.slice(1) : `-${value}`);

  return (
    <View className="mb-5">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </Text>
        {labelRight}
      </View>

      <View className="flex-row items-center rounded-2xl bg-slate-100 px-4 dark:bg-white/5">
        {allowNegative && (
          <Pressable
            onPress={toggleSign}
            hitSlop={8}
            accessibilityLabel="Toggle positive or negative"
            className="mr-2 h-8 w-8 items-center justify-center rounded-lg bg-card-light active:opacity-70 dark:bg-card-dark"
          >
            <Text className="text-base font-bold text-brand-600 dark:text-brand-400">
              ±
            </Text>
          </Pressable>
        )}
        {prefix ? (
          <Text className="mr-2 text-lg font-semibold text-slate-400">
            {prefix}
          </Text>
        ) : null}
        <TextInput
          value={formatInputDisplay(value)}
          onChangeText={(t) => onChange(sanitizeNumberInput(t, allowNegative))}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={theme.placeholder}
          accessibilityLabel={label}
          selectTextOnFocus
          className="flex-1 py-3.5 text-xl font-semibold text-slate-900 dark:text-white"
        />
        {suffix ? (
          <Text className="ml-2 text-base text-slate-400">{suffix}</Text>
        ) : null}
      </View>

      {slider && (
        <Slider
          style={{ height: 36, marginHorizontal: -8 }}
          minimumValue={slider.min}
          maximumValue={slider.max}
          step={slider.step}
          value={Math.min(Math.max(num, slider.min), slider.max)}
          onValueChange={(v) =>
            onChange(slider.step < 1 ? v.toFixed(1) : String(Math.round(v)))
          }
          minimumTrackTintColor="#10B98A"
          maximumTrackTintColor={colorScheme === "dark" ? "#334155" : "#CBD5E1"}
          thumbTintColor="#10B98A"
          accessibilityLabel={`${label} slider`}
        />
      )}
    </View>
  );
}
