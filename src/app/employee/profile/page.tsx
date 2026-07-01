"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";

export default function EmployeeProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your employee information and leave policy details"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center pt-6 text-center">
            <Avatar className="size-20">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.employeeId && (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {user.employeeId}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {user.manager && (
                <div>
                  <p className="text-sm text-muted-foreground">Manager</p>
                  <p className="font-medium">{user.manager}</p>
                </div>
              )}
              {user.leavePolicy && (
                <div>
                  <p className="text-sm text-muted-foreground">Leave Policy</p>
                  <p className="font-medium">{user.leavePolicy}</p>
                </div>
              )}
            </div>

            {!user.manager && !user.leavePolicy && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  Additional profile details will appear here once loaded from the server.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
