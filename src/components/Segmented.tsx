import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";

type Option = { label: string; value: string };

export function Segmented({
  options,
  value,
  onChange,
  full = false,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <View className="flex-row rounded-xl bg-slate-100 p-1 dark:bg-white/5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) {
                Haptics.selectionAsync();
                onChange(o.value);
              }
            }}
            className={`items-center rounded-lg px-3 ${full ? "flex-1 py-2.5" : "py-1.5"} ${
              active ? "bg-card-light dark:bg-card-dark" : ""
            }`}
          >
            <Text
              numberOfLines={1}
              className={
                active
                  ? "text-sm font-semibold text-slate-900 dark:text-white"
                  : "text-sm text-slate-500 dark:text-slate-400"
              }
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
