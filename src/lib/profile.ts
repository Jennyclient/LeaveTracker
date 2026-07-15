import API from "@/lib/api";
import { roleFromApi, type ApiRole } from "@/lib/auth";
import {
  mapApiCertifications,
  mapApiSkills,
  mapCertificationsToApiStrings,
  mapSkillsToApiStrings,
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
  upiId?: string | null;
  bankStatus?: ApiProfileApprovalStatus;
  status?: ApiProfileApprovalStatus;
  approvalStatus?: ApiProfileApprovalStatus;
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
  skills?: (string | ApiEmployeeSkill)[];
  skillsStatus?: ApiProfileApprovalStatus;
  primarySkill?: string | null;
  certifications?: string | string[] | ApiEmployeeCertification[] | null;
  resumeUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface GetEmployeeProfileResponse {
  success: boolean;
  message?: string;
  profile?: ApiEmployeeProfile;
}

interface ApiEmployeeSkillsRecord {
  employeeId?: string;
  skills?: (string | ApiEmployeeSkill)[];
  primarySkill?: string | null;
  certifications?: string | string[] | ApiEmployeeCertification[] | null;
  resumeUrl?: string | null;
  skillsStatus?: ApiProfileApprovalStatus;
  status?: ApiProfileApprovalStatus;
  approvalStatus?: ApiProfileApprovalStatus;
}

interface EmployeeSkillsApiPayload {
  skills?: (string | ApiEmployeeSkill)[] | ApiEmployeeSkillsRecord;
  skillsDetails?: ApiEmployeeSkillsRecord;
  primarySkill?: string | null;
  certifications?: string | string[] | ApiEmployeeCertification[] | null;
  resumeUrl?: string | null;
  skillsStatus?: ApiProfileApprovalStatus;
  status?: ApiProfileApprovalStatus;
  profile?: ApiEmployeeProfile;
}

interface UpdateEmployeeSkillsResponse extends EmployeeSkillsApiPayload {
  success: boolean;
  message?: string;
}

interface GetEmployeeSkillsResponse extends EmployeeSkillsApiPayload {
  success: boolean;
  message?: string;
}

export interface EmployeeSkillsState {
  skills?: EmployeeSkill[];
  skillsStatus: ProfileApprovalStatus;
  primarySkill?: string;
  certifications?: EmployeeCertification[];
  resumeUrl?: string;
}

interface UpdateEmployeeBankResponse {
  success: boolean;
  message?: string;
  profile?: ApiEmployeeProfile;
  bank?: ApiEmployeeBank;
  bankDetails?: ApiEmployeeBank;
  bankStatus?: ApiProfileApprovalStatus;
  status?: ApiProfileApprovalStatus;
}

interface GetEmployeeBankDetailsResponse {
  success: boolean;
  message?: string;
  profile?: ApiEmployeeProfile;
  bank?: ApiEmployeeBank;
  bankDetails?: ApiEmployeeBank;
  bankStatus?: ApiProfileApprovalStatus;
  status?: ApiProfileApprovalStatus;
}

export interface EmployeeBankDetailsState {
  bank?: EmployeeBankDetails;
  bankStatus: ProfileApprovalStatus;
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

  const details: EmployeeBankDetails = {
    accountHolderName: bank.accountHolderName,
    bankName: bank.bankName,
    accountNumber: bank.accountNumber,
    ifscCode: bank.ifscCode,
    branch: bank.branch,
    upiId: bank.upiId ?? undefined,
  };

  const hasData = Boolean(
    details.accountHolderName?.trim() ||
      details.bankName?.trim() ||
      details.accountNumber?.trim()
  );

  return hasData ? details : undefined;
}

function hasBankData(bank?: EmployeeBankDetails): boolean {
  return Boolean(
    bank?.accountHolderName?.trim() ||
      bank?.bankName?.trim() ||
      bank?.accountNumber?.trim()
  );
}

function inferBankStatus(
  bank?: EmployeeBankDetails,
  status?: ApiProfileApprovalStatus
): ProfileApprovalStatus {
  if (status) return mapApprovalStatus(status);
  return hasBankData(bank) ? "pending" : "not_submitted";
}

function hasSkillsData(skillsState: EmployeeSkillsState): boolean {
  return Boolean(
    skillsState.skills?.length ||
      skillsState.primarySkill?.trim() ||
      skillsState.certifications?.length ||
      skillsState.resumeUrl?.trim()
  );
}

function inferSkillsStatus(
  skillsState: EmployeeSkillsState,
  status?: ApiProfileApprovalStatus
): ProfileApprovalStatus {
  if (status) return mapApprovalStatus(status);
  return hasSkillsData(skillsState) ? "pending" : "not_submitted";
}

const payrollTypeFromApi: Record<ApiPayrollType, PayrollType> = {
  MONTHLY: "monthly",
  WEEKLY: "weekly",
};

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

interface GetEmployeeSalaryResponse {
  success: boolean;
  message?: string;
  salary?: ApiEmployeeSalary;
}

export async function getEmployeeSalary(): Promise<EmployeeSalary | undefined> {
  try {
    const { data } = await API.get<GetEmployeeSalaryResponse>("/employee/salary");

    if (!data.success) {
      if (isProfileDetailsNotFoundMessage(data.message)) {
        return undefined;
      }
      throw new Error(data.message ?? "Failed to fetch salary details");
    }

    return mapApiSalary(data.salary);
  } catch (error) {
    if (isProfileDetailsNotFoundError(error)) {
      return undefined;
    }
    throw error;
  }
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
    resumeUrl: api.resumeUrl?.trim() || undefined,
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

export interface EmployeeProfileStatus {
  employeeId: string;
  bankDetailsFilled: boolean;
  skillsFilled: boolean;
  isComplete: boolean;
}

interface EmployeeProfileStatusResponse {
  success: boolean;
  message?: string;
  employeeId?: string;
  bankDetailsFilled?: boolean;
  skillsFilled?: boolean;
}

export const EMPLOYEE_PROFILE_STATUS_EVENT = "employee-profile-status-changed";

export function notifyEmployeeProfileStatusChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EMPLOYEE_PROFILE_STATUS_EVENT));
}

