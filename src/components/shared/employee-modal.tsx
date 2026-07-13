"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Eye, Loader2, Pencil, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { EmployeeFormWizard } from "@/components/shared/employee-form-wizard";
import { SkillStarRatingDisplay } from "@/components/shared/skill-star-rating";
import { ActiveBadge, ProfileApprovalBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  dialogFlushFooterClass,
  dialogFlushHeaderClass,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import {
  approveEmployeeBank,
  approveEmployeeSkills,
  rejectEmployeeBank,
  rejectEmployeeSkills,
} from "@/lib/employees";
import type { Employee } from "@/types";

export type EmployeeModalMode = "add" | "edit" | "view";

export type EmployeeModalState =
  | { mode: "add" }
  | { mode: "edit"; employee: Employee }
  | { mode: "view"; employee: Employee };

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
    description: () =>
      "Create a new employee account. Bank details and skills are added by the employee after login.",
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

function ViewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
        {title}
      </p>
      <div className="h-px bg-border" />
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function ApprovalActions({
  isProcessing,
  onApprove,
  onReject,
}: {
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 sm:col-span-2">
      <Button
        type="button"
        size="sm"
        onClick={onApprove}
        disabled={isProcessing}
      >
        {isProcessing ? <Loader2 className="size-4 animate-spin" /> : "Approve"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onReject}
        disabled={isProcessing}
      >
        Reject
      </Button>
    </div>
  );
}

function EmployeeModalView({
  employee,
  onClose,
  onEdit,
  onUpdated,
}: {
  employee: Employee;
  onClose: () => void;
  onEdit: () => void;
  onUpdated: (employee: Employee) => void;
}) {
  const [current, setCurrent] = useState(employee);
  const [processingSection, setProcessingSection] = useState<
    "bank" | "skills" | null
  >(null);

  useEffect(() => {
    setCurrent(employee);
  }, [employee]);

  const bankStatus = current.bankStatus ?? "not_submitted";
  const skillsStatus = current.skillsStatus ?? "not_submitted";

  const handleApproval = async (
    section: "bank" | "skills",
    action: "approve" | "reject"
  ) => {
    setProcessingSection(section);
    try {
      const updated =
        section === "bank"
          ? action === "approve"
            ? await approveEmployeeBank(current.id)
            : await rejectEmployeeBank(current.id)
          : action === "approve"
            ? await approveEmployeeSkills(current.id)
            : await rejectEmployeeSkills(current.id);

      setCurrent(updated);
      onUpdated(updated);
      toast.success(
        `${section === "bank" ? "Bank details" : "Skills"} ${
          action === "approve" ? "approved" : "rejected"
        }`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update approval";
      toast.error(message);
    } finally {
      setProcessingSection(null);
    }
  };

  return (
    <>
      <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
      <div className="space-y-6">
        <ViewSection title="Personal Information">
          <ReadOnlyField label="Full Name" value={current.name} />
          <ReadOnlyField label="Employee ID" value={current.employeeId} />
          <ReadOnlyField label="Email" value={current.email} />
          <ReadOnlyField label="Contact Number" value={current.contactNo} />
          <div className="space-y-2 sm:col-span-2">
            <Label>Status</Label>
            <div className="flex min-h-9 items-center">
              <ActiveBadge active={current.status === "active"} />
            </div>
          </div>
        </ViewSection>

        <ViewSection title="Job Information">
          <ReadOnlyField label="Department" value={current.department} />
          <ReadOnlyField label="Designation" value={current.designation} />
          <ReadOnlyField label="Manager" value={current.manager} />
          <ReadOnlyField
            label="Joining Date"
            value={formatDate(current.joinDate)}
          />
          <ReadOnlyField
            label="Years of Experience"
            value={
              current.yearsOfExperience !== undefined
                ? `${current.yearsOfExperience} years`
                : undefined
            }
          />
          <ReadOnlyField
            label="Employment Type"
            value={
              current.employmentType
                ? current.employmentType.charAt(0).toUpperCase() +
                  current.employmentType.slice(1)
                : undefined
            }
          />
          <ReadOnlyField label="Work Location" value={current.workLocation} />
          {current.leavePolicy && (
            <ReadOnlyField label="Leave Policy" value={current.leavePolicy} />
          )}
        </ViewSection>

        <ViewSection title="Salary Information">
          <ReadOnlyField
            label="CTC"
            value={current.salary?.ctc ? `₹${current.salary.ctc}` : undefined}
          />
          <ReadOnlyField
            label="Basic Salary"
            value={
              current.salary?.basicSalary
                ? `₹${current.salary.basicSalary}`
                : undefined
            }
          />
          <ReadOnlyField
            label="HRA"
            value={current.salary?.hra ? `₹${current.salary.hra}` : undefined}
          />
          <ReadOnlyField
            label="Special Allowance"
            value={
              current.salary?.specialAllowance
                ? `₹${current.salary.specialAllowance}`
                : undefined
            }
          />
          <ReadOnlyField
            label="Provident Fund"
            value={
              current.salary?.providentFund
                ? `₹${current.salary.providentFund}`
                : undefined
            }
          />
          <ReadOnlyField
            label="Professional Tax"
            value={
              current.salary?.professionalTax
                ? `₹${current.salary.professionalTax}`
                : undefined
            }
          />
          <ReadOnlyField
            label="Salary Effective From"
            value={
              current.salary?.effectiveFrom
                ? formatDate(current.salary.effectiveFrom)
                : undefined
            }
          />
          <ReadOnlyField
            label="Payroll Type"
            value={
              current.salary?.payrollType
                ? current.salary.payrollType.charAt(0).toUpperCase() +
                  current.salary.payrollType.slice(1)
                : undefined
            }
          />
        </ViewSection>

        <ViewSection title="Bank Details">
          <div className="space-y-2 sm:col-span-2">
            <Label>Approval Status</Label>
            <div className="flex min-h-9 items-center">
              <ProfileApprovalBadge status={bankStatus} />
            </div>
          </div>
          <ReadOnlyField
            label="Account Holder Name"
            value={current.bank?.accountHolderName}
          />
          <ReadOnlyField label="Bank Name" value={current.bank?.bankName} />
          <ReadOnlyField
            label="Account Number"
            value={current.bank?.accountNumber}
          />
          <ReadOnlyField label="IFSC Code" value={current.bank?.ifscCode} />
          <ReadOnlyField label="Branch" value={current.bank?.branch} />
          <ReadOnlyField label="UPI ID" value={current.bank?.upiId} />
          {bankStatus === "pending" && (
            <ApprovalActions
              isProcessing={processingSection === "bank"}
              onApprove={() => void handleApproval("bank", "approve")}
              onReject={() => void handleApproval("bank", "reject")}
            />
          )}
        </ViewSection>

        <ViewSection title="Skills">
          <div className="space-y-2 sm:col-span-2">
            <Label>Approval Status</Label>
            <div className="flex min-h-9 items-center">
              <ProfileApprovalBadge status={skillsStatus} />
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Technical Skills</Label>
            <div className="flex min-h-9 flex-wrap items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
              {current.skills?.length ? (
                current.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="rounded-full bg-secondary px-2 py-0.5 text-xs"
                  >
                    {skill.name}
                  </span>
                ))
              ) : (
                "—"
              )}
            </div>
          </div>
          {current.skills && current.skills.length > 0 && (
            <div className="space-y-2 sm:col-span-2">
              <Label>Skill Proficiency</Label>
              <div className="space-y-2 rounded-md border bg-muted/30 px-3 py-2">
                {current.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm">{skill.name}</span>
                    <SkillStarRatingDisplay value={skill.proficiency} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <ReadOnlyField label="Primary Skill" value={current.primarySkill} />
          <div className="space-y-2 sm:col-span-2">
            <Label>Certifications</Label>
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
              {current.certifications?.length ? (
                <div className="space-y-2">
                  {current.certifications.map((cert, index) => (
                    <div key={`${cert.name}-${index}`}>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-muted-foreground">{cert.issuedBy}</p>
                      {cert.issueDate && (
                        <p className="text-xs text-muted-foreground">
                          Issued {formatDate(cert.issueDate)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                "—"
              )}
            </div>
          </div>
          {skillsStatus === "pending" && (
            <ApprovalActions
              isProcessing={processingSection === "skills"}
              onApprove={() => void handleApproval("skills", "approve")}
              onReject={() => void handleApproval("skills", "reject")}
            />
          )}
        </ViewSection>
      </div>
      </div>

      <DialogFooter className={dialogFlushFooterClass}>
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button type="button" onClick={onEdit}>
          <Pencil className="size-4" />
          Edit Employee
        </Button>
      </DialogFooter>
    </>
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
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(employee);

  useEffect(() => {
    setViewEmployee(employee);
  }, [employee]);

  const config = mode ? headerConfig[mode] : null;
  const HeaderIcon = config?.icon;

  const formKey =
    mode === "add" ? "add" : employee ? `${mode}-${employee.id}` : mode;

  const handleViewUpdated = (updated: Employee) => {
    setViewEmployee(updated);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {config && HeaderIcon && (
          <DialogHeader className={dialogFlushHeaderClass}>
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

        {mode === "view" && viewEmployee && (
          <EmployeeModalView
            employee={viewEmployee}
            onClose={onClose}
            onEdit={() => onEdit(viewEmployee)}
            onUpdated={handleViewUpdated}
          />
        )}

        {(mode === "add" || mode === "edit") && (
          <EmployeeFormWizard
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
