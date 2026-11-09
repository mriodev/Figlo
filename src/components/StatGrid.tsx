import { Text, View } from "react-native";
import { Card } from "./Card";

type Stat = { label: string; value: string };

export function StatGrid({ title, stats }: { title?: string; stats: Stat[] }) {
  return (
    <Card className="mt-4">
      {title ? (
        <Text className="mb-3 font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </Text>
      ) : null}
      <View className="-m-1 flex-row flex-wrap">
        {stats.map((s) => (
          <View key={s.label} className="w-1/2 p-1">
            <View className="rounded-2xl bg-slate-100 p-3 dark:bg-white/5">
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                {s.label}
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                className="mt-1 text-lg font-bold text-slate-900 dark:text-white"
              >
                {s.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
