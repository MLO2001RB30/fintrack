"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Building2, CheckCircle2, CreditCard, ScanSearch, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  ACCOUNTS,
  formatDKK,
  MOCK_TODAY,
  monthlyEquivalent,
  SUBSCRIPTIONS,
  TRANSACTIONS,
} from "@/lib/mock-data";
import { useReviewQueue } from "@/lib/use-review-queue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { PageHeader } from "@/components/ui/page-header";

function severityBadge(severity: "high" | "medium" | "low") {
  switch (severity) {
    case "high":
      return "error";
    case "medium":
      return "paused";
    case "low":
      return "yearly";
    default:
      return "yearly";
  }
}

function severityLabel(severity: "high" | "medium" | "low") {
  switch (severity) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return "Low";
  }
}

function formatShortDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatReviewTimestamp(value: string | null) {
  if (!value) {
    return "No decisions yet";
  }

  const updated = new Date(value);
  const today = new Date(`${MOCK_TODAY}T00:00:00`);
  const diffDays = Math.max(Math.round((today.getTime() - updated.getTime()) / 86_400_000), 0);

  if (diffDays === 0) {
    return "Updated today";
  }

  if (diffDays === 1) {
    return "Updated yesterday";
  }

  return `Updated ${diffDays} days ago`;
}

function queueStatusBadge(status: "open" | "snoozed" | "resolved") {
  switch (status) {
    case "resolved":
      return "active";
    case "snoozed":
      return "paused";
    default:
      return "error";
  }
}

function queueStatusLabel(status: "open" | "snoozed" | "resolved") {
  switch (status) {
    case "resolved":
      return "Resolved";
    case "snoozed":
      return "Snoozed";
    default:
      return "Open";
  }
}

function ReviewAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        background: "#ffffff",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "16px 18px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{title}</div>
          <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>{description}</div>
        </div>
        <ArrowRight size={15} color="var(--accent)" />
      </div>
    </Link>
  );
}

