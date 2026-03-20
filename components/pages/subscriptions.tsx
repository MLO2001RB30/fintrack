"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ExternalLink, CreditCard, RefreshCw } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import {
  MOCK_TODAY,
  SUBSCRIPTIONS,
  formatDKK,
  getDaysBetween,
  monthlyEquivalent,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { EmptyState } from "@/components/ui/empty-state";

type SortKey = "merchant" | "amount" | "cadence" | "nextExpected" | "status";
type FilterStatus = "all" | "active" | "paused" | "cancelled";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(iso: string) {
  const diff = getDaysBetween(MOCK_TODAY, iso);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

export function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("amount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const activeSubscriptions = SUBSCRIPTIONS.filter((subscription) => subscription.status === "active");

  const filtered = useMemo(() => {
    let subs = [...SUBSCRIPTIONS];
    if (search) subs = subs.filter(s => s.merchant.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== "all") subs = subs.filter(s => s.status === filterStatus);
    subs.sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      if (sortKey === "merchant") { va = a.merchant; vb = b.merchant; }
      if (sortKey === "amount") { va = monthlyEquivalent(a); vb = monthlyEquivalent(b); }
      if (sortKey === "cadence") { va = a.cadence; vb = b.cadence; }
      if (sortKey === "nextExpected") { va = a.nextExpected; vb = b.nextExpected; }
      if (sortKey === "status") { va = a.status; vb = b.status; }
      if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return sortDir === "asc" ? va - (vb as number) : (vb as number) - va;
    });
    return subs;
  }, [search, filterStatus, sortKey, sortDir]);

  const recurringByCategory = useMemo(() => {
    const grouped = activeSubscriptions.reduce<Record<string, number>>((accumulator, subscription) => {
      accumulator[subscription.category] = (accumulator[subscription.category] ?? 0) + monthlyEquivalent(subscription);
      return accumulator;
    }, {});

    return Object.entries(grouped)
      .map(([category, total]) => ({ category, total }))
      .sort((left, right) => right.total - left.total);
  }, [activeSubscriptions]);

  const next30DaysRecurring = useMemo(
    () =>
      activeSubscriptions
        .filter((subscription) => {
          const diff = getDaysBetween(MOCK_TODAY, subscription.nextExpected);
          return diff >= 0 && diff <= 30;
        })
        .sort((left, right) => left.nextExpected.localeCompare(right.nextExpected)),
    [activeSubscriptions],
  );

  const activeMonthly = activeSubscriptions.reduce((s, sub) => s + monthlyEquivalent(sub), 0);
  const annualBurn = activeMonthly * 12;
  const next30DaysTotal = next30DaysRecurring.reduce((sum, subscription) => sum + subscription.amountOere, 0);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => handleSort(k)}
      trailingIcon={<ArrowUpDown size={10} style={{ opacity: sortKey === k ? 1 : 0.4 }} />}
      style={{
        color: sortKey === k ? "var(--text-primary)" : "var(--text-muted)",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        gap: 4,
      }}
    >
      {label}
    </Button>
  );

  return (
    <div className="page-wrap">
      <PageHeader
        title="Subscriptions"
        subtitle="Recurring commitments detected from your bank transactions"
      />

      {/* Burn summary */}
      <div className="animate-fade-up anim-1 grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Monthly spend", rawValue: activeMonthly, format: (n: number) => formatDKK(Math.round(n)), sub: "active subscriptions", delay: 80 },
          { label: "Annual spend", rawValue: annualBurn, format: (n: number) => formatDKK(Math.round(n)), sub: "estimated", delay: 140 },
          { label: "Active", rawValue: SUBSCRIPTIONS.filter(s => s.status === "active").length, format: (n: number) => `${Math.round(n)}`, sub: "subscriptions", delay: 200 },
          { label: "Paused / cancelled", rawValue: SUBSCRIPTIONS.filter(s => s.status !== "active").length, format: (n: number) => `${Math.round(n)}`, sub: "subscriptions", delay: 260 },
        ].map(s => (
          <div
            key={s.label}
            className="card-hover"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "16px 18px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
              {s.label}
            </div>
            <div className="font-metric" style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              <AnimatedNumber value={s.rawValue} format={s.format} delay={s.delay} />
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly burn bar */}
      <Card className="animate-fade-up anim-2" style={{ marginBottom: 20 }}>
        <CardHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CreditCard size={13} color="var(--text-muted)" />
            <CardTitle>Monthly spend breakdown</CardTitle>
          </div>
          <span className="font-metric" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
            {formatDKK(activeMonthly)}/md
          </span>
        </CardHeader>
        <CardBody>
          <div style={{ display: "flex", gap: 2, height: 10, borderRadius: 6, overflow: "hidden" }}>
            {activeSubscriptions
              .sort((a, b) => monthlyEquivalent(b) - monthlyEquivalent(a))
              .map((sub, i) => {
                const pct = (monthlyEquivalent(sub) / activeMonthly) * 100;
                const hue = (i * 47) % 360;
                return (
                  <div
                    key={sub.id}
                    title={`${sub.merchant}: ${formatDKK(monthlyEquivalent(sub))}/md`}
                    className="progress-bar-animated"
                    style={{
                      "--target-w": `${pct}%`,
                      "--bar-delay": `${150 + i * 30}ms`,
                      flexShrink: 0,
                      background: `hsl(${hue},65%,58%)`,
                      transition: "opacity 150ms",
                      borderRadius: 0,
                    } as React.CSSProperties}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  />
                );
              })}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 10 }}>
            {activeSubscriptions
              .sort((a, b) => monthlyEquivalent(b) - monthlyEquivalent(a))
              .slice(0, 6)
              .map((sub, i) => {
                const hue = (i * 47) % 360;
                return (
                  <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text-secondary)" }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: `hsl(${hue},65%,58%)` }} />
                    {sub.merchant}
                  </div>
                );
              })}
          </div>
        </CardBody>
      </Card>

      <div className="animate-fade-up anim-3" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16, marginBottom: 20 }}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recurring spend roll-up</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                See which recurring categories are taking the biggest share of your monthly baseline.
              </div>
            </div>
            <span className="font-metric" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
              {recurringByCategory.length} categories
            </span>
          </CardHeader>
          <CardBody style={{ display: "grid", gap: 12 }}>
            {recurringByCategory.map((entry) => {
              const pct = activeMonthly > 0 ? (entry.total / activeMonthly) * 100 : 0;

              return (
                <div key={entry.category}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{entry.category}</span>
                    <div style={{ textAlign: "right" }}>
                      <div className="font-metric" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>
                        {formatDKK(entry.total)}/mo
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{pct.toFixed(0)}% of recurring spend</div>
                    </div>
                  </div>
                  <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: "var(--brand-gradient)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Next 30 days</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Upcoming recurring charges already lined up for the next month.
              </div>
            </div>
            <span className="font-metric" style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
              {formatDKK(next30DaysTotal)}
            </span>
          </CardHeader>
          <CardBody style={{ display: "grid", gap: 10 }}>
            {next30DaysRecurring.slice(0, 5).map((subscription) => (
              <div
                key={subscription.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  paddingBottom: 10,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{subscription.merchant}</div>
                  <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-muted)" }}>
                    {daysUntil(subscription.nextExpected)} · {formatDate(subscription.nextExpected)}
                  </div>
                </div>
                <div className="font-metric" style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  {formatDKK(subscription.amountOere)}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <div
        className="animate-fade-up anim-4"
        style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}
      >
        {/* Search */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 12px",
            maxWidth: 320,
          }}
        >
          <Search size={13} color="var(--text-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subscriptions..."
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: 13,
              fontFamily: "inherit",
              width: "100%",
            }}
          />
        </div>

        {/* Status filter */}
        {(["all", "active", "paused", "cancelled"] as FilterStatus[]).map(f => (
          <Button
            key={f}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setFilterStatus(f)}
            style={{
              padding: "7px 14px",
              borderRadius: "var(--radius-control)",
              border: "1px solid",
              borderColor: filterStatus === f ? "var(--accent)" : "var(--border)",
              boxShadow: filterStatus === f ? "none" : undefined,
              background: filterStatus === f ? "var(--accent-glow)" : "#ffffff",
              color: filterStatus === f ? "var(--accent)" : "var(--text-secondary)",
              fontSize: 12.5,
              textTransform: "capitalize",
            }}
          >
            {f === "all" ? "All" : f === "active" ? "Active" : f === "paused" ? "Paused" : "Cancelled"}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card className="animate-fade-up anim-5">
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[
                  { key: "merchant" as SortKey, label: "Subscription", width: "auto" },
                  { key: "amount" as SortKey, label: "Monthly price", width: 140, align: "right" as const },
                  { key: "cadence" as SortKey, label: "Cadence", width: 120 },
                  { key: "nextExpected" as SortKey, label: "Next charge", width: 160 },
                  { key: "status" as SortKey, label: "Status", width: 110 },
                  { key: null, label: "Action", width: 80 },
                ].map(col => (
                  <th
                    key={col.key ?? col.label}
                    style={{
                      padding: "12px 20px",
                      textAlign: col.align ?? "left",
                      width: col.width,
                      fontWeight: 500,
                    }}
                  >
                    {col.key ? <SortBtn k={col.key} label={col.label} /> : (
                      <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {col.label}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub, i) => {
                const monthly = monthlyEquivalent(sub);
                const days = sub.status === "active" ? daysUntil(sub.nextExpected) : null;
                const urgent = days && ["Today", "Tomorrow"].some(d => days.startsWith(d));
                return (
                  <tr
                    key={sub.id}
                    id={sub.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                      transition: "background 100ms",
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--hover-bg)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                  >
                    {/* Merchant */}
                    <td style={{ padding: "13px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <MerchantLogo domain={sub.domain} merchant={sub.merchant} size={34} radius={9} />
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>{sub.merchant}</div>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{sub.category}</div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: "13px 20px", textAlign: "right" }}>
                      <span className="font-metric" style={{ fontSize: 14, fontWeight: 500, color: "var(--grey-900)" }}>
                        {formatDKK(monthly)}
                      </span>
                      {sub.cadence !== "monthly" && (
                        <div className="font-metric" style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)" }}>
                          {formatDKK(sub.amountOere)}/{sub.cadence === "quarterly" ? "quarter" : "year"}
                        </div>
                      )}
                    </td>

                    {/* Cadence */}
                    <td style={{ padding: "13px 20px" }}>
                      <Badge variant={sub.cadence} size="sm">
                        {sub.cadence === "monthly" ? "Monthly" : sub.cadence === "quarterly" ? "Quarterly" : "Yearly"}
                      </Badge>
                    </td>

                    {/* Next charge */}
                    <td style={{ padding: "13px 20px" }}>
                      {sub.status === "active" ? (
                        <div>
                          <div style={{ fontSize: 13, color: urgent ? "var(--yellow)" : "var(--text-primary)" }}>
                            {days}
                          </div>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{formatDate(sub.nextExpected)}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "13px 20px" }}>
                      <Badge variant={sub.status}>
                        {sub.status === "active" ? "Active" : sub.status === "paused" ? "Paused" : "Cancelled"}
                      </Badge>
                    </td>

                    {/* Action */}
                    <td style={{ padding: "13px 20px" }}>
                      {sub.cancelUrl && sub.status === "active" ? (
                        <a
                          href={sub.cancelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open the provider's cancellation page"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            color: "var(--text-muted)",
                            textDecoration: "none",
                            padding: "4px 8px",
                            borderRadius: 5,
                            border: "1px solid var(--border)",
                            transition: "all 120ms",
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.color = "var(--red)";
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--danger-border)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                          }}
                        >
                          Cancel <ExternalLink size={10} />
                        </a>
                      ) : sub.status === "active" ? (
                        <span
                          title="Direct cancellation link is not available for this provider"
                          style={{ fontSize: 11.5, color: "var(--text-muted)", cursor: "help" }}
                        >
                          —
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <EmptyState
              icon={<RefreshCw size={22} />}
              title="No subscriptions found"
              description={search || filterStatus !== "all"
                ? "Try adjusting your filters or search."
                : "Connect your bank accounts to automatically detect subscriptions from your transactions."}
            />
          )}
        </div>
      </Card>

      {/* Footnote explaining Opsig availability */}
      <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
        <strong style={{ color: "var(--text-secondary)" }}>About cancellation links:</strong>{" "}
        The &quot;Cancel&quot; button only appears for providers where FinTrack knows the direct cancellation URL.
        For the rest, you will need to sign in with the provider manually to cancel.
      </div>
    </div>
  );
}
