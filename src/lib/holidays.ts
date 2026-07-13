import API from "@/lib/api";
import type { ApprovedLeaveCalendarEntry, Holiday, HolidayCalendarData, HolidayType } from "@/types";

type ApiHolidayType = "PUBLIC" | "RESTRICTED" | "OPTIONAL";

interface ApiHoliday {
  id: string;
  holidayName: string;
  date: string;
  type: ApiHolidayType;
}

interface ApiApprovedLeave {
  id: string;
  employeeId: string;
  employeeName?: string;
  startDate: string;
  endDate: string;
  type?: string | null;
  status: string;
  leaveDays: number;
}

interface GetHolidaysResponse {
  success: boolean;
  message?: string;
  holidays?: ApiHoliday[];
  data?: ApiHoliday[];
  approvedLeavesCount?: number;
  approvedLeaves?: ApiApprovedLeave[];
}

interface HolidayMutationResponse {
  success: boolean;
  message?: string;
  holiday?: ApiHoliday;
}

interface DeleteHolidayResponse {
  success: boolean;
  message?: string;
}

export interface HolidayInput {
  holidayName: string;
  date: string;
  type: HolidayType;
}

function mapHolidayTypeFromApi(type: ApiHolidayType): HolidayType {
  return type.toLowerCase() as HolidayType;
}

function mapHolidayTypeToApi(type: HolidayType): ApiHolidayType {
  return type.toUpperCase() as ApiHolidayType;
}

function mapApiHolidayToHoliday(api: ApiHoliday): Holiday {
  return {
    id: api.id,
    name: api.holidayName,
    date: api.date,
    type: mapHolidayTypeFromApi(api.type),
  };
}

function buildPayload(input: HolidayInput) {
  return {
    holidayName: input.holidayName.trim(),
    date: input.date,
    type: mapHolidayTypeToApi(input.type),
  };
}

function mapApiApprovedLeave(api: ApiApprovedLeave): ApprovedLeaveCalendarEntry {
  return {
    id: api.id,
    employeeId: api.employeeId,
    employeeName: api.employeeName,
    startDate: api.startDate,
    endDate: api.endDate,
    leaveType: api.type?.trim() || "Leave",
    status: api.status,
    days: api.leaveDays,
  };
}

function mapHolidayCalendarResponse(data: GetHolidaysResponse): HolidayCalendarData {
  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch holidays");
  }

  const holidays = (data.holidays ?? data.data ?? []).map(mapApiHolidayToHoliday);
  const approvedLeaves = (data.approvedLeaves ?? []).map(mapApiApprovedLeave);

  return { holidays, approvedLeaves };
}

export async function getHolidays(year?: number): Promise<Holiday[]> {
  const { data } = await API.get<GetHolidaysResponse>("/admin/holidays", {
    params: year ? { year } : undefined,
  });

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch holidays");
  }

  const holidays = data.holidays ?? data.data ?? [];
  return holidays.map(mapApiHolidayToHoliday);
}

export async function getEmployeeHolidays(): Promise<HolidayCalendarData> {
  const { data } = await API.get<GetHolidaysResponse>("/employee/holidays");
  return mapHolidayCalendarResponse(data);
}

export async function getManagerHolidays(): Promise<HolidayCalendarData> {
  const { data } = await API.get<GetHolidaysResponse>("/employee/manager/holidays");
  return mapHolidayCalendarResponse(data);
}

export async function createHoliday(input: HolidayInput): Promise<Holiday> {
  const { data } = await API.post<HolidayMutationResponse>(
    "/admin/holidays",
    buildPayload(input)
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to create holiday");
  }

  if (!data.holiday) {
    throw new Error(data.message ?? "Holiday created but response was incomplete");
  }

  return mapApiHolidayToHoliday(data.holiday);
}

export async function updateHoliday(
  id: string,
  input: HolidayInput
): Promise<Holiday> {
  const { data } = await API.put<HolidayMutationResponse>(
    `/admin/holidays/${id}`,
    buildPayload(input)
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to update holiday");
  }

  if (!data.holiday) {
    throw new Error(data.message ?? "Holiday updated but response was incomplete");
  }

  return mapApiHolidayToHoliday(data.holiday);
}

export async function deleteHoliday(id: string): Promise<void> {
  const { data } = await API.delete<DeleteHolidayResponse>(`/admin/holidays/${id}`);

  if (!data.success) {
    throw new Error(data.message ?? "Failed to delete holiday");
  }
}

