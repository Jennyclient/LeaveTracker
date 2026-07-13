import type { Holiday, HolidayType } from "@/types";

import type { HolidayInput } from "@/lib/holidays";

export const HOLIDAY_CSV_HEADERS = ["holidayName", "date", "type"] as const;

const HOLIDAY_TYPE_VALUES: HolidayType[] = ["public", "restricted", "optional"];

const HEADER_ALIASES: Record<string, keyof HolidayInput> = {
  holidayname: "holidayName",
  name: "holidayName",
  holiday: "holidayName",
  date: "date",
  type: "type",
};

function toDateInputValue(value: string): string {
  if (!value) {
    return "";
  }

  return value.includes("T") ? value.split("T")[0] : value;
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (inQuotes) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function normalizeHolidayType(value: string): HolidayType | null {
  const normalized = value.trim().toLowerCase();
  return HOLIDAY_TYPE_VALUES.includes(normalized as HolidayType)
    ? (normalized as HolidayType)
    : null;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function holidaysToCsv(holidays: Holiday[]): string {
  const header = HOLIDAY_CSV_HEADERS.join(",");
  const rows = holidays.map((holiday) =>
    [
      escapeCsvField(holiday.name),
      escapeCsvField(toDateInputValue(holiday.date)),
      escapeCsvField(holiday.type.toUpperCase()),
    ].join(",")
  );

  return [header, ...rows].join("\n");
}

export function getHolidayCsvTemplate(): string {
  return [
    HOLIDAY_CSV_HEADERS.join(","),
    "Independence Day,2026-08-15,PUBLIC",
  ].join("\n");
}

export function downloadCsvFile(content: string, filename: string): void {
  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export interface ParsedHolidayCsvRow {
  rowNumber: number;
  input: HolidayInput;
}

export interface HolidayCsvParseError {
  rowNumber: number;
  message: string;
}

export function parseHolidayCsv(content: string): {
  rows: ParsedHolidayCsvRow[];
  errors: HolidayCsvParseError[];
} {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return {
      rows: [],
      errors: [{ rowNumber: 1, message: "CSV file is empty." }],
    };
  }

  const headerValues = parseCsvLine(lines[0]).map((value) => value.toLowerCase());
  const columnMap = new Map<number, keyof HolidayInput>();

  for (let index = 0; index < headerValues.length; index += 1) {
    const mappedKey = HEADER_ALIASES[headerValues[index]];
    if (mappedKey) {
      columnMap.set(index, mappedKey);
    }
  }

  const requiredColumns: Array<keyof HolidayInput> = ["holidayName", "date", "type"];
  const missingColumns = requiredColumns.filter(
    (column) => !Array.from(columnMap.values()).includes(column)
  );

  if (missingColumns.length > 0) {
    return {
      rows: [],
      errors: [
        {
          rowNumber: 1,
          message: `Missing required columns: ${missingColumns.join(", ")}.`,
        },
      ],
    };
  }

  const rows: ParsedHolidayCsvRow[] = [];
  const errors: HolidayCsvParseError[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const rowNumber = lineIndex + 1;
    const values = parseCsvLine(lines[lineIndex]);
    const record: Partial<HolidayInput> = {};

    for (const [columnIndex, field] of columnMap.entries()) {
      record[field] = values[columnIndex]?.trim() ?? "";
    }

    const holidayName = record.holidayName?.trim() ?? "";
    const date = toDateInputValue(record.date ?? "");
    const type = normalizeHolidayType(record.type ?? "");

    if (!holidayName) {
      errors.push({ rowNumber, message: "Holiday name is required." });
      continue;
    }

    if (!date || !isValidDate(date)) {
      errors.push({
        rowNumber,
        message: "Date must be in YYYY-MM-DD format.",
      });
      continue;
    }

    if (!type) {
      errors.push({
        rowNumber,
        message: "Type must be PUBLIC, RESTRICTED, or OPTIONAL.",
      });
      continue;
    }

    rows.push({
      rowNumber,
      input: { holidayName, date, type },
    });
  }

  return { rows, errors };
}
