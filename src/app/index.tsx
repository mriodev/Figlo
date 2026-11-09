import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { Search, Settings, X } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useCallback, useMemo, useRef, useState } from "react";

import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeBanner } from "@/ads/HomeBanner";
import { onCalculatorExit } from "@/ads/interstitial";
import { CalcGrid } from "../components/CalcGrid";
import { APP_NAME, APP_TAGLINE, THEME } from "../constants/app";
import {
  CALCULATORS,
  CALC_MAP,
  CATEGORIES,
  CATEGORY_ORDER,
} from "../constants/calculators";
import { useAppStore } from "../store/useAppStore";

function SectionTitle({ title, color }: { title: string; color?: string }) {
  return (
    <View className="mb-2 mt-6 flex-row items-center">
      {color && (
        <View
          className="mr-2 h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <Text className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </Text>
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  const [query, setQuery] = useState("");
  const favorites = useAppStore((s) => s.favorites);
  const recent = useAppStore((s) => s.recent);
  const addRecent = useAppStore((s) => s.addRecent);

  const visitedCalc = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (visitedCalc.current) {
        visitedCalc.current = false;
        onCalculatorExit();
      }
    }, []),
  );

  const openCalc = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addRecent(id);
    visitedCalc.current = true;
    router.push({ pathname: "/calc/[id]", params: { id } });
  };

  const q = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      q
        ? CALCULATORS.filter((c) =>
            [c.title, c.subtitle, ...c.keywords]
              .join(" ")
              .toLowerCase()
              .includes(q),
          )
        : [],
    [q],
  );

  const favoriteCalcs = favorites.map((id) => CALC_MAP[id]).filter(Boolean);
  const recentCalcs = recent.map((id) => CALC_MAP[id]).filter(Boolean);

  return (
    <View className="flex-1 bg-surface-light dark:bg-surface-dark">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 90,
          paddingHorizontal: 16,
        }}
      >
        {/* Header */}
        <View className="flex-row items-start">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-slate-900 dark:text-white">
              {APP_NAME}
            </Text>
            <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {APP_TAGLINE}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            hitSlop={12}
            accessibilityLabel="Settings"
            className="h-11 w-11 items-center justify-center rounded-full bg-card-light active:opacity-70 dark:bg-card-dark"
          >
            <Settings size={20} color={theme.icon} />
          </Pressable>
        </View>

        {/* Search */}
        <View className="mt-5 flex-row items-center rounded-2xl border border-slate-200/70 bg-card-light px-4 dark:border-white/5 dark:bg-card-dark">
          <Search size={18} color={theme.placeholder} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search calculators"
            placeholderTextColor={theme.placeholder}
            returnKeyType="search"
            accessibilityLabel="Search calculators"
            className="ml-2 flex-1 py-3.5 text-base text-slate-900 dark:text-white"
          />
          {query.length > 0 && (
            <Pressable
              hitSlop={12}
              onPress={() => setQuery("")}
              accessibilityLabel="Clear search"
            >
              <X size={18} color={theme.placeholder} />
            </Pressable>
          )}
        </View>

        {q ? (
          /* Search results */
          <>
            <SectionTitle title={`Results (${results.length})`} />
            {results.length > 0 ? (
              <CalcGrid items={results} onOpen={openCalc} />
            ) : (
              <View className="mt-6 items-center">
                <Text className="text-base text-slate-500 dark:text-slate-400">
                  No calculator found for "{query}"
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Recent */}
            {recentCalcs.length > 0 && (
              <>
                <SectionTitle title="Recent" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="-mx-4"
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                >
                  {recentCalcs.map((calc) => {
                    const Icon = calc.icon;
                    const color = CATEGORIES[calc.category].color;
                    return (
                      <Pressable
                        key={calc.id}
                        onPress={() => openCalc(calc.id)}
                        className="flex-row items-center rounded-full border border-slate-200/70 bg-card-light px-4 py-2.5 active:opacity-80 dark:border-white/5 dark:bg-card-dark"
                      >
                        <Icon size={16} color={color} />
                        <Text className="ml-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                          {calc.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {/* Favorites */}
            {favoriteCalcs.length > 0 && (
              <>
                <SectionTitle title="Favorites" color="#F59E0B" />
                <CalcGrid items={favoriteCalcs} onOpen={openCalc} />
              </>
            )}

            {/* Categories */}
            {CATEGORY_ORDER.map((catId) => {
              const category = CATEGORIES[catId];
              const items = CALCULATORS.filter((c) => c.category === catId);
              return (
                <View key={catId}>
                  <SectionTitle title={category.title} color={category.color} />
                  <CalcGrid items={items} onOpen={openCalc} />
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
      <HomeBanner />
    </View>
  );
}
