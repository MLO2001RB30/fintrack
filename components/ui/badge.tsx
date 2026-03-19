interface BadgeProps {
  variant: "active" | "paused" | "cancelled" | "expired" | "error" | "monthly" | "quarterly" | "yearly" | "checking" | "savings" | "credit" | "stock" | "etf" | "crypto" | "pension" | "bond";
  children: React.ReactNode;
  size?: "sm" | "md";
}

const STYLES: Record<BadgeProps["variant"], { bg: string; color: string; border: string }> = {
  active:    { bg: "#A1E5A1", color: "#003300", border: "transparent" },
  paused:    { bg: "#FFD9B2", color: "#4D2700", border: "transparent" },
  cancelled: { bg: "#E8E8EA", color: "#2A2933", border: "transparent" },
  expired:   { bg: "#FFBFB2", color: "#590F00", border: "transparent" },
  error:     { bg: "#FFBFB2", color: "#590F00", border: "transparent" },
  monthly:   { bg: "#C9D6F0", color: "#001133", border: "transparent" },
  quarterly: { bg: "#E1DAFF", color: "#40307A", border: "transparent" },
  yearly:    { bg: "#E8E8EA", color: "#2A2933", border: "transparent" },
  checking:  { bg: "#C9D6F0", color: "#001133", border: "transparent" },
  savings:   { bg: "#A1E5A1", color: "#003300", border: "transparent" },
  credit:    { bg: "#FFBFB2", color: "#590F00", border: "transparent" },
  stock:     { bg: "#C9D6F0", color: "#001133", border: "transparent" },
  etf:       { bg: "#A1E5A1", color: "#003300", border: "transparent" },
  crypto:    { bg: "#FFD9B2", color: "#4D2700", border: "transparent" },
  pension:   { bg: "#E1DAFF", color: "#40307A", border: "transparent" },
  bond:      { bg: "#E8E8EA", color: "#2A2933", border: "transparent" },
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
        fontWeight: 500,
        lineHeight: 1.45,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
