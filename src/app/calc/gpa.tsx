import * as Haptics from "expo-haptics";
import { Plus, Trash2 } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "../../components/Card";
import { InfoTip } from "../../components/InfoTip";
import { NumberField } from "../../components/NumberField";
import { ResultHero } from "../../components/ResultHero";
import { Divider, Row } from "../../components/Row";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Segmented } from "../../components/Segmented";
import { ShareButton } from "../../components/ShareButton";
import { SheetSelect } from "../../components/SheetSelect";
import { ToggleRow } from "../../components/ToggleRow";
import { THEME } from "../../constants/app";
import { useAppStore } from "../../store/useAppStore";
import {
    formatNumber,
    formatSmart,
    sanitizeNumberInput,
} from "../../utils/format";
import {
    GPA_SCALES,
    SCALE_MAP,
    calculateGpa,
    newCourse,
    type Course,
} from "../../utils/gpa";
import { shareResult } from "../../utils/share";

const DEFAULT_COURSES: Course[] = [
  { id: "c1", name: "", credits: "3", grade: "" },
  { id: "c2", name: "", credits: "3", grade: "" },
  { id: "c3", name: "", credits: "3", grade: "" },
  { id: "c4", name: "", credits: "3", grade: "" },
];

const DEFAULTS = {
  scale: "4",
  courses: JSON.stringify(DEFAULT_COURSES),
  usePrev: "0",
  prevGpa: "",
  prevCredits: "",
};

