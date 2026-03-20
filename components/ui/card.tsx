import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Card({ children, style, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-sm)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        paddingTop: 22,
        paddingRight: 28,
        paddingBottom: 18,
        paddingLeft: 28,
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontSize: 16,
        fontWeight: 600,
        color: "var(--text-primary)",
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </span>
  );
}

export function CardBody({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        paddingTop: 24,
        paddingRight: 28,
        paddingBottom: 24,
        paddingLeft: 28,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
