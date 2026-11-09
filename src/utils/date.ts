import { format, isValid, parseISO, startOfDay } from "date-fns";
import { formatNumber } from "./format";

export const toKey = (d: Date) => format(d, "yyyy-MM-dd");

export const fromKey = (s?: string): Date | null => {
  if (!s) return null;
  const d = parseISO(s);
  return isValid(d) ? startOfDay(d) : null;
};

export const today = () => startOfDay(new Date());

export const pretty = (d: Date) => format(d, "d MMM yyyy");
export const prettyLong = (d: Date) => format(d, "EEEE, d MMMM yyyy");

export const plural = (n: number, word: string) =>
  `${formatNumber(n, 0)} ${word}${Math.abs(n) === 1 ? "" : "s"}`;

export function countWeekdays(start: Date, daysCount: number): number {
  const fullWeeks = Math.floor(daysCount / 7);
  let count = fullWeeks * 5;
  const startDow = start.getDay();
  for (let i = 0; i < daysCount % 7; i++) {
    const dow = (startDow + i) % 7;
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}
