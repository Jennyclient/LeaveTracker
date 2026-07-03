"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  createAdminSettings,
  getAdminSettings,
  updateAdminSettings,
} from "@/lib/admin-settings";
import type { AdminSettings } from "@/types";

const DEFAULT_LEAVE_SETTINGS = {
  weekendAsWorkingDay: false,
  autoApproveSickLeave: false,
  emailNotification: true,
};

type SettingsFormState = {
  settingsId: string | null;
  organizationName: string;
  timezone: string;
  fiscalYearStart: string;
  weekendAsWorkingDay: boolean;
  autoApproveSickLeave: boolean;
  emailNotification: boolean;
};

const EMPTY_FORM: SettingsFormState = {
  settingsId: null,
  organizationName: "",
  timezone: "",
  fiscalYearStart: "",
  ...DEFAULT_LEAVE_SETTINGS,
};

function toFormState(settings: AdminSettings | undefined): SettingsFormState {
  if (!settings) {
    return EMPTY_FORM;
  }

  return {
    settingsId: settings.id,
    organizationName: settings.organization.organizationName,
    timezone: settings.organization.timezone,
    fiscalYearStart: settings.organization.fiscalYearStart,
    weekendAsWorkingDay: settings.leaveSettings.weekendAsWorkingDay,
    autoApproveSickLeave: settings.leaveSettings.autoApproveSickLeave,
    emailNotification: settings.leaveSettings.emailNotification,
  };
}

function SettingsSkeleton() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-28" />
      </div>
    </>
  );
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsFormState>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const settingsList = await getAdminSettings();
        if (cancelled) {
          return;
        }

        setForm(toFormState(settingsList[0]));
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to load settings";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (!form.organizationName.trim() || !form.timezone.trim() || !form.fiscalYearStart) {
      toast.error("Organization name, timezone and fiscal year start are required");
      return;
    }

    const payload = {
      organization: {
        organizationName: form.organizationName,
        timezone: form.timezone,
        fiscalYearStart: form.fiscalYearStart,
      },
      leaveSettings: {
        weekendAsWorkingDay: form.weekendAsWorkingDay,
        autoApproveSickLeave: form.autoApproveSickLeave,
        emailNotification: form.emailNotification,
      },
    };

    setIsSaving(true);
    try {
      const savedSettings = form.settingsId
        ? await updateAdminSettings(form.settingsId, payload)
        : await createAdminSettings(payload);

      setForm(toFormState(savedSettings));
      toast.success("Settings saved successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save settings";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure system preferences and organization settings"
      />

      {isLoading ? (
        <SettingsSkeleton />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>Basic organization information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={form.organizationName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        organizationName: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input
                    value={form.timezone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, timezone: event.target.value }))
                    }
                    placeholder="Asia/Kolkata"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fiscal Year Start</Label>
                  <Input
                    type="date"
                    value={form.fiscalYearStart}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        fiscalYearStart: event.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave Settings</CardTitle>
                <CardDescription>Configure leave management preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Weekend as working day</p>
                    <p className="text-xs text-muted-foreground">Include weekends in leave count</p>
                  </div>
                  <Switch
                    checked={form.weekendAsWorkingDay}
                    onCheckedChange={(weekendAsWorkingDay) =>
                      setForm((current) => ({ ...current, weekendAsWorkingDay }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-approve sick leave</p>
                    <p className="text-xs text-muted-foreground">Up to 2 days without manager approval</p>
                  </div>
                  <Switch
                    checked={form.autoApproveSickLeave}
                    onCheckedChange={(autoApproveSickLeave) =>
                      setForm((current) => ({ ...current, autoApproveSickLeave }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email notifications</p>
                    <p className="text-xs text-muted-foreground">Send email on leave status changes</p>
                  </div>
                  <Switch
                    checked={form.emailNotification}
                    onCheckedChange={(emailNotification) =>
                      setForm((current) => ({ ...current, emailNotification }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => void handleSave()} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
