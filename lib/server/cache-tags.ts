import "server-only";

import { revalidateTag } from "next/cache";

export const WORKSPACE_SLICES = [
  "accounts",
  "transactions",
  "subscriptions",
  "dashboard",
  "investments",
  "review",
  "settings",
] as const;

export type WorkspaceSlice = (typeof WORKSPACE_SLICES)[number];

export function workspaceTag(workspaceId: string, slice: WorkspaceSlice) {
  return `workspace:${workspaceId}:${slice}`;
}

export function revalidateWorkspaceSlices(workspaceId: string, slices: WorkspaceSlice[]) {
  for (const slice of slices) {
    revalidateTag(workspaceTag(workspaceId, slice), "max");
  }
}
