"use client";

import { useState, useMemo } from "react";
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

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "var(--shadow-md)",
        fontSize: 12,
      }}
    >
      <p style={{ margin: "0 0 4px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>
        {label}
      </p>
      <p className="num" style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>
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
      <span className="num" style={{ fontSize: 13.5, fontWeight: 600, color: isPos ? "var(--green)" : "var(--text-primary)", flexShrink: 0 }}>
        {isPos ? "+" : ""}{formatDKK(tx.amountOere)}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SpendingPage() {
  const [drillCategory, setDrillCategory] = useState<string | null>(null);

  // Only expense transactions (negative amounts), exclude income and transfers
  const expenses = useMemo(
    () => TRANSACTIONS.filter(t => t.amountOere < 0 && t.category !== "Transfer"),
    []
  );

  // Aggregate by category → total absolute spend
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of expenses) {
      map[tx.category] = (map[tx.category] ?? 0) + Math.abs(tx.amountOere);
    }
    return Object.entries(map)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const grandTotal = byCategory.reduce((s, c) => s + c.total, 0);

  // Transactions in the selected category
  const drillTxs = useMemo(
    () => drillCategory
      ? expenses.filter(t => t.category === drillCategory).sort((a, b) => b.date.localeCompare(a.date))
      : [],
    [drillCategory, expenses]
  );

  return (
    <div style={{ padding: "32px 36px", position: "relative", zIndex: 1 }}>
      <PageHeader
        title="Forbrug"
        subtitle="Kategoriseret udgiftsanalyse fra dine transaktioner"
      />

      {/* Summary KPIs */}
      <div
        className="animate-fade-up anim-1"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}
      >
        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
            Samlet forbrug
          </div>
          <div className="num" style={{ fontSize: 22, fontWeight: 600, color: "var(--red)", letterSpacing: "-0.02em" }}>
            {formatDKK(grandTotal)}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>viste periode</div>
        </div>
        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
            Kategorier
          </div>
          <div className="num" style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {byCategory.length}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>udgiftskategorier</div>
        </div>
        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
            Største udgiftspost
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {byCategory[0]?.category ?? "—"}
          </div>
          <div className="num" style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
            {byCategory[0] ? formatDKK(byCategory[0].total) : "—"}
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
              <CardTitle>Forbrug pr. kategori</CardTitle>
            </div>
            {drillCategory && (
              <button
                onClick={() => setDrillCategory(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--accent)",
                  fontSize: 12.5,
                  fontFamily: "inherit",
                  padding: 0,
                }}
              >
                <ChevronLeft size={13} /> Alle kategorier
              </button>
            )}
          </CardHeader>
          <CardBody style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={byCategory}
                margin={{ top: 4, right: 8, left: -10, bottom: 60 }}
                onClick={data => {
                  if (data?.activePayload?.[0]) {
                    const cat = data.activePayload[0].payload.category as string;
                    setDrillCategory(prev => prev === cat ? null : cat);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                  axisLine={false}
                  tickLine={false}
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tickFormatter={v => formatAxisDKK(v)}
                  tick={{ fontSize: 10.5, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
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
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: categoryColor(row.category),
                          borderRadius: 2,
                          opacity: drillCategory && drillCategory !== row.category ? 0.3 : 1,
                          transition: "opacity 150ms",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)", width: 32, textAlign: "right" }}>
                      {pct.toFixed(0)}%
                    </span>
                    <span className="num" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", width: 90, textAlign: "right" }}>
                      {formatDKK(row.total)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Drill-down panel */}
        {drillCategory && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{drillCategory}</CardTitle>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {drillTxs.length} transaktioner
                </div>
              </div>
              <span className="num" style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                {formatDKK(byCategory.find(c => c.category === drillCategory)?.total ?? 0)}
              </span>
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
