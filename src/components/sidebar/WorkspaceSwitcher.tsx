"use client";

import type { WorkspaceSummary } from "@/types/workspace";

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceSummary[];
  activeWorkspaceId: string;
}

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
}: WorkspaceSwitcherProps) {
  return (
    <div className="relative">
      <select
        className="field w-full appearance-none pr-8 font-medium"
        defaultValue={activeWorkspaceId}
        onChange={(e) => {
          window.location.href = `/${e.target.value}`;
        }}
      >
        {workspaces.map((ws) => (
          <option key={ws.id} value={ws.id}>
            {ws.name}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
        aria-hidden="true"
      >
        <path
          d="M6 8l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