export async function getEmployeeProfileStatus(): Promise<EmployeeProfileStatus> {
  const { data } = await API.get<EmployeeProfileStatusResponse>(
    "/employee/profile-status"
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch profile status");
  }

  const bankDetailsFilled = Boolean(data.bankDetailsFilled);
  const skillsFilled = Boolean(data.skillsFilled);

  return {
    employeeId: data.employeeId ?? "",
    bankDetailsFilled,
    skillsFilled,
    isComplete: bankDetailsFilled && skillsFilled,
  };
}

export interface UpdateEmployeeBankInput {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId?: string;
}

function buildBankDetailsPayload(input: UpdateEmployeeBankInput) {
  return {
    accountHolderName: input.accountHolderName.trim(),
    bankName: input.bankName.trim(),
    accountNumber: input.accountNumber.trim(),
    ifscCode: input.ifscCode.trim().toUpperCase(),
    branch: input.branch.trim(),
    upiId: input.upiId?.trim() || undefined,
  };
}

export async function createEmployeeBank(
  input: UpdateEmployeeBankInput
): Promise<EmployeeProfile> {
  const { data } = await API.post<UpdateEmployeeBankResponse>(
    "/employee/bank-details",
    buildBankDetailsPayload(input)
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to submit bank details");
  }

  return refreshProfileAfterVerificationMutation();
}

export async function updateEmployeeBank(
  input: UpdateEmployeeBankInput
): Promise<EmployeeProfile> {
  const { data } = await API.put<UpdateEmployeeBankResponse>(
    "/employee/bank-details",
    buildBankDetailsPayload(input)
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to update bank details");
  }

  return refreshProfileAfterVerificationMutation();
}

async function refreshProfileAfterVerificationMutation(): Promise<EmployeeProfile> {
  const profile = await getEmployeeProfile();
  return loadEmployeeProfileVerificationDetails(profile);
}

function extractApiBank(
  data: Pick<
    GetEmployeeBankDetailsResponse,
    "bank" | "bankDetails" | "profile"
  >
): ApiEmployeeBank | undefined {
  return data.bank ?? data.bankDetails ?? data.profile?.bank;
}

