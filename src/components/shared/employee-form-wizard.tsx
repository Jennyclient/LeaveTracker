"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DialogFooter, dialogFlushFooterClass } from "@/components/ui/dialog";
import { FormField } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEmployee,
  getEmployeeManagerOptions,
  updateEmployee,
  type ManagerOption,
} from "@/lib/employees";
import {
  buildFieldErrors,
  PASSWORD_MIN_LENGTH,
  sanitizeAlphaNameInput,
  sanitizePhoneInput,
  validateEmail,
  validatePassword,
  validatePersonName,
  validatePhone,
  validatePositiveNumber,
  validateRequired,
} from "@/lib/form-validation";
import { useFormErrors } from "@/hooks/use-form-errors";
import { useAuthStore } from "@/stores/auth-store";
import type {
  Employee,
  EmployeeSalary,
  EmploymentType,
  PayrollType,
} from "@/types";

type WizardStep = "personal" | "job" | "salary";

const STEPS: { id: WizardStep; label: string; adminOnly?: boolean }[] = [
  { id: "personal", label: "Personal" },
  { id: "job", label: "Job" },
  { id: "salary", label: "Salary", adminOnly: true },
];

type FormState = {
  name: string;
  email: string;
  password: string;
  contactNo: string;
  department: string;
  designation: string;
  managerId: string;
  joiningDate: string;
  yearsOfExperience: string;
  employmentType: EmploymentType;
  workLocation: string;
  ctc: string;
  basicSalary: string;
  hra: string;
  specialAllowance: string;
  providentFund: string;
  professionalTax: string;
  salaryEffectiveFrom: string;
  payrollType: PayrollType;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  contactNo: "",
  department: "",
  designation: "",
  managerId: "none",
  joiningDate: "",
  yearsOfExperience: "",
  employmentType: "permanent",
  workLocation: "",
  ctc: "",
  basicSalary: "",
  hra: "",
  specialAllowance: "",
  providentFund: "",
  professionalTax: "",
  salaryEffectiveFrom: "",
  payrollType: "monthly",
};

function parseNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function employeeToForm(employee: Employee): FormState {
  return {
    name: employee.name,
    email: employee.email,
    password: "",
    contactNo: employee.contactNo ?? "",
    department: employee.department ?? "",
    designation: employee.designation === "—" ? "" : employee.designation,
    managerId: employee.managerId || "none",
    joiningDate: employee.joinDate.slice(0, 10),
    yearsOfExperience:
      employee.yearsOfExperience !== undefined
        ? String(employee.yearsOfExperience)
        : "",
    employmentType: employee.employmentType ?? "permanent",
    workLocation: employee.workLocation ?? "",
    ctc: employee.salary?.ctc !== undefined ? String(employee.salary.ctc) : "",
    basicSalary:
      employee.salary?.basicSalary !== undefined
        ? String(employee.salary.basicSalary)
        : "",
    hra: employee.salary?.hra !== undefined ? String(employee.salary.hra) : "",
    specialAllowance:
      employee.salary?.specialAllowance !== undefined
        ? String(employee.salary.specialAllowance)
        : "",
    providentFund:
      employee.salary?.providentFund !== undefined
        ? String(employee.salary.providentFund)
        : "",
    professionalTax:
      employee.salary?.professionalTax !== undefined
        ? String(employee.salary.professionalTax)
        : "",
    salaryEffectiveFrom: employee.salary?.effectiveFrom?.slice(0, 10) ?? "",
    payrollType: employee.salary?.payrollType ?? "monthly",
  };
}

function formToPayload(form: FormState) {
  const salary: EmployeeSalary = {
    ctc: parseNumber(form.ctc),
    basicSalary: parseNumber(form.basicSalary),
    hra: parseNumber(form.hra),
    specialAllowance: parseNumber(form.specialAllowance),
    providentFund: parseNumber(form.providentFund),
    professionalTax: parseNumber(form.professionalTax),
    effectiveFrom: form.salaryEffectiveFrom || undefined,
    payrollType: form.payrollType,
  };

  return {
    name: form.name,
    email: form.email,
    contactNo: form.contactNo,
    joiningDate: form.joiningDate,
    designation: form.designation || undefined,
    department: form.department || undefined,
    managerId: form.managerId !== "none" ? form.managerId : undefined,
    yearsOfExperience: parseNumber(form.yearsOfExperience),
    employmentType: form.employmentType,
    workLocation: form.workLocation || undefined,
    salary,
  };
}

