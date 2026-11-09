import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, Text } from "react-native";

type Option = { label: string; value: string };

export function PillTabs({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-4"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => {
              if (!active) {
                Haptics.selectionAsync();
                onChange(o.value);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={`rounded-full px-4 py-2.5 ${
              active
                ? "bg-brand-600"
                : "border border-slate-200/70 bg-card-light dark:border-white/5 dark:bg-card-dark"
            }`}
          >
            <Text
              className={
                active
                  ? "font-semibold text-white"
                  : "font-medium text-slate-600 dark:text-slate-300"
              }
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