function extractApiBankStatus(
  data: Pick<
    GetEmployeeBankDetailsResponse,
    "bankStatus" | "status" | "profile" | "bank" | "bankDetails"
  >
): ApiProfileApprovalStatus | undefined {
  const bank = extractApiBank(data);

  return (
    data.bankStatus ??
    data.status ??
    data.profile?.bankStatus ??
    bank?.bankStatus ??
    bank?.status ??
    bank?.approvalStatus
  );
}

function mapBankDetailsState(
  data: GetEmployeeBankDetailsResponse
): EmployeeBankDetailsState {
  const bank = mapApiBank(extractApiBank(data));

  return {
    bank,
    bankStatus: inferBankStatus(bank, extractApiBankStatus(data)),
  };
}

function isProfileDetailsNotFoundMessage(message?: string): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes("bank details not found") ||
    normalized.includes("skills not found") ||
    normalized.includes("salary not found")
  );
}

function isProfileDetailsNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error && isProfileDetailsNotFoundMessage(error.message)
  );
}

export function mergeBankDetailsIntoProfile(
  profile: EmployeeProfile,
  bankDetails: EmployeeBankDetailsState
): EmployeeProfile {
  return {
    ...profile,
    bank: bankDetails.bank,
    bankStatus: bankDetails.bankStatus,
  };
}

export async function getEmployeeBankDetails(): Promise<EmployeeBankDetailsState> {
  try {
    const { data } = await API.get<GetEmployeeBankDetailsResponse>(
      "/employee/bank-details"
    );

    if (!data.success) {
      if (isProfileDetailsNotFoundMessage(data.message)) {
        return { bankStatus: "not_submitted" };
      }
      throw new Error(data.message ?? "Failed to fetch bank details");
    }

    return mapBankDetailsState(data);
  } catch (error) {
    if (isProfileDetailsNotFoundError(error)) {
      return { bankStatus: "not_submitted" };
    }
    throw error;
  }
}

export async function getEmployeeProfileWithBankDetails(): Promise<EmployeeProfile> {
  const [profile, bankDetails, skillsDetails] = await Promise.all([
    getEmployeeProfile(),
    getEmployeeBankDetails().catch(() => ({
      bank: undefined,
      bankStatus: "not_submitted" as ProfileApprovalStatus,
    })),
    getEmployeeSkills().catch(() => ({
      skills: undefined,
      skillsStatus: "not_submitted" as ProfileApprovalStatus,
      primarySkill: undefined,
      certifications: undefined,
      resumeUrl: undefined,
    })),
  ]);

  return mergeSkillsIntoProfile(
    mergeBankDetailsIntoProfile(profile, bankDetails),
    skillsDetails
  );
}

export async function loadEmployeeProfileVerificationDetails(
  profile: EmployeeProfile
): Promise<EmployeeProfile> {
  const [bankResult, skillsResult] = await Promise.allSettled([
    getEmployeeBankDetails(),
    getEmployeeSkills(),
  ]);

  let next = profile;

  if (bankResult.status === "fulfilled") {
    next = mergeBankDetailsIntoProfile(next, bankResult.value);
  }

  if (skillsResult.status === "fulfilled") {
    next = mergeSkillsIntoProfile(next, skillsResult.value);
  }

  if (bankResult.status === "rejected" && skillsResult.status === "rejected") {
    throw bankResult.reason;
  }

  return next;
}

function extractSkillsRecord(
  data: EmployeeSkillsApiPayload
): ApiEmployeeSkillsRecord | undefined {
  if (data.skillsDetails) {
    return data.skillsDetails;
  }

  if (data.skills && !Array.isArray(data.skills)) {
    return data.skills;
  }

  if (data.profile) {
    return {
      skills: data.profile.skills,
      primarySkill: data.profile.primarySkill,
      certifications: data.profile.certifications,
      resumeUrl: data.profile.resumeUrl,
      skillsStatus: data.profile.skillsStatus,
    };
  }

  if (
    Array.isArray(data.skills) ||
    data.primarySkill ||
    data.certifications ||
    data.resumeUrl
  ) {
    return {
      skills: Array.isArray(data.skills) ? data.skills : undefined,
      primarySkill: data.primarySkill,
      certifications: data.certifications,
      resumeUrl: data.resumeUrl,
      skillsStatus: data.skillsStatus,
      status: data.status,
    };
  }

  return undefined;
}

