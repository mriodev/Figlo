import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { THEME } from "../constants/app";

export function ScreenHeader({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  return (
    <View className="mb-4 flex-row items-center">
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityLabel="Go back"
        className="h-10 w-10 items-center justify-center rounded-full bg-card-light active:opacity-70 dark:bg-card-dark"
      >
        <ChevronLeft size={22} color={theme.icon} />
      </Pressable>
      <Text
        numberOfLines={1}
        className="ml-3 flex-1 text-xl font-bold text-slate-900 dark:text-white"
      >
        {title}
      </Text>
      {right}
    </View>
  );
}
