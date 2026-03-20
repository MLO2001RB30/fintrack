"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  ChevronDown,
  Code2,
  History,
  Menu,
  Settings,
  Store,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ACCOUNTS } from "@/lib/mock-data";
import {
  ASSIST_GROUPS,
  ASSISTANT_SECTION_TITLE,
  PRIMARY_NAV,
  metaForPath,
} from "@/lib/navigation";
import { useRecentRoutes } from "@/lib/use-recent-routes";
import { useReviewQueue } from "@/lib/use-review-queue";

const SIDEBAR_FONT = "var(--font-metric)" as const;

function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--grey-600)",
        marginTop: 22,
        marginBottom: 10,
        fontFamily: SIDEBAR_FONT,
      }}
    >
      {children}
    </div>
  );
}

function WorkspaceSwitcher({ compact = false }: { compact?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 0,
        width: "100%",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 32,
          height: 32,
          borderRadius: 20,
          background: "#ffffff",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Store size={16} strokeWidth={1.5} color="var(--grey-900)" />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: compact ? 15 : 16,
            fontWeight: 500,
            color: "var(--grey-900)",
            lineHeight: 1.2,
            letterSpacing: 0,
            fontFamily: SIDEBAR_FONT,
          }}
        >
          Household
        </div>
        {!compact ? (
          <div
            style={{
              marginTop: 2,
              fontSize: 12,
              fontWeight: 400,
              color: "var(--grey-600)",
              lineHeight: 1.3,
              fontFamily: SIDEBAR_FONT,
            }}
          >
            Fintrack workspace
          </div>
        ) : null}
      </div>
      <ChevronDown size={16} strokeWidth={1.5} color="var(--grey-600)" style={{ flexShrink: 0 }} aria-hidden />
    </div>
  );
}

function PrimaryNavLink({
  href,
  label,
  icon: Icon,
  active,
  brandAccent,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: (typeof PRIMARY_NAV)[number]["icon"];
  active: boolean;
  brandAccent?: boolean;
  onNavigate?: () => void;
}) {
  const accent = Boolean(brandAccent);
  const iconColor = accent ? "var(--accent)" : active ? "var(--grey-900)" : "var(--grey-600)";
  const textColor = accent ? "var(--accent)" : "var(--grey-900)";
  return (
    <Link
      href={href}
      onClick={onNavigate}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 10px",
        borderRadius: 6,
        textDecoration: "none",
        color: textColor,
        background: active ? "rgba(26, 31, 54, 0.06)" : "transparent",
        fontFamily: SIDEBAR_FONT,
        fontSize: 14,
        fontWeight: active ? 500 : 400,
        lineHeight: 1.25,
      }}
    >
      <Icon size={16} strokeWidth={1.5} color={iconColor} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{label}</span>
    </Link>
  );
}

function ShortcutLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "6px 10px",
        borderRadius: 6,
        textDecoration: "none",
        color: "var(--grey-900)",
        background: active ? "rgba(26, 31, 54, 0.06)" : "transparent",
        fontFamily: SIDEBAR_FONT,
        fontSize: 14,
        fontWeight: active ? 500 : 400,
      }}
    >
      <History size={16} strokeWidth={1.5} color="var(--grey-600)" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{label}</span>
    </Link>
  );
}

