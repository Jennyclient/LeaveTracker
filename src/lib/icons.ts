import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Calendar,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Tags,
  User,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  Tags,
  FileText,
  ClipboardList,
  Wallet,
  CalendarDays,
  BarChart3,
  Settings,
  ClipboardCheck,
  Calendar,
  PlusCircle,
  User,
};

export function getNavIcon(name: string): LucideIcon {
  return iconMap[name] ?? LayoutDashboard;
}
