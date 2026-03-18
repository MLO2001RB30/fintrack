"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  RefreshCw,
  LineChart,
  ArrowLeftRight,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import { ACCOUNTS } from "@/lib/mock-data";

const NAV_ITEMS = [
  { href: "/",              icon: LayoutDashboard, label: "Dashboard" },
  { href: "/accounts",      icon: Building2,       label: "Accounts" },
  { href: "/subscriptions", icon: RefreshCw,       label: "Subscriptions" },
  { href: "/transactions",  icon: ArrowLeftRight,  label: "Transactions" },
  { href: "/investments",   icon: LineChart,       label: "Investments" },
];

const BOTTOM_ITEMS = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

// FinTrack "FT" monogram mark
function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.27),
        background: "var(--accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 1px 4px rgba(13,147,115,0.35)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: Math.round(size * 0.43),
          color: "#fff",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        FT
      </span>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const hasExpiredAccounts = useMemo(() => ACCOUNTS.some(a => a.status === "expired"), []);

  return (
    <aside
      style={{
        width: collapsed ? 56 : 232,
        transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        background: "#FFFFFF",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "16px 13px" : "16px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          overflow: "hidden",
          minHeight: 60,
        }}
      >
        <BrandMark size={30} />
        {!collapsed && (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 17,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              letterSpacing: "-0.03em",
            }}
          >
            FinTrack
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav
        style={{
          flex: 1,
          padding: "10px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          const showAlert = href === "/accounts" && hasExpiredAccounts;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: collapsed ? "8px 10px" : "7px 10px",
                borderRadius: 7,
                justifyContent: collapsed ? "center" : "flex-start",
                textDecoration: "none",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                background: active ? "var(--accent-glow)" : "transparent",
                transition: "background 100ms, color 100ms",
                position: "relative",
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--hover-bg)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                }
              }}
            >
              <span style={{ position: "relative", flexShrink: 0, display: "flex" }}>
                <Icon
                  size={16}
                  strokeWidth={active ? 2.2 : 1.8}
                  style={{ display: "block" }}
                />
                {showAlert && (
                  <span
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -3,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--red)",
                      border: "1.5px solid #fff",
                    }}
                  />
                )}
              </span>

              {!collapsed && (
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 450,
                    whiteSpace: "nowrap",
                    flex: 1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {label}
                </span>
              )}

              {!collapsed && showAlert && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#fff",
                    background: "var(--red)",
                    borderRadius: 4,
                    padding: "1px 5px",
                    lineHeight: 1.5,
                  }}
                >
                  1
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div
        style={{
          padding: "8px 8px 0",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {BOTTOM_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: collapsed ? "8px 10px" : "7px 10px",
                borderRadius: 7,
                justifyContent: collapsed ? "center" : "flex-start",
                textDecoration: "none",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                background: active ? "var(--accent-glow)" : "transparent",
                transition: "background 100ms, color 100ms",
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--hover-bg)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 450, letterSpacing: "-0.01em" }}>
                  {label}
                </span>
              )}
            </Link>
          );
        })}

        {/* User */}
        {!collapsed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 10px",
              borderRadius: 7,
              margin: "4px 0 0",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), #0B7D62)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10.5,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
                letterSpacing: "0.02em",
              }}
            >
              ML
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  letterSpacing: "-0.01em",
                }}
              >
                Mads L.
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Pro</div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-end",
            gap: 5,
            padding: "7px 10px 14px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            width: "100%",
            borderRadius: 4,
            transition: "color 100ms",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          {!collapsed && (
            <span style={{ fontSize: 11, fontWeight: 500 }}>Collapse</span>
          )}
        </button>
      </div>
    </aside>
  );
}
