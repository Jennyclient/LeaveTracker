import axios from "axios";

import { encrypt } from "@/lib/encrypt";
import type { User, UserRole } from "@/types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export type ApiRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface LoginPayload {
  email: string;
  password: string;
  role: ApiRole;
}

export interface ApiUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  joiningDate: string;
  role: ApiRole;
}

export interface LoginResponse {
  success: boolean;
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export const roleToApi: Record<UserRole, ApiRole> = {
  admin: "ADMIN",
  manager: "MANAGER",
  employee: "EMPLOYEE",
};

export const roleFromApi: Record<ApiRole, UserRole> = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
};

export function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    employeeId: apiUser.employeeId,
    name: apiUser.name,
    email: apiUser.email,
    role: roleFromApi[apiUser.role],
  };
}

export async function loginUser(
  email: string,
  password: string,
  role: UserRole
): Promise<LoginResponse> {
  const payload: LoginPayload = {
    email: email.trim().toLowerCase(),
    password: encrypt(password.trim()),
    role: roleToApi[role],
  };

  try {
    const { data } = await axios.post<LoginResponse>(
      `${baseUrl}/auth/login`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || error.message || "Login failed";
      throw new Error(message);
    }
    throw error;
  }
}
