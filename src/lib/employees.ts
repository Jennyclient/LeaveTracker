import API from "@/lib/api";
import type { ApiRole } from "@/lib/auth";
import { encrypt } from "@/lib/encrypt";
import {
  mapApiCertifications,
  mapApiSkills,
  mapCertificationsToApi,
  mapSkillsToApi,
  type ApiEmployeeCertification,
  type ApiEmployeeSkill,
} from "@/lib/employee-skills";
import type {
  Employee,
  EmployeeBankDetails,
  EmployeeCertification,
  EmployeeSalary,
  EmployeeSkill,
  EmploymentType,
  PayrollType,
  ProfileApprovalStatus,
} from "@/types";

export interface ApiManagerRef {
  id: string;
  name: string;
}

type ApiEmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERN"
  | "PERMANENT";
type ApiPayrollType = "MONTHLY" | "WEEKLY";
type ApiProfileApprovalStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";

interface ApiEmployeeSalary {
  ctc?: number;
  basicSalary?: number;
  hra?: number;
  specialAllowance?: number;
  pf?: number;
  providentFund?: number;
  professionalTax?: number;
  salaryEffectiveDate?: string;
  effectiveFrom?: string;
  payrollType?: ApiPayrollType;
}

interface ApiEmployeeBank {
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
}

export interface ApiEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  contactNo?: string;
  joiningDate: string;
  designation?: string | null;
  department?: string | null;
  role: ApiRole;
  manager?: ApiManagerRef | null;
  managerId?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
  leavePolicy?: string | null;
  leavePolicyId?: string | null;
  yearsOfExperience?: number;
  employmentType?: ApiEmploymentType;
  workLocation?: string | null;
  salary?: ApiEmployeeSalary;
  bank?: ApiEmployeeBank;
  bankStatus?: ApiProfileApprovalStatus;
  skills?: ApiEmployeeSkill[];
  skillsStatus?: ApiProfileApprovalStatus;
  primarySkill?: string | null;
  certifications?: string | ApiEmployeeCertification[] | null;
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
  department?: string;
  managerId?: string;
  yearsOfExperience?: number;
  employmentType?: EmploymentType;
  workLocation?: string;
  salary?: EmployeeSalary;
  bank?: EmployeeBankDetails;
  skills?: EmployeeSkill[];
  primarySkill?: string;
  certifications?: EmployeeCertification[];
}

export interface UpdateEmployeeInput {
  name?: string;
  email?: string;
  password?: string;
  contactNo?: string;
  joiningDate?: string;
  designation?: string;
  department?: string;
  managerId?: string | null;
  yearsOfExperience?: number;
  employmentType?: EmploymentType;
  workLocation?: string;
  salary?: EmployeeSalary;
  bank?: EmployeeBankDetails;
  skills?: EmployeeSkill[];
  primarySkill?: string;
  certifications?: EmployeeCertification[];
}

export interface ManagerOption {
  id: string;
  name: string;
}

export interface ApiManagerListItem {
  id: string;
  _id?: string;
  name: string;
  designation?: string | null;
  email?: string;
  teamCount?: number;
}

export interface GetManagersListResponse {
  success: boolean;
  count?: number;
  managers?: ApiManagerListItem[];
  employees?: ApiManagerListItem[];
  message?: string;
}

export interface EmployeeListFilters {
  managerId?: string;
  managerName?: string;
}

const employmentTypeFromApi: Record<ApiEmploymentType, EmploymentType> = {
  FULL_TIME: "permanent",
  PART_TIME: "permanent",
  PERMANENT: "permanent",
  CONTRACT: "contract",
  INTERN: "intern",
};

const employmentTypeToApi: Record<EmploymentType, ApiEmploymentType> = {
  permanent: "FULL_TIME",
  contract: "CONTRACT",
  intern: "INTERN",
};

const payrollTypeFromApi: Record<ApiPayrollType, PayrollType> = {
  MONTHLY: "monthly",
  WEEKLY: "weekly",
};

const payrollTypeToApi: Record<PayrollType, ApiPayrollType> = {
  monthly: "MONTHLY",
  weekly: "WEEKLY",
};

