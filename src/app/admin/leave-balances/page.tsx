"use client";

import { Minus, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leaveBalances } from "@/data/mock-data";
import { toast } from "sonner";

export default function LeaveBalancesPage() {
  const handleAction = (action: string, name: string) => {
    toast.info(`${action} balance for ${name}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Balances"
        description="View and adjust employee leave balances"
      />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Paid Leave</TableHead>
              <TableHead>Casual Leave</TableHead>
              <TableHead>Sick Leave</TableHead>
              <TableHead>Comp Off</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveBalances.map((bal) => (
              <TableRow key={bal.employeeId}>
                <TableCell className="font-medium">{bal.employeeName}</TableCell>
                <TableCell>{bal.paidLeave}</TableCell>
                <TableCell>{bal.casualLeave}</TableCell>
                <TableCell>{bal.sickLeave}</TableCell>
                <TableCell>{bal.compOff}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction("Adjusted", bal.employeeName)}
                    >
                      Adjust
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleAction("Added leave to", bal.employeeName)}
                    >
                      <Plus className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleAction("Deducted leave from", bal.employeeName)}
                    >
                      <Minus className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
