import type { Transaction } from "@/lib/mock-data";

export type TransactionOverride = {
  transactionId: string;
  category: string;
  note: string;
  updatedAt: string;
};

export type TransactionRecord = Transaction & {
  note?: string;
};

export const TRANSACTION_OVERRIDES_STORAGE_KEY = "fintrack.transaction-overrides.v1";

export function normalizeTransactionOverride(input: {
  transactionId: string;
  category: string;
  note?: string;
  updatedAt?: string;
}): TransactionOverride {
  return {
    transactionId: input.transactionId,
    category: input.category.trim(),
    note: (input.note ?? "").trim(),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

export function mergeOverrideCollections(...collections: ReadonlyArray<ReadonlyArray<TransactionOverride>>) {
  const overridesByTransactionId = new Map<string, TransactionOverride>();

  for (const collection of collections) {
    for (const override of collection) {
      const normalized = normalizeTransactionOverride(override);
      const existing = overridesByTransactionId.get(normalized.transactionId);

      if (!existing || normalized.updatedAt >= existing.updatedAt) {
        overridesByTransactionId.set(normalized.transactionId, normalized);
      }
    }
  }

  return [...overridesByTransactionId.values()].sort((left, right) =>
    left.transactionId.localeCompare(right.transactionId),
  );
}

export function mergeTransactionOverrides(
  transactions: ReadonlyArray<Transaction>,
  overrides: ReadonlyArray<TransactionOverride>,
): TransactionRecord[] {
  const overridesByTransactionId = new Map(
    overrides.map((override) => [override.transactionId, normalizeTransactionOverride(override)]),
  );

  return transactions.map((transaction) => {
    const override = overridesByTransactionId.get(transaction.id);

    if (!override) {
      return transaction;
    }

    return {
      ...transaction,
      category: override.category,
      note: override.note || undefined,
    };
  });
}

export function readLocalTransactionOverrides() {
  if (typeof window === "undefined") {
    return [] as TransactionOverride[];
  }

  try {
    const stored = window.localStorage.getItem(TRANSACTION_OVERRIDES_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as TransactionOverride[];
    return parsed.map((override) => normalizeTransactionOverride(override));
  } catch {
    return [];
  }
}

export function writeLocalTransactionOverrides(overrides: ReadonlyArray<TransactionOverride>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    TRANSACTION_OVERRIDES_STORAGE_KEY,
    JSON.stringify(mergeOverrideCollections(overrides)),
  );
}
