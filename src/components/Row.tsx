import { Text, View } from "react-native";

type Props = {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
};

export function Row({ label, value, bold, highlight }: Props) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="flex-1 pr-3 text-slate-500 dark:text-slate-400">
        {label}
      </Text>
      <Text
        className={`${
          highlight
            ? "font-bold text-brand-600 dark:text-brand-400"
            : "text-slate-900 dark:text-white"
        } ${bold ? "text-base font-bold" : "font-medium"}`}
      >
        {value}
      </Text>
    </View>
  );
}

export function Divider() {
  return <View className="my-2 h-px bg-slate-200 dark:bg-white/10" />;
}
