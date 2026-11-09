import Decimal from "decimal.js";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { InfoTip } from "../../components/InfoTip";
import { NumberField } from "../../components/NumberField";
import { QuickChips } from "../../components/QuickChips";
import { ResultHero } from "../../components/ResultHero";
import { ScreenHeader } from "../../components/ScreenHeader";
import { ShareButton } from "../../components/ShareButton";
import { useCurrency } from "../../hooks/useCurrency";
import { useAppStore } from "../../store/useAppStore";
import { formatMoney, formatSmart } from "../../utils/format";
import { shareResult } from "../../utils/share";

const DEFAULTS = { price: "5000", discount: "20", extra: "" };

function calculate(priceRaw: string, d1Raw: string, d2Raw: string) {
  const price = Number(priceRaw);
  const d1 = Number(d1Raw) || 0;
  const d2 = Number(d2Raw) || 0;
  if (!(price > 0) || d1 < 0 || d1 > 100 || d2 < 0 || d2 > 100) return null;

  const P = new Decimal(price);
  const afterFirst = P.mul(new Decimal(1).minus(new Decimal(d1).div(100)));
  const final = afterFirst.mul(new Decimal(1).minus(new Decimal(d2).div(100)));
  const saved = P.minus(final);

  return {
    price,
    d1,
    d2,
    firstSaving: P.minus(afterFirst).toNumber(),
    extraSaving: afterFirst.minus(final).toNumber(),
    final: final.toNumber(),
    saved: saved.toNumber(),
    effective: saved.div(P).mul(100).toNumber(),
  };
}

export default function DiscountCalculator() {
  const insets = useSafeAreaInsets();
  const saved = useAppStore((s) => s.inputs.discount);
  const setInput = useAppStore((s) => s.setInput);

  const values = { ...DEFAULTS, ...saved };
  const set = (field: string) => (v: string) => setInput("discount", field, v);
  const symbol = useCurrency();

  const r = useMemo(
    () => calculate(values.price, values.discount, values.extra),
    [values.price, values.discount, values.extra],
  );

  const note = r
    ? `You save ${formatMoney(r.saved, symbol)} — that's ${formatSmart(r.effective)}% off${
        r.d2 > 0 ? ` (not ${formatSmart(r.d1 + r.d2)}%)` : ""
      }.`
    : "";

  const onShare = () => {
    if (!r) return;
    shareResult("Discount result", [
      `Original price: ${formatMoney(r.price, symbol)}`,
      `Discount: ${formatSmart(r.d1)}%${r.d2 > 0 ? ` + extra ${formatSmart(r.d2)}%` : ""}`,
      `You pay: ${formatMoney(r.final, symbol)}`,
      `You save: ${formatMoney(r.saved, symbol)} (${formatSmart(r.effective)}% off)`,
    ]);
  };

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
          title="Discount"
          right={r ? <ShareButton onPress={onShare} /> : null}
        />

        <Card>
          <NumberField
            label="Original price"
            value={values.price}
            onChange={set("price")}
            prefix={symbol}
          />
          <NumberField
            label="Discount"
            value={values.discount}
            onChange={set("discount")}
            suffix="%"
            slider={{ min: 0, max: 90, step: 1 }}
          />
          <QuickChips
            values={[10, 15, 20, 25, 30, 40, 50]}
            selected={values.discount}
            onSelect={set("discount")}
            suffix="%"
          />
          <NumberField
            label="Extra discount (optional)"
            value={values.extra}
            onChange={set("extra")}
            suffix="%"
          />
        </Card>

        {r ? (
          <>
            <ResultHero
              label="You pay"
              value={formatMoney(r.final, symbol)}
              note={note}
            />

            <Card className="mt-4">
              <Row
                label="Original price"
                value={formatMoney(r.price, symbol)}
              />
              <Row
                label={`Discount (${formatSmart(r.d1)}%)`}
                value={`− ${formatMoney(r.firstSaving, symbol)}`}
              />
              {r.d2 > 0 && (
                <Row
                  label={`Extra discount (${formatSmart(r.d2)}%)`}
                  value={`− ${formatMoney(r.extraSaving, symbol)}`}
                />
              )}
              <View className="my-2 h-px bg-slate-200 dark:bg-white/10" />
              <Row
                label="Final price"
                value={formatMoney(r.final, symbol)}
                bold
              />
              <Row
                label="Total savings"
                value={formatMoney(r.saved, symbol)}
                highlight
              />
            </Card>
          </>
        ) : (
          <Card className="mt-4 items-center py-8">
            <Text className="text-center text-slate-500 dark:text-slate-400">
              Enter a price and a discount between 0 and 100% to see the final
              price.
            </Text>
          </Card>
        )}

        <InfoTip title="Why isn't 20% + 10% the same as 30%?">
          The extra discount is applied to the already-reduced price, not the
          original. For example, on 1,000: 20% off makes it 800, then 10% off
          800 makes it 720. That's a total of 28% off, not 30%.
        </InfoTip>
      </ScrollView>
    </View>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="text-slate-500 dark:text-slate-400">{label}</Text>
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
