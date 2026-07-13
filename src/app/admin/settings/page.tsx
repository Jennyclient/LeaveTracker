"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { FormField } from "@/components/shared/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  createAdminSettings,
  getAdminSettings,
  updateAdminSettings,
} from "@/lib/admin-settings";
import { useFormErrors } from "@/hooks/use-form-errors";
import {
  buildFieldErrors,
  hasFieldErrors,
  validateRequired,
} from "@/lib/form-validation";
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

type SettingsField = "organizationName" | "timezone" | "fiscalYearStart";

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
  const { errors, setFormErrors, clearFieldError } = useFormErrors<SettingsField>();

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

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = buildFieldErrors<SettingsField>([
      {
        field: "organizationName",
        error: validateRequired(form.organizationName, "Company name is required"),
      },
      { field: "timezone", error: validateRequired(form.timezone, "Timezone is required") },
      {
        field: "fiscalYearStart",
        error: validateRequired(form.fiscalYearStart, "Fiscal year start is required"),
      },
    ]);

    setFormErrors(nextErrors);

    if (hasFieldErrors(nextErrors)) {
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
          <form onSubmit={(event) => void handleSave(event)} className="space-y-6" noValidate>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>Basic organization information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  label="Company Name"
                  htmlFor="organizationName"
                  required
                  error={errors.organizationName}
                >
                  <Input
                    id="organizationName"
                    value={form.organizationName}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        organizationName: event.target.value,
                      }));
                      clearFieldError("organizationName");
                    }}
                  />
                </FormField>
                <FormField
                  label="Timezone"
                  htmlFor="timezone"
                  required
                  error={errors.timezone}
                >
                  <Input
                    id="timezone"
                    value={form.timezone}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, timezone: event.target.value }));
                      clearFieldError("timezone");
                    }}
                    placeholder="Asia/Kolkata"
                  />
                </FormField>
                <FormField
                  label="Fiscal Year Start"
                  htmlFor="fiscalYearStart"
                  required
                  error={errors.fiscalYearStart}
                >
                  <Input
                    id="fiscalYearStart"
                    type="date"
                    value={form.fiscalYearStart}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        fiscalYearStart: event.target.value,
                      }));
                      clearFieldError("fiscalYearStart");
                    }}
                  />
                </FormField>
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
          </form>
        </>
      )}
    </div>
  );
}
