"use client";

import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import { Eye, Loader2, Pencil, Plus } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createLeaveType,
  formatAccrualTypeLabel,
  formatBooleanLabel,
  updateLeaveType,
} from "@/lib/leave-types";
import type { AccrualType, LeaveType } from "@/types";

export type LeaveTypeModalState =
  | { mode: "add" }
  | { mode: "edit"; item: LeaveType }
  | { mode: "view"; item: LeaveType };

type FormState = {
  leaveName: string;
  annualQuota: string;
  accrualType: AccrualType | "";
  carryForward: boolean;
  maxCarryForward: string;
  encashment: boolean;
  active: boolean;
  policyName: string;
  accrualRules: string;
  carryForwardRules: string;
  probationRules: string;
};

const emptyForm: FormState = {
  leaveName: "",
  annualQuota: "",
  accrualType: "",
  carryForward: false,
  maxCarryForward: "",
  encashment: false,
  active: true,
  policyName: "",
  accrualRules: "",
  carryForwardRules: "",
  probationRules: "",
};

const placeholders = {
  leaveName: "Enter leave type name",
  annualQuota: "Enter annual quota",
  accrualType: "Select accrual type",
  maxCarryForward: "Enter max carry forward",
  policyName: "Enter policy name",
  accrualRules: "Enter accrual rules",
  carryForwardRules: "Enter carry forward rules",
  probationRules: "Enter probation rules",
} as const;

const accrualOptions: { value: AccrualType; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "none", label: "None" },
];

function itemToForm(item: LeaveType): FormState {
  return {
    leaveName: item.leaveName,
    annualQuota: String(item.annualQuota),
    accrualType: item.accrualType,
    carryForward: item.carryForward,
    maxCarryForward: String(item.maxCarryForward),
    encashment: item.encashment,
    active: item.status === "active",
    policyName: item.policyName,
    accrualRules: item.accrualRules,
    carryForwardRules: item.carryForwardRules,
    probationRules: item.probationRules,
  };
}

const headerConfig: Record<
  "add" | "edit" | "view",
  {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }
> = {
  add: {
    icon: Plus,
    title: "Create Leave",
    description: "Define leave type settings and policy rules together",
  },
  edit: {
    icon: Pencil,
    title: "Edit Leave",
    description: "Update leave type and policy configuration",
  },
  view: {
    icon: Eye,
    title: "Leave Details",
    description: "View leave type and policy information",
  },
};

const modalContentClass =
  "flex max-h-[min(92dvh,calc(100%-1rem))] w-full max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl";

const modalHeaderClass =
  "shrink-0 border-b bg-muted/20 px-4 py-4 pr-12 sm:px-6 sm:py-5";

const modalBodyClass =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5";

const modalFooterClass =
  "mx-0 mb-0 mt-0 shrink-0 flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/20 px-4 py-4 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto";

function ReadOnlyField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex min-h-9 items-center rounded-md border bg-muted/30 px-3 py-2 text-sm whitespace-pre-wrap">
        {value || "—"}
      </div>
    </div>
  );
}

interface LeaveTypeModalProps {
  state: LeaveTypeModalState | null;
  onClose: () => void;
  onSuccess: () => void;
  onEdit: (item: LeaveType) => void;
}

