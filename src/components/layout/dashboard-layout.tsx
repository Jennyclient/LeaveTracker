"use client";

import { useState } from "react";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  getNavigationForRole,
  type NavEntry,
  type NavLink,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { User, UserRole } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  user: User;
}

export function DashboardLayout({ children, role, user }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigation = getNavigationForRole(role);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="hidden lg:block">
        <Sidebar
          navigation={navigation as NavEntry[] | NavLink[]}
          role={role}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar
            navigation={navigation as NavEntry[] | NavLink[]}
            role={role}
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            floating={false}
          />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          collapsed ? "lg:pl-[68px]" : "lg:pl-64"
        )}
      >
        <Header
          user={user}
          collapsed={collapsed}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
