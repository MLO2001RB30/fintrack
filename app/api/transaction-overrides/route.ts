import { z } from "zod";

import { normalizeTransactionOverride } from "@/lib/transaction-overrides";
import { requireWorkspaceContext } from "@/lib/server/auth/session";
import { ApiError, fromError, ok, parseJsonBody } from "@/lib/server/http";
import { createSupabaseAdminClient } from "@/lib/server/supabase/admin";

const transactionOverrideSchema = z.object({
  transactionId: z.string().min(1),
  category: z.string().min(1),
  note: z.string().max(4000).optional().default(""),
});

type TransactionOverrideRow = {
  transaction_id: string;
  category_override: string;
  note: string | null;
  updated_at: string;
};

export async function GET() {
  try {
    const workspace = await requireWorkspaceContext();
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return ok({
        overrides: [],
        persistence: "local" as const,
      });
    }

    const { data, error } = await supabase
      .from("transaction_overrides")
      .select("transaction_id, category_override, note, updated_at")
      .eq("workspace_id", workspace.workspaceId);

    if (error) {
      throw new ApiError(500, "transaction_override_read_failed", error.message, error);
    }

    return ok({
      overrides: (data ?? []).map((row: TransactionOverrideRow) =>
        normalizeTransactionOverride({
          transactionId: row.transaction_id,
          category: row.category_override,
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
    const payload = transactionOverrideSchema.parse(await parseJsonBody(request));
    const supabase = createSupabaseAdminClient();
    const override = normalizeTransactionOverride(payload);

    if (!supabase) {
      return ok({
        override,
        persistence: "local" as const,
      });
    }

    const { data, error } = await supabase
      .from("transaction_overrides")
      .upsert(
        {
          workspace_id: workspace.workspaceId,
          transaction_id: override.transactionId,
          category_override: override.category,
          note: override.note,
        },
        {
          onConflict: "workspace_id,transaction_id",
        },
      )
      .select("transaction_id, category_override, note, updated_at")
      .single();

    if (error) {
      throw new ApiError(500, "transaction_override_write_failed", error.message, error);
    }

    return ok({
      override: normalizeTransactionOverride({
        transactionId: data.transaction_id,
        category: data.category_override,
        note: data.note ?? "",
        updatedAt: data.updated_at,
      }),
      persistence: "remote" as const,
    });
  } catch (error) {
    return fromError(error);
  }
}
