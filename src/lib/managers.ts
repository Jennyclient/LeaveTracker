import API from "@/lib/api";
import type { Manager, ManagerTeamMember } from "@/types";

interface ApiTeamMember {
  id: string;
  name: string;
  designation?: string | null;
  status: "ACTIVE" | "INACTIVE";
}

interface ApiManager {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  contactNo?: string;
  joiningDate: string;
  designation?: string | null;
  status: "ACTIVE" | "INACTIVE";
  teamCount: number;
  teamMembers: ApiTeamMember[];
}

interface GetManagersResponse {
  success: boolean;
  count?: number;
  managers: ApiManager[];
  message?: string;
}

function mapTeamMember(member: ApiTeamMember): ManagerTeamMember {
  return {
    id: member.id,
    name: member.name,
    designation: member.designation?.trim() || "—",
    status: member.status === "INACTIVE" ? "inactive" : "active",
  };
}

function mapApiManagerToManager(api: ApiManager): Manager {
  return {
    id: api.id,
    employeeId: api.employeeId,
    name: api.name,
    email: api.email,
    contactNo: api.contactNo,
    designation: api.designation?.trim() || "—",
    teamSize: api.teamCount,
    status: api.status === "INACTIVE" ? "inactive" : "active",
    joinDate: api.joiningDate,
    teamMembers: (api.teamMembers ?? []).map(mapTeamMember),
  };
}

export async function getAllManagers(): Promise<Manager[]> {
  const { data } = await API.get<GetManagersResponse>("/admin/managers");

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch managers");
  }

  return data.managers.map(mapApiManagerToManager);
}
