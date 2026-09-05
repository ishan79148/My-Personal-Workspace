"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertRole } from "@/lib/permissions";
import type { WorkspaceRole } from "@prisma/client";

export async function inviteMember(
  workspaceId: string,
  email: string,
  role: WorkspaceRole = "EDITOR"
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  await assertRole(session.user.id, workspaceId, "ADMIN");

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(
      "No user found with that email — ask them to sign up first."
    );
  }

  await db.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
    update: { role },
    create: { userId: user.id, workspaceId, role },
  });

  revalidatePath(`/${workspaceId}/settings/members`);
}

export async function changeMemberRole(
  workspaceId: string,
  memberId: string,
  role: WorkspaceRole
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  await assertRole(session.user.id, workspaceId, "ADMIN");

  await db.workspaceMember.update({
    where: { id: memberId },
    data: { role },
  });

  revalidatePath(`/${workspaceId}/settings/members`);
}

export async function removeMember(workspaceId: string, memberId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  await assertRole(session.user.id, workspaceId, "ADMIN");

  await db.workspaceMember.delete({ where: { id: memberId } });
  revalidatePath(`/${workspaceId}/settings/members`);
}