function extractApiSkills(
  data: EmployeeSkillsApiPayload
): (string | ApiEmployeeSkill)[] | undefined {
  const record = extractSkillsRecord(data);
  return record?.skills ?? (Array.isArray(data.skills) ? data.skills : undefined);
}

function extractApiCertifications(
  data: EmployeeSkillsApiPayload
): string | string[] | ApiEmployeeCertification[] | null | undefined {
  const record = extractSkillsRecord(data);

  return (
    record?.certifications ??
    data.certifications ??
    data.profile?.certifications
  );
}

function extractApiSkillsStatus(
  data: EmployeeSkillsApiPayload
): ApiProfileApprovalStatus | undefined {
  const record = extractSkillsRecord(data);

  return (
    data.skillsStatus ??
    data.status ??
    data.profile?.skillsStatus ??
    record?.skillsStatus ??
    record?.status ??
    record?.approvalStatus
  );
}

function extractApiResumeUrl(
  data: EmployeeSkillsApiPayload
): string | null | undefined {
  const record = extractSkillsRecord(data);

  return record?.resumeUrl ?? data.resumeUrl ?? data.profile?.resumeUrl;
}

function extractApiPrimarySkill(
  data: EmployeeSkillsApiPayload
): string | undefined {
  const record = extractSkillsRecord(data);

  return (
    record?.primarySkill?.trim() ||
    data.primarySkill?.trim() ||
    data.profile?.primarySkill?.trim() ||
    undefined
  );
}

function mapSkillsState(data: EmployeeSkillsApiPayload): EmployeeSkillsState {
  const skillsState: EmployeeSkillsState = {
    skills: mapApiSkills(extractApiSkills(data)),
    skillsStatus: "not_submitted",
    primarySkill: extractApiPrimarySkill(data),
    certifications: mapApiCertifications(extractApiCertifications(data)),
    resumeUrl: extractApiResumeUrl(data)?.trim() || undefined,
  };

  return {
    ...skillsState,
    skillsStatus: inferSkillsStatus(
      skillsState,
      extractApiSkillsStatus(data)
    ),
  };
}

export async function getEmployeeSkills(): Promise<EmployeeSkillsState> {
  try {
    const { data } = await API.get<GetEmployeeSkillsResponse>("/employee/skills");

    if (!data.success) {
      if (isProfileDetailsNotFoundMessage(data.message)) {
        return { skillsStatus: "not_submitted" };
      }
      throw new Error(data.message ?? "Failed to fetch skills");
    }

    return mapSkillsState(data);
  } catch (error) {
    if (isProfileDetailsNotFoundError(error)) {
      return { skillsStatus: "not_submitted" };
    }
    throw error;
  }
}

export function mergeSkillsIntoProfile(
  profile: EmployeeProfile,
  skillsDetails: EmployeeSkillsState
): EmployeeProfile {
  return {
    ...profile,
    skills: skillsDetails.skills,
    skillsStatus: skillsDetails.skillsStatus,
    primarySkill: skillsDetails.primarySkill,
    certifications: skillsDetails.certifications,
    resumeUrl: skillsDetails.resumeUrl,
  };
}

export interface UpdateEmployeeSkillsInput {
  skills: EmployeeSkill[];
  primarySkill: string;
  certifications?: EmployeeCertification[];
  resumeUrl?: string;
}

function buildSkillsPayload(input: UpdateEmployeeSkillsInput) {
  return {
    skills: mapSkillsToApiStrings(input.skills),
    primarySkill: input.primarySkill.trim(),
    certifications: mapCertificationsToApiStrings(input.certifications),
    resumeUrl: input.resumeUrl?.trim() || undefined,
  };
}

export async function createEmployeeSkills(
  input: UpdateEmployeeSkillsInput
): Promise<EmployeeProfile> {
  const { data } = await API.post<UpdateEmployeeSkillsResponse>(
    "/employee/skills",
    buildSkillsPayload(input)
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to submit skills");
  }

  return refreshProfileAfterVerificationMutation();
}

export async function updateEmployeeSkills(
  input: UpdateEmployeeSkillsInput
): Promise<EmployeeProfile> {
  const { data } = await API.put<UpdateEmployeeSkillsResponse>(
    "/employee/skills",
    buildSkillsPayload(input)
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to update skills");
  }

  return refreshProfileAfterVerificationMutation();
}
