"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ArrowLeftRight,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  LayoutDashboard,
  LineChart,
  PieChart,
  RefreshCw,
  Settings,
  ShieldAlert,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ACCOUNTS, REVIEW_ITEMS } from "@/lib/mock-data";

const PRIMARY_NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Overblik" },
  { href: "/plan", icon: CalendarClock, label: "Plan" },
  { href: "/review", icon: ShieldAlert, label: "Gennemgå" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Poster" },
  { href: "/investments", icon: LineChart, label: "Investeringer" },
];

const SECONDARY_NAV_ITEMS = [
  { href: "/accounts", icon: Building2, label: "Konti" },
  { href: "/spending", icon: PieChart, label: "Forbrug" },
  { href: "/subscriptions", icon: RefreshCw, label: "Abonnementer" },
];

const BOTTOM_ITEMS = [{ href: "/settings", icon: Settings, label: "Indstillinger" }];

const MOBILE_MORE_ITEMS = [...SECONDARY_NAV_ITEMS, PRIMARY_NAV_ITEMS[4], ...BOTTOM_ITEMS];

function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
        background: "linear-gradient(135deg, var(--accent), #6E63F7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 8px 20px rgba(87,73,244,0.22)",
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

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  alertCount,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  collapsed: boolean;
  alertCount?: number;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: collapsed ? "10px" : "11px 14px",
        borderRadius: 16,
        justifyContent: collapsed ? "center" : "flex-start",
        textDecoration: "none",
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        background: active ? "var(--surface-2)" : "transparent",
        transition: "background 100ms, color 100ms",
        position: "relative",
      }}
      onMouseEnter={(event) => {
        if (!active) {
          event.currentTarget.style.background = "var(--hover-bg)";
          event.currentTarget.style.color = "var(--text-primary)";
        }
      }}
      onMouseLeave={(event) => {
        if (!active) {
          event.currentTarget.style.background = "transparent";
          event.currentTarget.style.color = "var(--text-secondary)";
        }
      }}
    >
      <span style={{ position: "relative", flexShrink: 0, display: "flex" }}>
        <Icon size={16} strokeWidth={active ? 2.2 : 1.8} style={{ display: "block" }} />
        {alertCount ? (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -4,
              minWidth: 8,
              height: 8,
              borderRadius: 999,
              background: "var(--red)",
              border: "2px solid #fff",
            }}
          />
        ) : null}
      </span>

      {!collapsed ? (
        <>
          <span
            style={{
              fontSize: 14,
              fontWeight: active ? 600 : 450,
              whiteSpace: "nowrap",
              flex: 1,
              letterSpacing: "-0.01em",
            }}
          >
            {label}
          </span>
          {alertCount ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#fff",
                background: "var(--red)",
                borderRadius: 999,
                padding: "1px 7px",
                lineHeight: 1.5,
              }}
            >
              {alertCount}
            </span>
          ) : null}
        </>
      ) : null}
    </Link>
  );
}

