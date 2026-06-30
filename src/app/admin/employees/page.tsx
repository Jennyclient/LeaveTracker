"use client";

import { useState } from "react";
import { Eye, Pencil, Plus, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { ActiveBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import { employees as initialEmployees, leavePolicies, managers } from "@/data/mock-data";
import { formatDate } from "@/lib/format";
import type { Employee } from "@/types";

type EmployeeForm = {
  name: string;
  email: string;
  managerId: string;
  leavePolicyId: string;
};

const emptyForm: EmployeeForm = {
  name: "",
  email: "",
  managerId: "",
  leavePolicyId: "",
};

export default function EmployeesPage() {
  const [list, setList] = useState<Employee[]>(initialEmployees);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [viewing, setViewing] = useState<Employee | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setForm({
      name: emp.name,
      email: emp.email,
      managerId: emp.managerId,
      leavePolicyId: emp.leavePolicyId,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    const manager = managers.find((m) => m.id === form.managerId);
    const policy = leavePolicies.find((p) => p.id === form.leavePolicyId);

    if (editingId) {
      setList((prev) =>
        prev.map((emp) =>
          emp.id === editingId
            ? {
                ...emp,
                name: form.name.trim(),
                email: form.email.trim(),
                managerId: form.managerId,
                manager: manager?.name ?? emp.manager,
                leavePolicyId: form.leavePolicyId,
                leavePolicy: policy?.name ?? emp.leavePolicy,
              }
            : emp
        )
      );
      toast.success(`${form.name.trim()} has been updated`);
    } else {
      const nextNumber = list.length + 1;
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        employeeId: `EMP-${String(nextNumber).padStart(3, "0")}`,
        name: form.name.trim(),
        email: form.email.trim(),
        manager: manager?.name ?? "Unassigned",
        managerId: form.managerId,
        leavePolicy: policy?.name ?? "Standard Policy",
        leavePolicyId: form.leavePolicyId,
        status: "active",
        joinDate: new Date().toISOString().slice(0, 10),
        designation: "New Hire",
      };
      setList((prev) => [...prev, newEmployee]);
      toast.success(`${newEmployee.name} has been added`);
    }

    setFormOpen(false);
  };

  const toggleStatus = (emp: Employee) => {
    const nextStatus = emp.status === "active" ? "inactive" : "active";
    setList((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, status: nextStatus } : e))
    );
    toast.success(
      `${emp.name} has been ${nextStatus === "active" ? "activated" : "deactivated"}`
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage employee records and leave policy assignments"
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-2 size-4" />
            Add Employee
          </Button>
        }
      />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Leave Policy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-mono text-xs">{emp.employeeId}</TableCell>
                <TableCell className="font-medium">{emp.name}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.manager}</TableCell>
                <TableCell>{emp.leavePolicy}</TableCell>
                <TableCell>
                  <ActiveBadge active={emp.status === "active"} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`View ${emp.name}`}
                      onClick={() => setViewing(emp)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${emp.name}`}
                      onClick={() => openEdit(emp)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={
                        emp.status === "active"
                          ? `Deactivate ${emp.name}`
                          : `Activate ${emp.name}`
                      }
                      onClick={() => toggleStatus(emp)}
                    >
                      {emp.status === "active" ? (
                        <UserX className="size-4" />
                      ) : (
                        <UserCheck className="size-4 text-emerald-600" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Drawer open={formOpen} onOpenChange={setFormOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>{editingId ? "Edit Employee" : "Add Employee"}</DrawerTitle>
              <DrawerDescription>
                {editingId
                  ? "Update the employee record and leave policy assignment"
                  : "Create a new employee record with leave policy assignment"}
              </DrawerDescription>
            </DrawerHeader>
            <div className="space-y-6 p-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Personal Information</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="john@company.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Job Information</h4>
                <div className="space-y-2">
                  <Label>Manager</Label>
                  <Select
                    value={form.managerId}
                    onValueChange={(value) => setForm((f) => ({ ...f, managerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Leave Policy Assignment</h4>
                <Select
                  value={form.leavePolicyId}
                  onValueChange={(value) => setForm((f) => ({ ...f, leavePolicyId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {leavePolicies.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DrawerFooter>
              <Button onClick={handleSave}>
                {editingId ? "Save Changes" : "Save Employee"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>{viewing?.name}</DrawerTitle>
              <DrawerDescription>{viewing?.designation}</DrawerDescription>
            </DrawerHeader>
            {viewing && (
              <dl className="grid grid-cols-2 gap-4 p-4 text-sm">
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Employee ID</dt>
                  <dd className="font-mono text-xs">{viewing.employeeId}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <ActiveBadge active={viewing.status === "active"} />
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="break-all">{viewing.email}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Manager</dt>
                  <dd>{viewing.manager}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Leave Policy</dt>
                  <dd>{viewing.leavePolicy}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Join Date</dt>
                  <dd>{formatDate(viewing.joinDate)}</dd>
                </div>
              </dl>
            )}
            <DrawerFooter>
              <Button
                onClick={() => {
                  if (viewing) openEdit(viewing);
                  setViewing(null);
                }}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
