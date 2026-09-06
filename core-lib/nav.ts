import {
  LayoutDashboard,
  Sparkles,
  NotebookPen,
  Layers,
  HelpCircle,
  CalendarClock,
  TrendingUp,
  Wrench,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ai-study", label: "AI Study", icon: Sparkles },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/quiz", label: "Quiz", icon: HelpCircle },
  { href: "/planner", label: "Planner", icon: CalendarClock },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
];

// Primary items shown directly in the mobile bottom bar.
export const MOBILE_PRIMARY = ["/dashboard", "/ai-study", "/tools", "/planner"];
