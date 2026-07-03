"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { ActiveBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { roleLabels } from "@/lib/navigation";
import { getEmployeeProfile } from "@/lib/profile";
import type { EmployeeProfile } from "@/types";

function ProfileSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardContent className="flex flex-col items-center pt-6 text-center">
          <Skeleton className="size-20 rounded-full" />
          <Skeleton className="mt-4 h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-48" />
          <Skeleton className="mt-2 h-4 w-28" />
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-36" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const data = await getEmployeeProfile();
        if (cancelled) {
          return;
        }

        setProfile(data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to load profile";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Profile"
          description="Your employee information and leave policy details"
        />
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Profile"
          description="Your employee information and leave policy details"
        />
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Unable to load profile details.
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
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
            <h2 className="mt-4 text-xl font-semibold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {profile.employeeId}
            </p>
            <div className="mt-3">
              <ActiveBadge active={profile.status === "active"} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Designation</p>
                <p className="font-medium">{profile.designation}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{roleLabels[profile.role]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium">{profile.contactNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joining Date</p>
                <p className="font-medium">{formatDate(profile.joiningDate)}</p>
              </div>
            </div>

            {profile.manager ? (
              <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                <p className="text-sm font-medium">Manager Information</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{profile.manager.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employee ID</p>
                    <p className="font-medium">{profile.manager.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.manager.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Number</p>
                    <p className="font-medium">{profile.manager.contactNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Designation</p>
                    <p className="font-medium">{profile.manager.designation}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No manager assigned.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
