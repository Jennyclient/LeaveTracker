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

export async function getHolidays(): Promise<Holiday[]> {
  const { data } = await API.get<GetHolidaysResponse>("/admin/holidays");

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
}

export async function importHolidays(
  inputs: HolidayInput[],
  rowNumbers: number[]
): Promise<HolidayImportResult> {
  const result: HolidayImportResult = { created: 0, failed: [] };

  for (let index = 0; index < inputs.length; index += 1) {
    const input = inputs[index];
    const rowNumber = rowNumbers[index];

    try {
      await createHoliday(input);
      result.created += 1;
    } catch (error) {
      result.failed.push({
        rowNumber,
        holidayName: input.holidayName,
        date: input.date,
        error: error instanceof Error ? error.message : "Failed to import holiday",
      });
    }
  }

  return result;
}
