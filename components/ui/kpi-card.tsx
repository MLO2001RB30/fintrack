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
  const cardBackground = accent ? "rgba(87,73,244,0.04)" : "var(--surface-2)";
  const cardBorder = accent ? "rgba(87,73,244,0.16)" : "var(--border)";

  return (
    <div
      className="card-hover"
      style={{
        background: cardBackground,
        border: `1px solid ${cardBorder}`,
        borderRadius: 24,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: metaColor,
          display: "block",
        }}
      >
        {label}
      </span>

      <span
        className="num"
        style={{
          fontSize: 34,
          fontWeight: 500,
          color: "var(--text-primary)",
          lineHeight: 1.1,
          letterSpacing: "-0.04em",
          display: "block",
        }}
      >
        {canAnimate ? (
          <AnimatedNumber
            value={rawValue!}
            format={formatFn!}
            delay={animDelay}
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
                  fontWeight: 500,
                  color: accent
                    ? "var(--accent)"
                    : changePositive
                    ? "var(--green)"
                    : "var(--red)",
                  background: accent ? "rgba(87,73,244,0.08)" : "var(--surface-1)",
                  border: `1px solid ${accent ? "rgba(87,73,244,0.12)" : "var(--border)"}`,
                  borderRadius: 999,
                  padding: "4px 10px",
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
                color: "var(--text-secondary)",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 999,
                padding: "4px 10px",
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
