"use client";

import { AlertTriangle, Bell, CircleHelp, Search } from "lucide-react";
import { ACCOUNTS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Sidebar, MobileNav } from "./sidebar";

function TopUtilityBar() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 0,
        paddingBottom: 20,
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--text-secondary)",
        }}
      >
        <Search size={12} strokeWidth={1.5} aria-hidden color="var(--grey-500)" />
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--grey-600)" }}>Search...</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <IconButton label="Notifications">
          <Bell size={16} strokeWidth={1.5} />
        </IconButton>
        <IconButton label="Help">
          <CircleHelp size={16} strokeWidth={1.5} />
        </IconButton>
        <div
          aria-hidden
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            background: "linear-gradient(145deg, #7dabf8, #5469d4)",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ML
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const expiredAccounts = ACCOUNTS.filter((account) => account.status === "expired");

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-shell-main">
        <div className="app-shell-content">
          <TopUtilityBar />

          {expiredAccounts.length > 0 ? (
            <div
              className="animate-fade-up"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "14px 18px",
                marginTop: 20,
                marginBottom: 22,
                borderRadius: "var(--radius-card-sm)",
                border: "1px solid var(--red-soft)",
                background: "var(--red-soft)",
                color: "var(--red)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <AlertTriangle size={16} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                    Financial data needs attention
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                    {expiredAccounts.map((account) => account.institution).join(", ")} {expiredAccounts.length === 1 ? "has" : "have"} an expired connection, so totals may be incomplete until you reconnect.
                  </div>
                </div>
              </div>
              <Button
                href={`/accounts?focus=reconnect&account=${expiredAccounts[0]?.id}`}
                variant="ghost"
                size="md"
                style={{ flexShrink: 0, fontWeight: 600, color: "var(--red)" }}
              >
                Reconnect now
              </Button>
            </div>
          ) : null}

          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
