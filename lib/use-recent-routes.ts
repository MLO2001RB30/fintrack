"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { KNOWN_PATHS_SET, PRIMARY_HREFS } from "@/lib/navigation";

const STORAGE_KEY = "fintrack.recentRoutes.v1";
const MAX_RECENT = 5;
const RECENT_EVENT = "fintrack-recent-routes";

function readRaw(): string {
  if (typeof window === "undefined") return "[]";
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parseStore(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function writeStore(paths: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paths.slice(0, MAX_RECENT)));
  } catch {
    /* ignore quota / private mode */
  }
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(RECENT_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(RECENT_EVENT, listener);
  };
}

function bumpRecent(pathname: string) {
  if (!KNOWN_PATHS_SET.has(pathname)) return;
  const base = parseStore(readRaw());
  const next = [pathname, ...base.filter((p) => p !== pathname)].slice(0, MAX_RECENT);
  writeStore(next);
  window.dispatchEvent(new Event(RECENT_EVENT));
}

/**
 * Tracks last visited app routes (localStorage). Used for sidebar “Shortcuts”.
 */
export function useRecentRoutes() {
  const pathname = usePathname() ?? "";

  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const store = useMemo(() => parseStore(raw), [raw]);

  useEffect(() => {
    if (!pathname || !KNOWN_PATHS_SET.has(pathname)) return;
    bumpRecent(pathname);
  }, [pathname]);

  const shortcuts = useMemo(() => {
    return store.filter((p) => !PRIMARY_HREFS.has(p) && p !== pathname && KNOWN_PATHS_SET.has(p));
  }, [store, pathname]);

  return { shortcuts, hydrated: true };
}
