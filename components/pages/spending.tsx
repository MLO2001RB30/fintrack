"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { ChevronLeft, PieChart as PieIcon } from "lucide-react";
import { TRANSACTIONS, formatDKK, formatAxisDKK, type Transaction } from "@/lib/mock-data";
import { FIGMA_METRIC_FONT_STACK } from "@/lib/typography";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { MerchantLogo } from "@/components/ui/merchant-logo";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Groceries:     "#059669",
  Transport:     "#2563EB",
  Streaming:     "#7C3AED",
  Music:         "#DB2777",
  Software:      "#D97706",
  Storage:       "#6B7280",
  AI:            "#0891B2",
  Food:          "#EA580C",
  Health:        "#16A34A",
  Shopping:      "#DC2626",
  Utilities:     "#4B5563",
  Entertainment: "#9333EA",
  Transfer:      "#64748B",
  Income:        "#10B981",
  Security:      "#1D4ED8",
  Wellness:      "#EC4899",
};

function categoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] ?? "#94A3B8";
}

function previousMonthPrefix(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  date.setMonth(date.getMonth() - 1);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
}

function formatChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? "New this month" : "No change";
  }

  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}% vs last month`;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

type SpendingTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
};

type CategoryChartClickState = {
  activePayload?: Array<{
    payload?: {
      category?: string;
    };
  }>;
};

function BarTooltip({ active, payload, label }: SpendingTooltipProps) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div
      className="font-metric"
      style={{
        background: "var(--tooltip-surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "var(--shadow-md)",
        fontSize: 12,
        backdropFilter: "blur(16px)",
      }}
    >
      <p style={{ margin: "0 0 4px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>
        {label}
      </p>
      <p className="font-metric" style={{ margin: 0, fontWeight: 400, color: "var(--grey-900)", fontSize: 14 }}>
        {formatDKK(payload[0].value)}
      </p>
    </div>
  );
}

// ─── Category row in drill-down ───────────────────────────────────────────────

function TxRow({ tx }: { tx: Transaction }) {
  const isPos = tx.amountOere > 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <MerchantLogo merchant={tx.merchant} size={32} radius={8} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {tx.merchant}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
          {new Date(tx.date).toLocaleDateString("da-DK", { day: "numeric", month: "short" })}
        </div>
      </div>
      <span className="font-metric" style={{ fontSize: 13.5, fontWeight: 600, color: isPos ? "var(--green)" : "var(--text-primary)", flexShrink: 0 }}>
        {isPos ? "+" : ""}{formatDKK(tx.amountOere)}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SpendingPage() {
  const [drillCategory, setDrillCategory] = useState<string | null>(null);
  const monthPrefix = "2026-03";
  const lastMonthPrefix = previousMonthPrefix("2026-03-19");

  const expenses = useMemo(() => TRANSACTIONS.filter((t) => t.amountOere < 0 && t.category !== "Transfer"), []);
  const currentMonthExpenses = useMemo(
    () => expenses.filter((transaction) => transaction.date.startsWith(monthPrefix)),
    [expenses, monthPrefix],
  );
  const lastMonthExpenses = useMemo(
    () => expenses.filter((transaction) => transaction.date.startsWith(lastMonthPrefix)),
    [expenses, lastMonthPrefix],
  );

  const byCategory = useMemo(() => {
    const currentMap: Record<string, number> = {};
    const previousMap: Record<string, number> = {};

    for (const tx of currentMonthExpenses) {
      currentMap[tx.category] = (currentMap[tx.category] ?? 0) + Math.abs(tx.amountOere);
    }

    for (const tx of lastMonthExpenses) {
      previousMap[tx.category] = (previousMap[tx.category] ?? 0) + Math.abs(tx.amountOere);
    }

    const categories = Array.from(new Set([...Object.keys(currentMap), ...Object.keys(previousMap)]));

    return categories
      .map((category) => {
        const total = currentMap[category] ?? 0;
        const previousTotal = previousMap[category] ?? 0;
        return {
          category,
          total,
          previousTotal,
          delta: total - previousTotal,
        };
      })
      .filter((row) => row.total > 0 || row.previousTotal > 0)
      .sort((a, b) => b.total - a.total);
  }, [currentMonthExpenses, lastMonthExpenses]);

  const grandTotal = byCategory.reduce((s, c) => s + c.total, 0);
  const previousGrandTotal = byCategory.reduce((sum, category) => sum + category.previousTotal, 0);
  const biggestMover = [...byCategory].sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))[0];

  const drillTxs = useMemo(
    () =>
      drillCategory
        ? currentMonthExpenses.filter((t) => t.category === drillCategory).sort((a, b) => b.date.localeCompare(a.date))
        : [],
    [drillCategory, currentMonthExpenses]
  );

  return (
    <div className="page-wrap">
      <PageHeader
        title="Spending"
        subtitle="Category-level spending analysis based on your cleared transactions"
      />

      {/* Summary KPIs */}
      <div className="animate-fade-up anim-1 grid-3" style={{ marginBottom: 24 }}>
        <div className="card-hover" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
            This month
          </div>
          <div className="font-metric" style={{ fontSize: 20, fontWeight: 400, color: "var(--red)" }}>
            <AnimatedNumber className="font-metric" value={grandTotal} format={n => formatDKK(Math.round(n))} delay={80} />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{formatChange(grandTotal, previousGrandTotal)}</div>
        </div>
        <div className="card-hover" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
            Last month
          </div>
          <div className="font-metric" style={{ fontSize: 20, fontWeight: 400, color: "var(--grey-900)" }}>
            <AnimatedNumber className="font-metric" value={previousGrandTotal} format={n => formatDKK(Math.round(n))} delay={140} />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Baseline for comparison</div>
        </div>
        <div className="card-hover" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
            Biggest mover
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {biggestMover?.category ?? "—"}
          </div>
          <div className="font-metric" style={{ fontSize: 11.5, fontWeight: 400, color: "var(--text-muted)", marginTop: 2 }}>
            {biggestMover ? formatChange(biggestMover.total, biggestMover.previousTotal) : "—"}
          </div>
        </div>
      </div>

      <div
        className="animate-fade-up anim-2"
        style={{ display: "grid", gridTemplateColumns: drillCategory ? "1fr 360px" : "1fr", gap: 16 }}
      >
        {/* Bar chart */}
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PieIcon size={13} color="var(--text-muted)" />
                <CardTitle>Spending by category</CardTitle>
            </div>
            {drillCategory && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setDrillCategory(null)}
                icon={<ChevronLeft size={13} />}
                style={{ fontSize: 12.5, fontWeight: 500 }}
              >
                All categories
              </Button>
            )}
          </CardHeader>
          <CardBody style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={320} className="chart-tall">
              <BarChart
                data={byCategory}
                margin={{ top: 4, right: 8, left: -10, bottom: 60 }}
                onClick={(data) => {
                  const activePayload = (data as CategoryChartClickState | undefined)?.activePayload;
                  const category = activePayload?.[0]?.payload?.category;

                  if (category) {
                    setDrillCategory((prev) => (prev === category ? null : category));
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: FIGMA_METRIC_FONT_STACK }}
                  axisLine={false}
                  tickLine={false}
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tickFormatter={v => formatAxisDKK(v)}
                  tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: FIGMA_METRIC_FONT_STACK }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(84, 105, 212, 0.06)" }} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} style={{ cursor: "pointer" }}>
                  {byCategory.map(entry => (
                    <Cell
                      key={entry.category}
                      fill={categoryColor(entry.category)}
                      opacity={drillCategory && drillCategory !== entry.category ? 0.3 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Category table */}
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 0 }}>
              {byCategory.map((row, i) => {
                const pct = (row.total / grandTotal) * 100;
                const isSelected = drillCategory === row.category;
                return (
                  <div
                    key={row.category}
                    role="button"
                    tabIndex={0}
                    onClick={() => setDrillCategory(prev => prev === row.category ? null : row.category)}
                    onKeyDown={e => e.key === "Enter" && setDrillCategory(prev => prev === row.category ? null : row.category)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 4px",
                      borderBottom: i < byCategory.length - 1 ? "1px solid var(--border)" : "none",
                      cursor: "pointer",
                      borderRadius: 6,
                      background: isSelected ? "var(--hover-bg)" : "transparent",
                      transition: "background 100ms",
                      outline: "none",
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "var(--hover-bg)"; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: categoryColor(row.category),
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1, fontSize: 13, color: "var(--text-primary)", fontWeight: isSelected ? 600 : 400 }}>
                      {row.category}
                    </span>
                    {/* Progress bar */}
                    <div style={{ width: 80, height: 4, background: "var(--surface-3)", borderRadius: 2, overflow: "hidden" }}>
                      <div
                        className="progress-bar-animated"
                        style={{
                          "--target-w": `${pct}%`,
                          "--bar-delay": `${200 + i * 35}ms`,
                          background: categoryColor(row.category),
                          opacity: drillCategory && drillCategory !== row.category ? 0.3 : 1,
                          transition: "opacity 150ms",
                        } as React.CSSProperties}
                      />
                    </div>
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)", width: 32, textAlign: "right" }}>
                      {pct.toFixed(0)}%
                    </span>
                    <div style={{ width: 144, textAlign: "right" }}>
                      <div className="font-metric" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        {formatDKK(row.total)}
                      </div>
                      <div style={{ fontSize: 11, color: row.delta > 0 ? "var(--red)" : row.delta < 0 ? "var(--green)" : "var(--text-muted)" }}>
                        {formatChange(row.total, row.previousTotal)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Drill-down panel */}
        {drillCategory && (
          <Card className="animate-slide-right">
            <CardHeader>
              <div>
                <CardTitle>{drillCategory}</CardTitle>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {drillTxs.length} transactions
                </div>
              </div>
              <div style={{ display: "grid", justifyItems: "end", gap: 8 }}>
                <span className="font-metric" style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                  {formatDKK(byCategory.find(c => c.category === drillCategory)?.total ?? 0)}
                </span>
                <Link
                  href={`/transactions?category=${encodeURIComponent(drillCategory)}&period=month`}
                  style={{
                    textDecoration: "none",
                    color: "var(--accent)",
                    fontSize: 12.5,
                    fontWeight: 700,
                  }}
                >
                  View in transactions
                </Link>
              </div>
            </CardHeader>
            <CardBody style={{ padding: 0, maxHeight: 480, overflowY: "auto" }}>
              {drillTxs.map(tx => <TxRow key={tx.id} tx={tx} />)}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
