interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Card({ children, style, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 24,
        boxShadow: "var(--shadow-sm)",
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
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        paddingTop: 18,
        paddingRight: 24,
        paddingBottom: 18,
        paddingLeft: 24,
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

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: "var(--text-primary)",
        letterSpacing: "-0.02em",
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
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        paddingTop: 20,
        paddingRight: 24,
        paddingBottom: 20,
        paddingLeft: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
