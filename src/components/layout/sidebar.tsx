"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getNavIcon } from "@/lib/icons";
import {
  isNavGroup,
  type NavEntry,
  type NavLink,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { roleLabels } from "@/lib/navigation";

interface SidebarProps {
  navigation: NavEntry[] | NavLink[];
  role: UserRole;
  collapsed: boolean;
  onToggle: () => void;
}

function NavItemLink({
  item,
  collapsed,
  isActive,
}: {
  item: NavLink;
  collapsed: boolean;
  isActive: boolean;
}) {
  const Icon = getNavIcon(item.icon);

  const link = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export function Sidebar({ navigation, role, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Leaf className="size-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">LeaveFlow</span>
            <span className="text-xs text-sidebar-foreground/60">{roleLabels[role]}</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {(navigation as NavEntry[]).map((entry, idx) => {
          if (isNavGroup(entry)) {
            return (
              <div key={entry.title} className="space-y-1">
                {!collapsed && (
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                    {entry.title}
                  </p>
                )}
                {collapsed && idx > 0 && <Separator className="my-2" />}
                {entry.items.map((item) => (
                  <NavItemLink
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    isActive={isLinkActive(item.href)}
                  />
                ))}
              </div>
            );
          }

          return (
            <NavItemLink
              key={entry.href}
              item={entry}
              collapsed={collapsed}
              isActive={isLinkActive(entry.href)}
            />
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn("w-full", !collapsed && "justify-start")}
          onClick={onToggle}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
