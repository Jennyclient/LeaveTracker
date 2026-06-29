import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconClassName?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  iconClassName,
}: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <Card>
      <CardContent className="flex items-start justify-between pt-0">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {change && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {TrendIcon && (
                <TrendIcon
                  className={cn(
                    "size-3.5",
                    trend === "up" && "text-emerald-500",
                    trend === "down" && "text-red-500"
                  )}
                />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary",
            iconClassName
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
