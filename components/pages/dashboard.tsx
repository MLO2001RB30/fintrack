"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CreditCard,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import {
  ACCOUNTS,
  BUDGETS,
  buildCashFlowForecast,
  formatAxisDKK,
  formatChange,
  formatDKK,
  formatPct,
  getCheckingBalanceTotal,
  getDaysBetween,
  getUpcomingCashFlow,
  GOALS,
  MOCK_TODAY,
  NET_WORTH_CHANGE,
  NET_WORTH_PCT,
  REVIEW_ITEMS,
  SUBSCRIPTIONS,
  TRANSACTIONS,
  type CashFlowEvent,
  type CashFlowForecastPoint,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";

type ForecastTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: CashFlowForecastPoint }>;
  label?: string;
};

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("da-DK", { day: "numeric", month: "short" });
}

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("da-DK", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function ForecastTooltip({ active, payload, label }: ForecastTooltipProps) {
  if (!active || !payload?.length || !label) return null;

  const point = payload[0].payload;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "12px 14px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div style={{ marginBottom: 6, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {formatLongDate(label)}
      </div>
      <div className="num" style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
        {formatDKK(point.balanceOere)}
      </div>
      <div style={{ fontSize: 11.5, color: point.deltaOere >= 0 ? "var(--green)" : "var(--red)" }}>
        {point.deltaOere > 0 ? "+" : ""}
        {formatDKK(point.deltaOere)} den dag
      </div>
    </div>
  );
}

function CashEventRow({ event }: { event: CashFlowEvent }) {
  const daysAway = getDaysBetween(MOCK_TODAY, event.date);
  const variant =
    event.type === "income" ? "active" : event.type === "subscription" ? "monthly" : event.essential ? "paused" : "yearly";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "12px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>{event.merchant}</span>
          <Badge variant={variant} size="sm">
            {event.type === "income" ? "Indkomst" : event.type === "subscription" ? "Abonnement" : event.label}
          </Badge>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
          {formatLongDate(event.date)} · {daysAway === 0 ? "i dag" : daysAway === 1 ? "i morgen" : `om ${daysAway} dage`}
        </div>
      </div>
      <div className="num" style={{ fontSize: 13.5, fontWeight: 600, color: event.amountOere > 0 ? "var(--green)" : "var(--text-primary)" }}>
        {event.amountOere > 0 ? "+" : ""}
        {formatDKK(event.amountOere)}
      </div>
    </div>
  );
}

