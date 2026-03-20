import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import { getEnv, isEncryptionConfigured } from "@/lib/server/env";
import { ApiError } from "@/lib/server/http";

type EncryptionKeyMap = Record<string, string>;

export type EncryptedValue = {
  keyId: string;
  iv: string;
  tag: string;
  ciphertext: string;
};

let cachedKeys: Map<string, Buffer> | null = null;

function getKeyStore() {
  if (!isEncryptionConfigured()) {
    throw new ApiError(503, "encryption_not_configured", "Encryption keys are not configured.");
  }

  if (cachedKeys) {
    return cachedKeys;
  }

  const keysJson = getEnv().FINTRACK_ENCRYPTION_KEYS;
  if (!keysJson) {
    throw new ApiError(503, "encryption_not_configured", "Encryption keys are not configured.");
  }

  let parsed: EncryptionKeyMap;

  try {
    parsed = JSON.parse(keysJson);
  } catch (error) {
    throw new ApiError(500, "invalid_encryption_keys", "FINTRACK_ENCRYPTION_KEYS must be valid JSON.", error);
  }

  const keys = new Map<string, Buffer>();

  for (const [keyId, value] of Object.entries(parsed)) {
    const material = Buffer.from(value, "base64");
    if (material.length !== 32) {
      throw new ApiError(500, "invalid_encryption_key_length", `Encryption key ${keyId} must decode to 32 bytes.`);
    }
    keys.set(keyId, material);
  }

  cachedKeys = keys;
  return keys;
}

function getActiveKey() {
  const activeId = getEnv().FINTRACK_ACTIVE_ENCRYPTION_KEY_ID;
  if (!activeId) {
    throw new ApiError(503, "encryption_not_configured", "Encryption keys are not configured.");
  }
  const keys = getKeyStore();
  const key = keys.get(activeId);

  if (!key) {
    throw new ApiError(500, "active_encryption_key_missing", "The active encryption key is not present.");
  }

  return {
    keyId: activeId,
    key,
  };
}

function getKeyById(keyId: string) {
  const keys = getKeyStore();
  const key = keys.get(keyId);

  if (!key) {
    throw new ApiError(500, "encryption_key_missing", `Encryption key ${keyId} is unavailable.`);
  }

  return key;
}

export function encryptString(value: string): EncryptedValue {
  const { keyId, key } = getActiveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    keyId,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
}

export function decryptString(value: EncryptedValue) {
  const key = getKeyById(value.keyId);
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(value.iv, "base64"),
  );

  decipher.setAuthTag(Buffer.from(value.tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(value.ciphertext, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function encryptJson<T>(value: T): EncryptedValue {
  return encryptString(JSON.stringify(value));
}

export function decryptJson<T>(value: EncryptedValue): T {
  return JSON.parse(decryptString(value)) as T;
}

export function encryptionMetadata() {
  const env = getEnv();
  return {
    configured: isEncryptionConfigured(),
    activeKeyId: env.FINTRACK_ACTIVE_ENCRYPTION_KEY_ID ?? null,
  };
}
