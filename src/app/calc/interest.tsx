import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { InfoTip } from "../../components/InfoTip";
import { NumberField } from "../../components/NumberField";
import { ResultHero } from "../../components/ResultHero";
import { Divider, Row } from "../../components/Row";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Segmented } from "../../components/Segmented";
import { ShareButton } from "../../components/ShareButton";
import { SplitBar } from "../../components/SplitBar";
import { YearTable } from "../../components/YearTable";
import { useCurrency } from "../../hooks/useCurrency";
import { useAppStore } from "../../store/useAppStore";
import { formatMoney, formatNumber, formatSmart } from "../../utils/format";
import { calculateSavings } from "../../utils/savings";
import { shareResult } from "../../utils/share";

const DEFAULTS = {
  mode: "compound",
  initial: "100000",
  monthly: "5000",
  rate: "8",
  years: "10",
  freq: "12",
};

const FREQ_LABEL: Record<string, string> = {
  "12": "monthly",
  "4": "quarterly",
  "1": "yearly",
};

export default function InterestCalculator() {
  const insets = useSafeAreaInsets();
  const saved = useAppStore((s) => s.inputs.interest);
  const setInput = useAppStore((s) => s.setInput);

  const values = { ...DEFAULTS, ...saved };
  const set = (field: string) => (v: string) => setInput("interest", field, v);
  const symbol = useCurrency();
  const isCompound = values.mode === "compound";
  const yearsNum = Number(values.years) || 0;

  const r = useMemo(
    () =>
      calculateSavings({
        initial: Number(values.initial) || 0,
        monthly: isCompound ? Number(values.monthly) || 0 : 0,
        rate: Number(values.rate),
        years: yearsNum,
        mode: isCompound ? "compound" : "simple",
        timesPerYear: Number(values.freq) || 12,
      }),
    [
      values.initial,
      values.monthly,
      values.rate,
      yearsNum,
      isCompound,
      values.freq,
    ],
  );

  const yearsLabel = `${formatSmart(yearsNum)} ${yearsNum === 1 ? "year" : "years"}`;

  const note = r
    ? `You put in ${formatMoney(r.totalDeposits, symbol)} and earn ${formatMoney(
        r.totalInterest,
        symbol,
      )} in interest.`
    : "";

  const onShare = () => {
    if (!r) return;
    shareResult("Savings result", [
      `Type: ${isCompound ? `Compound (${FREQ_LABEL[values.freq]})` : "Simple interest"}`,
      `Starting amount: ${formatMoney(Number(values.initial) || 0, symbol)}`,
      ...(isCompound && Number(values.monthly) > 0
        ? [`Monthly deposit: ${formatMoney(Number(values.monthly), symbol)}`]
        : []),
      `Interest rate: ${values.rate}% per year`,
      `Period: ${yearsLabel}`,
      "",
      `Total deposits: ${formatMoney(r.totalDeposits, symbol)}`,
      `Interest earned: ${formatMoney(r.totalInterest, symbol)}`,
      `Final balance: ${formatMoney(r.finalBalance, symbol)}`,
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
          title="Savings & Interest"
          right={r ? <ShareButton onPress={onShare} /> : null}
        />

        <Segmented
          full
          value={values.mode}
          onChange={set("mode")}
          options={[
            { label: "Compound", value: "compound" },
            { label: "Simple", value: "simple" },
          ]}
        />

        <Card className="mt-4">
          <NumberField
            label="Starting amount"
            value={values.initial}
            onChange={set("initial")}
            prefix={symbol}
          />
          {isCompound && (
            <NumberField
              label="Monthly deposit (optional)"
              value={values.monthly}
              onChange={set("monthly")}
              prefix={symbol}
            />
          )}
          <NumberField
            label="Interest rate (per year)"
            value={values.rate}
            onChange={set("rate")}
            suffix="%"
            slider={{ min: 0, max: 20, step: 0.1 }}
          />
          <NumberField
            label="Time period"
            value={values.years}
            onChange={set("years")}
            suffix="years"
            slider={{ min: 1, max: 40, step: 1 }}
          />
          {isCompound && (
            <View>
              <Text className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                Interest added
              </Text>
              <Segmented
                full
                value={values.freq}
                onChange={set("freq")}
                options={[
                  { label: "Monthly", value: "12" },
                  { label: "Quarterly", value: "4" },
                  { label: "Yearly", value: "1" },
                ]}
              />
            </View>
          )}
        </Card>

        {r ? (
          <>
            <ResultHero
              label={`Balance after ${yearsLabel}`}
              value={formatMoney(r.finalBalance, symbol)}
              note={note}
            />

            <Card className="mt-4">
              <Row
                label="Total deposits"
                value={formatMoney(r.totalDeposits, symbol)}
              />
              <Row
                label="Interest earned"
                value={formatMoney(r.totalInterest, symbol)}
                highlight
              />
              <Divider />
              <Row
                label="Final balance"
                value={formatMoney(r.finalBalance, symbol)}
                bold
              />
              <SplitBar
                a={{
                  label: "Deposits",
                  value: r.totalDeposits,
                  color: "#10B98A",
                }}
                b={{
                  label: "Interest",
                  value: r.totalInterest,
                  color: "#F59E0B",
                }}
              />
            </Card>

            <YearTable
              title="Growth by year"
              headers={["Year", "Deposits", "Interest", "Balance"]}
              rows={r.years.map((y) => [
                String(y.year),
                formatNumber(y.deposits, 0),
                formatNumber(y.interest, 0),
                formatNumber(y.balance, 0),
              ])}
            />
          </>
        ) : (
          <Card className="mt-4 items-center py-8">
            <Text className="text-center text-slate-500 dark:text-slate-400">
              Enter a starting amount or monthly deposit, an interest rate and a
              time period.
            </Text>
          </Card>
        )}

        <InfoTip title="Compound vs. simple interest">
          {"Simple interest is calculated only on your starting amount, so it grows the same each year.\n\n" +
            "Compound interest is also earned on interest you've already received, so your savings grow faster over time. The more often interest is added (monthly vs. yearly), the more you earn.\n\n" +
            "This calculator assumes deposits are made at the end of each month. Real bank results may differ slightly due to taxes, fees or rate changes."}
        </InfoTip>
      </ScrollView>
    </View>
  );
}
