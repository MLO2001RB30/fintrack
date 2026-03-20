"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, AlertTriangle, RefreshCw, Plus, CheckCircle, Save, Zap } from "lucide-react";
import { ACCOUNTS, SUBSCRIPTIONS, TRANSACTIONS, formatDKK } from "@/lib/mock-data";
import {
  mergeAccountPreferences,
  normalizeAccountPreference,
  readLocalAccountPreferences,
  writeLocalAccountPreferences,
  type AccountPreference,
} from "@/lib/account-preferences";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { MerchantLogo } from "@/components/ui/merchant-logo";

const BANKS = [
  { id: "DANSKE_BANK_DABADKKK", name: "Danske Bank",          domain: "danskebank.dk", available: true },
  { id: "NORDEA_NDEADKKK",      name: "Nordea",               domain: "nordea.dk",     available: true },
  { id: "JYSKE_BANK",           name: "Jyske Bank",           domain: "jyskebank.dk",  available: true },
  { id: "SYDBANK",              name: "Sydbank",              domain: "sydbank.dk",    available: true },
  { id: "LUNAR",                name: "Lunar",                domain: "lunar.app",     available: true },
  { id: "ARBEJDERNES_LANDSBANK",name: "Arbejdernes Landsbank",domain: "al-bank.dk",    available: true },
];

type PersistenceMode = "remote" | "local";

type AccountPreferencesResponse =
  | {
      ok: true;
      data: {
        persistence: PersistenceMode;
        preferences?: AccountPreference[];
        preference?: AccountPreference;
      };
    }
  | {
      ok: false;
      error: {
        message: string;
      };
    };

function buildAccountBalanceSeries(accountId: string, currentBalanceOere: number) {
  const accountTransactions = TRANSACTIONS.filter((transaction) => transaction.accountId === accountId)
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 7);
  const values = [currentBalanceOere];
  let runningBalance = currentBalanceOere;

  for (const transaction of accountTransactions) {
    runningBalance -= transaction.amountOere;
    values.push(runningBalance);
  }

  return values.reverse();
}

function Sparkline({ values, tone = "default" }: { values: number[]; tone?: "default" | "expired" }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: 68 }}>
      <polyline
        points={points}
        fill="none"
        stroke={tone === "expired" ? "var(--red)" : "var(--accent)"}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccountCard({
  account,
  selected,
  preference,
  onSelect,
  onReconnect,
  onSync,
}: {
  account: (typeof ACCOUNTS)[number];
  selected: boolean;
  preference?: AccountPreference;
  onSelect: (accountId: string) => void;
  onReconnect: (accountId: string) => void;
  onSync: (accountId: string) => void;
}) {
  const isExpired = account.status === "expired";
  const recentTransactions = TRANSACTIONS.filter((transaction) => transaction.accountId === account.id);
  const latestTransaction = [...recentTransactions].sort((left, right) => right.date.localeCompare(left.date))[0];
  const recentOutflow = recentTransactions
    .filter((transaction) => transaction.amountOere < 0)
    .slice(0, 5)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountOere), 0);
  const balanceSeries = buildAccountBalanceSeries(account.id, account.balanceOere);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(account.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(account.id);
        }
      }}
      style={{
        background: "var(--surface-1)",
        border: `1px solid ${
          selected
            ? "var(--accent)"
            : isExpired
              ? "var(--danger-border)"
              : "var(--border)"
        }`,
        borderRadius: "var(--radius-card)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        overflow: "hidden",
        transition: "border-color 150ms, box-shadow 150ms",
        textAlign: "left",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 0 0 3px var(--ring)";
        e.currentTarget.style.borderColor = selected
          ? "var(--accent)"
          : isExpired
            ? "var(--danger-border-strong)"
            : "var(--border-strong)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = selected
          ? "var(--accent)"
          : isExpired
            ? "var(--danger-border)"
            : "var(--border)";
      }}
    >
      {isExpired && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, var(--red), transparent)",
          }}
        />
      )}
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MerchantLogo domain={account.domain} merchant={account.institution} size={40} radius={10} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
              {preference?.nickname || account.accountName}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {account.institution} · {account.accountName}
            </div>
          </div>
        </div>
        <Badge variant={account.accountType}>
          {account.accountType === "checking" ? "Checking" : account.accountType === "savings" ? "Savings" : "Credit"}
        </Badge>
      </div>

      {/* Balance */}
      <div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
          Balance
        </div>
        <div className="font-metric" style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
          {formatDKK(account.balanceOere)}
        </div>
      </div>

      <div
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "10px 12px 6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Recent balance trend
          </span>
          <span style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
            {recentOutflow > 0 ? `${formatDKK(recentOutflow)} out` : "No recent outflow"}
          </span>
        </div>
        <Sparkline values={balanceSeries} tone={isExpired ? "expired" : "default"} />
      </div>

      {/* IBAN */}
      <div
        style={{
          fontFamily: "var(--font-metric)",
          fontSize: 11.5,
          color: "var(--text-muted)",
          background: "var(--surface-2)",
          padding: "6px 10px",
          borderRadius: 6,
          letterSpacing: "0.04em",
        }}
      >
        {account.iban}
      </div>

      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {latestTransaction
          ? `Latest activity: ${latestTransaction.merchant} on ${new Date(latestTransaction.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}.`
          : "No transactions linked yet."}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
          {isExpired ? (
            <>
              <AlertTriangle size={12} color="var(--red)" />
              <span style={{ color: "var(--red)" }}>Connection expired</span>
            </>
          ) : (
            <>
              <CheckCircle size={12} color="var(--green)" />
              <span style={{ color: "var(--text-muted)" }}>Synced {account.lastSynced}</span>
            </>
          )}
        </div>
        {isExpired ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onReconnect(account.id);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 12px",
              background: "var(--danger-bg)",
              border: "1px solid var(--danger-border)",
              borderRadius: 6,
              fontSize: 12,
              color: "var(--red)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <RefreshCw size={11} /> Reconnect
          </button>
        ) : (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onSync(account.id);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 12px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 12,
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 120ms",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <RefreshCw size={11} /> Sync
          </button>
        )}
      </div>
    </div>
  );
}

