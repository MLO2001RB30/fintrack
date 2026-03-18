interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 28,
        gap: 16,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: "-0.04em",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: "5px 0 0",
              fontSize: 13.5,
              color: "var(--text-muted)",
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
