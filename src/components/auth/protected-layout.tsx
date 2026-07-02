"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { canAccessRole, getDefaultDashboardPath } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

export function ProtectedLayout({ children, role }: ProtectedLayoutProps) {
  const router = useRouter();
  const { user, isLoggedIn, hasHydrated } = useAuthStore();

  const hasAccess = user ? canAccessRole(user, role) : false;

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isLoggedIn || !user) {
      router.replace("/login");
      return;
    }

    if (!canAccessRole(user, role)) {
      router.replace(getDefaultDashboardPath(user));
    }
  }, [hasHydrated, isLoggedIn, user, role, router]);

  if (!hasHydrated || !isLoggedIn || !user || !hasAccess) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <DashboardLayout role={role} user={user}>
      {children}
    </DashboardLayout>
  );
}
