"use client";

import { useState } from "react";
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
import { FIGMA_METRIC_FONT_STACK } from "@/lib/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function addMonthsToIso(iso: string, months: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
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
      className="font-metric"
      style={{
        background: "var(--tooltip-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "12px 14px",
        boxShadow: "var(--shadow-md)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div style={{ marginBottom: 6, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {formatLongDate(label)}
      </div>
      <div className="font-metric" style={{ fontSize: 20, fontWeight: 400, color: "var(--grey-900)" }}>
        {formatDKK(point.balanceOere)}
      </div>
      <div style={{ marginTop: 4, fontSize: 11.5, color: point.deltaOere >= 0 ? "var(--green)" : "var(--red)" }}>
        {point.deltaOere > 0 ? "+" : ""}
        {formatDKK(point.deltaOere)} that day
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
        background: "#ffffff",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "16px 18px",
        boxShadow: "var(--shadow-sm)",
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
  const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>(() =>
    Object.fromEntries(BUDGETS.map((budget) => [budget.id, budget.monthlyLimitOere])),
  );
  const [goalBoosts, setGoalBoosts] = useState<Record<string, number>>(() =>
    Object.fromEntries(GOALS.map((goal) => [goal.id, 0])),
  );
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
    const limit = budgetLimits[budget.id] ?? budget.monthlyLimitOere;

    return {
      id: budget.id,
      category: budget.category,
      limit,
      spent,
      remaining: Math.max(limit - spent, 0),
      ratio: limit > 0 ? spent / limit : 0,
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
        subtitle="Look ahead before the rest of the month decides for you."
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
            45 days
          </div>
        }
      />

      <div className="animate-fade-up anim-1 grid-4" style={{ marginBottom: 24 }}>
        <KpiCard
          label="Projected month end"
          value={formatDKK(projectedMonthEnd)}
          rawValue={projectedMonthEnd}
          formatFn={(value) => formatDKK(Math.round(value))}
          sub="operating cash on hand"
          accent
        />
        <KpiCard
          label="Budget left"
          value={formatDKK(totalBudgetLeft)}
          rawValue={totalBudgetLeft}
          formatFn={(value) => formatDKK(Math.round(value))}
          sub={`${((spentThisMonth / totalBudgetLimit) * 100).toFixed(1)}% used`}
        />
        <KpiCard
          label="Upcoming outflows"
          value={formatDKK(totalUpcomingOutflows)}
          rawValue={totalUpcomingOutflows}
          formatFn={(value) => formatDKK(Math.round(value))}
          sub="next 30 days"
        />
        <KpiCard
          label="Goals this month"
          value={formatDKK(monthlyGoalContribution)}
          rawValue={monthlyGoalContribution}
          formatFn={(value) => formatDKK(Math.round(value))}
          sub={`${GOALS.length} active goals`}
        />
      </div>

      <div className="animate-fade-up anim-2 grid-main" style={{ marginBottom: 24 }}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Cash flow plan</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Use the forecast to see when the month gets tighter and where you still have room to move.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Wallet size={13} color="var(--accent)" />
              <span className="font-metric" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
                {formatDKK(projectedMonthEnd)}
              </span>
            </div>
          </CardHeader>
          <CardBody style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={280} className="chart-tall">
              <AreaChart data={forecastChart} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="planForecastFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5469d4" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#5469d4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: FIGMA_METRIC_FONT_STACK }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatAxisDKK}
                  tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: FIGMA_METRIC_FONT_STACK }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ForecastTooltip />} />
                <Area
                  type="monotone"
                  dataKey="balanceOere"
                  stroke="#5469d4"
                  strokeWidth={2.5}
                  fill="url(#planForecastFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#5469d4", stroke: "var(--surface-1)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="grid-3" style={{ marginTop: 16 }}>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Low point</div>
                <div className="font-metric" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
                  {formatDKK(forecastLowPoint.balanceOere)}
                </div>
                <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-secondary)" }}>{formatLongDate(forecastLowPoint.date)}</div>
              </div>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Planned income</div>
                <div className="font-metric" style={{ fontSize: 18, fontWeight: 600, color: "var(--green)" }}>
                  +{formatDKK(totalUpcomingIncome)}
                </div>
                <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-secondary)" }}>
                  {upcoming30Days.filter((event) => event.amountOere > 0).length} upcoming events
                </div>
              </div>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Budget flexibility</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
                  {totalBudgetLeft > 0 ? "Still room left" : "Right on the line"}
                </div>
                <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-secondary)" }}>
                  {formatDKK(totalBudgetLeft)} left in this month&apos;s budget
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Upcoming events</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Items already on the calendar that will pull down or lift your balance.
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
                        {event.type === "income" ? "Income" : event.type === "subscription" ? "Subscription" : event.label}
                      </Badge>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                      {formatLongDate(event.date)} · {daysAway === 0 ? "today" : daysAway === 1 ? "tomorrow" : `in ${daysAway} days`}
                    </div>
                  </div>
                  <div className="font-metric" style={{ fontSize: 13.5, fontWeight: 600, color: event.amountOere > 0 ? "var(--green)" : "var(--text-primary)" }}>
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
              <CardTitle>Budget runway</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                See which categories consume flexibility first so you can react early.
              </div>
            </div>
            <Button href="/spending" variant="ghost" size="md" style={{ fontSize: 12.5, fontWeight: 500 }}>
              Open spending →
            </Button>
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
                      {row.essential ? <Badge variant="active">Essential</Badge> : null}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Budget</label>
                      <input
                        type="number"
                        min={0}
                        step={50}
                        value={Math.round(row.limit / 100)}
                        onChange={(event) => {
                          const nextValue = Number(event.target.value);
                          setBudgetLimits((current) => ({
                            ...current,
                            [row.id]: Number.isFinite(nextValue) && nextValue >= 0 ? nextValue * 100 : 0,
                          }));
                        }}
                        style={{
                          width: 88,
                          background: "var(--surface-1)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "6px 8px",
                          color: "var(--text-primary)",
                          fontSize: 12.5,
                          fontFamily: "var(--font-metric)",
                          textAlign: "right",
                        }}
                      />
                      <div className="font-metric" style={{ fontSize: 12.5, color: "var(--text-secondary)", minWidth: 122, textAlign: "right" }}>
                        {formatDKK(row.spent)} / {formatDKK(row.limit)}
                      </div>
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
                    <span>{overBudget ? "Over budget" : `${(row.ratio * 100).toFixed(1)}% used`}</span>
                    <span className="font-metric">{formatDKK(Math.max(row.limit - row.spent, 0))} left</span>
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Goals</CardTitle>
              <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)" }}>
                Make sure this month&apos;s plan also moves your longer-term goals forward.
              </div>
            </div>
          </CardHeader>
          <CardBody style={{ display: "grid", gap: 14 }}>
            {GOALS.map((goal, index) => {
              const progress = goal.currentOere / goal.targetOere;
              const accent =
                goal.theme === "safety" ? "var(--green)" : goal.theme === "investing" ? "#C8842C" : "var(--accent)";

              return (
                <div key={goal.id} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{goal.name}</div>
                      <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-muted)" }}>
                        Target date {formatLongDate(goal.targetDate)}
                      </div>
                    </div>
                    <Badge variant={goal.theme === "safety" ? "active" : goal.theme === "investing" ? "yearly" : "monthly"}>
                      {goal.theme === "safety" ? "Safety" : goal.theme === "investing" ? "Investing" : "Savings"}
                    </Badge>
                  </div>
                  <div className="font-metric" style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>
                    {formatDKK(goal.currentOere)} / {formatDKK(goal.targetOere)}
                  </div>
                  <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
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
                    <span>{formatPct(progress * 100)} reached</span>
                    <span className="font-metric">+{formatDKK(goal.monthlyContributionOere + goalBoosts[goal.id] * 100)}/md</span>
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>What if I add more?</span>
                      <span className="font-metric" style={{ fontSize: 12.5, color: "var(--accent)" }}>
                        +{goalBoosts[goal.id]} kr./mo
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2500}
                      step={250}
                      value={goalBoosts[goal.id]}
                      onChange={(event) =>
                        setGoalBoosts((current) => ({
                          ...current,
                          [goal.id]: Number(event.target.value),
                        }))
                      }
                      style={{ width: "100%" }}
                    />
                    {(() => {
                      const monthlyBoostOere = goalBoosts[goal.id] * 100;
                      const adjustedContribution = goal.monthlyContributionOere + monthlyBoostOere;
                      const remaining = Math.max(goal.targetOere - goal.currentOere, 0);
                      const baseMonths = Math.ceil(remaining / goal.monthlyContributionOere);
                      const adjustedMonths = Math.ceil(remaining / adjustedContribution);
                      const monthsSaved = Math.max(baseMonths - adjustedMonths, 0);
                      const adjustedDate = addMonthsToIso(MOCK_TODAY, adjustedMonths);

                      return (
                        <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                          {monthlyBoostOere > 0
                            ? `With the extra contribution, you would reach this goal around ${formatLongDate(adjustedDate)} and finish about ${monthsSaved} month${monthsSaved === 1 ? "" : "s"} sooner.`
                            : "Use the slider to test how a bigger monthly contribution changes the timeline."}
                        </div>
                      );
                    })()}
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
              <CardTitle>Keep going</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="grid-3">
            <PlanningLink
              href="/accounts"
              eyebrow="Account setup"
              title="Check accounts and connections"
              description="Make sure cash sits in the right places and every data source is actually active."
            />
            <PlanningLink
              href="/spending"
              eyebrow="Budget detail"
              title="Open category spending"
              description="Move from overview to the categories and merchants putting pressure on the plan."
            />
            <PlanningLink
              href="/subscriptions"
              eyebrow="Recurring charges"
              title="Review subscriptions"
              description="See which recurring charges should shape next month's decisions."
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