function ConnectCard({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      style={{
        background: "transparent",
        border: "1.5px dashed var(--border-strong)",
        borderRadius: "var(--radius-card)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: "pointer",
        color: "var(--text-muted)",
        transition: "all 150ms",
        fontFamily: "inherit",
        minHeight: 200,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
        (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-glow)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          border: "1.5px dashed currentColor",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus size={20} />
      </div>
      <span style={{ fontSize: 13.5, fontWeight: 500 }}>Connect bank</span>
      <span style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", maxWidth: 160, lineHeight: 1.4 }}>
        Connect through GoCardless Open Banking
      </span>
    </button>
  );
}

function ConnectModal({
  onClose,
  onConnect,
  reconnectLabel,
}: {
  onClose: () => void;
  onConnect: (bankName: string) => void;
  reconnectLabel?: string;
}) {
  return (
    <div
      className="animate-backdrop-in"
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--overlay-scrim)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="modal-sheet animate-modal-in"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-card)",
          padding: "28px",
          width: "100%",
          maxWidth: 480,
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, letterSpacing: "-0.02em" }}>
            {reconnectLabel ? `Reconnect ${reconnectLabel}` : "Choose your bank"}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
            {reconnectLabel
              ? "Re-authorize the connection to refresh transactions and keep forecasts accurate."
              : "Secure connection through GoCardless Open Banking (PSD2)"}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {BANKS.map(bank => (
            <button
              key={bank.id}
              onClick={() => onConnect(bank.name)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 120ms",
                textAlign: "left",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-glow)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)";
              }}
            >
              <MerchantLogo domain={bank.domain} merchant={bank.name} size={32} radius={8} />
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{bank.name}</span>
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: "var(--success-bg)",
            border: "1px solid var(--success-border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          <Zap size={12} color="var(--green)" />
          Your bank data is read-only. No payments can be initiated.
        </div>
      </div>
    </div>
  );
}

