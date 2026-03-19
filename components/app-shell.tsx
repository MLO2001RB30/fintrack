"use client";

import { Sidebar, MobileNav } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden", position: "relative", zIndex: 1 }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          background: "transparent",
        }}
      >
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
