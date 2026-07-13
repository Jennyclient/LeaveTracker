"use client";

import type { ComponentType } from "react";
import { AlertCircle, Landmark, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmployeeProfile } from "@/types";

function hasBankDetails(profile: EmployeeProfile): boolean {
  return Boolean(
    profile.bank?.accountHolderName?.trim() ||
      profile.bank?.bankName?.trim() ||
      profile.bank?.accountNumber?.trim()
  );
}

function hasSkillsDetails(profile: EmployeeProfile): boolean {
  return Boolean(
    profile.skills?.length ||
      profile.certifications?.length ||
      profile.primarySkill?.trim() ||
      profile.resumeUrl?.trim()
  );
}

function getPendingActionLabel(
  itemId: "bank" | "skills",
  profile: EmployeeProfile,
  status: EmployeeProfile["bankStatus"]
): string {
  const hasData = itemId === "bank" ? hasBankDetails(profile) : hasSkillsDetails(profile);

  if (!hasData) {
    return "+ Add details";
  }

  if (status === "rejected") {
    return "Edit & Resubmit";
  }

  return "Edit";
}

interface PendingItem {
  id: "bank" | "skills";
  title: string;
  description: string;
  status: EmployeeProfile["bankStatus"];
  icon: ComponentType<{ className?: string }>;
  onAction: () => void;
}

interface EmployeeProfilePendingPanelProps {
  profile: EmployeeProfile;
  onAddBank: () => void;
  onAddSkills: () => void;
}

export function EmployeeProfilePendingPanel({
  profile,
  onAddBank,
  onAddSkills,
}: EmployeeProfilePendingPanelProps) {
  const bankStatus = profile.bankStatus ?? "not_submitted";
  const skillsStatus = profile.skillsStatus ?? "not_submitted";

  const items: PendingItem[] = [
    {
      id: "bank",
      title: "Bank Details",
      description: "Cancelled cheque / passbook information",
      status: bankStatus,
      icon: Landmark,
      onAction: onAddBank,
    },
    {
      id: "skills",
      title: "Skills & Certifications",
      description: "Technical skills and certifications",
      status: skillsStatus,
      icon: Sparkles,
      onAction: onAddSkills,
    },
  ];

  const actionable = items.filter(
    (item) => item.status === "not_submitted" || item.status === "rejected"
  );

  if (actionable.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-500/20 bg-amber-500/[0.03]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
          <CardTitle className="text-base">Pending profile actions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {actionable.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-background/80 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={item.onAction}>
                {getPendingActionLabel(item.id, profile, item.status)}
              </Button>
            </div>
          );
        })}

      </CardContent>
    </Card>
  );
}
