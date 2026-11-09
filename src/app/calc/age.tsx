import {
    addYears,
    differenceInCalendarDays,
    differenceInMonths,
    differenceInWeeks,
    format,
    intervalToDuration,
    isAfter,
    isBefore,
    isSameDay,
    setYear,
} from "date-fns";
import { Cake } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { DateField } from "../../components/DateField";
import { InfoTip } from "../../components/InfoTip";
import { ResultHero } from "../../components/ResultHero";
import { ScreenHeader } from "../../components/ScreenHeader";
import { ShareButton } from "../../components/ShareButton";
import { StatGrid } from "../../components/StatGrid";
import { useAppStore } from "../../store/useAppStore";
import {
    fromKey,
    plural,
    pretty,
    prettyLong,
    toKey,
    today,
} from "../../utils/date";
import { formatNumber } from "../../utils/format";
import { shareResult } from "../../utils/share";

const DEFAULT_BIRTH = "2000-01-01";

export default function AgeCalculator() {
  const insets = useSafeAreaInsets();
  const saved = useAppStore((s) => s.inputs.age);
  const setInput = useAppStore((s) => s.setInput);

  const now = today();
  const birth = fromKey(saved?.birth) ?? fromKey(DEFAULT_BIRTH)!;
  const onDate = fromKey(saved?.onDate) ?? now; // empty = today
  const isToday = isSameDay(onDate, now);

  const r = useMemo(() => {
    if (isAfter(birth, onDate)) return null;

    const d = intervalToDuration({ start: birth, end: onDate });
    const years = d.years ?? 0;
    const months = d.months ?? 0;
    const days = d.days ?? 0;
    const totalDays = differenceInCalendarDays(onDate, birth);

    let next = setYear(birth, onDate.getFullYear());
    if (isBefore(next, onDate)) next = addYears(next, 1);
    const daysToBirthday = differenceInCalendarDays(next, onDate);

    return {
      years,
      months,
      days,
      totalMonths: differenceInMonths(onDate, birth),
      totalWeeks: differenceInWeeks(onDate, birth),
      totalDays,
      totalHours: totalDays * 24,
      next,
      daysToBirthday,
      turning: next.getFullYear() - birth.getFullYear(),
      bornDay: format(birth, "EEEE"),
    };
  }, [birth.getTime(), onDate.getTime()]);

  const ageText = r
    ? `${plural(r.years, "year")}, ${plural(r.months, "month")} and ${plural(r.days, "day")}`
    : "";

  const onShare = () => {
    if (!r) return;
    shareResult("Age result", [
      `Date of birth: ${pretty(birth)} (${r.bornDay})`,
      `Age ${isToday ? "today" : `on ${pretty(onDate)}`}: ${ageText}`,
      `Total days: ${formatNumber(r.totalDays, 0)}`,
      r.daysToBirthday === 0
        ? `Birthday today! Turning ${r.turning} 🎉`
        : `Next birthday in ${plural(r.daysToBirthday, "day")} (${prettyLong(r.next)})`,
    ]);
  };

  return (
    <View className="flex-1 bg-surface-light dark:bg-surface-dark">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 90,
          paddingHorizontal: 16,
        }}
      >
        <ScreenHeader
          title="Age"
          right={r ? <ShareButton onPress={onShare} /> : null}
        />

        <Card>
          <DateField
            label="Date of birth"
            value={birth}
            maximumDate={onDate}
            onChange={(d) => setInput("age", "birth", toKey(d))}
          />
          <DateField
            label="Age on"
            value={onDate}
            onChange={(d) =>
              setInput("age", "onDate", isSameDay(d, now) ? "" : toKey(d))
            }
            labelRight={
              isToday ? (
                <Text className="text-xs text-slate-400">Today</Text>
              ) : (
                <Pressable
                  hitSlop={10}
                  onPress={() => setInput("age", "onDate", "")}
                >
                  <Text className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                    Reset to today
                  </Text>
                </Pressable>
              )
            }
          />
        </Card>

        {r ? (
          <>
            <ResultHero
              label={isToday ? "Your age" : `Age on ${pretty(onDate)}`}
              value={plural(r.years, "year")}
              note={ageText}
            />

            <Card className="mt-4 flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-everyday/15">
                <Cake size={24} color="#F59E0B" />
              </View>
              <View className="ml-3 flex-1">
                {r.daysToBirthday === 0 ? (
                  <>
                    <Text className="text-base font-bold text-slate-900 dark:text-white">
                      Happy birthday! 🎉
                    </Text>
                    <Text className="mt-0.5 text-slate-500 dark:text-slate-400">
                      Turning {r.turning} today
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-base font-bold text-slate-900 dark:text-white">
                      Next birthday in {plural(r.daysToBirthday, "day")}
                    </Text>
                    <Text className="mt-0.5 text-slate-500 dark:text-slate-400">
                      Turning {r.turning} on {prettyLong(r.next)}
                    </Text>
                  </>
                )}
              </View>
            </Card>

            <StatGrid
              title="Fun facts"
              stats={[
                {
                  label: "Total months",
                  value: formatNumber(r.totalMonths, 0),
                },
                { label: "Total weeks", value: formatNumber(r.totalWeeks, 0) },
                { label: "Total days", value: formatNumber(r.totalDays, 0) },
                { label: "Total hours", value: formatNumber(r.totalHours, 0) },
                { label: "Born on a", value: r.bornDay },
                {
                  label: "Days to birthday",
                  value: formatNumber(r.daysToBirthday, 0),
                },
              ]}
            />
          </>
        ) : (
          <Card className="mt-4 items-center py-8">
            <Text className="text-center text-slate-500 dark:text-slate-400">
              The date of birth must be before the "Age on" date.
            </Text>
          </Card>
        )}

        <InfoTip title="How is age calculated?">
          Age is counted in full years, then full months, then remaining days,
          the same way it's done on official forms. Set "Age on" to a future or
          past date to check your age on that day, for example an exam or job
          application deadline.
        </InfoTip>
      </ScrollView>
    </View>
  );
}
