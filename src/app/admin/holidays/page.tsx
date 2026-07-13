"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format as formatDateFns } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
} from "date-fns";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { FormField } from "@/components/shared/form-field";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormErrors } from "@/hooks/use-form-errors";
import {
  buildFieldErrors,
  hasFieldErrors,
  validateRequired,
} from "@/lib/form-validation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import {
  downloadCsvFile,
  getHolidayCsvTemplate,
  holidaysToCsv,
  parseHolidayCsv,
} from "@/lib/holiday-csv";
import {
  createHoliday,
  deleteHoliday,
  getHolidays,
  importHolidays,
  updateHoliday,
  type HolidayImportResult,
} from "@/lib/holidays";
import { cn } from "@/lib/utils";
import type { Holiday } from "@/types";

type HolidayFormState = {
  holidayName: string;
  date: string;
  type: "public" | "restricted" | "optional";
};

const INITIAL_FORM: HolidayFormState = {
  holidayName: "",
  date: "",
  type: "public",
};

function toDateInputValue(value: string): string {
  if (!value) {
    return "";
  }

  // Handles ISO datetime values like 2026-08-15T00:00:00.000Z
  return value.includes("T") ? value.split("T")[0] : value;
}

type HolidayField = "holidayName" | "date";

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<HolidayImportResult | null>(null);
  const [deletingHoliday, setDeletingHoliday] = useState<Holiday | null>(null);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [form, setForm] = useState<HolidayFormState>(INITIAL_FORM);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { errors, setFormErrors, clearFieldError, clearAllErrors } =
    useFormErrors<HolidayField>();

  const holidaysByDate = useMemo(() => {
    const holidayMap = new Map<string, Holiday>();
    for (const holiday of holidays) {
      holidayMap.set(toDateInputValue(holiday.date), holiday);
    }
    return holidayMap;
  }, [holidays]);

  const getHolidayForDay = (day: Date) => holidaysByDate.get(format(day, "yyyy-MM-dd"));

  const loadHolidays = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await getHolidays();
      setHolidays(items);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch holidays";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadHolidays();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadHolidays]);

  const sortedHolidays = useMemo(
    () => [...holidays].sort((a, b) => a.date.localeCompare(b.date)),
    [holidays]
  );

  const resetAndCloseModal = () => {
    setModalOpen(false);
    setEditingHoliday(null);
    setForm(INITIAL_FORM);
    clearAllErrors();
  };

  const openAddModal = () => {
    setEditingHoliday(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEditModal = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setForm({
      holidayName: holiday.name,
      date: toDateInputValue(holiday.date),
      type: holiday.type,
    });
    setModalOpen(true);
  };

  const handleSaveHoliday = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const holidayName = form.holidayName.trim();
    const nextErrors = buildFieldErrors<HolidayField>([
      { field: "holidayName", error: validateRequired(holidayName, "Holiday name is required") },
      { field: "date", error: validateRequired(form.date, "Date is required") },
    ]);

    setFormErrors(nextErrors);

    if (hasFieldErrors(nextErrors)) {
      return;
    }

    setIsSaving(true);
    try {
      if (editingHoliday) {
        await updateHoliday(editingHoliday.id, {
          holidayName,
          date: toDateInputValue(form.date),
          type: form.type,
        });
        toast.success("Holiday updated");
      } else {
        await createHoliday({
          holidayName,
          date: toDateInputValue(form.date),
          type: form.type,
        });
        toast.success("Holiday added");
      }
      await loadHolidays();
      resetAndCloseModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save holiday";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHoliday = async () => {
    if (!deletingHoliday) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteHoliday(deletingHoliday.id);
      toast.success("Holiday deleted");
      setDeletingHoliday(null);
      await loadHolidays();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete holiday";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadCsvFile(getHolidayCsvTemplate(), "holiday-template.csv");
  };

  const handleExportCsv = () => {
    if (sortedHolidays.length === 0) {
      toast.error("No holidays available to export");
      return;
    }

    const filename = `holidays-${formatDateFns(new Date(), "yyyy-MM-dd")}.csv`;
    downloadCsvFile(holidaysToCsv(sortedHolidays), filename);
    toast.success("Holiday list exported");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    setIsImporting(true);
    try {
      const content = await file.text();
      const { rows, errors } = parseHolidayCsv(content);

      if (errors.length > 0) {
        const preview = errors
          .slice(0, 3)
          .map((error) => `Row ${error.rowNumber}: ${error.message}`)
          .join(" ");
        toast.error(
          errors.length > 3
            ? `${preview} ...and ${errors.length - 3} more error(s).`
            : preview
        );
        return;
      }

      if (rows.length === 0) {
        toast.error("No holiday rows found in the CSV file");
        return;
      }

      const result = await importHolidays(
        rows.map((row) => row.input),
        rows.map((row) => row.rowNumber)
      );

      setImportResult(result);
      await loadHolidays();

      if (result.created > 0 && result.failed.length === 0) {
        toast.success(`${result.created} holiday(s) imported successfully`);
        setImportResult(null);
      } else if (result.created > 0) {
        toast.warning(
          `${result.created} holiday(s) imported, ${result.failed.length} failed`
        );
      } else {
        toast.error("No holidays were imported");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to import holidays";
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Holiday Management"
        description="Manage company holidays and calendar"
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => void handleImportFile(event)}
            />
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              disabled={isImporting}
            >
              <Download className="mr-2 size-4" />
              Template
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCsv}
              disabled={isLoading || isImporting || sortedHolidays.length === 0}
            >
              <Download className="mr-2 size-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleImportClick}
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Upload className="mr-2 size-4" />
              )}
              {isImporting ? "Importing..." : "Import CSV"}
            </Button>
            <Button onClick={openAddModal} disabled={isImporting}>
              <Plus className="mr-2 size-4" />
              Add Holiday
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{format(visibleMonth, "MMMM yyyy")} Holiday Calendar</CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setVisibleMonth((prev) => addMonths(prev, -1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleMonth(startOfMonth(new Date()))}
              >
                Current Month
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setVisibleMonth((prev) => addMonths(prev, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const monthStart = startOfMonth(visibleMonth);
            const monthEnd = endOfMonth(visibleMonth);
            const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
            const startPadding = getDay(monthStart);

            return (
              <>
                <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startPadding }).map((_, index) => (
                    <div key={`pad-${format(visibleMonth, "yyyy-MM")}-${index}`} />
                  ))}
                  {days.map((day) => {
                    const holiday = getHolidayForDay(day);
                    return (
                      <div
                        key={day.toISOString()}
                        title={holiday?.name}
                        className={cn(
                          "flex min-h-12 w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-md p-1 text-sm",
                          holiday && "bg-primary/10 font-medium text-primary",
                          !holiday && "hover:bg-muted"
                        )}
                      >
                        <span>{format(day, "d")}</span>
                        {holiday && (
                          <span className="mt-0.5 w-full truncate text-center text-[9px] leading-tight">
                            {holiday.name}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={4} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holiday Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHolidays.length === 0 ? (
                <TableEmptyRow colSpan={4} message="No holidays found" />
              ) : (
                sortedHolidays.map((holiday) => (
                  <TableRow key={holiday.id} className="group">
                    <TableCell className="font-medium">{holiday.name}</TableCell>
                    <TableCell>{formatDate(holiday.date)}</TableCell>
                    <TableCell className="capitalize">{holiday.type}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-60 transition-opacity group-hover:opacity-100"
                          aria-label={`Edit ${holiday.name}`}
                          onClick={() => openEditModal(holiday)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive opacity-60 transition-opacity group-hover:opacity-100 hover:text-destructive"
                          aria-label={`Delete ${holiday.name}`}
                          onClick={() => setDeletingHoliday(holiday)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetAndCloseModal();
            return;
          }
          setModalOpen(true);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingHoliday ? "Edit Holiday" : "Add Holiday"}</DialogTitle>
            <DialogDescription>
              {editingHoliday
                ? "Update holiday details"
                : "Add a new holiday to the calendar"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => void handleSaveHoliday(event)}
            className="space-y-5"
            noValidate
          >
            <FormField
              label="Holiday Name"
              htmlFor="holiday-name"
              required
              error={errors.holidayName}
            >
              <Input
                id="holiday-name"
                placeholder="e.g. Independence Day"
                value={form.holidayName}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, holidayName: event.target.value }));
                  clearFieldError("holidayName");
                }}
              />
            </FormField>
            <FormField label="Date" htmlFor="holiday-date" required error={errors.date}>
              <Input
                id="holiday-date"
                type="date"
                value={form.date}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, date: event.target.value }));
                  clearFieldError("date");
                }}
              />
            </FormField>
            <FormField label="Type" htmlFor="holiday-type" required>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    type: value as HolidayFormState["type"],
                  }))
                }
              >
                <SelectTrigger id="holiday-type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetAndCloseModal}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? editingHoliday
                    ? "Updating..."
                    : "Adding..."
                  : editingHoliday
                    ? "Update Holiday"
                    : "Add Holiday"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={importResult !== null && importResult.failed.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setImportResult(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Results</DialogTitle>
            <DialogDescription>
              {importResult?.created
                ? `${importResult.created} holiday(s) imported successfully.`
                : "No holidays were imported."}{" "}
              {importResult?.failed.length
                ? `${importResult.failed.length} row(s) could not be imported.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3 text-sm">
            {importResult?.failed.map((failure) => (
              <div key={`${failure.rowNumber}-${failure.holidayName}-${failure.date}`}>
                <p className="font-medium">
                  Row {failure.rowNumber}: {failure.holidayName} ({failure.date})
                </p>
                <p className="text-muted-foreground">{failure.error}</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setImportResult(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletingHoliday !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeletingHoliday(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Trash2 className="size-5" />
            </div>
            <DialogTitle>Delete Holiday</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">{deletingHoliday?.name}</span>{" "}
              scheduled on {deletingHoliday ? formatDate(deletingHoliday.date) : "-"}.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingHoliday(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleDeleteHoliday()}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Holiday"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
