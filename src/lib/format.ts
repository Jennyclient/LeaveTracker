import { format, parseISO } from "date-fns";

export function formatDate(date: string, pattern = "MMM d, yyyy"): string {
  return format(parseISO(date), pattern);
}

export function formatShortDate(date: string): string {
  return formatDate(date, "MMM d");
}
