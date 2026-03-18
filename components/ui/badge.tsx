interface BadgeProps {
  variant: "active" | "paused" | "cancelled" | "expired" | "error" | "monthly" | "quarterly" | "yearly" | "checking" | "savings" | "credit" | "stock" | "etf" | "crypto" | "pension" | "bond";
  children: React.ReactNode;
  size?: "sm" | "md";
}

const STYLES: Record<BadgeProps["variant"], { bg: string; color: string; border: string }> = {
  active:    { bg: "rgba(5,150,105,0.08)",    color: "#059669", border: "rgba(5,150,105,0.20)"   },
  paused:    { bg: "rgba(217,119,6,0.08)",    color: "#B45309", border: "rgba(217,119,6,0.22)"   },
  cancelled: { bg: "rgba(220,38,38,0.07)",    color: "#DC2626", border: "rgba(220,38,38,0.18)"   },
  expired:   { bg: "rgba(220,38,38,0.07)",    color: "#DC2626", border: "rgba(220,38,38,0.18)"   },
  error:     { bg: "rgba(220,38,38,0.07)",    color: "#DC2626", border: "rgba(220,38,38,0.18)"   },
  monthly:   { bg: "rgba(79,70,229,0.07)",    color: "#4F46E5", border: "rgba(79,70,229,0.20)"   },
  quarterly: { bg: "rgba(124,58,237,0.07)",   color: "#7C3AED", border: "rgba(124,58,237,0.20)"  },
  yearly:    { bg: "rgba(13,147,115,0.07)",   color: "#0D9373", border: "rgba(13,147,115,0.20)"  },
  checking:  { bg: "rgba(37,99,235,0.07)",    color: "#2563EB", border: "rgba(37,99,235,0.18)"   },
  savings:   { bg: "rgba(5,150,105,0.07)",    color: "#059669", border: "rgba(5,150,105,0.18)"   },
  credit:    { bg: "rgba(220,38,38,0.07)",    color: "#DC2626", border: "rgba(220,38,38,0.18)"   },
  stock:     { bg: "rgba(37,99,235,0.07)",    color: "#2563EB", border: "rgba(37,99,235,0.18)"   },
  etf:       { bg: "rgba(5,150,105,0.07)",    color: "#059669", border: "rgba(5,150,105,0.18)"   },
  crypto:    { bg: "rgba(217,119,6,0.07)",    color: "#D97706", border: "rgba(217,119,6,0.18)"   },
  pension:   { bg: "rgba(79,70,229,0.07)",    color: "#4F46E5", border: "rgba(79,70,229,0.18)"   },
  bond:      { bg: "rgba(107,114,128,0.07)",  color: "#6B7280", border: "rgba(107,114,128,0.18)" },
};

export function Badge({ variant, children, size = "sm" }: BadgeProps) {
  const s = STYLES[variant] ?? STYLES.active;
  const pad = size === "sm" ? "2px 7px" : "3px 10px";
  const fs  = size === "sm" ? 11 : 12;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: pad,
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontSize: fs,
        fontWeight: 600,
        lineHeight: 1.6,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
