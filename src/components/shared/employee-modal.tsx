"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, UserPlus } from "lucide-react";
import { toast } from "sonner";

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
import { createEmployee, getEmployeeManagerOptions, updateEmployee, type ManagerOption } from "@/lib/employees";
import { formatDate } from "@/lib/format";
import type { Employee } from "@/types";

export type EmployeeModalMode = "add" | "edit" | "view";

export type EmployeeModalState =
  | { mode: "add" }
  | { mode: "edit"; employee: Employee }
  | { mode: "view"; employee: Employee };

type FormState = {
  name: string;
  email: string;
  password: string;
  contactNo: string;
  joiningDate: string;
  designation: string;
  managerId: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  contactNo: "",
  joiningDate: "",
  designation: "",
  managerId: "none",
};

const placeholders = {
  name: "Enter full name",
  email: "Enter email address",
  contactNo: "Enter contact number",
  password: "Enter password",
  passwordEdit: "Leave blank to keep current password",
  designation: "Enter designation",
  manager: "Select manager",
} as const;

function employeeToForm(employee: Employee): FormState {
  return {
    name: employee.name,
    email: employee.email,
    password: "",
    contactNo: employee.contactNo ?? "",
    joiningDate: employee.joinDate.slice(0, 10),
    designation: employee.designation === "—" ? "" : employee.designation,
    managerId: employee.managerId || "none",
  };
}

const headerConfig: Record<
  EmployeeModalMode,
  {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: (employee?: Employee) => string;
  }
> = {
  add: {
    icon: UserPlus,
    title: "Add Employee",
    description: () => "Create a new employee account with role EMPLOYEE",
  },
  edit: {
    icon: Pencil,
    title: "Edit Employee",
    description: (employee) =>
      employee ? `Update details for ${employee.name}` : "Update employee details",
  },
  view: {
    icon: Eye,
    title: "Employee Details",
    description: (employee) =>
      employee ? `Viewing ${employee.name}` : "View employee information",
  },
};

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

interface EmployeeModalFormProps {
  mode: "add" | "edit";
  employee: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

function EmployeeModalForm({
  mode,
  employee,
  onClose,
  onSuccess,
}: EmployeeModalFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    mode === "edit" && employee ? employeeToForm(employee) : emptyForm
  );
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadManagers() {
      try {
        const employeeId = mode === "edit" && employee ? employee.id : undefined;
        const options = await getEmployeeManagerOptions(mode, employeeId);

        if (!cancelled) {
          setManagers(options);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load managers";
          toast.error(message);
          setManagers([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingManagers(false);
        }
      }
    }

    void loadManagers();

    return () => {
      cancelled = true;
    };
  }, [mode, employee]);

