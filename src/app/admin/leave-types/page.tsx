"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { DeleteLeaveTypeDialog } from "@/components/shared/delete-leave-type-dialog";
import {
  LeaveTypeModal,
  type LeaveTypeModalState,
} from "@/components/shared/leave-type-modal";
import { ActiveBadge } from "@/components/shared/status-badge";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatAccrualTypeLabel,
  formatBooleanLabel,
  getLeaveTypes,
} from "@/lib/leave-types";
import type { LeaveType } from "@/types";

export default function LeaveTypesPage() {
  const [list, setList] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<LeaveTypeModalState | null>(null);
  const [deleting, setDeleting] = useState<LeaveType | null>(null);

  const refreshLeaves = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await getLeaveTypes();
      setList(items);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load leaves";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchLeaves() {
      try {
        const items = await getLeaveTypes();
        if (!cancelled) {
          setList(items);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load leaves";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchLeaves();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaves"
        description="Configure leave types and policy rules in one place"
        actions={
          <Button onClick={() => setModal({ mode: "add" })}>
            <Plus className="mr-2 size-4" />
            Create Leave
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-xl border bg-card">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow>
                <TableHead>Leave Name</TableHead>
                <TableHead>Policy Name</TableHead>
                <TableHead>Annual Quota</TableHead>
                <TableHead>Accrual Type</TableHead>
                <TableHead>Carry Forward</TableHead>
                <TableHead>Max Carry Forward</TableHead>
                <TableHead>Encashment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableEmptyRow colSpan={10} message="No leaves configured yet" />
              ) : (
                list.map((item) => (
                  <TableRow key={item.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.leaveName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.policyName || "—"}</TableCell>
                    <TableCell>{item.annualQuota}</TableCell>
                    <TableCell>{formatAccrualTypeLabel(item.accrualType)}</TableCell>
                    <TableCell>{formatBooleanLabel(item.carryForward)}</TableCell>
                    <TableCell>{item.maxCarryForward}</TableCell>
                    <TableCell>{formatBooleanLabel(item.encashment)}</TableCell>
                    <TableCell>
                      <ActiveBadge active={item.status === "active"} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-60 transition-opacity group-hover:opacity-100"
                          aria-label={`View ${item.leaveName}`}
                          onClick={() => setModal({ mode: "view", item })}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-60 transition-opacity group-hover:opacity-100"
                          aria-label={`Edit ${item.leaveName}`}
                          onClick={() => setModal({ mode: "edit", item })}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive opacity-60 transition-opacity group-hover:opacity-100 hover:text-destructive"
                          aria-label={`Delete ${item.leaveName}`}
                          onClick={() => setDeleting(item)}
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

      <LeaveTypeModal
        state={modal}
        onClose={() => setModal(null)}
        onSuccess={refreshLeaves}
        onEdit={(item) => setModal({ mode: "edit", item })}
      />

      <DeleteLeaveTypeDialog
        item={deleting}
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={refreshLeaves}
      />
    </div>
  );
}
