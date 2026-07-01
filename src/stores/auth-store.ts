import { create } from "zustand";
import { persist } from "zustand/middleware";

import { loginUser, mapApiUserToUser } from "@/lib/auth";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,
      isLoading: false,
      hasHydrated: false,

      login: async (email, password, role) => {
        set({ isLoading: true });
        try {
          const response = await loginUser(email, password, role);

          if (!response.success) {
            throw new Error(response.message ?? "Login failed");
          }

          const user = mapApiUserToUser(response.user);

          set({
            user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoggedIn: true,
            isLoading: false,
          });

          return user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoggedIn: false,
        });
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "leave-tracker-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
