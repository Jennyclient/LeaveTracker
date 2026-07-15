"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EmployeeBankCard } from "@/components/shared/employee-bank-card";
import { EmployeeProfileHeader } from "@/components/shared/employee-profile-header";
import { EmployeeProfilePendingPanel } from "@/components/shared/employee-profile-pending-panel";
import { EmployeeSalaryCard } from "@/components/shared/employee-salary-card";
import { EmployeeSkillsCard } from "@/components/shared/employee-skills-card";
import { ProfileDetailField } from "@/components/shared/profile-detail-field";
import { ProfileSectionCard } from "@/components/shared/profile-section-card";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { roleLabels } from "@/lib/navigation";
import {
  getEmployeeProfile,
  getEmployeeSalary,
  loadEmployeeProfileVerificationDetails,
} from "@/lib/profile";
import type { EmployeeProfile } from "@/types";

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="h-10 w-80" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

function ProfileVerificationSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

function FinancesSkeleton() {
  return <Skeleton className="h-64 w-full rounded-xl" />;
}

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [isProfileTabLoading, setIsProfileTabLoading] = useState(false);
  const [isFinancesTabLoading, setIsFinancesTabLoading] = useState(false);
  const [hasLoadedSalary, setHasLoadedSalary] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const data = await getEmployeeProfile();
        if (!cancelled) {
          setProfile(data);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load profile";
          toast.error(message);
        }
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

  useEffect(() => {
    if (activeTab !== "profile" || !profile) {
      return;
    }

    let cancelled = false;
    const currentProfile = profile;

    async function loadVerificationDetails() {
      setIsProfileTabLoading(true);
      try {
        const updated = await loadEmployeeProfileVerificationDetails(currentProfile);
        if (!cancelled) {
          setProfile(updated);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load bank and skills details";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsProfileTabLoading(false);
        }
      }
    }

    void loadVerificationDetails();

    return () => {
      cancelled = true;
    };
  }, [activeTab, profile?.id]);

  useEffect(() => {
    if (activeTab !== "finances" || !profile || hasLoadedSalary) {
      return;
    }

    let cancelled = false;

    async function loadSalaryDetails() {
      setIsFinancesTabLoading(true);
      try {
        const salary = await getEmployeeSalary();
        if (!cancelled) {
          setProfile((current) => (current ? { ...current, salary } : current));
          setHasLoadedSalary(true);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load salary details";
          toast.error(message);
          setHasLoadedSalary(true);
        }
      } finally {
        if (!cancelled) {
          setIsFinancesTabLoading(false);
        }
      }
    }

    void loadSalaryDetails();

    return () => {
      cancelled = true;
    };
  }, [activeTab, profile?.id, hasLoadedSalary]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Profile"
          description="Manage your personal information, finances, and verification details."
        />
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Profile"
          description="Manage your personal information, finances, and verification details."
        />
        <ProfileSectionCard title="Profile">
          <p className="text-sm text-muted-foreground">
            Unable to load profile details.
          </p>
        </ProfileSectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your personal information, finances, and verification details."
      />

      <EmployeeProfileHeader profile={profile} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0"
        >
          <TabsTrigger
            value="about"
            className="rounded-none px-0 pb-3 after:bg-primary data-active:text-primary"
          >
            About
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="rounded-none px-0 pb-3 after:bg-primary data-active:text-primary"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="finances"
            className="rounded-none px-0 pb-3 after:bg-primary data-active:text-primary"
          >
            Finances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ProfileSectionCard title="Primary Details">
              <div className="grid gap-5 sm:grid-cols-2">
                <ProfileDetailField label="Full Name" value={profile.name} />
                <ProfileDetailField label="Employee ID" value={profile.employeeId} />
                <ProfileDetailField label="Designation" value={profile.designation} />
                <ProfileDetailField label="Role" value={roleLabels[profile.role]} />
                <ProfileDetailField
                  label="Joining Date"
                  value={formatDate(profile.joiningDate)}
                />
                <ProfileDetailField label="Status" value={profile.status} />
              </div>
            </ProfileSectionCard>

            <ProfileSectionCard title="Contact Details">
              <div className="grid gap-5 sm:grid-cols-2">
                <ProfileDetailField label="Work Email" value={profile.email} />
                <ProfileDetailField label="Mobile Number" value={profile.contactNo} />
              </div>
            </ProfileSectionCard>
          </div>

          <ProfileSectionCard title="Reporting Manager">
            {profile.manager ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <ProfileDetailField label="Name" value={profile.manager.name} />
                <ProfileDetailField
                  label="Employee ID"
                  value={profile.manager.employeeId}
                />
                <ProfileDetailField label="Email" value={profile.manager.email} />
                <ProfileDetailField
                  label="Contact Number"
                  value={profile.manager.contactNo}
                />
                <ProfileDetailField
                  label="Designation"
                  value={profile.manager.designation}
                />
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No manager assigned yet.
              </p>
            )}
          </ProfileSectionCard>
        </TabsContent>

        <TabsContent value="profile" className="mt-0 space-y-6">
          {isProfileTabLoading ? (
            <ProfileVerificationSkeleton />
          ) : (
            <>
              <EmployeeProfilePendingPanel
                profile={profile}
                onAddBank={() => setBankDialogOpen(true)}
                onAddSkills={() => setSkillsDialogOpen(true)}
              />

              <div className="grid gap-6 lg:grid-cols-2">
                <EmployeeBankCard
                  profile={profile}
                  onUpdated={setProfile}
                  dialogOpen={bankDialogOpen}
                  onDialogOpenChange={setBankDialogOpen}
                />
                <EmployeeSkillsCard
                  profile={profile}
                  onUpdated={setProfile}
                  dialogOpen={skillsDialogOpen}
                  onDialogOpenChange={setSkillsDialogOpen}
                />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="finances" className="mt-0">
          {isFinancesTabLoading ? (
            <FinancesSkeleton />
          ) : (
            <EmployeeSalaryCard profile={profile} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
