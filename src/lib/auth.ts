import axios from "axios";

import { encrypt } from "@/lib/encrypt";
import type { User, LoginPortal, UserRole } from "@/types";

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
  isManager?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

interface SignOutResponse {
  success: boolean;
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

export const LOGIN_PORTAL_OPTIONS: { value: LoginPortal; label: string }[] = [
  { value: "admin", label: "Admin Portal" },
  { value: "employee", label: "Employee Portal" },
];

export const portalToApi: Record<LoginPortal, ApiRole> = {
  admin: "ADMIN",
  employee: "EMPLOYEE",
};

export function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    employeeId: apiUser.employeeId,
    name: apiUser.name,
    email: apiUser.email,
    role: roleFromApi[apiUser.role],
    isManager: apiUser.isManager ?? false,
  };
}

export async function loginUser(
  email: string,
  password: string,
  portal: LoginPortal
): Promise<LoginResponse> {
  const payload: LoginPayload = {
    email: email.trim().toLowerCase(),
    password: encrypt(password.trim()),
    role: portalToApi[portal],
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

export async function signOutUser(accessToken: string): Promise<void> {
  try {
    const { data } = await axios.post<SignOutResponse>(
      `${baseUrl}/auth/signout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!data.success) {
      throw new Error(data.message ?? "Sign out failed");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Some backend builds don't expose a signout endpoint yet.
      if (error.response?.status === 404) {
        return;
      }
      const message =
        error.response?.data?.message || error.message || "Sign out failed";
      throw new Error(message);
    }
    throw error;
  }
}