export function AccountsPage({
  initialReconnectId = null,
  initialAccountId = null,
}: {
  initialReconnectId?: string | null;
  initialAccountId?: string | null;
}) {
  const [accounts, setAccounts] = useState(ACCOUNTS);
  const [modal, setModal] = useState(Boolean(initialReconnectId));
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingReconnectId, setPendingReconnectId] = useState<string | null>(initialReconnectId);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccountId ?? initialReconnectId ?? ACCOUNTS[0].id);
  const [preferences, setPreferences] = useState<AccountPreference[]>(() => readLocalAccountPreferences());
  const [preferenceMode, setPreferenceMode] = useState<PersistenceMode>("local");
  const [draftNickname, setDraftNickname] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [isSavingPreference, setIsSavingPreference] = useState(false);
  const [preferenceMessage, setPreferenceMessage] = useState<string | null>(null);

  const totalBalance = accounts.reduce((s, a) => s + a.balanceOere, 0);
  const activeCount = accounts.filter(a => a.status === "active").length;
  const expiredCount = accounts.filter(a => a.status === "expired").length;
  const pendingReconnectAccount = accounts.find((account) => account.id === pendingReconnectId);
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? accounts[0];
  const selectedPreference = preferences.find((preference) => preference.accountId === selectedAccount?.id);
  const selectedTransactions = useMemo(
    () =>
      TRANSACTIONS.filter((transaction) => transaction.accountId === selectedAccount?.id)
        .sort((left, right) => right.date.localeCompare(left.date))
        .slice(0, 5),
    [selectedAccount],
  );
  const selectedSubscriptions = useMemo(
    () => SUBSCRIPTIONS.filter((subscription) => subscription.accountId === selectedAccount?.id),
    [selectedAccount],
  );
  const selectedOutflow = selectedTransactions
    .filter((transaction) => transaction.amountOere < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountOere), 0);
  const selectedSeries = selectedAccount ? buildAccountBalanceSeries(selectedAccount.id, selectedAccount.balanceOere) : [];

  useEffect(() => {
    let isCancelled = false;

    async function loadPreferences() {
      try {
        const response = await fetch("/api/account-preferences", {
          cache: "no-store",
        });
        const payload = (await response.json()) as AccountPreferencesResponse;

        if (!response.ok || !payload.ok) {
          throw new Error(payload.ok ? "Unable to load account preferences." : payload.error.message);
        }

        if (isCancelled) {
          return;
        }

        setPreferenceMode(payload.data.persistence);
        setPreferences((current) => {
          const next = mergeAccountPreferences(current, payload.data.preferences ?? []);
          writeLocalAccountPreferences(next);
          return next;
        });
      } catch {
        if (!isCancelled) {
          setPreferenceMode("local");
        }
      }
    }

    void loadPreferences();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    setDraftNickname(selectedPreference?.nickname ?? "");
    setDraftNote(selectedPreference?.note ?? "");
    setPreferenceMessage(null);
  }, [selectedPreference?.accountId, selectedPreference?.nickname, selectedPreference?.note, selectedAccountId]);

  function openReconnect(accountId: string) {
    setPendingReconnectId(accountId);
    setModal(true);
    setSuccessMessage(null);
    setSelectedAccountId(accountId);
  }

  function handleConnect(bankName: string) {
    if (pendingReconnectId) {
      setAccounts((current) =>
        current.map((account) =>
          account.id === pendingReconnectId ? { ...account, status: "active", lastSynced: "just now" } : account,
        ),
      );
      setSuccessMessage(`${pendingReconnectAccount?.institution ?? bankName} has been reconnected and synced again.`);
    } else {
      setSuccessMessage(`${bankName} has been connected in the demo flow.`);
    }

    setModal(false);
    setPendingReconnectId(null);
  }

  function handleSync(accountId: string) {
    setAccounts((current) =>
      current.map((account) => (account.id === accountId ? { ...account, lastSynced: "just now" } : account)),
    );
    setSuccessMessage("The account has been synced again.");
  }

  async function handleSavePreference() {
    if (!selectedAccount) {
      return;
    }

    setIsSavingPreference(true);
    const optimisticPreference = normalizeAccountPreference({
      accountId: selectedAccount.id,
      nickname: draftNickname,
      note: draftNote,
    });

    setPreferences((current) => {
      const next = mergeAccountPreferences(current, [optimisticPreference]);
      writeLocalAccountPreferences(next);
      return next;
    });

    try {
      const response = await fetch("/api/account-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: selectedAccount.id,
          nickname: draftNickname,
          note: draftNote,
        }),
      });
      const payload = (await response.json()) as AccountPreferencesResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "Unable to save account preference." : payload.error.message);
      }

      setPreferenceMode(payload.data.persistence);

      const savedPreference = payload.data.preference;
      if (savedPreference) {
        setPreferences((current) => {
          const next = mergeAccountPreferences(current, [savedPreference]);
          writeLocalAccountPreferences(next);
          return next;
        });
      }

      setPreferenceMessage(
        payload.data.persistence === "remote"
          ? "Saved to your account workspace."
          : "Saved on this device while account sync is unavailable in this environment.",
      );
    } catch {
      setPreferenceMode("local");
      setPreferenceMessage("Saved on this device. We couldn't sync this account context right now.");
    } finally {
      setIsSavingPreference(false);
    }
  }

  return (
    <div className="page-wrap">
      {modal && (
        <ConnectModal
          onClose={() => {
            setModal(false);
            setPendingReconnectId(null);
          }}
          onConnect={handleConnect}
          reconnectLabel={pendingReconnectAccount?.institution}
        />
      )}

      <PageHeader
        title="Accounts"
        subtitle={`${activeCount} active connections · ${formatDKK(totalBalance)} total balance`}
        action={
          <Button type="button" variant="primary" size="md" icon={<Plus size={14} strokeWidth={1.5} />} onClick={() => setModal(true)}>
            Connect bank
          </Button>
        }
      />

      {pendingReconnectAccount && modal ? (
        <div
          className="animate-fade-up anim-1"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            background: "var(--accent-glow)",
            border: "1px solid var(--accent-border)",
            borderRadius: "var(--radius-card)",
            marginBottom: 20,
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          <RefreshCw size={14} color="var(--accent)" />
          <span>
            You are here to reconnect <strong style={{ color: "var(--text-primary)" }}>{pendingReconnectAccount.institution}</strong> so forecasts and
            transactions become reliable again.
          </span>
        </div>
      ) : null}

      {successMessage ? (
        <div
          className="animate-fade-up anim-1"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            background: "var(--success-bg)",
            border: "1px solid var(--success-border)",
            borderRadius: "var(--radius-card)",
            marginBottom: 20,
            fontSize: 13,
            color: "var(--green)",
          }}
        >
          <CheckCircle size={14} />
          <span>{successMessage}</span>
        </div>
      ) : null}

      {/* Summary bar */}
      <Card className="animate-fade-up anim-1" style={{ marginBottom: 24 }}>
        <CardBody className="accounts-summary">
          {[
            { label: "Total balance", value: formatDKK(totalBalance), highlight: true },
            { label: "Active connections", value: `${activeCount}` },
            { label: "Expired connections", value: `${expiredCount}` },
            { label: "Last synced", value: "2 min. ago" },
          ].map(stat => (
            <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {stat.label}
              </span>
              <span
                className="font-metric"
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: stat.highlight ? "var(--accent)" : "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </CardBody>
      </Card>

      {selectedAccount ? (
        <Card className="animate-fade-up anim-2" style={{ marginBottom: 24 }}>
          <CardBody
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr 0.85fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div style={{ display: "grid", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <MerchantLogo domain={selectedAccount.domain} merchant={selectedAccount.institution} size={44} radius={12} />
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                        {selectedPreference?.nickname || selectedAccount.accountName}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {selectedAccount.institution} · {selectedAccount.accountName}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Badge variant={selectedAccount.accountType}>
                      {selectedAccount.accountType === "checking"
                        ? "Checking"
                        : selectedAccount.accountType === "savings"
                          ? "Savings"
                          : "Credit"}
                    </Badge>
                    <Badge variant={selectedAccount.status === "expired" ? "expired" : selectedAccount.status === "error" ? "error" : "active"}>
                      {selectedAccount.status === "expired" ? "stale connection" : "healthy connection"}
                    </Badge>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link
                    href={`/transactions?account=${selectedAccount.id}&period=month`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "var(--accent-glow)",
                      color: "var(--accent)",
                      textDecoration: "none",
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    View transactions
                  </Link>
                  {selectedAccount.status === "expired" ? (
                    <button
                      type="button"
                      onClick={() => openReconnect(selectedAccount.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 14px",
                        borderRadius: 12,
                        background: "var(--danger-bg)",
                        border: "1px solid var(--danger-border)",
                        color: "var(--red)",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <RefreshCw size={13} /> Reconnect
                    </button>
                  ) : null}
                </div>
              </div>

              <div
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-card)",
                  padding: "16px 18px 12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      Balance trend
                    </div>
                    <div className="font-metric" style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.04em", marginTop: 4 }}>
                      {formatDKK(selectedAccount.balanceOere)}
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", textAlign: "right" }}>
                    <div>{selectedAccount.status === "expired" ? "Excluded from live balance until reconnected." : `Synced ${selectedAccount.lastSynced}`}</div>
                    <div style={{ marginTop: 4 }}>{selectedSubscriptions.length} recurring charge{selectedSubscriptions.length === 1 ? "" : "s"} linked</div>
                  </div>
                </div>
                <Sparkline values={selectedSeries} tone={selectedAccount.status === "expired" ? "expired" : "default"} />
              </div>

              <div className="grid-3">
                {[
                  { label: "Recent outflow", value: formatDKK(selectedOutflow), caption: "Across the latest 5 transactions" },
                  {
                    label: "Upcoming recurring",
                    value: `${selectedSubscriptions.length}`,
                    caption: selectedSubscriptions[0]
                      ? `${selectedSubscriptions[0].merchant} next`
                      : "No recurring charges linked",
                  },
                  {
                    label: "Connection health",
                    value: selectedAccount.status === "expired" ? "Needs attention" : "Healthy",
                    caption: selectedAccount.status === "expired" ? "Forecasts are stale until reconnected" : "Live balance included in overview",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderRadius: 16,
                      padding: "16px 18px",
                    }}
                  >
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{item.value}</div>
                    <div style={{ marginTop: 6, fontSize: 12.5, color: "var(--text-secondary)" }}>{item.caption}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 18,
                  display: "grid",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Account context</div>
                  <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    Save a nickname or note so this account makes sense everywhere else in the product.
                  </div>
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Nickname</label>
                  <input
                    value={draftNickname}
                    onChange={(event) => setDraftNickname(event.target.value)}
                    placeholder={selectedAccount.accountName}
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
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Internal note</label>
                  <textarea
                    value={draftNote}
                    onChange={(event) => setDraftNote(event.target.value)}
                    placeholder="Example: salary lands here, transfer excess cash to savings every month."
                    rows={4}
                    style={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "10px 12px",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 12.5, color: preferenceMessage ? "var(--green)" : "var(--text-secondary)" }}>
                    {preferenceMessage ??
                      (preferenceMode === "remote"
                        ? "This account context saves to your workspace."
                        : "This account context currently saves on this device.")}
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    disabled={isSavingPreference}
                    icon={<Save size={13} strokeWidth={1.5} />}
                    onClick={() => void handleSavePreference()}
                    style={{ fontWeight: 600, cursor: isSavingPreference ? "wait" : "pointer" }}
                  >
                    {isSavingPreference ? "Saving..." : "Save context"}
                  </Button>
                </div>
              </div>

              <div
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-card)",
                  padding: 18,
                  display: "grid",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Recent activity</div>
                {selectedTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      paddingBottom: 10,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{transaction.merchant}</div>
                      <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-muted)" }}>
                        {new Date(transaction.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {transaction.category}
                      </div>
                    </div>
                    <div className="font-metric" style={{ fontSize: 13.5, fontWeight: 700, color: transaction.amountOere > 0 ? "var(--green)" : "var(--text-primary)" }}>
                      {transaction.amountOere > 0 ? "+" : ""}
                      {formatDKK(transaction.amountOere)}
                    </div>
                  </div>
                ))}
                <Link
                  href={`/transactions?account=${selectedAccount.id}&period=month`}
                  style={{ fontSize: 12.5, color: "var(--accent)", textDecoration: "none" }}
                >
                  Open filtered transactions →
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* Account grid */}
      <div
        className="animate-fade-up anim-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {accounts.map(account => (
          <AccountCard
            key={account.id}
            account={account}
            selected={selectedAccountId === account.id}
            preference={preferences.find((preference) => preference.accountId === account.id)}
            onSelect={setSelectedAccountId}
            onReconnect={openReconnect}
            onSync={handleSync}
          />
        ))}
        <ConnectCard onOpen={() => setModal(true)} />
      </div>

      {/* Info */}
      <div
        className="animate-fade-up anim-3"
        style={{
          marginTop: 32,
          padding: "16px 20px",
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          fontSize: 12.5,
          color: "var(--text-muted)",
          lineHeight: 1.7,
        }}
      >
        <Building2 size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
        Bank connections are created through <strong style={{ color: "var(--text-secondary)" }}>GoCardless Open Banking</strong> (PSD2).
        Your login details are never shared with FinTrack. The connection is authorized directly through your bank&apos;s sign-in flow.
        Access tokens are encrypted with AES-256-GCM and expire automatically after 90 days.
      </div>
    </div>
  );
}
