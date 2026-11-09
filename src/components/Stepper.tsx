import * as Haptics from "expo-haptics";
import { Minus, Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  unit?: string;
};

export function Stepper({
  label,
  value,
  onChange,
  min = 1,
  max = 99,
  unit,
}: Props) {
  const change = (next: number) => {
    if (next < min || next > max) return;
    Haptics.selectionAsync();
    onChange(next);
  };

  const Btn = ({ type }: { type: "minus" | "plus" }) => {
    const disabled = type === "minus" ? value <= min : value >= max;
    const Icon = type === "minus" ? Minus : Plus;
    return (
      <Pressable
        onPress={() => change(type === "minus" ? value - 1 : value + 1)}
        disabled={disabled}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={
          type === "minus" ? `Decrease ${label}` : `Increase ${label}`
        }
        className={`h-11 w-11 items-center justify-center rounded-xl bg-card-light active:opacity-70 dark:bg-card-dark ${
          disabled ? "opacity-40" : ""
        }`}
      >
        <Icon size={20} color="#10B98A" />
      </Pressable>
    );
  };

  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </Text>
      <View className="flex-row items-center justify-between rounded-2xl bg-slate-100 p-2 dark:bg-white/5">
        <Btn type="minus" />
        <Text className="text-xl font-semibold text-slate-900 dark:text-white">
          {value}
          {unit ? ` ${unit}` : ""}
        </Text>
        <Btn type="plus" />
      </View>
    </View>
  );
}
