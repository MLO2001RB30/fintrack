"use client";

import Link from "next/link";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";

type ButtonProps = {
  variant?: ButtonVariant;
  /** sm = Figma secondary small (6×8). md = primary / emphasis (8×12). */
  size?: "sm" | "md";
  children: ReactNode;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  href?: string;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  onMouseEnter?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  onMouseLeave?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
};

function baseLayout(): CSSProperties {
  return {
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: 4,
    border: "none",
    boxSizing: "border-box",
    cursor: "pointer",
    textDecoration: "none",
    transition: "box-shadow 0.15s ease, background 0.15s ease, opacity 0.15s ease, border-color 0.15s ease",
  };
}

function variantStyles(variant: ButtonVariant, size: "sm" | "md"): CSSProperties {
  const pad =
    variant === "ghost"
      ? size === "md"
        ? { padding: "6px 4px" }
        : { padding: "2px 0" }
      : size === "md"
        ? { padding: "8px 12px" }
        : { padding: "6px 8px" };

  switch (variant) {
    case "primary":
      return {
        ...baseLayout(),
        ...pad,
        background: "var(--accent)",
        color: "#ffffff",
        boxShadow: "var(--shadow-xs)",
      };
    case "danger":
      return {
        ...baseLayout(),
        ...pad,
        background: "var(--danger-bg)",
        color: "var(--red)",
        border: "1px solid var(--danger-border)",
        boxShadow: "none",
      };
    case "success":
      return {
        ...baseLayout(),
        ...pad,
        background: "var(--green)",
        color: "#ffffff",
        boxShadow: "var(--shadow-xs)",
      };
    case "ghost":
      return {
        ...baseLayout(),
        ...pad,
        background: "transparent",
        color: "var(--accent)",
        boxShadow: "none",
      };
    default:
      return {
        ...baseLayout(),
        ...pad,
        background: "#ffffff",
        color: "var(--grey-800)",
        boxShadow: "var(--shadow-button-secondary)",
      };
  }
}

export function Button({
  variant = "secondary",
  size = "sm",
  children,
  icon,
  trailingIcon,
  href,
  className,
  style,
  disabled,
  type = "button",
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ButtonProps) {
  const computed = variantStyles(variant, size);
  const merged: CSSProperties = {
    ...computed,
    ...(disabled ? { opacity: 0.45, cursor: "not-allowed" } : {}),
    ...style,
  };

  const content = (
    <>
      {icon ? <span style={{ display: "inline-flex", flexShrink: 0 }}>{icon}</span> : null}
      <span style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>{children}</span>
      {trailingIcon ? <span style={{ display: "inline-flex", flexShrink: 0 }}>{trailingIcon}</span> : null}
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={className}
        style={merged}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      style={merged}
    >
      {content}
    </button>
  );
}
