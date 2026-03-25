"use client";

import { Sidebar, SidebarProvider } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { WelcomeGuide } from "@/components/onboarding/welcome-guide";
import { HelpWidget } from "@/components/help/help-widget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      <WelcomeGuide />
      <HelpWidget />
    </SidebarProvider>
  );
}
