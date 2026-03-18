"use client";

import { useState } from "react";
import { Building2, RefreshCw, Trash2, Download, AlertTriangle, CheckCircle, Shield, Bell } from "lucide-react";
import { ACCOUNTS } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: "0 0 14px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function InputField({ label, value, type = "text", onChange }: { label: string; value: string; type?: string; onChange?: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.02em" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "9px 13px",
          color: "var(--text-primary)",
          fontSize: 13.5,
          fontFamily: "inherit",
          outline: "none",
          transition: "border-color 120ms",
          width: "100%",
        }}
        onFocus={e => (e.target.style.borderColor = "var(--accent)")}
        onBlur={e => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}

export function SettingsPage() {
  const [name, setName] = useState("Mads L.");
  const [email, setEmail] = useState("mads@example.dk");
  const [currency, setCurrency] = useState("DKK");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [notifications, setNotifications] = useState({
    newSubscription: true,
    expiringBank: true,
    priceChange: false,
  });

  return (
    <div style={{ padding: "32px 36px", position: "relative", zIndex: 1 }}>
      <PageHeader title="Indstillinger" subtitle="Administrer din konto og forbindelser" />

      <div style={{ maxWidth: 640 }}>

        {/* Profile */}
        <Section title="Profil">
          <Card>
            <CardBody style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  ML
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>{name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{email}</div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      color: "var(--accent)",
                      background: "var(--accent-glow)",
                      padding: "2px 8px",
                      borderRadius: 4,
                      border: "1px solid rgba(245,158,11,0.2)",
                      marginTop: 4,
                    }}
                  >
                    Pro
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <InputField label="Navn" value={name} onChange={setName} />
                <InputField label="Email" value={email} type="email" onChange={setEmail} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>Valuta</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "9px 13px",
                    color: "var(--text-primary)",
                    fontSize: 13.5,
                    fontFamily: "inherit",
                    outline: "none",
                    width: "100%",
                    cursor: "pointer",
                  }}
                >
                  <option value="DKK">DKK — Dansk krone</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  style={{
                    padding: "8px 18px",
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
                  Gem ændringer
                </button>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* Bank connections */}
        <Section title="Bankforbindelser">
          <Card>
            <CardBody style={{ padding: 0 }}>
              {ACCOUNTS.map((account, i) => (
                <div
                  key={account.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 18px",
                    borderBottom: i < ACCOUNTS.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: account.institutionColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {account.institution.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>
                      {account.institution} — {account.accountName}
                    </div>
                    <div style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 4 }}>
                      {account.status === "expired" ? (
                        <span style={{ color: "var(--red)", display: "flex", alignItems: "center", gap: 4 }}>
                          <AlertTriangle size={10} /> Forbindelsen udløbet
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle size={10} color="var(--green)" /> Aktiv · Synkroniseret {account.lastSynced}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {account.status === "expired" && (
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "5px 12px",
                          background: "rgba(239,68,68,0.10)",
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
                    )}
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
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--red)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.3)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                      }}
                    >
                      Frakobl
                    </button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </Section>

        {/* Notifications */}
        <Section title="Notifikationer">
          <Card>
            <CardBody style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { key: "newSubscription" as const, label: "Nyt abonnement opdaget", sub: "Besked når et nyt abonnement identificeres" },
                { key: "expiringBank" as const, label: "Bankforbindelse udløber", sub: "Besked 14 dage før forbindelsen udløber" },
                { key: "priceChange" as const, label: "Prisændringer på abonnementer", sub: "Besked når en abonnementspris ændres" },
              ].map((item, i, arr) => (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.sub}</div>
                  </div>
                  <button
                    onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                    style={{
                      width: 42,
                      height: 24,
                      borderRadius: 12,
                      background: notifications[item.key] ? "var(--accent)" : "var(--surface-3)",
                      border: "none",
                      cursor: "pointer",
                      position: "relative",
                      transition: "background 200ms",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#fff",
                        top: 3,
                        left: notifications[item.key] ? 21 : 3,
                        transition: "left 200ms",
                      }}
                    />
                  </button>
                </div>
              ))}
            </CardBody>
          </Card>
        </Section>

        {/* Security */}
        <Section title="Sikkerhed og privatliv">
          <Card>
            <CardBody style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  background: "rgba(34,197,94,0.06)",
                  border: "1px solid rgba(34,197,94,0.15)",
                  borderRadius: 8,
                  fontSize: 12.5,
                  color: "var(--text-secondary)",
                }}
              >
                <Shield size={14} color="var(--green)" />
                Bankadgangsdata er krypteret med AES-256-GCM og opbevares aldrig i klartekst
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    padding: "9px 16px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 120ms",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                  }}
                >
                  <Download size={13} /> Eksportér mine data (GDPR)
                </button>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* Danger zone */}
        <Section title="Farezone">
          <div
            style={{
              background: "rgba(239,68,68,0.04)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 12,
              padding: "20px",
            }}
          >
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#F87171", marginBottom: 4 }}>Slet konto</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Sletter permanent alle dine data inkl. transaktioner, abonnementer og bankforbindelser.
                Handlingen kan ikke fortrydes. I henhold til GDPR Art. 17 gennemføres sletningen inden for 24 timer.
              </div>
            </div>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 16px",
                  background: "transparent",
                  border: "1px solid rgba(239,68,68,0.4)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--red)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 120ms",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.6)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.4)";
                }}
              >
                <Trash2 size={13} /> Slet min konto
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    background: "rgba(239,68,68,0.10)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#F87171",
                  }}
                >
                  <AlertTriangle size={14} />
                  Er du sikker? Denne handling kan ikke fortrydes.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    style={{
                      padding: "8px 16px",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Annuller
                  </button>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "8px 16px",
                      background: "var(--red)",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#fff",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <Trash2 size={13} /> Bekræft sletning
                  </button>
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
