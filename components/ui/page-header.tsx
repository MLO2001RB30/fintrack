import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="page-header-wrap">
      <div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.5rem, 2.6vw, 1.75rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 14,
              color: "var(--text-secondary)",
              fontWeight: 400,
              letterSpacing: "0",
              maxWidth: 760,
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
