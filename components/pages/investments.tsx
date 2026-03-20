"use client";
// investments page
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Plus, RefreshCw } from "lucide-react";
import { HOLDINGS, formatDKK, formatPct, toBaseDKKOere, EUR_DKK, USD_DKK, type Holding } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const ASSET_COLORS: Record<string, string> = {
  stock:   "#C8842C",
  etf:     "#0D8B5B",
  crypto:  "#7C68FF",
  pension: "#4F7CFF",
  bond:    "#8C8B94",
};


function HoldingRow({ holding }: { holding: Holding }) {
  const totalCurrent = toBaseDKKOere(holding.currentPriceMinor * holding.quantity, holding.currency);
  const totalCost = holding.avgCostMinor
    ? toBaseDKKOere(holding.avgCostMinor * holding.quantity, holding.currency)
    : null;
  const pnlOere = totalCost ? totalCurrent - totalCost : null;
  const pnlPct = totalCost ? ((totalCurrent - totalCost) / totalCost) * 100 : null;
  const isUp = pnlOere !== null ? pnlOere >= 0 : null;

  return (
    <tr
      style={{ borderBottom: "1px solid var(--border)", transition: "background 100ms" }}
      onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--hover-bg)")}
      onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
    >
      {/* Asset */}
      <td style={{ padding: "13px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MerchantLogo domain={holding.domain} merchant={holding.name} size={32} radius={8} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>{holding.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", display: "flex", gap: 6, alignItems: "center" }}>
              {holding.ticker && <span className="font-metric">{holding.ticker}</span>}
              <span>·</span>
              <span>{holding.broker}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Asset class */}
      <td style={{ padding: "13px 20px" }}>
        <Badge variant={holding.assetClass}>
          {holding.assetClass === "stock" ? "Stock" : holding.assetClass === "etf" ? "ETF" : holding.assetClass === "crypto" ? "Crypto" : holding.assetClass === "pension" ? "Pension" : "Bond"}
        </Badge>
      </td>

      {/* Quantity */}
      <td style={{ padding: "13px 20px" }}>
        <span className="font-metric" style={{ fontSize: 13, color: "var(--text-primary)" }}>
          {holding.quantity.toLocaleString("da-DK", { maximumFractionDigits: 4 })}
        </span>
      </td>

      {/* Avg cost */}
      <td style={{ padding: "13px 20px", textAlign: "right" }}>
        {holding.avgCostMinor ? (
          <span className="font-metric" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {formatDKK(toBaseDKKOere(holding.avgCostMinor, holding.currency))}
          </span>
        ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
      </td>

      {/* Current price */}
      <td style={{ padding: "13px 20px", textAlign: "right" }}>
        <div>
          <div className="font-metric" style={{ fontSize: 13, color: "var(--text-primary)" }}>
            {formatDKK(toBaseDKKOere(holding.currentPriceMinor, holding.currency))}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{holding.priceUpdated}</div>
        </div>
      </td>

      {/* Total value */}
      <td style={{ padding: "13px 20px", textAlign: "right" }}>
        <span className="font-metric" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
          {formatDKK(totalCurrent)}
        </span>
      </td>

      {/* P&L */}
      <td style={{ padding: "13px 20px", textAlign: "right" }}>
        {pnlOere !== null && pnlPct !== null ? (
          <div>
            <div
              className="font-metric"
              style={{ fontSize: 13, fontWeight: 500, color: isUp ? "var(--green)" : "var(--red)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}
            >
              {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {isUp ? "+" : ""}{formatDKK(pnlOere)}
            </div>
            <div className="font-metric" style={{ fontSize: 11, color: isUp ? "var(--green)" : "var(--red)" }}>
              {formatPct(pnlPct)}
            </div>
          </div>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>—</span>
        )}
      </td>
    </tr>
  );
}

type PortfolioSlice = {
  name: string;
  value: number;
  fill: string;
  pct: number;
};

type PieTooltipProps = {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: PortfolioSlice }>;
};

function CustomPieTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div
      className="font-metric"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border-strong)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
      }}
    >
      <div style={{ color: d.payload.fill, fontWeight: 600, marginBottom: 3 }}>{d.name}</div>
      <div style={{ color: "var(--grey-900)", fontSize: 14, fontWeight: 400 }}>{formatDKK(d.value)}</div>
      <div style={{ color: "var(--text-muted)" }}>{d.payload.pct.toFixed(1)}%</div>
    </div>
  );
}

