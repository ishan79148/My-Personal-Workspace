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

  await db.user.create({
    data: {
      name: params.name,
      email: params.email,
      passwordHash,
    },
  });
}
