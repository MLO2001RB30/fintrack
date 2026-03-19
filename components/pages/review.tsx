"use client";

import { AlertTriangle, ArrowRight, Building2, CreditCard, ScanSearch, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  ACCOUNTS,
  formatDKK,
  monthlyEquivalent,
  REVIEW_ITEMS,
  SUBSCRIPTIONS,
  TRANSACTIONS,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
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
      return "Høj";
    case "medium":
      return "Mellem";
    case "low":
      return "Lav";
    default:
      return "Lav";
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
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        padding: "16px 18px",
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
  const reviewQueue = REVIEW_ITEMS;
  const accountIssues = ACCOUNTS.filter((account) => account.status !== "active");
  const recurringToVerify = SUBSCRIPTIONS.filter((subscription) => subscription.confidence < 0.97 || subscription.status !== "active");
  const highestCostSubscriptions = [...SUBSCRIPTIONS]
    .sort((a, b) => monthlyEquivalent(b) - monthlyEquivalent(a))
    .slice(0, 5);
  const merchantChecks = TRANSACTIONS.filter(
    (transaction) => transaction.amountOere < 0 && !transaction.isSubscription && transaction.category !== "Transfer",
  )
    .sort((a, b) => Math.abs(b.amountOere) - Math.abs(a.amountOere))
    .slice(0, 5);
  const possibleMonthlySavings = highestCostSubscriptions
    .filter((subscription) => ["Adobe CC", "Disney+"].includes(subscription.merchant))
    .reduce((sum, subscription) => sum + monthlyEquivalent(subscription), 0);

  return (
    <div className="page-wrap">
      <PageHeader
        title="Gennemgå"
        subtitle="Ryd op i faste udgifter, datakilder og klassificeringer, så resten af appen bliver mere troværdig."
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
            <ScanSearch size={13} />
            Ugentlig rutine
          </div>
        }
      />

      <div className="animate-fade-up anim-1 grid-4" style={{ marginBottom: 24 }}>
        <KpiCard
          label="Klar til gennemgang"
          value={`${reviewQueue.length}`}
          rawValue={reviewQueue.length}
          formatFn={(value) => `${Math.round(value)}`}
          sub="kræver stillingtagen"
          accent
        />
        <KpiCard
          label="Mulig besparelse"
          value={formatDKK(possibleMonthlySavings)}
          rawValue={possibleMonthlySavings}
          formatFn={(value) => formatDKK(Math.round(value))}
          sub="månedligt potentiale"
        />
        <KpiCard
          label="Konti at tjekke"
          value={`${accountIssues.length}`}
          rawValue={accountIssues.length}
          formatFn={(value) => `${Math.round(value)}`}
          sub="forbindelser uden fuld tillid"
        />
        <KpiCard
          label="Faste poster at vurdere"
          value={`${recurringToVerify.length}`}
          rawValue={recurringToVerify.length}
          formatFn={(value) => `${Math.round(value)}`}
          sub="lav tillid eller ikke-aktive"
        />
      </div>

      <div className="animate-fade-up anim-2 grid-main" style={{ marginBottom: 24 }}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Start med dette</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                De ting der giver mest tillid tilbage til forecast, kategorier og faste omkostninger.
              </div>
            </div>
          </CardHeader>
          <CardBody style={{ paddingTop: 4, paddingBottom: 4 }}>
            {reviewQueue.map((item) => (
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
                    background: item.severity === "high" ? "rgba(204,51,20,0.08)" : "var(--surface-2)",
                    border: `1px solid ${item.severity === "high" ? "rgba(204,51,20,0.12)" : "var(--border)"}`,
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
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>{item.description}</div>
                </div>
                <Link
                  href={item.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12.5,
                    color: "var(--accent)",
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  {item.cta} <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Faste udgifter</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Start med de største poster og alt det, systemet er mindst sikker på.
              </div>
            </div>
            <Link href="/subscriptions" style={{ fontSize: 12.5, color: "var(--accent)", textDecoration: "none" }}>
              Se alle →
            </Link>
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
                    borderRadius: 18,
                    padding: "14px 16px",
                  }}
                >
                  <MerchantLogo domain={subscription.domain} merchant={subscription.merchant} size={38} radius={10} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{subscription.merchant}</span>
                      <Badge variant={subscription.status === "active" ? "monthly" : subscription.status === "paused" ? "paused" : "cancelled"}>
                        {subscription.status === "active" ? "aktiv" : subscription.status === "paused" ? "pause" : "annulleret"}
                      </Badge>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                      Sikkerhed {Math.round(subscription.confidence * 100)}% · {subscription.category}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="num" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                      {formatDKK(monthly)}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Badge variant={confidenceVariant}>{Math.round(subscription.confidence * 100)}% sikker</Badge>
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
              <CardTitle>Køb der bør tjekkes</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Større eller atypiske køb, som er værd at forstå bedre eller kategorisere skarpere.
              </div>
            </div>
            <Link href="/transactions" style={{ fontSize: 12.5, color: "var(--accent)", textDecoration: "none" }}>
              Se poster →
            </Link>
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
                    {new Date(transaction.date).toLocaleDateString("da-DK", { day: "numeric", month: "short" })} · {transaction.category}
                  </div>
                </div>
                <div className="num" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                  {formatDKK(transaction.amountOere)}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Datakvalitet</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Forbindelser og regler der afgør, om resten af appen er til at stole på.
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
                  borderRadius: 18,
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
                  Sidst opdateret {account.lastSynced}. Forecast og spending-analyser bliver svagere uden en aktiv forbindelse.
                </div>
              </div>
            ))}

            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 18, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Sparkles size={14} color="var(--text-muted)" />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>Regelhygiejne</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                Interne overførsler bør skjules fra spend view, så budgetter og review-køen bliver mere præcise.
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
              <CardTitle>Fortsæt i detaljen</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="grid-3">
            <ReviewAction
              href="/subscriptions"
              title="Skær i faste udgifter"
              description="Gå direkte til abonnementer og beslut hvad der skal væk, pauses eller genforhandles."
            />
            <ReviewAction
              href="/transactions?review=transfer"
              title="Gennemgå klassificeringer"
              description="Start med interne overførsler og merchant-tjek i en fokuseret gennemgangsvisning."
            />
            <ReviewAction
              href="/accounts?focus=reconnect&account=acc-4"
              title="Genopret datakilder"
              description="Sørg for at konti og forbindelser er ajour, før du bruger tallene andre steder."
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
