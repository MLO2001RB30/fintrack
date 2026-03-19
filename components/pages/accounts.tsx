"use client";

import { Building2, AlertTriangle, RefreshCw, Plus, CheckCircle, Zap } from "lucide-react";
import { ACCOUNTS, formatDKK } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { useState } from "react";

const BANKS = [
  { id: "DANSKE_BANK_DABADKKK", name: "Danske Bank",          domain: "danskebank.dk", available: true },
  { id: "NORDEA_NDEADKKK",      name: "Nordea",               domain: "nordea.dk",     available: true },
  { id: "JYSKE_BANK",           name: "Jyske Bank",           domain: "jyskebank.dk",  available: true },
  { id: "SYDBANK",              name: "Sydbank",              domain: "sydbank.dk",    available: true },
  { id: "LUNAR",                name: "Lunar",                domain: "lunar.app",     available: true },
  { id: "ARBEJDERNES_LANDSBANK",name: "Arbejdernes Landsbank",domain: "al-bank.dk",    available: true },
];

function AccountCard({ account }: { account: (typeof ACCOUNTS)[0] }) {
  const isExpired = account.status === "expired";
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: `1px solid ${isExpired ? "rgba(239,68,68,0.25)" : "var(--border)"}`,
        borderRadius: 14,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        overflow: "hidden",
        transition: "border-color 150ms, box-shadow 150ms",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 2px rgba(13,147,115,0.15)";
        (e.currentTarget as HTMLDivElement).style.borderColor = isExpired ? "rgba(239,68,68,0.4)" : "var(--border-strong)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.borderColor = isExpired ? "rgba(239,68,68,0.25)" : "var(--border)";
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
              {account.institution}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{account.accountName}</div>
          </div>
        </div>
        <Badge variant={account.accountType}>
          {account.accountType === "checking" ? "Lønkonto" : account.accountType === "savings" ? "Opsparing" : "Kredit"}
        </Badge>
      </div>

      {/* Balance */}
      <div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
          Saldo
        </div>
        <div className="num" style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
          {formatDKK(account.balanceOere)}
        </div>
      </div>

      {/* IBAN */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
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

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
          {isExpired ? (
            <>
              <AlertTriangle size={12} color="var(--red)" />
              <span style={{ color: "var(--red)" }}>Forbindelsen udløbet</span>
            </>
          ) : (
            <>
              <CheckCircle size={12} color="var(--green)" />
              <span style={{ color: "var(--text-muted)" }}>Synkroniseret {account.lastSynced}</span>
            </>
          )}
        </div>
        {isExpired ? (
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 12px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 6,
              fontSize: 12,
              color: "var(--red)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <RefreshCw size={11} /> Genopret
          </button>
        ) : (
          <button
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
            <RefreshCw size={11} /> Synkroniser
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
        borderRadius: 14,
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
      <span style={{ fontSize: 13.5, fontWeight: 500 }}>Tilslut bank</span>
      <span style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", maxWidth: 160, lineHeight: 1.4 }}>
        Forbind via GoCardless Open Banking
      </span>
    </button>
  );
}

function ConnectModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="animate-backdrop-in"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
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
          borderRadius: 16,
          padding: "28px",
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, letterSpacing: "-0.02em" }}>
            Vælg din bank
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
            Sikker forbindelse via GoCardless Open Banking (PSD2)
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {BANKS.map(bank => (
            <button
              key={bank.id}
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
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.15)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          <Zap size={12} color="var(--green)" />
          Dine bankdata læses kun — ingen betalinger kan foretages
        </div>
      </div>
    </div>
  );
}

export function AccountsPage() {
  const [modal, setModal] = useState(false);
  const totalBalance = ACCOUNTS.reduce((s, a) => s + a.balanceOere, 0);
  const activeCount = ACCOUNTS.filter(a => a.status === "active").length;

  return (
    <div className="page-wrap">
      {modal && <ConnectModal onClose={() => setModal(false)} />}

      <PageHeader
        title="Bankkonti"
        subtitle={`${activeCount} aktive forbindelser · ${formatDKK(totalBalance)} samlet saldo`}
        action={
          <button
            onClick={() => setModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 16px",
              background: "var(--accent)",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "opacity 120ms",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <Plus size={14} /> Tilslut bank
          </button>
        }
      />

      {/* Summary bar */}
      <Card className="animate-fade-up anim-1" style={{ marginBottom: 24 }}>
        <CardBody className="accounts-summary">
          {[
            { label: "Samlet saldo", value: formatDKK(totalBalance), highlight: true },
            { label: "Aktive forbindelser", value: `${activeCount}` },
            { label: "Udløbne forbindelser", value: `${ACCOUNTS.filter(a => a.status === "expired").length}` },
            { label: "Sidst synkroniseret", value: "2 min. siden" },
          ].map(stat => (
            <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {stat.label}
              </span>
              <span
                className="num"
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

      {/* Account grid */}
      <div
        className="animate-fade-up anim-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {ACCOUNTS.map(account => (
          <AccountCard key={account.id} account={account} />
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
        Bankforbindelser oprettes via <strong style={{ color: "var(--text-secondary)" }}>GoCardless Open Banking</strong> (PSD2).
        Dine loginoplysninger deles aldrig med FinTrack — forbindelsen er autoriseret direkte via din banks MitID-login.
        Adgangstokens krypteres med AES-256-GCM og udløber automatisk efter 90 dage.
      </div>
    </div>
  );
}
