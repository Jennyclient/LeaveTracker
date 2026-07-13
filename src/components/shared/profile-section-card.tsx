import type { ReactNode } from "react";

import { ProfileApprovalBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProfileApprovalStatus } from "@/types";

interface ProfileSectionCardProps {
  title: string;
  status?: ProfileApprovalStatus;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ProfileSectionCard({
  title,
  status,
  action,
  children,
  className,
  contentClassName,
}: ProfileSectionCardProps) {
  return (
    <Card className={cn("overflow-hidden border-border/80 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/15 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {status && status !== "not_submitted" && (
            <ProfileApprovalBadge status={status} />
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn("px-5 py-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
