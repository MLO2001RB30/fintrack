"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, CalendarRange, RefreshCw, Save, Search, X } from "lucide-react";
import { ACCOUNTS, MOCK_TODAY, TRANSACTIONS, formatDKK } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { PageHeader } from "@/components/ui/page-header";
import {
  mergeOverrideCollections,
  mergeTransactionOverrides,
  normalizeTransactionOverride,
  readLocalTransactionOverrides,
  writeLocalTransactionOverrides,
  type TransactionOverride,
  type TransactionRecord,
} from "@/lib/transaction-overrides";

type PeriodFilter = "all" | "month" | "last-month" | "year" | "12-months" | "custom";

const PERIOD_OPTIONS: Array<{ value: PeriodFilter; label: string }> = [
  { value: "all", label: "All time" },
  { value: "month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "year", label: "This year" },
  { value: "12-months", label: "Last 12 months" },
  { value: "custom", label: "Custom range" },
];

type PersistenceMode = "remote" | "local";

type TransactionOverrideResponse =
  | {
      ok: true;
      data: {
        persistence: PersistenceMode;
        overrides?: TransactionOverride[];
        override?: TransactionOverride;
      };
    }
  | {
      ok: false;
      error: {
        message: string;
      };
    };

type SaveResult = {
  persistence: PersistenceMode;
  message: string;
};

function groupByDate(txs: TransactionRecord[]): Record<string, TransactionRecord[]> {
  return txs.reduce((accumulator, transaction) => {
    if (!accumulator[transaction.date]) accumulator[transaction.date] = [];
    accumulator[transaction.date].push(transaction);
    return accumulator;
  }, {} as Record<string, TransactionRecord[]>);
}

function formatDateLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date(MOCK_TODAY);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}

function rawDescription(transaction: TransactionRecord) {
  const date = transaction.date.replace(/-/g, "");
  const merchant = transaction.merchant.toUpperCase().replace(/\s+/g, " ").slice(0, 22);
  const reference = Math.abs(transaction.amountOere).toString().slice(-6);
  return `${merchant} ${date} REF${reference}`;
}

function getPeriodRange(period: PeriodFilter, fromValue: string, toValue: string) {
  const today = new Date(MOCK_TODAY);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  if (period === "custom") {
    return {
      from: fromValue || null,
      to: toValue || null,
    };
  }

  if (period === "month") {
    return {
      from: `${currentYear}-${`${currentMonth + 1}`.padStart(2, "0")}-01`,
      to: MOCK_TODAY,
    };
  }

  if (period === "last-month") {
    const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayLastMonth = new Date(currentYear, currentMonth, 0);
    return {
      from: `${firstDayLastMonth.getFullYear()}-${`${firstDayLastMonth.getMonth() + 1}`.padStart(2, "0")}-${`${firstDayLastMonth.getDate()}`.padStart(2, "0")}`,
      to: `${lastDayLastMonth.getFullYear()}-${`${lastDayLastMonth.getMonth() + 1}`.padStart(2, "0")}-${`${lastDayLastMonth.getDate()}`.padStart(2, "0")}`,
    };
  }

  if (period === "year") {
    return {
      from: `${currentYear}-01-01`,
      to: MOCK_TODAY,
    };
  }

  if (period === "12-months") {
    const start = new Date(currentYear, currentMonth - 11, 1);
    return {
      from: `${start.getFullYear()}-${`${start.getMonth() + 1}`.padStart(2, "0")}-01`,
      to: MOCK_TODAY,
    };
  }

  return { from: null, to: null };
}

function formatPeriodSummary(period: PeriodFilter, fromValue: string, toValue: string) {
  const { from, to } = getPeriodRange(period, fromValue, toValue);
  if (!from && !to) return "No date filter";

  const format = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Start";

  return `${format(from)} - ${format(to)}`;
}

