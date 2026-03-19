"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, CalendarClock, Target, Wallet } from "lucide-react";
import Link from "next/link";
import {
  BUDGETS,
  buildCashFlowForecast,
  formatAxisDKK,
  formatDKK,
  formatPct,
  getDaysBetween,
  getUpcomingCashFlow,
  GOALS,
  MOCK_TODAY,
  TRANSACTIONS,
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

type BudgetRow = {
  id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  ratio: number;
  essential: boolean;
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
      <div className="num" style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
        {formatDKK(point.balanceOere)}
      </div>
      <div style={{ marginTop: 4, fontSize: 11.5, color: point.deltaOere >= 0 ? "var(--green)" : "var(--red)" }}>
        {point.deltaOere > 0 ? "+" : ""}
        {formatDKK(point.deltaOere)} den dag
      </div>
    </div>
  );
}

function PlanningLink({
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

export function PlanPage() {
  const forecast = buildCashFlowForecast(45);
  const forecastLowPoint = forecast.reduce((lowest, point) =>
    point.balanceOere < lowest.balanceOere ? point : lowest,
  );
  const projectedMonthEnd = forecast[forecast.length - 1]?.balanceOere ?? 0;
  const upcoming30Days = getUpcomingCashFlow(30);
  const totalUpcomingOutflows = upcoming30Days
    .filter((event) => event.amountOere < 0)
    .reduce((sum, event) => sum + Math.abs(event.amountOere), 0);
  const totalUpcomingIncome = upcoming30Days
    .filter((event) => event.amountOere > 0)
    .reduce((sum, event) => sum + event.amountOere, 0);

  const monthPrefix = MOCK_TODAY.slice(0, 7);
  const monthExpenses = TRANSACTIONS.filter(
    (transaction) => transaction.date.startsWith(monthPrefix) && transaction.amountOere < 0 && transaction.category !== "Transfer",
  );

  const budgetRows: BudgetRow[] = BUDGETS.map((budget) => {
    const spent = monthExpenses
      .filter((transaction) =>
        budget.category === "Subscriptions" ? transaction.isSubscription : transaction.category === budget.category,
      )
      .reduce((sum, transaction) => sum + Math.abs(transaction.amountOere), 0);

    return {
      id: budget.id,
      category: budget.category,
      limit: budget.monthlyLimitOere,
      spent,
      remaining: Math.max(budget.monthlyLimitOere - spent, 0),
      ratio: budget.monthlyLimitOere > 0 ? spent / budget.monthlyLimitOere : 0,
      essential: Boolean(budget.essential),
    };
  }).sort((a, b) => b.ratio - a.ratio);

  const spentThisMonth = budgetRows.reduce((sum, row) => sum + row.spent, 0);
  const totalBudgetLimit = budgetRows.reduce((sum, row) => sum + row.limit, 0);
  const totalBudgetLeft = Math.max(totalBudgetLimit - spentThisMonth, 0);
  const monthlyGoalContribution = GOALS.reduce((sum, goal) => sum + goal.monthlyContributionOere, 0);
  const forecastChart = forecast.filter((_, index) => index % 3 === 0 || index === forecast.length - 1);

  return (
    <div className="page-wrap">
      <PageHeader
        title="Plan"
        subtitle="Tag stilling til resten af måneden, før pengene bestemmer for dig."
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
            <CalendarClock size={13} />
            45 dage
          </div>
        }
      />

      <div className="animate-fade-up anim-1 grid-4" style={{ marginBottom: 24 }}>
        <KpiCard
          label="Forventet ved månedsslut"
          value={formatDKK(projectedMonthEnd)}
          rawValue={projectedMonthEnd}
          formatFn={(value) => formatDKK(Math.round(value))}
          sub="på lønkonto og drift"
          accent
        />
        <KpiCard
          label="Tilbage i budget"
          value={formatDKK(totalBudgetLeft)}
          rawValue={totalBudgetLeft}
          formatFn={(value) => formatDKK(Math.round(value))}
          sub={`${((spentThisMonth / totalBudgetLimit) * 100).toFixed(1)}% brugt`}
        />
        <KpiCard
          label="Kommende træk"
          value={formatDKK(totalUpcomingOutflows)}
          rawValue={totalUpcomingOutflows}
          formatFn={(value) => formatDKK(Math.round(value))}
          sub="næste 30 dage"
        />
        <KpiCard
          label="Til mål denne måned"
          value={formatDKK(monthlyGoalContribution)}
          rawValue={monthlyGoalContribution}
          formatFn={(value) => formatDKK(Math.round(value))}
          sub={`${GOALS.length} aktive mål`}
        />
      </div>

      <div className="animate-fade-up anim-2 grid-main" style={{ marginBottom: 24 }}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Likviditetsplan</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Brug forecastet til at se hvornår måneden strammer til, og hvor der stadig er luft.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Wallet size={13} color="var(--accent)" />
              <span className="num" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
                {formatDKK(projectedMonthEnd)}
              </span>
            </div>
          </CardHeader>
          <CardBody style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={280} className="chart-tall">
              <AreaChart data={forecastChart} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="planForecastFill" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#planForecastFill)"
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
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Planlagte indbetalinger</div>
                <div className="num" style={{ fontSize: 18, fontWeight: 600, color: "var(--green)" }}>
                  +{formatDKK(totalUpcomingIncome)}
                </div>
                <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-secondary)" }}>
                  {upcoming30Days.filter((event) => event.amountOere > 0).length} events kommende
                </div>
              </div>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 18, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Plads i budgettet</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
                  {totalBudgetLeft > 0 ? "Der er luft" : "På grænsen"}
                </div>
                <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-secondary)" }}>
                  {formatDKK(totalBudgetLeft)} tilbage af månedsbudgettet
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Kommende hændelser</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Det der allerede ligger i kalenderen og vil trække eller løfte saldoen.
              </div>
            </div>
          </CardHeader>
          <CardBody style={{ paddingTop: 4, paddingBottom: 4 }}>
            {upcoming30Days.slice(0, 8).map((event) => {
              const daysAway = getDaysBetween(MOCK_TODAY, event.date);
              const variant =
                event.type === "income" ? "active" : event.type === "subscription" ? "monthly" : event.essential ? "paused" : "yearly";

              return (
                <div
                  key={event.id}
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
            })}
          </CardBody>
        </Card>
      </div>

      <div className="animate-fade-up anim-3" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Budgetforløb</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Se hvilke kategorier der æder fleksibiliteten først, så du kan reagere tidligt.
              </div>
            </div>
            <Link href="/spending" style={{ fontSize: 12.5, color: "var(--accent)", textDecoration: "none" }}>
              Se forbrug →
            </Link>
          </CardHeader>
          <CardBody style={{ display: "grid", gap: 14 }}>
            {budgetRows.map((row, index) => {
              const width = `${Math.min(row.ratio, 1) * 100}%`;
              const overBudget = row.spent > row.limit;

              return (
                <div key={row.id}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{row.category}</span>
                      {row.essential ? <Badge variant="active">Fast</Badge> : null}
                    </div>
                    <div className="num" style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                      {formatDKK(row.spent)} / {formatDKK(row.limit)}
                    </div>
                  </div>
                  <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
                    <div
                      className="progress-bar-animated"
                      style={{
                        "--target-w": width,
                        "--bar-delay": `${120 + index * 40}ms`,
                        background: overBudget ? "var(--red)" : row.ratio > 0.8 ? "#C8842C" : "var(--accent)",
                      } as React.CSSProperties}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 6, fontSize: 11.5, color: "var(--text-muted)" }}>
                    <span>{overBudget ? "Over budget" : `${(row.ratio * 100).toFixed(1)}% brugt`}</span>
                    <span>{formatDKK(Math.max(row.limit - row.spent, 0))} tilbage</span>
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Mål</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Sørg for at månedens plan også flytter på dine længere mål.
              </div>
            </div>
          </CardHeader>
          <CardBody style={{ display: "grid", gap: 14 }}>
            {GOALS.map((goal, index) => {
              const progress = goal.currentOere / goal.targetOere;
              const accent =
                goal.theme === "safety" ? "var(--green)" : goal.theme === "investing" ? "#C8842C" : "var(--accent)";

              return (
                <div key={goal.id} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 18, padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{goal.name}</div>
                      <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-muted)" }}>
                        Mål dato {formatLongDate(goal.targetDate)}
                      </div>
                    </div>
                    <Badge variant={goal.theme === "safety" ? "active" : goal.theme === "investing" ? "yearly" : "monthly"}>
                      {goal.theme === "safety" ? "Sikkerhed" : goal.theme === "investing" ? "Investering" : "Opsparing"}
                    </Badge>
                  </div>
                  <div className="num" style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>
                    {formatDKK(goal.currentOere)} / {formatDKK(goal.targetOere)}
                  </div>
                  <div style={{ height: 8, background: "rgba(0,0,0,0.05)", borderRadius: 999, overflow: "hidden" }}>
                    <div
                      className="progress-bar-animated"
                      style={{
                        "--target-w": `${Math.min(progress, 1) * 100}%`,
                        "--bar-delay": `${180 + index * 60}ms`,
                        background: accent,
                      } as React.CSSProperties}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 8, fontSize: 11.5, color: "var(--text-secondary)" }}>
                    <span>{formatPct(progress * 100)} nået</span>
                    <span className="num">+{formatDKK(goal.monthlyContributionOere)}/md</span>
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <div className="animate-fade-up anim-4">
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={14} color="var(--text-muted)" />
              <CardTitle>Fortsæt i detaljen</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="grid-3">
            <PlanningLink
              href="/accounts"
              eyebrow="Kontostruktur"
              title="Tjek konti og forbindelser"
              description="Sørg for at pengene ligger rigtigt, og at alle datakilder faktisk er aktive."
            />
            <PlanningLink
              href="/spending"
              eyebrow="Budgetdetaljer"
              title="Åbn kategori-forbrug"
              description="Gå fra overblik til konkrete kategorier og merchants, der presser planen."
            />
            <PlanningLink
              href="/subscriptions"
              eyebrow="Faste træk"
              title="Gennemgå abonnementer"
              description="Se hvilke tilbagevendende træk der bør med i næste måneds beslutninger."
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
