"use client";

import React from "react";

interface HeaderProps {
  workspaceName: string;
  userName?: string | null;
  userEmail?: string | null;
}

export function Header({ workspaceName, userName, userEmail }: HeaderProps) {
  // Helper to extract initials (e.g., "Ishan" -> "I", "Ada Lovelace" -> "AL", "user@email.com" -> "U")
  const getInitials = () => {
    if (userName && userName.trim()) {
      const parts = userName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (userEmail && userEmail.trim()) {
      return userEmail.trim()[0].toUpperCase();
    }
    return "?";
  };

  const initials = getInitials();
  const displayName = userName || userEmail || "User";

  return (
    <header className="sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b border-line bg-paper/90 px-6 backdrop-blur-md">
      {/* Left side: Workspace name */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper-dim border border-line-strong text-ink font-serif text-sm font-semibold shadow-panel select-none">
          {workspaceName.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-base font-semibold tracking-tight text-ink">
          {workspaceName}
        </h1>
      </div>

      {/* Right side: Round logo avatar with user initials */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="hidden text-xs font-medium text-ink-muted sm:inline-block">
            {displayName}
          </span>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-moss text-paper font-semibold text-sm shadow-sm ring-2 ring-moss-light/80 select-none transition hover:opacity-90"
            title={displayName}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
