import "server-only";

import { createSupabaseServerClient } from "@/lib/server/supabase/server";
import { ensureWorkspaceForUser, type WorkspaceContext } from "@/lib/server/db/workspaces";
import { isDevelopment, isSupabaseConfigured } from "@/lib/server/env";
import { ApiError } from "@/lib/server/http";

type AuthUser = {
  userId: string;
  email: string | null;
};

const LOCAL_DEV_USER: AuthUser = {
  userId: "00000000-0000-0000-0000-000000000001",
  email: "dev@fintrack.local",
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    return isDevelopment() ? LOCAL_DEV_USER : null;
  }

  const supabase = await createSupabaseServerClient();
  const result = await supabase?.auth.getUser();
  const user = result?.data.user;

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
  };
}

export async function requireWorkspaceContext(): Promise<WorkspaceContext> {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError(401, "unauthorized", "You must be signed in to access this resource.");
  }

  return ensureWorkspaceForUser(user.userId, user.email);
}
