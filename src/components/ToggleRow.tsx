import * as Haptics from "expo-haptics";
import { Switch, Text, View } from "react-native";

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
};

export function ToggleRow({ label, description, value, onChange }: Props) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        <Text className="font-medium text-slate-800 dark:text-slate-200">
          {label}
        </Text>
        {description ? (
          <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={(v) => {
          Haptics.selectionAsync();
          onChange(v);
        }}
        trackColor={{ true: "#10B98A", false: "#CBD5E1" }}
        thumbColor="#FFFFFF"
        accessibilityLabel={label}
      />
    </View>
  );
}