export interface HolidayImportFailure {
  rowNumber: number;
  holidayName: string;
  date: string;
  error: string;
}

export interface HolidayImportResult {
  created: number;
  failed: HolidayImportFailure[];
  message?: string;
}

interface HolidayImportApiFailure {
  row?: number;
  rowNumber?: number;
  holidayName?: string;
  name?: string;
  date?: string;
  error?: string;
  message?: string;
}

interface HolidayImportApiResponse {
  success: boolean;
  message?: string;
  created?: number;
  imported?: number;
  count?: number;
  total?: number;
  importedCount?: number;
  totalImported?: number;
  holidays?: ApiHoliday[];
  failed?: HolidayImportApiFailure[];
  errors?: HolidayImportApiFailure[];
  data?: {
    created?: number;
    imported?: number;
    count?: number;
    total?: number;
    importedCount?: number;
    totalImported?: number;
    successful?: number;
    successCount?: number;
    inserted?: number;
    added?: number;
    holidays?: ApiHoliday[];
    failed?: HolidayImportApiFailure[];
    errors?: HolidayImportApiFailure[];
    skipped?: HolidayImportApiFailure[];
    results?: HolidayImportApiFailure[];
  };
}

function mapImportFailure(failure: HolidayImportApiFailure): HolidayImportFailure {
  return {
    rowNumber: failure.rowNumber ?? failure.row ?? 0,
    holidayName: failure.holidayName ?? failure.name ?? "—",
    date: failure.date ?? "—",
    error: failure.error ?? failure.message ?? "Failed to import holiday",
  };
}

function parseCountFromMessage(message?: string): number | undefined {
  if (!message) return undefined;

  const match = message.match(/(\d+)\s+holiday/i);
  return match ? Number(match[1]) : undefined;
}

function extractImportedCount(data: HolidayImportApiResponse): number {
  const nested = data.data;

  const explicitCount =
    data.created ??
    data.imported ??
    data.count ??
    data.total ??
    data.importedCount ??
    data.totalImported ??
    nested?.created ??
    nested?.imported ??
    nested?.count ??
    nested?.total ??
    nested?.importedCount ??
    nested?.totalImported ??
    nested?.successful ??
    nested?.successCount ??
    nested?.inserted ??
    nested?.added;

  if (typeof explicitCount === "number" && explicitCount > 0) {
    return explicitCount;
  }

  const importedHolidays = data.holidays ?? nested?.holidays;
  if (importedHolidays?.length) {
    return importedHolidays.length;
  }

  const messageCount = parseCountFromMessage(data.message);
  if (messageCount) {
    return messageCount;
  }

  return explicitCount ?? 0;
}

function mapImportResult(data: HolidayImportApiResponse): HolidayImportResult {
  const failedItems =
    data.failed ??
    data.errors ??
    data.data?.failed ??
    data.data?.errors ??
    [];

  return {
    created: extractImportedCount(data),
    failed: failedItems.map(mapImportFailure),
    message: data.message,
  };
}

function getFilenameFromDisposition(header?: string): string | undefined {
  if (!header) return undefined;

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const match = /filename="?([^";]+)"?/i.exec(header);
  return match?.[1];
}

function downloadBlobFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportFilename(extension: "csv" | "xlsx"): string {
  const date = new Date().toISOString().slice(0, 10);
  return `holidays-${date}.${extension}`;
}

export async function importHolidaysFile(file: File): Promise<HolidayImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await API.post<HolidayImportApiResponse>(
    "/admin/holidays/import",
    formData
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to import holidays");
  }

  return mapImportResult(data);
}

export async function exportHolidaysCsv(year?: number): Promise<void> {
  const response = await API.get<Blob>("/admin/holidays/export/csv", {
    responseType: "blob",
    params: year ? { year } : undefined,
  });

  const filename =
    getFilenameFromDisposition(response.headers["content-disposition"]) ??
    exportFilename("csv");

  downloadBlobFile(new Blob([response.data], { type: "text/csv;charset=utf-8" }), filename);
}

export async function exportHolidaysExcel(year?: number): Promise<void> {
  const response = await API.get<Blob>("/admin/holidays/export/excel", {
    responseType: "blob",
    params: year ? { year } : undefined,
  });

  const filename =
    getFilenameFromDisposition(response.headers["content-disposition"]) ??
    exportFilename("xlsx");

  downloadBlobFile(
    new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename
  );
}