const approvalStatusFromApi: Record<ApiProfileApprovalStatus, ProfileApprovalStatus> = {
  NOT_SUBMITTED: "not_submitted",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

function mapApprovalStatus(
  status?: ApiProfileApprovalStatus
): ProfileApprovalStatus {
  return status ? approvalStatusFromApi[status] : "not_submitted";
}

function toSalaryEffectiveDate(value?: string): string | undefined {
  if (!value?.trim()) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return date.toISOString();
}

function mapApiSalary(salary?: ApiEmployeeSalary): EmployeeSalary | undefined {
  if (!salary) return undefined;

  const effectiveFrom = salary.salaryEffectiveDate ?? salary.effectiveFrom;

  return {
    ctc: salary.ctc,
    basicSalary: salary.basicSalary,
    hra: salary.hra,
    specialAllowance: salary.specialAllowance,
    providentFund: salary.pf ?? salary.providentFund,
    professionalTax: salary.professionalTax,
    effectiveFrom,
    payrollType: salary.payrollType
      ? payrollTypeFromApi[salary.payrollType]
      : undefined,
  };
}

function mapApiBank(bank?: ApiEmployeeBank): EmployeeBankDetails | undefined {
  if (!bank) return undefined;

  return {
    accountHolderName: bank.accountHolderName,
    bankName: bank.bankName,
    accountNumber: bank.accountNumber,
    ifscCode: bank.ifscCode,
    branch: bank.branch,
    upiId: bank.upiId,
  };
}

function mapApiSkillsFromEmployee(skills?: ApiEmployeeSkill[]): EmployeeSkill[] | undefined {
  return mapApiSkills(skills);
}

function hasSalaryData(salary: EmployeeSalary): boolean {
  return (
    salary.ctc !== undefined ||
    salary.basicSalary !== undefined ||
    salary.hra !== undefined ||
    salary.specialAllowance !== undefined ||
    salary.providentFund !== undefined ||
    salary.professionalTax !== undefined ||
    Boolean(salary.effectiveFrom?.trim()) ||
    salary.payrollType !== undefined
  );
}

function mapSalaryToApi(salary?: EmployeeSalary) {
  if (!salary || !hasSalaryData(salary)) return undefined;

  return {
    ctc: salary.ctc,
    basicSalary: salary.basicSalary,
    hra: salary.hra,
    specialAllowance: salary.specialAllowance,
    pf: salary.providentFund,
    professionalTax: salary.professionalTax,
    salaryEffectiveDate: toSalaryEffectiveDate(salary.effectiveFrom),
    payrollType: salary.payrollType
      ? payrollTypeToApi[salary.payrollType]
      : undefined,
  };
}

function mapBankToApi(bank?: EmployeeBankDetails) {
  if (!bank) return undefined;

  return {
    accountHolderName: bank.accountHolderName?.trim() || undefined,
    bankName: bank.bankName?.trim() || undefined,
    accountNumber: bank.accountNumber?.trim() || undefined,
    ifscCode: bank.ifscCode?.trim() || undefined,
    branch: bank.branch?.trim() || undefined,
    upiId: bank.upiId?.trim() || undefined,
  };
}

function buildEmployeePayload(
  input: CreateEmployeeInput | UpdateEmployeeInput,
  options?: { includePassword?: boolean }
) {
  const payload: Record<string, unknown> = {};

  if ("name" in input && input.name !== undefined) {
    payload.name = input.name.trim();
  }
  if ("email" in input && input.email !== undefined) {
    payload.email = input.email.trim().toLowerCase();
  }
  if (
    options?.includePassword &&
    "password" in input &&
    input.password?.trim()
  ) {
    payload.password = encrypt(input.password.trim());
  } else if ("password" in input && input.password?.trim()) {
    payload.password = encrypt(input.password.trim());
  }
  if ("contactNo" in input && input.contactNo !== undefined) {
    payload.contactNo = input.contactNo.trim();
  }
  if ("joiningDate" in input && input.joiningDate !== undefined) {
    payload.joiningDate = input.joiningDate;
  }
  if ("designation" in input && input.designation !== undefined) {
    payload.designation = input.designation.trim();
  }
  if ("department" in input && input.department !== undefined) {
    payload.department = input.department.trim() || undefined;
  }
  if ("managerId" in input && input.managerId !== undefined) {
    payload.managerId = input.managerId;
  }
  if ("yearsOfExperience" in input && input.yearsOfExperience !== undefined) {
    payload.yearsOfExperience = input.yearsOfExperience;
  }
  if ("employmentType" in input && input.employmentType !== undefined) {
    payload.employmentType = employmentTypeToApi[input.employmentType];
  }
  if ("workLocation" in input && input.workLocation !== undefined) {
    payload.workLocation = input.workLocation.trim() || undefined;
  }
  if ("salary" in input && input.salary !== undefined) {
    payload.salary = mapSalaryToApi(input.salary);
  }
  if ("bank" in input && input.bank !== undefined) {
    payload.bank = mapBankToApi(input.bank);
  }
  if ("skills" in input && input.skills !== undefined) {
    payload.skills = mapSkillsToApi(input.skills);
  }
  if ("primarySkill" in input && input.primarySkill !== undefined) {
    payload.primarySkill = input.primarySkill.trim() || undefined;
  }
  if ("certifications" in input && input.certifications !== undefined) {
    payload.certifications = mapCertificationsToApi(input.certifications);
  }

  return payload;
}

function mapManagerOptions(data: GetManagersListResponse): ManagerOption[] {
  const items = data.managers ?? data.employees ?? [];

  return items
    .map((item) => ({
      id: item.id ?? item._id ?? "",
      name: item.name?.trim() ?? "",
    }))
    .filter((item) => item.id && item.name);
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
    department: api.department?.trim() || undefined,
    manager: managerName,
    managerId,
    leavePolicy: api.leavePolicy ?? undefined,
    leavePolicyId: api.leavePolicyId ?? undefined,
    status: api.status === "INACTIVE" ? "inactive" : "active",
    joinDate: api.joiningDate,
    yearsOfExperience: api.yearsOfExperience,
    employmentType: api.employmentType
      ? employmentTypeFromApi[api.employmentType]
      : undefined,
    workLocation: api.workLocation?.trim() || undefined,
    salary: mapApiSalary(api.salary),
    bank: mapApiBank(api.bank),
    bankStatus: mapApprovalStatus(api.bankStatus),
    skills: mapApiSkillsFromEmployee(api.skills),
    skillsStatus: mapApprovalStatus(api.skillsStatus),
    primarySkill: api.primarySkill?.trim() || undefined,
    certifications: mapApiCertifications(api.certifications),
  };
}

