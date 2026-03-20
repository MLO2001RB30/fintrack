"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays, ChevronDown, Info, Settings } from "lucide-react";
import { ACCOUNTS, MOCK_TODAY, TRANSACTIONS, buildCashFlowForecast } from "@/lib/mock-data";
import { FIGMA_METRIC_FONT_STACK } from "@/lib/typography";
import { useReviewQueue } from "@/lib/use-review-queue";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { MerchantLogo } from "@/components/ui/merchant-logo";

const CHART_BLUE = "#5469d4";
const CHART_BLUE_SOFT = "#7dabf8";
const CHART_GREY = "#c2c7cf";

function formatKr(amountOere: number) {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountOere / 100);
}

function addCalendarDays(iso: string, delta: number): string {
  const base = new Date(`${iso}T12:00:00`);
  base.setDate(base.getDate() + delta);
  return base.toISOString().slice(0, 10);
}

function isExpenseTransaction(transaction: (typeof TRANSACTIONS)[number]) {
  return transaction.amountOere < 0 && transaction.category !== "Transfer";
}

function dayExpenseTotal(iso: string) {
  return TRANSACTIONS.filter((t) => t.date === iso && isExpenseTransaction(t)).reduce(
    (sum, t) => sum + Math.abs(t.amountOere),
    0,
  );
}

