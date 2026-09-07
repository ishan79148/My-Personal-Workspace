"use client";

import { signOut } from "next-auth/react";

export function UserNav({
  email,
  name,
}: {
  email?: string | null;
  name?: string | null;
}) {
  const initial = (name || email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="border-t border-line pt-3">
      <div className="flex items-center justify-between gap-2 rounded-md p-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-moss-light text-xs font-semibold text-moss-dark">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-ink">
              {name || "User"}
            </p>
            <p className="truncate text-xs text-ink-faint">{email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="shrink-0 rounded px-2 py-1 text-xs text-ink-muted transition hover:bg-paper hover:text-rust"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
