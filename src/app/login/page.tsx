"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, Leaf, Loader2, UserCircle } from "lucide-react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types";

const roleRoutes: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  manager: "/manager/dashboard",
  employee: "/employee/dashboard",
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isLoggedIn, user, hasHydrated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const getPasswordValue = () =>
    passwordInputRef.current?.value ?? password;

  const togglePasswordVisibility = () => {
    const input = passwordInputRef.current;
    if (input) {
      setPassword(input.value);
    }
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    if (hasHydrated && isLoggedIn && user) {
      router.replace(roleRoutes[user.role]);
    }
  }, [hasHydrated, isLoggedIn, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      toast.error("Please select a portal");
      return;
    }

    const passwordValue = getPasswordValue();

    if (!email.trim() || !passwordValue.trim()) {
      toast.error("Please enter your email and password");
      return;
    }

    try {
      const loggedInUser = await login(email, passwordValue, role);
      toast.success("Signed in successfully");
      router.push(roleRoutes[loggedInUser.role]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-white/20">
            <Leaf className="size-5" />
          </div>
          <span className="text-xl font-semibold">LeaveFlow</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Enterprise Leave Management Made Simple
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Streamline leave requests, approvals, and tracking for your entire organization.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">
          Trusted by 500+ companies worldwide
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground lg:hidden">
              <Leaf className="size-6" />
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your LeaveFlow account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="role">Portal</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger id="role" disabled={isLoading}>
                    <SelectValue placeholder="Select portal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <span className="flex items-center gap-2">
                        <Building2 className="size-4" /> Admin Portal
                      </span>
                    </SelectItem>
                    <SelectItem value="manager">
                      <span className="flex items-center gap-2">
                        <UserCircle className="size-4" /> Manager Portal
                      </span>
                    </SelectItem>
                    <SelectItem value="employee">
                      <span className="flex items-center gap-2">
                        <UserCircle className="size-4" /> Employee Portal
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    ref={passwordInputRef}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onInput={(e) => setPassword(e.currentTarget.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                    onClick={togglePasswordVisibility}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="flex size-4 items-center justify-center">
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
