import "server-only";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  FINTRACK_ENCRYPTION_KEYS: z.string().min(1).optional(),
  FINTRACK_ACTIVE_ENCRYPTION_KEY_ID: z.string().min(1).optional(),
  GOCARDLESS_SECRET_ID: z.string().min(1).optional(),
  GOCARDLESS_SECRET_KEY: z.string().min(1).optional(),
  GOCARDLESS_BASE_URL: z.string().url().default("https://bankaccountdata.gocardless.com/api/v2"),
  GOCARDLESS_REDIRECT_URI: z.string().url().optional(),
  TWELVE_DATA_API_KEY: z.string().min(1).optional(),
  COINGECKO_API_KEY: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  INNGEST_EVENT_KEY: z.string().min(1).optional(),
  INNGEST_SIGNING_KEY: z.string().min(1).optional(),
  MAIL_FROM: z.string().email().default("no-reply@fintrack.local"),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  cachedEnv ??= envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    FINTRACK_ENCRYPTION_KEYS: process.env.FINTRACK_ENCRYPTION_KEYS,
    FINTRACK_ACTIVE_ENCRYPTION_KEY_ID: process.env.FINTRACK_ACTIVE_ENCRYPTION_KEY_ID,
    GOCARDLESS_SECRET_ID: process.env.GOCARDLESS_SECRET_ID,
    GOCARDLESS_SECRET_KEY: process.env.GOCARDLESS_SECRET_KEY,
    GOCARDLESS_BASE_URL: process.env.GOCARDLESS_BASE_URL,
    GOCARDLESS_REDIRECT_URI: process.env.GOCARDLESS_REDIRECT_URI,
    TWELVE_DATA_API_KEY: process.env.TWELVE_DATA_API_KEY,
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    MAIL_FROM: process.env.MAIL_FROM,
  });

  return cachedEnv;
}

export function isSupabaseConfigured() {
  const env = getEnv();
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isSupabaseAdminConfigured() {
  const env = getEnv();
  return isSupabaseConfigured() && Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
}

export function isDatabaseConfigured() {
  return Boolean(getEnv().DATABASE_URL);
}

export function isEncryptionConfigured() {
  const env = getEnv();
  return Boolean(env.FINTRACK_ENCRYPTION_KEYS && env.FINTRACK_ACTIVE_ENCRYPTION_KEY_ID);
}

export function isGoCardlessConfigured() {
  const env = getEnv();
  return Boolean(env.GOCARDLESS_SECRET_ID && env.GOCARDLESS_SECRET_KEY && env.GOCARDLESS_REDIRECT_URI);
}

export function isRedisConfigured() {
  const env = getEnv();
  return Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}

export function isInngestConfigured() {
  return Boolean(getEnv().INNGEST_EVENT_KEY);
}

export function isMarketDataConfigured() {
  const env = getEnv();
  return Boolean(env.TWELVE_DATA_API_KEY || env.COINGECKO_API_KEY);
}

export function requireEnv<K extends keyof AppEnv>(...keys: K[]): Pick<AppEnv, K> {
  const env = getEnv();
  const missing = keys.filter((key) => {
    const value = env[key];
    return value === undefined || value === null || value === "";
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return Object.fromEntries(keys.map((key) => [key, env[key]])) as Pick<AppEnv, K>;
}

export function isDevelopment() {
  return getEnv().NODE_ENV !== "production";
}
