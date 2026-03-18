"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  sub?: string;
  accent?: boolean;
}

export function KpiCard({ label, value, change, changePositive, sub, accent }: KpiCardProps) {
  return (
    <div
      style={{
        background: accent ? "var(--accent)" : "var(--surface-1)",
        border: accent ? "none" : "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "relative",
        overflow: "hidden",
        boxShadow: accent
          ? "0 4px 12px rgba(13,147,115,0.25), 0 1px 3px rgba(13,147,115,0.15)"
          : "var(--shadow-sm)",
      }}
    >
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: accent ? "rgba(255,255,255,0.65)" : "var(--text-muted)",
          display: "block",
        }}
      >
        {label}
      </span>

      <span
        className="num"
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: accent ? "#fff" : "var(--text-primary)",
          lineHeight: 1.1,
          letterSpacing: "-0.035em",
          display: "block",
          marginTop: 2,
        }}
      >
        {value}
      </span>

      {(change || sub) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
          }}
        >
          {change && (
            <>
              {changePositive ? (
                <TrendingUp size={11} color={accent ? "rgba(255,255,255,0.8)" : "var(--green)"} />
              ) : (
                <TrendingDown size={11} color={accent ? "rgba(255,255,255,0.8)" : "var(--red)"} />
              )}
              <span
                className="num"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: accent
                    ? "rgba(255,255,255,0.85)"
                    : changePositive
                    ? "var(--green)"
                    : "var(--red)",
                }}
              >
                {change}
              </span>
            </>
          )}
          {sub && !change && (
            <span
              style={{
                fontSize: 11.5,
                color: accent ? "rgba(255,255,255,0.65)" : "var(--text-muted)",
              }}
            >
              {sub}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
