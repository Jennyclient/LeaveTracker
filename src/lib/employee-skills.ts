import type { EmployeeCertification, EmployeeSkill } from "@/types";

export interface ApiEmployeeSkill {
  name: string;
  years?: number;
  proficiency?: number;
}

export interface ApiEmployeeCertification {
  name: string;
  issuedBy?: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export function normalizeProficiency(skill: ApiEmployeeSkill): number {
  if (skill.proficiency !== undefined) {
    return Math.min(5, Math.max(1, Math.round(skill.proficiency)));
  }

  if (skill.years !== undefined && skill.years > 0) {
    return Math.min(5, Math.max(1, Math.round(skill.years)));
  }

  return 3;
}

export function mapApiSkills(
  skills?: (string | ApiEmployeeSkill)[]
): EmployeeSkill[] | undefined {
  if (!skills?.length) return undefined;

  return skills.map((skill) => {
    if (typeof skill === "string") {
      const name = skill.trim();
      return { name, proficiency: 3 };
    }

    return {
      name: skill.name,
      proficiency: normalizeProficiency(skill),
    };
  });
}

export function mapSkillsToApi(skills: EmployeeSkill[]) {
  return skills.map((skill) => ({
    name: skill.name,
    proficiency: skill.proficiency,
    years: skill.proficiency,
  }));
}

export function mapSkillsToApiStrings(skills: EmployeeSkill[]): string[] {
  return skills.map((skill) => skill.name.trim()).filter(Boolean);
}

export function mapApiCertifications(
  certifications?: string | string[] | ApiEmployeeCertification[] | null
): EmployeeCertification[] | undefined {
  if (!certifications) return undefined;

  if (Array.isArray(certifications)) {
    if (!certifications.length) return undefined;

    if (typeof certifications[0] === "string") {
      const mapped = certifications
        .map((name) => (typeof name === "string" ? name.trim() : ""))
        .filter(Boolean)
        .map((name) => ({ name, issuedBy: "", issueDate: "" }));

      return mapped.length ? mapped : undefined;
    }

    const mapped = (certifications as ApiEmployeeCertification[])
      .map((cert) => ({
        name: cert.name?.trim() ?? "",
        issuedBy: cert.issuedBy?.trim() ?? "",
        issueDate: cert.issueDate?.slice(0, 10) ?? "",
        credentialId: cert.credentialId?.trim() || undefined,
        credentialUrl: cert.credentialUrl?.trim() || undefined,
      }))
      .filter((cert) => cert.name);

    return mapped.length ? mapped : undefined;
  }

  const legacy = certifications.trim();
  if (!legacy) return undefined;

  return [{ name: legacy, issuedBy: "", issueDate: "" }];
}

export function mapCertificationsToApi(
  certifications?: EmployeeCertification[]
) {
  if (!certifications?.length) return undefined;

  const mapped = certifications
    .filter((cert) => cert.name.trim())
    .map((cert) => ({
      name: cert.name.trim(),
      issuedBy: cert.issuedBy.trim(),
      issueDate: cert.issueDate,
      credentialId: cert.credentialId?.trim() || undefined,
      credentialUrl: cert.credentialUrl?.trim() || undefined,
    }));

  return mapped.length ? mapped : undefined;
}

export function mapCertificationsToApiStrings(
  certifications?: EmployeeCertification[]
): string[] | undefined {
  if (!certifications?.length) return undefined;

  const mapped = certifications
    .map((cert) => cert.name.trim())
    .filter(Boolean);

  return mapped.length ? mapped : undefined;
}

export function emptyCertification(): EmployeeCertification {
  return {
    name: "",
    issuedBy: "",
    issueDate: "",
  };
}
