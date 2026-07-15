"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ProfileDetailField } from "@/components/shared/profile-detail-field";
import { ProfileSectionCard } from "@/components/shared/profile-section-card";
import { FormField } from "@/components/shared/form-field";
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
import { useFormErrors } from "@/hooks/use-form-errors";
import { createEmployeeBank, notifyEmployeeProfileStatusChanged, updateEmployeeBank } from "@/lib/profile";
import {
  buildFieldErrors,
  hasFieldErrors,
  sanitizeAlphaNameInput,
  sanitizeDigitsInput,
  sanitizeIfscInput,
  validateAccountHolderName,
  validateBankAccountNumber,
  validateBankBranch,
  validateBankName,
  validateConfirmBankAccountNumber,
  validateIfscCode,
  validateUpiId,
} from "@/lib/form-validation";
import type { EmployeeProfile } from "@/types";

interface EmployeeBankCardProps {
  profile: EmployeeProfile;
  onUpdated: (profile: EmployeeProfile) => void;
  dialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
}

type BankField =
  | "accountHolderName"
  | "bankName"
  | "accountNumber"
  | "confirmAccountNumber"
  | "ifscCode"
  | "branch"
  | "upiId";

export function EmployeeBankCard({
  profile,
  onUpdated,
  dialogOpen,
  onDialogOpenChange,
}: EmployeeBankCardProps) {
  const status = profile.bankStatus ?? "not_submitted";
  const isPending = status === "pending";
  const hasData = Boolean(
    profile.bank?.accountHolderName?.trim() ||
      profile.bank?.bankName?.trim() ||
      profile.bank?.accountNumber?.trim()
  );
  const canEdit = !isPending || hasData;

  const [internalOpen, setInternalOpen] = useState(false);
  const isDialogOpen = dialogOpen ?? internalOpen;
  const setDialogOpen = onDialogOpenChange ?? setInternalOpen;

  const [isSaving, setIsSaving] = useState(false);
  const [accountHolderName, setAccountHolderName] = useState(
    profile.bank?.accountHolderName ?? ""
  );
  const [bankName, setBankName] = useState(profile.bank?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState(profile.bank?.accountNumber ?? "");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(
    profile.bank?.accountNumber ?? ""
  );
  const [ifscCode, setIfscCode] = useState(profile.bank?.ifscCode ?? "");
  const [branch, setBranch] = useState(profile.bank?.branch ?? "");
  const [upiId, setUpiId] = useState(profile.bank?.upiId ?? "");
  const { errors, setFormErrors, clearFieldError, clearAllErrors } =
    useFormErrors<BankField>();

  const resetForm = () => {
    setAccountHolderName(profile.bank?.accountHolderName ?? "");
    setBankName(profile.bank?.bankName ?? "");
    setAccountNumber(profile.bank?.accountNumber ?? "");
    setConfirmAccountNumber(profile.bank?.accountNumber ?? "");
    setIfscCode(profile.bank?.ifscCode ?? "");
    setBranch(profile.bank?.branch ?? "");
    setUpiId(profile.bank?.upiId ?? "");
  };

  useEffect(() => {
    if (isDialogOpen) {
      resetForm();
    }
  }, [isDialogOpen, profile]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const accountNumberError = validateBankAccountNumber(accountNumber);

    const nextErrors = buildFieldErrors<BankField>([
      { field: "accountHolderName", error: validateAccountHolderName(accountHolderName) },
      { field: "bankName", error: validateBankName(bankName) },
      { field: "accountNumber", error: accountNumberError },
      {
        field: "confirmAccountNumber",
        error: validateConfirmBankAccountNumber(confirmAccountNumber, accountNumber),
      },
      { field: "ifscCode", error: validateIfscCode(ifscCode) },
      { field: "branch", error: validateBankBranch(branch) },
      { field: "upiId", error: validateUpiId(upiId) },
    ]);

    setFormErrors(nextErrors);

    if (hasFieldErrors(nextErrors)) {
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        accountNumber,
        ifscCode: ifscCode.trim().toUpperCase(),
        branch: branch.trim(),
        upiId: upiId.trim() || undefined,
      };

      const saveBankDetails = hasData ? updateEmployeeBank : createEmployeeBank;
      const updated = await saveBankDetails(payload);
      onUpdated(updated);
      notifyEmployeeProfileStatusChanged();
      setDialogOpen(false);
      toast.success(
        hasData
          ? "Bank details updated and sent for verification"
          : "Bank details submitted for verification"
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit bank details";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const actionLabel = !hasData
    ? "+ Add details"
    : status === "rejected"
      ? "Edit & Resubmit"
      : "Edit";

  return (
    <>
      <ProfileSectionCard
        title="Bank Details"
        status={status}
        action={
          canEdit ? (
            <Button
              variant="link"
              size="sm"
              className="h-auto px-0 text-primary"
              onClick={() => setDialogOpen(true)}
            >
              {actionLabel}
            </Button>
          ) : undefined
        }
      >
        {!hasData ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed bg-muted/20 px-4 py-6">
            <p className="text-sm text-muted-foreground">
              Add your bank account information for payroll processing.
            </p>
            {canEdit && (
              <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                + Add details
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <ProfileDetailField
              label="Account Holder Name"
              value={profile.bank?.accountHolderName}
            />
            <ProfileDetailField label="Bank Name" value={profile.bank?.bankName} />
            <ProfileDetailField
              label="Account Number"
              value={profile.bank?.accountNumber}
            />
            <ProfileDetailField label="IFSC Code" value={profile.bank?.ifscCode} />
            <ProfileDetailField label="Branch" value={profile.bank?.branch} />
            <ProfileDetailField label="UPI ID" value={profile.bank?.upiId} />
          </div>
        )}

        {status === "rejected" && (
          <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-700 dark:text-red-400">
            Your bank details were rejected. Please update and resubmit.
          </p>
        )}
      </ProfileSectionCard>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            clearAllErrors();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bank Details</DialogTitle>
            <DialogDescription>
              Enter your bank information. It will be sent for admin verification.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(event) => void handleSave(event)} className="grid gap-4 py-2 sm:grid-cols-2" noValidate>
            <FormField
              className="sm:col-span-2"
              label="Account Holder Name"
              htmlFor="bank-account-holder"
              required
              error={errors.accountHolderName}
            >
              <Input
                id="bank-account-holder"
                value={accountHolderName}
                onChange={(e) => {
                  setAccountHolderName(sanitizeAlphaNameInput(e.target.value));
                  clearFieldError("accountHolderName");
                }}
                disabled={isSaving}
              />
            </FormField>
            <FormField
              label="Bank Name"
              htmlFor="bank-name"
              required
              error={errors.bankName}
            >
              <Input
                id="bank-name"
                value={bankName}
                onChange={(e) => {
                  setBankName(e.target.value);
                  clearFieldError("bankName");
                }}
                disabled={isSaving}
              />
            </FormField>
            <FormField
              label="Account Number"
              htmlFor="bank-account-number"
              required
              error={errors.accountNumber}
            >
              <Input
                id="bank-account-number"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(sanitizeDigitsInput(e.target.value, 18));
                  clearFieldError("accountNumber");
                }}
                disabled={isSaving}
              />
            </FormField>
            <FormField
              label="Confirm Account Number"
              htmlFor="bank-confirm-account"
              required
              error={errors.confirmAccountNumber}
            >
              <Input
                id="bank-confirm-account"
                inputMode="numeric"
                value={confirmAccountNumber}
                onChange={(e) => {
                  setConfirmAccountNumber(sanitizeDigitsInput(e.target.value, 18));
                  clearFieldError("confirmAccountNumber");
                }}
                disabled={isSaving}
              />
            </FormField>
            <FormField
              label="IFSC Code"
              htmlFor="bank-ifsc"
              required
              error={errors.ifscCode}
            >
              <Input
                id="bank-ifsc"
                value={ifscCode}
                onChange={(e) => {
                  setIfscCode(sanitizeIfscInput(e.target.value));
                  clearFieldError("ifscCode");
                }}
                disabled={isSaving}
              />
            </FormField>
            <FormField label="Branch" htmlFor="bank-branch" required error={errors.branch}>
              <Input
                id="bank-branch"
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  clearFieldError("branch");
                }}
                disabled={isSaving}
              />
            </FormField>
            <FormField
              className="sm:col-span-2"
              label="UPI ID"
              htmlFor="bank-upi"
              description="Optional"
              error={errors.upiId}
            >
              <Input
                id="bank-upi"
                placeholder="name@upi"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value.trim().toLowerCase());
                  clearFieldError("upiId");
                }}
                disabled={isSaving}
              />
            </FormField>

            <DialogFooter className="sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Verification"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
