import { Text, View } from "react-native";

type Props = { label: string; value: string; note?: string };

export function ResultHero({ label, value, note }: Props) {
  return (
    <View className="mt-4 rounded-card bg-brand-600 p-5">
      <Text className="text-sm font-medium text-brand-100">{label}</Text>
      <Text
        className="mt-1 text-4xl font-bold text-white"
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {value}
      </Text>
      {note ? (
        <Text className="mt-3 leading-6 text-brand-50">{note}</Text>
      ) : null}
    </View>
  );
}
