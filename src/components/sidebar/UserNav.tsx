"use client";

import { signOut } from "next-auth/react";

export function UserNav({
  email,
  name,
}: {
  email?: string | null;
  name?: string | null;
}) {
  return (
    <div className="mt-auto border-t border-neutral-100 pt-3">
      <div className="flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <p className="truncate text-xs font-medium text-neutral-800">
            {name || "User"}
          </p>
          <p className="truncate text-xs text-neutral-400">{email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="shrink-0 rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-red-600 transition"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