export async function getManagersList(): Promise<ManagerOption[]> {
  const { data } = await API.get<GetManagersListResponse>("/admin/managers/list");

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch managers");
  }

  return mapManagerOptions(data);
}

export async function getEmployeeManagerOptions(
  mode: "add" | "edit",
  employeeId?: string
): Promise<ManagerOption[]> {
  if (mode === "edit") {
    if (!employeeId) {
      throw new Error("Employee id is required to load managers");
    }

    const { data } = await API.post<GetManagersListResponse>(
      "/admin/set-employee-manager",
      { id: employeeId }
    );

    if (!data.success) {
      throw new Error(data.message ?? "Failed to fetch managers");
    }

    return mapManagerOptions(data);
  }

  const { data } = await API.get<GetManagersListResponse>(
    "/admin/set-employee-manager"
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch managers");
  }

  return mapManagerOptions(data);
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
  const payload = buildEmployeePayload(input, { includePassword: true });

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
  const payload = buildEmployeePayload(input);

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

async function mutateEmployeeApproval(
  id: string,
  action: "approve-bank" | "reject-bank" | "approve-skills" | "reject-skills"
): Promise<Employee> {
  const { data } = await API.post<EmployeeMutationResponse>(
    `/admin/employees/${id}/${action}`
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to update approval status");
  }

  return mapApiEmployeeToEmployee(data.employee);
}

export function approveEmployeeBank(id: string): Promise<Employee> {
  return mutateEmployeeApproval(id, "approve-bank");
}

export function rejectEmployeeBank(id: string): Promise<Employee> {
  return mutateEmployeeApproval(id, "reject-bank");
}

export function approveEmployeeSkills(id: string): Promise<Employee> {
  return mutateEmployeeApproval(id, "approve-skills");
}

export function rejectEmployeeSkills(id: string): Promise<Employee> {
  return mutateEmployeeApproval(id, "reject-skills");
}
