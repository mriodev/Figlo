export type Grade = { label: string; points: number };
export type GpaScale = {
  id: string;
  label: string;
  max: number;
  grades: Grade[];
};

export const GPA_SCALES: GpaScale[] = [
  {
    id: "4",
    label: "4.0",
    max: 4,
    grades: [
      { label: "A", points: 4.0 },
      { label: "A-", points: 3.7 },
      { label: "B+", points: 3.3 },
      { label: "B", points: 3.0 },
      { label: "B-", points: 2.7 },
      { label: "C+", points: 2.3 },
      { label: "C", points: 2.0 },
      { label: "C-", points: 1.7 },
      { label: "D+", points: 1.3 },
      { label: "D", points: 1.0 },
      { label: "F", points: 0 },
    ],
  },
  {
    id: "4p",
    label: "4.0 (A+)",
    max: 4,
    grades: [
      { label: "A+", points: 4.0 },
      { label: "A", points: 4.0 },
      { label: "A-", points: 3.7 },
      { label: "B+", points: 3.3 },
      { label: "B", points: 3.0 },
      { label: "B-", points: 2.7 },
      { label: "C+", points: 2.3 },
      { label: "C", points: 2.0 },
      { label: "C-", points: 1.7 },
      { label: "D+", points: 1.3 },
      { label: "D", points: 1.0 },
      { label: "E", points: 0 },
    ],
  },
  {
    id: "5",
    label: "5.0",
    max: 5,
    grades: [
      { label: "A", points: 5 },
      { label: "B", points: 4 },
      { label: "C", points: 3 },
      { label: "D", points: 2 },
      { label: "E", points: 1 },
      { label: "F", points: 0 },
    ],
  },
  {
    id: "10",
    label: "10-point",
    max: 10,
    grades: [
      { label: "O", points: 10 },
      { label: "A+", points: 9 },
      { label: "A", points: 8 },
      { label: "B+", points: 7 },
      { label: "B", points: 6 },
      { label: "C", points: 5 },
      { label: "P", points: 4 },
      { label: "F", points: 0 },
    ],
  },
];

export const SCALE_MAP = Object.fromEntries(GPA_SCALES.map((s) => [s.id, s]));

export type Course = {
  id: string;
  name: string;
  credits: string;
  grade: string;
};

export const newCourse = (): Course => ({
  id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
  name: "",
  credits: "3",
  grade: "",
});

export function calculateGpa(
  courses: Course[],
  scale: GpaScale,
  previous?: { gpa: number; credits: number },
) {
  let credits = 0;
  let points = 0;
  let counted = 0;

  for (const c of courses) {
    const cr = Number(c.credits);
    const grade = scale.grades.find((g) => g.label === c.grade);
    if (!(cr > 0) || !grade) continue;
    credits += cr;
    points += cr * grade.points;
    counted++;
  }

  if (credits === 0) return null;

  const termGpa = points / credits;
  let cumulative: number | null = null;
  let totalCredits = credits;

  if (
    previous &&
    previous.credits > 0 &&
    previous.gpa >= 0 &&
    previous.gpa <= scale.max
  ) {
    totalCredits = credits + previous.credits;
    cumulative = (points + previous.gpa * previous.credits) / totalCredits;
  }

  return { termGpa, cumulative, credits, points, totalCredits, counted };
}
