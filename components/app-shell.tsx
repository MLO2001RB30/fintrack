"use client";

import { Sidebar, MobileNav } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-shell-main">{children}</main>
      <MobileNav />
    </div>
  );
}
