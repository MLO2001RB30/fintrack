import "server-only";

import { randomUUID } from "node:crypto";

import { type Sql } from "postgres";

import { getDb, withTransaction } from "@/lib/server/db/client";
import { isDatabaseConfigured } from "@/lib/server/env";

export type WorkspaceContext = {
  userId: string;
  email: string | null;
  workspaceId: string;
  role: "owner" | "admin" | "member" | "viewer";
};

type WorkspaceRow = {
  workspace_id: string;
  role: WorkspaceContext["role"];
};

async function ensureProfile(sql: Sql, userId: string, email: string | null) {
  await sql`
    insert into public.profiles (user_id, email)
    values (${userId}::uuid, ${email})
    on conflict (user_id) do update
    set email = excluded.email,
        updated_at = now()
  `;
}

export async function ensureWorkspaceForUser(userId: string, email: string | null): Promise<WorkspaceContext> {
  if (!isDatabaseConfigured()) {
    return {
      userId,
      email,
      workspaceId: "local-workspace",
      role: "owner",
    };
  }

  return withTransaction(async (sql) => {
    await ensureProfile(sql, userId, email);

    const existing = await sql<WorkspaceRow[]>`
      select workspace_id, role
      from public.workspace_members
      where user_id = ${userId}::uuid
      order by created_at asc
      limit 1
    `;

    if (existing[0]) {
      return {
        userId,
        email,
        workspaceId: existing[0].workspace_id,
        role: existing[0].role,
      };
    }

    const workspaceId = randomUUID();
    await sql`
      insert into public.workspaces (id, name)
      values (${workspaceId}::uuid, ${email ? `${email.split("@")[0]}'s workspace` : "Personal workspace"})
    `;
    await sql`
      insert into public.workspace_members (workspace_id, user_id, role)
      values (${workspaceId}::uuid, ${userId}::uuid, 'owner')
    `;

    return {
      userId,
      email,
      workspaceId,
      role: "owner",
    };
  });
}

export async function getWorkspaceMembership(userId: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const db = getDb();
  const rows = await db<WorkspaceRow[]>`
    select workspace_id, role
    from public.workspace_members
    where user_id = ${userId}::uuid
    order by created_at asc
    limit 1
  `;

  return rows[0] ?? null;
}