function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: typeof STEPS;
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
}) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 border-b bg-muted/10 px-6 py-4">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            <button
              type="button"
              onClick={() => (isCompleted ? onStepClick(step.id) : undefined)}
              disabled={!isCompleted}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "font-semibold text-primary"
                  : isCompleted
                    ? "cursor-pointer text-foreground/80 hover:bg-muted hover:text-foreground"
                    : "text-foreground/60"
              }`}
            >
              <span
                className={`flex size-2 rounded-full ${
                  isActive || isCompleted ? "bg-primary" : "border border-muted-foreground/40 bg-background"
                }`}
              />
              {step.label}
            </button>
            {index < steps.length - 1 && (
              <span className="mx-1 text-foreground/35">·</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
        {title}
      </p>
      <div className="h-px bg-border" />
    </div>
  );
}

interface EmployeeFormWizardProps {
  mode: "add" | "edit";
  employee: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmployeeFormWizard({
  mode,
  employee,
  onClose,
  onSuccess,
}: EmployeeFormWizardProps) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const visibleSteps = useMemo(
    () => STEPS.filter((step) => !step.adminOnly || isAdmin),
    [isAdmin]
  );

  const [currentStep, setCurrentStep] = useState<WizardStep>("personal");
  const [form, setForm] = useState<FormState>(() =>
    mode === "edit" && employee ? employeeToForm(employee) : emptyForm
  );
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { errors: fieldErrors, setFormErrors, clearFieldError } = useFormErrors<string>();

  const currentStepIndex = visibleSteps.findIndex((step) => step.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === visibleSteps.length - 1;
  const idPrefix = mode === "add" ? "add" : "edit";

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

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    clearFieldError(String(key));
  };

  const validateStep = (step: WizardStep): boolean => {
    let validators: Array<{ field: string; error: string | null | undefined }> = [];

    if (step === "personal") {
      validators = [
        { field: "name", error: validatePersonName(form.name, "full name") },
        { field: "email", error: validateEmail(form.email) },
        { field: "contactNo", error: validatePhone(form.contactNo, "contact number") },
        {
          field: "password",
          error:
            mode === "add"
              ? validatePassword(form.password)
              : form.password.trim()
                ? validatePassword(form.password)
                : null,
        },
      ];
    }

    if (step === "job") {
      validators = [
        {
          field: "joiningDate",
          error: validateRequired(form.joiningDate, "Joining date is required"),
        },
        {
          field: "yearsOfExperience",
          error: validatePositiveNumber(form.yearsOfExperience, "Years of experience", {
            required: false,
          }),
        },
      ];
    }

    if (step === "salary" && isAdmin) {
      validators = [
        { field: "ctc", error: validatePositiveNumber(form.ctc, "CTC", { required: false }) },
        {
          field: "basicSalary",
          error: validatePositiveNumber(form.basicSalary, "Basic salary", { required: false }),
        },
        { field: "hra", error: validatePositiveNumber(form.hra, "HRA", { required: false }) },
        {
          field: "specialAllowance",
          error: validatePositiveNumber(form.specialAllowance, "Special allowance", {
            required: false,
          }),
        },
        {
          field: "providentFund",
          error: validatePositiveNumber(form.providentFund, "Provident fund", {
            required: false,
          }),
        },
        {
          field: "professionalTax",
          error: validatePositiveNumber(form.professionalTax, "Professional tax", {
            required: false,
          }),
        },
      ];
    }

    const nextErrors = buildFieldErrors(validators);
    setFormErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  };

  const goToStep = (step: WizardStep) => {
    setFormErrors({});
    setCurrentStep(step);
  };

  const handleStepSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (isLastStep) {
      void handleSubmit(event);
      return;
    }

    handleNext(event);
  };

  const handleNext = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!validateStep(currentStep)) return;

    const nextStep = visibleSteps[currentStepIndex + 1];
    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  };

  const activeFormId = `${idPrefix}-${currentStep}-form`;

  const handleBack = () => {
    const prevStep = visibleSteps[currentStepIndex - 1];
    if (prevStep) {
      setCurrentStep(prevStep.id);
    }
  };

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const payload = formToPayload(form);

      if (mode === "add") {
        const created = await createEmployee({
          ...payload,
          password: form.password,
        });
        toast.success(`${created.name} has been added`);
      } else if (employee) {
        const updated = await updateEmployee(employee.id, {
          ...payload,
          password: form.password.trim() || undefined,
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

  const stepTitle: Record<WizardStep, string> = {
    personal: "Personal Information",
    job: "Job Information",
    salary: "Salary Information",
  };

  return (
    <div>
      <StepIndicator
        steps={visibleSteps}
        currentStep={currentStep}
        onStepClick={goToStep}
      />

      <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
        <SectionHeader title={stepTitle[currentStep]} />

        <div className="mt-6 space-y-5">
          {currentStep === "personal" && (
            <form
              id={`${idPrefix}-personal-form`}
              onSubmit={handleStepSubmit}
              noValidate
              className="grid gap-5 sm:grid-cols-2"
            >
              <FormField
                className="sm:col-span-2"
                label="Full Name"
                htmlFor={`${idPrefix}-name`}
                required
                error={fieldErrors.name}
              >
                <Input
                  id={`${idPrefix}-name`}
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) =>
                    updateField("name", sanitizeAlphaNameInput(e.target.value))
                  }
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField
                label="Email"
                htmlFor={`${idPrefix}-email`}
                required
                error={fieldErrors.email}
              >
                <Input
                  id={`${idPrefix}-email`}
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField
                label="Contact Number"
                htmlFor={`${idPrefix}-contactNo`}
                required
                error={fieldErrors.contactNo}
              >
                <Input
                  id={`${idPrefix}-contactNo`}
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter contact number"
                  value={form.contactNo}
                  onChange={(e) =>
                    updateField("contactNo", sanitizePhoneInput(e.target.value))
                  }
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField
                className="sm:col-span-2"
                label={mode === "add" ? "Password" : "New Password"}
                htmlFor={`${idPrefix}-password`}
                required={mode === "add"}
                error={fieldErrors.password}
                description={
                  mode === "edit"
                    ? "Leave blank to keep the current password."
                    : `Use at least ${PASSWORD_MIN_LENGTH} characters.`
                }
              >
                <div className="relative">
                  <Input
                    id={`${idPrefix}-password`}
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      mode === "add"
                        ? "Enter password"
                        : "Leave blank to keep current password"
                    }
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    disabled={isSubmitting}
                    className="pr-10"
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
              </FormField>
            </form>
          )}

          {currentStep === "job" && (
            <form
              id={`${idPrefix}-job-form`}
              onSubmit={handleStepSubmit}
              noValidate
              className="grid gap-5 sm:grid-cols-2"
            >
              <FormField label="Employee ID">
                <Input
                  value={mode === "edit" && employee ? employee.employeeId : "Auto-generated"}
                  disabled
                  className="bg-muted/30"
                />
              </FormField>
              <FormField label="Department" htmlFor={`${idPrefix}-department`}>
                <Input
                  id={`${idPrefix}-department`}
                  placeholder="Enter department"
                  value={form.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField label="Designation" htmlFor={`${idPrefix}-designation`}>
                <Input
                  id={`${idPrefix}-designation`}
                  placeholder="Enter designation"
                  value={form.designation}
                  onChange={(e) => updateField("designation", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField label="Manager">
                <Select
                  value={form.managerId}
                  onValueChange={(value) => updateField("managerId", value)}
                  disabled={isSubmitting || isLoadingManagers}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingManagers ? "Loading managers..." : "Select manager"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select Manager</SelectItem>
                    {managers.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField
                label="Joining Date"
                htmlFor={`${idPrefix}-joiningDate`}
                required
                error={fieldErrors.joiningDate}
              >
                <Input
                  id={`${idPrefix}-joiningDate`}
                  type="date"
                  value={form.joiningDate}
                  onChange={(e) => updateField("joiningDate", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField
                label="Years of Experience"
                htmlFor={`${idPrefix}-yearsOfExperience`}
                description={!isAdmin ? "Admin only" : undefined}
                error={fieldErrors.yearsOfExperience}
              >
                <Input
                  id={`${idPrefix}-yearsOfExperience`}
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="0"
                  value={form.yearsOfExperience}
                  onChange={(e) => updateField("yearsOfExperience", e.target.value)}
                  disabled={isSubmitting || !isAdmin}
                  className={!isAdmin ? "bg-muted/30" : undefined}
                />
              </FormField>
              <FormField label="Employment Type">
                <RadioGroup
                  value={form.employmentType}
                  onValueChange={(value) =>
                    updateField("employmentType", value as EmploymentType)
                  }
                  className="flex flex-wrap gap-4 pt-0.5"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="permanent" id={`${idPrefix}-permanent`} />
                    <Label htmlFor={`${idPrefix}-permanent`} className="font-normal">
                      Full Time
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="contract" id={`${idPrefix}-contract`} />
                    <Label htmlFor={`${idPrefix}-contract`} className="font-normal">
                      Contract
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="intern" id={`${idPrefix}-intern`} />
                    <Label htmlFor={`${idPrefix}-intern`} className="font-normal">
                      Intern
                    </Label>
                  </div>
                </RadioGroup>
              </FormField>
              <FormField
                className="sm:col-span-2"
                label="Work Location"
                htmlFor={`${idPrefix}-workLocation`}
              >
                <Input
                  id={`${idPrefix}-workLocation`}
                  placeholder="Enter work location"
                  value={form.workLocation}
                  onChange={(e) => updateField("workLocation", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
            </form>
          )}

          {currentStep === "salary" && isAdmin && (
            <form
              id={`${idPrefix}-salary-form`}
              onSubmit={handleStepSubmit}
              noValidate
              className="grid gap-5 sm:grid-cols-2"
            >
              <FormField label="CTC" htmlFor={`${idPrefix}-ctc`} error={fieldErrors.ctc}>
                <Input
                  id={`${idPrefix}-ctc`}
                  type="number"
                  min={0}
                  placeholder="Annual CTC"
                  value={form.ctc}
                  onChange={(e) => updateField("ctc", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField
                label="Basic Salary"
                htmlFor={`${idPrefix}-basicSalary`}
                error={fieldErrors.basicSalary}
              >
                <Input
                  id={`${idPrefix}-basicSalary`}
                  type="number"
                  min={0}
                  value={form.basicSalary}
                  onChange={(e) => updateField("basicSalary", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField label="HRA" htmlFor={`${idPrefix}-hra`} error={fieldErrors.hra}>
                <Input
                  id={`${idPrefix}-hra`}
                  type="number"
                  min={0}
                  value={form.hra}
                  onChange={(e) => updateField("hra", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField
                label="Special Allowance"
                htmlFor={`${idPrefix}-specialAllowance`}
                error={fieldErrors.specialAllowance}
              >
                <Input
                  id={`${idPrefix}-specialAllowance`}
                  type="number"
                  min={0}
                  value={form.specialAllowance}
                  onChange={(e) => updateField("specialAllowance", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField
                label="Provident Fund"
                htmlFor={`${idPrefix}-providentFund`}
                error={fieldErrors.providentFund}
              >
                <Input
                  id={`${idPrefix}-providentFund`}
                  type="number"
                  min={0}
                  value={form.providentFund}
                  onChange={(e) => updateField("providentFund", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField
                label="Professional Tax"
                htmlFor={`${idPrefix}-professionalTax`}
                error={fieldErrors.professionalTax}
              >
                <Input
                  id={`${idPrefix}-professionalTax`}
                  type="number"
                  min={0}
                  value={form.professionalTax}
                  onChange={(e) => updateField("professionalTax", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField
                label="Salary Effective From"
                htmlFor={`${idPrefix}-salaryEffectiveFrom`}
              >
                <Input
                  id={`${idPrefix}-salaryEffectiveFrom`}
                  type="date"
                  value={form.salaryEffectiveFrom}
                  onChange={(e) => updateField("salaryEffectiveFrom", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField label="Payroll Type">
                <RadioGroup
                  value={form.payrollType}
                  onValueChange={(value) =>
                    updateField("payrollType", value as PayrollType)
                  }
                  className="flex gap-4 pt-0.5"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="monthly" id={`${idPrefix}-monthly`} />
                    <Label htmlFor={`${idPrefix}-monthly`} className="font-normal">
                      Monthly
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="weekly" id={`${idPrefix}-weekly`} />
                    <Label htmlFor={`${idPrefix}-weekly`} className="font-normal">
                      Weekly
                    </Label>
                  </div>
                </RadioGroup>
              </FormField>
            </form>
          )}
        </div>
      </div>

      <DialogFooter className={`${dialogFlushFooterClass} sm:justify-between`}>
        <div>
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {isLastStep ? (
            <Button
              type="submit"
              form={activeFormId}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {mode === "add" ? "Creating..." : "Saving..."}
                </>
              ) : (
                "Finish"
              )}
            </Button>
          ) : (
            <Button
              type="submit"
              form={activeFormId}
              disabled={isSubmitting}
            >
              Next
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </DialogFooter>
    </div>
  );
}
