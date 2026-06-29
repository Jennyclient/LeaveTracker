"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, Eye, EyeOff, Leaf, UserCircle } from "lucide-react";

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
import type { UserRole } from "@/types";

const roleRoutes: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  manager: "/manager/dashboard",
  employee: "/employee/dashboard",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("sarah.johnson@clashdx.com");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState<UserRole>("employee");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(roleRoutes[role]);
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
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Portal</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
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
                  placeholder="you@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Demo mode — select a portal and click Sign in
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
