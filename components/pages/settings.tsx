"use client";

import { useState } from "react";
import { RefreshCw, Trash2, Download, AlertTriangle, CheckCircle, Shield, ChevronDown } from "lucide-react";
import { ACCOUNTS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
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
  const [dangerOpen, setDangerOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    newSubscription: true,
    expiringBank: true,
    priceChange: false,
  });

  return (
    <div className="page-wrap">
      <PageHeader title="Settings" subtitle="Manage your account and connected institutions" />

      <div style={{ maxWidth: 640 }}>

        {/* Profile */}
        <Section title="Profile">
          <Card>
            <CardBody style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "var(--brand-gradient)",
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
                      padding: "4px 10px",
                      borderRadius: 999,
                      border: "1px solid var(--accent-border)",
                      marginTop: 4,
                    }}
                  >
                    Pro
                  </div>
                </div>
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <InputField label="Name" value={name} onChange={setName} />
                <InputField label="Email" value={email} type="email" onChange={setEmail} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>Currency</label>
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
                  <option value="DKK">DKK — Danish krone</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="button" variant="primary" size="md" style={{ fontSize: 13 }}>
                  Save changes
                </Button>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* Bank connections */}
        <Section title="Bank connections">
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
                          <AlertTriangle size={10} /> Connection expired
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle size={10} color="var(--green)" /> Active · Synced {account.lastSynced}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {account.status === "expired" && (
                      <Button type="button" variant="danger" size="sm" icon={<RefreshCw size={11} />} style={{ fontSize: 12 }}>
                        Reconnect
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      style={{ fontSize: 12, border: "1px solid var(--border)", boxShadow: "none" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--red)";
                        e.currentTarget.style.borderColor = "var(--danger-border-strong)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-secondary)";
                        e.currentTarget.style.borderColor = "var(--border)";
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Card>
            <CardBody style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { key: "newSubscription" as const, label: "New subscription detected", sub: "Alert me when a new subscription is identified" },
                { key: "expiringBank" as const, label: "Bank connection expiring", sub: "Alert me 14 days before a connection expires" },
                { key: "priceChange" as const, label: "Subscription price changes", sub: "Alert me when a subscription price changes" },
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
        <Section title="Security and privacy">
          <Card>
            <CardBody style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  background: "var(--accent-glow)",
                  border: "1px solid var(--accent-border)",
                  borderRadius: 8,
                  fontSize: 12.5,
                  color: "var(--text-secondary)",
                }}
              >
                <Shield size={14} color="var(--green)" />
                Bank access data is encrypted with AES-256-GCM and never stored in plain text
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  icon={<Download size={13} />}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    padding: "9px 16px",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                    boxShadow: "none",
                    background: "var(--surface-2)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-strong)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  Export my data (GDPR)
                </Button>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* Danger zone — collapsed accordion */}
        <Section title="Advanced">
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Accordion header */}
            <button
              onClick={() => { setDangerOpen(o => !o); setDeleteConfirm(false); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: dangerOpen ? "var(--danger-bg)" : "var(--surface-1)",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 150ms",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Trash2 size={13} color="var(--red)" />
                <span style={{ fontSize: 13.5, fontWeight: 500, color: dangerOpen ? "var(--red)" : "var(--text-secondary)" }}>
                  Delete account
                </span>
              </div>
              <ChevronDown
                size={14}
                color="var(--text-muted)"
                style={{ transform: dangerOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}
              />
            </button>

            {/* Accordion body */}
            {dangerOpen && (
              <div
                style={{
                  padding: "16px 18px 18px",
                  background: "var(--surface-2)",
                  borderTop: "1px solid var(--danger-border)",
                }}
              >
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
                  Permanently deletes all your data including transactions, subscriptions, and bank connections.
                  This action cannot be undone. Under GDPR Article 17, deletion is completed within 24 hours.
                </div>
                {!deleteConfirm ? (
                  <Button
                    type="button"
                    variant="danger"
                    size="md"
                    icon={<Trash2 size={13} />}
                    onClick={() => setDeleteConfirm(true)}
                    style={{
                      background: "transparent",
                      boxShadow: "none",
                      border: "1px solid var(--danger-border-strong)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--danger-bg)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Delete my account
                  </Button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 14px",
                        background: "var(--danger-bg)",
                        border: "1px solid var(--danger-border)",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "var(--red)",
                      }}
                    >
                      <AlertTriangle size={14} />
                      Are you sure? This action cannot be undone.
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <Button type="button" variant="secondary" size="md" onClick={() => setDeleteConfirm(false)} style={{ border: "1px solid var(--border)", boxShadow: "none", background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        icon={<Trash2 size={13} />}
                        style={{ background: "var(--red)", color: "#fff" }}
                      >
                        Confirm deletion
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
