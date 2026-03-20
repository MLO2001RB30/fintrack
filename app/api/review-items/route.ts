import { z } from "zod";

import { normalizeReviewItemState } from "@/lib/review-queue";
import { requireWorkspaceContext } from "@/lib/server/auth/session";
import { ApiError, fromError, ok, parseJsonBody } from "@/lib/server/http";
import { createSupabaseAdminClient } from "@/lib/server/supabase/admin";

const reviewItemStateSchema = z.object({
  itemId: z.string().min(1),
  status: z.enum(["open", "snoozed", "resolved"]),
  snoozedUntil: z.string().nullable().optional().default(null),
});

type ReviewItemStateRow = {
  item_id: string;
  status: "open" | "snoozed" | "resolved";
  snoozed_until: string | null;
  updated_at: string;
};

export async function GET() {
  try {
    const workspace = await requireWorkspaceContext();
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return ok({
        states: [],
        persistence: "local" as const,
      });
    }

    const { data, error } = await supabase
      .from("review_item_states")
      .select("item_id, status, snoozed_until, updated_at")
      .eq("workspace_id", workspace.workspaceId);

    if (error) {
      throw new ApiError(500, "review_item_state_read_failed", error.message, error);
    }

    return ok({
      states: (data ?? []).map((row: ReviewItemStateRow) =>
        normalizeReviewItemState({
          itemId: row.item_id,
          status: row.status,
          snoozedUntil: row.snoozed_until,
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
    const payload = reviewItemStateSchema.parse(await parseJsonBody(request));
    const supabase = createSupabaseAdminClient();
    const state = normalizeReviewItemState(payload);

    if (!supabase) {
      return ok({
        state,
        persistence: "local" as const,
      });
    }

    const { data, error } = await supabase
      .from("review_item_states")
      .upsert(
        {
          workspace_id: workspace.workspaceId,
          item_id: state.itemId,
          status: state.status,
          snoozed_until: state.status === "snoozed" ? state.snoozedUntil : null,
        },
        {
          onConflict: "workspace_id,item_id",
        },
      )
      .select("item_id, status, snoozed_until, updated_at")
      .single();

    if (error) {
      throw new ApiError(500, "review_item_state_write_failed", error.message, error);
    }

    return ok({
      state: normalizeReviewItemState({
        itemId: data.item_id,
        status: data.status,
        snoozedUntil: data.snoozed_until,
        updatedAt: data.updated_at,
      }),
      persistence: "remote" as const,
    });
  } catch (error) {
    return fromError(error);
  }
}
