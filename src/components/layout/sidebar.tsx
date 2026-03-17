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
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  MessageSquare,
  FileText,
  Users2,
  Activity,
  Lightbulb,
  Bell,
  Globe,
  History,
  MessageCircle,
  Trophy,
  Mail,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, createContext, useContext } from "react";

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
      { name: "Prompts", href: "/dashboard/monitor/prompts", icon: MessageSquare },
      { name: "Results", href: "/dashboard/monitor/results", icon: FileText },
      { name: "Competitors", href: "/dashboard/monitor/competitors", icon: Users2 },
      { name: "Timeline", href: "/dashboard/monitor/timeline", icon: Activity },
      { name: "Content Gaps", href: "/dashboard/monitor/gaps", icon: Lightbulb },
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
      { name: "Spokespersons", href: "/dashboard/press/spokespersons", icon: Users2 },
      { name: "Journalists", href: "/dashboard/press/journalists", icon: Users },
      { name: "Coverage", href: "/dashboard/press/coverage", icon: Trophy },
      { name: "Calendar", href: "/dashboard/press/calendar", icon: History },
    ],
  },
  {
    name: "Entity Sync",
    href: "/dashboard/entities",
    icon: Network,
    children: [
      { name: "Overview", href: "/dashboard/entities", icon: Network },
      { name: "Canonical", href: "/dashboard/entities/canonical", icon: FileText },
      { name: "Profiles", href: "/dashboard/entities/profiles", icon: Globe },
      { name: "Tasks", href: "/dashboard/entities/tasks", icon: ClipboardCheck },
      { name: "Schema", href: "/dashboard/entities/schema", icon: Settings },
      { name: "Scans", href: "/dashboard/entities/scans", icon: History },
    ],
  },
  {
    name: "Reviews",
    href: "/dashboard/reviews",
    icon: Star,
    children: [
      { name: "Overview", href: "/dashboard/reviews", icon: Star },
      { name: "Feed", href: "/dashboard/reviews/feed", icon: MessageCircle },
      { name: "Competitors", href: "/dashboard/reviews/competitors", icon: Users2 },
      { name: "Campaigns", href: "/dashboard/reviews/campaigns", icon: Mail },
      { name: "Highlights", href: "/dashboard/reviews/highlights", icon: Trophy },
      { name: "Templates", href: "/dashboard/reviews/templates", icon: Sparkles },
    ],
  },
  { name: "Audits", href: "/dashboard/audits", icon: ClipboardCheck },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    comingSoon: true,
  },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useSidebar();

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
            <span className="text-primary">Growth</span>
            <span className="text-foreground">Forge</span>
          </Link>
        )}
        {collapsed && (
          <Link
            href="/dashboard"
            className="text-lg font-bold text-primary"
          >
            G
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
      </nav>

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
