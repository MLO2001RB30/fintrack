import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseAdminConfigured, requireEnv } from "@/lib/server/env";

/** Untyped admin client until generated `Database` types are checked in (tables exist in Supabase migrations). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- schema lives in SQL migrations; avoids `never` inserts on CI
let adminClient: SupabaseClient<any> | null = null;

export function createSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  if (!adminClient) {
    const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = requireEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    );
    // requireEnv throws when missing; Pick<AppEnv, K> still types these as optional.
    const url = NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = SUPABASE_SERVICE_ROLE_KEY!;

    adminClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }) as unknown as SupabaseClient<any>;
  }

  return adminClient;
}
