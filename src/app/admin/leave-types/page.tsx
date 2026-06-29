"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ActiveBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leaveTypes } from "@/data/mock-data";

export default function LeaveTypesPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Types"
        description="Configure leave types and their accrual rules"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create Leave Type
          </Button>
        }
      />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Annual Quota</TableHead>
              <TableHead>Accrual Type</TableHead>
              <TableHead>Carry Forward</TableHead>
              <TableHead>Max Carry Forward</TableHead>
              <TableHead>Encashment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveTypes.map((lt) => (
              <TableRow key={lt.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: lt.color }}
                    />
                    <span className="font-medium">{lt.name}</span>
                  </div>
                </TableCell>
                <TableCell>{lt.annualQuota || "—"}</TableCell>
                <TableCell className="capitalize">{lt.accrualType}</TableCell>
                <TableCell>{lt.carryForward ? "Yes" : "No"}</TableCell>
                <TableCell>{lt.maxCarryForward || "—"}</TableCell>
                <TableCell>{lt.encashment ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <ActiveBadge active={lt.active} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Leave Type</DialogTitle>
            <DialogDescription>Define a new leave type for your organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="e.g. Paid Leave" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Annual Quota</Label>
                <Input type="number" placeholder="18" />
              </div>
              <div className="space-y-2">
                <Label>Accrual Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Carry Forward</Label>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label>Max Carry Forward</Label>
              <Input type="number" placeholder="5" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Encashment</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active Status</Label>
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
