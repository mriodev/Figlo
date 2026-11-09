import * as Haptics from "expo-haptics";
import { ArrowLeftRight } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { NumberField } from "../../components/NumberField";
import { PillTabs } from "../../components/PillTabs";
import { ResultHero } from "../../components/ResultHero";
import { ScreenHeader } from "../../components/ScreenHeader";
import { ShareButton } from "../../components/ShareButton";
import { UnitSelect } from "../../components/UnitSelect";
import { useAppStore } from "../../store/useAppStore";
import { formatUnitValue } from "../../utils/format";
import { shareResult } from "../../utils/share";
import { CATEGORY_MAP, UNIT_CATEGORIES, convert } from "../../utils/units";

export default function UnitConverter() {
  const insets = useSafeAreaInsets();
  const saved = useAppStore((s) => s.inputs.unit) ?? {};
  const setInput = useAppStore((s) => s.setInput);
  const set = (field: string) => (v: string) => setInput("unit", field, v);

  const category = CATEGORY_MAP[saved.cat ?? "length"] ?? UNIT_CATEGORIES[0];
  const value = saved[`value_${category.id}`] ?? "1";
  const fromId = saved[`from_${category.id}`] ?? category.defaultFrom;
  const toId = saved[`to_${category.id}`] ?? category.defaultTo;

  const from = category.units.find((u) => u.id === fromId) ?? category.units[0];
  const to = category.units.find((u) => u.id === toId) ?? category.units[1];

  const num = Number(value);
  const valid = value !== "" && value !== "-" && Number.isFinite(num);
  const result = valid ? convert(num, from, to) : null;

  const swap = () => {
    Haptics.selectionAsync();
    set(`from_${category.id}`)(to.id);
    set(`to_${category.id}`)(from.id);
  };

  const sentence =
    result !== null
      ? `${formatUnitValue(num)} ${from.symbol} = ${formatUnitValue(result)} ${to.symbol}`
      : "";

  return (
    <View className="flex-1 bg-surface-light dark:bg-surface-dark">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 90,
          paddingHorizontal: 16,
        }}
      >
        <ScreenHeader
          title="Unit Converter"
          right={
            result !== null ? (
              <ShareButton
                onPress={() => shareResult("Unit conversion", [sentence])}
              />
            ) : null
          }
        />

        <PillTabs
          value={category.id}
          onChange={set("cat")}
          options={UNIT_CATEGORIES.map((c) => ({
            label: c.label,
            value: c.id,
          }))}
        />

        <Card className="mt-4">
          <NumberField
            label="Value"
            value={value}
            onChange={set(`value_${category.id}`)}
            suffix={from.symbol}
            allowNegative={category.allowNegative}
          />

          <View className="flex-row items-center">
            <UnitSelect
              label="From"
              units={category.units}
              value={from.id}
              onChange={set(`from_${category.id}`)}
            />
            <Pressable
              onPress={swap}
              hitSlop={8}
              accessibilityLabel="Swap units"
              className="mx-2 h-11 w-11 items-center justify-center rounded-full bg-brand-600 active:opacity-80"
            >
              <ArrowLeftRight size={18} color="#FFFFFF" />
            </Pressable>
            <UnitSelect
              label="To"
              units={category.units}
              value={to.id}
              onChange={set(`to_${category.id}`)}
            />
          </View>
        </Card>

        {result !== null ? (
          <>
            <ResultHero
              label={to.name}
              value={`${formatUnitValue(result)} ${to.symbol}`}
              note={sentence}
            />

            <Card className="mt-4">
              <Text className="mb-1 font-semibold text-slate-800 dark:text-slate-200">
                All conversions
              </Text>
              <Text className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                Tap a unit to show it above
              </Text>
              {category.units
                .filter((u) => u.id !== from.id)
                .map((u) => {
                  const active = u.id === to.id;
                  return (
                    <Pressable
                      key={u.id}
                      onPress={() => {
                        Haptics.selectionAsync();
                        set(`to_${category.id}`)(u.id);
                      }}
                      className={`-mx-2 flex-row items-center justify-between rounded-xl px-2 py-2.5 active:opacity-70 ${
                        active ? "bg-brand-50 dark:bg-white/5" : ""
                      }`}
                    >
                      <Text className="text-slate-500 dark:text-slate-400">
                        {u.name}
                      </Text>
                      <Text
                        className={`font-semibold ${
                          active
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {formatUnitValue(convert(num, from, u))} {u.symbol}
                      </Text>
                    </Pressable>
                  );
                })}
            </Card>
          </>
        ) : (
          <Card className="mt-4 items-center py-8">
            <Text className="text-center text-slate-500 dark:text-slate-400">
              Enter a value to convert.
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