function SectionLabel({ children, collapsed }: { children: string; collapsed: boolean }) {
  if (collapsed) return null;

  return (
    <div
      style={{
        padding: "10px 14px 2px",
        fontSize: 11,
        fontWeight: 600,
        color: "var(--text-muted)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const expiredAccountCount = useMemo(() => ACCOUNTS.filter((account) => account.status === "expired").length, []);
  const reviewCount = REVIEW_ITEMS.length;

  return (
    <aside
      className="sidebar-desktop"
      style={{
        width: collapsed ? 56 : 232,
        transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 24,
        boxShadow: "var(--shadow-md)",
        position: "relative",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
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
        {!collapsed ? (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 14,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              letterSpacing: "-0.02em",
            }}
          >
            FinTrack
          </span>
        ) : null}
      </div>

      <nav
        style={{
          flex: 1,
          padding: "12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <SectionLabel collapsed={collapsed}>Arbejdsspor</SectionLabel>
        {PRIMARY_NAV_ITEMS.map(({ href, icon, label }) => (
          <NavLink
            key={href}
            href={href}
            icon={icon}
            label={label}
            collapsed={collapsed}
            active={isRouteActive(pathname, href)}
            alertCount={href === "/review" ? reviewCount : undefined}
          />
        ))}

        <SectionLabel collapsed={collapsed}>Detaljer</SectionLabel>
        {SECONDARY_NAV_ITEMS.map(({ href, icon, label }) => (
          <NavLink
            key={href}
            href={href}
            icon={icon}
            label={label}
            collapsed={collapsed}
            active={isRouteActive(pathname, href)}
            alertCount={href === "/accounts" && expiredAccountCount > 0 ? expiredAccountCount : undefined}
          />
        ))}
      </nav>

      <div
        style={{
          padding: "10px 10px 0",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {BOTTOM_ITEMS.map(({ href, icon, label }) => (
          <NavLink
            key={href}
            href={href}
            icon={icon}
            label={label}
            collapsed={collapsed}
            active={isRouteActive(pathname, href)}
          />
        ))}

        {!collapsed ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "12px 14px",
              borderRadius: 18,
              margin: "4px 0 0",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), #6E63F7)",
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
        ) : null}

        <button
          onClick={() => setCollapsed((current) => !current)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-end",
            gap: 5,
            padding: "10px 14px 16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            width: "100%",
            borderRadius: 12,
            transition: "color 100ms",
            fontFamily: "inherit",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = "var(--text-muted)";
          }}
          title={collapsed ? "Udvid" : "Fold sammen"}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          {!collapsed ? <span style={{ fontSize: 11, fontWeight: 500 }}>Fold sammen</span> : null}
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const expiredAccountCount = useMemo(() => ACCOUNTS.filter((account) => account.status === "expired").length, []);
  const reviewCount = REVIEW_ITEMS.length;
  const primaryMobileItems = PRIMARY_NAV_ITEMS.slice(0, 4);
  const moreActive = MOBILE_MORE_ITEMS.some((item) => isRouteActive(pathname, item.href));

  return (
    <>
      <nav
        className="nav-mobile"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(255,255,255,0.96)",
          borderTop: "1px solid var(--border)",
          boxShadow: "0 -6px 20px rgba(16,24,40,0.06)",
          zIndex: 50,
          justifyContent: "space-around",
          alignItems: "stretch",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {primaryMobileItems.map(({ href, icon: Icon, label }) => {
          const active = isRouteActive(pathname, href);
          const alertCount = href === "/review" ? reviewCount : undefined;

          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "10px 4px",
                textDecoration: "none",
                color: active ? "var(--text-primary)" : "var(--text-muted)",
                position: "relative",
              }}
            >
              <span style={{ position: "relative", display: "flex" }}>
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                {alertCount ? (
                  <span
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -3,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--red)",
                      border: "2px solid #fff",
                    }}
                  />
                ) : null}
              </span>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: "-0.01em" }}>{label}</span>
            </Link>
          );
        })}

        <button
          onClick={() => setMoreOpen((current) => !current)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            padding: "10px 4px",
            background: "none",
            border: "none",
            color: moreActive || moreOpen ? "var(--text-primary)" : "var(--text-muted)",
            position: "relative",
            fontFamily: "inherit",
          }}
        >
          <span style={{ position: "relative", display: "flex" }}>
            <Ellipsis size={20} strokeWidth={moreActive || moreOpen ? 2.2 : 1.8} />
            {expiredAccountCount ? (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -3,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--red)",
                  border: "2px solid #fff",
                }}
              />
            ) : null}
          </span>
          <span style={{ fontSize: 10, fontWeight: moreActive || moreOpen ? 600 : 400, letterSpacing: "-0.01em" }}>Mere</span>
        </button>
      </nav>

      {moreOpen ? (
        <>
          <button
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(16,24,40,0.18)",
              border: "none",
              zIndex: 58,
            }}
          />
          <div
            style={{
              position: "fixed",
              left: 12,
              right: 12,
              bottom: 76,
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 24,
              boxShadow: "var(--shadow-md)",
              zIndex: 59,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 18px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Mere</div>
                <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-muted)" }}>Detaljer og indstillinger</div>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: 10, display: "grid", gap: 6 }}>
              {MOBILE_MORE_ITEMS.map(({ href, icon: Icon, label }, index) => {
                const active = isRouteActive(pathname, href);
                const alertCount = href === "/accounts" && expiredAccountCount > 0 ? expiredAccountCount : undefined;
                const sectionLabel =
                  index === 0 ? "Detaljer" : index === SECONDARY_NAV_ITEMS.length ? "Flere arbejdsspor" : null;

                return (
                  <div key={href}>
                    {sectionLabel ? (
                      <div
                        style={{
                          padding: "8px 14px 4px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-muted)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {sectionLabel}
                      </div>
                    ) : null}
                    <Link
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        borderRadius: 16,
                        textDecoration: "none",
                        color: active ? "var(--text-primary)" : "var(--text-secondary)",
                        background: active ? "var(--surface-2)" : "transparent",
                      }}
                    >
                      <span style={{ position: "relative", display: "flex" }}>
                        <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                        {alertCount ? (
                          <span
                            style={{
                              position: "absolute",
                              top: -2,
                              right: -4,
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "var(--red)",
                              border: "2px solid #fff",
                            }}
                          />
                        ) : null}
                      </span>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: active ? 600 : 450 }}>{label}</span>
                      <ArrowRight />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