export function LeaveTypeModal({
  state,
  onClose,
  onSuccess,
  onEdit,
}: LeaveTypeModalProps) {
  const open = state !== null;
  const mode = state?.mode;
  const item = state && state.mode !== "add" ? state.item : null;
  const config = mode ? headerConfig[mode] : null;
  const HeaderIcon = config?.icon;

  const formKey =
    mode === "add" ? "add" : item ? `${mode}-${item.id}` : mode;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className={modalContentClass}>
        {config && HeaderIcon && (
          <DialogHeader className={modalHeaderClass}>
            <div className="flex min-w-0 items-start gap-3 sm:items-center">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
                <HeaderIcon className="size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg">{config.title}</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {config.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        )}

        {mode === "view" && item && (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <LeaveTypeView
              item={item}
              onClose={onClose}
              onEdit={() => onEdit(item)}
            />
          </div>
        )}

        {(mode === "add" || mode === "edit") && (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <LeaveTypeForm
              key={formKey}
              mode={mode}
              item={item}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LeaveTypeView({
  item,
  onClose,
  onEdit,
}: {
  item: LeaveType;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={modalBodyClass}>
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Leave Type
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ReadOnlyField label="Name" value={item.leaveName} />
              <ReadOnlyField label="Annual Quota" value={item.annualQuota} />
              <ReadOnlyField
                label="Accrual Type"
                value={formatAccrualTypeLabel(item.accrualType)}
              />
              <ReadOnlyField
                label="Carry Forward"
                value={formatBooleanLabel(item.carryForward)}
              />
              <ReadOnlyField label="Max Carry Forward" value={item.maxCarryForward} />
              <ReadOnlyField
                label="Encashment"
                value={formatBooleanLabel(item.encashment)}
              />
              <div className="space-y-2 sm:col-span-2">
                <Label>Status</Label>
                <div className="flex min-h-9 items-center">
                  <ActiveBadge active={item.status === "active"} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Policy Rules
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <ReadOnlyField label="Policy Name" value={item.policyName} />
              </div>
              <ReadOnlyField label="Accrual Rules" value={item.accrualRules} />
              <ReadOnlyField
                label="Carry Forward Rules"
                value={item.carryForwardRules}
              />
              <div className="sm:col-span-2">
                <ReadOnlyField label="Probation Rules" value={item.probationRules} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className={modalFooterClass}>
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button type="button" onClick={onEdit}>
          <Pencil className="size-4" />
          Edit Leave
        </Button>
      </DialogFooter>
    </div>
  );
}

function LeaveTypeForm({
  mode,
  item,
  onClose,
  onSuccess,
}: {
  mode: "add" | "edit";
  item: LeaveType | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    mode === "edit" && item ? itemToForm(item) : emptyForm
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.leaveName.trim() || !form.annualQuota.trim() || !form.accrualType) {
      toast.error("Please fill in all required leave type fields");
      return;
    }

    const annualQuota = Number(form.annualQuota);
    const maxCarryForward = form.maxCarryForward.trim()
      ? Number(form.maxCarryForward)
      : 0;

    if (Number.isNaN(annualQuota) || annualQuota < 0) {
      toast.error("Annual quota must be a valid number");
      return;
    }

    if (Number.isNaN(maxCarryForward) || maxCarryForward < 0) {
      toast.error("Max carry forward must be a valid number");
      return;
    }

    const payload = {
      leaveName: form.leaveName,
      annualQuota,
      accrualType: form.accrualType,
      carryForward: form.carryForward,
      maxCarryForward,
      encashment: form.encashment,
      status: form.active ? ("active" as const) : ("inactive" as const),
      policyName: form.policyName,
      accrualRules: form.accrualRules,
      carryForwardRules: form.carryForwardRules,
      probationRules: form.probationRules,
    };

    setIsSubmitting(true);
    try {
      if (mode === "add") {
        const created = await createLeaveType(payload);
        toast.success(`${created.leaveName} has been created`);
      } else if (item) {
        const updated = await updateLeaveType(item.id, payload);
        toast.success(`${updated.leaveName} has been updated`);
      }

      onSuccess();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : mode === "add"
            ? "Failed to create leave"
            : "Failed to update leave";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className={modalBodyClass}>
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Leave Type
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="leave-name">Name</Label>
              <Input
                id="leave-name"
                placeholder={placeholders.leaveName}
                value={form.leaveName}
                onChange={(e) => updateField("leaveName", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annual-quota">Annual Quota</Label>
              <Input
                id="annual-quota"
                type="number"
                min={0}
                placeholder={placeholders.annualQuota}
                value={form.annualQuota}
                onChange={(e) => updateField("annualQuota", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Accrual Type</Label>
              <Select
                value={form.accrualType || undefined}
                onValueChange={(value) =>
                  updateField("accrualType", value as AccrualType)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder={placeholders.accrualType} />
                </SelectTrigger>
                <SelectContent>
                  {accrualOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <Label htmlFor="carry-forward">Carry Forward</Label>
              <Switch
                id="carry-forward"
                checked={form.carryForward}
                onCheckedChange={(checked) => updateField("carryForward", checked)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-carry-forward">Max Carry Forward</Label>
              <Input
                id="max-carry-forward"
                type="number"
                min={0}
                placeholder={placeholders.maxCarryForward}
                value={form.maxCarryForward}
                onChange={(e) => updateField("maxCarryForward", e.target.value)}
                disabled={isSubmitting || !form.carryForward}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <Label htmlFor="encashment">Encashment</Label>
              <Switch
                id="encashment"
                checked={form.encashment}
                onCheckedChange={(checked) => updateField("encashment", checked)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <Label htmlFor="active-status">Active Status</Label>
              <Switch
                id="active-status"
                checked={form.active}
                onCheckedChange={(checked) => updateField("active", checked)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Policy Rules
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="policy-name">Policy Name</Label>
              <Input
                id="policy-name"
                placeholder={placeholders.policyName}
                value={form.policyName}
                onChange={(e) => updateField("policyName", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accrual-rules">Accrual Rules</Label>
              <Textarea
                id="accrual-rules"
                placeholder={placeholders.accrualRules}
                value={form.accrualRules}
                onChange={(e) => updateField("accrualRules", e.target.value)}
                disabled={isSubmitting}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carry-forward-rules">Carry Forward Rules</Label>
              <Textarea
                id="carry-forward-rules"
                placeholder={placeholders.carryForwardRules}
                value={form.carryForwardRules}
                onChange={(e) => updateField("carryForwardRules", e.target.value)}
                disabled={isSubmitting}
                rows={2}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="probation-rules">Probation Rules</Label>
              <Textarea
                id="probation-rules"
                placeholder={placeholders.probationRules}
                value={form.probationRules}
                onChange={(e) => updateField("probationRules", e.target.value)}
                disabled={isSubmitting}
                rows={2}
              />
            </div>
          </div>
        </div>
        </div>
      </div>

      <DialogFooter className={modalFooterClass}>
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
            "Create"
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