  const managerOptions = managers;

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.contactNo.trim() ||
      !form.joiningDate ||
      (mode === "add" && !form.password.trim())
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "add") {
        const created = await createEmployee({
          name: form.name,
          email: form.email,
          password: form.password,
          contactNo: form.contactNo,
          joiningDate: form.joiningDate,
          designation: form.designation || undefined,
          managerId: form.managerId !== "none" ? form.managerId : undefined,
        });
        toast.success(`${created.name} has been added`);
      } else if (employee) {
        const updated = await updateEmployee(employee.id, {
          name: form.name,
          email: form.email,
          password: form.password.trim() || undefined,
          contactNo: form.contactNo,
          joiningDate: form.joiningDate,
          designation: form.designation,
          managerId: form.managerId === "none" ? null : form.managerId,
        });
        toast.success(`${updated.name} has been updated`);
      }

      onSuccess();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : mode === "add"
            ? "Failed to create employee"
            : "Failed to update employee";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const idPrefix = mode === "add" ? "add" : "edit";

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-6 py-5">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Personal Information
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-name`}>Full Name</Label>
              <Input
                id={`${idPrefix}-name`}
                placeholder={placeholders.name}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-email`}>Email</Label>
              <Input
                id={`${idPrefix}-email`}
                type="email"
                placeholder={placeholders.email}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-contactNo`}>Contact Number</Label>
              <Input
                id={`${idPrefix}-contactNo`}
                placeholder={placeholders.contactNo}
                value={form.contactNo}
                onChange={(e) => updateField("contactNo", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-password`}>
                {mode === "add" ? "Password" : "New Password"}
              </Label>
              <div className="relative">
                <Input
                  id={`${idPrefix}-password`}
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    mode === "add" ? placeholders.password : placeholders.passwordEdit
                  }
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  disabled={isSubmitting}
                  className="pr-10"
                  required={mode === "add"}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Job Information
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-designation`}>Designation</Label>
              <Input
                id={`${idPrefix}-designation`}
                placeholder={placeholders.designation}
                value={form.designation}
                onChange={(e) => updateField("designation", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-joiningDate`}>Joining Date</Label>
              <Input
                id={`${idPrefix}-joiningDate`}
                type="date"
                value={form.joiningDate}
                onChange={(e) => updateField("joiningDate", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Manager</Label>
              <Select
                value={form.managerId}
                onValueChange={(value) => updateField("managerId", value)}
                disabled={isSubmitting || isLoadingManagers}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingManagers ? "Loading managers..." : placeholders.manager
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Manager</SelectItem>
                  {managerOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="mt-6 gap-2 px-0 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {mode === "add" ? "Creating..." : "Saving..."}
            </>
          ) : mode === "add" ? (
            "Add Employee"
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

function EmployeeModalView({
  employee,
  onClose,
  onEdit,
}: {
  employee: Employee;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Personal Information
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadOnlyField label="Full Name" value={employee.name} />
            <ReadOnlyField label="Employee ID" value={employee.employeeId} />
            <ReadOnlyField label="Email" value={employee.email} />
            <ReadOnlyField label="Contact Number" value={employee.contactNo} />
            <div className="space-y-2 sm:col-span-2">
              <Label>Status</Label>
              <div className="flex min-h-9 items-center">
                <ActiveBadge active={employee.status === "active"} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Job Information
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadOnlyField label="Designation" value={employee.designation} />
            <ReadOnlyField
              label="Joining Date"
              value={formatDate(employee.joinDate)}
            />
            <ReadOnlyField label="Manager" value={employee.manager} />
            {employee.leavePolicy && (
              <ReadOnlyField label="Leave Policy" value={employee.leavePolicy} />
            )}
          </div>
        </div>
      </div>

      <DialogFooter className="mt-6 gap-2 px-0 sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button type="button" onClick={onEdit}>
          <Pencil className="size-4" />
          Edit Employee
        </Button>
      </DialogFooter>
    </div>
  );
}

interface EmployeeModalProps {
  state: EmployeeModalState | null;
  onClose: () => void;
  onSuccess: () => void;
  onEdit: (employee: Employee) => void;
}

export function EmployeeModal({
  state,
  onClose,
  onSuccess,
  onEdit,
}: EmployeeModalProps) {
  const open = state !== null;
  const mode = state?.mode;
  const employee = state && state.mode !== "add" ? state.employee : null;
  const config = mode ? headerConfig[mode] : null;
  const HeaderIcon = config?.icon;

  const formKey =
    mode === "add" ? "add" : employee ? `${mode}-${employee.id}` : mode;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        {config && HeaderIcon && (
          <DialogHeader className="border-b bg-muted/20 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HeaderIcon className="size-5" />
              </div>
              <div>
                <DialogTitle>{config.title}</DialogTitle>
                <DialogDescription>
                  {config.description(employee ?? undefined)}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        )}

        {mode === "view" && employee && (
          <EmployeeModalView
            employee={employee}
            onClose={onClose}
            onEdit={() => onEdit(employee)}
          />
        )}

        {(mode === "add" || mode === "edit") && (
          <EmployeeModalForm
            key={formKey}
            mode={mode}
            employee={employee}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
