"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientSelector } from "./client-selector";
import { useSidebar } from "./sidebar";
import { Bell, LogOut, Menu, Coins } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/clients": "Clients",
  "/dashboard/citations": "Citation Engine",
  "/dashboard/monitor": "AI Monitor",
  "/dashboard/press": "PressForge",
  "/dashboard/entities": "Entity Sync",
  "/dashboard/reviews": "Reviews",
  "/dashboard/audits": "Audits",
  "/dashboard/reports": "Reports",
  "/dashboard/team": "Team",
  "/dashboard/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  // Check exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Check prefix matches — sort by longest path first for specificity
  const sortedPaths = Object.entries(pageTitles).sort(
    ([a], [b]) => b.length - a.length
  );
  for (const [path, title] of sortedPaths) {
    if (pathname.startsWith(path + "/")) return title;
  }

  return "Dashboard";
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { setMobileOpen } = useSidebar();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCredits() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("users")
        .select("agency_id")
        .eq("id", user.id)
        .single();

      if (!userData) return;

      const { data: agency } = await supabase
        .from("agencies")
        .select("credits_balance")
        .eq("id", userData.agency_id)
        .single();

      if (agency) setCredits(agency.credits_balance);
    }

    fetchCredits();

    // Refresh credits every 30 seconds
    const interval = setInterval(fetchCredits, 30000);
    return () => clearInterval(interval);
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">{getPageTitle(pathname)}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <ClientSelector />

        {credits !== null && (
          <div
            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium cursor-pointer hover:bg-accent"
            onClick={() => router.push("/dashboard/settings")}
            title="Credits remaining"
          >
            <Coins className="h-3.5 w-3.5 text-primary" />
            <span className={credits < 100 ? "text-amber-500" : "text-foreground"}>
              {credits.toLocaleString()}
            </span>
          </div>
        )}

        <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>

        <button
          onClick={handleSignOut}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
