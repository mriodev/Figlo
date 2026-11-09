import { Text, View } from "react-native";
import { formatNumber } from "../utils/format";

type Part = { label: string; value: number; color: string };

export function SplitBar({ a, b }: { a: Part; b: Part }) {
  const total = a.value + b.value;
  if (!(total > 0)) return null;

  return (
    <View className="mt-4">
      <View className="h-3 flex-row overflow-hidden rounded-full">
        <View
          style={{ flex: Math.max(a.value, 0), backgroundColor: a.color }}
        />
        <View
          style={{ flex: Math.max(b.value, 0), backgroundColor: b.color }}
        />
      </View>
      <View className="mt-2 flex-row gap-4">
        {[a, b].map((p) => (
          <View key={p.label} className="flex-row items-center">
            <View
              className="mr-1.5 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {p.label} {formatNumber((p.value / total) * 100, 0)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
