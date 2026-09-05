"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertRole } from "@/lib/permissions";

export async function createPage(params: {
  workspaceId: string;
  parentId?: string | null;
  title?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  await assertRole(session.user.id, params.workspaceId, "EDITOR");

  const siblingCount = await db.page.count({
    where: {
      workspaceId: params.workspaceId,
      parentId: params.parentId ?? null,
    },
  });

  const page = await db.page.create({
    data: {
      title: params.title ?? "Untitled",
      workspaceId: params.workspaceId,
      parentId: params.parentId ?? null,
      position: siblingCount,
      authorId: session.user.id,
    },
  });

  revalidatePath(`/${params.workspaceId}`);
  return page;
}

export async function updatePageContent(pageId: string, content: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  const page = await db.page.findUniqueOrThrow({ where: { id: pageId } });
  await assertRole(session.user.id, page.workspaceId, "EDITOR");

  await db.page.update({
    where: { id: pageId },
    data: { content: content as any },
  });

  revalidatePath(`/${page.workspaceId}/${pageId}`);
}

export async function renamePage(pageId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  const page = await db.page.findUniqueOrThrow({ where: { id: pageId } });
  await assertRole(session.user.id, page.workspaceId, "EDITOR");

  await db.page.update({ where: { id: pageId }, data: { title } });
  revalidatePath(`/${page.workspaceId}/${pageId}`);
}

export async function movePage(params: {
  pageId: string;
  newParentId: string | null;
  newPosition: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  const page = await db.page.findUniqueOrThrow({
    where: { id: params.pageId },
  });
  await assertRole(session.user.id, page.workspaceId, "EDITOR");

  await db.page.update({
    where: { id: params.pageId },
    data: { parentId: params.newParentId, position: params.newPosition },
  });

  revalidatePath(`/${page.workspaceId}`);
}

export async function archivePage(pageId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  const page = await db.page.findUniqueOrThrow({ where: { id: pageId } });
  await assertRole(session.user.id, page.workspaceId, "EDITOR");

  await db.page.update({ where: { id: pageId }, data: { isArchived: true } });
  revalidatePath(`/${page.workspaceId}`);
}

export async function restorePage(pageId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  const page = await db.page.findUniqueOrThrow({ where: { id: pageId } });
  await assertRole(session.user.id, page.workspaceId, "EDITOR");

  await db.page.update({
    where: { id: pageId },
    data: { isArchived: false },
  });
  revalidatePath(`/${page.workspaceId}`);
}
