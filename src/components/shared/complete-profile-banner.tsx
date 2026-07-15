"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  EMPLOYEE_PROFILE_STATUS_EVENT,
  getEmployeeProfileStatus,
  type EmployeeProfileStatus,
} from "@/lib/profile";

export function CompleteProfileBanner() {
  const pathname = usePathname();
  const [status, setStatus] = useState<EmployeeProfileStatus | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const next = await getEmployeeProfileStatus();
      setStatus(next);
    } catch {
      setStatus(null);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadStatus();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadStatus, pathname]);

  useEffect(() => {
    const handleStatusChange = () => {
      void loadStatus();
    };

    window.addEventListener(EMPLOYEE_PROFILE_STATUS_EVENT, handleStatusChange);
    return () => {
      window.removeEventListener(
        EMPLOYEE_PROFILE_STATUS_EVENT,
        handleStatusChange
      );
    };
  }, [loadStatus]);

  if (!status || status.isComplete) {
    return null;
  }

  const missing: string[] = [];
  if (!status.bankDetailsFilled) missing.push("bank details");
  if (!status.skillsFilled) missing.push("skills");

  const missingLabel =
    missing.length === 2
      ? `${missing[0]} and ${missing[1]}`
      : missing[0] ?? "profile details";

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-3 lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              Complete your profile
            </p>
            <p className="text-sm text-muted-foreground">
              Add your {missingLabel} to finish setting up your account.
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="shrink-0 self-start sm:self-auto">
          <Link href="/employee/profile">
            Complete Profile
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
