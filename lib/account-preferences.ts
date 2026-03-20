export type AccountPreference = {
  accountId: string;
  nickname: string;
  note: string;
  updatedAt: string;
};

export const ACCOUNT_PREFERENCES_STORAGE_KEY = "fintrack.account-preferences.v1";

export function normalizeAccountPreference(input: {
  accountId: string;
  nickname?: string;
  note?: string;
  updatedAt?: string;
}): AccountPreference {
  return {
    accountId: input.accountId,
    nickname: (input.nickname ?? "").trim(),
    note: (input.note ?? "").trim(),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

export function mergeAccountPreferences(...collections: ReadonlyArray<ReadonlyArray<AccountPreference>>) {
  const preferencesByAccountId = new Map<string, AccountPreference>();

  for (const collection of collections) {
    for (const preference of collection) {
      const normalized = normalizeAccountPreference(preference);
      const existing = preferencesByAccountId.get(normalized.accountId);

      if (!existing || normalized.updatedAt >= existing.updatedAt) {
        preferencesByAccountId.set(normalized.accountId, normalized);
      }
    }
  }

  return [...preferencesByAccountId.values()].sort((left, right) => left.accountId.localeCompare(right.accountId));
}

export function readLocalAccountPreferences() {
  if (typeof window === "undefined") {
    return [] as AccountPreference[];
  }

  try {
    const stored = window.localStorage.getItem(ACCOUNT_PREFERENCES_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as AccountPreference[];
    return parsed.map((preference) => normalizeAccountPreference(preference));
  } catch {
    return [];
  }
}

export function writeLocalAccountPreferences(preferences: ReadonlyArray<AccountPreference>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ACCOUNT_PREFERENCES_STORAGE_KEY,
    JSON.stringify(mergeAccountPreferences(preferences)),
  );
}
