"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRangeValue {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  value?: DateRangeValue;
  onChange: (value: DateRangeValue | undefined) => void;
  placeholder?: string;
  className?: string;
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDisplayDate(value: string): string {
  const date = parseDate(value);
  return date ? format(date, "dd.MM.yyyy") : "";
}

function toApiDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function toDateRange(value?: DateRangeValue): DateRange | undefined {
  const from = value?.startDate ? parseDate(value.startDate) : undefined;
  const to = value?.endDate ? parseDate(value.endDate) : undefined;

  if (!from && !to) return undefined;
  return { from, to };
}

function isCompleteRange(range?: DateRange): range is { from: Date; to: Date } {
  return Boolean(range?.from && range?.to);
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "dd.mm.yyyy -> dd.mm.yyyy",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>();
  const [month, setMonth] = useState<Date | undefined>();

  const committedRange = useMemo(() => toDateRange(value), [value]);

  const label = useMemo(() => {
    if (!value?.startDate || !value?.endDate) return placeholder;

    const start = formatDisplayDate(value.startDate);
    const end = formatDisplayDate(value.endDate);
    return `${start} -> ${end}`;
  }, [placeholder, value]);

  const hasValue = Boolean(value?.startDate && value?.endDate);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraftRange(committedRange);
      setMonth(committedRange?.from ?? committedRange?.to ?? new Date());
    } else {
      setDraftRange(committedRange);
    }

    setOpen(nextOpen);
  };

  const handleSelect = (range: DateRange | undefined) => {
    setDraftRange(range);

    if (isCompleteRange(range)) {
      onChange({
        startDate: toApiDate(range.from),
        endDate: toApiDate(range.to),
      });
      setOpen(false);
    }
  };

  const handleClear = () => {
    setDraftRange(undefined);
    onChange(undefined);
    setOpen(false);
  };

  return (
    <div
      className={cn(
        "flex h-8 w-72 items-center rounded-lg border border-input bg-background text-sm shadow-xs",
        className
      )}
    >
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-full min-w-0 flex-1 items-center gap-2 px-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              !hasValue && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{label}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            numberOfMonths={2}
            month={month}
            onMonthChange={setMonth}
            selected={draftRange}
            onSelect={handleSelect}
            resetOnSelect
          />
        </PopoverContent>
      </Popover>
      {hasValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="mr-1 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
          aria-label="Clear date range"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
