import { MOCK_TODAY, type ReviewItem } from "@/lib/mock-data";

export type ReviewItemStatus = "open" | "snoozed" | "resolved";

export type ReviewItemState = {
  itemId: string;
  status: ReviewItemStatus;
  snoozedUntil: string | null;
  updatedAt: string;
};

export type ReviewQueueItem = ReviewItem & {
  status: ReviewItemStatus;
  snoozedUntil: string | null;
  updatedAt: string | null;
};

export const REVIEW_ITEM_STATES_STORAGE_KEY = "fintrack.review-item-states.v1";
export const REVIEW_QUEUE_UPDATED_EVENT = "fintrack:review-queue-updated";

export function normalizeReviewItemState(input: {
  itemId: string;
  status?: ReviewItemStatus;
  snoozedUntil?: string | null;
  updatedAt?: string;
}): ReviewItemState {
  return {
    itemId: input.itemId,
    status: input.status ?? "open",
    snoozedUntil: input.status === "snoozed" ? input.snoozedUntil ?? null : input.snoozedUntil ?? null,
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

export function mergeReviewItemStates(...collections: ReadonlyArray<ReadonlyArray<ReviewItemState>>) {
  const statesByItemId = new Map<string, ReviewItemState>();

  for (const collection of collections) {
    for (const state of collection) {
      const normalized = normalizeReviewItemState(state);
      const existing = statesByItemId.get(normalized.itemId);

      if (!existing || normalized.updatedAt >= existing.updatedAt) {
        statesByItemId.set(normalized.itemId, normalized);
      }
    }
  }

  return [...statesByItemId.values()].sort((left, right) => left.itemId.localeCompare(right.itemId));
}

export function getEffectiveReviewStatus(
  state: Pick<ReviewItemState, "status" | "snoozedUntil"> | undefined,
  referenceDate = MOCK_TODAY,
): ReviewItemStatus {
  if (!state) {
    return "open";
  }

  if (state.status === "snoozed" && state.snoozedUntil && state.snoozedUntil < referenceDate) {
    return "open";
  }

  return state.status;
}

export function applyReviewItemStates(
  items: ReadonlyArray<ReviewItem>,
  states: ReadonlyArray<ReviewItemState>,
  referenceDate = MOCK_TODAY,
): ReviewQueueItem[] {
  const statesByItemId = new Map(states.map((state) => [state.itemId, normalizeReviewItemState(state)]));

  return items.map((item) => {
    const state = statesByItemId.get(item.id);

    return {
      ...item,
      status: getEffectiveReviewStatus(state, referenceDate),
      snoozedUntil: state?.status === "snoozed" ? state.snoozedUntil : null,
      updatedAt: state?.updatedAt ?? null,
    };
  });
}

export function readLocalReviewItemStates() {
  if (typeof window === "undefined") {
    return [] as ReviewItemState[];
  }

  try {
    const stored = window.localStorage.getItem(REVIEW_ITEM_STATES_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as ReviewItemState[];
    return parsed.map((state) => normalizeReviewItemState(state));
  } catch {
    return [];
  }
}

export function writeLocalReviewItemStates(states: ReadonlyArray<ReviewItemState>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(REVIEW_ITEM_STATES_STORAGE_KEY, JSON.stringify(mergeReviewItemStates(states)));
}

export function broadcastReviewQueueUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(REVIEW_QUEUE_UPDATED_EVENT));
}
