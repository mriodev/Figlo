import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, Text } from "react-native";

type Props = {
  values: number[];
  selected: string;
  onSelect: (v: string) => void;
  suffix?: string;
};

export function QuickChips({ values, selected, onSelect, suffix = "" }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
      className="-mt-2 mb-5"
      keyboardShouldPersistTaps="handled"
    >
      {values.map((v) => {
        const active = Number(selected) === v;
        return (
          <Pressable
            key={v}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(String(v));
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`rounded-full px-4 py-2 ${
              active ? "bg-brand-600" : "bg-slate-100 dark:bg-white/5"
            }`}
          >
            <Text
              className={
                active
                  ? "font-semibold text-white"
                  : "font-medium text-slate-600 dark:text-slate-300"
              }
            >
              {v}
              {suffix}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
