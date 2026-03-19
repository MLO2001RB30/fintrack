"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ExternalLink, ChevronDown, CreditCard, RefreshCw } from "lucide-react";
import {
  SUBSCRIPTIONS,
  MONTHLY_BURN,
  formatDKK,
  monthlyEquivalent,
  type Subscription,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { EmptyState } from "@/components/ui/empty-state";

type SortKey = "merchant" | "amount" | "cadence" | "nextExpected" | "status";
type FilterStatus = "all" | "active" | "paused" | "cancelled";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(iso: string) {
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (diff < 0) return "Overskredet";
  if (diff === 0) return "I dag";
  if (diff === 1) return "I morgen";
  return `Om ${diff} dage`;
}

export function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("amount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let subs = [...SUBSCRIPTIONS];
    if (search) subs = subs.filter(s => s.merchant.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== "all") subs = subs.filter(s => s.status === filterStatus);
    subs.sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      if (sortKey === "merchant") { va = a.merchant; vb = b.merchant; }
      if (sortKey === "amount") { va = monthlyEquivalent(a); vb = monthlyEquivalent(b); }
      if (sortKey === "cadence") { va = a.cadence; vb = b.cadence; }
      if (sortKey === "nextExpected") { va = a.nextExpected; vb = b.nextExpected; }
      if (sortKey === "status") { va = a.status; vb = b.status; }
      if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return sortDir === "asc" ? va - (vb as number) : (vb as number) - va;
    });
    return subs;
  }, [search, filterStatus, sortKey, sortDir]);

  const activeMonthly = SUBSCRIPTIONS.filter(s => s.status === "active").reduce((s, sub) => s + monthlyEquivalent(sub), 0);
  const annualBurn = activeMonthly * 12;

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(k)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "none",
        border: "none",
        cursor: "pointer",
        color: sortKey === k ? "var(--text-primary)" : "var(--text-muted)",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontFamily: "inherit",
        padding: 0,
      }}
    >
      {label}
      <ArrowUpDown size={10} style={{ opacity: sortKey === k ? 1 : 0.4 }} />
    </button>
  );

  return (
    <div className="page-wrap">
      <PageHeader
        title="Abonnementer"
        subtitle="Automatisk opdaget fra dine banktransaktioner"
      />

      {/* Burn summary */}
      <div className="animate-fade-up anim-1 grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Månedligt forbrug", value: formatDKK(activeMonthly), sub: "aktive abonnementer" },
          { label: "Årligt forbrug", value: formatDKK(annualBurn), sub: "estimeret" },
          { label: "Aktive", value: `${SUBSCRIPTIONS.filter(s => s.status === "active").length}`, sub: "abonnementer" },
          { label: "På pause / Annullerede", value: `${SUBSCRIPTIONS.filter(s => s.status !== "active").length}`, sub: "abonnementer" },
        ].map(s => (
          <div
            key={s.label}
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
              {s.label}
            </div>
            <div className="num" style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly burn bar */}
      <Card className="animate-fade-up anim-2" style={{ marginBottom: 20 }}>
        <CardHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CreditCard size={13} color="var(--text-muted)" />
            <CardTitle>Månedligt forbrug fordelt</CardTitle>
          </div>
          <span className="num" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
            {formatDKK(activeMonthly)}/md
          </span>
        </CardHeader>
        <CardBody>
          <div style={{ display: "flex", gap: 2, height: 10, borderRadius: 6, overflow: "hidden" }}>
            {SUBSCRIPTIONS.filter(s => s.status === "active")
              .sort((a, b) => monthlyEquivalent(b) - monthlyEquivalent(a))
              .map((sub, i) => {
                const pct = (monthlyEquivalent(sub) / activeMonthly) * 100;
                const hue = (i * 47) % 360;
                return (
                  <div
                    key={sub.id}
                    title={`${sub.merchant}: ${formatDKK(monthlyEquivalent(sub))}/md`}
                    style={{
                      flex: `0 0 ${pct}%`,
                      background: `hsl(${hue},65%,58%)`,
                      transition: "opacity 150ms",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  />
                );
              })}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 10 }}>
            {SUBSCRIPTIONS.filter(s => s.status === "active")
              .sort((a, b) => monthlyEquivalent(b) - monthlyEquivalent(a))
              .slice(0, 6)
              .map((sub, i) => {
                const hue = (i * 47) % 360;
                return (
                  <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text-secondary)" }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: `hsl(${hue},65%,58%)` }} />
                    {sub.merchant}
                  </div>
                );
              })}
          </div>
        </CardBody>
      </Card>

      {/* Filters */}
      <div
        className="animate-fade-up anim-3"
        style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}
      >
        {/* Search */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 12px",
            maxWidth: 320,
          }}
        >
          <Search size={13} color="var(--text-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søg abonnementer..."
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: 13,
              fontFamily: "inherit",
              width: "100%",
            }}
          />
        </div>

        {/* Status filter */}
        {(["all", "active", "paused", "cancelled"] as FilterStatus[]).map(f => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            style={{
              padding: "7px 14px",
              borderRadius: 7,
              border: "1px solid",
              borderColor: filterStatus === f ? "var(--accent)" : "var(--border)",
              background: filterStatus === f ? "var(--accent-glow)" : "transparent",
              color: filterStatus === f ? "var(--accent)" : "var(--text-secondary)",
              fontSize: 12.5,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 120ms",
              textTransform: "capitalize",
            }}
          >
            {f === "all" ? "Alle" : f === "active" ? "Aktive" : f === "paused" ? "På pause" : "Annullerede"}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="animate-fade-up anim-4">
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[
                  { key: "merchant" as SortKey, label: "Abonnement", width: "auto" },
                  { key: "amount" as SortKey, label: "Månedlig pris", width: 140, align: "right" as const },
                  { key: "cadence" as SortKey, label: "Frekvens", width: 120 },
                  { key: "nextExpected" as SortKey, label: "Næste opkrævning", width: 160 },
                  { key: "status" as SortKey, label: "Status", width: 110 },
                  { key: null, label: "Handling", width: 80 },
                ].map(col => (
                  <th
                    key={col.key ?? col.label}
                    style={{
                      padding: "12px 20px",
                      textAlign: (col as any).align ?? "left",
                      width: col.width,
                      fontWeight: 500,
                    }}
                  >
                    {col.key ? <SortBtn k={col.key} label={col.label} /> : (
                      <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {col.label}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub, i) => {
                const monthly = monthlyEquivalent(sub);
                const days = sub.status === "active" ? daysUntil(sub.nextExpected) : null;
                const urgent = days && ["I dag", "I morgen"].some(d => days.startsWith(d));
                return (
                  <tr
                    key={sub.id}
                    id={sub.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                      transition: "background 100ms",
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--hover-bg)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                  >
                    {/* Merchant */}
                    <td style={{ padding: "13px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <MerchantLogo domain={sub.domain} merchant={sub.merchant} size={34} radius={9} />
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>{sub.merchant}</div>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{sub.category}</div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: "13px 20px", textAlign: "right" }}>
                      <span className="num" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                        {formatDKK(monthly)}
                      </span>
                      {sub.cadence !== "monthly" && (
                        <div className="num" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {formatDKK(sub.amountOere)}/{sub.cadence === "quarterly" ? "kvartal" : "år"}
                        </div>
                      )}
                    </td>

                    {/* Cadence */}
                    <td style={{ padding: "13px 20px" }}>
                      <Badge variant={sub.cadence} size="sm">
                        {sub.cadence === "monthly" ? "Månedlig" : sub.cadence === "quarterly" ? "Kvartalsvis" : "Årlig"}
                      </Badge>
                    </td>

                    {/* Next charge */}
                    <td style={{ padding: "13px 20px" }}>
                      {sub.status === "active" ? (
                        <div>
                          <div style={{ fontSize: 13, color: urgent ? "var(--yellow)" : "var(--text-primary)" }}>
                            {days}
                          </div>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{formatDate(sub.nextExpected)}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "13px 20px" }}>
                      <Badge variant={sub.status}>
                        {sub.status === "active" ? "Aktiv" : sub.status === "paused" ? "Pause" : "Annulleret"}
                      </Badge>
                    </td>

                    {/* Action */}
                    <td style={{ padding: "13px 20px" }}>
                      {sub.cancelUrl && sub.status === "active" ? (
                        <a
                          href={sub.cancelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Åbn opsigelsessiden hos udbyderen"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            color: "var(--text-muted)",
                            textDecoration: "none",
                            padding: "4px 8px",
                            borderRadius: 5,
                            border: "1px solid var(--border)",
                            transition: "all 120ms",
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.color = "var(--red)";
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(239,68,68,0.3)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                          }}
                        >
                          Opsig <ExternalLink size={10} />
                        </a>
                      ) : sub.status === "active" ? (
                        <span
                          title="Direkte opsigelseslink ikke tilgængeligt for denne udbyder"
                          style={{ fontSize: 11.5, color: "var(--text-muted)", cursor: "help" }}
                        >
                          —
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <EmptyState
              icon={<RefreshCw size={22} />}
              title="Ingen abonnementer fundet"
              description={search || filterStatus !== "all"
                ? "Prøv at justere dine filtre eller din søgning."
                : "Tilslut dine bankkonti for at automatisk opdage abonnementer fra dine transaktioner."}
            />
          )}
        </div>
      </Card>

      {/* Footnote explaining Opsig availability */}
      <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
        <strong style={{ color: "var(--text-secondary)" }}>Om opsigelseslinks:</strong>{" "}
        "Opsig"-knappen vises kun for udbydere, hvor FinTrack kender det direkte link til opsigelsessiden.
        For øvrige abonnementer skal du manuelt logge ind hos udbyderen for at opsige.
      </div>
    </div>
  );
}
