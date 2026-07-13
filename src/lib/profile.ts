import API from "@/lib/api";
import { roleFromApi, type ApiRole } from "@/lib/auth";
import {
  mapApiCertifications,
  mapApiSkills,
  mapCertificationsToApi,
  mapSkillsToApi,
  type ApiEmployeeCertification,
  type ApiEmployeeSkill,
} from "@/lib/employee-skills";
import type {
  EmployeeBankDetails,
  EmployeeCertification,
  EmployeeProfile,
  EmployeeProfileManager,
  EmployeeSalary,
  EmployeeSkill,
  PayrollType,
  ProfileApprovalStatus,
} from "@/types";

type ApiPayrollType = "MONTHLY" | "WEEKLY";

interface ApiEmployeeSalary {
  ctc?: number;
  basicSalary?: number;
  hra?: number;
  specialAllowance?: number;
  providentFund?: number;
  professionalTax?: number;
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

type ApiProfileApprovalStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";

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
  salary?: ApiEmployeeSalary;
  bank?: ApiEmployeeBank;
  bankStatus?: ApiProfileApprovalStatus;
  skills?: ApiEmployeeSkill[];
  skillsStatus?: ApiProfileApprovalStatus;
  primarySkill?: string | null;
  certifications?: string | ApiEmployeeCertification[] | null;
  createdAt?: string;
  updatedAt?: string;
}

interface GetEmployeeProfileResponse {
  success: boolean;
  message?: string;
  profile?: ApiEmployeeProfile;
}

interface UpdateEmployeeSkillsResponse {
  success: boolean;
  message?: string;
  profile?: ApiEmployeeProfile;
}

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

const payrollTypeFromApi: Record<ApiPayrollType, PayrollType> = {
  MONTHLY: "monthly",
  WEEKLY: "weekly",
};

function mapApiSalary(salary?: ApiEmployeeSalary): EmployeeSalary | undefined {
  if (!salary) return undefined;

  return {
    ctc: salary.ctc,
    basicSalary: salary.basicSalary,
    hra: salary.hra,
    specialAllowance: salary.specialAllowance,
    providentFund: salary.providentFund,
    professionalTax: salary.professionalTax,
    effectiveFrom: salary.effectiveFrom,
    payrollType: salary.payrollType
      ? payrollTypeFromApi[salary.payrollType]
      : undefined,
  };
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
    salary: mapApiSalary(api.salary),
    bank: mapApiBank(api.bank),
    bankStatus: mapApprovalStatus(api.bankStatus),
    skills: mapApiSkills(api.skills),
    skillsStatus: mapApprovalStatus(api.skillsStatus),
    primarySkill: api.primarySkill?.trim() || undefined,
    certifications: mapApiCertifications(api.certifications),
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

export interface UpdateEmployeeBankInput {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId?: string;
}

export async function updateEmployeeBank(
  input: UpdateEmployeeBankInput
): Promise<EmployeeProfile> {
  const { data } = await API.put<UpdateEmployeeSkillsResponse>(
    "/employee/profile/bank",
    {
      accountHolderName: input.accountHolderName.trim(),
      bankName: input.bankName.trim(),
      accountNumber: input.accountNumber.trim(),
      ifscCode: input.ifscCode.trim(),
      branch: input.branch.trim(),
      upiId: input.upiId?.trim() || undefined,
    }
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to submit bank details");
  }

  if (!data.profile) {
    throw new Error(data.message ?? "Bank details response was incomplete");
  }

  return mapApiProfile(data.profile);
}

export interface UpdateEmployeeSkillsInput {
  skills: EmployeeSkill[];
  primarySkill: string;
  certifications?: EmployeeCertification[];
}

export async function updateEmployeeSkills(
  input: UpdateEmployeeSkillsInput
): Promise<EmployeeProfile> {
  const { data } = await API.put<UpdateEmployeeSkillsResponse>(
    "/employee/profile/skills",
    {
      skills: mapSkillsToApi(input.skills),
      primarySkill: input.primarySkill.trim(),
      certifications: mapCertificationsToApi(input.certifications),
    }
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to submit skills");
  }

  if (!data.profile) {
    throw new Error(data.message ?? "Skills response was incomplete");
  }

  return mapApiProfile(data.profile);
}
