import * as Haptics from "expo-haptics";
import { Share2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Share, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { InfoTip } from "../../components/InfoTip";
import { NumberField } from "../../components/NumberField";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Segmented } from "../../components/Segmented";
import { APP_NAME } from "../../constants/app";
import { useCurrency } from "../../hooks/useCurrency";
import { useAppStore } from "../../store/useAppStore";
import { formatMoney, formatNumber } from "../../utils/format";
import { calculateLoan } from "../../utils/loan";

const DEFAULTS = { amount: "100000", rate: "12", term: "5", unit: "years" };
const PRINCIPAL_COLOR = "#10B98A";
const INTEREST_COLOR = "#F59E0B";

export default function LoanCalculator() {
  const insets = useSafeAreaInsets();
  const saved = useAppStore((s) => s.inputs.loan);
  const setInput = useAppStore((s) => s.setInput);
  const [showAllYears, setShowAllYears] = useState(false);

  const values = { ...DEFAULTS, ...saved };
  const set = (field: string) => (v: string) => setInput("loan", field, v);
  const symbol = useCurrency();

  const isYears = values.unit === "years";
  const termNum = Number(values.term) || 0;
  const months = Math.round(isYears ? termNum * 12 : termNum);

  const result = useMemo(
    () => calculateLoan(Number(values.amount), Number(values.rate), months),
    [values.amount, values.rate, months],
  );

  const changeUnit = (unit: string) => {
    const next =
      unit === "months"
        ? Math.round(termNum * 12)
        : Math.max(1, Math.round(termNum / 12));
    setInput("loan", "unit", unit);
    setInput("loan", "term", String(next));
  };

  const termLabel = isYears
    ? `${termNum} ${termNum === 1 ? "year" : "years"}`
    : `${termNum} ${termNum === 1 ? "month" : "months"}`;

  const onShare = async () => {
    if (!result) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({
      message: [
        "Loan / EMI result",
        `Loan amount: ${formatMoney(result.principal, symbol)}`,
        `Interest rate: ${values.rate}% per year`,
        `Term: ${termLabel}`,
        "",
        `Monthly payment: ${formatMoney(result.emi, symbol)}`,
        `Total interest: ${formatMoney(result.totalInterest, symbol)}`,
        `Total payment: ${formatMoney(result.totalPayment, symbol)}`,
        "",
        `Calculated with ${APP_NAME}`,
      ].join("\n"),
    });
  };

  const visibleYears = result
    ? showAllYears
      ? result.years
      : result.years.slice(0, 5)
    : [];

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
          title="Loan / EMI"
          right={
            result ? (
              <Pressable
                onPress={onShare}
                hitSlop={12}
                accessibilityLabel="Share result"
                className="h-10 w-10 items-center justify-center rounded-full bg-card-light active:opacity-70 dark:bg-card-dark"
              >
                <Share2 size={18} color="#10B98A" />
              </Pressable>
            ) : null
          }
        />

        {/* Inputs */}
        <Card>
          <NumberField
            label="Loan amount"
            value={values.amount}
            onChange={set("amount")}
            prefix={symbol}
          />
          <NumberField
            label="Interest rate (per year)"
            value={values.rate}
            onChange={set("rate")}
            suffix="%"
            slider={{ min: 0, max: 30, step: 0.1 }}
          />
          <NumberField
            label="Loan term"
            value={values.term}
            onChange={set("term")}
            suffix={isYears ? "years" : "months"}
            slider={
              isYears
                ? { min: 1, max: 30, step: 1 }
                : { min: 1, max: 360, step: 1 }
            }
            labelRight={
              <Segmented
                value={values.unit}
                onChange={changeUnit}
                options={[
                  { label: "Years", value: "years" },
                  { label: "Months", value: "months" },
                ]}
              />
            }
          />
        </Card>

        {result ? (
          <>
            {/* Main result */}
            <View className="mt-4 rounded-card bg-brand-600 p-5">
              <Text className="text-sm font-medium text-brand-100">
                Monthly payment
              </Text>
              <Text
                className="mt-1 text-4xl font-bold text-white"
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {formatMoney(result.emi, symbol)}
              </Text>
              <Text className="mt-3 leading-6 text-brand-50">
                You'll pay {formatMoney(result.emi, symbol)} every month for{" "}
                {termLabel}. Of the total,{" "}
                {formatMoney(result.totalInterest, symbol)} is interest.
              </Text>
            </View>

            {/* Breakdown */}
            <Card className="mt-4">
              <Row
                label="Loan amount"
                value={formatMoney(result.principal, symbol)}
              />
              <Row
                label="Total interest"
                value={formatMoney(result.totalInterest, symbol)}
              />
              <Row
                label="Total payment"
                value={formatMoney(result.totalPayment, symbol)}
                bold
              />

              <View className="mt-4 h-3 flex-row overflow-hidden rounded-full">
                <View
                  style={{
                    flex: result.principal,
                    backgroundColor: PRINCIPAL_COLOR,
                  }}
                />
                <View
                  style={{
                    flex: Math.max(result.totalInterest, 0),
                    backgroundColor: INTEREST_COLOR,
                  }}
                />
              </View>
              <View className="mt-2 flex-row gap-4">
                <Legend
                  color={PRINCIPAL_COLOR}
                  label={`Principal ${formatNumber(
                    (result.principal / result.totalPayment) * 100,
                    0,
                  )}%`}
                />
                <Legend
                  color={INTEREST_COLOR}
                  label={`Interest ${formatNumber(
                    (result.totalInterest / result.totalPayment) * 100,
                    0,
                  )}%`}
                />
              </View>
            </Card>

            {/* Yearly schedule */}
            <Card className="mt-4">
              <Text className="mb-3 font-semibold text-slate-800 dark:text-slate-200">
                Payment schedule (yearly)
              </Text>
              <View className="flex-row border-b border-slate-200 pb-2 dark:border-white/10">
                <Th text="Year" flex={0.6} />
                <Th text="Principal" />
                <Th text="Interest" />
                <Th text="Balance" />
              </View>
              {visibleYears.map((y) => (
                <View
                  key={y.year}
                  className="flex-row border-b border-slate-100 py-2.5 dark:border-white/5"
                >
                  <Td text={String(y.year)} flex={0.6} />
                  <Td text={formatNumber(y.principal, 0)} />
                  <Td text={formatNumber(y.interest, 0)} />
                  <Td text={formatNumber(y.balance, 0)} />
                </View>
              ))}
              {result.years.length > 5 && (
                <Pressable
                  onPress={() => setShowAllYears(!showAllYears)}
                  className="mt-3 items-center py-1"
                >
                  <Text className="font-semibold text-brand-600 dark:text-brand-400">
                    {showAllYears
                      ? "Show less"
                      : `Show all ${result.years.length} years`}
                  </Text>
                </Pressable>
              )}
            </Card>
          </>
        ) : (
          <Card className="mt-4 items-center py-8">
            <Text className="text-center text-slate-500 dark:text-slate-400">
              Enter a loan amount, interest rate and term to see your monthly
              payment.
            </Text>
          </Card>
        )}

        <InfoTip title="What is EMI?">
          EMI (Equated Monthly Installment) is the fixed amount you pay every
          month to repay a loan. Each payment covers part of the interest and
          part of the loan amount. Early payments are mostly interest; later
          payments are mostly principal. Actual payments from your bank may
          differ slightly due to fees, insurance or rounding.
        </InfoTip>
      </ScrollView>
    </View>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="text-slate-500 dark:text-slate-400">{label}</Text>
      <Text
        className={`text-slate-900 dark:text-white ${
          bold ? "text-base font-bold" : "font-medium"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center">
      <View
        className="mr-1.5 h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <Text className="text-xs text-slate-500 dark:text-slate-400">
        {label}
      </Text>
    </View>
  );
}

function Th({ text, flex = 1 }: { text: string; flex?: number }) {
  return (
    <Text
      style={{ flex }}
      className="text-right text-xs font-semibold uppercase text-slate-400 first:text-left"
    >
      {text}
    </Text>
  );
}

function Td({ text, flex = 1 }: { text: string; flex?: number }) {
  return (
    <Text
      style={{ flex }}
      className="text-right text-sm text-slate-700 dark:text-slate-300"
    >
      {text}
    </Text>
  );
}
