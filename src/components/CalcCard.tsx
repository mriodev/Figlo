import * as Haptics from "expo-haptics";
import { Star } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { CATEGORIES, type Calculator } from "../constants/calculators";
import { useAppStore } from "../store/useAppStore";

type Props = {
  calc: Calculator;
  onPress: () => void;
};

export function CalcCard({ calc, onPress }: Props) {
  const category = CATEGORIES[calc.category];
  const isFavorite = useAppStore((s) => s.favorites.includes(calc.id));
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const Icon = calc.icon;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${calc.title} calculator`}
      className="m-1.5 flex-1 rounded-card border border-slate-200/70 bg-card-light p-4 active:opacity-80 dark:border-white/5 dark:bg-card-dark"
    >
      <View className="flex-row items-start justify-between">
        <View
          className={`h-11 w-11 items-center justify-center rounded-2xl ${category.iconBg}`}
        >
          <Icon size={22} color={category.color} />
        </View>

        <Pressable
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite
              ? `Remove ${calc.title} from favorites`
              : `Add ${calc.title} to favorites`
          }
          onPress={() => {
            Haptics.selectionAsync();
            toggleFavorite(calc.id);
          }}
        >
          <Star
            size={18}
            color={isFavorite ? "#F59E0B" : "#94A3B8"}
            fill={isFavorite ? "#F59E0B" : "transparent"}
          />
        </Pressable>
      </View>

      <Text className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
        {calc.title}
      </Text>
      <Text
        numberOfLines={2}
        className="mt-0.5 text-xs text-slate-500 dark:text-slate-400"
      >
        {calc.subtitle}
      </Text>
    </Pressable>
  );
}
