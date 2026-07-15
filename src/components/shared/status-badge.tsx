import type { LeaveStatus, PayrollEntryStatus, ProfileApprovalStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  LeaveStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground",
  },
};

export function StatusBadge({ status }: { status: LeaveStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        active
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          : "bg-muted text-muted-foreground"
      )}
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

const profileApprovalConfig: Record<
  ProfileApprovalStatus,
  { label: string; className: string }
> = {
  not_submitted: {
    label: "Not Submitted",
    className: "bg-muted text-muted-foreground border-border",
  },
  pending: {
    label: "Pending Verification",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 uppercase tracking-wide text-[10px]",
  },
  approved: {
    label: "Verified",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 uppercase tracking-wide text-[10px]",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 uppercase tracking-wide text-[10px]",
  },
};

export function ProfileApprovalBadge({
  status,
}: {
  status: ProfileApprovalStatus;
}) {
  const config = profileApprovalConfig[status];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}

const payrollStatusConfig: Record<
  PayrollEntryStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

export function PayrollStatusBadge({ status }: { status: PayrollEntryStatus }) {
  const config = payrollStatusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
