"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { AnimatedNumber } from "./animated-number";

interface KpiCardProps {
  label: string;
  value: string;
  // Optional: provide rawValue + formatFn for the count-up animation.
  // formatFn receives the animating number and should return a formatted string.
  rawValue?: number;
  formatFn?: (n: number) => string;
  // Optional stagger delay (ms) so cards in a row count up with an offset
  animDelay?: number;
  change?: string;
  changePositive?: boolean;
  sub?: string;
  accent?: boolean;
}

export function KpiCard({
  label,
  value,
  rawValue,
  formatFn,
  animDelay = 0,
  change,
  changePositive,
  sub,
  accent,
}: KpiCardProps) {
  const canAnimate = rawValue !== undefined && formatFn !== undefined;
  const metaColor = accent ? "var(--accent)" : "var(--text-muted)";
  const cardBackground = "var(--surface-1)";
  const cardBorder = accent ? "var(--accent-border)" : "var(--border)";

  return (
    <div
      className="card-hover"
      style={{
        background: cardBackground,
        border: `1px solid ${cardBorder}`,
        borderRadius: "var(--radius-card)",
        padding: "18px 18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: metaColor,
          display: "block",
        }}
      >
        {label}
      </span>

      <span
        className="font-metric"
        style={{
          fontSize: 24,
          fontWeight: 400,
          color: "var(--grey-900)",
          lineHeight: 1.1,
          display: "block",
        }}
      >
        {canAnimate ? (
          <AnimatedNumber
            value={rawValue!}
            format={formatFn!}
            delay={animDelay}
            className="font-metric"
          />
        ) : (
          value
        )}
      </span>

      {(change || sub) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: "auto",
            flexWrap: "wrap",
          }}
        >
          {change && (
            <>
              {changePositive ? (
                <TrendingUp size={11} color={accent ? "var(--accent)" : "var(--green)"} />
              ) : (
                <TrendingDown size={11} color={accent ? "var(--accent)" : "var(--red)"} />
              )}
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: accent
                    ? "var(--accent)"
                    : changePositive
                    ? "var(--green)"
                    : "var(--red)",
                  background: accent ? "var(--accent-glow)" : "var(--surface-2)",
                  border: `1px solid ${accent ? "var(--accent-border)" : "var(--border)"}`,
                  borderRadius: 999,
                  padding: "5px 10px",
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
                fontWeight: 600,
                color: "var(--text-secondary)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 999,
                padding: "5px 10px",
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
