import type { Holiday } from "@/types";

function isSameUtcDate(dateA: string | Date, dateB: Date): boolean {
  const a = new Date(dateA);
  const b = new Date(dateB);

  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function calculateLeaveDays({
  startDate,
  endDate,
  halfDay = false,
  holidays = [],
}: {
  startDate: string;
  endDate: string;
  halfDay?: boolean;
  holidays?: Holiday[];
}): number {
  if (halfDay) {
    return 0.5;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(0, 0, 0, 0);

  if (end < start) {
    return 0;
  }

  let leaveDays = 0;
  const current = new Date(start);

  while (current <= end) {
    const isHoliday = holidays.some((holiday) =>
      isSameUtcDate(holiday.date, current)
    );

    if (!isHoliday) {
      leaveDays += 1;
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return leaveDays;
}

export function formatLeaveDayCount(days: number): string {
  if (days === 0.5) {
    return "0.5 day";
  }

  if (days === 1) {
    return "1 day";
  }

  if (Number.isInteger(days)) {
    return `${days} days`;
  }

  return `${days} days`;
}
