import API from "@/lib/api";
import { roleFromApi, type ApiRole } from "@/lib/auth";
import type { EmployeeProfile, EmployeeProfileManager } from "@/types";

interface ApiManagerRef {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  contactNo?: string;
  designation?: string | null;
  employeeId?: string;
}

interface ApiEmployeeProfile {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  contactNo?: string;
  designation?: string | null;
  joiningDate: string;
  role?: ApiRole;
  status?: "ACTIVE" | "INACTIVE";
  managerId?: ApiManagerRef | string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface GetEmployeeProfileResponse {
  success: boolean;
  message?: string;
  profile?: ApiEmployeeProfile;
}

function mapApiManager(manager: ApiManagerRef | null | undefined): EmployeeProfileManager | null {
  if (!manager) {
    return null;
  }

  const id = manager.id ?? manager._id;
  if (!id || !manager.name) {
    return null;
  }

  return {
    id,
    name: manager.name.trim(),
    email: manager.email?.trim() ?? "—",
    contactNo: manager.contactNo?.trim() ?? "—",
    designation: manager.designation?.trim() ?? "—",
    employeeId: manager.employeeId?.trim() ?? "—",
  };
}

function mapApiProfile(api: ApiEmployeeProfile): EmployeeProfile {
  const manager =
    typeof api.managerId === "object" && api.managerId !== null
      ? mapApiManager(api.managerId)
      : null;

  return {
    id: api.id,
    employeeId: api.employeeId,
    name: api.name,
    email: api.email,
    contactNo: api.contactNo?.trim() ?? "—",
    designation: api.designation?.trim() ?? "—",
    joiningDate: api.joiningDate,
    role: api.role ? roleFromApi[api.role] : "employee",
    status: api.status === "INACTIVE" ? "inactive" : "active",
    manager,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export async function getEmployeeProfile(): Promise<EmployeeProfile> {
  const { data } = await API.get<GetEmployeeProfileResponse>("/employee/profile");

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch profile");
  }

  if (!data.profile) {
    throw new Error(data.message ?? "Profile response was incomplete");
  }

  return mapApiProfile(data.profile);
}
