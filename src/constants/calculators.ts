import {
    Cake,
    CalendarDays,
    Fuel,
    GraduationCap,
    Landmark,
    Percent,
    PiggyBank,
    Receipt,
    Ruler,
    Tag,
    type LucideIcon,
} from "lucide-react-native";

export type CategoryId = "money" | "everyday" | "student";

export type Calculator = {
  id: string;
  title: string;
  subtitle: string;
  category: CategoryId;
  icon: LucideIcon;
  keywords: string[];
};

export const CATEGORIES: Record<
  CategoryId,
  { title: string; color: string; iconBg: string }
> = {
  money: { title: "Money", color: "#14B8A6", iconBg: "bg-money/15" },
  everyday: { title: "Everyday", color: "#F59E0B", iconBg: "bg-everyday/15" },
  student: { title: "Students", color: "#8B5CF6", iconBg: "bg-student/15" },
};

export const CATEGORY_ORDER: CategoryId[] = ["money", "everyday", "student"];

export const CALCULATORS: Calculator[] = [
  {
    id: "loan",
    title: "Loan / EMI",
    subtitle: "Monthly payment & interest",
    category: "money",
    icon: Landmark,
    keywords: ["emi", "loan", "mortgage", "lease", "installment", "interest"],
  },
  {
    id: "percentage",
    title: "Percentage",
    subtitle: "% of, change, increase",
    category: "money",
    icon: Percent,
    keywords: ["percent", "%", "increase", "decrease", "ratio"],
  },
  {
    id: "discount",
    title: "Discount",
    subtitle: "Sale price & savings",
    category: "money",
    icon: Tag,
    keywords: ["sale", "off", "price", "save", "deal"],
  },
  {
    id: "tip",
    title: "Tip & Split",
    subtitle: "Split the bill fairly",
    category: "money",
    icon: Receipt,
    keywords: ["tip", "bill", "split", "restaurant", "share"],
  },
  {
    id: "interest",
    title: "Savings & Interest",
    subtitle: "Simple & compound growth",
    category: "money",
    icon: PiggyBank,
    keywords: ["compound", "simple", "savings", "deposit", "fd", "investment"],
  },
  {
    id: "age",
    title: "Age",
    subtitle: "Exact age & next birthday",
    category: "everyday",
    icon: Cake,
    keywords: ["birthday", "born", "years", "dob"],
  },
  {
    id: "date",
    title: "Date Difference",
    subtitle: "Days between dates",
    category: "everyday",
    icon: CalendarDays,
    keywords: ["days", "between", "deadline", "add days", "countdown"],
  },
  {
    id: "unit",
    title: "Unit Converter",
    subtitle: "Length, weight, temp & more",
    category: "everyday",
    icon: Ruler,
    keywords: [
      "convert",
      "km",
      "miles",
      "kg",
      "celsius",
      "fahrenheit",
      "length",
    ],
  },
  {
    id: "fuel",
    title: "Fuel & Trip Cost",
    subtitle: "Trip cost & split",
    category: "everyday",
    icon: Fuel,
    keywords: ["petrol", "diesel", "gas", "trip", "travel", "mileage"],
  },
  {
    id: "gpa",
    title: "GPA",
    subtitle: "Grades & credits",
    category: "student",
    icon: GraduationCap,
    keywords: ["cgpa", "grade", "credit", "university", "college", "school"],
  },
];

export const CALC_MAP: Record<string, Calculator> = Object.fromEntries(
  CALCULATORS.map((c) => [c.id, c]),
);
