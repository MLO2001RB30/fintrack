"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 32px",
        textAlign: "center",
        gap: 12,
      }}
    >
      {icon && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--radius-card)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
            color: "var(--text-muted)",
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 320, lineHeight: 1.6 }}>{description}</div>
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