export function InvestmentsPage() {
  const totalByClass = HOLDINGS.reduce((acc, h) => {
    const val = toBaseDKKOere(h.currentPriceMinor * h.quantity, h.currency);
    acc[h.assetClass] = (acc[h.assetClass] ?? 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const totalPortfolio = Object.values(totalByClass).reduce((s, v) => s + v, 0);

  const pieData = Object.entries(totalByClass).map(([cls, val]) => ({
    name: cls === "stock" ? "Stocks" : cls === "etf" ? "ETF" : cls === "crypto" ? "Crypto" : cls === "pension" ? "Pension" : "Bonds",
    value: val,
    fill: ASSET_COLORS[cls] ?? "#666",
    pct: (val / totalPortfolio) * 100,
  }));

  const totalCostBase = HOLDINGS.reduce((s, h) => {
    if (!h.avgCostMinor) return s;
    return s + toBaseDKKOere(h.avgCostMinor * h.quantity, h.currency);
  }, 0);
  const totalPnl = totalPortfolio - totalCostBase;
  const totalPnlPct = (totalPnl / totalCostBase) * 100;

  return (
    <div className="page-wrap">
      <PageHeader
        title="Investments"
        subtitle="Portfolio overview with current market prices"
        action={
          <Button type="button" variant="primary" size="md" icon={<Plus size={14} />}>
            Add holding
          </Button>
        }
      />

      {/* KPI row */}
      <div className="animate-fade-up anim-1 grid-invest" style={{ marginBottom: 24 }}>
        <div
          className="card-hover"
          style={{
            background: "linear-gradient(180deg, rgba(125, 171, 248, 0.12), rgba(84, 105, 212, 0.08))",
            border: "1px solid var(--accent-border)",
            borderRadius: "var(--radius-card)",
            padding: "18px 20px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, var(--accent), transparent)" }} />
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Total portfolio</div>
          <div className="font-metric" style={{ fontSize: 26, fontWeight: 600, color: "var(--accent)", letterSpacing: "-0.03em" }}>
            <AnimatedNumber value={totalPortfolio} format={n => formatDKK(Math.round(n))} delay={80} />
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{HOLDINGS.length} holdings</div>
        </div>

        <div className="card-hover" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Unrealized gain</div>
          <div className="font-metric" style={{ fontSize: 26, fontWeight: 600, color: totalPnl >= 0 ? "var(--green)" : "var(--red)", letterSpacing: "-0.03em" }}>
            <AnimatedNumber
              value={totalPnl}
              format={n => `${n >= 0 ? "+" : ""}${formatDKK(Math.round(n))}`}
              delay={140}
            />
          </div>
          <div className="font-metric" style={{ fontSize: 12, color: totalPnl >= 0 ? "var(--green)" : "var(--red)", marginTop: 3 }}>
            {formatPct(totalPnlPct)} overall
          </div>
        </div>

        <div className="card-hover" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Cost basis</div>
          <div className="font-metric" style={{ fontSize: 26, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            <AnimatedNumber value={totalCostBase} format={n => formatDKK(Math.round(n))} delay={200} />
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>Total invested</div>
        </div>

        {/* Donut chart KPI */}
        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <ResponsiveContainer width={90} height={90}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={42}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: d.fill }} />
                  <span style={{ color: "var(--text-secondary)" }}>{d.name}</span>
                </div>
                <span className="font-metric" style={{ color: "var(--text-muted)" }}>{d.pct.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <Card className="animate-fade-up anim-2">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
            <RefreshCw size={11} />
            Prices updated: today at 20:00
          </div>
        </CardHeader>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Asset", "Type", "Quantity", "Avg. cost", "Current price", "Total value", "P&L"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 20px",
                      textAlign: i >= 3 ? "right" : "left",
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOLDINGS.map(h => <HoldingRow key={h.id} holding={h} />)}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "1px solid var(--border)" }}>
                <td colSpan={5} style={{ padding: "12px 20px", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                  TOTAL
                </td>
                <td style={{ padding: "12px 20px", textAlign: "right" }}>
                  <span className="font-metric" style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
                    {formatDKK(totalPortfolio)}
                  </span>
                </td>
                <td style={{ padding: "12px 20px", textAlign: "right" }}>
                  <div className="font-metric" style={{ fontSize: 13, fontWeight: 600, color: totalPnl >= 0 ? "var(--green)" : "var(--red)" }}>
                    {totalPnl >= 0 ? "+" : ""}{formatDKK(totalPnl)}
                  </div>
                  <div className="font-metric" style={{ fontSize: 11, color: totalPnl >= 0 ? "var(--green)" : "var(--red)" }}>
                    {formatPct(totalPnlPct)}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Disclaimer */}
      <div
        className="animate-fade-up anim-3"
        style={{ marginTop: 20, fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.7 }}
      >
        Equity prices from Yahoo Finance (daily after market close). Crypto prices from CoinGecko (live).
        Pension value is entered manually. EUR/DKK: {EUR_DKK.toFixed(2)} · USD/DKK: {USD_DKK.toFixed(2)}.
      </div>
    </div>
  );
}