export function ReviewPage() {
  const [filter, setFilter] = useState<"open" | "snoozed" | "resolved">("open");
  const { items, openItems, snoozedItems, resolvedItems, persistenceMode, snoozeItem, resolveItem, reopenItem } =
    useReviewQueue();
  const accountIssues = ACCOUNTS.filter((account) => account.status !== "active");
  const highestCostSubscriptions = [...SUBSCRIPTIONS]
    .sort((a, b) => monthlyEquivalent(b) - monthlyEquivalent(a))
    .slice(0, 5);
  const merchantChecks = TRANSACTIONS.filter(
    (transaction) => transaction.amountOere < 0 && !transaction.isSubscription && transaction.category !== "Transfer",
  )
    .sort((a, b) => Math.abs(b.amountOere) - Math.abs(a.amountOere))
    .slice(0, 5);
  const possibleMonthlySavings = highestCostSubscriptions
    .filter(
      (subscription) =>
        openItems.some((item) => item.type === "subscription" && item.merchant === subscription.merchant),
    )
    .reduce((sum, subscription) => sum + monthlyEquivalent(subscription), 0);
  const visibleQueue = filter === "open" ? openItems : filter === "snoozed" ? snoozedItems : resolvedItems;
  const latestDecisionAt = useMemo(() => {
    return items
      .map((item) => item.updatedAt)
      .filter((value): value is string => Boolean(value))
      .sort((left, right) => right.localeCompare(left))[0] ?? null;
  }, [items]);

  return (
    <div className="page-wrap">
      <PageHeader
        title="Review"
        subtitle={`Keep forecasts, recurring costs, and categories trustworthy. ${openItems.length} item${openItems.length === 1 ? "" : "s"} are ready for action now.`}
        action={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              fontSize: 12.5,
              color: "var(--text-secondary)",
              userSelect: "none",
            }}
          >
            {persistenceMode === "remote" ? <CheckCircle2 size={13} /> : <ScanSearch size={13} />}
            {persistenceMode === "remote" ? "Synced review queue" : "Saved on this device"}
          </div>
        }
      />

      <div className="animate-fade-up anim-1 grid-4" style={{ marginBottom: 24 }}>
        <KpiCard
          label="Open now"
          value={`${openItems.length}`}
          rawValue={openItems.length}
          formatFn={(value) => `${Math.round(value)}`}
          sub="ready for action"
          accent
        />
        <KpiCard
          label="Possible savings"
          value={formatDKK(possibleMonthlySavings)}
          rawValue={possibleMonthlySavings}
          formatFn={(value) => formatDKK(Math.round(value))}
          sub="from open subscription reviews"
        />
        <KpiCard
          label="Snoozed"
          value={`${snoozedItems.length}`}
          rawValue={snoozedItems.length}
          formatFn={(value) => `${Math.round(value)}`}
          sub="return later"
        />
        <KpiCard
          label="Freshness"
          value={formatReviewTimestamp(latestDecisionAt)}
          sub={`${resolvedItems.length} resolved decisions captured`}
        />
      </div>

      <div className="animate-fade-up anim-2 grid-main" style={{ marginBottom: 24 }}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Working queue</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Track what is open now, what you parked for later, and what already has a decision behind it.
              </div>
            </div>
          </CardHeader>
          <CardBody style={{ paddingTop: 4, paddingBottom: 4 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {[
                { id: "open" as const, label: `Open (${openItems.length})` },
                { id: "snoozed" as const, label: `Snoozed (${snoozedItems.length})` },
                { id: "resolved" as const, label: `Resolved (${resolvedItems.length})` },
              ].map((option) => {
                const active = filter === option.id;

                return (
                  <Button
                    key={option.id}
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setFilter(option.id)}
                    style={{
                      borderRadius: 999,
                      padding: "8px 14px",
                      fontWeight: 600,
                      fontSize: 12.5,
                      ...(active
                        ? {
                            background: "var(--accent-glow)",
                            border: "1px solid var(--accent-border)",
                            color: "var(--accent)",
                            boxShadow: "none",
                          }
                        : {
                            color: "var(--grey-600)",
                            background: "var(--surface-2)",
                            boxShadow: "none",
                            border: "1px solid var(--border)",
                          }),
                    }}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
            {visibleQueue.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "14px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: item.severity === "high" ? "var(--danger-bg)" : "var(--surface-2)",
                    border: `1px solid ${item.severity === "high" ? "var(--danger-border)" : "var(--border)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: item.severity === "high" ? "var(--red)" : "var(--text-secondary)",
                  }}
                >
                  {item.type === "account" ? <Building2 size={16} /> : item.type === "subscription" ? <CreditCard size={16} /> : <AlertTriangle size={16} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{item.title}</span>
                    <Badge variant={severityBadge(item.severity)}>{severityLabel(item.severity)}</Badge>
                    <Badge variant={queueStatusBadge(item.status)}>{queueStatusLabel(item.status)}</Badge>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>{item.description}</div>
                  <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--text-muted)" }}>
                    {item.status === "snoozed" && item.snoozedUntil
                      ? `Returns to the queue on ${formatShortDate(item.snoozedUntil)}.`
                      : item.updatedAt
                        ? formatReviewTimestamp(item.updatedAt)
                        : "No action recorded yet."}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <Button
                    href={item.href}
                    variant="ghost"
                    size="md"
                    trailingIcon={<ArrowRight size={12} strokeWidth={1.5} />}
                    style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 500 }}
                  >
                    {item.cta}
                  </Button>
                  {item.status === "open" ? (
                    <>
                      <Button type="button" variant="secondary" size="md" onClick={() => void snoozeItem(item.id)} style={{ fontWeight: 600, fontSize: 12 }}>
                        Snooze 7d
                      </Button>
                      <Button type="button" variant="success" size="md" onClick={() => void resolveItem(item.id)} style={{ fontWeight: 600, fontSize: 12 }}>
                        Resolve
                      </Button>
                    </>
                  ) : (
                    <Button type="button" variant="secondary" size="md" onClick={() => void reopenItem(item.id)} style={{ fontWeight: 600, fontSize: 12 }}>
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {visibleQueue.length === 0 ? (
              <div style={{ padding: "18px 0 8px", fontSize: 13, color: "var(--text-secondary)" }}>
                {filter === "open"
                  ? "No open review items right now."
                  : filter === "snoozed"
                    ? "Nothing is snoozed right now."
                    : "No resolved items yet."}
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recurring costs</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Start with the largest items and anything the system is least certain about.
              </div>
            </div>
            <Button href="/subscriptions" variant="ghost" size="md" style={{ fontSize: 12.5, fontWeight: 500 }}>
              See all →
            </Button>
          </CardHeader>
          <CardBody style={{ display: "grid", gap: 12 }}>
            {highestCostSubscriptions.map((subscription) => {
              const monthly = monthlyEquivalent(subscription);
              const confidenceVariant = subscription.confidence >= 0.97 ? "active" : subscription.confidence >= 0.9 ? "paused" : "error";

              return (
                <div
                  key={subscription.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-card)",
                    padding: "14px 16px",
                  }}
                >
                  <MerchantLogo domain={subscription.domain} merchant={subscription.merchant} size={38} radius={10} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{subscription.merchant}</span>
                      <Badge variant={subscription.status === "active" ? "monthly" : subscription.status === "paused" ? "paused" : "cancelled"}>
                        {subscription.status === "active" ? "active" : subscription.status === "paused" ? "paused" : "cancelled"}
                      </Badge>
                      {items.some((item) => item.type === "subscription" && item.merchant === subscription.merchant && item.status === "open") ? (
                        <Badge variant="error">needs review</Badge>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                      Confidence {Math.round(subscription.confidence * 100)}% · {subscription.category}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="font-metric" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                      {formatDKK(monthly)}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Badge variant={confidenceVariant}>{Math.round(subscription.confidence * 100)}% confidence</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <div className="animate-fade-up anim-3" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Purchases to inspect</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Larger or unusual purchases that are worth understanding better or categorizing more sharply.
              </div>
            </div>
            <Button href="/transactions" variant="ghost" size="md" style={{ fontSize: 12.5, fontWeight: 500 }}>
              Open transactions →
            </Button>
          </CardHeader>
          <CardBody style={{ paddingTop: 4, paddingBottom: 4 }}>
            {merchantChecks.map((transaction) => (
              <div
                key={transaction.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{transaction.merchant}</div>
                  <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-muted)" }}>
                    {new Date(transaction.date).toLocaleDateString("en-US", { day: "numeric", month: "short" })} · {transaction.category}
                  </div>
                </div>
                <div className="font-metric" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                  {formatDKK(transaction.amountOere)}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Data quality</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Connections and rules that determine whether the rest of the app can be trusted.
              </div>
            </div>
          </CardHeader>
          <CardBody style={{ display: "grid", gap: 12 }}>
            {accountIssues.map((account) => (
              <div
                key={account.id}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-card)",
                  padding: "14px 16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{account.institution}</div>
                    <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-muted)" }}>{account.accountName}</div>
                  </div>
                  <Badge variant={account.status === "expired" ? "expired" : "error"}>{account.status}</Badge>
                </div>
                <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--text-secondary)" }}>
                  Last updated {account.lastSynced}. Forecasts and spending analysis get weaker without an active connection.
                </div>
                {openItems.some((item) => item.type === "account" && item.accountId === account.id) ? (
                  <div style={{ marginTop: 8 }}>
                    <Badge variant="error">still open in review</Badge>
                  </div>
                ) : null}
              </div>
            ))}

            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Sparkles size={14} color="var(--text-muted)" />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>Rule hygiene</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                Internal transfers should stay out of the spend view so budgets and the review queue remain more accurate.
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="animate-fade-up anim-4">
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={14} color="var(--text-muted)" />
              <CardTitle>Keep going</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="grid-3">
            <ReviewAction
              href={openItems.find((item) => item.type === "subscription")?.href ?? "/subscriptions"}
              title="Cut recurring costs"
              description="Jump straight into subscriptions and decide what should be cancelled, paused, or renegotiated."
            />
            <ReviewAction
              href={openItems.find((item) => item.type === "merchant" || item.type === "transaction")?.href ?? "/transactions?review=transfer"}
              title="Review classifications"
              description="Start with internal transfers and merchant checks in a focused review flow."
            />
            <ReviewAction
              href={openItems.find((item) => item.type === "account")?.href ?? "/accounts?focus=reconnect&account=acc-4"}
              title="Reconnect data sources"
              description="Make sure accounts and connections are current before relying on the numbers elsewhere."
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