function monthKeysEnding(endIso: string, count: number): string[] {
  const end = new Date(`${endIso}T12:00:00`);
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}`);
  }
  return keys;
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function aggregateMonth(ym: string) {
  const inMonth = TRANSACTIONS.filter((t) => t.date.startsWith(ym));
  const expenses = inMonth.filter(isExpenseTransaction);
  const income = inMonth.filter((t) => t.amountOere > 0);
  const expenseTotal = expenses.reduce((s, t) => s + Math.abs(t.amountOere), 0);
  const incomeTotal = income.reduce((s, t) => s + t.amountOere, 0);
  const cardish = expenses
    .filter((t) => t.accountId !== "acc-2")
    .reduce((s, t) => s + Math.abs(t.amountOere), 0);
  const net = incomeTotal - expenseTotal;
  return {
    expenseTotal,
    incomeTotal,
    cardish,
    net,
    txCount: inMonth.length,
  };
}

type PctTone = "positive" | "negative" | "neutral";

function pctTone(pct: number): PctTone {
  if (Math.abs(pct) < 0.05) return "neutral";
  return pct >= 0 ? "positive" : "negative";
}

function PctTag({ pct }: { pct: number }) {
  const tone = pctTone(pct);
  const bg =
    tone === "neutral" ? "#e3e8ee" : tone === "positive" ? "var(--green-soft)" : "var(--red-soft)";
  const color = tone === "neutral" ? "var(--text-muted)" : tone === "positive" ? "var(--green)" : "var(--red)";
  const label = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;

  return (
    <span
      className="font-metric"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 6px",
        borderRadius: 4,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

function buildHourlySeries(dayTotalOere: number) {
  const total = Math.max(dayTotalOere, 1);
  return Array.from({ length: 24 }, (_, hour) => {
    const t = hour / 23;
    const curve = (1 - Math.cos(t * Math.PI)) / 2;
    const jitter = 0.92 + 0.08 * (hour / 23);
    const value = Math.round(total * curve * jitter);
    return {
      hour,
      label: `${`${hour}`.padStart(2, "0")}:00`,
      cumulative: value,
    };
  });
}

function ReportSparkline({
  current,
  compare,
}: {
  current: number[];
  compare: number[];
}) {
  const data = current.map((c, i) => ({ i, c, p: compare[i] ?? 0 }));
  return (
    <div style={{ width: "100%", height: 72 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
          <XAxis dataKey="i" hide />
          <YAxis hide domain={["dataMin - 50", "dataMax + 50"]} />
          <Line type="monotone" dataKey="p" stroke={CHART_GREY} strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line
            type="monotone"
            dataKey="c"
            stroke={CHART_BLUE}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ReportCard({
  title,
  pct,
  primary,
  secondary,
  current,
  compare,
  leftMonth,
  rightMonth,
}: {
  title: string;
  pct: number;
  primary: string;
  secondary: string;
  current: number[];
  compare: number[];
  leftMonth: string;
  rightMonth: string;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        background: "var(--surface-1)",
        boxShadow: "var(--shadow-sm)",
        padding: "18px 20px 14px",
        display: "grid",
        gap: 12,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--grey-900)" }}>{title}</span>
          <Info size={14} strokeWidth={1.5} color="var(--grey-500)" aria-hidden style={{ flexShrink: 0 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <PctTag pct={pct} />
          <Button type="button" variant="ghost" size="sm">
            View
          </Button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <span className="font-metric" style={{ fontSize: 20, fontWeight: 400, color: "var(--grey-900)" }}>
          {primary}
        </span>
        <span className="font-metric" style={{ fontSize: 14, fontWeight: 400, color: "var(--text-secondary)" }}>
          {secondary}
        </span>
      </div>
      <ReportSparkline current={current} compare={compare} />
      <div
        className="font-metric"
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        <span>{leftMonth}</span>
        <span>{rightMonth}</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { openItems } = useReviewQueue();
  const yesterdayIso = addCalendarDays(MOCK_TODAY, -1);
  const todaySpend = dayExpenseTotal(MOCK_TODAY);
  const yesterdaySpend = dayExpenseTotal(yesterdayIso);
  const hourlyData = useMemo(() => buildHourlySeries(todaySpend), [todaySpend]);
  const nowHour = 12;

  const monthKeys = useMemo(() => monthKeysEnding(MOCK_TODAY, 12), []);
  const monthly = useMemo(() => monthKeys.map((ym) => ({ ym, ...aggregateMonth(ym) })), [monthKeys]);

  const mar = monthly.find((m) => m.ym === "2026-03");
  const feb = monthly.find((m) => m.ym === "2026-02");
  const pctChange = (current: number, previous: number) => {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
  };

  const spendMar = mar?.expenseTotal ?? 0;
  const spendFeb = feb?.expenseTotal ?? 0;
  const cardMar = mar?.cardish ?? 0;
  const cardFeb = feb?.cardish ?? 0;
  const netMar = mar?.net ?? 0;
  const netFeb = feb?.net ?? 0;
  const txMar = mar?.txCount ?? 0;
  const txFeb = feb?.txCount ?? 0;
  const incomeMar = mar?.incomeTotal ?? 0;
  const incomeFeb = feb?.incomeTotal ?? 0;

  const activeAccounts = ACCOUNTS.filter((a) => a.status === "active").slice(0, 2);

  const spendSeries = monthly.map((m) => m.expenseTotal);
  const spendCompare = spendSeries.map((v, i) => Math.round(v * (0.82 + 0.03 * Math.sin(i / 2))));
  const cardSeries = monthly.map((m) => m.cardish);
  const cardCompare = cardSeries.map((v, i) => Math.round(v * (0.85 + 0.02 * Math.cos(i))));
  const netSeries = monthly.map((m) => Math.max(m.net, 0));
  const netCompare = netSeries.map((v, i) => Math.round(v * (0.9 + 0.02 * Math.sin(i))));
  const txSeries = monthly.map((m) => m.txCount * 1500);
  const txCompare = txSeries.map((v, i) => Math.round(v * (0.88 + 0.03 * Math.cos(i / 3))));
  const accSeries = monthly.map((_, i) => 3 + (i % 3));
  const accCompare = accSeries.map((v) => Math.max(1, v - 1));
  const incomeSeries = monthly.map((m) => m.incomeTotal);
  const incomeCompare = incomeSeries.map((v, i) => Math.round(v * (0.95 + 0.01 * Math.sin(i))));

  const forecast = buildCashFlowForecast(30);
  const forecastLowPoint = forecast.reduce((lowest, point) =>
    point.balanceOere < lowest.balanceOere ? point : lowest,
  );
  const topReviewItem = openItems[0];

  const recentTransactions = [...TRANSACTIONS]
    .sort((a, b) => b.date.localeCompare(a.date) || Math.abs(b.amountOere) - Math.abs(a.amountOere))
    .slice(0, 7)
    .map((t) => ({ ...t, account: ACCOUNTS.find((a) => a.id === t.accountId) }));

  const rangeLeft = monthLabel(monthKeys[0] ?? "");
  const rangeRight = monthLabel(monthKeys[monthKeys.length - 1] ?? "");

  return (
    <div className="page-wrap" style={{ paddingTop: 20 }}>
      {/* Today — Figma node 20:994 */}
      <section style={{ marginBottom: 36 }}>
        <h1
          style={{
            margin: "0 0 16px",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          Today
        </h1>
        <div style={{ borderTop: "1px solid var(--border)", marginBottom: 20 }} />

        <div
          className="stripe-today-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(200px, 320px) minmax(0, 1fr) minmax(200px, 280px)",
            gap: 0,
            alignItems: "stretch",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-card)",
            overflow: "hidden",
            background: "var(--surface-1)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ padding: "20px 20px 24px", borderRight: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}>Money out</span>
                  <ChevronDown size={12} strokeWidth={1.5} color="var(--grey-500)" />
                </div>
                <div className="font-metric" style={{ fontSize: 20, fontWeight: 400, color: "var(--grey-900)" }}>
                  {formatKr(todaySpend)}
                </div>
                <div className="font-metric" style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                  {new Date(`${MOCK_TODAY}T12:00:00`).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}>Yesterday</span>
                  <ChevronDown size={12} strokeWidth={1.5} color="var(--grey-500)" />
                </div>
                <div className="font-metric" style={{ fontSize: 16, fontWeight: 400, color: "var(--text-secondary)" }}>
                  {formatKr(yesterdaySpend)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "16px 12px 8px", borderRight: "1px solid var(--border)", minWidth: 0 }}>
            <div style={{ width: "100%", height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="todayFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_BLUE_SOFT} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={CHART_BLUE_SOFT} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical stroke={CHART_GREY} horizontal={false} />
                  <XAxis
                    dataKey="hour"
                    type="number"
                    domain={[0, 23]}
                    ticks={[0, 6, 12, 18, 23]}
                    tickFormatter={(h) => `${`${h}`.padStart(2, "0")}:00`}
                    tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: FIGMA_METRIC_FONT_STACK }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide domain={[0, "auto"]} />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: FIGMA_METRIC_FONT_STACK,
                    }}
                    formatter={(value) => [formatKr(typeof value === "number" ? value : 0), "Cleared"]}
                    labelFormatter={(h) => `${`${h}`.padStart(2, "0")}:00`}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke={CHART_BLUE}
                    strokeWidth={2}
                    fill="url(#todayFill)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div
              className="font-metric"
              style={{
                textAlign: "center",
                fontSize: 11,
                color: "var(--accent)",
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              Now, {`${nowHour}`.padStart(2, "0")}:00
            </div>
          </div>

          <div style={{ padding: "20px 20px 24px", display: "grid", gap: 18 }}>
            {activeAccounts.map((account) => (
              <div key={account.id}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>
                  {account.accountName}
                </div>
                <div className="font-metric" style={{ fontSize: 16, fontWeight: 400, color: "var(--grey-900)", marginBottom: 4 }}>
                  {formatKr(account.balanceOere)}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                  Cleared balance · {account.lastSynced}
                </div>
                <Button href={`/accounts?account=${account.id}`} variant="ghost" size="md" style={{ justifyContent: "flex-start", width: "fit-content" }}>
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reports overview */}
      <section style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 400,
              color: "var(--text-primary)",
            }}
          >
            Reports overview
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Button type="button" variant="secondary" size="sm" trailingIcon={<ChevronDown size={14} strokeWidth={1.5} />}>
              Last 12 months
            </Button>
            <Button type="button" variant="secondary" size="sm" trailingIcon={<ChevronDown size={14} strokeWidth={1.5} />}>
              Previous period
            </Button>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                fontWeight: 500,
                color: "var(--grey-600)",
              }}
            >
              <CalendarDays size={14} strokeWidth={1.5} aria-hidden />
              {rangeLeft} – {rangeRight}
            </span>
            <Button type="button" variant="secondary" size="sm" trailingIcon={<ChevronDown size={14} strokeWidth={1.5} />}>
              Monthly
            </Button>
            <Button type="button" variant="secondary" size="sm" icon={<Settings size={14} strokeWidth={1.5} aria-hidden />}>
              Edit charts
            </Button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
          }}
          className="stripe-report-grid"
        >
          <ReportCard
            title="Total spend"
            pct={pctChange(spendMar, spendFeb)}
            primary={formatKr(spendMar)}
            secondary={formatKr(spendFeb)}
            current={spendSeries}
            compare={spendCompare}
            leftMonth={rangeLeft}
            rightMonth={rangeRight}
          />
          <ReportCard
            title="Primary accounts spend"
            pct={pctChange(cardMar, cardFeb)}
            primary={formatKr(cardMar)}
            secondary={formatKr(cardFeb)}
            current={cardSeries}
            compare={cardCompare}
            leftMonth={rangeLeft}
            rightMonth={rangeRight}
          />
          <ReportCard
            title="Net cash flow"
            pct={pctChange(netMar, netFeb)}
            primary={formatKr(netMar)}
            secondary={formatKr(netFeb)}
            current={netSeries}
            compare={netCompare}
            leftMonth={rangeLeft}
            rightMonth={rangeRight}
          />
          <ReportCard
            title="Income"
            pct={pctChange(incomeMar, incomeFeb)}
            primary={formatKr(incomeMar)}
            secondary={formatKr(incomeFeb)}
            current={incomeSeries}
            compare={incomeCompare}
            leftMonth={rangeLeft}
            rightMonth={rangeRight}
          />
          <ReportCard
            title="Transactions"
            pct={pctChange(txMar, txFeb)}
            primary={`${txMar} cleared`}
            secondary={`${txFeb} prior`}
            current={txSeries}
            compare={txCompare}
            leftMonth={rangeLeft}
            rightMonth={rangeRight}
          />
          <ReportCard
            title="Synced accounts"
            pct={0}
            primary={`${ACCOUNTS.filter((a) => a.status === "active").length} active`}
            secondary={`${ACCOUNTS.filter((a) => a.status !== "active").length} need attention`}
            current={accSeries}
            compare={accCompare}
            leftMonth={rangeLeft}
            rightMonth={rangeRight}
          />
        </div>
      </section>

      {/* FinTrack insights (not in Figma — keeps product workflows) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
          marginBottom: 22,
        }}
        className="stripe-insight-grid"
      >
        <Card>
          <CardBody style={{ display: "grid", gap: 10, paddingTop: 20, paddingBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>Review inbox</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
              {openItems.length} item{openItems.length === 1 ? "" : "s"} need attention
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {topReviewItem ? topReviewItem.title : "Your review queue is clear for now."}
            </div>
            <Button href="/review" variant="ghost" size="md" style={{ fontWeight: 600, justifyContent: "flex-start", width: "fit-content" }}>
              Open review
            </Button>
          </CardBody>
        </Card>
        <Card>
          <CardBody style={{ display: "grid", gap: 10, paddingTop: 20, paddingBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Projected low balance</div>
            <div className="font-metric" style={{ fontSize: 20, fontWeight: 400, color: "var(--grey-900)" }}>
              {formatKr(forecastLowPoint.balanceOere)}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Lowest point in the next 30-day projection ({forecastLowPoint.date}).
            </div>
            <Button href="/plan" variant="ghost" size="md" style={{ fontWeight: 600, justifyContent: "flex-start", width: "fit-content" }}>
              Open plan
            </Button>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent transactions</CardTitle>
            <div style={{ marginTop: 6, fontSize: 14, color: "var(--text-secondary)" }}>Latest cleared activity</div>
          </div>
          <Button href="/transactions?period=month" variant="ghost" size="md" style={{ whiteSpace: "nowrap" }}>
            See all
          </Button>
        </CardHeader>
        <CardBody style={{ paddingTop: 8 }}>
          <div className="table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
              <thead>
                <tr>
                  {["Description", "Account", "Date", "Amount", ""].map((heading) => (
                    <th
                      key={heading || "actions"}
                      style={{
                        textAlign: heading === "Amount" ? "right" : "left",
                        padding: "10px 0",
                        borderBottom: "1px solid var(--border)",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-muted)",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => {
                  const positive = transaction.amountOere > 0;
                  return (
                    <tr key={transaction.id}>
                      <td style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                          <MerchantLogo merchant={transaction.merchant} size={30} radius={10} />
                          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                            {transaction.merchant}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "14px 0",
                          borderBottom: "1px solid var(--border)",
                          fontSize: 14,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {transaction.account?.accountName ?? "—"}
                      </td>
                      <td
                        className="font-metric"
                        style={{
                          padding: "14px 0",
                          borderBottom: "1px solid var(--border)",
                          fontSize: 14,
                          fontWeight: 400,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {transaction.date}
                      </td>
                      <td
                        className="font-metric"
                        style={{
                          padding: "14px 0",
                          borderBottom: "1px solid var(--border)",
                          textAlign: "right",
                          fontSize: 14,
                          fontWeight: 500,
                          color: positive ? "var(--green)" : "var(--text-primary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {positive ? "+" : "-"}
                        {formatKr(Math.abs(transaction.amountOere))}
                      </td>
                      <td style={{ padding: "14px 0 14px 12px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>
                        <Link
                          href={`/transactions?period=month&tx=${transaction.id}`}
                          style={{
                            color: "var(--text-muted)",
                            textDecoration: "none",
                            fontSize: 16,
                            fontWeight: 700,
                          }}
                        >
                          ...
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

    </div>
  );
}
