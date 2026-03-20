import { z } from "zod";

import { normalizeAccountPreference } from "@/lib/account-preferences";
import { requireWorkspaceContext } from "@/lib/server/auth/session";
import { ApiError, fromError, ok, parseJsonBody } from "@/lib/server/http";
import { createSupabaseAdminClient } from "@/lib/server/supabase/admin";

const accountPreferenceSchema = z.object({
  accountId: z.string().min(1),
  nickname: z.string().max(120).optional().default(""),
  note: z.string().max(4000).optional().default(""),
});

type AccountPreferenceRow = {
  account_id: string;
  nickname: string | null;
  note: string | null;
  updated_at: string;
};

export async function GET() {
  try {
    const workspace = await requireWorkspaceContext();
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return ok({
        preferences: [],
        persistence: "local" as const,
      });
    }

    const { data, error } = await supabase
      .from("account_preferences")
      .select("account_id, nickname, note, updated_at")
      .eq("workspace_id", workspace.workspaceId);

    if (error) {
      throw new ApiError(500, "account_preferences_read_failed", error.message, error);
    }

    return ok({
      preferences: (data ?? []).map((row: AccountPreferenceRow) =>
        normalizeAccountPreference({
          accountId: row.account_id,
          nickname: row.nickname ?? "",
          note: row.note ?? "",
          updatedAt: row.updated_at,
        }),
      ),
      persistence: "remote" as const,
    });
  } catch (error) {
    return fromError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const workspace = await requireWorkspaceContext();
    const payload = accountPreferenceSchema.parse(await parseJsonBody(request));
    const supabase = createSupabaseAdminClient();
    const preference = normalizeAccountPreference(payload);

    if (!supabase) {
      return ok({
        preference,
        persistence: "local" as const,
      });
    }

    const { data, error } = await supabase
      .from("account_preferences")
      .upsert(
        {
          workspace_id: workspace.workspaceId,
          account_id: preference.accountId,
          nickname: preference.nickname,
          note: preference.note,
        },
        {
          onConflict: "workspace_id,account_id",
        },
      )
      .select("account_id, nickname, note, updated_at")
      .single();

    if (error) {
      throw new ApiError(500, "account_preferences_write_failed", error.message, error);
    }

    return ok({
      preference: normalizeAccountPreference({
        accountId: data.account_id,
        nickname: data.nickname ?? "",
        note: data.note ?? "",
        updatedAt: data.updated_at,
      }),
      persistence: "remote" as const,
    });
  } catch (error) {
    return fromError(error);
  }
}
