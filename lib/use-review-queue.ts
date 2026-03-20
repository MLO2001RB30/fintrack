"use client";

import { useEffect, useMemo, useState } from "react";

import { MOCK_TODAY, REVIEW_ITEMS } from "@/lib/mock-data";
import {
  applyReviewItemStates,
  broadcastReviewQueueUpdated,
  mergeReviewItemStates,
  normalizeReviewItemState,
  readLocalReviewItemStates,
  writeLocalReviewItemStates,
  REVIEW_QUEUE_UPDATED_EVENT,
  type ReviewItemState,
  type ReviewItemStatus,
} from "@/lib/review-queue";

export type ReviewPersistenceMode = "remote" | "local";

type ReviewQueueResponse =
  | {
      ok: true;
      data: {
        persistence: ReviewPersistenceMode;
        states?: ReviewItemState[];
        state?: ReviewItemState;
      };
    }
  | {
      ok: false;
      error: {
        message: string;
      };
    };

function addDays(baseDate: string, days: number) {
  const next = new Date(`${baseDate}T00:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

export function useReviewQueue() {
  const [states, setStates] = useState<ReviewItemState[]>(() => readLocalReviewItemStates());
  const [persistenceMode, setPersistenceMode] = useState<ReviewPersistenceMode>("local");

  const items = useMemo(() => applyReviewItemStates(REVIEW_ITEMS, states), [states]);
  const openItems = useMemo(() => items.filter((item) => item.status === "open"), [items]);
  const snoozedItems = useMemo(() => items.filter((item) => item.status === "snoozed"), [items]);
  const resolvedItems = useMemo(() => items.filter((item) => item.status === "resolved"), [items]);

  useEffect(() => {
    let isCancelled = false;

    async function loadStates() {
      try {
        const response = await fetch("/api/review-items", {
          cache: "no-store",
        });
        const payload = (await response.json()) as ReviewQueueResponse;

        if (!response.ok || !payload.ok) {
          throw new Error(payload.ok ? "Unable to load review state." : payload.error.message);
        }

        if (isCancelled) {
          return;
        }

        setPersistenceMode(payload.data.persistence);
        setStates((current) => {
          const next = mergeReviewItemStates(current, payload.data.states ?? []);
          writeLocalReviewItemStates(next);
          return next;
        });
      } catch {
        if (!isCancelled) {
          setPersistenceMode("local");
        }
      }
    }

    void loadStates();

    function syncFromLocalStorage() {
      setStates(readLocalReviewItemStates());
    }

    window.addEventListener("storage", syncFromLocalStorage);
    window.addEventListener(REVIEW_QUEUE_UPDATED_EVENT, syncFromLocalStorage);

    return () => {
      isCancelled = true;
      window.removeEventListener("storage", syncFromLocalStorage);
      window.removeEventListener(REVIEW_QUEUE_UPDATED_EVENT, syncFromLocalStorage);
    };
  }, []);

  async function saveState(nextState: ReviewItemState) {
    setStates((current) => {
      const next = mergeReviewItemStates(current, [nextState]);
      writeLocalReviewItemStates(next);
      broadcastReviewQueueUpdated();
      return next;
    });

    try {
      const response = await fetch("/api/review-items", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextState),
      });
      const payload = (await response.json()) as ReviewQueueResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "Unable to save review state." : payload.error.message);
      }

      setPersistenceMode(payload.data.persistence);

      if (payload.data.state) {
        setStates((current) => {
          const next = mergeReviewItemStates(current, [payload.data.state]);
          writeLocalReviewItemStates(next);
          broadcastReviewQueueUpdated();
          return next;
        });
      }
    } catch {
      setPersistenceMode("local");
    }
  }

  return {
    items,
    openItems,
    snoozedItems,
    resolvedItems,
    persistenceMode,
    async snoozeItem(itemId: string, days = 7) {
      await saveState(
        normalizeReviewItemState({
          itemId,
          status: "snoozed",
          snoozedUntil: addDays(MOCK_TODAY, days),
        }),
      );
    },
    async resolveItem(itemId: string) {
      await saveState(
        normalizeReviewItemState({
          itemId,
          status: "resolved",
          snoozedUntil: null,
        }),
      );
    },
    async reopenItem(itemId: string) {
      await saveState(
        normalizeReviewItemState({
          itemId,
          status: "open",
          snoozedUntil: null,
        }),
      );
    },
    setState(itemId: string, status: ReviewItemStatus, snoozedUntil: string | null = null) {
      return saveState(
        normalizeReviewItemState({
          itemId,
          status,
          snoozedUntil,
        }),
      );
    },
  };
}
