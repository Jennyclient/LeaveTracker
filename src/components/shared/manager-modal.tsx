"use client";

import type { ReactNode } from "react";
import { Eye } from "lucide-react";

import { ActiveBadge } from "@/components/shared/status-badge";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import type { Manager } from "@/types";

function ReadOnlyField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex min-h-9 items-center rounded-md border bg-muted/30 px-3 py-2 text-sm">
        {value || "—"}
      </div>
    </div>
  );
}

interface ManagerModalProps {
  manager: Manager | null;
  onClose: () => void;
}

export function ManagerModal({ manager, onClose }: ManagerModalProps) {
  const open = manager !== null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b bg-muted/20 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Eye className="size-5" />
            </div>
            <div>
              <DialogTitle>Manager Details</DialogTitle>
              <DialogDescription>
                {manager ? `Viewing ${manager.name}` : "View manager information"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {manager && (
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Personal Information
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReadOnlyField label="Full Name" value={manager.name} />
                  <ReadOnlyField label="Employee ID" value={manager.employeeId} />
                  <ReadOnlyField label="Email" value={manager.email} />
                  <ReadOnlyField label="Contact Number" value={manager.contactNo} />
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Status</Label>
                    <div className="flex min-h-9 items-center">
                      <ActiveBadge active={manager.status === "active"} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Job Information
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReadOnlyField label="Designation" value={manager.designation} />
                  <ReadOnlyField
                    label="Joining Date"
                    value={formatDate(manager.joinDate)}
                  />
                  <ReadOnlyField label="Team Size" value={manager.teamSize} />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Team Members ({manager.teamMembers.length})
                </p>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {manager.teamMembers.length === 0 ? (
                        <TableEmptyRow colSpan={3} message="No team members found" />
                      ) : (
                        manager.teamMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.designation}</TableCell>
                            <TableCell>
                              <ActiveBadge active={member.status === "active"} />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 px-0 sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
