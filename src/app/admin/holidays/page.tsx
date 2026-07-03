"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  createHoliday,
  deleteHoliday,
  getHolidays,
  updateHoliday,
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

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingHoliday, setDeletingHoliday] = useState<Holiday | null>(null);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [form, setForm] = useState<HolidayFormState>(INITIAL_FORM);

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

  const handleSaveHoliday = async () => {
    const holidayName = form.holidayName.trim();
    if (!holidayName || !form.date) {
      toast.error("Holiday name and date are required");
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Holiday Management"
        description="Manage company holidays and calendar"
        actions={
          <Button onClick={openAddModal}>
            <Plus className="mr-2 size-4" />
            Add Holiday
          </Button>
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Holiday Name</Label>
              <Input
                placeholder="e.g. Independence Day"
                value={form.holidayName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, holidayName: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, date: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    type: value as HolidayFormState["type"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetAndCloseModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={() => void handleSaveHoliday()} disabled={isSaving}>
              {isSaving
                ? editingHoliday
                  ? "Updating..."
                  : "Adding..."
                : editingHoliday
                  ? "Update Holiday"
                  : "Add Holiday"}
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
