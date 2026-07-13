"use client";

import { IndianRupee } from "lucide-react";

import { ProfileDetailField } from "@/components/shared/profile-detail-field";
import { ProfileSectionCard } from "@/components/shared/profile-section-card";
import { formatDate } from "@/lib/format";
import type { EmployeeProfile } from "@/types";

function formatCurrency(value?: number) {
  if (value === undefined) return undefined;
  return `₹${value.toLocaleString("en-IN")}`;
}

interface EmployeeSalaryCardProps {
  profile: EmployeeProfile;
}

export function EmployeeSalaryCard({ profile }: EmployeeSalaryCardProps) {
  const salary = profile.salary;
  const hasSalary =
    salary &&
    Object.values(salary).some((value) => value !== undefined && value !== "");

  return (
    <ProfileSectionCard title="Salary & Compensation">
      {!hasSalary ? (
        <div className="flex items-start gap-3 rounded-lg border border-dashed bg-muted/20 px-4 py-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IndianRupee className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Salary not assigned</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your compensation details will appear here once assigned by your
              administrator.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ProfileDetailField label="Annual CTC" value={formatCurrency(salary?.ctc)} />
          <ProfileDetailField
            label="Basic Salary"
            value={formatCurrency(salary?.basicSalary)}
          />
          <ProfileDetailField label="HRA" value={formatCurrency(salary?.hra)} />
          <ProfileDetailField
            label="Special Allowance"
            value={formatCurrency(salary?.specialAllowance)}
          />
          <ProfileDetailField
            label="Provident Fund"
            value={formatCurrency(salary?.providentFund)}
          />
          <ProfileDetailField
            label="Professional Tax"
            value={formatCurrency(salary?.professionalTax)}
          />
          <ProfileDetailField
            label="Effective From"
            value={
              salary?.effectiveFrom ? formatDate(salary.effectiveFrom) : undefined
            }
          />
          <ProfileDetailField
            label="Payroll Type"
            value={
              salary?.payrollType
                ? salary.payrollType.charAt(0).toUpperCase() +
                  salary.payrollType.slice(1)
                : undefined
            }
          />
        </div>
      )}
    </ProfileSectionCard>
  );
}
