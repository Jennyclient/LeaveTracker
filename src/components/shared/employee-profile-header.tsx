import type { ComponentType } from "react";
import {
  Briefcase,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";

import { ActiveBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/format";
import type { EmployeeProfile } from "@/types";

interface EmployeeProfileHeaderProps {
  profile: EmployeeProfile;
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary/80" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function EmployeeProfileHeader({ profile }: EmployeeProfileHeaderProps) {
  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-background shadow-md">
              <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-tight">{profile.name}</h2>
                <ActiveBadge active={profile.status === "active"} />
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {profile.employeeId}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <MetaItem icon={Mail} label="Work Email" value={profile.email} />
            <MetaItem icon={Phone} label="Mobile" value={profile.contactNo} />
            <MetaItem
              icon={Briefcase}
              label="Designation"
              value={profile.designation}
            />
            <MetaItem
              icon={Calendar}
              label="Joining Date"
              value={formatDate(profile.joiningDate)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
