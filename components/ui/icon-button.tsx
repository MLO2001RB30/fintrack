"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "style"> & {
  children: ReactNode;
  /** Accessible name (Figma header uses icon-only controls). */
  label: string;
  style?: React.CSSProperties;
};

/**
 * Figma 20:994 header controls: 32×32 tap target, 4px radius, grey-600 icon.
 */
export function IconButton({ children, label, style, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      style={{
        width: 32,
        height: 32,
        borderRadius: 4,
        border: "none",
        background: "transparent",
        color: "var(--grey-600)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.12s ease, color 0.12s ease",
        ...style,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "var(--hover-bg)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
