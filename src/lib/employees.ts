import API from "@/lib/api";
import type { ApiRole } from "@/lib/auth";
import { encrypt } from "@/lib/encrypt";
import type { Employee } from "@/types";

export interface ApiManagerRef {
  id: string;
  name: string;
}

export interface ApiEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  contactNo?: string;
  joiningDate: string;
  designation?: string | null;
  role: ApiRole;
  manager?: ApiManagerRef | null;
  managerId?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
  leavePolicy?: string | null;
  leavePolicyId?: string | null;
}

export interface GetEmployeesResponse {
  success: boolean;
  count?: number;
  employees: ApiEmployee[];
  message?: string;
}

export interface EmployeeMutationResponse {
  success: boolean;
  employee: ApiEmployee;
  message?: string;
}

export interface DeleteEmployeeResponse {
  success: boolean;
  message?: string;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  password: string;
  contactNo: string;
  joiningDate: string;
  designation?: string;
  managerId?: string;
}

export interface UpdateEmployeeInput {
  name?: string;
  email?: string;
  password?: string;
  contactNo?: string;
  joiningDate?: string;
  designation?: string;
  managerId?: string | null;
}

export interface ManagerOption {
  id: string;
  name: string;
}

export interface ApiManagerListItem {
  id: string;
  name: string;
  designation?: string | null;
  email?: string;
  teamCount?: number;
}

export interface GetManagersListResponse {
  success: boolean;
  count?: number;
  managers: ApiManagerListItem[];
  message?: string;
}

export interface EmployeeListFilters {
  managerId?: string;
  managerName?: string;
}

export function buildEmployeeListFilters(
  managerFilter: string,
  managers: ManagerOption[]
): EmployeeListFilters | undefined {
  if (managerFilter === "all" || managerFilter === "unassigned") {
    return undefined;
  }

  const manager = managers.find((item) => item.id === managerFilter);
  if (manager) {
    return { managerName: manager.name };
  }

  return { managerId: managerFilter };
}

async function fetchEmployeesFromApi(
  filters?: EmployeeListFilters
): Promise<Employee[]> {
  const params: EmployeeListFilters = {};

  if (filters?.managerName) {
    params.managerName = filters.managerName;
  } else if (filters?.managerId) {
    params.managerId = filters.managerId;
  }

  const { data } = await API.get<GetEmployeesResponse>("/admin/employees", {
    params: Object.keys(params).length > 0 ? params : undefined,
  });

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch employees");
  }

  return data.employees.map(mapApiEmployeeToEmployee);
}

export function mapApiEmployeeToEmployee(api: ApiEmployee): Employee {
  const managerId = api.manager?.id ?? api.managerId ?? "";
  const managerName = api.manager
    ? api.manager.name || "—"
    : managerId
      ? "—"
      : "Unassigned";

  return {
    id: api.id,
    employeeId: api.employeeId,
    name: api.name,
    email: api.email,
    contactNo: api.contactNo,
    designation: api.designation?.trim() || "—",
    manager: managerName,
    managerId,
    leavePolicy: api.leavePolicy ?? undefined,
    leavePolicyId: api.leavePolicyId ?? undefined,
    status: api.status === "INACTIVE" ? "inactive" : "active",
    joinDate: api.joiningDate,
  };
}

export async function getManagersList(): Promise<ManagerOption[]> {
  const { data } = await API.get<GetManagersListResponse>("/admin/managers/list");

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch managers");
  }

  return data.managers.map((manager) => ({
    id: manager.id,
    name: manager.name,
  }));
}

export async function loadEmployeesPageData(
  filters?: EmployeeListFilters
): Promise<{
  employees: Employee[];
  managers: ManagerOption[];
}> {
  const [employees, managers] = await Promise.all([
    fetchEmployeesFromApi(filters),
    getManagersList(),
  ]);

  return { employees, managers };
}

export async function getEmployees(): Promise<Employee[]> {
  const { employees } = await loadEmployeesPageData();
  return employees;
}

export async function createEmployee(
  input: CreateEmployeeInput
): Promise<Employee> {
  const payload = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: encrypt(input.password.trim()),
    contactNo: input.contactNo.trim(),
    joiningDate: input.joiningDate,
    designation: input.designation?.trim() || undefined,
    managerId: input.managerId || undefined,
  };

  const { data } = await API.post<EmployeeMutationResponse>(
    "/admin/employees",
    payload
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to create employee");
  }

  return mapApiEmployeeToEmployee(data.employee);
}

export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput
): Promise<Employee> {
  const payload: Record<string, string | null> = {};

  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.email !== undefined) payload.email = input.email.trim().toLowerCase();
  if (input.password?.trim()) payload.password = encrypt(input.password.trim());
  if (input.contactNo !== undefined) payload.contactNo = input.contactNo.trim();
  if (input.joiningDate !== undefined) payload.joiningDate = input.joiningDate;
  if (input.designation !== undefined) {
    payload.designation = input.designation.trim();
  }
  if (input.managerId !== undefined) {
    payload.managerId = input.managerId;
  }

  const { data } = await API.put<EmployeeMutationResponse>(
    `/admin/employees/${id}`,
    payload
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to update employee");
  }

  return mapApiEmployeeToEmployee(data.employee);
}

export async function deleteEmployee(id: string): Promise<void> {
  const { data } = await API.delete<DeleteEmployeeResponse>(
    `/admin/employees/${id}`
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to delete employee");
  }
}