function AssistantNav({
  pathname,
  reviewCount,
  onNavigate,
}: {
  pathname: string;
  reviewCount: number;
  onNavigate?: () => void;
}) {
  const matchedGroupId = useMemo(
    () => ASSIST_GROUPS.find((g) => g.links.some((l) => isRouteActive(pathname, l.href)))?.id ?? null,
    [pathname],
  );
  const [openId, setOpenId] = useState<string | null>(matchedGroupId);

  return (
    <div style={{ display: "flex", flexDirection: "column", marginBottom: 8 }}>
      {ASSIST_GROUPS.map((group) => (
        <AssistAccordion
          key={group.id}
          groupId={group.id}
          label={group.label}
          icon={group.icon}
          links={group.links}
          expanded={openId === group.id}
          onToggle={() => setOpenId((cur) => (cur === group.id ? null : group.id))}
          pathname={pathname}
          reviewBadge={group.id === "review" ? reviewCount : undefined}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

function AssistAccordion({
  groupId,
  label,
  icon: Icon,
  links,
  expanded,
  onToggle,
  pathname,
  reviewBadge,
  onNavigate,
}: {
  groupId: string;
  label: string;
  icon: (typeof ASSIST_GROUPS)[number]["icon"];
  links: ReadonlyArray<{ href: string; label: string }>;
  expanded: boolean;
  onToggle: () => void;
  pathname: string;
  reviewBadge?: number;
  onNavigate?: () => void;
}) {
  const groupActive = links.some((l) => isRouteActive(pathname, l.href));

  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 4px 10px 2px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontFamily: SIDEBAR_FONT,
          textAlign: "left",
        }}
      >
        <Icon size={16} strokeWidth={1.5} color={groupActive ? "var(--grey-900)" : "var(--grey-600)"} />
        <span
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: groupActive ? 500 : 400,
            color: "var(--grey-900)",
          }}
        >
          {label}
        </span>
        {reviewBadge && reviewBadge > 0 ? (
          <span
            className="font-metric"
            style={{
              minWidth: 20,
              height: 20,
              padding: "0 6px",
              borderRadius: 999,
              background: "var(--surface-3)",
              color: "var(--grey-700)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10.5,
              fontWeight: 600,
            }}
          >
            {reviewBadge}
          </span>
        ) : null}
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          color="var(--grey-600)"
          style={{
            flexShrink: 0,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        />
      </button>
      {expanded ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 0 10px 28px" }}>
          {links.map((link) => {
            const subActive = isRouteActive(pathname, link.href);
            return (
              <Link
                key={`${groupId}-${link.href}-${link.label}`}
                href={link.href}
                onClick={onNavigate}
                style={{
                  padding: "6px 10px",
                  borderRadius: 4,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: subActive ? 500 : 400,
                  color: subActive ? "var(--accent)" : "var(--grey-700)",
                  background: subActive ? "var(--accent-glow)" : "transparent",
                  fontFamily: SIDEBAR_FONT,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function SidebarFooterLink({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof Code2;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "6px 2px",
        textDecoration: "none",
        color: "var(--grey-900)",
        fontSize: 14,
        fontWeight: 400,
        fontFamily: SIDEBAR_FONT,
      }}
    >
      <Icon size={16} strokeWidth={1.5} color="var(--grey-600)" />
      {label}
    </Link>
  );
}

function ShellSidebarContent({
  pathname,
  reviewCount,
  expiredAccountCount,
  onNavigate,
}: {
  pathname: string;
  reviewCount: number;
  expiredAccountCount: number;
  onNavigate?: () => void;
}) {
  const [demoData, setDemoData] = useState(false);
  const { shortcuts, hydrated } = useRecentRoutes();

  const shortcutsToShow = useMemo(() => {
    return shortcuts.map((path) => {
      const meta = metaForPath(path);
      if (!meta) return null;
      return { href: path, label: meta.label };
    }).filter(Boolean) as { href: string; label: string }[];
  }, [shortcuts]);

  return (
    <div
      style={{
        height: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        padding: "12px 18px 24px",
        borderRight: "1px solid var(--border)",
        background: "#ffffff",
        boxSizing: "border-box",
        fontFamily: SIDEBAR_FONT,
      }}
    >
      <div style={{ marginBottom: 28, paddingTop: 4 }}>
        <WorkspaceSwitcher />
      </div>

      {expiredAccountCount > 0 ? (
        <Link
          href="/accounts?focus=reconnect"
          onClick={onNavigate}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            marginBottom: 16,
            borderRadius: "var(--radius-card-sm)",
            border: "1px solid var(--danger-border)",
            background: "var(--danger-bg)",
            color: "var(--red)",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: SIDEBAR_FONT,
          }}
        >
          <AlertTriangle size={14} strokeWidth={1.5} />
          {expiredAccountCount} connection{expiredAccountCount > 1 ? "s" : ""} need attention
        </Link>
      ) : null}

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        {PRIMARY_NAV.map((item) => (
          <PrimaryNavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isRouteActive(pathname, item.href)}
            brandAccent={item.brandAccent}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <SectionLabel>Shortcuts</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minHeight: 32 }}>
        {hydrated && shortcutsToShow.length === 0 ? (
          <p
            style={{
              margin: 0,
              fontSize: 12.5,
              lineHeight: 1.45,
              color: "var(--grey-600)",
              fontFamily: SIDEBAR_FONT,
              padding: "4px 2px 8px",
            }}
          >
            Pages you open outside the main five will show up here for quick return.
          </p>
        ) : null}
        {hydrated
          ? shortcutsToShow.map((item) => (
              <ShortcutLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={isRouteActive(pathname, item.href)}
                onNavigate={onNavigate}
              />
            ))
          : null}
      </div>

      <SectionLabel>{ASSISTANT_SECTION_TITLE}</SectionLabel>
      <AssistantNav key={pathname} pathname={pathname} reviewCount={reviewCount} onNavigate={onNavigate} />

      <div
        style={{
          marginTop: "auto",
          paddingTop: 16,
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <SidebarFooterLink href="/settings" label="Developers" icon={Code2} onNavigate={onNavigate} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            role="switch"
            aria-checked={demoData}
            onClick={() => setDemoData((previous) => !previous)}
            style={{
              width: 26,
              height: 16,
              borderRadius: 26,
              border: "1px solid var(--border-strong)",
              background: demoData ? "var(--accent)" : "#e3e8ee",
              padding: 0,
              cursor: "pointer",
              position: "relative",
              flexShrink: 0,
              transition: "background 0.15s ease",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: demoData ? 11 : 2,
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#ffffff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
                transition: "left 0.15s ease",
              }}
            />
          </button>
          <span style={{ fontSize: 14, fontWeight: 400, color: "var(--grey-900)", fontFamily: SIDEBAR_FONT }}>
            View test data
          </span>
        </div>
        <SidebarFooterLink href="/settings" label="Settings" icon={Settings} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { openItems } = useReviewQueue();
  const reviewCount = openItems.length;
  const expiredAccountCount = useMemo(
    () => ACCOUNTS.filter((account) => account.status === "expired").length,
    [],
  );

  return (
    <>
      <aside className="app-shell-sidebar sidebar-desktop">
        <div style={{ position: "sticky", top: 0, minHeight: "100dvh" }}>
          <ShellSidebarContent
            pathname={pathname}
            reviewCount={reviewCount}
            expiredAccountCount={expiredAccountCount}
          />
        </div>
      </aside>

      <header className="sidebar-mobile-header">
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            padding: "14px 16px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 16px",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--border)",
              background: "#ffffff",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <WorkspaceSwitcher compact />
            <button
              type="button"
              className="sidebar-mobile-menu-button"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                border: "1px solid var(--border-strong)",
                background: "#ffffff",
                boxShadow: "var(--shadow-button-secondary)",
                color: "var(--grey-800)",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Menu size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <>
          <button
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 58,
              border: "none",
              background: "var(--overlay-scrim)",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 16,
              right: 16,
              bottom: 16,
              left: 16,
              zIndex: 59,
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--border)",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                zIndex: 2,
              }}
            >
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  border: "none",
                  background: "var(--surface-2)",
                  color: "var(--grey-700)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-button-secondary)",
                }}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <ShellSidebarContent
              pathname={pathname}
              reviewCount={reviewCount}
              expiredAccountCount={expiredAccountCount}
              onNavigate={() => setMenuOpen(false)}
            />
          </div>
        </>
      ) : null}
    </>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="nav-mobile"
      style={{
        position: "fixed",
        left: 14,
        right: 14,
        bottom: 14,
        zIndex: 45,
        display: "none",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 4,
        padding: 8,
        borderRadius: "var(--radius-card)",
        background: "#ffffff",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-lg)",
        fontFamily: "var(--font-metric)",
      }}
    >
      {PRIMARY_NAV.map((item) => {
        const active = isRouteActive(pathname, item.href);
        const Icon = item.icon;
        const accent = Boolean(item.brandAccent);

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "8px 2px",
              borderRadius: 6,
              textDecoration: "none",
              color: accent ? "var(--accent)" : active ? "var(--grey-900)" : "var(--grey-600)",
              background: active ? "rgba(26, 31, 54, 0.06)" : "transparent",
            }}
          >
            <Icon
              size={18}
              strokeWidth={1.5}
              color={accent ? "var(--accent)" : active ? "var(--grey-900)" : "var(--grey-600)"}
            />
            <span
              style={{
                fontSize: 9.5,
                fontWeight: active ? 600 : 500,
                lineHeight: 1.15,
                textAlign: "center",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
