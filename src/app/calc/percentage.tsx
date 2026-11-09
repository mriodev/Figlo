import Decimal from "decimal.js";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { InfoTip } from "../../components/InfoTip";
import { NumberField } from "../../components/NumberField";
import { ResultHero } from "../../components/ResultHero";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Segmented } from "../../components/Segmented";
import { ShareButton } from "../../components/ShareButton";
import { useAppStore } from "../../store/useAppStore";
import { formatSmart } from "../../utils/format";
import { shareResult } from "../../utils/share";

type Mode = "of" | "is" | "change";

const DEFAULTS = { mode: "of", a: "25", b: "200" };

const LABELS: Record<Mode, { a: string; b: string; aSuffix?: string }> = {
  of: { a: "Percentage", b: "Of value", aSuffix: "%" },
  is: { a: "Value", b: "Of total" },
  change: { a: "From", b: "To" },
};

function calculate(mode: Mode, aRaw: string, bRaw: string): number | null {
  if (aRaw === "" || bRaw === "") return null;
  const a = new Decimal(aRaw);
  const b = new Decimal(bRaw);
  switch (mode) {
    case "of":
      return a.div(100).mul(b).toNumber();
    case "is":
      return b.isZero() ? null : a.div(b).mul(100).toNumber();
    case "change":
      return a.isZero() ? null : b.minus(a).div(a).mul(100).toNumber();
  }
}

export default function PercentageCalculator() {
  const insets = useSafeAreaInsets();
  const saved = useAppStore((s) => s.inputs.percentage);
  const setInput = useAppStore((s) => s.setInput);

  const values = { ...DEFAULTS, ...saved };
  const mode = values.mode as Mode;
  const set = (field: string) => (v: string) =>
    setInput("percentage", field, v);
  const labels = LABELS[mode];

  const result = useMemo(
    () => calculate(mode, values.a, values.b),
    [mode, values.a, values.b],
  );

  const a = formatSmart(Number(values.a), 4);
  const b = formatSmart(Number(values.b), 4);

  let heroLabel = "";
  let heroValue = "";
  let sentence = "";

  if (result !== null) {
    if (mode === "of") {
      heroLabel = "Result";
      heroValue = formatSmart(result, 4);
      sentence = `${a}% of ${b} is ${heroValue}.`;
    } else if (mode === "is") {
      heroLabel = "Percentage";
      heroValue = `${formatSmart(result, 2)}%`;
      sentence = `${a} is ${heroValue} of ${b}.`;
    } else {
      const up = result >= 0;
      heroLabel = up ? "Increase" : "Decrease";
      heroValue = `${up ? "+" : "−"}${formatSmart(Math.abs(result), 2)}%`;
      const diff = formatSmart(
        Math.abs(Number(values.b) - Number(values.a)),
        4,
      );
      sentence = `Going from ${a} to ${b} is a ${formatSmart(Math.abs(result), 2)}% ${
        up ? "increase" : "decrease"
      } (a difference of ${diff}).`;
    }
  }

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
          title="Percentage"
          right={
            result !== null ? (
              <ShareButton
                onPress={() => shareResult("Percentage result", [sentence])}
              />
            ) : null
          }
        />

        <Segmented
          full
          value={mode}
          onChange={set("mode")}
          options={[
            { label: "% of", value: "of" },
            { label: "What %", value: "is" },
            { label: "% Change", value: "change" },
          ]}
        />

        <Card className="mt-4">
          <NumberField
            label={labels.a}
            value={values.a}
            onChange={set("a")}
            suffix={labels.aSuffix}
          />
          <NumberField label={labels.b} value={values.b} onChange={set("b")} />
        </Card>

        {result !== null ? (
          <ResultHero label={heroLabel} value={heroValue} note={sentence} />
        ) : (
          <Card className="mt-4 items-center py-8">
            <Text className="text-center text-slate-500 dark:text-slate-400">
              {mode === "change" && Number(values.a) === 0 && values.a !== ""
                ? "The starting value can't be zero."
                : mode === "is" && Number(values.b) === 0 && values.b !== ""
                  ? "The total can't be zero."
                  : "Enter both values to see the result."}
            </Text>
          </Card>
        )}

        <InfoTip title="How is this calculated?">
          {"• % of: (percentage ÷ 100) × value\n" +
            "• What %: (value ÷ total) × 100\n" +
            "• % change: ((new − old) ÷ old) × 100\n\n" +
            "Example: if a price goes from 200 to 250, it increased by 25%."}
        </InfoTip>
      </ScrollView>
    </View>
  );
}
