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

  return (
    <div
      className={`card-hover${accent ? " kpi-accent-pulse" : ""}`}
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
