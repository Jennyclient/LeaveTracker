"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ProfileDetailField } from "@/components/shared/profile-detail-field";
import { ProfileSectionCard } from "@/components/shared/profile-section-card";
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
import { updateEmployeeBank } from "@/lib/profile";
import type { EmployeeProfile } from "@/types";

interface EmployeeBankCardProps {
  profile: EmployeeProfile;
  onUpdated: (profile: EmployeeProfile) => void;
  dialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
}

export function EmployeeBankCard({
  profile,
  onUpdated,
  dialogOpen,
  onDialogOpenChange,
}: EmployeeBankCardProps) {
  const status = profile.bankStatus ?? "not_submitted";
  const canEdit =
    status === "not_submitted" || status === "rejected" || status === "approved";
  const hasData = Boolean(profile.bank?.accountHolderName);

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

  const handleSave = async () => {
    if (
      !accountHolderName.trim() ||
      !bankName.trim() ||
      !accountNumber.trim() ||
      !ifscCode.trim() ||
      !branch.trim()
    ) {
      toast.error("Please fill in all required bank fields");
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      toast.error("Account numbers do not match");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateEmployeeBank({
        accountHolderName,
        bankName,
        accountNumber,
        ifscCode,
        branch,
        upiId: upiId || undefined,
      });
      onUpdated(updated);
      setDialogOpen(false);
      toast.success("Bank details submitted for verification");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit bank details";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const actionLabel =
    status === "not_submitted"
      ? "+ Add details"
      : status === "approved"
        ? "Edit"
        : "Edit & Resubmit";

  return (
    <>
      <ProfileSectionCard
        title="Bank Details"
        status={status}
        action={
          canEdit && status !== "pending" ? (
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
            {canEdit && status !== "pending" && (
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

        {status === "pending" && (
          <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            Submitted for admin verification. You will be notified once reviewed.
          </p>
        )}
        {status === "rejected" && (
          <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-700 dark:text-red-400">
            Your bank details were rejected. Please update and resubmit.
          </p>
        )}
      </ProfileSectionCard>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bank Details</DialogTitle>
            <DialogDescription>
              Enter your bank information. It will be sent for admin verification.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bank-account-holder">Account Holder Name *</Label>
              <Input
                id="bank-account-holder"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank Name *</Label>
              <Input
                id="bank-name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-account-number">Account Number *</Label>
              <Input
                id="bank-account-number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-confirm-account">Confirm Account Number *</Label>
              <Input
                id="bank-confirm-account"
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-ifsc">IFSC Code *</Label>
              <Input
                id="bank-ifsc"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-branch">Branch *</Label>
              <Input
                id="bank-branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bank-upi">UPI ID (optional)</Label>
              <Input
                id="bank-upi"
                placeholder="name@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
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
        </DialogContent>
      </Dialog>
    </>
  );
}
