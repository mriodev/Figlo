import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { THEME } from "../../constants/app";
import { CALC_MAP, CATEGORIES } from "../../constants/calculators";

export default function CalculatorPlaceholder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  const calc = CALC_MAP[id ?? ""];
  const Icon = calc?.icon;
  const color = calc ? CATEGORIES[calc.category].color : "#94A3B8";

  return (
    <View
      className="flex-1 bg-surface-light px-4 dark:bg-surface-dark"
      style={{ paddingTop: insets.top + 8 }}
    >
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityLabel="Go back"
        className="h-10 w-10 items-center justify-center rounded-full bg-card-light dark:bg-card-dark"
      >
        <ChevronLeft size={22} color={theme.icon} />
      </Pressable>

      <View className="flex-1 items-center justify-center">
        {Icon && <Icon size={48} color={color} />}
        <Text className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          {calc?.title ?? "Not found"}
        </Text>
        <Text className="mt-2 text-slate-500 dark:text-slate-400">
          Coming soon
        </Text>
      </View>
    </View>
  );
}
