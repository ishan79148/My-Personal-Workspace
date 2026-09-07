"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await db.user.findUnique({
    where: { email: params.email },
  });
  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(params.password, 10);

  const user = await db.user.create({
    data: {
      name: params.name,
      email: params.email,
      passwordHash,
    },
  });

  const slug = (params.name || "workspace")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const workspace = await db.workspace.create({
    data: {
      name: `${params.name || "My"}'s Workspace`,
      slug: `${slug || "workspace"}-${Math.random().toString(36).slice(2, 7)}`,
      members: {
        create: { userId: user.id, role: "OWNER" },
      },
    },
  });

  await db.page.create({
    data: {
      title: "👋 Welcome to your Workspace",
      workspaceId: workspace.id,
      authorId: user.id,
      position: 0,
      content: {
        text: `# Welcome, ${params.name}!\n\nThis is your personal workspace.\n\n- Click "+ New page" to create new documents\n- Nest sub-pages inside each other\n- Everything auto-saves in real-time`,
      },
    },
  });

  return user;
}