function QuickJump({
  href,
  eyebrow,
  title,
  description,
}: {
  href: string;
  eyebrow: string;
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
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{eyebrow}</div>
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

export function Dashboard() {
  const today = new Date(MOCK_TODAY);
  const activeAccounts = ACCOUNTS.filter((account) => account.status === "active");
  const expiredAccounts = ACCOUNTS.filter((account) => account.status === "expired");
  const checkingBalance = getCheckingBalanceTotal();
  const forecast = buildCashFlowForecast(21);
  const projectedThreeWeeks = forecast[forecast.length - 1]?.balanceOere ?? checkingBalance;
  const forecastLowPoint = forecast.reduce((lowest, point) =>
    point.balanceOere < lowest.balanceOere ? point : lowest,
  );
  const upcoming7Days = getUpcomingCashFlow(7);
  const upcoming14Days = getUpcomingCashFlow(14);
  const next7DayOutflows = upcoming7Days
    .filter((event) => event.amountOere < 0)
    .reduce((sum, event) => sum + Math.abs(event.amountOere), 0);
  const next14DayIncome = upcoming14Days
    .filter((event) => event.amountOere > 0)
    .reduce((sum, event) => sum + event.amountOere, 0);
  const next14DayOutflows = upcoming14Days
    .filter((event) => event.amountOere < 0)
    .reduce((sum, event) => sum + Math.abs(event.amountOere), 0);
  const emergencyBuffer = 25_000_00;
  const safeToSpend = Math.max(checkingBalance + next14DayIncome - next14DayOutflows - emergencyBuffer, 0);
  const reviewCount = REVIEW_ITEMS.length;
  const recurringToVerify = SUBSCRIPTIONS.filter((subscription) => subscription.confidence < 0.97 || subscription.status !== "active");
  const highestSubscription = [...SUBSCRIPTIONS]
    .filter((subscription) => subscription.status === "active")
    .sort((a, b) => b.amountOere - a.amountOere)[0];
  const expenseTransactions = TRANSACTIONS.filter(
    (transaction) => transaction.amountOere < 0 && transaction.category !== "Transfer",
  );
  const topCategory = Object.entries(
    expenseTransactions.reduce<Record<string, number>>((acc, transaction) => {
      const key = transaction.isSubscription ? "Subscriptions" : transaction.category;
      acc[key] = (acc[key] ?? 0) + Math.abs(transaction.amountOere);
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1])[0];
  const monthPrefix = MOCK_TODAY.slice(0, 7);
  const monthlyExpenses = TRANSACTIONS.filter(
    (transaction) => transaction.date.startsWith(monthPrefix) && transaction.amountOere < 0 && transaction.category !== "Transfer",
  );
  const totalBudgetLimit = BUDGETS.reduce((sum, budget) => sum + budget.monthlyLimitOere, 0);
  const spentAgainstBudget = monthlyExpenses.reduce((sum, transaction) => sum + Math.abs(transaction.amountOere), 0);
  const goalContribution = GOALS.reduce((sum, goal) => sum + goal.monthlyContributionOere, 0);
  const weekdayLabel = today.toLocaleDateString("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const forecastChart = forecast.filter((_, index) => index % 2 === 0 || index === forecast.length - 1);
  const netWorthUp = NET_WORTH_CHANGE >= 0;

  const priorities = [
    ...(expiredAccounts.length > 0
      ? [
          {
            icon: <ShieldAlert size={16} />,
            title: `${expiredAccounts.length} forbindelse${expiredAccounts.length > 1 ? "r" : ""} kræver handling`,
            description: `${expiredAccounts.map((account) => account.institution).join(", ")} er udløbet og svækker dit daglige cash view.`,
            href: "/review",
            cta: "Åbn",
          },
        ]
      : []),
    {
      icon: <CalendarClock size={16} />,
      title: `${formatDKK(next7DayOutflows)} går ud de næste 7 dage`,
      description: "Tjek at lønkontoen kan bære de planlagte træk, før de rammer.",
      href: "/plan",
      cta: "Se plan",
    },
    {
      icon: <CreditCard size={16} />,
      title: highestSubscription ? `${highestSubscription.merchant} er stadig tungeste abonnement` : "Ingen abonnementer kræver fokus",
      description: highestSubscription
        ? `${formatDKK(highestSubscription.amountOere)}/md er den største faste post at udfordre.`
        : "Din recurring stack ser slank ud lige nu.",
      href: "/review",
      cta: "Gennemgå",
    },
  ].slice(0, 3);

  return (
    <div className="page-wrap">
      <PageHeader
        title="Overblik"
        subtitle={`Det vigtigste lige nu pr. ${weekdayLabel}`}
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
            title="Hurtigt dagligt fokus med næste skridt"
          >
            <Sparkles size={13} />
            Fokus i dag
          </div>
        }
      />

      {expiredAccounts.length > 0 ? (
        <div
          className="animate-fade-up anim-1"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            background: "rgba(204,51,20,0.08)",
            border: "1px solid rgba(204,51,20,0.16)",
            borderRadius: 18,
            marginBottom: 24,
            fontSize: 13,
            color: "var(--red)",
          }}
        >
          <AlertCircle size={14} />
          <span>
            <strong>{expiredAccounts.map((account) => account.institution).join(", ")}</strong> er udløbet. Gennemgå bør være første stop, før du
            stoler helt på forecastet.
          </span>
        </div>
      ) : null}

      <div className="animate-fade-up anim-2 grid-4" style={{ marginBottom: 24 }}>
        <KpiCard
          label="Trygt at bruge"
          value={formatDKK(safeToSpend)}
          rawValue={safeToSpend}
          formatFn={(value) => formatDKK(Math.round(value))}
          sub={`buffer på ${formatDKK(emergencyBuffer)}`}
          accent
        />
        <KpiCard
          label="Næste 7 dage"
          value={formatDKK(next7DayOutflows)}
          rawValue={next7DayOutflows}
          formatFn={(value) => formatDKK(Math.round(value))}
          sub={`${upcoming7Days.filter((event) => event.amountOere < 0).length} planlagte træk`}
        />
        <KpiCard
          label="Formuetrend"
          value={formatChange(NET_WORTH_CHANGE)}
          rawValue={NET_WORTH_CHANGE}
          formatFn={(value) => formatChange(Math.round(value))}
          sub={formatPct(NET_WORTH_PCT)}
        />
        <KpiCard
          label="Kø at rydde"
          value={`${reviewCount}`}
          rawValue={reviewCount}
          formatFn={(value) => `${Math.round(value)}`}
          sub={`${recurringToVerify.length} recurring checks`}
        />
      </div>

      <div className="animate-fade-up anim-3 grid-main" style={{ marginBottom: 24 }}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Start her</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                De få ting der flytter mest de næste dage.
              </div>
            </div>
          </CardHeader>
          <CardBody style={{ paddingTop: 4, paddingBottom: 4 }}>
            {priorities.map((item) => (
              <div
                key={item.title}
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
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{item.title}</div>
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
              <CardTitle>Næste bevægelser</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Hvad der rammer kontoen først den kommende uge.
              </div>
            </div>
            <Link href="/plan" style={{ fontSize: 12.5, color: "var(--accent)", textDecoration: "none" }}>
              Se plan →
            </Link>
          </CardHeader>
          <CardBody style={{ paddingTop: 4, paddingBottom: 4 }}>
            {upcoming7Days.slice(0, 5).map((event) => (
              <CashEventRow key={event.id} event={event} />
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="animate-fade-up anim-4" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Likviditet næste 3 uger</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Et kort forecast, så du ser lavpunktet før det bliver et problem.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Wallet size={13} color="var(--accent)" />
              <span className="num" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
                {formatDKK(projectedThreeWeeks)}
              </span>
            </div>
          </CardHeader>
          <CardBody style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={250} className="chart-tall">
              <AreaChart data={forecastChart} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="homeForecastFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5749F4" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#5749F4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 10.5, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatAxisDKK}
                  tick={{ fontSize: 10.5, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ForecastTooltip />} />
                <Area
                  type="monotone"
                  dataKey="balanceOere"
                  stroke="#5749F4"
                  strokeWidth={2.5}
                  fill="url(#homeForecastFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#5749F4", stroke: "var(--surface-1)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="grid-3" style={{ marginTop: 16 }}>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 18, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Lavpunkt</div>
                <div className="num" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
                  {formatDKK(forecastLowPoint.balanceOere)}
                </div>
                <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-secondary)" }}>{formatLongDate(forecastLowPoint.date)}</div>
              </div>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 18, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Største kategori</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{topCategory?.[0] ?? "Ingen data"}</div>
                <div className="num" style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-secondary)" }}>
                  {topCategory ? formatDKK(topCategory[1]) : "—"}
                </div>
              </div>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 18, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Datadækning</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: activeAccounts.length === ACCOUNTS.length ? "var(--green)" : "var(--text-primary)" }}>
                  {activeAccounts.length}/{ACCOUNTS.length} aktive
                </div>
                <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-secondary)" }}>
                  {expiredAccounts.length > 0 ? `${expiredAccounts.length} skal reconnectes` : "Alle feeds er sunde"}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Vælg næste arbejdsspor</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Gå videre til planlægning eller oprydning, ikke flere dashboards oven på hinanden.
              </div>
            </div>
          </CardHeader>
          <CardBody style={{ display: "grid", gap: 14 }}>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 18, padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Target size={14} color="var(--text-muted)" />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>Plan lige nu</span>
              </div>
              <div className="num" style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
                {formatDKK(Math.max(totalBudgetLimit - spentAgainstBudget, 0))}
              </div>
              <div style={{ marginTop: 6, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                {formatPct((spentAgainstBudget / totalBudgetLimit) * 100)} af budgettet er brugt · {formatDKK(goalContribution)}/md går til mål.
              </div>
              <Link href="/plan" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, color: "var(--accent)", textDecoration: "none", fontSize: 12.5 }}>
                Åbn plan <ArrowRight size={12} />
              </Link>
            </div>

            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 18, padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {netWorthUp ? <TrendingUp size={14} color="var(--green)" /> : <TrendingDown size={14} color="var(--red)" />}
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>Gennemgå lige nu</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>{reviewCount} ting venter</div>
              <div style={{ marginTop: 6, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                {recurringToVerify.length} abonnementer skal vurderes, og {expiredAccounts.length} konto{expiredAccounts.length === 1 ? "" : "er"} skal tjekkes.
              </div>
              <Link href="/review" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, color: "var(--accent)", textDecoration: "none", fontSize: 12.5 }}>
                Åbn gennemgang <ArrowRight size={12} />
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="animate-fade-up anim-5">
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={14} color="var(--text-muted)" />
              <CardTitle>Gå dybere</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="grid-3">
            <QuickJump
              href="/plan"
              eyebrow="Planlæg"
              title="Arbejd med likviditet og budget"
              description="Gå til månedens beslutninger uden støj fra oprydningsopgaver."
            />
            <QuickJump
              href="/review"
              eyebrow="Ryd op"
              title="Gennemgå det der kræver tillid"
              description="Abonnementer, merchants og forbindelser samlet i én arbejdsflade."
            />
            <QuickJump
              href="/transactions"
              eyebrow="Undersøg"
              title="Se de konkrete posteringer"
              description="Brug den rå liste, når noget i overblikket ser forkert eller usikkert ud."
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
