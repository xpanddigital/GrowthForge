"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  MessageSquareQuote,
  Radar,
  Newspaper,
  Network,
  Star,
  ClipboardCheck,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  FileText,
  Activity,
  Lightbulb,
  Bell,
  MessageCircle,
  Trophy,
  Mail,
  GraduationCap,
  ShieldCheck,
  DollarSign,
  Clock,
} from "lucide-react";
import { useState, useEffect, createContext, useContext } from "react";
import { createClient } from "@/lib/supabase/client";
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist";

// Sidebar context for mobile toggle from header
const SidebarContext = createContext<{
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}>({
  mobileOpen: false,
  setMobileOpen: () => {},
  collapsed: false,
  setCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ mobileOpen, setMobileOpen, collapsed, setCollapsed }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  comingSoon?: boolean;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/dashboard/clients", icon: Building2 },
  {
    name: "Citation Engine",
    href: "/dashboard/citations",
    icon: MessageSquareQuote,
  },
  {
    name: "AI Monitor",
    href: "/dashboard/monitor",
    icon: Radar,
    children: [
      { name: "Overview", href: "/dashboard/monitor", icon: Radar },
      { name: "Keywords", href: "/dashboard/monitor/keywords", icon: Search },
      { name: "Alerts", href: "/dashboard/monitor/alerts", icon: Bell },
    ],
  },
  {
    name: "PressForge",
    href: "/dashboard/press",
    icon: Newspaper,
    children: [
      { name: "Campaigns", href: "/dashboard/press", icon: Newspaper },
      { name: "Ideas", href: "/dashboard/press/ideas", icon: Lightbulb },
      { name: "Coverage", href: "/dashboard/press/coverage", icon: Trophy },
    ],
  },
  {
    name: "Entity Sync",
    href: "/dashboard/entities",
    icon: Network,
    children: [
      { name: "Overview", href: "/dashboard/entities", icon: Network },
      { name: "Canonical", href: "/dashboard/entities/canonical", icon: FileText },
    ],
  },
  {
    name: "Reviews",
    href: "/dashboard/reviews",
    icon: Star,
    children: [
      { name: "Overview", href: "/dashboard/reviews", icon: Star },
      { name: "All Reviews", href: "/dashboard/reviews/feed", icon: MessageCircle },
      { name: "Campaigns", href: "/dashboard/reviews/campaigns", icon: Mail },
    ],
  },
  {
    name: "YouTube Strategy",
    href: "/dashboard/youtube",
    icon: Activity,
    children: [
      { name: "Overview", href: "/dashboard/youtube", icon: Activity },
      { name: "Briefs", href: "/dashboard/youtube/briefs", icon: FileText },
    ],
  },
  { name: "Audits", href: "/dashboard/audits", icon: ClipboardCheck },
  { name: "Academy", href: "/dashboard/academy", icon: GraduationCap },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminNavigation: NavItem[] = [
  { name: "Overview", href: "/dashboard/admin", icon: ShieldCheck },
  { name: "Revenue", href: "/dashboard/admin/revenue", icon: DollarSign },
  { name: "Subscribers", href: "/dashboard/admin/subscribers", icon: Users },
  { name: "Trials", href: "/dashboard/admin/trials", icon: Clock },
  { name: "Usage", href: "/dashboard/admin/usage", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useSidebar();
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  // Check if user is platform_admin
  useEffect(() => {
    async function checkRole() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        if (data?.role === "platform_admin") {
          setIsPlatformAdmin(true);
        }
      } catch {
        // Silently fail — don't show admin nav
      }
    }
    checkRole();
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  // Close mobile sidebar on escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    if (mobileOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [mobileOpen, setMobileOpen]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link
            href="/dashboard"
            className="text-lg font-bold tracking-tight"
          >
            <span className="text-primary">Mention</span>
            <span className="text-foreground">Layer</span>
          </Link>
        )}
        {collapsed && (
          <Link
            href="/dashboard"
            className="text-lg font-bold text-primary"
          >
            M
          </Link>
        )}
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = hasChildren && isActive;

          return (
            <div key={item.name}>
              <Link
                href={item.comingSoon ? "#" : item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  item.comingSoon && "cursor-default opacity-50"
                )}
                onClick={(e) => {
                  if (item.comingSoon) e.preventDefault();
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.name}</span>
                    {item.comingSoon && (
                      <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Soon
                      </span>
                    )}
                  </>
                )}
              </Link>
              {/* Sub-navigation for expanded items */}
              {isExpanded && !collapsed && item.children && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
                  {item.children.map((child) => {
                    const childActive = pathname === child.href;
                    const ChildIcon = child.icon;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                          childActive
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Platform Admin section */}
        {isPlatformAdmin && (
          <>
            <div className="mx-3 my-3 border-t border-border" />
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Platform Admin
              </div>
            )}
            {adminNavigation.map((item) => {
              const isActive =
                item.href === "/dashboard/admin"
                  ? pathname === "/dashboard/admin"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Onboarding checklist */}
      {!collapsed && <OnboardingChecklist />}

      {/* Collapse toggle — desktop only */}
      <div className="hidden border-t border-border p-2 md:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-screen flex-col border-r border-border bg-card transition-all duration-200 md:flex",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
