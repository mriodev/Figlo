import Decimal from "decimal.js";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { InfoTip } from "../../components/InfoTip";
import { NumberField } from "../../components/NumberField";
import { QuickChips } from "../../components/QuickChips";
import { ResultHero } from "../../components/ResultHero";
import { Divider, Row } from "../../components/Row";
import { ScreenHeader } from "../../components/ScreenHeader";
import { ShareButton } from "../../components/ShareButton";
import { Stepper } from "../../components/Stepper";
import { ToggleRow } from "../../components/ToggleRow";
import { useCurrency } from "../../hooks/useCurrency";
import { useAppStore } from "../../store/useAppStore";
import { formatMoney, formatSmart } from "../../utils/format";
import { shareResult } from "../../utils/share";

const DEFAULTS = { bill: "1000", tip: "10", people: "2", roundUp: "0" };

function calculate(
  billRaw: string,
  tipRaw: string,
  peopleRaw: string,
  roundUp: boolean,
) {
  const bill = Number(billRaw);
  const tip = Number(tipRaw) || 0;
  const people = Math.floor(Number(peopleRaw) || 1);
  if (!(bill > 0) || tip < 0 || tip > 100 || people < 1) return null;

  const B = new Decimal(bill);
  let total = B.plus(B.mul(tip).div(100));
  let perPerson = total.div(people);

  if (roundUp) {
    perPerson = perPerson.ceil();
    total = perPerson.mul(people);
  }

  const tipAmount = total.minus(B);

  return {
    bill,
    people,
    tipPercent: tipAmount.div(B).mul(100).toNumber(),
    tip: tipAmount.toNumber(),
    total: total.toNumber(),
    perPerson: perPerson.toNumber(),
    tipPerPerson: tipAmount.div(people).toNumber(),
  };
}

export default function TipCalculator() {
  const insets = useSafeAreaInsets();
  const saved = useAppStore((s) => s.inputs.tip);
  const setInput = useAppStore((s) => s.setInput);

  const values = { ...DEFAULTS, ...saved };
  const set = (field: string) => (v: string) => setInput("tip", field, v);
  const symbol = useCurrency();
  const roundUp = values.roundUp === "1";
  const people = Math.max(1, Math.floor(Number(values.people) || 1));

  const r = useMemo(
    () => calculate(values.bill, values.tip, values.people, roundUp),
    [values.bill, values.tip, values.people, roundUp],
  );

  const note = r
    ? r.people > 1
      ? `Total with tip is ${formatMoney(r.total, symbol)}, split between ${r.people} people.`
      : `Total with tip is ${formatMoney(r.total, symbol)}.`
    : "";

  const onShare = () => {
    if (!r) return;
    shareResult("Bill split", [
      `Bill: ${formatMoney(r.bill, symbol)}`,
      `Tip (${formatSmart(r.tipPercent)}%): ${formatMoney(r.tip, symbol)}`,
      `Total: ${formatMoney(r.total, symbol)}`,
      `People: ${r.people}`,
      `Each person pays: ${formatMoney(r.perPerson, symbol)}`,
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
          title="Tip & Split"
          right={r ? <ShareButton onPress={onShare} /> : null}
        />

        <Card>
          <NumberField
            label="Bill amount"
            value={values.bill}
            onChange={set("bill")}
            prefix={symbol}
          />
          <NumberField
            label="Tip"
            value={values.tip}
            onChange={set("tip")}
            suffix="%"
            slider={{ min: 0, max: 30, step: 1 }}
          />
          <QuickChips
            values={[0, 5, 10, 12, 15, 18, 20, 25]}
            selected={values.tip}
            onSelect={set("tip")}
            suffix="%"
          />
          <Stepper
            label="Number of people"
            value={people}
            onChange={(v) => set("people")(String(v))}
            min={1}
            max={50}
          />
          <ToggleRow
            label="Round up per person"
            description="Everyone pays a whole amount; the extra goes to the tip"
            value={roundUp}
            onChange={(v) => set("roundUp")(v ? "1" : "0")}
          />
        </Card>

        {r ? (
          <>
            <ResultHero
              label={r.people > 1 ? "Each person pays" : "Total to pay"}
              value={formatMoney(r.perPerson, symbol)}
              note={note}
            />
            <Card className="mt-4">
              <Row label="Bill" value={formatMoney(r.bill, symbol)} />
              <Row
                label={`Tip (${formatSmart(r.tipPercent)}%)`}
                value={formatMoney(r.tip, symbol)}
              />
              <Divider />
              <Row label="Total" value={formatMoney(r.total, symbol)} bold />
              {r.people > 1 && (
                <>
                  <Row
                    label="Tip per person"
                    value={formatMoney(r.tipPerPerson, symbol)}
                  />
                  <Row
                    label="Each person pays"
                    value={formatMoney(r.perPerson, symbol)}
                    highlight
                  />
                </>
              )}
            </Card>
          </>
        ) : (
          <Card className="mt-4 items-center py-8">
            <Text className="text-center text-slate-500 dark:text-slate-400">
              Enter the bill amount to see the tip and each person's share.
            </Text>
          </Card>
        )}

        <InfoTip title="How much should I tip?">
          Tipping customs vary by country. In the US, 15–20% is common at
          restaurants. In the UK and much of Europe, 10–12.5% is typical, and
          it's often already included as a service charge. In many places
          tipping is optional. Check your bill for a service charge before
          adding a tip.
        </InfoTip>
      </ScrollView>
    </View>
  );
}
