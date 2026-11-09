import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Card } from "./Card";

type Props = {
  title: string;
  headers: string[];
  rows: string[][];
  initialCount?: number;
};

export function YearTable({ title, headers, rows, initialCount = 5 }: Props) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? rows : rows.slice(0, initialCount);

  return (
    <Card className="mt-4">
      <Text className="mb-3 font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </Text>

      <View className="flex-row border-b border-slate-200 pb-2 dark:border-white/10">
        {headers.map((h, i) => (
          <Text
            key={h}
            style={{ flex: i === 0 ? 0.6 : 1 }}
            className={`text-xs font-semibold uppercase text-slate-400 ${
              i === 0 ? "text-left" : "text-right"
            }`}
          >
            {h}
          </Text>
        ))}
      </View>

      {visible.map((row, r) => (
        <View
          key={r}
          className="flex-row border-b border-slate-100 py-2.5 dark:border-white/5"
        >
          {row.map((cell, i) => (
            <Text
              key={i}
              style={{ flex: i === 0 ? 0.6 : 1 }}
              className={`text-sm text-slate-700 dark:text-slate-300 ${
                i === 0 ? "text-left" : "text-right"
              }`}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}

      {rows.length > initialCount && (
        <Pressable
          onPress={() => setShowAll(!showAll)}
          className="mt-3 items-center py-1"
        >
          <Text className="font-semibold text-brand-600 dark:text-brand-400">
            {showAll ? "Show less" : `Show all ${rows.length} rows`}
          </Text>
        </Pressable>
      )}
    </Card>
  );
}
