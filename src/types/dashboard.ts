import type { LucideIcon } from "lucide-react";

export type QuickAction = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  /** Soft circle behind icon, e.g. "bg-blue-600/[0.08] text-blue-600" */
  iconClass: string;
};

export type RecentProject = {
  id: string;
  title: string;
  type: string;
  progress: number;
  updatedAt: string;
  href: string;
};

export type AISuggestion = {
  id: string;
  title: string;
  description: string;
  tag: string;
  href: string;
};

export type RecentResource = {
  id: string;
  title: string;
  type: string;
  format: string;
  updatedAt: string;
  href: string;
};

export type DashboardStat = {
  id: string;
  label: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
};

export type PlatformNavItem = {
  id: string;
  title: string;
  to: string;
  icon: LucideIcon;
};
