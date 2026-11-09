import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    differenceInCalendarDays,
    intervalToDuration,
    isAfter,
} from "date-fns";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { DateField } from "../../components/DateField";
import { InfoTip } from "../../components/InfoTip";
import { NumberField } from "../../components/NumberField";
import { QuickChips } from "../../components/QuickChips";
import { ResultHero } from "../../components/ResultHero";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Segmented } from "../../components/Segmented";
import { ShareButton } from "../../components/ShareButton";
import { StatGrid } from "../../components/StatGrid";
import { ToggleRow } from "../../components/ToggleRow";
import { useAppStore } from "../../store/useAppStore";
import {
    countWeekdays,
    fromKey,
    plural,
    pretty,
    prettyLong,
    toKey,
    today,
} from "../../utils/date";
import { formatNumber } from "../../utils/format";
import { shareResult } from "../../utils/share";

const DEFAULTS = {
  mode: "between",
  start: "",
  end: "",
  includeEnd: "0",
  addStart: "",
  op: "add",
  amount: "30",
  unit: "day",
};

const UNIT_FN = {
  day: addDays,
  week: addWeeks,
  month: addMonths,
  year: addYears,
};

export default function DateCalculator() {
  const insets = useSafeAreaInsets();
  const saved = useAppStore((s) => s.inputs.date);
  const setInput = useAppStore((s) => s.setInput);

  const values = { ...DEFAULTS, ...saved };
  const set = (field: string) => (v: string) => setInput("date", field, v);
  const now = today();

  const start = fromKey(values.start) ?? now;
  const end = fromKey(values.end) ?? addDays(now, 30);
  const addStart = fromKey(values.addStart) ?? now;
  const includeEnd = values.includeEnd === "1";
  const isBetween = values.mode === "between";

  // ---- Between dates ----
  const between = useMemo(() => {
    let s = start;
    let e = end;
    const swapped = isAfter(s, e);
    if (swapped) [s, e] = [e, s];

    const days = differenceInCalendarDays(e, s) + (includeEnd ? 1 : 0);
    const d = intervalToDuration({
      start: s,
      end: includeEnd ? addDays(e, 1) : e,
    });

    return {
      swapped,
      days,
      years: d.years ?? 0,
      months: d.months ?? 0,
      remDays: d.days ?? 0,
      weeks: Math.floor(days / 7),
      weekRem: days % 7,
      workdays: countWeekdays(s, days),
      weekends: days - countWeekdays(s, days),
    };
  }, [start.getTime(), end.getTime(), includeEnd]);

  // ---- Add / subtract ----
  const amount = Math.floor(Number(values.amount) || 0);
  const unit = (
    values.unit in UNIT_FN ? values.unit : "day"
  ) as keyof typeof UNIT_FN;
  const sign = values.op === "add" ? 1 : -1;
  const added = UNIT_FN[unit](addStart, amount * sign);
  const fromToday = differenceInCalendarDays(added, now);
  const relative =
    fromToday === 0
      ? "That's today."
      : fromToday > 0
        ? `That's ${plural(fromToday, "day")} from today.`
        : `That was ${plural(-fromToday, "day")} ago.`;

  const breakdown = [
    between.years ? plural(between.years, "year") : "",
    between.months ? plural(between.months, "month") : "",
    between.remDays || (!between.years && !between.months)
      ? plural(between.remDays, "day")
      : "",
  ]
    .filter(Boolean)
    .join(", ");

  const onShare = () => {
    if (isBetween) {
      shareResult("Days between dates", [
        `From: ${pretty(start)}`,
        `To: ${pretty(end)}${includeEnd ? " (end date included)" : ""}`,
        `Total: ${plural(between.days, "day")} (${breakdown})`,
        `Working days (Mon–Fri): ${formatNumber(between.workdays, 0)}`,
      ]);
    } else {
      shareResult("Date result", [
        `${pretty(addStart)} ${sign > 0 ? "+" : "−"} ${plural(amount, unit)}`,
        `= ${prettyLong(added)}`,
      ]);
    }
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
          title="Date Difference"
          right={<ShareButton onPress={onShare} />}
        />

        <Segmented
          full
          value={values.mode}
          onChange={set("mode")}
          options={[
            { label: "Between dates", value: "between" },
            { label: "Add / subtract", value: "add" },
          ]}
        />

        {isBetween ? (
          <>
            <Card className="mt-4">
              <DateField
                label="Start date"
                value={start}
                onChange={(d) => set("start")(toKey(d))}
              />
              <DateField
                label="End date"
                value={end}
                onChange={(d) => set("end")(toKey(d))}
              />
              <ToggleRow
                label="Include end date"
                description="Count the last day too (e.g. for leave or bookings)"
                value={includeEnd}
                onChange={(v) => set("includeEnd")(v ? "1" : "0")}
              />
            </Card>

            <ResultHero
              label="Total"
              value={plural(between.days, "day")}
              note={`${breakdown}.${
                between.swapped
                  ? " (End date was before start date, so they were swapped.)"
                  : ""
              }`}
            />

            <StatGrid
              stats={[
                {
                  label: "Weeks",
                  value:
                    between.weekRem > 0
                      ? `${formatNumber(between.weeks, 0)} w ${between.weekRem} d`
                      : `${formatNumber(between.weeks, 0)} w`,
                },
                {
                  label: "Months (approx.)",
                  value: formatNumber(between.years * 12 + between.months, 0),
                },
                {
                  label: "Working days",
                  value: formatNumber(between.workdays, 0),
                },
                {
                  label: "Weekend days",
                  value: formatNumber(between.weekends, 0),
                },
              ]}
            />
          </>
        ) : (
          <>
            <Card className="mt-4">
              <DateField
                label="Start date"
                value={addStart}
                onChange={(d) => set("addStart")(toKey(d))}
              />
              <View className="mb-5">
                <Segmented
                  full
                  value={values.op}
                  onChange={set("op")}
                  options={[
                    { label: "Add", value: "add" },
                    { label: "Subtract", value: "sub" },
                  ]}
                />
              </View>
              <NumberField
                label="Amount"
                value={values.amount}
                onChange={set("amount")}
              />
              <QuickChips
                values={[7, 14, 30, 60, 90, 180]}
                selected={values.amount}
                onSelect={set("amount")}
              />
              <Segmented
                full
                value={unit}
                onChange={set("unit")}
                options={[
                  { label: "Days", value: "day" },
                  { label: "Weeks", value: "week" },
                  { label: "Months", value: "month" },
                  { label: "Years", value: "year" },
                ]}
              />
            </Card>

            <ResultHero
              label="Result"
              value={pretty(added)}
              note={`${prettyLong(added)}. ${relative}`}
            />
          </>
        )}

        <InfoTip title="Tips">
          {'• "Include end date" is useful for leave, hotel stays or events, where both the first and last day count.\n' +
            "• Working days count Monday to Friday only; public holidays aren't removed.\n" +
            "• Adding months keeps the same day where possible (Jan 31 + 1 month = Feb 28 or 29)."}
        </InfoTip>
      </ScrollView>
    </View>
  );
}
