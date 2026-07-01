"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types";

const roleRoutes: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  manager: "/manager/dashboard",
  employee: "/employee/dashboard",
};

interface ProtectedLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

export function ProtectedLayout({ children, role }: ProtectedLayoutProps) {
  const router = useRouter();
  const { user, isLoggedIn, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isLoggedIn || !user) {
      router.replace("/login");
      return;
    }

    if (user.role !== role) {
      router.replace(roleRoutes[user.role]);
    }
  }, [hasHydrated, isLoggedIn, user, role, router]);

  if (!hasHydrated || !isLoggedIn || !user || user.role !== role) {
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
