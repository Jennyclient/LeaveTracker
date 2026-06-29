"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

interface BreadcrumbNavProps {
  className?: string;
}

export function BreadcrumbNav({ className }: BreadcrumbNavProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return { href, label, isLast: index === segments.length - 1 };
  });

  return (
    <nav className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}>
      <Link
        href={`/${segments[0]}/dashboard`}
        className="flex items-center hover:text-foreground"
      >
        <Home className="size-3.5" />
      </Link>
      {crumbs.slice(1).map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="size-3.5" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
