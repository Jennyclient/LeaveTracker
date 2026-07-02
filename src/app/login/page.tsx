"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CalendarCheck2,
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOGIN_PORTAL_OPTIONS } from "@/lib/auth";
import { getDefaultDashboardPath } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth-store";
import type { LoginPortal } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isLoggedIn, user, hasHydrated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [portal, setPortal] = useState<LoginPortal | "">("");
  const [rememberMe, setRememberMe] = useState(true);
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
      router.replace(getDefaultDashboardPath(user));
    }
  }, [hasHydrated, isLoggedIn, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!portal) {
      toast.error("Please select a portal");
      return;
    }

    const passwordValue = getPasswordValue();

    if (!email.trim() || !passwordValue.trim()) {
      toast.error("Please enter your email and password");
      return;
    }

    try {
      const loggedInUser = await login(email, passwordValue, portal);
      toast.success("Signed in successfully");
      router.push(getDefaultDashboardPath(loggedInUser));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 left-4 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
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
          <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground/80">
              Why teams choose LeaveFlow
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CalendarCheck2 className="size-4 shrink-0" />
                Smart leave calendars and conflict visibility
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="size-4 shrink-0" />
                Faster approvals with clear ownership
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0" />
                Policy-based controls and secure workflows
              </li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-primary-foreground/60">
          Trusted by 500+ companies worldwide
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md border-border/60 shadow-xl">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="portal">Portal</Label>
                </div>
                <Select value={portal} onValueChange={(v) => setPortal(v as LoginPortal)}>
                  <SelectTrigger id="portal" disabled={isLoading}>
                    <SelectValue placeholder="Select portal" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOGIN_PORTAL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          {option.value === "admin" ? (
                            <Building2 className="size-4" />
                          ) : (
                            <UserCircle className="size-4" />
                          )}{" "}
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="remember-me"
                    className="cursor-pointer text-sm font-normal text-muted-foreground"
                  >
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/login"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
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
