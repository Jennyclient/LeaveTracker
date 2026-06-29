"use client";

import { Menu } from "lucide-react";

import { BreadcrumbNav } from "@/components/layout/breadcrumb-nav";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/types";

interface HeaderProps {
  user: User;
  collapsed: boolean;
  onMobileMenuToggle: () => void;
}

export function Header({ user, onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMobileMenuToggle}
      >
        <Menu className="size-5" />
      </Button>

      <BreadcrumbNav className="hidden sm:flex" />

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:block">
          <Input placeholder="Search..." className="w-64" />
        </div>
        <ThemeToggle />
        <NotificationsPopover />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