export default function GpaCalculator() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  const saved = useAppStore((s) => s.inputs.gpa);
  const setInput = useAppStore((s) => s.setInput);
  const values = { ...DEFAULTS, ...saved };
  const set = (field: string) => (v: string) => setInput("gpa", field, v);

  const scale = SCALE_MAP[values.scale] ?? GPA_SCALES[0];
  const usePrev = values.usePrev === "1";

  const courses: Course[] = useMemo(() => {
    try {
      const parsed = JSON.parse(values.courses);
      return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_COURSES;
    } catch {
      return DEFAULT_COURSES;
    }
  }, [values.courses]);

  const saveCourses = (next: Course[]) => set("courses")(JSON.stringify(next));
  const updateCourse = (id: string, patch: Partial<Course>) =>
    saveCourses(courses.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const addCourse = () => {
    Haptics.selectionAsync();
    saveCourses([...courses, newCourse()]);
  };
  const removeCourse = (id: string) => {
    Haptics.selectionAsync();
    const next = courses.filter((c) => c.id !== id);
    saveCourses(next.length ? next : [newCourse()]);
  };
  const clearAll = () => {
    Haptics.selectionAsync();
    saveCourses(DEFAULT_COURSES);
  };

  const r = useMemo(
    () =>
      calculateGpa(
        courses,
        scale,
        usePrev
          ? { gpa: Number(values.prevGpa), credits: Number(values.prevCredits) }
          : undefined,
      ),
    [courses, scale, usePrev, values.prevGpa, values.prevCredits],
  );

  const gradeOptions = scale.grades.map((g) => ({
    value: g.label,
    label: g.label,
    hint: formatSmart(g.points, 1),
  }));

  const mainGpa = r ? (r.cumulative ?? r.termGpa) : 0;
  const progress = r ? Math.min(mainGpa / scale.max, 1) : 0;

  const onShare = () => {
    if (!r) return;
    const lines = courses
      .filter((c) => c.grade && Number(c.credits) > 0)
      .map(
        (c, i) =>
          `${c.name || `Course ${i + 1}`}: ${c.grade} (${c.credits} credits)`,
      );
    shareResult("GPA result", [
      `Scale: ${scale.label}`,
      ...lines,
      "",
      `GPA: ${formatNumber(r.termGpa, 2)} / ${scale.max}`,
      ...(r.cumulative !== null
        ? [`Cumulative GPA: ${formatNumber(r.cumulative, 2)} / ${scale.max}`]
        : []),
      `Total credits: ${formatSmart(r.totalCredits)}`,
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
          title="GPA"
          right={r ? <ShareButton onPress={onShare} /> : null}
        />

        <Text className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          Grading scale
        </Text>
        <Segmented
          full
          value={scale.id}
          onChange={set("scale")}
          options={GPA_SCALES.map((s) => ({ label: s.label, value: s.id }))}
        />

        {/* Courses */}
        <Card className="mt-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-semibold text-slate-800 dark:text-slate-200">
              Courses ({courses.length})
            </Text>
            <Pressable hitSlop={10} onPress={clearAll}>
              <Text className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                Clear all
              </Text>
            </Pressable>
          </View>

          <View className="mb-1 flex-row px-1">
            <Text className="flex-1 text-xs font-semibold uppercase text-slate-400">
              Course
            </Text>
            <Text className="w-16 text-center text-xs font-semibold uppercase text-slate-400">
              Credits
            </Text>
            <Text className="ml-2 w-20 text-center text-xs font-semibold uppercase text-slate-400">
              Grade
            </Text>
            <View className="w-9" />
          </View>

          {courses.map((c, i) => (
            <View key={c.id} className="mt-2 flex-row items-center">
              <TextInput
                value={c.name}
                onChangeText={(t) => updateCourse(c.id, { name: t })}
                placeholder={`Course ${i + 1}`}
                placeholderTextColor={theme.placeholder}
                accessibilityLabel={`Course ${i + 1} name`}
                className="flex-1 rounded-xl bg-slate-100 px-3 py-2.5 text-slate-900 dark:bg-white/5 dark:text-white"
              />
              <TextInput
                value={c.credits}
                onChangeText={(t) =>
                  updateCourse(c.id, { credits: sanitizeNumberInput(t) })
                }
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={theme.placeholder}
                accessibilityLabel={`Course ${i + 1} credits`}
                selectTextOnFocus
                className="ml-2 w-14 rounded-xl bg-slate-100 py-2.5 text-center font-semibold text-slate-900 dark:bg-white/5 dark:text-white"
              />
              <SheetSelect
                title={`Grade for ${c.name || `Course ${i + 1}`}`}
                options={gradeOptions}
                value={c.grade}
                onChange={(g) => updateCourse(c.id, { grade: g })}
                placeholder="–"
                className="ml-2 w-20"
              />
              <Pressable
                onPress={() => removeCourse(c.id)}
                hitSlop={8}
                accessibilityLabel={`Remove course ${i + 1}`}
                className="ml-1 h-9 w-9 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-white/5"
              >
                <Trash2 size={16} color="#94A3B8" />
              </Pressable>
            </View>
          ))}

          <Pressable
            onPress={addCourse}
            accessibilityRole="button"
            className="mt-4 flex-row items-center justify-center rounded-xl border border-dashed border-brand-500/60 py-3 active:opacity-70"
          >
            <Plus size={18} color="#10B98A" />
            <Text className="ml-1.5 font-semibold text-brand-600 dark:text-brand-400">
              Add course
            </Text>
          </Pressable>
        </Card>

        {/* Previous GPA */}
        <Card className="mt-4">
          <ToggleRow
            label="Include previous GPA"
            description="Get your cumulative GPA including earlier semesters"
            value={usePrev}
            onChange={(v) => set("usePrev")(v ? "1" : "0")}
          />
          {usePrev && (
            <View className="mt-4">
              <NumberField
                label="Previous GPA"
                value={values.prevGpa}
                onChange={set("prevGpa")}
                suffix={`/ ${scale.max}`}
              />
              <NumberField
                label="Previous credits"
                value={values.prevCredits}
                onChange={set("prevCredits")}
              />
            </View>
          )}
        </Card>

        {r ? (
          <>
            <ResultHero
              label={r.cumulative !== null ? "Cumulative GPA" : "Your GPA"}
              value={`${formatNumber(mainGpa, 2)} / ${scale.max}`}
              note={
                r.cumulative !== null
                  ? `This semester: ${formatNumber(r.termGpa, 2)}. Including previous credits, your overall GPA is ${formatNumber(r.cumulative, 2)}.`
                  : `Based on ${r.counted} ${r.counted === 1 ? "course" : "courses"} and ${formatSmart(r.credits)} credits.`
              }
            />

            <Card className="mt-4">
              <View className="mb-3 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <View
                  className="h-full rounded-full bg-student"
                  style={{ width: `${progress * 100}%` }}
                />
              </View>
              <Row
                label="This semester GPA"
                value={formatNumber(r.termGpa, 2)}
              />
              <Row
                label="Credits this semester"
                value={formatSmart(r.credits)}
              />
              <Row label="Grade points" value={formatSmart(r.points, 2)} />
              {r.cumulative !== null && (
                <>
                  <Divider />
                  <Row
                    label="Total credits"
                    value={formatSmart(r.totalCredits)}
                  />
                  <Row
                    label="Cumulative GPA"
                    value={formatNumber(r.cumulative, 2)}
                    highlight
                  />
                </>
              )}
            </Card>
          </>
        ) : (
          <Card className="mt-4 items-center py-8">
            <Text className="text-center text-slate-500 dark:text-slate-400">
              Add credits and pick a grade for at least one course to see your
              GPA.
            </Text>
          </Card>
        )}

        <InfoTip title="How is GPA calculated?">
          {"Each grade is converted to points, multiplied by the course credits, then the total is divided by total credits.\n\n" +
            "Example (4.0 scale): A in a 3-credit course (12 points) and B in a 2-credit course (6 points) = 18 ÷ 5 = 3.60.\n\n" +
            "Grading scales differ between universities, so check your institution's official scale."}
        </InfoTip>
      </ScrollView>
    </View>
  );
}
