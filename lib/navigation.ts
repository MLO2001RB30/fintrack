import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Bell,
  Building2,
  CreditCard,
  LayoutDashboard,
  LineChart,
  Link2,
  PieChart,
  Settings,
  Target,
} from "lucide-react";

/** Top-level destinations (fixed order). */
export const PRIMARY_NAV: ReadonlyArray<{
  href: string;
  label: string;
  icon: LucideIcon;
  /** Stripe-style: Home uses brand accent for icon + label. */
  brandAccent?: boolean;
}> = [
  { href: "/", label: "Home", icon: LayoutDashboard, brandAccent: true },
  { href: "/accounts", label: "Accounts", icon: Building2 },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/plan", label: "Goals", icon: Target },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
];

/** Paths we track for “Shortcuts” + metadata for labels/icons. */
export const TRACKED_PATHS = [
  "/",
  "/accounts",
  "/subscriptions",
  "/plan",
  "/transactions",
  "/review",
  "/spending",
  "/investments",
  "/settings",
] as const;

export type TrackedPath = (typeof TRACKED_PATHS)[number];

export const ROUTE_META: Record<TrackedPath, { label: string; icon: LucideIcon }> = {
  "/": { label: "Home", icon: LayoutDashboard },
  "/accounts": { label: "Accounts", icon: Building2 },
  "/subscriptions": { label: "Subscriptions", icon: CreditCard },
  "/plan": { label: "Goals", icon: Target },
  "/transactions": { label: "Transactions", icon: ArrowLeftRight },
  "/review": { label: "Review", icon: Bell },
  "/spending": { label: "Spending", icon: PieChart },
  "/investments": { label: "Investments", icon: LineChart },
  "/settings": { label: "Settings", icon: Settings },
};

export const PRIMARY_HREFS = new Set(PRIMARY_NAV.map((item) => item.href));

export const KNOWN_PATHS_SET = new Set<string>(TRACKED_PATHS);

/**
 * Proactive / “do things” area (placeholder section name — rename in UI when you settle on copy).
 * Stripe calls this “Products”; we surface it as “Assistant” until you pick a final label.
 */
export const ASSISTANT_SECTION_TITLE = "Assistant";

export type AssistGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  links: ReadonlyArray<{ href: string; label: string }>;
};

export const ASSIST_GROUPS: ReadonlyArray<AssistGroup> = [
  {
    id: "review",
    label: "Review",
    icon: Bell,
    links: [{ href: "/review", label: "Inbox & fixes" }],
  },
  {
    id: "spending",
    label: "Spending",
    icon: PieChart,
    links: [{ href: "/spending", label: "By category" }],
  },
  {
    id: "investments",
    label: "Investments",
    icon: LineChart,
    links: [{ href: "/investments", label: "Portfolio" }],
  },
  {
    id: "connect",
    label: "Connect",
    icon: Link2,
    links: [{ href: "/accounts", label: "Banks & accounts" }],
  },
];

export function metaForPath(path: string): { label: string; icon: LucideIcon } | null {
  if (path in ROUTE_META) return ROUTE_META[path as TrackedPath];
  return null;
}
