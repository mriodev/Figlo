import DateTimePicker, {
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { CalendarDays } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { pretty } from "../utils/date";

type Props = {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  labelRight?: ReactNode;
};

export function DateField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  labelRight,
}: Props) {
  const [showInline, setShowInline] = useState(false);

  const open = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value,
        mode: "date",
        minimumDate,
        maximumDate,
        onChange: (event, date) => {
          if (event.type === "set" && date) onChange(date);
        },
      });
    } else {
      setShowInline((s) => !s);
    }
  };

  return (
    <View className="mb-5">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </Text>
        {labelRight}
      </View>

      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${pretty(value)}. Tap to change`}
        className="flex-row items-center rounded-2xl bg-slate-100 px-4 py-3.5 active:opacity-70 dark:bg-white/5"
      >
        <CalendarDays size={20} color="#10B98A" />
        <Text className="ml-3 flex-1 text-xl font-semibold text-slate-900 dark:text-white">
          {pretty(value)}
        </Text>
        <Text className="text-sm font-medium text-brand-600 dark:text-brand-400">
          Change
        </Text>
      </Pressable>

      {showInline && Platform.OS !== "android" && (
        <DateTimePicker
          value={value}
          mode="date"
          display="inline"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(_, date) => date && onChange(date)}
        />
      )}
    </View>
  );
}
