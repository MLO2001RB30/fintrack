"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, RefreshCw, ArrowLeftRight } from "lucide-react";
import { TRANSACTIONS, ACCOUNTS, formatDKK, type Transaction } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import Link from "next/link";

function groupByDate(txs: Transaction[]): Record<string, Transaction[]> {
  return txs.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "I dag";
  if (d.toDateString() === yesterday.toDateString()) return "I går";
  return d.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" });
}


export function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [filterAccount, setFilterAccount] = useState("all");

  const filtered = useMemo(() => {
    let txs = [...TRANSACTIONS];
    if (search) txs = txs.filter(t =>
      t.merchant.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    );
    if (filterAccount !== "all") txs = txs.filter(t => t.accountId === filterAccount);
    return txs.sort((a, b) => b.date.localeCompare(a.date));
  }, [search, filterAccount]);

  const groups = groupByDate(filtered);
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  const totalIn = filtered.filter(t => t.amountOere > 0).reduce((s, t) => s + t.amountOere, 0);
  const totalOut = filtered.filter(t => t.amountOere < 0).reduce((s, t) => s + t.amountOere, 0);

  return (
    <div style={{ padding: "32px 36px", position: "relative", zIndex: 1 }}>
      <PageHeader
        title="Transaktioner"
        subtitle={`${filtered.length} transaktioner · ${ACCOUNTS.filter(a => a.status === "active").length} konti`}
      />

      {/* Summary */}
      <div
        className="animate-fade-up anim-1"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}
      >
        {[
          { label: "Indgående", value: formatDKK(totalIn), color: "var(--green)" },
          { label: "Udgående", value: formatDKK(Math.abs(totalOut)), color: "var(--red)" },
          { label: "Netto", value: formatDKK(totalIn + totalOut), color: totalIn + totalOut >= 0 ? "var(--green)" : "var(--red)" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{s.label}</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 600, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="animate-fade-up anim-2"
        style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}
      >
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
            placeholder="Søg transaktioner..."
            style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 13, fontFamily: "inherit", width: "100%" }}
          />
        </div>

        {/* Account filter */}
        <select
          value={filterAccount}
          onChange={e => setFilterAccount(e.target.value)}
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 12px",
            color: "var(--text-primary)",
            fontSize: 13,
            fontFamily: "inherit",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="all">Alle konti</option>
          {ACCOUNTS.map(a => (
            <option key={a.id} value={a.id}>{a.institution} — {a.accountName}</option>
          ))}
        </select>
      </div>

      {/* Transaction groups */}
      <div className="animate-fade-up anim-3" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {sortedDates.map(date => {
          const txs = groups[date];
          const dayTotal = txs.reduce((s, t) => s + t.amountOere, 0);
          return (
            <div key={date}>
              {/* Date header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  padding: "0 2px",
                }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                  {formatDateLabel(date)}
                </span>
                <span
                  className="num"
                  style={{
                    fontSize: 12,
                    color: dayTotal >= 0 ? "var(--green)" : "var(--red)",
                    fontWeight: 500,
                  }}
                >
                  {dayTotal >= 0 ? "+" : ""}{formatDKK(dayTotal)}
                </span>
              </div>

              <Card>
                {txs.map((tx, i) => {
                  const account = ACCOUNTS.find(a => a.id === tx.accountId);
                  const isPos = tx.amountOere > 0;
                  return (
                    <div
                      key={tx.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 13,
                        padding: "12px 18px",
                        borderBottom: i < txs.length - 1 ? "1px solid var(--border)" : "none",
                        transition: "background 100ms",
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = "var(--hover-bg)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                    >
                      {/* Merchant logo */}
                      <MerchantLogo merchant={tx.merchant} size={36} radius={9} />

                      {/* Merchant + account */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {tx.merchant}
                          </span>
                          {tx.isSubscription && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                                fontSize: 10,
                                color: "var(--accent)",
                                background: "var(--accent-glow)",
                                padding: "1px 6px",
                                borderRadius: 4,
                                border: "1px solid rgba(245,158,11,0.2)",
                                flexShrink: 0,
                              }}
                            >
                              <RefreshCw size={8} /> Abo
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                          {account?.institution} · {account?.accountName} · {tx.category}
                        </div>
                      </div>

                      {/* Amount */}
                      <div
                        className="num"
                        style={{
                          fontSize: 14.5,
                          fontWeight: 600,
                          color: isPos ? "var(--green)" : "var(--text-primary)",
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        {isPos ? "+" : ""}{formatDKK(tx.amountOere)}
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          );
        })}

        {sortedDates.length === 0 && (
          <EmptyState
            icon={<ArrowLeftRight size={22} />}
            title="Ingen transaktioner fundet"
            description="Prøv at justere dine filtre, eller tilslut en bankkonto for at se dine transaktioner."
            action={
              <Link
                href="/accounts"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  background: "var(--accent)",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                Tilslut bankkonto
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
