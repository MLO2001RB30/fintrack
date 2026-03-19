"use client";

import { useState, useMemo } from "react";
import { Search, ArrowLeftRight, RefreshCw, X, Tag } from "lucide-react";
import { TRANSACTIONS, ACCOUNTS, formatDKK, type Transaction } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import Link from "next/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// Generate a plausible raw bank description from the merchant name
function rawDescription(tx: Transaction): string {
  const date = tx.date.replace(/-/g, "");
  const upper = tx.merchant.toUpperCase().replace(/\s+/g, " ").slice(0, 22);
  const ref = Math.abs(tx.amountOere).toString().slice(-6);
  return `${upper} ${date} REF${ref}`;
}

// ─── Transaction Detail Modal ─────────────────────────────────────────────────

function TransactionModal({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const account = ACCOUNTS.find(a => a.id === tx.accountId);
  const isPos = tx.amountOere > 0;

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 440,
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MerchantLogo merchant={tx.merchant} size={40} radius={10} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{tx.merchant}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
                {new Date(tx.date).toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: 4,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              transition: "color 100ms",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount */}
        <div
          style={{
            padding: "20px 20px 16px",
            display: "flex",
            alignItems: "baseline",
            gap: 6,
          }}
        >
          <span
            className="num"
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: isPos ? "var(--green)" : "var(--text-primary)",
            }}
          >
            {isPos ? "+" : ""}{formatDKK(tx.amountOere)}
          </span>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>DKK</span>
        </div>

        {/* Details */}
        <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            {
              label: "Kategori",
              value: (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Tag size={11} color="var(--text-muted)" />
                  <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{tx.category}</span>
                </div>
              ),
            },
            {
              label: "Konto",
              value: (
                <span style={{ fontSize: 13, color: "var(--text-primary)" }}>
                  {account?.institution} — {account?.accountName}
                </span>
              ),
            },
            {
              label: "IBAN",
              value: (
                <span className="num" style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                  {account?.iban ?? "—"}
                </span>
              ),
            },
            {
              label: "Rå bankbeskrivelse",
              value: (
                <span className="num" style={{ fontSize: 11.5, color: "var(--text-muted)", wordBreak: "break-all" }}>
                  {rawDescription(tx)}
                </span>
              ),
            },
            tx.isSubscription
              ? {
                  label: "Type",
                  value: (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11.5,
                        color: "var(--accent)",
                        background: "var(--accent-glow)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        border: "1px solid rgba(245,158,11,0.2)",
                      }}
                    >
                      <RefreshCw size={9} /> Abonnement
                    </span>
                  ),
                }
              : null,
          ]
            .filter(Boolean)
            .map((row, i, arr) => (
              <div
                key={row!.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "11px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0, minWidth: 130 }}>
                  {row!.label}
                </span>
                <div style={{ textAlign: "right" }}>{row!.value}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── All unique categories ────────────────────────────────────────────────────

const ALL_CATEGORIES = Array.from(new Set(TRANSACTIONS.map(t => t.category))).sort();

// ─── Main page ────────────────────────────────────────────────────────────────

export function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    let txs = [...TRANSACTIONS];
    if (search) txs = txs.filter(t =>
      t.merchant.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    );
    if (filterAccount !== "all") txs = txs.filter(t => t.accountId === filterAccount);
    if (filterCategory !== "all") txs = txs.filter(t => t.category === filterCategory);
    return txs.sort((a, b) => b.date.localeCompare(a.date));
  }, [search, filterAccount, filterCategory]);

  const groups = groupByDate(filtered);
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  const totalIn = filtered.filter(t => t.amountOere > 0).reduce((s, t) => s + t.amountOere, 0);
  const totalOut = filtered.filter(t => t.amountOere < 0).reduce((s, t) => s + t.amountOere, 0);

  const hasFilters = search || filterAccount !== "all" || filterCategory !== "all";

  return (
    <div style={{ padding: "32px 36px", position: "relative", zIndex: 1 }}>
      {selectedTx && (
        <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}

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
            maxWidth: 280,
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

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
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
          <option value="all">Alle kategorier</option>
          {ALL_CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilterAccount("all"); setFilterCategory("all"); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "8px 12px",
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12.5,
              color: "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "color 100ms",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <X size={12} /> Ryd filtre
          </button>
        )}
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
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedTx(tx)}
                      onKeyDown={e => e.key === "Enter" && setSelectedTx(tx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 13,
                        padding: "12px 18px",
                        borderBottom: i < txs.length - 1 ? "1px solid var(--border)" : "none",
                        transition: "background 100ms",
                        cursor: "pointer",
                        outline: "none",
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
