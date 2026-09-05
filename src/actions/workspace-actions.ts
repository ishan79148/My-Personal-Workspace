"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertRole } from "@/lib/permissions";

export async function createWorkspace(name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const workspace = await db.workspace.create({
    data: {
      name,
      slug: `${slug}-${Math.random().toString(36).slice(2, 7)}`,
      members: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
  });

  revalidatePath("/");
  return workspace;
}

export async function renameWorkspace(workspaceId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  await assertRole(session.user.id, workspaceId, "ADMIN");

  await db.workspace.update({
    where: { id: workspaceId },
    data: { name },
  });

  revalidatePath(`/${workspaceId}/settings`);
}
