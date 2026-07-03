import API from "@/lib/api";
import type { AdminSettings } from "@/types";

interface ApiAdminSettings {
  id: string;
  organization: {
    organizationName: string;
    timezone: string;
    fiscalYearStart: string;
  };
  leaveSettings: {
    weekendAsWorkingDay: boolean;
    autoApproveSickLeave: boolean;
    emailNotification: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface GetAdminSettingsResponse {
  success: boolean;
  message?: string;
  count?: number;
  adminSettings?: ApiAdminSettings[];
}

interface AdminSettingsMutationResponse {
  success: boolean;
  message?: string;
  adminSettings?: ApiAdminSettings;
}

interface DeleteAdminSettingsResponse {
  success: boolean;
  message?: string;
}

export interface AdminSettingsInput {
  organization: {
    organizationName: string;
    timezone: string;
    fiscalYearStart: string;
  };
  leaveSettings: {
    weekendAsWorkingDay: boolean;
    autoApproveSickLeave: boolean;
    emailNotification: boolean;
  };
}

function toDateInputValue(value: string): string {
  if (!value) {
    return "";
  }

  return value.includes("T") ? value.split("T")[0] : value;
}

function mapApiAdminSettings(api: ApiAdminSettings): AdminSettings {
  return {
    id: api.id,
    organization: {
      organizationName: api.organization.organizationName,
      timezone: api.organization.timezone,
      fiscalYearStart: toDateInputValue(api.organization.fiscalYearStart),
    },
    leaveSettings: {
      weekendAsWorkingDay: api.leaveSettings.weekendAsWorkingDay,
      autoApproveSickLeave: api.leaveSettings.autoApproveSickLeave,
      emailNotification: api.leaveSettings.emailNotification,
    },
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

function buildPayload(input: AdminSettingsInput): AdminSettingsInput {
  return {
    organization: {
      organizationName: input.organization.organizationName.trim(),
      timezone: input.organization.timezone.trim(),
      fiscalYearStart: input.organization.fiscalYearStart,
    },
    leaveSettings: {
      weekendAsWorkingDay: input.leaveSettings.weekendAsWorkingDay,
      autoApproveSickLeave: input.leaveSettings.autoApproveSickLeave,
      emailNotification: input.leaveSettings.emailNotification,
    },
  };
}

export async function getAdminSettings(): Promise<AdminSettings[]> {
  const { data } = await API.get<GetAdminSettingsResponse>("/admin/admin-settings");

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch admin settings");
  }

  return (data.adminSettings ?? []).map(mapApiAdminSettings);
}

export async function createAdminSettings(
  input: AdminSettingsInput
): Promise<AdminSettings> {
  const { data } = await API.post<AdminSettingsMutationResponse>(
    "/admin/admin-settings",
    buildPayload(input)
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to create admin settings");
  }

  if (!data.adminSettings) {
    throw new Error(data.message ?? "Admin settings created but response was incomplete");
  }

  return mapApiAdminSettings(data.adminSettings);
}

export async function updateAdminSettings(
  id: string,
  input: AdminSettingsInput
): Promise<AdminSettings> {
  const { data } = await API.put<AdminSettingsMutationResponse>(
    `/admin/admin-settings/${id}`,
    buildPayload(input)
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to update admin settings");
  }

  if (!data.adminSettings) {
    throw new Error(data.message ?? "Admin settings updated but response was incomplete");
  }

  return mapApiAdminSettings(data.adminSettings);
}

export async function deleteAdminSettings(id: string): Promise<void> {
  const { data } = await API.delete<DeleteAdminSettingsResponse>(
    `/admin/admin-settings/${id}`
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to delete admin settings");
  }
}
