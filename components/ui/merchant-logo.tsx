"use client";

import { useState } from "react";
import { lookupDomain } from "@/lib/vendor-domains";

type LogoSource = "clearbit" | "favicon" | "initials";

interface MerchantLogoProps {
  /** The display name — used for initials fallback and alt text. */
  merchant: string;
  /** Explicit domain (highest priority). If omitted, falls back to registry. */
  domain?: string;
  /**
   * Name used for registry lookup when `domain` is not provided.
   * Defaults to `merchant` if omitted.
   */
  name?: string;
  size?: number;
  radius?: number;
}

/**
 * Displays a vendor logo using a three-stage waterfall:
 *   1. Clearbit Logo API    — high-quality branded logos for most companies
 *   2. Google favicon (128) — always returns something for any domain
 *   3. Letter initials      — guaranteed final fallback
 *
 * Domain is resolved as: `domain` prop → registry lookup → letter initials.
 */
export function MerchantLogo({
  merchant,
  domain: domainProp,
  name,
  size = 34,
  radius = 9,
}: MerchantLogoProps) {
  const resolvedDomain = domainProp !== undefined ? domainProp : lookupDomain(name ?? merchant);
  const [source, setSource] = useState<LogoSource>(resolvedDomain ? "clearbit" : "initials");
  const initials = merchant.slice(0, 2).toUpperCase();

  const advance = () =>
    setSource(prev => (prev === "clearbit" ? "favicon" : "initials"));

  // ── Initials fallback ────────────────────────────────────────────────────
  if (source === "initials" || !resolvedDomain) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.round(size * 0.35),
          fontWeight: 600,
          color: "var(--text-secondary)",
          flexShrink: 0,
          letterSpacing: "0.04em",
        }}
      >
        {initials}
      </div>
    );
  }

  // ── Clearbit or Google favicon ────────────────────────────────────────────
  const isFavicon = source === "favicon";
  const imgSrc = isFavicon
    ? `https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=128`
    : `https://logo.clearbit.com/${resolvedDomain}`;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "#fff",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        padding: isFavicon ? 2 : 4,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={merchant}
        width={isFavicon ? size - 4 : size - 8}
        height={isFavicon ? size - 4 : size - 8}
        style={{ objectFit: "contain", display: "block" }}
        onError={advance}
      />
    </div>
  );
}
