import { format, parseISO } from "date-fns";

import type { HalfDayPeriod } from "@/types";

export function toDateKey(date: string | Date): string {
  if (typeof date === "string") {
    return date.includes("T") ? date.split("T")[0] : date;
  }

  return format(date, "yyyy-MM-dd");
}

export function isDateWithinRange(
  day: string | Date,
  startDate: string,
  endDate: string
): boolean {
  const dayKey = toDateKey(day);
  const startKey = toDateKey(startDate);
  const endKey = toDateKey(endDate);

  return dayKey >= startKey && dayKey <= endKey;
}

export function formatDate(date: string, pattern = "MMM d, yyyy"): string {
  return format(parseISO(date), pattern);
}

export function formatShortDate(date: string): string {
  return formatDate(date, "MMM d");
}

export function formatHalfDayPeriod(period?: HalfDayPeriod): string {
  if (period === "FIRST_HALF") {
    return "First Half";
  }
  if (period === "SECOND_HALF") {
    return "Second Half";
  }
  return "";
}
