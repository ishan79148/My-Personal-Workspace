// lib/permissions.ts
import type { WorkspaceRole } from "@prisma/client";
import { db } from "./db";

export const ROLE_RANK: Record<WorkspaceRole, number> = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function hasRole(actual: WorkspaceRole, required: WorkspaceRole) {
  return ROLE_RANK[actual] >= ROLE_RANK[required];
}

export async function getMembership(userId: string, workspaceId: string) {
  return db.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
}

export async function assertRole(
  userId: string,
  workspaceId: string,
  required: WorkspaceRole
) {
  const member = await getMembership(userId, workspaceId);
  if (!member || !hasRole(member.role, required)) {
    throw new Error("FORBIDDEN");
  }
  return member;
}
