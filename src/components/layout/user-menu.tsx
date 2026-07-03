"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { canAccessRole, roleLabels } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth-store";
import type { User as UserType, UserRole } from "@/types";

interface UserMenuProps {
  user: UserType;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const portalOptions: { role: UserRole; label: string; href: string }[] = [
    { role: "admin", label: "Admin Portal", href: "/admin/dashboard" },
    { role: "manager", label: "Manager Portal", href: "/manager/dashboard" },
    { role: "employee", label: "Employee Portal", href: "/employee/dashboard" },
  ];

  const switchRoles = portalOptions.filter((entry) => canAccessRole(user, entry.role));

  const profileHref =
    user.role === "employee" ? "/employee/profile" : `/${user.role}/dashboard`;
  const settingsHref =
    user.role === "admin" ? "/admin/settings" : "/employee/profile";
  const showProfile = user.role !== "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 outline-none hover:bg-muted">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {roleLabels[user.role]}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user.name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showProfile && (
          <DropdownMenuItem asChild>
            <Link href={profileHref} className="cursor-pointer">
              <User className="mr-2 size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={settingsHref} className="cursor-pointer">
            <Settings className="mr-2 size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch Portal
        </DropdownMenuLabel>
        {switchRoles.map((r) => (
          <DropdownMenuItem key={r.role} asChild>
            <Link href={r.href} className="cursor-pointer">
              {r.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