function TransactionModal({
  tx,
  categories,
  persistenceMode,
  onClose,
  onSave,
}: {
  tx: TransactionRecord;
  categories: string[];
  persistenceMode: PersistenceMode;
  onClose: () => void;
  onSave: (transactionId: string, updates: { category: string; note: string }) => Promise<SaveResult>;
}) {
  const account = ACCOUNTS.find((item) => item.id === tx.accountId);
  const isPositive = tx.amountOere > 0;
  const [category, setCategory] = useState(tx.category);
  const [note, setNote] = useState(tx.note ?? "");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function handleBackdrop(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div
      className="animate-backdrop-in"
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--overlay-scrim)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        className="modal-sheet animate-modal-in"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          width: "100%",
          maxWidth: 520,
          maxHeight: "min(92vh, 760px)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 22px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MerchantLogo merchant={tx.merchant} size={44} radius={12} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{tx.merchant}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                {new Date(tx.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
          <IconButton type="button" label="Close" onClick={onClose} style={{ color: "var(--grey-500)" }}>
            <X size={18} strokeWidth={1.5} />
          </IconButton>
        </div>

        <div
          style={{
            padding: "22px 22px 18px",
            display: "flex",
            alignItems: "baseline",
            gap: 6,
          }}
        >
          <span
            className="font-metric"
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: isPositive ? "var(--green)" : "var(--text-primary)",
            }}
          >
            {isPositive ? "+" : ""}
            {formatDKK(tx.amountOere)}
          </span>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>DKK</span>
        </div>

        <div style={{ padding: "0 22px 22px", display: "grid", gap: 14, overflowY: "auto" }}>
          <div style={{ display: "grid", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-control)",
                padding: "11px 12px",
                color: "var(--text-primary)",
                fontSize: 13.5,
                fontFamily: "inherit",
                outline: "none",
              }}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Internal note</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add context for future you"
              rows={3}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-control)",
                padding: "11px 12px",
                color: "var(--text-primary)",
                fontSize: 13.5,
                fontFamily: "inherit",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 0 }}>
            {[
              {
                label: "Account",
                value: `${account?.institution ?? "Unknown account"} - ${account?.accountName ?? "Unknown"}`,
              },
              { label: "IBAN", value: account?.iban ?? "—" },
              { label: "Raw bank description", value: rawDescription(tx) },
              tx.isSubscription ? { label: "Type", value: "Subscription" } : null,
            ]
              .filter(Boolean)
              .map((row, index, rows) => (
                <div
                  key={row!.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "12px 0",
                    borderBottom: index < rows.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 132 }}>{row!.label}</span>
                  <span
                    className="font-metric"
                    style={{
                      fontSize: 13,
                      color: "var(--text-primary)",
                      textAlign: "right",
                      wordBreak: "break-word",
                    }}
                  >
                    {row!.value}
                  </span>
                </div>
              ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12.5, color: savedMessage ? "var(--green)" : "var(--text-muted)" }}>
              {savedMessage ??
                (persistenceMode === "remote"
                  ? "Edits save to your account."
                  : "Edits save on this device while account sync is unavailable in this environment.")}
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isSaving}
              icon={<Save size={14} strokeWidth={1.5} />}
              onClick={async () => {
                setIsSaving(true);
                const result = await onSave(tx.id, { category, note });
                setSavedMessage(result.message);
                setIsSaving(false);
              }}
              style={{ fontWeight: 600, cursor: isSaving ? "wait" : "pointer" }}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TransactionsPage({
  initialReviewMode = null,
  initialReviewMerchant = null,
  initialCategory = null,
  initialPeriod = null,
  initialAccount = null,
  initialTransactionId = null,
}: {
  initialReviewMode?: string | null;
  initialReviewMerchant?: string | null;
  initialCategory?: string | null;
  initialPeriod?: string | null;
  initialAccount?: string | null;
  initialTransactionId?: string | null;
}) {
  const reviewMode = initialReviewMode;
  const reviewMerchant = initialReviewMerchant;
  const defaultPeriod =
    initialPeriod && PERIOD_OPTIONS.some((option) => option.value === initialPeriod)
      ? (initialPeriod as PeriodFilter)
      : "month";
  const [overrides, setOverrides] = useState<TransactionOverride[]>(() => readLocalTransactionOverrides());
  const [search, setSearch] = useState(reviewMerchant ?? "");
  const [filterAccount, setFilterAccount] = useState(initialAccount ?? "all");
  const [filterCategory, setFilterCategory] = useState(initialCategory ?? "all");
  const [filterPeriod, setFilterPeriod] = useState<PeriodFilter>(defaultPeriod);
  const [customFrom, setCustomFrom] = useState(filterPeriod === "custom" ? MOCK_TODAY.slice(0, 7) + "-01" : "");
  const [customTo, setCustomTo] = useState(filterPeriod === "custom" ? MOCK_TODAY : "");
  const [selectedTxId, setSelectedTxId] = useState<string | null>(initialTransactionId);
  const [hideInternalTransfers, setHideInternalTransfers] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [persistenceMode, setPersistenceMode] = useState<PersistenceMode>("local");

  const transactions = useMemo(
    () => mergeTransactionOverrides(TRANSACTIONS, overrides),
    [overrides],
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadOverrides() {
      try {
        const response = await fetch("/api/transaction-overrides", {
          cache: "no-store",
        });
        const payload = (await response.json()) as TransactionOverrideResponse;

        if (!response.ok || !payload.ok) {
          throw new Error(payload.ok ? "Unable to load transaction overrides." : payload.error.message);
        }

        if (isCancelled) {
          return;
        }

        setPersistenceMode(payload.data.persistence);
        setOverrides((current) => {
          const next = mergeOverrideCollections(current, payload.data.overrides ?? []);
          writeLocalTransactionOverrides(next);
          return next;
        });
      } catch {
        if (!isCancelled) {
          setPersistenceMode("local");
        }
      }
    }

    void loadOverrides();

    return () => {
      isCancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(transactions.map((transaction) => transaction.category))).sort(),
    [transactions],
  );

  const filtered = useMemo(() => {
    let current = [...transactions];
    const range = getPeriodRange(filterPeriod, customFrom, customTo);

    if (hideInternalTransfers) current = current.filter((transaction) => transaction.category !== "Transfer");
    if (search) {
      const query = search.toLowerCase();
      current = current.filter(
        (transaction) =>
          transaction.merchant.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query) ||
          (transaction.note ?? "").toLowerCase().includes(query),
      );
    }
    if (filterAccount !== "all") current = current.filter((transaction) => transaction.accountId === filterAccount);
    if (filterCategory !== "all") current = current.filter((transaction) => transaction.category === filterCategory);
    if (range.from) current = current.filter((transaction) => transaction.date >= range.from!);
    if (range.to) current = current.filter((transaction) => transaction.date <= range.to!);

    return current.sort((left, right) => right.date.localeCompare(left.date));
  }, [transactions, hideInternalTransfers, search, filterAccount, filterCategory, filterPeriod, customFrom, customTo]);

  const groups = groupByDate(filtered);
  const sortedDates = Object.keys(groups).sort((left, right) => right.localeCompare(left));
  const totalIn = filtered.filter((transaction) => transaction.amountOere > 0).reduce((sum, transaction) => sum + transaction.amountOere, 0);
  const totalOut = filtered.filter((transaction) => transaction.amountOere < 0).reduce((sum, transaction) => sum + transaction.amountOere, 0);
  const selectedTx = transactions.find((transaction) => transaction.id === selectedTxId) ?? null;

  const hasFilters =
    search ||
    filterAccount !== "all" ||
    filterCategory !== "all" ||
    filterPeriod !== defaultPeriod ||
    hideInternalTransfers ||
    customFrom ||
    customTo;

  const reviewCandidates =
    reviewMode === "transfer"
      ? transactions.filter((transaction) => transaction.category === "Transfer")
      : reviewMerchant
        ? transactions.filter((transaction) => transaction.merchant === reviewMerchant)
        : [];

  return (
    <div className="page-wrap">
      {selectedTx ? (
        <TransactionModal
          tx={selectedTx}
          categories={categories}
          persistenceMode={persistenceMode}
          onClose={() => setSelectedTxId(null)}
          onSave={async (transactionId, updates) => {
            const optimisticOverride = normalizeTransactionOverride({
              transactionId,
              category: updates.category,
              note: updates.note,
            });

            setOverrides((current) => {
              const next = mergeOverrideCollections(current, [optimisticOverride]);
              writeLocalTransactionOverrides(next);
              return next;
            });

            try {
              const response = await fetch("/api/transaction-overrides", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  transactionId,
                  category: updates.category,
                  note: updates.note,
                }),
              });
              const payload = (await response.json()) as TransactionOverrideResponse;

              if (!response.ok || !payload.ok) {
                throw new Error(payload.ok ? "Unable to save transaction changes." : payload.error.message);
              }

              setPersistenceMode(payload.data.persistence);

              const savedOverride = payload.data.override;
              if (savedOverride) {
                setOverrides((current) => {
                  const next = mergeOverrideCollections(current, [savedOverride]);
                  writeLocalTransactionOverrides(next);
                  return next;
                });
              }

              return {
                persistence: payload.data.persistence,
                message:
                  payload.data.persistence === "remote"
                    ? "Saved to your account."
                    : "Saved on this device while account sync is unavailable in this environment.",
              };
            } catch {
              setPersistenceMode("local");
              return {
                persistence: "local",
                message: "Saved on this device. We couldn't sync to your account right now.",
              };
            }
          }}
        />
      ) : null}

      <PageHeader
        title="Transactions"
        subtitle={`${filtered.length} transactions · ${formatPeriodSummary(filterPeriod, customFrom, customTo)}`}
      />

      <Card className="animate-fade-up anim-1" style={{ marginBottom: 18, padding: 16 }}>
        <div style={{ fontSize: 12.5, color: persistenceMode === "remote" ? "var(--green)" : "var(--text-secondary)" }}>
          {persistenceMode === "remote"
            ? "Transaction notes and category changes save to your account."
            : "Transaction notes and category changes currently save on this device while account sync is unavailable in this environment."}
        </div>
      </Card>

      {(reviewMode || reviewStatus) && (
        <Card className="animate-fade-up anim-1" style={{ marginBottom: 20, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                Review flow
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                {reviewMode === "transfer"
                  ? "Review internal transfers"
                  : reviewMerchant
                    ? `Review merchant: ${reviewMerchant}`
                    : "Review transactions"}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55, maxWidth: 680 }}>
                {reviewMode === "transfer"
                  ? "Confirm whether these movements should be treated as internal transfers and hidden from spend views."
                  : reviewMerchant
                    ? "Focus on the selected merchant and decide whether the transaction needs a better category or note."
                    : "Review the transactions that need attention."}
              </div>
              <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--text-muted)" }}>
                {reviewCandidates.length} matching transaction{reviewCandidates.length === 1 ? "" : "s"}
              </div>
              {reviewStatus ? <div style={{ marginTop: 10, fontSize: 12, color: "var(--green)" }}>{reviewStatus}</div> : null}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button href="/transactions" variant="secondary" size="md">
                Close review
              </Button>
              {reviewMode === "transfer" ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setFilterCategory("Transfer");
                      setReviewStatus("Transfer filter enabled.");
                    }}
                  >
                    Show transfers
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setHideInternalTransfers(true);
                      setFilterCategory("all");
                      setReviewStatus("Internal transfers are hidden in this session.");
                    }}
                  >
                    Hide as internal
                  </Button>
                </>
              ) : reviewMerchant ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setSearch(reviewMerchant);
                      setReviewStatus(`${reviewMerchant} is now highlighted in search.`);
                    }}
                  >
                    Keep filter
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => {
                      if (reviewCandidates[0]) setSelectedTxId(reviewCandidates[0].id);
                      setReviewStatus("Opening the most relevant transaction.");
                    }}
                  >
                    Open best match
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </Card>
      )}

      <div className="animate-fade-up anim-1 grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: "Money in", value: formatDKK(totalIn), color: "var(--green)" },
          { label: "Money out", value: formatDKK(Math.abs(totalOut)), color: "var(--red)" },
          { label: "Net", value: formatDKK(totalIn + totalOut), color: totalIn + totalOut >= 0 ? "var(--green)" : "var(--red)" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-sm)",
              padding: "16px 18px",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
              {item.label}
            </div>
            <div className="font-metric" style={{ fontSize: 22, fontWeight: 600, color: item.color, letterSpacing: "-0.02em" }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="animate-fade-up anim-2" style={{ display: "grid", gap: 12, marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-control)",
              padding: "10px 12px",
              minWidth: 220,
              maxWidth: 320,
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transactions..."
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

          <select
            value={filterAccount}
            onChange={(event) => setFilterAccount(event.target.value)}
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-control)",
              padding: "10px 12px",
              color: "var(--text-primary)",
              fontSize: 13,
              fontFamily: "inherit",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">All accounts</option>
            {ACCOUNTS.map((account) => (
              <option key={account.id} value={account.id}>
                {account.institution} - {account.accountName}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-control)",
              padding: "10px 12px",
              color: "var(--text-primary)",
              fontSize: 13,
              fontFamily: "inherit",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-control)",
              padding: "10px 12px",
            }}
          >
            <CalendarRange size={14} color="var(--text-muted)" />
            <select
              value={filterPeriod}
              onChange={(event) => setFilterPeriod(event.target.value as PeriodFilter)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-primary)",
                fontSize: 13,
                fontFamily: "inherit",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {hasFilters ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              icon={<X size={12} strokeWidth={1.5} />}
              onClick={() => {
                setSearch("");
                setFilterAccount("all");
                setFilterCategory("all");
                setFilterPeriod(defaultPeriod);
                setCustomFrom("");
                setCustomTo("");
                setHideInternalTransfers(false);
                setReviewStatus(null);
              }}
              style={{ color: "var(--grey-600)" }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>

        {filterPeriod === "custom" ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 12px",
                color: "var(--text-primary)",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <input
              type="date"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 12px",
                color: "var(--text-primary)",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
            Click any row to open details, recategorize it, and add a note.
          </div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-secondary)" }}>
            <input
              type="checkbox"
              checked={hideInternalTransfers}
              onChange={(event) => setHideInternalTransfers(event.target.checked)}
            />
            Hide internal transfers
          </label>
        </div>
      </div>

      <div className="animate-fade-up anim-3" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {sortedDates.map((date) => {
          const transactionsForDate = groups[date];
          const dayTotal = transactionsForDate.reduce((sum, transaction) => sum + transaction.amountOere, 0);

          return (
            <div key={date}>
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
                  className="font-metric"
                  style={{
                    fontSize: 12,
                    color: dayTotal >= 0 ? "var(--green)" : "var(--red)",
                    fontWeight: 500,
                  }}
                >
                  {dayTotal >= 0 ? "+" : ""}
                  {formatDKK(dayTotal)}
                </span>
              </div>

              <Card>
                {transactionsForDate.map((transaction, index) => {
                  const account = ACCOUNTS.find((item) => item.id === transaction.accountId);
                  const isPositive = transaction.amountOere > 0;

                  return (
                    <div
                      key={transaction.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedTxId(transaction.id)}
                      onKeyDown={(event) => event.key === "Enter" && setSelectedTxId(transaction.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 13,
                        padding: "12px 18px",
                        borderBottom: index < transactionsForDate.length - 1 ? "1px solid var(--border)" : "none",
                        transition: "background 100ms",
                        cursor: "pointer",
                        outline: "none",
                      }}
                      onMouseEnter={(event) => ((event.currentTarget as HTMLDivElement).style.background = "var(--hover-bg)")}
                      onMouseLeave={(event) => ((event.currentTarget as HTMLDivElement).style.background = "transparent")}
                    >
                      <MerchantLogo merchant={transaction.merchant} size={36} radius={9} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                          <span
                            style={{
                              fontSize: 13.5,
                              fontWeight: 500,
                              color: "var(--text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {transaction.merchant}
                          </span>
                          {transaction.isSubscription ? (
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
                                border: "1px solid var(--accent-border)",
                                flexShrink: 0,
                              }}
                            >
                              <RefreshCw size={8} /> Sub
                            </span>
                          ) : null}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                          {account?.institution} · {account?.accountName} · {transaction.category}
                          {transaction.note ? ` · Note: ${transaction.note}` : ""}
                        </div>
                      </div>

                      <div
                        className="font-metric"
                        style={{
                          fontSize: 14.5,
                          fontWeight: 600,
                          color: isPositive ? "var(--green)" : "var(--text-primary)",
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        {isPositive ? "+" : ""}
                        {formatDKK(transaction.amountOere)}
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          );
        })}

        {sortedDates.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight size={22} />}
            title="No transactions found"
            description="Try adjusting the filters or connect a bank account to pull in more activity."
            action={
              <Button href="/accounts" variant="primary" size="md">
                Connect bank account
              </Button>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
