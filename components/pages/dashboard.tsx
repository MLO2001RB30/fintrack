"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, AlertCircle, Calendar, CreditCard } from "lucide-react";
import {
  ACCOUNTS,
  SUBSCRIPTIONS,
  NET_WORTH_HISTORY,
  NET_WORTH_NOW,
  NET_WORTH_CHANGE,
  NET_WORTH_PCT,
  MONTHLY_BURN,
  formatDKK,
  formatAxisDKK,
  formatChange,
  formatPct,
  monthlyEquivalent,
  toBaseDKKOere,
  HOLDINGS,
  TOTAL_CASH,
} from "@/lib/mock-data";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import Link from "next/link";

// ─── Chart tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "12px 16px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <p style={{ margin: "0 0 8px", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {new Date(label).toLocaleDateString("da-DK", { day: "numeric", month: "short" })}
      </p>
      <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
        {formatDKK(d.total)}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 8 }}>
        {[
          { label: "Bank", value: d.bank, color: "#D97706" },
          { label: "Investments", value: d.investments, color: "#4F46E5" },
          { label: "Cash", value: d.cash, color: "#059669" },
        ].map(r => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: 20, fontSize: 11 }}>
            <span style={{ color: r.color }}>{r.label}</span>
            <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{formatDKK(r.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Account row ─────────────────────────────────────────────────────────────
function AccountRow({ account }: { account: (typeof ACCOUNTS)[0] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <MerchantLogo domain={account.domain} merchant={account.institution} size={34} radius={8} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {account.institution}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{account.accountName}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="num" style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>
          {formatDKK(account.balanceOere)}
        </div>
        {account.status === "expired" ? (
          <div style={{ fontSize: 11, color: "var(--red)", display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
            <AlertCircle size={10} /> Expired
          </div>
        ) : (
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{account.lastSynced}</div>
        )}
      </div>
    </div>
  );
}

// ─── Subscription row ─────────────────────────────────────────────────────────
function SubRow({ sub }: { sub: (typeof SUBSCRIPTIONS)[0] }) {
  const monthly = monthlyEquivalent(sub);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <MerchantLogo domain={sub.domain} merchant={sub.merchant} size={32} radius={8} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{sub.merchant}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{sub.category}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="num" style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>
          {formatDKK(monthly)}<span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 2 }}>/md</span>
        </div>
        <Badge variant={sub.cadence} size="sm">
          {sub.cadence === "monthly" ? "Månedlig" : sub.cadence === "quarterly" ? "Kvartalsvis" : "Årlig"}
        </Badge>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Dashboard() {
  const topSubs = [...SUBSCRIPTIONS]
    .filter(s => s.status === "active")
    .sort((a, b) => monthlyEquivalent(b) - monthlyEquivalent(a))
    .slice(0, 5);

  const totalInvestments = HOLDINGS.reduce(
    (sum, h) => sum + toBaseDKKOere(h.currentPriceMinor * h.quantity, h.currency),
    0
  );
  const totalBank = ACCOUNTS.filter(a => a.status === "active").reduce((s, a) => s + a.balanceOere, 0);
  const up = NET_WORTH_CHANGE >= 0;

  // Chart data — show weekly labels
  const chartData = NET_WORTH_HISTORY.filter((_, i) => i % 3 === 0);

  const expiredAccounts = ACCOUNTS.filter(a => a.status === "expired");

  return (
    <div style={{ padding: "32px 36px", position: "relative", zIndex: 1 }}>
      <PageHeader
        title="Dashboard"
        subtitle={`${new Date().toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
        action={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12.5,
              color: "var(--text-muted)",
              cursor: "default",
              userSelect: "none",
              opacity: 0.8,
            }}
            title="Datofiltrering kommer snart"
          >
            <Calendar size={13} />
            Seneste 90 dage
          </div>
        }
      />

      {/* Expired account banner */}
      {expiredAccounts.length > 0 && (
        <div
          className="animate-fade-up anim-1"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.22)",
            borderRadius: 10,
            marginBottom: 24,
            fontSize: 13,
            color: "#F87171",
          }}
        >
          <AlertCircle size={14} />
          <span>
            <strong>{expiredAccounts.map(a => a.institution).join(", ")}</strong> — bankforbindelsen er udløbet.{" "}
            <Link href="/accounts" style={{ color: "var(--accent)", textDecoration: "underline" }}>
              Genopret forbindelsen
            </Link>
          </span>
        </div>
      )}

      {/* KPI row */}
      <div
        className="animate-fade-up anim-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <KpiCard
          label="Samlet formue"
          value={formatDKK(NET_WORTH_NOW.total)}
          change={`${formatChange(NET_WORTH_CHANGE)} (${formatPct(NET_WORTH_PCT)})`}
          changePositive={up}
          sub="seneste 90 dage"
          accent
        />
        <KpiCard
          label="Bankkonti"
          value={formatDKK(totalBank)}
          sub={`${ACCOUNTS.filter(a => a.status === "active").length} konti tilsluttet`}
        />
        <KpiCard
          label="Investeringer"
          value={formatDKK(totalInvestments)}
          sub={`${HOLDINGS.length} beholdninger`}
        />
        <KpiCard
          label="Månedligt abonnementsforbrug"
          value={formatDKK(MONTHLY_BURN)}
          sub={`${SUBSCRIPTIONS.filter(s => s.status === "active").length} aktive abonnementer`}
        />
      </div>

      {/* Net worth chart + accounts */}
      <div
        className="animate-fade-up anim-3"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Formueudvikling</CardTitle>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {up ? <TrendingUp size={13} color="var(--green)" /> : <TrendingDown size={13} color="var(--red)" />}
              <span className="num" style={{ fontSize: 12, color: up ? "var(--green)" : "var(--red)" }}>
                {formatChange(NET_WORTH_CHANGE)} ({formatPct(NET_WORTH_PCT)})
              </span>
            </div>
          </CardHeader>
          <CardBody style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0D9373" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#0D9373" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={d => new Date(d).toLocaleDateString("da-DK", { day: "numeric", month: "short" })}
                  tick={{ fontSize: 10.5, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  interval={7}
                />
                <YAxis
                  tickFormatter={v => formatAxisDKK(v)}
                  tick={{ fontSize: 10.5, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#0D9373"
                  strokeWidth={2}
                  fill="url(#gradTotal)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#0D9373", stroke: "var(--surface-1)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Bankkonti</CardTitle>
            <Link href="/accounts" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>
              Se alle →
            </Link>
          </CardHeader>
          <CardBody style={{ paddingTop: 4, paddingBottom: 4 }}>
            {ACCOUNTS.map(a => (
              <AccountRow key={a.id} account={a} />
            ))}
            <div
              className="num"
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0 2px",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              <span>Aktive konti</span>
              <span>{formatDKK(ACCOUNTS.filter(a => a.status === "active").reduce((s, a) => s + a.balanceOere, 0))}</span>
            </div>
            {ACCOUNTS.some(a => a.status === "expired") && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  padding: "0 0 6px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertCircle size={10} color="var(--red)" />
                  <span style={{ color: "var(--red)" }}>
                    {ACCOUNTS.filter(a => a.status === "expired").map(a => a.institution).join(", ")} (udløbet — ikke medregnet)
                  </span>
                </span>
                <span style={{ color: "var(--text-muted)" }}>
                  {formatDKK(ACCOUNTS.filter(a => a.status === "expired").reduce((s, a) => s + a.balanceOere, 0))}
                </span>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Subscriptions */}
      <div className="animate-fade-up anim-4">
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CreditCard size={14} color="var(--text-muted)" />
              <CardTitle>Top abonnementer</CardTitle>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                Total:{" "}
                <span className="num" style={{ color: "var(--accent)", fontWeight: 600 }}>
                  {formatDKK(MONTHLY_BURN)}/md
                </span>
              </div>
              <Link href="/subscriptions" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>
                Se alle →
              </Link>
            </div>
          </CardHeader>
          <CardBody style={{ padding: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
              {topSubs.map((sub, i) => {
                const monthly = monthlyEquivalent(sub);
                const pct = (monthly / MONTHLY_BURN) * 100;
                return (
                  <Link
                    key={sub.id}
                    href={`/subscriptions#${sub.id}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      padding: "16px 20px",
                      textDecoration: "none",
                      borderRight: i < 4 ? "1px solid var(--border)" : "none",
                      transition: "background 120ms",
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--hover-bg)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
                  >
                    <MerchantLogo domain={sub.domain} merchant={sub.merchant} size={36} radius={9} />
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                      {sub.merchant}
                    </div>
                    <div className="num" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                      {formatDKK(monthly)}
                      <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 2 }}>/md</span>
                    </div>
                    {/* Mini bar */}
                    <div style={{ height: 3, background: "var(--surface-3)", borderRadius: 2, marginTop: 2 }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: "var(--accent)",
                          borderRadius: 2,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{pct.toFixed(0)}% af forbrug</div>
                  </Link>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
