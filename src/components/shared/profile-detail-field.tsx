import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ProfileDetailFieldProps {
  label: string;
  value?: ReactNode;
  className?: string;
  emptyLabel?: string;
}

export function ProfileDetailField({
  label,
  value,
  className,
  emptyLabel = "- Not Set -",
}: ProfileDetailFieldProps) {
  const isEmpty =
    value === undefined ||
    value === null ||
    value === "" ||
    value === "—";

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      {isEmpty ? (
        <p className="text-sm italic text-muted-foreground/80">{emptyLabel}</p>
      ) : (
        <div className="text-sm font-medium text-foreground">{value}</div>
      )}
    </div>
  );
}
